import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

// Registrar plugins globalmente
gsap.registerPlugin(ScrollTrigger, Draggable);

// Configuración global opcional
gsap.defaults({
  duration: 0.6,
  ease: "power2.out"
});

export default gsap;
