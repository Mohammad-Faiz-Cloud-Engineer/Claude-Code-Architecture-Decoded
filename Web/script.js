// Architecture Decoded - Content Structure
// Detect if running on GitHub Pages and adjust paths accordingly
const isGitHubPages = window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '.' : '..';

const structure = [
    { id: 'readme', path: `${basePath}/README.md`, title: 'Introduction', group: 'Overview' },
    { id: 'ch01-architecture', path: `${basePath}/book/ch01-architecture.md`, title: 'The Architecture of an AI Agent', group: 'Part I: Foundations' },
    { id: 'ch02-bootstrap', path: `${basePath}/book/ch02-bootstrap.md`, title: 'Starting Fast — The Bootstrap Pipeline', group: 'Part I: Foundations' },
    { id: 'ch03-state', path: `${basePath}/book/ch03-state.md`, title: 'State — The Two-Tier Architecture', group: 'Part I: Foundations' },
    { id: 'ch04-api-layer', path: `${basePath}/book/ch04-api-layer.md`, title: 'Talking to Claude — The API Layer', group: 'Part I: Foundations' },
    { id: 'ch05-agent-loop', path: `${basePath}/book/ch05-agent-loop.md`, title: 'The Agent Loop', group: 'Part II: The Core Loop' },
    { id: 'ch06-tools', path: `${basePath}/book/ch06-tools.md`, title: 'Tools — From Definition to Execution', group: 'Part II: The Core Loop' },
    { id: 'ch07-concurrency', path: `${basePath}/book/ch07-concurrency.md`, title: 'Concurrent Tool Execution', group: 'Part II: The Core Loop' },
    { id: 'ch08-sub-agents', path: `${basePath}/book/ch08-sub-agents.md`, title: 'Spawning Sub-Agents', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch09-fork-agents', path: `${basePath}/book/ch09-fork-agents.md`, title: 'Fork Agents and the Prompt Cache', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch10-coordination', path: `${basePath}/book/ch10-coordination.md`, title: 'Tasks, Coordination, and Swarms', group: 'Part III: Multi-Agent Orchestration' },
    { id: 'ch11-memory', path: `${basePath}/book/ch11-memory.md`, title: 'Memory — Learning Across Conversations', group: 'Part IV: Persistence and Intelligence' },
    { id: 'ch12-extensibility', path: `${basePath}/book/ch12-extensibility.md`, title: 'Extensibility — Skills and Hooks', group: 'Part IV: Persistence and Intelligence' },
    { id: 'ch13-terminal-ui', path: `${basePath}/book/ch13-terminal-ui.md`, title: 'The Terminal UI', group: 'Part V: The Interface' },
    { id: 'ch14-input-interaction', path: `${basePath}/book/ch14-input-interaction.md`, title: 'Input and Interaction', group: 'Part V: The Interface' },
    { id: 'ch15-mcp', path: `${basePath}/book/ch15-mcp.md`, title: 'MCP — The Universal Tool Protocol', group: 'Part VI: Connectivity' },
    { id: 'ch16-remote', path: `${basePath}/book/ch16-remote.md`, title: 'Remote Control and Cloud Execution', group: 'Part VI: Connectivity' },
    { id: 'ch17-performance', path: `${basePath}/book/ch17-performance.md`, title: 'Performance', group: 'Part VII: Performance Engineering' },
    { id: 'ch18-epilogue', path: `${basePath}/book/ch18-epilogue.md`, title: 'Epilogue — What We Learned', group: 'Part VII: Performance Engineering' }
];

// Constants
const TIMING = {
    SW_UPDATE_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour
    INSTALL_BUTTON_AUTO_HIDE: 10000, // 10 seconds
    COPY_SUCCESS_DISPLAY: 2000, // 2 seconds
    PANZOOM_RESET_DELAY: 10 // 10ms
};

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

// Disable browser caching for markdown content
function disableBrowserCache() {
    const originalFetch = window.fetch;
    window.fetch = function(resource, config) {
        // Add cache-busting only to markdown files to ensure fresh content
        if (typeof resource === 'string' && resource.endsWith('.md')) {
            const separator = resource.includes('?') ? '&' : '?';
            resource = `${resource}${separator}_cb=${Date.now()}`;
        }
        
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
                    }, TIMING.SW_UPDATE_CHECK_INTERVAL);
                    
                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    // Service worker registration failed - app will still work without it
                    // Only log in development
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.warn('Service Worker registration failed:', error);
                    }
                });
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
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
    svg.appendChild(path);
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '7 10 12 15 17 10');
    svg.appendChild(polyline);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '12');
    line.setAttribute('y1', '15');
    line.setAttribute('x2', '12');
    line.setAttribute('y2', '3');
    svg.appendChild(line);
    
    installBtn.appendChild(svg);
    
    const text = document.createTextNode(' Install App');
    installBtn.appendChild(text);
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        
        deferredPrompt = null;
        hideInstallButton();
    });
    
    document.body.appendChild(installBtn);
    
    // Auto-hide after timeout
    setTimeout(() => {
        installBtn.classList.add('fade-out');
        setTimeout(() => hideInstallButton(), 300);
    }, TIMING.INSTALL_BUTTON_AUTO_HIDE);
}

function hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'pwa-update-content';
    
    const message = document.createElement('span');
    message.textContent = 'New version available!';
    contentDiv.appendChild(message);
    
    const reloadBtn = document.createElement('button');
    reloadBtn.id = 'pwa-reload-btn';
    reloadBtn.className = 'pwa-reload-btn';
    reloadBtn.textContent = 'Reload';
    contentDiv.appendChild(reloadBtn);
    
    const dismissBtn = document.createElement('button');
    dismissBtn.id = 'pwa-dismiss-btn';
    dismissBtn.className = 'pwa-dismiss-btn';
    dismissBtn.textContent = '×';
    contentDiv.appendChild(dismissBtn);
    
    notification.appendChild(contentDiv);
    document.body.appendChild(notification);
    
    reloadBtn.addEventListener('click', () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    });
    
    dismissBtn.addEventListener('click', () => {
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
        try {
            panzoomInstance = Panzoom(elem, {
                maxScale: 5,
                canvas: true
            });
            
            elem.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);
            
            if (zoomIn) zoomIn.addEventListener('click', () => panzoomInstance.zoomIn());
            if (zoomOut) zoomOut.addEventListener('click', () => panzoomInstance.zoomOut());
            if (zoomReset) zoomReset.addEventListener('click', () => panzoomInstance.reset());
            
            if (closeBtn) closeBtn.addEventListener('click', closeZoomModal);
            
            elem.addEventListener('dblclick', () => {
                if (panzoomInstance) {
                    panzoomInstance.reset();
                }
            });
        } catch (error) {
            // Panzoom initialization failed - zoom modal will still work without pan/zoom
            if (closeBtn) closeBtn.addEventListener('click', closeZoomModal);
        }
    } else if (closeBtn) {
        // Panzoom not available - basic modal functionality only
        closeBtn.addEventListener('click', closeZoomModal);
    }
}

function openZoomModal(elementToClone) {
    const modal = document.getElementById('zoom-modal');
    const content = document.getElementById('zoom-content');
    
    if (!elementToClone) {
        console.error('No element provided to zoom modal');
        return;
    }
    
    content.textContent = '';
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
            if (panzoomInstance && !modal.classList.contains('hidden')) {
                try {
                    panzoomInstance.reset();
                } catch (error) {
                    console.error('Panzoom reset failed:', error);
                }
            }
        }, TIMING.PANZOOM_RESET_DELAY);
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
        const response = await fetch(chapter.path);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        const isNetworkError = error.name === 'TypeError' || errorMessage.includes('Failed to fetch');
        
        contentDiv.innerHTML = `
            <h2>Error Loading Content</h2>
            <p>Could not load <strong>${chapter.title}</strong>.</p>
            ${isNetworkError ? `
            <blockquote style="border-left-color: #f44336;">
                <p><strong>Network Error:</strong> Unable to fetch the content file.</p>
                ${window.location.protocol === 'file:' ? `
                <p><strong>Note:</strong> You are viewing this page using the file:// protocol. Modern browsers block loading external files for security reasons.</p>
                <p>Please run a local web server from the project directory:</p>
                <pre><code>python -m http.server 8000</code></pre>
                <p>Then navigate to <a href="http://localhost:8000/Web/">http://localhost:8000/Web/</a></p>
                ` : `
                <p>Please check your internet connection and try again.</p>
                <p>If the problem persists, the content file may be temporarily unavailable.</p>
                `}
            </blockquote>
            ` : `
            <blockquote style="border-left-color: #f44336;">
                <p><strong>Error details:</strong> ${errorMessage}</p>
            </blockquote>
            `}
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
        `;
        document.getElementById('page-nav').style.display = 'none';
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
            // Fix relative paths for GitHub Pages or local
            if (isGitHubPages) {
                // On GitHub Pages, files are in same directory level
                if (src.startsWith('./')) {
                    img.setAttribute('src', src);
                } else if (!src.startsWith('/')) {
                    img.setAttribute('src', `./${src}`);
                }
            } else {
                // Local development - use relative paths from Web folder
                if (src.startsWith('./')) {
                    img.setAttribute('src', '../' + src.substring(2));
                } else if (!src.startsWith('../')) {
                    img.setAttribute('src', '../' + src);
                }
            }
        }
        
        // Wrap image and add fullscreen button
        const wrapper = document.createElement('div');
        wrapper.className = 'media-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        const btn = document.createElement('button');
        btn.className = 'fullscreen-btn';
        btn.setAttribute('aria-label', 'Expand image');
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3');
        svg.appendChild(path);
        
        btn.appendChild(svg);
        btn.appendChild(document.createTextNode(' Expand'));
        btn.onclick = () => openZoomModal(img);
        wrapper.appendChild(btn);
    });
}

async function processCodeBlocks(container) {
    // 1. Syntax Highlighting
    const codeBlocks = container.querySelectorAll('pre code:not(.language-mermaid)');
    codeBlocks.forEach(block => {
        hljs.highlightElement(block);
        
        // Add copy button to code blocks
        const pre = block.parentElement;
        if (!pre.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy code');
            
            const createCopyIcon = () => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '16');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('stroke-width', '2');
                
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', '9');
                rect.setAttribute('y', '9');
                rect.setAttribute('width', '13');
                rect.setAttribute('height', '13');
                rect.setAttribute('rx', '2');
                rect.setAttribute('ry', '2');
                svg.appendChild(rect);
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
                svg.appendChild(path);
                
                return svg;
            };
            
            const createCheckIcon = () => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '16');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('stroke-width', '2');
                
                const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                polyline.setAttribute('points', '20 6 9 17 4 12');
                svg.appendChild(polyline);
                
                return svg;
            };
            
            copyBtn.appendChild(createCopyIcon());
            
            copyBtn.addEventListener('click', async () => {
                const code = block.textContent;
                try {
                    await navigator.clipboard.writeText(code);
                    copyBtn.textContent = '';
                    copyBtn.appendChild(createCheckIcon());
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = '';
                        copyBtn.appendChild(createCopyIcon());
                        copyBtn.classList.remove('copied');
                    }, TIMING.COPY_SUCCESS_DISPLAY);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                    copyBtn.textContent = '✗';
                    setTimeout(() => {
                        copyBtn.textContent = '';
                        copyBtn.appendChild(createCopyIcon());
                    }, TIMING.COPY_SUCCESS_DISPLAY);
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
                btn.setAttribute('aria-label', 'Expand diagram');
                
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '14');
                svg.setAttribute('height', '14');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('stroke-width', '2');
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3');
                svg.appendChild(path);
                
                btn.appendChild(svg);
                btn.appendChild(document.createTextNode(' Expand'));
                
                // Clicking expand extracts the SVG child
                btn.onclick = () => {
                    const svg = el.querySelector('svg');
                    if (svg) {
                        openZoomModal(svg);
                    } else {
                        console.error('No SVG found in mermaid diagram');
                    }
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
