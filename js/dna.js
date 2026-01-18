// DNA Scene Logic
document.addEventListener('DOMContentLoaded', () => {
    initDNA();
});

function initDNA() {
    const container = document.getElementById('dna-canvas-container');
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x06b6d4, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Data
    const skillsData = [
        { name: "Generative AI", level: "98%", color: 0xa855f7, desc: "LLMs, Diffusion Models, Transformers." },
        { name: "Machine Learning", level: "95%", color: 0xf97316, desc: "Supervised/Unsupervised algorithms, scikit-learn." },
        { name: "Agentic AI", level: "96%", color: 0xd4af37, desc: "Autonomous multi-agent systems, LangChain." },
        { name: "Deep Learning", level: "92%", color: 0xef4444, desc: "CNNs, RNNs, PyTorch/TensorFlow." },
        { name: "Web Development", level: "90%", color: 0x06b6d4, desc: "Fullstack, React, Next.js, Node.js." },
        { name: "Prompt Eng.", level: "97%", color: 0xec4899, desc: "Chain-of-thought, System prompts." },
        { name: "Data Science", level: "94%", color: 0x3b82f6, desc: "Pandas, NumPy, Statistical Inference." },
        { name: "Python/js", level: "99%", color: 0x10b981, desc: "Polyglot coding proficiency." }
    ];

    const group = new THREE.Group();
    scene.add(group);
    const objects = [];
    const geometrySphere = new THREE.SphereGeometry(0.6, 32, 32);
    const materialBond = new THREE.MeshStandardMaterial({
        color: 0xffffff, opacity: 0.2, transparent: true
    });

    // Generate Helix
    const count = 16;
    const radius = 3.5;
    const height = 20;
    const turns = 2;

    for (let i = 0; i <= count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 2 * turns;
        const y = (t - 0.5) * height;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        const skill1 = skillsData[i % skillsData.length];
        const skill2 = skillsData[(i + 3) % skillsData.length];

        // Node 1
        const m1 = new THREE.Mesh(geometrySphere, new THREE.MeshStandardMaterial({ color: skill1.color, emissive: skill1.color, emissiveIntensity: 0.5 }));
        m1.position.set(x1, y, z1);
        m1.userData = skill1;
        group.add(m1);
        objects.push(m1);

        // Node 2
        const m2 = new THREE.Mesh(geometrySphere, new THREE.MeshStandardMaterial({ color: skill2.color, emissive: skill2.color, emissiveIntensity: 0.5 }));
        m2.position.set(x2, y, z2);
        m2.userData = skill2;
        group.add(m2);
        objects.push(m2);

        // Bond
        const dist = new THREE.Vector3(x1, y, z1).distanceTo(new THREE.Vector3(x2, y, z2));
        const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, dist, 8), materialBond);
        bond.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        bond.lookAt(x1, y, z1);
        bond.rotateX(Math.PI / 2);
        group.add(bond);
    }

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObj = null;

    // HUD Elements
    const hud = document.getElementById('dna-hud');
    const hudTitle = document.getElementById('hud-title');
    const hudLevel = document.getElementById('hud-level');
    const hudDesc = document.getElementById('hud-desc');

    // Use renderer element to ensure we catch events on the canvas specifically
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);

    function onMouseMove(event) {
        event.preventDefault();
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

        // HUD Positioning
        if (hud) {
            const cx = event.clientX + 20;
            const cy = event.clientY + 20;
            hud.style.left = `${cx}px`;
            hud.style.top = `${cy}px`;

            // Simple boundary check
            if (cx + 250 > window.innerWidth) hud.style.left = `${event.clientX - 260}px`;
            if (cy + 150 > window.innerHeight) hud.style.top = `${event.clientY - 160}px`;
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.003; // Slower rotation for better UX

        // Raycasting
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            // If hitting a new object
            if (hoveredObj !== intersects[0].object) {
                // Reset previous
                if (hoveredObj) {
                    hoveredObj.scale.setScalar(1);
                    hoveredObj.material.emissiveIntensity = 0.5;
                }

                // Set new
                hoveredObj = intersects[0].object;
                document.body.style.cursor = 'pointer';

                // Highlight
                hoveredObj.scale.setScalar(1.8);
                hoveredObj.material.emissiveIntensity = 1.2;

                // Update HUD
                if (hud) {
                    hud.style.opacity = '1';
                    hudTitle.innerText = hoveredObj.userData.name;
                    hudLevel.innerText = hoveredObj.userData.level;
                    hudDesc.innerText = hoveredObj.userData.desc;
                }
            }
        } else {
            if (hoveredObj) {
                hoveredObj.scale.setScalar(1);
                hoveredObj.material.emissiveIntensity = 0.5;
                hoveredObj = null;
                document.body.style.cursor = 'default';
                if (hud) hud.style.opacity = '0';
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
