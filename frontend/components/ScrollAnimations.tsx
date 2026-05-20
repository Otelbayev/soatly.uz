'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade-up
      gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Stagger children
      gsap.utils.toArray<HTMLElement>('[data-gsap="stagger"]').forEach((container) => {
        const children = Array.from(container.children) as HTMLElement[];
        gsap.fromTo(children,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.1,
            scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none none' },
          }
        );
      });

      // Scale-in
      gsap.utils.toArray<HTMLElement>('[data-gsap="scale"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Slide from left
      gsap.utils.toArray<HTMLElement>('[data-gsap="slide-left"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: -50 },
          {
            opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Slide from right
      gsap.utils.toArray<HTMLElement>('[data-gsap="slide-right"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: 50 },
          {
            opacity: 1, x: 0, duration: 0.75, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Horizontal line reveal (scaleX from 0 → 1)
      gsap.utils.toArray<HTMLElement>('[data-gsap="line-grow"]').forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1, duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Parallax — slow vertical drift on scroll
      gsap.utils.toArray<HTMLElement>('[data-gsap="parallax"]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed ?? '0.15');
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
