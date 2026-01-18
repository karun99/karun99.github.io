document.addEventListener('DOMContentLoaded', () => {

    // 1. Highlight Active Nav Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active-nav');
        }
    });

    // Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = menuBtn.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- LOADER LOGIC ---
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderText = document.getElementById('loader-text');

    if (loader) {
        // Init 3D Background
        if (typeof THREE !== 'undefined') {
            initLoader3D(loader);
        }

        let progress = 0;
        const messages = ['LOADING CORE MODULES...', 'INITIALIZING NEURAL NET...', 'CONNECTING TO MAINFRAME...', 'SYSTEM READY'];

        const interval = setInterval(() => {
            progress += Math.random() * 2; // Slower loading to see the 3D
            if (progress > 100) progress = 100;

            if (loaderBar) loaderBar.style.width = `${progress}%`;

            if (progress < 30) loaderText.innerText = messages[0];
            else if (progress < 60) loaderText.innerText = messages[1];
            else if (progress < 90) loaderText.innerText = messages[2];
            else loaderText.innerText = messages[3];

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    // Cleanup 3D to save resources
                    const canvas = document.getElementById('loader-canvas');
                    if (canvas) canvas.remove();
                }, 800);
            }
        }, 50);

        window.addEventListener('load', () => {
            if (progress < 100) progress = 90;
        });
    }

    // Global Animations (GSAP)
    if (typeof gsap !== 'undefined') {
        gsap.from("nav", {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            delay: 1 // Wait for loader logic
        });
    }

    // 3. Global Animations (if GSAP is loaded)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Reveal Sections
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section.children, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            });
        });
    }

});

// --- 3D LOADER SCENE ---
function initLoader3D(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Deep Slate
    scene.fog = new THREE.FogExp2(0x020617, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.id = 'loader-canvas';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
    container.appendChild(renderer.domElement);

    // DETERMINE PAGE CONTEXT
    const path = window.location.pathname;
    const page = path.includes('about') ? 'about' :
        path.includes('works') ? 'works' :
            path.includes('projects') ? 'projects' :
                path.includes('contact') ? 'contact' : 'home';

    const group = new THREE.Group();
    scene.add(group);

    // SCENE GENERATION
    if (page === 'home') {
        // HOME: Iron Man Jarvis Core (Arc Reactor Style)
        createJarvisCore(group);
    }
    else if (page === 'about') {
        // ABOUT: Genetics + Neural Link
        createNeuralDNA(group);
    }
    else if (page === 'works') {
        // WORKS: Tech Writing & Research (Abstract Data Grid)
        createResearchData(group);
    }
    else if (page === 'projects') {
        // PROJECTS: Iron Man Swarm
        createSwarm(group);
    }
    else if (page === 'contact') {
        // CONTACT: Globe (Connection)
        createGlobe(group, 0, 0, 0, 18);
    }

    // ANIMATION
    function animate() {
        if (container.classList.contains('hidden')) return;
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Global subtle rotation
        group.rotation.y += 0.005;

        // Pulse Effect
        const scale = 1 + Math.sin(time * 2) * 0.01;
        group.scale.set(scale, scale, scale);

        // SWARM SPECIFIC ANIMATION
        if (page === 'projects') {
            animateSwarm(group, time);
        }

        renderer.render(scene, camera);
    }
    animate();

    // RESIZE
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 3D HELPERS ---

// 1. HOME: JARVIS CORE
function createJarvisCore(parent) {
    // Inner Core Ring
    const coreGeo = new THREE.TorusGeometry(10, 0.8, 16, 100);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);

    // Outer Ring
    const outerGeo = new THREE.TorusGeometry(14, 0.2, 16, 100);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 });
    const outer = new THREE.Mesh(outerGeo, outerMat);

    // Reactor Particles (Energy)
    const particleCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = [];
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 8 + Math.random() * 4;
        pPos.push(Math.cos(angle) * r, Math.sin(angle) * r, (Math.random() - 0.5) * 2);
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.4, transparent: true });
    const particles = new THREE.Points(pGeo, pMat);

    parent.add(core);
    parent.add(outer);
    parent.add(particles);

    // Add simple rotation animation hook via userData if needed, or rely on global
    core.userData = { speed: 0.02 };
}

// 2. ABOUT: NEURAL DNA
function createNeuralDNA(parent) {
    // Central DNA Strand
    createDNA(parent, 0, 0, 0, 1.2); // Reuse existing DNA helper but center it

    // Neural Cloud Surrounding it
    const geo = new THREE.IcosahedronGeometry(18, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.05 });
    const neuralNet = new THREE.Mesh(geo, mat);
    parent.add(neuralNet);
}

// 3. WORKS: TECH RESEARCH (Vertical Data Streams + Holographic Docs)
function createResearchData(parent) {
    const group = new THREE.Group();

    // 1. Central Data Core
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 2. Floating "Document" Planes (Spiral)
    const docGeo = new THREE.PlaneGeometry(2, 3);
    const docMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        wireframe: false // Solid for visibility
    });
    const docWireMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.4 });

    for (let i = 0; i < 18; i++) {
        const angle = i * 0.5;
        const radius = 10 + (i * 0.5);
        const y = (i - 9) * 1.5;

        const meshGroup = new THREE.Group();
        const plane = new THREE.Mesh(docGeo, docMat);
        const wire = new THREE.Mesh(docGeo, docWireMat);

        meshGroup.add(plane);
        meshGroup.add(wire);

        meshGroup.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        meshGroup.lookAt(0, y, 0); // Face center-ish

        group.add(meshGroup);
    }

    // 3. Vertical Data Lines
    const lineCount = 20;
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];
    for (let i = 0; i < lineCount; i++) {
        const x = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 30;
        const h = 20 + Math.random() * 20;
        linePos.push(x, -h / 2, z);
        linePos.push(x, h / 2, z);
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.1 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    parent.add(group);

    // Rotation animation hook handled by main loop
}

// 4. PROJECTS: SWARM (Iron Man Drones)
function createSwarm(parent) {
    // Create many small tetrahedrons
    const count = 60;
    const geo = new THREE.TetrahedronGeometry(0.8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: false }); // Solid gold drones

    for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        // Random initial positions in a sphere
        const r = 20;
        mesh.position.set(
            (Math.random() - 0.5) * r,
            (Math.random() - 0.5) * r,
            (Math.random() - 0.5) * r
        );
        // Store random velocities
        mesh.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            )
        };
        parent.add(mesh);
    }
}

function animateSwarm(parent, time) {
    parent.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.add(child.userData.velocity);
            child.rotation.x += 0.05;
            child.rotation.y += 0.05;

            // Boundary check - keep them contained
            if (child.position.length() > 25) {
                child.userData.velocity.negate();
            }
        }
    });
}

// REUSED HELPERS (DNA, Globe)
function createDNA(parent, x, y, z, scale = 1) {
    const dnaGroup = new THREE.Group();
    const count = 60;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const color1 = new THREE.Color(0x06b6d4);
    const color2 = new THREE.Color(0xd4af37);

    for (let i = 0; i < count; i++) {
        const h = (i - count / 2) * 0.8;
        const r = 6;
        const theta = i * 0.5;
        positions.push(Math.cos(theta) * r, h, Math.sin(theta) * r);
        colors.push(color1.r, color1.g, color1.b);
        positions.push(Math.cos(theta + Math.PI) * r, h, Math.sin(theta + Math.PI) * r);
        colors.push(color2.r, color2.g, color2.b);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.9 });
    const dna = new THREE.Points(geometry, mat);

    dnaGroup.add(dna);
    dnaGroup.position.set(x, y, z);
    dnaGroup.scale.set(scale, scale, scale);
    parent.add(dnaGroup);
}

function createGlobe(parent, x, y, z, radius) {
    const geometry = new THREE.SphereGeometry(radius, 40, 20);
    const mat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.3, transparent: true, opacity: 0.6 });
    const globe = new THREE.Points(geometry, mat);

    const ringGeo = new THREE.TorusGeometry(radius + 4, 0.1, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.scale.y = 0.5;

    globe.position.set(x, y, z);
    ring.position.set(x, y, z);
    parent.add(globe);
    parent.add(ring);
}
