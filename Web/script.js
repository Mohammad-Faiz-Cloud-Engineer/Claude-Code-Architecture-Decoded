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
    initZoomModal();
    initPWA();
    preventPullToRefresh();
    disableBrowserCache();
    
    // Handle initial route
    handleRoute();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);
});

// Disable browser caching - always fetch fresh content
function disableBrowserCache() {
    // Add cache-busting to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        let [resource, config] = args;
        
        // Add cache-busting parameter to URLs
        if (typeof resource === 'string') {
            const url = new URL(resource, window.location.href);
            if (url.origin === window.location.origin) {
                url.searchParams.set('_t', Date.now());
                resource = url.toString();
            }
        }
        
        // Force no-cache headers
        config = config || {};
        config.cache = 'no-store';
        config.headers = config.headers || {};
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
        
        return originalFetch.call(this, resource, config);
    };
}

// Prevent pull-to-refresh gesture on mobile
function preventPullToRefresh() {
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const y = e.touches[0].pageY;
        
        // Prevent pull-to-refresh if at top of page and pulling down
        if (window.scrollY === 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Additional prevention for overscroll
    document.body.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) return; // Allow pinch zoom
        
        const target = e.target;
        const scrollable = target.closest('.sidebar, .main-content, .zoom-modal-body');
        
        if (!scrollable) {
            e.preventDefault();
        }
    }, { passive: false });
}

// PWA Installation and Service Worker
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000); // Check every hour
                    
                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(() => {});
        });
    }
    
    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton(deferredPrompt);
    });
    
    // Track if app was installed
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallButton();
    });
}

function showInstallButton(deferredPrompt) {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Install App
    `;
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        
        deferredPrompt = null;
        hideInstallButton();
    });
    
    document.body.appendChild(installBtn);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        installBtn.classList.add('fade-out');
        setTimeout(() => hideInstallButton(), 300);
    }, 10000);
}

function hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
        <div class="pwa-update-content">
            <span>New version available!</span>
            <button id="pwa-reload-btn" class="pwa-reload-btn">Reload</button>
            <button id="pwa-dismiss-btn" class="pwa-dismiss-btn">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    document.getElementById('pwa-reload-btn').addEventListener('click', () => {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
    });
    
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        notification.remove();
    });
}

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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // Just reload current view to re-render mermaid with correct theme
        handleRoute();
    });
}

let panzoomInstance = null;

function initZoomModal() {
    const closeBtn = document.getElementById('close-zoom-modal');
    const elem = document.getElementById('zoom-content-wrapper');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');
    
    if (typeof Panzoom !== 'undefined' && elem) {
        panzoomInstance = Panzoom(elem, {
            maxScale: 5,
            canvas: true
        });
        
        elem.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);
        
        zoomIn.addEventListener('click', () => panzoomInstance.zoomIn());
        zoomOut.addEventListener('click', () => panzoomInstance.zoomOut());
        zoomReset.addEventListener('click', () => panzoomInstance.reset());
        
        closeBtn.addEventListener('click', closeZoomModal);
        
        elem.addEventListener('dblclick', () => panzoomInstance.reset());
    }
}

function openZoomModal(elementToClone) {
    const modal = document.getElementById('zoom-modal');
    const content = document.getElementById('zoom-content');
    
    content.innerHTML = '';
    const clone = elementToClone.cloneNode(true);
    
    if (clone.tagName.toLowerCase() === 'svg') {
        clone.style.maxWidth = '100%';
        clone.style.height = 'auto';
    }
    
    content.appendChild(clone);
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    if (panzoomInstance) {
        setTimeout(() => {
            // Check if modal is still open and panzoom instance exists
            if (panzoomInstance && !modal.classList.contains('hidden')) {
                panzoomInstance.reset();
            }
        }, 10);
    }
}

function closeZoomModal() {
    const modal = document.getElementById('zoom-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
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
        // Force fresh fetch with cache-busting
        const cacheBuster = `?_t=${Date.now()}`;
        const response = await fetch(chapter.path + cacheBuster, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
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
        
        // Wrap image and add fullscreen button
        const wrapper = document.createElement('div');
        wrapper.className = 'media-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        const btn = document.createElement('button');
        btn.className = 'fullscreen-btn';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> Expand`;
        btn.onclick = () => openZoomModal(img);
        wrapper.appendChild(btn);
    });
}

async function processCodeBlocks(container) {
    // 1. Syntax Highlighting
    container.querySelectorAll('pre code:not(.language-mermaid)').forEach(block => {
        hljs.highlightElement(block);
        
        // Add copy button to code blocks
        const pre = block.parentElement;
        if (!pre.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            copyBtn.setAttribute('aria-label', 'Copy code');
            
            copyBtn.addEventListener('click', async () => {
                const code = block.textContent;
                try {
                    await navigator.clipboard.writeText(code);
                    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
            
            pre.style.position = 'relative';
            pre.appendChild(copyBtn);
        }
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
            
            // Add fullscreen buttons after rendering completes
            document.querySelectorAll('.mermaid').forEach(el => {
                const btn = document.createElement('button');
                btn.className = 'fullscreen-btn';
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> Expand`;
                
                // Clicking expand extracts the SVG child
                btn.onclick = () => {
                    const svg = el.querySelector('svg');
                    if(svg) openZoomModal(svg);
                };
                el.appendChild(btn);
            });
        } catch (err) {
            console.error('Mermaid render error:', err);
            // Show raw mermaid code with error message if render fails
            document.querySelectorAll('.mermaid').forEach(el => {
                if (!el.querySelector('svg')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.style.padding = '1em';
                    errorDiv.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                    errorDiv.style.borderLeft = '3px solid #f44336';
                    errorDiv.style.marginBottom = '1em';
                    errorDiv.innerHTML = '<strong>Mermaid Diagram Error:</strong> Failed to render diagram. Raw code shown below.';
                    el.parentNode.insertBefore(errorDiv, el);
                    
                    el.style.whiteSpace = 'pre';
                    el.style.fontFamily = 'monospace';
                    el.style.overflowX = 'auto';
                    el.style.padding = '1em';
                    el.style.backgroundColor = 'var(--bg-code)';
                    el.style.borderRadius = '4px';
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
