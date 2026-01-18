// --- 1. DATA SOURCE (The 42 Works) ---
const rawWorks = [
    // 1. Research Paper (2026)
    { t: "Integrating Proximal Policy Optimization with Physically Realistic Simulation for Robust Autonomous Underwater Vehicle Control", cat: "Research Paper", y: "2026", src: "Gazi University Journal of Science", doi: "Review" },
    // 2. Research Paper (2025)
    { t: "Integrating Proximal Policy Optimization with Physically Realistic Simulation for Robust Autonomous Underwater Vehicle Control", cat: "Research Paper", y: "2025", src: "Gazi University", doi: "Review" },
    // 3. Research Paper (2025)
    { t: "A REVIEW ON MACHINE LEARNING APPROACH FOR TRACKING AND PREDICTING STUDENT PERFORMANCE", cat: "Research Paper", y: "2025", src: "UIJES", doi: "10.53414.UIJES.5.2.21" },
    // 4. Book (2025)
    { t: "Agentic AI: Understanding and Building Autonomous Intelligent Systems", cat: "Book", y: "2025", src: "Amazon", doi: "B0DV96JFYY" },
    // 5. Book Chapter (2025)
    { t: "AI Education Strategies for Future-Proofing Curriculum Design", cat: "Book", y: "2025", src: "Book Chapter", doi: "Review" },
    // 6. Book (2025)
    { t: "AI in Commerce: Transforming Business for the Digital Age", cat: "Book", y: "2025", src: "Amazon", doi: "B0F6VF52PS" },
    // 7. Book (2025)
    { t: "AI in E-Commerce: Revolutionizing Online Shopping", cat: "Book", y: "2025", src: "Amazon", doi: "B0F6T38NNL" },
    // 8. Book (2025)
    { t: "AI in Education: From Schooling to Research", cat: "Book", y: "2025", src: "Amazon", doi: "B0FMR2VFV8" },
    // 9. Book (2025)
    { t: "AI in the Classroom: From Chalkboards to Code", cat: "Book", y: "2025", src: "Amazon", doi: "B0DXVQFCP1" },
    // 10. Book (2025)
    { t: "Artificial Intelligence - Intellect Born from Intelligence", cat: "Book", y: "2025", src: "Amazon", doi: "978-81-983232-3-1" },
    // 11. Book (2025)
    { t: "Artificial Intelligence in Biomedical Research", cat: "Book", y: "2025", src: "Amazon", doi: "B0F4XTXTWN" },
    // 12. Book (2025)
    { t: "Augmented Creativity: The AI-Powered Revolution Reshaping the Next Generation", cat: "Book", y: "2025", src: "Amazon", doi: "Book" },
    // 13. Book (2025)
    { t: "Building Multi-Agent Systems using HuggingFace Models", cat: "Book", y: "2025", src: "Amazon", doi: "B0F2T9DXR3" },
    // 14. Book (2025)
    { t: "Data Mining: Concepts, Techniques, and Applications", cat: "Book", y: "2025", src: "Amazon", doi: "B0FQT45KWF" },
    // 15. Book (2025)
    { t: "Digital Marketing Fundamentals", cat: "Book", y: "2025", src: "Amazon", doi: "978-81-980666-2-6" },
    // 16. Book (2025)
    { t: "Foundations of RAG: Retrieval-Augmented Generation with LLMs", cat: "Book", y: "2025", src: "Amazon", doi: "B0F61XXJX9" },
    // 17. Book (2025)
    { t: "Generative AI: Transforming Real-Life Applications Across Sectors", cat: "Book", y: "2025", src: "Amazon", doi: "B0DTJ17RML" },
    // 18. Book (2025)
    { t: "Human 2.0: The AI-Powered Evolution of Mind, Body, and Society", cat: "Book", y: "2025", src: "Amazon", doi: "B0F48LMTJW" },
    // 19. Book (2025)
    { t: "JavaScript in Action: 100 Practical Projects (Pothi)", cat: "Book", y: "2025", src: "Pothi", doi: "B0DVLMLVXR" },
    // 20. Book (2025)
    { t: "JavaScript in Action: 100 Practical Projects (Amazon)", cat: "Book", y: "2025", src: "Amazon", doi: "B0DVLMLVXR" },
    // 21. Book (2025)
    { t: "Journey with Python: Core Programming to Data Science and Al", cat: "Book", y: "2025", src: "Amazon", doi: "978-81-980666-6-4" },
    // 22. Book Chapter (2025)
    { t: "Leveraging Consciousness-Based Chatbots to Support Students Through Loss and Trauma", cat: "Book", y: "2025", src: "Book Chapter", doi: "9798337327525" },
    // 23. Book (2025)
    { t: "Linux Essentials 101: From Definition to Distribution Development", cat: "Book", y: "2025", src: "Amazon", doi: "3639763718" },
    // 24. Book (2025)
    { t: "MASTERING FULL-STACK WEB DEVELOPMENT WITH MEAN STACK", cat: "Book", y: "2025", src: "Amazon", doi: "B0F3P9HBXN" },
    // 25. Book (2025)
    { t: "Mastering Java Programming: From Basics to Advanced Concepts", cat: "Book", y: "2025", src: "Amazon", doi: "B0FBV64K8N" },
    // 26. Book (2025)
    { t: "Mastering UI Design: Principles, Practices, and Innovations", cat: "Book", y: "2025", src: "Amazon", doi: "B0DXVDY5DY" },
    // 27. Book (2025)
    { t: "Mini Projects Using Python", cat: "Book", y: "2025", src: "Amazon", doi: "B0FWRXWQV2" },
    // 28. Book (2025)
    { t: "No Code Development - Empowering Everyone to Build the Future", cat: "Book", y: "2025", src: "Amazon", doi: "978-81-983232-6-2" },
    // 29. Book (2025)
    { t: "Prompt Engineering", cat: "Book", y: "2025", src: "Amazon", doi: "978-81-980666-0-2" },
    // 30. Research Paper (2025)
    { t: "Quality of LLM-Mediated Communication in Disabled Learning", cat: "Research Paper", y: "2025", src: "Google Scholar", doi: "Journal Article" },
    // 31. Book (2025)
    { t: "Research Methodology and Intellectual Property Rights", cat: "Book", y: "2025", src: "Amazon", doi: "B0DWN7BRB1" },
    // 32. Book (2025)
    { t: "Social Network Analysis and Its Applications", cat: "Book", y: "2025", src: "Amazon", doi: "B0F8BPFKHY" },
    // 33. Book (2025)
    { t: "The Complete Guide to Web 3.0", cat: "Book", y: "2025", src: "Amazon", doi: "B0DTN28ZBG" },
    // 34. Book (2025)
    { t: "Transform Ideas into AI Projects: A Google AI Studio Guide", cat: "Book", y: "2025", src: "Amazon", doi: "B0F2GSWHSX" },
    // 35. Book (2025)
    { t: "Web Development Using HTML, CSS, and JavaScript", cat: "Book", y: "2025", src: "Amazon", doi: "B0DTHXGWGQ" },
    // 36. Research Paper (2024)
    { t: "An Analysis of Intrusion detection and penetration systems in the health care sector", cat: "Research Paper", y: "2024", src: "ICRIT-2024", doi: "Conference" },
    // 37. Research Paper (2024)
    { t: "Frontiers of Innovation in Deep Learning – Meta Learning", cat: "Research Paper", y: "2024", src: "ICRIT-2024", doi: "Conference" },
    // 38. Research Paper (2024)
    { t: "Local Language Model – Unveiling Potential of decentralized Intelligence", cat: "Research Paper", y: "2024", src: "ICRIT-2024", doi: "Conference" },
    // 39. Research Paper (2024)
    { t: "WRNN-Driven Detection Mechanisms for Hairy Cell Leukemia", cat: "Research Paper", y: "2024", src: "Unpublished", doi: "10.13140/RG.2.2.28151.23202" },
    // 40. Research Paper (2023)
    { t: "Recent Trends in Deep Learning Algorithms and Their Applications", cat: "Research Paper", y: "2023", src: "Emerging Trends", doi: "Conference" },
    // 41. Research Paper (2023)
    { t: "The Engineering Of AI- Enabled system is Distinct From Other Engineering Disciplines", cat: "Research Paper", y: "2023", src: "Emerging Trends", doi: "Conference" },
    // 42. Book (Added from bottom)
    { t: "Mastering Object-Oriented Software Engineering with UML and PlantUML", cat: "Book", y: "2025", src: "Amazon", doi: "B0DTTGBHZV" },

    // (Peer Reviews are typically not "Books" but included for completeness if requested, handled via filter)
    { t: "Peer review for IGI Global Book Chapter", cat: "Peer Review", y: "2025", src: "IGI Global", doi: "Verification" }
];

// --- 2. CONFIG & HELPERS ---
const config = {
    colors: {
        'Book': ['#5d4037', '#4e342e', '#3e2723', '#2d1b15'], // Browns
        'Research Paper': ['#1a237e', '#283593', '#303f9f', '#1565c0'], // Blues
        'Patent': ['#37474f', '#455a64', '#546e7a', '#607d8b'], // Metal/Greys
        'Peer Review': ['#1b5e20', '#2e7d32', '#388e3c', '#4caf50'] // Greens
    }
};

const works = rawWorks.map((w, i) => {
    const colors = config.colors[w.cat] || config.colors['Book'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const height = w.cat === 'Book' ? (240 + Math.random() * 40) : (220 + Math.random() * 20); // Books taller
    const thickness = w.cat === 'Book' ? 'thick' : 'thin';

    // Generate Link
    let link = "#";
    // Basic logic detection
    if (w.doi.startsWith("B0") || w.doi.startsWith("978")) link = `https://www.amazon.com/dp/${w.doi}`;
    else if (w.cat === 'Research Paper' && w.doi !== "Review" && w.doi !== "Conference" && w.doi !== "Journal Article" && w.doi !== "Verification" && !w.doi.includes('Unpublished')) {
        link = w.doi.includes('http') ? w.doi : `https://doi.org/${w.doi}`;
    }

    return { ...w, id: i, color, height, thickness, link };
});

// --- 3. RENDER LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    renderShelves(works);

    // Filter click listeners
    window.filterBooks = (category) => {
        const filtered = works.filter(w => {
            if (category === 'all') return true;
            return w.cat === category;
        });

        // Update Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('text-white', 'active');
            btn.classList.add('text-gray-400');
            if (btn.innerHTML.includes(category.toUpperCase()) || (category === 'all' && btn.innerHTML === 'ALL')) {
                btn.classList.add('text-white', 'active');
                btn.classList.remove('text-gray-400');
            }
        });

        renderShelves(filtered);
    }

    // Search listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = works.filter(w => w.t.toLowerCase().includes(term));
            renderShelves(filtered);
        });
    }
});

function renderShelves(data) {
    const container = document.getElementById('library-container');
    if (!container) return;

    container.innerHTML = '';

    document.getElementById('total-works').innerText = `${data.length} Works Displayed`;

    if (data.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 mt-20 font-serif italic">No works found in this section.</div>';
        return;
    }

    // Group into shelves of ~14 books
    const chunkSize = 14;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        createShelf(chunk, i);
    }
}

function createShelf(books, index) {
    const shelf = document.createElement('div');
    shelf.className = 'shelf-row';

    const labelText = getShelfLabel(index, books[0].cat);

    shelf.innerHTML = `
        <div class="shelf-label">${labelText}</div>
        <div class="books-grid">
            ${books.map((book) => createBookHTML(book)).join('')}
        </div>
        <div class="shelf-base"></div>
    `;
    container.appendChild(shelf);

    // Animate in
    if (typeof gsap !== 'undefined') {
        gsap.from(shelf.children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 });
    }
}

function createBookHTML(book) {
    return `
        <div class="book-container ${book.thickness}" 
                style="--book-height: ${book.height}px;"
                onmouseenter="showPopover(event, ${book.id})"
                onmouseleave="hidePopover(event)"
                onclick="handleBookClick(event, ${book.id})">
                
            <div class="book">
                <!-- Spine -->
                <div class="spine" style="background-color: ${book.color}; background-image: var(--leather-texture);">
                    <div class="spine-band"></div>
                    <div class="spine-title truncate">${book.t.substring(0, 45)}...</div>
                    <div class="spine-band bottom"></div>
                </div>
            </div>
        </div>
    `;
}

function getShelfLabel(index, type) {
    const map = {
        'Book': 'Published Volumes',
        'Research Paper': 'Journal & Conference Papers',
        'Peer Review': 'Editorial & Review',
        'Patent': 'Intellectual Property'
    };
    return `${map[type] || 'Collection'} - Shelf ${Math.floor(index / 14) + 1}`;
}

// --- 5. INTERACTION & VISUALIZATION ---
const popover = document.getElementById('popover');
let popoverTimeout; // Timer for hiding popover

// Click Action: Navigate
window.handleBookClick = (e, id) => {
    const w = works.find(item => item.id === id);
    if (!w) return;

    if (w.link && w.link !== "#") {
        window.open(w.link, '_blank');
    } else {
        // Fallback: Just show popover if no link (or ensure it's open)
        window.showPopover(e, id, true);
    }
};

// Hover Action: Show Details
window.showPopover = (e, id, force = false) => {
    clearTimeout(popoverTimeout);

    e.stopPropagation();
    const w = works.find(item => item.id === id);
    if (!w) return;

    // Positioning
    const target = e.target ? e.target.closest('.book-container') : null;
    if (target) {
        const rect = target.getBoundingClientRect();
        let left = rect.right + 20;
        let top = rect.top + window.scrollY - 50;

        const popWidth = 320;
        const popHeight = 400;
        const padding = 20;
        const scrollY = window.scrollY;

        if (left + popWidth > window.innerWidth - padding) left = rect.left - popWidth - 20;
        if (top + popHeight > window.innerHeight + scrollY - padding) top = (window.innerHeight + scrollY) - popHeight - padding;
        if (top < scrollY + 100) top = scrollY + 100;
        if (left < padding) left = padding;

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.zIndex = "9999";
    }

    // Content
    document.getElementById('popover-title').textContent = w.t;
    document.getElementById('popover-type').textContent = w.cat;
    document.getElementById('popover-year').textContent = w.y;
    document.getElementById('popover-source').textContent = w.src;
    document.getElementById('popover-doi').textContent = w.doi || "N/A";

    const btn = document.getElementById('popover-link');
    if (w.link && w.link !== "#") {
        btn.href = w.link;
        btn.classList.remove('opacity-50', 'pointer-events-none');
        btn.innerHTML = `<i class="fas fa-external-link-alt mr-2"></i>CLICK BOOK TO OPEN`;
    } else {
        btn.href = "#";
        btn.classList.add('opacity-50', 'pointer-events-none');
        btn.innerText = "LINK UNAVAILABLE";
    }

    popover.classList.add('active');

    // Render Network (Debounced)
    if (!popover.dataset.currentId || popover.dataset.currentId != id) {
        popover.dataset.currentId = id;
        setTimeout(() => { try { renderNetwork(w); } catch (e) { } }, 50);
    }
};

window.hidePopover = (e) => {
    popoverTimeout = setTimeout(() => {
        if (popover) popover.classList.remove('active');
    }, 400);
};

window.closePopover = (e) => {
    if (e && e.target.closest('#popover')) return;
    if (popover) popover.classList.remove('active');
};

// --- 6. D3 NETWORK (Co-Author) ---
function renderNetwork(work) {
    const container = document.getElementById('network-viz');
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 150;

    const stopWords = ['with', 'using', 'based', 'from', 'review', 'analysis', 'approach', 'system', 'study', 'towards', 'model', 'data'];
    const keywords = work.t.split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z]/g, ''))
        .filter(w => w.length > 4 && !stopWords.includes(w.toLowerCase()))
        .slice(0, 5);

    const nodes = [
        { id: "Sai Karun", group: 1, r: 6 },
        ...keywords.map(k => ({ id: k, group: 2, r: 4 }))
    ];

    if (nodes.length < 3) nodes.push({ id: "Research", group: 2, r: 4 });

    const links = nodes.slice(1).map(n => ({ source: "Sai Karun", target: n.id }));

    const svg = d3.select("#network-viz").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(10));

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("stroke", "#d4af37")
        .attr("stroke-opacity", 0.3);

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => d.r)
        .attr("fill", d => d.group === 1 ? "#d4af37" : "#2d1b15")
        .attr("stroke", "#d4af37")
        .attr("stroke-width", 1);

    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id)
        .attr("font-size", "8px")
        .attr("fill", "#888")
        .attr("text-anchor", "middle")
        .attr("dy", -8)
        .style("pointer-events", "none");

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
}
