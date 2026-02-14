// Main.js - Cinematic Portfolio Logic

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initThreeJS();
    initAnimations();
});

/* =========================================
   1. LOADER LOGIC
   ========================================= */
function initLoader() {
    const loader = document.getElementById('loader');
    const title = document.getElementById('loader-title'); // Might be null on subpages
    const bar = document.getElementById('loader-bar'); // Might be null on subpages

    // Check if we are on the home page with the full loader
    const isFullLoader = title && bar;

    if (isFullLoader) {
        // Full Intro Sequence (Home)
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);

                // Animate Out
                gsap.to(title, { opacity: 0, y: -20, duration: 0.5 });
                gsap.to(loader, {
                    opacity: 0,
                    duration: 1,
                    delay: 0.3,
                    ease: "power2.inOut",
                    onComplete: () => loader.style.display = 'none'
                });

                // Trigger Home Hero Animations
                if (document.querySelector('.hero-title')) {
                    gsap.from(".hero-title", { y: 50, opacity: 0, duration: 1.5, delay: 0.8, ease: "power3.out" });
                    gsap.from(".hero-desc", { y: 30, opacity: 0, duration: 1.5, delay: 1.0, ease: "power3.out" });
                }

            } else {
                width += Math.random() * 5;
                if (width > 100) width = 100;
                bar.style.width = width + '%';
            }
        }, 30); // Faster loading

        gsap.to(title, { opacity: 1, y: 0, duration: 0.8 });

    } else {
        // Simple Spinner Logic (Subpages)
        // Just fade out after a brief delay to ensure 3D canvas is ready
        setTimeout(() => {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => loader.style.display = 'none'
            });

            // Allow content to fade in if it has the animate class
            gsap.to(".animate-fade-in-up", { opacity: 1, y: 0, duration: 1, delay: 0.2 });

        }, 800);
    }
}

/* =========================================
   2. THREE.JS BACKGROUND SCENE
   ========================================= */
let scene, camera, renderer, particles;
let mouseX = 0;
let mouseY = 0;

function initThreeJS() {
    const canvas = document.getElementById('webgl');
    if (!canvas) return; // Safety check

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Decide Camera Z based on page
    const path = window.location.pathname;
    let initialZ = 10;

    // Subtle variation per page
    if (path.includes('about')) initialZ = 8;
    if (path.includes('works') || path.includes('projects')) initialZ = 12;
    if (path.includes('contact')) initialZ = 6;

    camera.position.z = initialZ;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- PARTICLES ---
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        // Spiral galaxy shape
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 10;
        const z = Math.sin(angle) * radius;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color gradient 
        const mixedColor = new THREE.Color();
        // Shift colors slightly based on page
        let hue = Math.random();
        if (path.includes('about')) hue = 0.6 + Math.random() * 0.2; // Blue/Purple
        if (path.includes('contact')) hue = 0.0 + Math.random() * 0.1; // Red/Gold hint

        mixedColor.setHSL(hue, 1.0, 0.5 + Math.random() * 0.2);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- EVENT LISTENERS ---
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onDocumentMouseMove);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
}

function animate() {
    requestAnimationFrame(animate);

    // Gentle Rotation
    if (particles) {
        particles.rotation.y += 0.001;
        particles.rotation.z += 0.0005;
    }

    // Mouse Interaction
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

/* =========================================
   3. GSAP SCROLL ANIMATIONS
   ========================================= */
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.fa-bars');
    const navLinks = document.querySelector('.nav-links'); // Note: index.html has div.font-inter, might need update if using mobile menu class
    // Currently the mobile menu just has a button but no drawer implementation in the HTML.
    // For now, let's just make the button hoverable.

    // Page Entry Animations (General)
    // For elements with class 'glass-panel', stagger them in
    if (document.querySelectorAll('.glass-panel').length > 0) {
        gsap.from('.glass-panel', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.5 // Wait for loader
        });
    }

    // Nav-bar glass effect
    ScrollTrigger.create({
        start: 'top -50',
        toggleClass: { className: 'glass-panel', targets: 'nav' }
    });
}
