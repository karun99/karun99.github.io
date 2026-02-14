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

// --- 5. ABOUT PAGE SPECIFIC: NEURAL CONSTELLATION ---
function initAboutVisuals(container) {
    if (!container) return;

    const scene = new THREE.Scene();
    // Transparent background to show through glass panel

    // Get dimensions of the container
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Neural Nodes & Connections (Interactive DNA)
    createInteractiveDNA(group);

    // Interaction Variables
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('dna-tooltip');

    // Mouse Move Event
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

        // Tooltip following mouse with offset
        if (tooltip) {
            const x = event.clientX - rect.left + 15;
            const y = event.clientY - rect.top + 15;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }
    });

    // Animation Loop
    let hoveredNode = null;

    function animate() {
        requestAnimationFrame(animate);

        group.rotation.y += 0.005; // Constant DNA rotation

        // Raycasting
        raycaster.setFromCamera(mouse, camera);

        // Find nodes (filtering by userData.isNode)
        const nodes = [];
        group.traverse((child) => {
            if (child.isMesh && child.userData.isNode) {
                nodes.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(nodes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (hoveredNode !== object) {
                // Determine skill
                const skill = object.userData.skill || "UNKNOWN";

                // Show tooltip
                if (tooltip) {
                    tooltip.innerText = `>> DECODING: ${skill}`;
                    tooltip.style.opacity = 1;
                    tooltip.style.background = "rgba(6, 182, 212, 0.9)";
                }

                // Highlight Node
                object.scale.set(1.5, 1.5, 1.5);
                object.material.color.setHex(0xffffff);
                hoveredNode = object;
            }
        } else {
            if (hoveredNode) {
                // Reset interaction
                hoveredNode.scale.set(1, 1, 1);
                hoveredNode.material.color.setHex(hoveredNode.userData.originalColor);
                hoveredNode = null;

                if (tooltip) {
                    tooltip.style.opacity = 0;
                }
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    // Resize Observer
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

function createInteractiveDNA(parent) {
    const dnaGroup = new THREE.Group();
    const count = 40; // Number of base pairs

    // Skills Data to map to nodes
    const skills = [
        "React", "Node.js", "Python", "TensorFlow", "Three.js", "HTML5",
        "CSS3", "JavaScript", "TypeScript", "Git", "Docker", "AWS",
        "MongoDB", "SQL", "REST API", "GraphQL", "Next.js", "Tailwind",
        "Figma", "UI/UX", "Algo", "Data Struct", "OOP", "System Design",
        "CI/CD", "Testing", "Agile", "Scrum", "Jira", "Linux", "Bash",
        "Networking", "Security", "Crypto", "Web3", "Solidity", "Rust",
        "Go", "C++", "Java"
    ];

    const color1 = 0x06b6d4; // Cyan
    const color2 = 0xd4af37; // Gold

    const nodeGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const connectorMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

    for (let i = 0; i < count; i++) {
        const h = (i - count / 2) * 1.5; // Spacing
        const r = 8; // Radius
        const theta = i * 0.5; // Twist

        // Node 1
        const x1 = Math.cos(theta) * r;
        const z1 = Math.sin(theta) * r;
        const mat1 = new THREE.MeshBasicMaterial({ color: color1 });
        const node1 = new THREE.Mesh(nodeGeo, mat1);
        node1.position.set(x1, h, z1);
        node1.userData = {
            isNode: true,
            skill: skills[i % skills.length],
            originalColor: color1
        };
        dnaGroup.add(node1);

        // Node 2 (Opposite)
        const x2 = Math.cos(theta + Math.PI) * r;
        const z2 = Math.sin(theta + Math.PI) * r;
        const mat2 = new THREE.MeshBasicMaterial({ color: color2 });
        const node2 = new THREE.Mesh(nodeGeo, mat2);
        node2.position.set(x2, h, z2);
        node2.userData = {
            isNode: true,
            skill: skills[(i + 5) % skills.length], // Offset skill for variety
            originalColor: color2
        };
        dnaGroup.add(node2);

        // Connection Line (Base Pair)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, h, z1),
            new THREE.Vector3(x2, h, z2)
        ]);
        const line = new THREE.Line(lineGeo, connectorMaterial);
        dnaGroup.add(line);
    }

    // Center it
    dnaGroup.rotation.z = Math.PI / 6; // Slight tilt
    parent.add(dnaGroup);
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

// --- PROJECT MANAGER CRUD ---
const PROJECT_STORAGE_KEY = 'sai_portfolio_projects';
const AUTH_KEY = 'sai_portfolio_auth';

const DEFAULT_PROJECTS = [
    {
        id: 'p1',
        title: 'Duet AI Ecosystem',
        category: 'DIGITAL TWIN // HCI',
        description: 'An Agentic AI ecosystem investigating the fundamental process of Human-Computer Interaction and Parallel Consciousness through prompt architecture.',
        link: 'https://github.com/nsktech994/Duet--Digital-Twin-Technology',
        icon: 'fas fa-brain',
        tags: ['PYTHON', 'LLM', 'AGENTIC'],
        featured: true
    },
    {
        id: 'p2',
        title: 'Lit AI Symposium',
        category: 'SWARM INTELLIGENCE // RESEARCH',
        description: 'A Virtual Research Symposium platform utilizing Hybrid AI Swarm Technology to assist emerging scholars in their research presentations.',
        link: 'https://github.com/nsktech994/AI-Lit--',
        icon: 'fas fa-network-wired',
        tags: ['SWARM AI', 'RESEARCH'],
        featured: true
    },
    {
        id: 'p3',
        title: 'HCL Detector Prototype',
        category: 'BIO-INFORMATICS // NO-CODE',
        description: 'Hairy Cell Leukemia detector prototype built using advanced No-Code tools for rapid diagnostic visualization.',
        link: 'https://hclproto.created.app/',
        icon: 'fas fa-dna',
        tags: ['NO-CODE', 'BIO-TECH'],
        featured: false
    },
    {
        id: 'p4',
        title: 'Career Roadmap Generator',
        category: 'DEV TOOLS // GENERATIVE',
        description: 'AI-powered developer support tool that generates personalized career roadmaps and skill progression paths.',
        link: 'https://carcan.created.app/',
        icon: 'fas fa-map-signs',
        tags: ['GENERATIVE AI', 'CAREER'],
        featured: false
    }
];

function initProjectManager() {
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

    // Load Projects
    let projects = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY));
    if (!projects || projects.length === 0) {
        projects = DEFAULT_PROJECTS;
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    }

    // Initial Render
    checkAuthUI();
    renderProjects(grid, projects);

    // Event Listeners
    addBtn.addEventListener('click', () => {
        openModal(modal, form);
    });

    closeBtn.addEventListener('click', () => closeModal(modal));
    cancelBtn.addEventListener('click', () => closeModal(modal));

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'modal-backdrop') closeModal(modal);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProjectForm(form, modal, grid);
    });

    // Auth Listeners
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(AUTH_KEY);
            checkAuthUI();
            renderProjects(grid, JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY)));
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const err = document.getElementById('login-error');

            // MD5("S2") = c81e728d9d4c2f636f067f89cc14862c
            const validHash = "c81e728d9d4c2f636f067f89cc14862c";

            if (u === 'nsk' && md5(p) === validHash) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                loginModal.classList.add('hidden');
                loginForm.reset();
                if (err) err.classList.add('hidden');
                checkAuthUI();
                renderProjects(grid, JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY)));
            } else {
                if (err) err.classList.remove('hidden');
            }
        });
    }

    // Close login modal on backdrop
    loginModal.addEventListener('click', (e) => {
        if (e.target.id === 'login-backdrop') loginModal.classList.add('hidden');
    });
}

function checkAuthUI() {
    const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';
    const addBtn = document.getElementById('add-project-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');

    if (isLoggedIn) {
        if (addBtn) addBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.add('hidden');
    } else {
        if (addBtn) addBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (adminLoginBtn) adminLoginBtn.classList.remove('hidden');
    }
    return isLoggedIn;
}

function renderProjects(grid, projects) {
    grid.innerHTML = '';
    const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';

    // Sort: Featured first
    projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    projects.forEach(p => {
        const card = document.createElement('div');
        // Enhanced Featured Styling
        let cardClasses = 'glass-panel p-8 group hover:-translate-y-2 transition duration-300 relative overflow-hidden';

        if (p.featured) {
            // Gold border + Glow + Subtle Gradient Background
            cardClasses += ' border border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-white/5 to-gold/5';
        } else {
            // Default Glass Effect
            cardClasses += ' border border-white/10 hover:border-white/20';
        }

        card.className = cardClasses;

        const adminControls = isLoggedIn ? `
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button class="text-gray-400 hover:text-white p-2" onclick="editProject('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="text-gray-400 hover:text-red-400 p-2" onclick="deleteProject('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
        ` : '';

        // Shimmer Effect Overlay for featured
        const featuredBg = p.featured ? `
             <!-- Shimmer Effect Overlay -->
            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        ` : '';

        // Featured Icon (Crown) next to App Icon
        const featuredIcon = p.featured ? `<i class="fas fa-crown text-gold text-xl ml-3 animate-pulse" title="Featured Project"></i>` : '';

        card.innerHTML = `
            ${featuredBg}
            ${adminControls}
            <div class="flex justify-between items-start mb-6">
                <div class="text-4xl text-accent-primary flex items-center">
                    <i class="${p.icon}"></i>
                    ${featuredIcon}
                </div>
                <a href="${p.link}" target="_blank" class="text-gray-500 hover:text-white transition"><i class="fas fa-external-link-alt"></i></a>
            </div>
            <h3 class="text-2xl text-white mb-2 font-display group-hover:text-gold transition-colors">${p.title}</h3>
            <p class="text-xs text-accent-primary font-mono mb-4">${p.category}</p>
            <p class="text-gray-400 leading-relaxed mb-6">${p.description}</p>
            <div class="flex gap-2 text-xs font-bold font-mono text-gray-500 flex-wrap">
                ${p.tags.map(t => `<span class="bg-white/5 px-2 py-1 rounded">${t}</span>`).join('')}
            </div>
        `;
        grid.appendChild(card);
    });
}

function openModal(modal, form, project = null) {
    modal.classList.remove('hidden');
    // Animate in
    setTimeout(() => {
        document.getElementById('modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);

    if (project) {
        document.getElementById('modal-title').innerText = 'EDIT PROJECT';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-desc').value = project.description;
        document.getElementById('project-link').value = project.link;
        document.getElementById('project-icon').value = project.icon;
        document.getElementById('project-tags').value = project.tags.join(', ');
        document.getElementById('project-featured').checked = project.featured || false;
    } else {
        document.getElementById('modal-title').innerText = 'ADD PROJECT';
        form.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('project-featured').checked = false;
    }
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
