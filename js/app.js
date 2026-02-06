// Main Application - Creative Director Hub

import { BRAND_NAME, BRAND_COLOR } from './config.js';

// Tab modules
import { initDailyBriefing } from './tabs/daily-briefing.js';
import { initPerformance } from './tabs/performance.js';
import { initFatigueTracker } from './tabs/fatigue-tracker.js';
import { initTestLog } from './tabs/test-log.js';
import { initCreativeMix } from './tabs/creative-mix.js';
import { initCompetitorIntel } from './tabs/competitor-intel.js';
import { initTrending } from './tabs/trending.js';
import { initAudienceIntel } from './tabs/audience-intel.js';
import { initCommentMining } from './tabs/comment-mining.js';
import { initOfferMatrix } from './tabs/offer-matrix.js';
import { initPlatformPlaybook } from './tabs/platform-playbook.js';

// Navigation items configuration
const navItems = [
    { id: 'daily-briefing', label: 'Daily Briefing', icon: '☀️', init: initDailyBriefing },
    { id: 'performance', label: 'Performance', icon: '📊', init: initPerformance },
    { id: 'fatigue-tracker', label: 'Fatigue Tracker', icon: '⚡', init: initFatigueTracker },
    { id: 'test-log', label: 'Test Log', icon: '🧪', init: initTestLog },
    { id: 'creative-mix', label: 'Creative Mix', icon: '🎬', init: initCreativeMix },
    { id: 'competitor-intel', label: 'Competitor Intel', icon: '🔍', init: initCompetitorIntel },
    { id: 'trending', label: 'Trending Now', icon: '🔥', init: initTrending },
    { id: 'audience-intel', label: 'Audience Intel', icon: '🧠', init: initAudienceIntel },
    { id: 'comment-mining', label: 'Comment Mining', icon: '💬', init: initCommentMining },
    { id: 'offer-matrix', label: 'Offer Matrix', icon: '🎯', init: initOfferMatrix },
    { id: 'platform-playbook', label: 'Platform Playbook', icon: '📱', init: initPlatformPlaybook }
];

// Current active tab
let activeTab = 'daily-briefing';

// Initialize the application
function init() {
    renderSidebar();
    renderMainContent();
    setupEventListeners();
    
    // Navigate to initial tab (from URL hash or default)
    const initialTab = window.location.hash.slice(1) || 'daily-briefing';
    navigateTo(initialTab);
}

// Render sidebar navigation
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo">FA</div>
            <span class="sidebar-title">${BRAND_NAME}</span>
        </div>
        <nav class="sidebar-nav">
            ${navItems.map(item => `
                <a href="#${item.id}" class="nav-item" data-tab="${item.id}">
                    <span class="icon">${item.icon}</span>
                    <span class="label">${item.label}</span>
                </a>
            `).join('')}
        </nav>
        <div class="sidebar-toggle">
            <button class="toggle-btn" id="toggleSidebar">
                <span class="icon">◀</span>
            </button>
        </div>
    `;
}

// Render main content area with tab containers
function renderMainContent() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="content-wrapper">
            ${navItems.map(item => `
                <div id="tab-${item.id}" class="tab-content"></div>
            `).join('')}
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            navigateTo(tabId);
        });
    });
    
    // Sidebar toggle
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        const icon = document.querySelector('#toggleSidebar .icon');
        icon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    });
    
    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const tabId = window.location.hash.slice(1) || 'daily-briefing';
        if (tabId !== activeTab) {
            navigateTo(tabId, false);
        }
    });
}

// Navigate to a tab
function navigateTo(tabId, updateHash = true) {
    const tabConfig = navItems.find(item => item.id === tabId);
    if (!tabConfig) {
        console.error(`Tab not found: ${tabId}`);
        return;
    }
    
    // Update active states
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
    
    // Update URL hash
    if (updateHash) {
        window.location.hash = tabId;
    }
    
    // Initialize tab content if needed
    const tabContainer = document.getElementById(`tab-${tabId}`);
    if (tabContainer && !tabContainer.dataset.initialized) {
        tabConfig.init(tabContainer);
        tabContainer.dataset.initialized = 'true';
    }
    
    activeTab = tabId;
}

// Export for external use
export { navigateTo, activeTab };

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
