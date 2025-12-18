import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], raf;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '0,212,255' : '123,97,255';
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.pulse += 0.015;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        const op = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${op})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} id="particle-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}/>;
}
