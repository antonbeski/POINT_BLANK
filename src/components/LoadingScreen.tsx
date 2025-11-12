"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingScreen({ fullScreen = true, message }: LoadingScreenProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Water ripple physics simulation
    const ripples: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      opacity: number;
      life: number;
    }> = [];

    let animationFrame: number;
    let lastRippleTime = 0;
    const rippleInterval = 4000; // 4 seconds between ripples (synchronized with dot pulse)

    const createRipple = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create multiple ripples at once for wave interference
      for (let i = 0; i < 3; i++) {
        ripples.push({
          x: centerX,
          y: centerY,
          radius: 0,
          maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
          speed: 0.8 + i * 0.1,
          opacity: 1,
          life: 1
        });
      }
    };

    const animate = (time: number) => {
      // Create ripples periodically
      if (time - lastRippleTime > rippleInterval) {
        createRipple();
        lastRippleTime = time;
      }

      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        
        ripple.radius += ripple.speed;
        ripple.life = 1 - (ripple.radius / ripple.maxRadius);
        ripple.opacity = ripple.life * 0.6;

        if (ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw outer glow
        const gradient = ctx.createRadialGradient(
          ripple.x, ripple.y, Math.max(0, ripple.radius - 20),
          ripple.x, ripple.y, Math.max(0, ripple.radius + 20)
        );
        gradient.addColorStop(0, `rgba(147, 197, 253, 0)`);
        gradient.addColorStop(0.5, `rgba(147, 197, 253, ${ripple.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(147, 197, 253, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius), 0, Math.PI * 2);
        ctx.stroke();

        // Draw main ripple ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius), 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner highlight for caustic effect
        ctx.strokeStyle = `rgba(191, 219, 254, ${ripple.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius - 2), 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer-water {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05) rotate(5deg);
          }
        }
      `}} />
      
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)'
        }}
      >
        {/* Water ripple canvas background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.7,
            filter: 'blur(0.5px)',
          }}
        />

        {/* Ambient water shimmer overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
            animation: 'shimmer-water 6s ease-in-out infinite'
          }}
        />

        {/* Glass water surface effect */}
        <div 
          className="absolute inset-0 pointer-events-none backdrop-blur-[0.5px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.01) 0%, rgba(147, 197, 253, 0.02) 50%, rgba(255, 255, 255, 0.01) 100%)',
            opacity: 0.4
          }}
        />

        <div className="relative flex flex-col items-center gap-8 z-10">
          {/* Logo with water depth effect */}
          <div className="relative flex items-center justify-center w-48 h-48">
            {/* Soft ambient glow behind logo */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                background: [
                  "radial-gradient(circle, rgba(147, 197, 253, 0.15) 0%, transparent 60%)",
                  "radial-gradient(circle, rgba(147, 197, 253, 0.25) 0%, transparent 60%)",
                  "radial-gradient(circle, rgba(147, 197, 253, 0.15) 0%, transparent 60%)",
                ],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Refraction rings (water surface interaction) */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`refract-${i}`}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(191, 219, 254, 0.1)',
                  filter: 'blur(1px)',
                }}
                animate={{
                  scale: [1 + i * 0.15, 1.4 + i * 0.15],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3,
                }}
              />
            ))}

            {/* Logo container with glass morphism */}
            <motion.div
              className="relative z-20 flex items-center justify-center rounded-3xl overflow-hidden"
              style={{
                width: '180px',
                height: '180px',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 2px rgba(255, 255, 255, 0.1),
                  0 0 80px rgba(147, 197, 253, 0.15)
                `,
              }}
              animate={{
                boxShadow: [
                  '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 80px rgba(147, 197, 253, 0.15)',
                  '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 100px rgba(147, 197, 253, 0.25)',
                  '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 80px rgba(147, 197, 253, 0.15)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Logo image */}
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo-1762955865936.png?width=8000&height=8000&resize=contain"
                alt="Loading"
                className="w-[85%] h-[85%] object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
                }}
              />

              {/* Pulsing dot overlay (synchronized with logo's dot) */}
              <motion.div
                className="absolute rounded-full bg-black"
                style={{
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                }}
                animate={{
                  width: ["32px", "72px", "32px"],
                  height: ["32px", "72px", "32px"],
                  opacity: [1, 0.95, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Specular highlight on logo */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Caustic light patterns */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(191, 219, 254, 0.1) 0%, transparent 40%),
                  radial-gradient(circle at 70% 60%, rgba(191, 219, 254, 0.08) 0%, transparent 40%)
                `,
                filter: 'blur(20px)',
              }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Loading Message */}
          {message && (
            <motion.p
              className="text-sm text-muted-foreground/80 font-medium tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
              transition={{ 
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                y: { delay: 0.3 }
              }}
            >
              {message}
            </motion.p>
          )}

          {/* Minimal loading indicator */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-${i}`}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'rgba(147, 197, 253, 0.6)',
                  boxShadow: '0 0 8px rgba(147, 197, 253, 0.4)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.25,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}