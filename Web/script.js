// Architecture Decoded - Content Structure
const structure = [
    { id: 'readme', path: '../README.md', title: 'Introduction', group: 'Overview' },
    { id: 'ch01-architecture', path: '../book/ch01-architecture.md', title: 'The Architecture of an AI Agent', group: 'Part I: Foundations' },
    { id: 'ch02-bootstrap', path: '../book/ch02-bootstrap.md', title: 'Starting Fast — The Bootstrap Pipeline', group: 'Part I: Foundations' },
    { id: 'ch03-state', path: '../book/ch03-state.md', title: 'State — The Two-Tier Architecture', group: 'Part I: Foundations' },
    { id: 'ch04-api-layer', path: '../book/ch04-api-layer.md', title: 'Talking to Claude — The API Layer', group: 'Part I: Foundations' },
    { id: 'ch05-agent-loop', path: '../book/ch05-agent-loop.md', title: 'The Agent Loop', group: 'Part II: The Core Loop' },
    { id: 'ch06-tools', path: '../book/ch06-tools.md', title: 'Tools — From Definition to Execution', group: 'Part II: The Core Loop' },
    { id: 'ch07-concurrency', path: '../book/ch07-concurrency.md', title: 'Concurrent Tool Execution', group: 'Part II: The Core Loop' },
    { id: 'ch08-sub-agents', path: '../book/ch08-sub-agents.md', title: 'Spawning Sub-Agents', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch09-fork-agents', path: '../book/ch09-fork-agents.md', title: 'Fork Agents and the Prompt Cache', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch10-coordination', path: '../book/ch10-coordination.md', title: 'Tasks, Coordination, and Swarms', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch11-memory', path: '../book/ch11-memory.md', title: 'Memory — Learning Across Conversations', group: 'Part IV: Persistence and Intelligence' },
    { id: 'ch12-extensibility', path: '../book/ch12-extensibility.md', title: 'Extensibility — Skills and Hooks', group: 'Part IV: Persistence and Intelligence' },
    { id: 'ch13-terminal-ui', path: '../book/ch13-terminal-ui.md', title: 'The Terminal UI', group: 'Part V: The Interface' },
    { id: 'ch14-input-interaction', path: '../book/ch14-input-interaction.md', title: 'Input and Interaction', group: 'Part V: The Interface' },
    { id: 'ch15-mcp', path: '../book/ch15-mcp.md', title: 'MCP — The Universal Tool Protocol', group: 'Part VI: Connectivity' },
    { id: 'ch16-remote', path: '../book/ch16-remote.md', title: 'Remote Control and Cloud Execution', group: 'Part VI: Connectivity' },
    { id: 'ch17-performance', path: '../book/ch17-performance.md', title: 'Performance', group: 'Part VII: Performance Engineering' },
    { id: 'ch18-epilogue', path: '../book/ch18-epilogue.md', title: 'Epilogue — What We Learned', group: 'Part VII: Performance Engineering' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initMobileMenu();
    initThemeDetector();
    
    // Handle initial route
    handleRoute();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);
});

function initSidebar() {
    const nav = document.getElementById('sidebar-nav');
    let currentGroup = '';
    
    structure.forEach((item) => {
        if (item.group !== currentGroup) {
            currentGroup = item.group;
            const groupTitle = document.createElement('div');
            groupTitle.className = 'nav-group-title';
            groupTitle.textContent = currentGroup;
            nav.appendChild(groupTitle);
        }
        
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.className = 'nav-item';
        link.textContent = item.title;
        link.id = `nav-${item.id}`;
        
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
        
        nav.appendChild(link);
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
    if (sidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Watch for system theme changes specifically for mermaid re-renders if necessary
function initThemeDetector() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Just reload current view to re-render mermaid with correct theme
        handleRoute();
    });
}

function handleRoute() {
    let hash = window.location.hash.slice(1);
    
    // Default to readme if no hash or invalid hash
    if (!hash || !structure.find(c => c.id === hash)) {
        hash = 'readme';
        // Only update hash without triggering another event if it's not present
        if (!window.location.hash) {
            window.history.replaceState(null, null, `#${hash}`);
        }
    }
    
    loadContent(hash);
    updateSidebarActive(hash);
}

function updateSidebarActive(id) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`nav-${id}`);
    if (activeItem) {
        activeItem.classList.add('active');
        // Scroll sidebar to show active item if out of view
        const sidebar = document.getElementById('sidebar');
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const sidebarScrollTop = sidebar.scrollTop;
        const sidebarHeight = sidebar.offsetHeight;
        
        if (itemTop < sidebarScrollTop || itemBottom > sidebarScrollTop + sidebarHeight) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function getIsDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

async function loadContent(chapterId) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <div class="loading">
            <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
            <p>Loading document...</p>
        </div>
    `;
    
    const chapterIndex = structure.findIndex(c => c.id === chapterId);
    const chapter = structure[chapterIndex];
    
    // Set page title
    document.title = `${chapter.title} - Architecture Decoded`;
    
    try {
        const response = await fetch(chapter.path);
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: Failed to load file`);
        }
        const markdown = await response.text();
        
        // Parse markdown with marked.js
        const html = marked.parse(markdown, {
            gfm: true,
            breaks: true
        });
        
        contentDiv.innerHTML = html;
        
        // Post-process the DOM
        processDomLinks(contentDiv);
        processDomImages(contentDiv);
        await processCodeBlocks(contentDiv);
        
        // Update nav buttons
        updateNavButtons(chapterIndex);
        
        // Scroll to top
        window.scrollTo(0, 0);

    } catch (e) {
        contentDiv.innerHTML = `
            <h2>Error Loading Content</h2>
            <p>Could not load <strong>${chapter.title}</strong>.</p>
            <blockquote style="border-left-color: #f44336;">
                <p><strong>Note:</strong> If you are opening this file locally directly in the browser (using file:// protocol), CORS policies will block loading external Markdown files.</p>
                <p>Please run a local web server from the project directory. For example:</p>
                <pre><code>python -m http.server 8000</code></pre>
                <p>Then navigate to <a href="http://localhost:8000/Web/">http://localhost:8000/Web/</a></p>
            </blockquote>
            <p>Error details: <code>${e.message}</code></p>
        `;
        document.getElementById('page-nav').style.display = 'none';
        console.error('Content Load Error:', e);
    }
}

function processDomLinks(container) {
    container.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        
        // Convert internal book links to hash routes
        if (href.includes('./book/')) {
            const newId = href.split('/').pop().replace('.md', '');
            a.setAttribute('href', `#${newId}`);
        } else if (href.endsWith('.md')) {
            const newId = href.split('/').pop().replace('.md', '');
            if (structure.find(s => s.id === newId)) {
                a.setAttribute('href', `#${newId}`);
            }
        } else if (href.startsWith('http')) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function processDomImages(container) {
    container.querySelectorAll('img').forEach(img => {
        let src = img.getAttribute('src');
        if (!src) return;
        
        if (!src.startsWith('http') && !src.startsWith('data:')) {
            // Fix relative paths (knowing we are in /Web/ folder)
            if (src.startsWith('./')) {
                img.setAttribute('src', '../' + src.substring(2));
            } else if (!src.startsWith('../')) {
                img.setAttribute('src', '../' + src);
            }
        }
    });
}

async function processCodeBlocks(container) {
    // 1. Syntax Highlighting
    container.querySelectorAll('pre code:not(.language-mermaid)').forEach(block => {
        hljs.highlightElement(block);
    });

    // 2. Mermaid Diagrams
    const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid');
    
    if (mermaidCodeBlocks.length > 0) {
        // Initialize mermaid with correct theme
        const isDarkMode = getIsDarkMode();
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose'
        });

        // Convert DOM elements
        mermaidCodeBlocks.forEach((codeBlock, idx) => {
            const pre = codeBlock.parentElement;
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.textContent = codeBlock.textContent;
            
            // Generate a unique ID to avoid rendering collisions
            const id = `mermaid-chart-${Date.now()}-${idx}`;
            mermaidDiv.id = id;
            
            pre.parentNode.replaceChild(mermaidDiv, pre);
        });

        // Render all mermaid elements
        try {
            await mermaid.run({ querySelector: '.mermaid' });
        } catch (e) {
            console.error('Mermaid render error:', e);
            // Show raw mermaid code if render fails
            document.querySelectorAll('.mermaid').forEach(el => {
                if (!el.querySelector('svg')) {
                    el.style.whiteSpace = 'pre';
                    el.style.fontFamily = 'monospace';
                    el.style.overflowX = 'auto';
                }
            });
        }
    }
}

function updateNavButtons(currentIndex) {
    const pageNav = document.getElementById('page-nav');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    pageNav.style.display = 'flex';
    
    // Hide buttons by default
    prevBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    // Previous Page
    if (currentIndex > 0) {
        const prevChapter = structure[currentIndex - 1];
        document.getElementById('prev-title').textContent = prevChapter.title;
        prevBtn.href = `#${prevChapter.id}`;
        prevBtn.classList.remove('hidden');
    }
    
    // Next Page
    if (currentIndex < structure.length - 1) {
        const nextChapter = structure[currentIndex + 1];
        document.getElementById('next-title').textContent = nextChapter.title;
        nextBtn.href = `#${nextChapter.id}`;
        nextBtn.classList.remove('hidden');
    }
}
