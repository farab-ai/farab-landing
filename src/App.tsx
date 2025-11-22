// src/App.tsx
import React from "react";
import "./index.css";
import ScreensShowcase from "./ScreenShowcase";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#E8F5F0] font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6">
        <h1 className="text-2xl font-bold text-[#10B981]">Farab AI</h1>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-16 md:py-32 space-y-8 md:space-y-0 md:space-x-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Learn Anything, Smarter & Faster
          </h2>
          <p className="text-[#B8D9CA] text-lg md:text-xl">
            AI-powered adaptive learning platform. Master skills with a
            Duolingo-inspired roadmap: lessons, practice, and tests tailored
            to you.
          </p>
          <div className="space-x-4">
            <button className="px-6 py-3 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#0A0F0D] font-semibold transition shadow-md">
              Start Learning
            </button>
            <button className="px-6 py-3 rounded-full bg-[#22C55E]/30 hover:bg-[#22C55E]/50 text-[#E8F5F0] font-semibold transition shadow-md">
              Learn More
            </button>
          </div>
        </div>
      </header>

      <ScreensShowcase/>

      {/* Features Section */}
      <section className="px-8 py-16 bg-[#111C17] space-y-12">
        <h3 className="text-3xl font-bold text-center text-[#10B981]">
          Features
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Adaptive Roadmap",
              desc: "Personalized learning path with AI-generated lessons and tests.",
              color: "#34D399",
            },
            {
              title: "Interactive Map",
              desc: "Duolingo-style visual learning map with nodes and progress rings.",
              color: "#22C55E",
            },
            {
              title: "Progress Tracking",
              desc: "Track mastery, completion, and AI recommendations for improvement.",
              color: "#FBBF24",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-[#243830] hover:bg-[#1A2922] transition shadow-lg"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.color }}
              >
                <span className="font-bold text-[#0A0F0D] text-lg">✓</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-[#B8D9CA]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16 text-center bg-gradient-to-r from-[#34D399] to-[#10B981] rounded-t-3xl">
        <h3 className="text-3xl md:text-4xl font-bold text-[#0A0F0D] mb-4">
          Ready to Start Your Learning Journey?
        </h3>
        <button className="px-8 py-4 rounded-full bg-[#0A0F0D] text-[#10B981] font-semibold shadow-lg hover:scale-105 transform transition">
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-[#5F8A73] text-center bg-[#111C17]">
        © 2025 Farab AI. All rights reserved.
      </footer>
    </div>
  );
}
