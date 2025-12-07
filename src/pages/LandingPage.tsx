import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif' }}>
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)' }}>
                  <img src="logo.png"  />
              </div>
              <span className="text-3xl font-bold" style={{ color: '#14b8a6', letterSpacing: '-0.5px' }}>farab</span>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 rounded-full text-sm font-semibold mb-8" style={{ background: 'rgba(20, 184, 166, 0.1)', border: '2px solid rgba(20, 184, 166, 0.3)', color: '#14b8a6' }}>
                ✨ AI-Powered Adaptive Learning
              </div>
              <h1 className="text-6xl lg:text-7xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-2px', lineHeight: '1.1' }}>
                Master Any Skill,
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Your Way
                </span>
              </h1>
              <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                Personalized AI learning paths that adapt to you. From Arabic to Python, create your journey with gamified progress.
              </p>
              {/* <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button className="px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: 'white', boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)' }}>
                  Start Learning Free
                </button>
                <button className="px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'rgba(0, 0, 0, 0.1)', border: '2px solid rgba(0, 0, 0, 0.1)', color: '#2d3748' }}>
                  Watch Demo
                </button>
              </div> */}
            </div>

            {/* Hero Phones */}
            <div className="relative max-w-6xl mx-auto" style={{ height: '600px' }}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(-50%, -50%) scale(1.1)', zIndex: 30 }}>
                <div className="w-72 rounded-[40px] p-2" style={{ background: 'rgba(240, 240, 240, 0.8)', backdropFilter: 'blur(10px)', border: '3px solid rgba(20, 184, 166, 0.3)', boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)' }}>
                  <img src="/screens/map.png" alt="Map" className="w-full rounded-[32px]" />
                </div>
              </div>
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(-50%, -50%) rotate(-12deg) scale(0.85)', zIndex: 20 }}>
                <div className="w-64 rounded-[36px] p-2 opacity-70" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(8px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
                  <img src="/screens/goal.png" alt="Goal" className="w-full rounded-[28px]" />
                </div>
              </div>
              <div className="absolute right-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(50%, -50%) rotate(12deg) scale(0.85)', zIndex: 20 }}>
                <div className="w-64 rounded-[36px] p-2 opacity-70" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(8px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
                  <img src="/screens/lesson.png" alt="Lesson" className="w-full rounded-[28px]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1 - Create Your Goal */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
                Create Your
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Learning Goal
                </span>
              </h2>
              <p className="text-xl mb-6" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                Choose any skill you want to master. From learning Arabic and Python to mastering guitar or cooking, our AI creates a personalized roadmap just for you.
              </p>
              <ul className="space-y-3">
                {['Custom learning paths for any subject', 'AI-generated curriculum', 'Flexible timeline and pace'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#14b8a6' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                    </div>
                    <span style={{ color: '#4a5568' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-80 rounded-[40px] p-3" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)', transform: 'rotate(-3deg)' }}>
                <img src="/screens/goal.png" alt="Create Goal" className="w-full rounded-[32px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2 - Interactive Map */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-80 rounded-[40px] p-3" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)', transform: 'rotate(3deg)' }}>
                <img src="/screens/map.png" alt="Learning Map" className="w-full rounded-[32px]" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
                Visual Learning
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Journey Map
                </span>
              </h2>
              <p className="text-xl mb-6" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                See your entire learning path ahead. Unlock lessons, complete challenges, and watch your progress unfold on an interactive, Duolingo-style map.
              </p>
              <ul className="space-y-3">
                {['Gamified progression system', 'Track streaks and earn XP', 'Visual milestone celebration'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#14b8a6' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                    </div>
                    <span style={{ color: '#4a5568' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 3 - Interactive Lessons */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
                Engaging
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Lessons
                </span>
              </h2>
              <p className="text-xl mb-6" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                Beautiful, easy-to-read lessons designed like your favorite blogs. Learn at your own pace with content that's clear, organized, and enjoyable.
              </p>
              <ul className="space-y-3">
                {['Clean, distraction-free reading', 'Rich media and examples', 'Bite-sized learning chunks'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#14b8a6' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                    </div>
                    <span style={{ color: '#4a5568' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-80 rounded-[40px] p-3" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)', transform: 'rotate(-3deg)' }}>
                <img src="/screens/lesson.png" alt="Lessons" className="w-full rounded-[32px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature 4 - Practice & Quizzes */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-80 rounded-[40px] p-3" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)', transform: 'rotate(3deg)' }}>
                <img src="/screens/quiz.png" alt="Quiz" className="w-full rounded-[32px]" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
                Practice &
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Master
                </span>
              </h2>
              <p className="text-xl mb-6" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                Test your knowledge with interactive quizzes. Get instant feedback, see detailed explanations, and watch your confidence grow.
              </p>
              <ul className="space-y-3">
                {['Multiple question types', 'Instant feedback & explanations', 'Adaptive difficulty'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#14b8a6' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                    </div>
                    <span style={{ color: '#4a5568' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 5 - Track Progress */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
                Track Your
                <br />
                <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Progress
                </span>
              </h2>
              <p className="text-xl mb-6" style={{ color: '#4a5568', lineHeight: '1.7' }}>
                Monitor your learning journey with detailed stats, streaks, and insights. See how far you've come and stay motivated every day.
              </p>
              <ul className="space-y-3">
                {['Daily streak tracking', 'XP and achievements', 'Weekly progress charts'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#14b8a6' }}>
                      <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                    </div>
                    <span style={{ color: '#4a5568' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-80 rounded-[40px] p-3" style={{ background: 'rgba(245, 245, 245, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)', transform: 'rotate(-3deg)' }}>
                <img src="/screens/profile.png" alt="Profile" className="w-full rounded-[32px]" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-32">
          <div className="max-w-4xl mx-auto text-center rounded-3xl p-16" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(52, 211, 153, 0.15) 100%)', border: '2px solid rgba(20, 184, 166, 0.3)' }}>
            <h2 className="text-5xl font-black mb-6" style={{ color: '#2d3748', fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '-1px' }}>
              Start Your Learning
              <br />
              <span style={{ background: 'linear-gradient(to right, #14b8a6, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Journey Today
              </span>
            </h2>
            <p className="text-xl mb-10" style={{ color: '#4a5568', lineHeight: '1.7' }}>
              Join thousands of learners mastering new skills with AI-powered personalization
            </p>
            <button className="px-12 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: 'white', boxShadow: '0 12px 32px rgba(20, 184, 166, 0.3)' }}>
              Get Started Free →
            </button>
            <p className="text-sm mt-6" style={{ color: '#718096' }}>
              No credit card required • Free forever
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
                🌱
              </div>
              <span className="text-2xl font-bold" style={{ color: '#14b8a6' }}>Farab</span>
            </div>
            <p className="text-sm" style={{ color: '#718096' }}>© 2024 Farab. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;