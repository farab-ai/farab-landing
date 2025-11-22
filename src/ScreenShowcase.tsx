// src/components/ScreensShowcase.tsx
import React from "react";

interface Screen {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

const screens: Screen[] = [
  {
    src: "/screens/goal.png",
    alt: "Goal Setup Screen",
    title: "Set Your Goal",
    description: "Enter your learning goal, start date, and target completion date.",
  },
  {
    src: "/screens/map.png",
    alt: "Learning Map Screen",
    title: "Interactive Map",
    description: "Visual roadmap with levels, nodes, and progress rings.",
  },
  {
    src: "/screens/lesson.png",
    alt: "Lesson Screen",
    title: "Lessons",
    description: "Medium-style lessons with illustrations, practice tasks, and micro-tests.",
  },
  {
    src: "/screens/quiz.png",
    alt: "Quiz Screen",
    title: "Quizzes",
    description: "Assess your knowledge with interactive quizzes and challenges.",
  },
  {
    src: "/screens/profile.png",
    alt: "Progress Dashboard",
    title: "Progress Dashboard",
    description: "Track mastery, completed nodes, and upcoming tasks.",
  },
];

export default function ScreensShowcase() {
  return (
    <section className="px-8 py-16 bg-[#0A0F0D] relative">
      <h2 className="text-4xl font-extrabold text-[#10B981] text-center mb-24">
        Explore the App
      </h2>
      <div className="flex flex-col">
        {screens.map((screen, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={screen.alt}
              className={`flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto relative`}
              style={{
                marginTop: index === 0 ? 0 : "-15rem", // overlap effect
                zIndex: screens.length - index, // stacking
              }}
            >
              {/* Conditional layout for alternating sides */}
              {isEven ? (
                <>
                  {/* Image Left */}
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-full max-w-[350px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#111C17] to-[#243830]">
                      <img
                        src={screen.src}
                        alt={screen.alt}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                  {/* Text Right */}
                  <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left">
                    {screen.title && (
                      <h3 className="text-3xl font-bold text-[#E8F5F0] mb-4">
                        {screen.title}
                      </h3>
                    )}
                    {screen.description && (
                      <p className="text-[#B8D9CA] text-lg leading-relaxed">
                        {screen.description}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Text Left */}
                  <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left order-2 md:order-1">
                    {screen.title && (
                      <h3 className="text-3xl font-bold text-[#E8F5F0] mb-4">
                        {screen.title}
                      </h3>
                    )}
                    {screen.description && (
                      <p className="text-[#B8D9CA] text-lg leading-relaxed">
                        {screen.description}
                      </p>
                    )}
                  </div>
                  {/* Image Right */}
                  <div className="md:w-1/2 flex justify-center order-1 md:order-2">
                    <div className="w-full max-w-[350px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#111C17] to-[#243830]">
                      <img
                        src={screen.src}
                        alt={screen.alt}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
