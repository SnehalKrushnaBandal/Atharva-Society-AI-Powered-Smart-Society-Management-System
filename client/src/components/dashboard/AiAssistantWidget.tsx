'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  AlertCircle,
  User,
  X,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiAssistantWidgetProps {
  userRole?: string;
  userName?: string;
}

/**
 * Extracts raw text recursively from a hast node
 */
function extractText(node: any): string {
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

/**
 * Custom rehype plugin to make tables responsive.
 * It injects a `data-label` attribute into every `td` based on its corresponding `th`.
 * It also attaches an `ai-table-stacked` class to tables with 5 or fewer columns.
 */
function rehypeResponsiveTables() {
  return (tree: any) => {
    function traverse(node: any) {
      if (node.type === 'element' && node.tagName === 'table') {
        const thead = node.children?.find((c: any) => c.tagName === 'thead');
        const tbody = node.children?.find((c: any) => c.tagName === 'tbody');
        if (thead && tbody) {
          const headRow = thead.children?.find((c: any) => c.tagName === 'tr');
          if (headRow) {
            const headers = headRow.children
              ?.filter((c: any) => c.tagName === 'th')
              .map((th: any) => extractText(th).trim());

            if (headers && headers.length > 0) {
              if (headers.length <= 5) {
                node.properties = node.properties || {};
                node.properties.className = node.properties.className
                  ? [...(Array.isArray(node.properties.className) ? node.properties.className : [node.properties.className]), 'ai-table-stacked']
                  : ['ai-table-stacked'];
              }

              tbody.children?.forEach((tr: any) => {
                if (tr.tagName === 'tr') {
                  let col = 0;
                  tr.children?.forEach((td: any) => {
                    if (td.tagName === 'td') {
                      td.properties = td.properties || {};
                      td.properties['data-label'] = headers[col] || '';
                      col++;
                    }
                  });
                }
              });
            }
          }
        }
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(tree);
  };
}

/**
 * Normalises spacing around Markdown bold/italic markers that the model
 * sometimes emits without surrounding spaces (e.g. `word**Bold**word`).
 *
 * CommonMark requires a space (or punctuation) boundary for ** / * to be
 * treated as emphasis delimiters. Without them, ReactMarkdown passes the
 * asterisks through as literal characters.
 *
 * This function cleanly isolates bold and italic blocks, inserting a space
 * before and after them if they touch adjacent words.
 *
 * Safe: pure string transformation — no HTML, no eval, no DOM mutation.
 */
function normaliseMarkdown(raw: string): string {
  let s = raw;

  // 1. Strip hallucinated prefixes in bold status words: **svgPaid** → **Paid**
  s = s.replace(/\*\*(svg|icon|badge)(Paid|Pending|Unpaid|Overdue)\*\*/gi, '**$2**');

  // 2. Bold: **content** where content starts & ends with non-space and contains no *
  // Non-capturing group prevents capture-group offset collisions in replacement
  const BOLD = '\\*\\*(?:(?!\\s)[^*]+(?<!\\s))\\*\\*';

  // Insert space BEFORE bold block if a non-space, non-* char touches it
  s = s.replace(new RegExp('([^\\s*])(' + BOLD + ')', 'g'), '$1 $2');
  // Insert space AFTER bold block if it touches a word-like character.
  // Exclude punctuation that naturally abuts bold in Markdown (: , . ; ! ? ) ] } >)
  s = s.replace(new RegExp('(' + BOLD + ')([^\\s*:,.;!?\\)\\]}>])', 'g'), '$1 $2');

  // 3. Italic: *content* (single *, exclude bold **)
  const ITALIC = '(?<!\\*)\\*(?!\\*)(?:(?!\\s)[^*]+(?<!\\s))\\*(?!\\*)';
  s = s.replace(new RegExp('([^\\s*])(' + ITALIC + ')', 'g'), '$1 $2');
  s = s.replace(new RegExp('(' + ITALIC + ')([^\\s*:,.;!?\\)\\]}>])', 'g'), '$1 $2');

  return s;
}

/**
 * ReactMarkdown component overrides — styled to match Atharva Society palette.
 * Tables are wrapped in a horizontally-scrollable div to prevent page overflow.
 * No dangerouslySetInnerHTML is used anywhere.
 */
const markdownComponents: Components = {
  // Wrap tables in a scrollable container
  table: ({ children, className }) => (
    <div className={`ai-table-wrapper ${className?.includes('ai-table-stacked') ? 'ai-table-stacked-wrapper' : ''}`}>
      <table className={className}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children, ...props }) => <td data-label={(props as any)['data-label']}>{children}</td>,

  // Headings
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,

  // Lists
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,

  // Inline elements — rendered as inline so they flow naturally in sentences
  strong: ({ children }) => {
    // Recursively extract plain text from React children
    const extractChildText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractChildText).join('');
      if (node && typeof node === 'object' && node.props?.children) {
        return extractChildText(node.props.children);
      }
      return '';
    };

    const rawText = extractChildText(children).trim();

    // Strip common AI hallucination prefixes (e.g., svgPaid, iconPending)
    const cleanedText = rawText.replace(/^(svg|icon|badge)/i, '').trim();
    const lowerText = cleanedText.toLowerCase();

    if (lowerText === 'paid' || lowerText === 'pending' || lowerText === 'unpaid' || lowerText === 'overdue') {
      const isPaid = lowerText === 'paid';
      const isPending = lowerText === 'pending';
      const isOverdue = lowerText === 'overdue';
      // Display the clean text, not the raw hallucinated prefix
      const displayText = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1).toLowerCase();
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
            isPaid
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : isPending
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={`Status: ${displayText}`}
        >
          {isPaid && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {(isPending || isOverdue) && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {lowerText === 'unpaid' && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{displayText}</span>
        </span>
      );
    }
    return <strong style={{ display: 'inline' }}>{children}</strong>;
  },
  em: ({ children }) => <em style={{ display: 'inline' }}>{children}</em>,
  code: ({ children }) => <code>{children}</code>,
  p: ({ children }) => <p>{children}</p>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,

  // Links — open in new tab, no opener
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

/** Renders assistant Markdown safely using react-markdown + remark-gfm. */
function AssistantMessage({ content }: { content: string }) {
  const normalised = normaliseMarkdown(content);
  return (
    <div className="ai-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeResponsiveTables]} components={markdownComponents}>
        {normalised}
      </ReactMarkdown>
    </div>
  );
}

export function AiAssistantWidget({ userRole: propUserRole, userName: propUserName }: AiAssistantWidgetProps) {
  const { user } = useAuth();
  const role = propUserRole || user?.role || 'resident';
  const name = propUserName || user?.name || 'Resident';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isManager = ['manager', 'admin'].includes(role);

  const rolePills = isManager
    ? [
        'Summarize maintenance collection status',
        'What is the status of open complaints?',
        'Show active society notices & events',
        'Are there any active lift emergency alerts?',
      ]
    : [
        'What are my current maintenance dues?',
        'Are there any active notices or events?',
        'Show society emergency contacts',
        'What is the status of my complaints?',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setErrorMessage(null);

    // Prepare history payload (last 6 messages)
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await api.post('/ai/chat', {
        message: query,
        history: historyPayload,
      });

      if (response.data?.success && response.data?.data?.reply) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setErrorMessage(response.data?.message || 'Failed to get response from AI assistant.');
      }
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const apiMsg = err.response?.data?.message || 'Unable to connect to Atharva AI service.';
      setErrorMessage(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2">
        {!isOpen && (
          <span className="hidden md:inline-flex px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700/80 animate-in fade-in slide-in-from-right-2 pointer-events-none">
            Atharva AI Assistant
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Atharva AI Assistant' : 'Open Atharva AI Assistant'}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-teal-400/30 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500/40 relative group cursor-pointer ${
            isOpen ? 'ring-2 ring-teal-400' : ''
          }`}
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 text-white" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-teal-200 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-22 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] h-[540px] max-h-[calc(100vh-7.5rem)] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4"
          role="dialog"
          aria-label="Atharva AI Assistant Chat Window"
        >
          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div className="py-3 px-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white truncate">
                    Atharva AI Assistant
                  </h3>
                  <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 text-[9px] px-1.5 py-0 shrink-0">
                    Groq Llama-3
                  </Badge>
                </div>
                <p className="text-[11px] text-teal-100/80 font-medium">Read-only smart support</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  className="h-7 w-7 text-teal-100 hover:text-white hover:bg-teal-800/60 rounded-lg"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-teal-100 hover:text-white hover:bg-teal-800/60 rounded-lg"
                aria-label="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* ── Messages ──────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 overflow-x-hidden">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">AI Service Notice</span>
                  <p className="text-red-700 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {messages.length === 0 ? (
              /* ── Welcome / Suggestions screen ──────────────────────────────── */
              <div className="py-4 px-3 text-center bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mx-auto">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                    How can I help you, {name.split(' ')[0]}?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ask about maintenance dues, notices, events, services, or complaints.
                  </p>
                </div>

                {/* Suggestion pills — vertical list for readability */}
                <div className="pt-1 flex flex-col gap-1.5 text-left">
                  {rolePills.map((pill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(pill)}
                      disabled={loading}
                      className="text-xs px-3 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 font-medium transition-all text-left flex items-start gap-2 disabled:opacity-50 group whitespace-normal break-words"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span>{pill}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Message thread ─────────────────────────────────────────────── */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed overflow-x-hidden ${
                      msg.role === 'user'
                        ? 'bg-teal-700 text-white rounded-tr-xs shadow-xs text-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap text-xs">{msg.content}</div>
                    ) : (
                      <AssistantMessage content={msg.content} />
                    )}
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-3 shadow-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Atharva AI is thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick suggestion chips (visible after first message) ──────────── */}
          {messages.length > 0 && (
            <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">Ask:</span>
              {rolePills.slice(0, 3).map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill)}
                  disabled={loading}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 transition-all shrink-0 disabled:opacity-50 whitespace-nowrap"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* ── Input footer ─────────────────────────────────────────────────── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Atharva AI…"
              disabled={loading}
              className="flex-1 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-xl focus:border-teal-600 focus:ring-teal-600 h-9"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl h-9 px-3 shrink-0 text-xs font-semibold flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
