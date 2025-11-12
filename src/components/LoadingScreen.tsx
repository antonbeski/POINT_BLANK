"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingScreen({ fullScreen = true, message }: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "fixed inset-0 z-50 bg-background" : "w-full py-12"
      }`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Water Ripples - Multiple layers */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute inset-0 rounded-full border-2 border-blue-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 2.5, 3.5],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.8,
              }}
            />
          ))}

          {/* Secondary Ripples - Faster, subtler */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ripple-fast-${i}`}
              className="absolute inset-0 rounded-full border border-blue-300/10"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 2, 3],
                opacity: [0.4, 0.2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 1,
              }}
            />
          ))}

          {/* Outer Circle - Static with subtle glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-28 h-28 rounded-full border-[2px] border-foreground/90 bg-background/50 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              animate={{
                boxShadow: [
                  "0_0_20px_rgba(255,255,255,0.1)",
                  "0_0_30px_rgba(255,255,255,0.15)",
                  "0_0_20px_rgba(255,255,255,0.1)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Center Dot - Breathing Animation */}
          <motion.div
            className="relative z-10 rounded-full bg-foreground"
            animate={{
              width: ["32px", "80px", "32px"],
              height: ["32px", "80px", "32px"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            }}
          />

          {/* Ambient Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading Message */}
        {message && (
          <motion.p
            className="text-sm text-muted-foreground font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}

        {/* Loading Dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`dot-${i}`}
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
