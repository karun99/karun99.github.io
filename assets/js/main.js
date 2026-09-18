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
        // Init 3D Background with Error Handling
        if (typeof THREE !== 'undefined') {
            try {
                initLoader3D(loader);
            } catch (e) {
                console.warn("3D Engine failed to initialize:", e);
                // Continue to ensure loader hides
            }
        }

        let progress = 0;
        const messages = ['LOADING CORE MODULES...', 'INITIALIZING NEURAL NET...', 'CONNECTING TO MAINFRAME...', 'SYSTEM READY'];

        const interval = setInterval(() => {
            progress += Math.random() * 5; // Faster loading
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
                }, 500); // 0.5s fade out
            }
        }, 50);

        // Fail-safe: Force hide loader after 5 seconds if logic fails
        setTimeout(() => {
            if (!loader.classList.contains('hidden')) {
                loader.classList.add('hidden');
            }
        }, 5000);
    }

    // Global Animations (GSAP)
    if (typeof gsap !== 'undefined') {
        gsap.from("nav", {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            delay: 0.5
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
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out"
            });
        });
    }

    // 5. About Page Visualization (Persistent)
    const aboutVisualContainer = document.getElementById('about-visual-container');
    if (aboutVisualContainer && typeof THREE !== 'undefined') {
        initAboutVisuals(aboutVisualContainer);
    }

    // 6. Project Manager
    if (document.getElementById('projects-grid')) {
        initProjectManager();
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
                path.includes('contact') ? 'contact' :
                    path.includes('profile') ? 'home' : 'home';

    const group = new THREE.Group();
    scene.add(group);

    // SCENE GENERATION
    if (page === 'home') {
        createJarvisCore(group);
    }
    else if (page === 'about') {
        createNeuralDNA(group);
    }
    else if (page === 'works') {
        createResearchData(group);
    }
    else if (page === 'projects') {
        createSwarm(group);
    }
    else if (page === 'contact') {
        createGlobe(group, 0, 0, 0, 18);
    }

    // ANIMATION
    function animate() {
        if (container.classList.contains('hidden')) return;
        requestAnimationFrame(animate);

        const time = Date.now() * 0.001;
        group.rotation.y += 0.005;
        const scale = 1 + Math.sin(time * 2) * 0.01;
        group.scale.set(scale, scale, scale);

        if (page === 'projects') {
            animateSwarm(group, time);
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 5. ABOUT PAGE SPECIFIC: INTERACTIVE SKILLS GENOME (IMPROVED DNA) ---
const SKILL_CATEGORIES = [
    {
        key: 'AI_ML', label: 'AI & ML ENGINEERING', color: 0x06b6d4, desc: 'Neural architectures, LLMs & agentic systems',
        skills: ['Python', 'TensorFlow', 'Deep Learning', 'LLM', 'RAG', 'Agentic AI', 'Gen AI', 'Big Data']
    },
    {
        key: 'WEB', label: 'WEB & FULLSTACK', color: 0xd4af37, desc: 'Modern interfaces & server systems',
        skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Three.js', 'Tailwind', 'MEAN Stack']
    },
    {
        key: 'DATA', label: 'DATA & INFRA', color: 0x22c55e, desc: 'Storage, pipelines & deployment',
        skills: ['MongoDB', 'SQL', 'Docker', 'Git', 'AWS', 'FastAPI', 'Power BI', 'Linux']
    },
    {
        key: 'RESEARCH', label: 'RESEARCH & AI LITERACY', color: 0xf472b6, desc: 'Scholarship, writing & IPR',
        skills: ['Prompt Engineering', 'Research Methodology', 'Technical Writing', 'IPR & Patents', 'Machine Learning', 'NLP']
    }
];

function initAboutVisuals(container) {
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.014);

    const width = container.clientWidth;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 46);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Ambient starfield
    addStarField(scene, 380);

    // The skills genome (categorized DNA helix)
    const helix = createSkillsGenome();
    group.add(helix);

    // Interaction state
    const pointer = new THREE.Vector2(0, 0);
    const target = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    const tooltip = document.getElementById('dna-tooltip');
    let hasPointer = false;
    let hoveredNode = null;

    const nodes = [];
    helix.traverse((child) => {
        if (child.isMesh && child.userData.isSkillNode) nodes.push(child);
    });

    container.addEventListener('pointermove', (event) => {
        const rect = container.getBoundingClientRect();
        target.x = ((event.clientX - rect.left) / width) * 2 - 1;
        target.y = -((event.clientY - rect.top) / height) * 2 + 1;
        mouse.x = target.x;
        mouse.y = target.y;
        hasPointer = true;

        if (tooltip) {
            tooltip.style.left = `${event.clientX - rect.left + 16}px`;
            tooltip.style.top = `${event.clientY - rect.top + 16}px`;
        }
    });

    container.addEventListener('mouseleave', () => {
        hasPointer = false;
        target.set(0, 0);
        resetHover();
        if (tooltip) tooltip.style.opacity = 0;
    });

    function animateScale(obj, s) {
        if (typeof gsap !== 'undefined') {
            gsap.to(obj.scale, { x: s, y: s, z: s, duration: 0.35, ease: 'power2.out' });
        } else {
            obj.scale.set(s, s, s);
        }
    }

    function resetHover() {
        if (hoveredNode) {
            animateScale(hoveredNode, 1);
            hoveredNode.material.color.setHex(hoveredNode.userData.color);
            hoveredNode = null;
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;

        // Auto-rotation + mouse parallax (smooth damped)
        pointer.x += (target.x - pointer.x) * 0.06;
        pointer.y += (target.y - pointer.y) * 0.06;
        helix.rotation.y = time * 0.35 + pointer.x * 0.6;
        helix.rotation.x = pointer.y * 0.25;

        // Gentle breathing scale
        const breath = 1 + Math.sin(time * 1.2) * 0.015;
        helix.scale.set(breath, breath, breath);

        // Pulsing starfield
        const stars = scene.getObjectByName('starfield');
        if (stars) stars.material.size = 0.2 + Math.sin(time * 2) * 0.05;

        // Hover raycast only after pointer enters container
        if (hasPointer) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(nodes);
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (hoveredNode !== object) {
                    resetHover();
                    hoveredNode = object;
                    animateScale(object, 2);
                    object.material.color.setHex(0xffffff);
                    if (tooltip) {
                        const d = object.userData;
                        const hex = '#' + d.color.toString(16).padStart(6, '0');
                        tooltip.innerHTML =
                            `<span style="color:${hex}">${d.category}</span> :: ${d.skill}` +
                            `<br /><small>${d.desc}</small>`;
                        tooltip.style.opacity = 1;
                        tooltip.style.borderColor = hex;
                    }
                }
            } else {
                resetHover();
                if (tooltip) tooltip.style.opacity = 0;
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    if (window.ResizeObserver) {
        new ResizeObserver(() => {
            const w = container.clientWidth;
            const h = container.clientHeight || 500;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }).observe(container);
    }
}

function createSkillsGenome() {
    const genome = new THREE.Group();

    const pairs = 26;
    const radius = 7.2;
    const spread = 1.3;
    const bands = SKILL_CATEGORIES.length;
    const perBand = Math.ceil(pairs / bands);

    // Backbone strands (helical curves)
    const curveA = [];
    const curveB = [];
    for (let i = 0; i <= pairs; i++) {
        const h = (i - pairs / 2) * spread;
        const theta = i * 0.55;
        curveA.push(new THREE.Vector3(Math.cos(theta) * radius, h, Math.sin(theta) * radius));
        curveB.push(new THREE.Vector3(Math.cos(theta + Math.PI) * radius, h, Math.sin(theta + Math.PI) * radius));
    }
    const backboneMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.5 });
    const tubeA = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curveA), 120, 0.18, 8, false), backboneMat);
    const tubeB = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curveB), 120, 0.18, 8, false), backboneMat);
    genome.add(tubeA, tubeB);

    const sphereGeo = new THREE.SphereGeometry(0.52, 20, 20);
    const rungGeo = new THREE.CylinderGeometry(0.07, 0.07, radius * 2, 6);

    for (let i = 0; i < pairs; i++) {
        const h = (i - pairs / 2) * spread;
        const theta = i * 0.55;

        const catIndex = Math.min(Math.floor(i / perBand), bands - 1);
        const cat = SKILL_CATEGORIES[catIndex];
        const catColor = new THREE.Color(cat.color);

        const xA = Math.cos(theta) * radius;
        const zA = Math.sin(theta) * radius;
        const xB = Math.cos(theta + Math.PI) * radius;
        const zB = Math.sin(theta + Math.PI) * radius;

        const skillA = cat.skills[i % cat.skills.length];
        const skillB = cat.skills[(i + Math.floor(cat.skills.length / 2)) % cat.skills.length];

        // Strand A node
        const nodeA = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: catColor }));
        nodeA.position.set(xA, h, zA);
        nodeA.userData = { isSkillNode: true, skill: skillA, category: cat.label, desc: cat.desc, color: cat.color };
        genome.add(nodeA);

        // Strand B node (slightly dimmer variant for depth)
        const nodeB = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: catColor.clone().multiplyScalar(0.7) }));
        nodeB.position.set(xB, h, zB);
        nodeB.userData = { isSkillNode: true, skill: skillB, category: cat.label, desc: cat.desc, color: cat.color };
        genome.add(nodeB);

        // Base-pair rung
        const rung = new THREE.Mesh(rungGeo, new THREE.MeshBasicMaterial({ color: catColor, transparent: true, opacity: 0.3 }));
        rung.position.set((xA + xB) / 2, h, (zA + zB) / 2);
        rung.lookAt(new THREE.Vector3(xB, h, zB));
        rung.rotateX(Math.PI / 2);
        genome.add(rung);

        // Hydrogen-bond glint
        const bondGeo = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
        genome.add(new THREE.Line(bondGeo, new THREE.LineBasicMaterial({ color: catColor, transparent: true, opacity: 0.2 })));
    }

    // Central energy core
    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.4, 1),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.18 })
    );
    genome.add(core);

    genome.rotation.z = 0.12;
    return genome;
}

function addStarField(scene, count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.2, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(geo, mat);
    stars.name = 'starfield';
    scene.add(stars);
}

// --- 3D HELPERS ---
function createJarvisCore(parent) {
    const coreGeo = new THREE.TorusGeometry(10, 0.8, 16, 100);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    const outerGeo = new THREE.TorusGeometry(14, 0.2, 16, 100);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6 });
    const outer = new THREE.Mesh(outerGeo, outerMat);
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
    core.userData = { speed: 0.02 };
}

function createNeuralDNA(parent) {
    createDNA(parent, 0, 0, 0, 1.2);
    const geo = new THREE.IcosahedronGeometry(18, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.05 });
    const neuralNet = new THREE.Mesh(geo, mat);
    parent.add(neuralNet);
}

function createResearchData(parent) {
    const group = new THREE.Group();
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);
    const docGeo = new THREE.PlaneGeometry(2, 3);
    const docMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.15, wireframe: false });
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
        meshGroup.lookAt(0, y, 0);
        group.add(meshGroup);
    }
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
}

function createSwarm(parent) {
    const count = 60;
    const geo = new THREE.TetrahedronGeometry(0.8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: false });
    for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        const r = 20;
        mesh.position.set((Math.random() - 0.5) * r, (Math.random() - 0.5) * r, (Math.random() - 0.5) * r);
        mesh.userData = { velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2) };
        parent.add(mesh);
    }
}

function animateSwarm(parent, time) {
    parent.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.add(child.userData.velocity);
            child.rotation.x += 0.05;
            child.rotation.y += 0.05;
            if (child.position.length() > 25) {
                child.userData.velocity.negate();
            }
        }
    });
}

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

// --- PROJECT MANAGER CRUD ---
const PROJECT_STORAGE_KEY = 'sai_portfolio_projects';
const AUTH_KEY = 'sai_portfolio_auth';

const DEFAULT_PROJECTS = [
    {
        id: 'p1',
        title: 'S-AI — Multi-Agent Swarm Intelligence',
        category: 'AGENTIC AI // SWARM',
        description: 'A published npm multi-agent swarm system with neural Digital Twin persona adaptation, arXiv research mapping, Bhashini multilingual AI, MCP integration, and bias-reduced consensus across 6 specialized agents.',
        link: 'https://www.npmjs.com/package/@saikarun/s-ai',
        icon: 'fas fa-robot',
        tags: ['TYPESCRIPT', 'LLM', 'AGENTIC', 'OPENSOURCE'],
        featured: true
    },
    {
        id: 'p2',
        title: 'Collabuild — Research-to-Prototype Pipeline',
        category: 'MAS // RESEARCH',
        description: 'A multi-agent system (MAS) implementation that turns research papers into working prototypes through an automated orchestrated pipeline of specialized research agents.',
        link: 'https://github.com/karun99/Collabuild',
        icon: 'fas fa-project-diagram',
        tags: ['PYTHON', 'MULTI-AGENT', 'DOCKER'],
        featured: true
    },
    {
        id: 'p3',
        title: 'Duet AI Ecosystem',
        category: 'DIGITAL TWIN // HCI',
        description: 'An Agentic AI ecosystem investigating the fundamental process of Human-Computer Interaction and Parallel Consciousness through prompt architecture.',
        link: 'https://github.com/nsktech994/Duet--Digital-Twin-Technology',
        icon: 'fas fa-brain',
        tags: ['PYTHON', 'LLM', 'AGENTIC'],
        featured: true
    },
    {
        id: 'p4',
        title: 'AppIdea — Privacy-First Product Workspace',
        category: 'DEV TOOLS // PRIVACY',
        description: 'A client-side product workspace that turns raw ideas into professional documents (Charter, PRD, TDD, Pitch Deck) and exports PDF/PPTX — all data AES-256 encrypted and stored locally.',
        link: 'https://github.com/karun99/proto-collection/tree/main/appidea',
        icon: 'fas fa-lightbulb',
        tags: ['NEXT.JS', 'CRYPTOJS', 'PRIVACY'],
        featured: false
    },
    {
        id: 'p6',
        title: 'LeadGen Agent — Multi-Agent Lead Generation',
        category: 'AGENTIC AI // GTM',
        description: 'A multi-agent lead generation system that validates, enriches and scores leads using OCR document parsing, Bhashini AI and web intelligence for high-conversion outreach.',
        link: 'https://github.com/karun99/proto-collection/tree/main/LeadGen%20Agent',
        icon: 'fas fa-bullseye',
        tags: ['TYPESCRIPT', 'OCR', 'BHASHINI'],
        featured: false
    },
    {
        id: 'p7',
        title: 'Prompt-Code — Prompt Engineering Arena',
        category: 'EDTECH // EVALUATION',
        description: 'A prompt engineering challenge platform with AI-powered evaluation, leaderboards and peer review loops to sharpen LLM prompting craft.',
        link: 'https://github.com/karun99/proto-collection/tree/main/prompt-code',
        icon: 'fas fa-code',
        tags: ['EXPRESS', 'AI EVAL', 'NETLIFY'],
        featured: false
    },
    {
        id: 'p8',
        title: 'Tut-Hub — Tutor & Learning Platform',
        category: 'EDTECH // LMS',
        description: 'A tutor and learning management platform enabling course delivery, student progress tracking and session management for modern educators.',
        link: 'https://github.com/karun99/proto-collection/tree/main/tut-hub',
        icon: 'fas fa-graduation-cap',
        tags: ['REACT', 'SUPABASE', 'LMS'],
        featured: false
    },
    {
        id: 'p9',
        title: 'Study Buddy Next — AI Study Companion',
        category: 'EDTECH // AI TUTOR',
        description: 'An AI-powered study companion built on Next.js 16 and Tailwind CSS v4 that helps students query, summarize and retain course material interactively.',
        link: 'https://github.com/karun99/proto-collection/tree/main/study-buddy-next',
        icon: 'fas fa-user-graduate',
        tags: ['NEXT.JS', 'TAILWIND', 'AI'],
        featured: false
    },
    {
        id: 'p10',
        title: 'Perspective AI — AI Backend Engine',
        category: 'AI INFRA // BACKEND',
        description: 'A TypeScript/Express backend engine for AI apps with AES-256 auth, project management, configurable content-generation agents and an admin dashboard.',
        link: 'https://github.com/karun99/proto-collection/tree/main/you-ai-engine',
        icon: 'fas fa-server',
        tags: ['TYPESCRIPT', 'EXPRESS', 'AUTH'],
        featured: false
    },
    {
        id: 'p11',
        title: 'AI-CMS — AI Content Management',
        category: 'AI INFRA // CMS',
        description: 'An AI-assisted content management system pairing a React + Vite frontend with LLM generation for fast, structured content workflows.',
        link: 'https://github.com/karun99/proto-collection/tree/main/ai-cms',
        icon: 'fas fa-newspaper',
        tags: ['REACT', 'VITE', 'AI'],
        featured: false
    },
    {
        id: 'p12',
        title: 'Career Roadmap Generator',
        category: 'DEV TOOLS // GENERATIVE',
        description: 'AI-powered developer support tool that generates personalized career roadmaps and skill progression paths.',
        link: 'https://carcan.created.app/',
        icon: 'fas fa-map-signs',
        tags: ['GENERATIVE AI', 'CAREER'],
        featured: false
    },
    {
        id: 'p13',
        title: 'HCL Detector Prototype',
        category: 'BIO-INFORMATICS // NO-CODE',
        description: 'Hairy Cell Leukemia detector prototype built using advanced No-Code tools for rapid diagnostic visualization.',
        link: 'https://hclproto.created.app/',
        icon: 'fas fa-dna',
        tags: ['NO-CODE', 'BIO-TECH'],
        featured: false
    },
    {
        id: 'p14',
        title: 'Job Aggregator & Analytics Suite',
        category: 'AUTOMATION // DATA',
        description: 'A FastAPI job aggregation service feeding a Dash + Plotly analytics dashboard for lead validation, regional insights and market intelligence.',
        link: 'https://github.com/karun99/proto-collection',
        icon: 'fas fa-briefcase',
        tags: ['FASTAPI', 'DASH', 'PLOTLY'],
        featured: false
    },
    {
        id: 'p15',
        title: 'S-AI — Swarm Intelligence (Source)',
        category: 'AGENTIC AI // SWARM',
        description: 'S-AI v5.1 source — Multi-Agent Swarm Intelligence with MCP Builder, Skill Creator, Neural Mapping, and 20+ AI providers.',
        link: 'https://github.com/karun99/s-ai',
        icon: 'fas fa-robot',
        tags: ['TYPESCRIPT', 'LLM', 'AGENTIC', 'OPENSOURCE'],
        featured: false
    },
    {
        id: 'p16',
        title: 'S-AI Update — Synthetic Executive',
        category: 'AGENTIC AI // SECURITY',
        description: 'S-AI v6.1 — Synthetic Executive with security hardening, SSRF protection, sandboxing, and TRL/MRL/IRL readiness.',
        link: 'https://github.com/karun99/s-ai-update',
        icon: 'fas fa-shield-halved',
        tags: ['TYPESCRIPT', 'SECURITY', 'AGENTIC'],
        featured: false
    }
];

function initProjectManager() {
    console.log(">> INITIALIZING PROJECT MANAGER SYSTEM...");

    const grid = document.getElementById('projects-grid');
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const addBtn = document.getElementById('add-project-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Auth Elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Verification
    if (!grid) {
        console.warn(">> Project Grid not found. Skipping Project Manager.");
        return;
    }

    // Load Projects (versioned so updated defaults re-seed once per release)
    let projects = [];
    try {
        const PROJECT_VERSION = 'v3';
        const versionKey = 'sai_portfolio_projects_version';
        if (localStorage.getItem(versionKey) !== PROJECT_VERSION) {
            projects = DEFAULT_PROJECTS;
            localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
            localStorage.setItem(versionKey, PROJECT_VERSION);
        } else {
            const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
            projects = stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
            if (!projects || projects.length === 0) {
                projects = DEFAULT_PROJECTS;
                localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
            }
        }
    } catch (e) {
        console.error(">> SYSTEM ERROR: Failed to load projects", e);
        projects = DEFAULT_PROJECTS;
    }

    // Initial Render
    checkAuthUI();

    // Wrap render in try-catch to prevent blocking event listeners
    try {
        renderProjects(grid, projects);
    } catch (e) {
        console.error(">> SYSTEM ERROR: Projects Render Failed", e);
        grid.innerHTML = '<div class="text-red-400 p-4 border border-red-400">SYSTEM ERROR: UNABLE TO RENDER ARCHIVE.</div>';
    }

    // --- EVENT LISTENERS ---

    // 1. Open Add Modal
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            console.log(">> OPENING ADD PROJECT MODAL");
            openModal(modal, form);
        });
    }

    // 2. Close Modals
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(modal));

    // 3. Close on backdrop click (Project Modal)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal-backdrop') closeModal(modal);
        });
    }

    // 4. Save Project (Add/Edit)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(">> SAVING PROJECT DATA...");
            saveProjectForm(form, modal, grid);
        });
    }

    // --- AUTH SYSTEMS ---

    // 5. Open Login Modal
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent jump
            console.log(">> ACCESSING ADMIN LOGIN");
            if (loginModal) {
                loginModal.classList.remove('hidden');
                // Focus username
                setTimeout(() => document.getElementById('username').focus(), 100);
            }
        });
    }

    // 6. Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log(">> LOGGING OUT SYSTEM");
            sessionStorage.removeItem(AUTH_KEY);
            checkAuthUI();
            renderProjects(grid, JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]"));
        });
    }

    // 7. Login Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const err = document.getElementById('login-error');

            console.log(`>> ATTEMPTING AUTH FOR: ${u}`);

            // MD5("S2") = c81e728d9d4c2f636f067f89cc14862c
            const validHash = "c81e728d9d4c2f636f067f89cc14862c";
            const inputHash = typeof md5 === 'function' ? md5(p) : "";

            // Check standard creds OR Debug Admin override
            if ((u === 'nsk' && inputHash === validHash) || (u === 'admin' && p === 'admin')) {
                console.log(">> ACCESS GRANTED");
                sessionStorage.setItem(AUTH_KEY, 'true');
                if (loginModal) loginModal.classList.add('hidden');
                loginForm.reset();
                if (err) err.classList.add('hidden');
                checkAuthUI();
                renderProjects(grid, JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]"));
            } else {
                console.warn(">> ACCESS DENIED");
                if (err) err.classList.remove('hidden');
                // Shake effect (optional)
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
            }
        });
    }

    // 8. Close Login Modal on Backdrop
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target.id === 'login-backdrop') loginModal.classList.add('hidden');
        });
    }
}

function checkAuthUI() {
    const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';
    const addBtn = document.getElementById('add-project-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');

    if (isLoggedIn) {
        if (addBtn) {
            addBtn.classList.remove('hidden');
            addBtn.classList.add('flex');
        }
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.add('hidden');
    } else {
        if (addBtn) {
            addBtn.classList.add('hidden');
            addBtn.classList.remove('flex');
        }
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.remove('hidden');
    }
    return isLoggedIn;
}

function renderProjects(grid, projects) {
    if (!grid) return;
    grid.innerHTML = '';
    const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';

    // Sort: Featured first
    if (Array.isArray(projects)) {
        projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
        projects = [];
    }

    projects.forEach((p, index) => {
        const card = document.createElement('div');
        // Animation delay for staggering
        const delay = index * 100;

        // Base classes
        let cardClasses = `glass-panel p-6 md:p-8 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full animate-fade-in opacity-0`;

        // Dynamic style injection for animation
        card.style.animation = `fadeInUp 0.6s ease-out ${delay}ms forwards`;

        if (p.featured) {
            // Gold border + Glow + Subtle Gradient Background for Featured
            cardClasses += ' border-l-2 border-l-gold shadow-[0_0_20px_rgba(212,175,55,0.05)] bg-gradient-to-br from-white/5 via-transparent to-gold/5';
        } else {
            // Default Glass Effect
            cardClasses += ' border-t border-white/10 hover:border-accent-primary/30';
        }

        card.className = cardClasses;

        const adminControls = isLoggedIn ? `
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button class="bg-black/50 text-accent-primary hover:text-white p-2 rounded-full hover:bg-accent-primary/20 transition-all" onclick="editProject('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="bg-black/50 text-red-400 hover:text-white p-2 rounded-full hover:bg-red-500/50 transition-all" onclick="deleteProject('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        ` : '';

        // Animated Background Gradient for interaction
        const interactiveBg = `
            <div class="absolute inset-0 bg-gradient-to-tr from-accent-primary/0 via-accent-primary/0 to-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        `;

        // Featured Icon (Crown) next to App Icon
        const featuredIcon = p.featured ? `<i class="fas fa-star text-gold text-sm ml-3 animate-pulse" title="Featured System"></i>` : '';

        // Safety for tags
        const tagsHtml = (p.tags || []).map(t => `<span class="bg-black/30 border border-white/10 px-2 py-1 rounded text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-wider">${t}</span>`).join('');

        card.innerHTML = `
            ${interactiveBg}
            ${adminControls}
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                    <div class="text-4xl md:text-5xl text-accent-primary flex items-center drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <div class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl bg-accent-primary/10 border border-accent-primary/20 group-hover:border-accent-primary/50 transition-all">
                             <i class="${p.icon}"></i>
                        </div>
                        ${featuredIcon}
                    </div>
                    <a href="${p.link}" target="_blank" class="text-gray-500 hover:text-white transition transform hover:scale-110 p-2"><i class="fas fa-external-link-alt text-lg"></i></a>
                </div>
                
                <h3 class="text-xl md:text-2xl text-white mb-2 font-display tracking-wide group-hover:text-accent-primary transition-colors">${p.title}</h3>
                <p class="text-[10px] text-gold/80 font-mono mb-4 tracking-widest border-b border-white/5 pb-3 inline-block uppercase">${p.category}</p>
                <p class="text-gray-400 text-sm leading-relaxed mb-6 font-light line-clamp-3">${p.description}</p>
            </div>

            <div class="relative z-10 flex gap-2 text-[10px] font-bold font-mono text-gray-500 flex-wrap mt-auto">
                ${tagsHtml}
            </div>
        `;
        grid.appendChild(card);
    });

    // Inject animation keyframes if not present
    if (!document.getElementById('anim-styles')) {
        const style = document.createElement('style');
        style.id = 'anim-styles';
        style.innerHTML = `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        `;
        document.head.appendChild(style);
    }
}

function openModal(modal, form, project = null) {
    if (!modal) return;

    modal.classList.remove('hidden');
    // Animate in
    const content = modal.querySelector('#modal-content');
    if (content) {
        // Reset state first to allow animation
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 50);
    }

    if (project) {
        document.getElementById('modal-title').innerText = 'EDIT SYSTEM';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-desc').value = project.description;
        document.getElementById('project-link').value = project.link;
        document.getElementById('project-icon').value = project.icon;
        document.getElementById('project-tags').value = project.tags.join(', ');
        document.getElementById('project-featured').checked = project.featured || false;
    } else {
        document.getElementById('modal-title').innerText = 'INITIATE PROJECT';
        form.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('project-featured').checked = false;
    }
}

function closeModal(modal) {
    if (!modal) return;
    const content = modal.querySelector('#modal-content');
    if (content) {
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 150);
}

function saveProjectForm(form, modal, grid) {
    if (!form) return;

    const id = document.getElementById('project-id').value || 'p' + Date.now();
    const title = document.getElementById('project-title').value.trim();
    const category = document.getElementById('project-category').value.trim();
    const description = document.getElementById('project-desc').value.trim();
    const link = document.getElementById('project-link').value.trim();
    const icon = document.getElementById('project-icon').value.trim();
    const tags = document.getElementById('project-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const featured = document.getElementById('project-featured').checked;

    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
        if (!Array.isArray(projects)) projects = [];
    } catch (e) {
        console.error(">> SYSTEM ERROR: Failed to read projects", e);
        projects = [];
    }

    const existing = projects.find(p => p.id === id);
    if (existing) {
        Object.assign(existing, { title, category, description, link, icon, tags, featured });
    } else {
        projects.push({ id, title, category, description, link, icon, tags, featured });
    }

    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    console.log(">> PROJECT DATA SAVED");
    closeModal(modal);
    form.reset();
    renderProjects(grid, projects);
}

function editProject(id) {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');

    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
    } catch (e) {
        projects = [];
    }
    const project = projects.find(p => p.id === id);
    if (!project) {
        console.warn(">> PROJECT NOT FOUND: " + id);
        return;
    }
    openModal(modal, form, project);
}

function deleteProject(id) {
    const grid = document.getElementById('projects-grid');

    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
    } catch (e) {
        projects = [];
    }
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    console.log(">> PROJECT DELETED: " + id);
    renderProjects(grid, projects);
}

// --- MD5 Implementation ---
function md5(string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = string;
    x = ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }
    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
    return temp.toLowerCase();
}
