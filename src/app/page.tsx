// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import HeroAnimation from '@/components/common/HeroAnimation';
import { ArrowRight, Zap, MapPin, TrendingUp, Users, Shield } from 'lucide-react';

// Landing page with Three.js hero animation and feature showcase
// Modern, beautiful design optimized for mobile and desktop
// Sells the vision of RightRoute to potential customers and drivers

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            RightRoute
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-blue-400">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Three.js Animation */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 animate-fadeInUp">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                Transport &{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Delivery
                </span>{' '}
                Made Simple
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Connect with reliable drivers for fast, affordable delivery across Mubende District and Uganda. 
                Whether you're a customer or a driver, RightRoute makes logistics effortless.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 group">
                  Start Delivering
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-slate-600 text-white hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">500+</div>
                <p className="text-sm text-slate-400">Daily Orders</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-cyan-400">1000+</div>
                <p className="text-sm text-slate-400">Active Drivers</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-emerald-400">4.8★</div>
                <p className="text-sm text-slate-400">Avg Rating</p>
              </div>
            </div>
          </div>

          {/* Right: Three.js Animation */}
          <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose RightRoute?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/40 transition-colors">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-slate-300">Get matched with a driver in minutes. Real-time updates keep you informed every step of the way.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-600/40 transition-colors">
                <MapPin className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-slate-300">Know exactly where your delivery is with live GPS tracking and ETA updates.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600/40 transition-colors">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
              <p className="text-slate-300">No hidden fees. See your estimated fare before confirming your order.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/40 transition-colors">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-slate-300">All drivers are verified. Your data is encrypted and protected.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-600/40 transition-colors">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-slate-300">Built for Uganda. Supports local businesses and empowers drivers.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
              <div className="h-12 w-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600/40 transition-colors">
                <ArrowRight className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Always Available</h3>
              <p className="text-slate-300">Order 24/7. Our platform works on 3G networks too.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl border border-blue-600/30 p-12">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300">Join thousands of satisfied customers and drivers using RightRoute.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Register Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-slate-600 text-white hover:bg-slate-800">
                Already Have an Account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-400">
        <p>&copy; 2026 RightRoute. All rights reserved. Built with ❤️ for Mubende District, Uganda.</p>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
