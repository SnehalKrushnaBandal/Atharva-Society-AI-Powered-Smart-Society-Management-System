"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Hover Icons (default exports)
import UsersGroupIcon from "@/components/ui/users-group-icon";
import ShieldCheck from "@/components/ui/shield-check";
import CreditCard from "@/components/ui/credit-card";
import GithubIcon from "@/components/ui/github-icon";
import RocketIcon from "@/components/ui/rocket-icon";
import SparklesIcon from "@/components/ui/sparkles-icon";
import PlayerIcon from "@/components/ui/player-icon";
import FilledBellIcon from "@/components/ui/filled-bell-icon";
import GlobeIcon from "@/components/ui/globe-icon";
import CheckedIcon from "@/components/ui/checked-icon";
import ChartBarIcon from "@/components/ui/chart-bar-icon";
import GearIcon from "@/components/ui/gear-icon";
import LayersIcon from "@/components/ui/layers-icon";
import LockIcon from "@/components/ui/lock-icon";

// Lucide Icons for additional UI elements
import { 
  Building2, 
  ArrowRight, 
  Play, 
  Star,
  Zap,
  Database,
  Mail,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  ChevronDown
} from "lucide-react";

// Video Demo Data
const videoDemos = [
  {
    title: "Manager Dashboard",
    description: "Complete admin control with user management, payment tracking, complaint handling, and asset management.",
    videoUrl: "https://ik.imagekit.io/xh3awoalr/Portfolio/Manager_Screen_Recording.mp4",
    role: "Manager",
    color: "bg-purple-500",
    features: ["User Management", "Payment Overview", "Complaint Resolution", "Asset Tracking"]
  },
  {
    title: "Resident Portal",
    description: "User-friendly interface for residents to pay maintenance, file complaints, and trigger emergency alerts.",
    videoUrl: "https://ik.imagekit.io/xh3awoalr/Portfolio/Resident_Screen_Recording.mp4",
    role: "Resident",
    color: "bg-teal-500",
    features: ["Pay Maintenance", "File Complaints", "View History", "Emergency Button"]
  },
  {
    title: "Watchman Portal",
    description: "Mobile-first simplified portal for watchmen to manage gate logs and respond to emergencies.",
    videoUrl: "https://ik.imagekit.io/xh3awoalr/Portfolio/Watchman_Screen_Recording.mp4",
    role: "Watchman",
    color: "bg-orange-500",
    features: ["Gate Log Entry", "Visitor Tracking", "Emergency Alerts", "Mobile Optimized"]
  }
];

// Tech Stack Data
const techStack = [
  { name: "Next.js 14", icon: <GlobeIcon className="h-6 w-6" />, category: "Frontend" },
  { name: "Tailwind CSS", icon: <SparklesIcon className="h-6 w-6" />, category: "Styling" },
  { name: "shadcn/ui", icon: <LayersIcon className="h-6 w-6" />, category: "Components" },
  { name: "Express.js", icon: <GearIcon className="h-6 w-6" />, category: "Backend" },
  { name: "MongoDB", icon: <Database className="h-6 w-6 text-gray-600" />, category: "Database" },
  { name: "Razorpay", icon: <CreditCard className="h-6 w-6" />, category: "Payments" },
  { name: "Brevo", icon: <Mail className="h-6 w-6 text-gray-600" />, category: "Email" },
  { name: "ImageKit", icon: <ImageIcon className="h-6 w-6 text-gray-600" />, category: "CDN" },
];

// Features Data
const features = [
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Razorpay Payments",
    description: "Integrated payment gateway with UPI & Card support. Auto-generates monthly invoices with ₹100 late fee after 18 days."
  },
  {
    icon: <FilledBellIcon className="h-8 w-8" />,
    title: "Lift Emergency Alerts",
    description: "One-click emergency button sends instant email alerts to all residents and watchmen when someone is stuck."
  },
  {
    icon: <UsersGroupIcon className="h-8 w-8" />,
    title: "Role-Based Access",
    description: "4 distinct roles: Manager, Admin, Resident, and Watchman. Each with tailored dashboard and permissions."
  },
  {
    icon: <ChartBarIcon className="h-8 w-8" />,
    title: "Asset Tracking",
    description: "Monitor lift, water pumps, and generators. Log service history with technician details and dates."
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Secure Authentication",
    description: "JWT-based auth with httpOnly cookies. OTP-based password reset via Brevo email integration."
  },
  {
    icon: <LockIcon className="h-8 w-8" />,
    title: "Gate Log System",
    description: "Watchman portal for visitor management. Track in/out times, vehicle numbers, and visiting purpose."
  }
];

// Video Player Component
function VideoPlayer({ video, isPlaying, onPlay }: { video: typeof videoDemos[0], isPlaying: boolean, onPlay: () => void }) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-teal-200">
      <div className="relative aspect-video bg-gray-900">
        {isPlaying ? (
          <video 
            src={video.videoUrl} 
            controls 
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900"
            onClick={onPlay}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`${video.color} p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform`}>
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
              <span className="text-white font-medium">Watch Demo</span>
            </div>
            <Badge className={`absolute top-4 right-4 ${video.color} text-white border-0`}>
              {video.role}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <PlayerIcon className="h-5 w-5" />
          {video.title}
        </CardTitle>
        <CardDescription>{video.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {video.features.map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShowcasePage() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                <Building2 className="h-12 w-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-white">Rajarshi Darshan</h1>
                <p className="text-teal-200 text-lg">Society Management System</p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xl lg:text-2xl text-teal-100 max-w-3xl mx-auto mb-8">
              A complete full-stack solution for housing society management with 
              <span className="text-white font-semibold"> Razorpay payments</span>, 
              <span className="text-white font-semibold"> emergency alerts</span>, and 
              <span className="text-white font-semibold"> multi-role dashboards</span>.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl font-bold text-white">40+</span>
                <span className="text-teal-200 ml-2">Flats</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl font-bold text-white">4</span>
                <span className="text-teal-200 ml-2">User Roles</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl font-bold text-white">₹1000</span>
                <span className="text-teal-200 ml-2">/month</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 gap-2" asChild>
                <Link href="/login">
                  <RocketIcon className="h-5 w-5" />
                  Try Live Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" asChild>
                <a href="https://github.com/aayushvaghela" target="_blank" rel="noopener noreferrer">
                  <GithubIcon className="h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 animate-bounce">
              <ChevronDown className="h-8 w-8 text-white/50 mx-auto" />
            </div>
          </div>
        </div>
      </header>

      {/* Video Demos Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100">
            <PlayerIcon className="h-4 w-4 mr-1" />
            Video Demos
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See It In Action
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch complete walkthroughs of each user role&apos;s dashboard and features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoDemos.map((video, index) => (
            <VideoPlayer 
              key={index} 
              video={video} 
              isPlaying={playingVideo === index}
              onPlay={() => setPlayingVideo(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
              <SparklesIcon className="h-4 w-4 mr-1" />
              Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed for modern housing society management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-teal-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="bg-teal-50 w-14 h-14 rounded-xl flex items-center justify-center text-teal-600 mb-4 group-hover:bg-teal-100 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
              <LayersIcon className="h-4 w-4 mr-1" />
              Tech Stack
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built With Modern Technologies
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Production-ready stack with best practices and scalable architecture.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-md transition-all hover:border-teal-200 group">
                <div className="flex justify-center mb-3 text-gray-500 group-hover:text-teal-600 transition-colors">
                  {tech.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-500">{tech.category}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border-teal-500/30">
              <GearIcon className="h-4 w-4 mr-1" />
              Architecture
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Production-Ready Design
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clean, maintainable code with industry-standard patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Monitor className="h-10 w-10 text-teal-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Responsive Design</h3>
              <p className="text-gray-400 text-sm">Mobile-first approach with Tailwind CSS breakpoints.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="h-10 w-10 text-yellow-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Cron Jobs</h3>
              <p className="text-gray-400 text-sm">Automated invoice generation and late fee application.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <ShieldCheck className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure APIs</h3>
              <p className="text-gray-400 text-sm">JWT auth with httpOnly cookies and role-based access.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Smartphone className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Watchman Portal</h3>
              <p className="text-gray-400 text-sm">Simplified mobile-first interface for gate security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              <UsersGroupIcon className="h-4 w-4 mr-1" />
              User Roles
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Multi-Role Access Control
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: "Manager", color: "purple", desc: "Super admin with full control", features: ["Assign roles", "View all data", "Manage assets"] },
              { role: "Admin", color: "blue", desc: "Manage complaints & emergencies", features: ["Resolve complaints", "Handle emergencies", "View payments"] },
              { role: "Resident", color: "teal", desc: "Pay dues & file complaints", features: ["Pay maintenance", "File complaints", "Trigger emergency"] },
              { role: "Watchman", color: "orange", desc: "Gate log & emergency alerts", features: ["Log visitors", "Mark exits", "Emergency button"] }
            ].map((item, index) => (
              <Card key={index} className={`border-t-4 border-t-${item.color}-500 hover:shadow-lg transition-all`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UsersGroupIcon className="h-5 w-5" />
                    {item.role}
                  </CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckedIcon className="h-4 w-4 text-green-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RocketIcon className="h-16 w-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            Check out the live demo or browse the source code on GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 gap-2" asChild>
              <Link href="/login">
                Try Demo <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2" asChild>
              <a href="https://github.com/aayushvaghela" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-5 w-5" />
                GitHub Repository
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-teal-500" />
              <div>
                <p className="text-white font-semibold">Rajarshi Darshan</p>
                <p className="text-sm">Society Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="https://github.com/aayushvaghela" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <GithubIcon className="h-6 w-6" />
              </a>
              <Separator orientation="vertical" className="h-6 bg-gray-700" />
              <p className="text-sm">
                Built by <span className="text-teal-400">Aayush Vaghela</span>
              </p>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 Society Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Made with Next.js 14
              </span>
              <span className="flex items-center gap-1">
                <CheckedIcon className="h-4 w-4 text-green-500" />
                Production Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
