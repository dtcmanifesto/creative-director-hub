// Platform Playbook Tab
import { db } from '../firebase.js';
import { formatDate } from '../utils/helpers.js';

const PLATFORMS = ['meta', 'tiktok', 'youtube'];
const SECTIONS = ['best-practices', 'specs', 'trends', 'algorithm', 'rules'];

export async function initPlatformPlaybook(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">📱 Platform Playbook</h1>
            <p class="page-subtitle">Platform-specific intelligence — what works where and why</p>
        </div>
        
        <!-- Platform Cards -->
        <section>
            <div class="card-grid" style="grid-template-columns: repeat(3, 1fr); gap: 24px;" id="platformCards">
                ${PLATFORMS.map(platform => `
                    <div class="card" id="platform-${platform}">
                        <div class="flex justify-between items-center mb-4">
                            <h2 style="display:flex;align-items:center;gap:8px;">
                                ${getPlatformIcon(platform)}
                                ${platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </h2>
                            <button class="btn btn-secondary btn-sm" data-edit-platform="${platform}">Edit</button>
                        </div>
                        
                        <!-- Sections -->
                        ${SECTIONS.map(section => `
                            <div class="platform-section mb-4" id="${platform}-${section}">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">
                                        ${formatSectionTitle(section)}
                                    </h4>
                                </div>
                                <div class="section-content text-secondary" style="font-size:13px;">
                                    Loading...
                                </div>
                            </div>
                        `).join('')}
                        
                        <div class="text-muted mt-4" style="font-size:11px;" id="${platform}-updated">
                            Last updated: -
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        
        <!-- Comparison View -->
        <section class="mt-6">
            <h2>📊 Platform Performance Comparison</h2>
            <div class="card" id="platformComparison">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Edit Platform Modal -->
        <div class="modal-overlay" id="platformModal">
            <div class="modal" style="max-width:700px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="platformModalTitle">Edit Platform Notes</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
                    <form id="platformForm">
                        <input type="hidden" name="platform">
                        
                        ${SECTIONS.map(section => `
                            <div class="form-group">
                                <label class="form-label">${formatSectionTitle(section)}</label>
                                <textarea class="form-textarea" name="${section}" rows="4" 
                                    placeholder="Enter ${formatSectionTitle(section).toLowerCase()} notes (Markdown supported)..."></textarea>
                            </div>
                        `).join('')}
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="savePlatformBtn">Save All</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadPlatformData();
}

function setupEventListeners(container) {
    const modal = container.querySelector('#platformModal');
    
    // Edit buttons
    container.querySelectorAll('[data-edit-platform]').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.editPlatform;
            openEditModal(platform);
        });
    });
    
    // Close modal
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Save
    container.querySelector('#savePlatformBtn').addEventListener('click', async () => {
        const form = container.querySelector('#platformForm');
        const formData = new FormData(form);
        const platform = formData.get('platform');
        
        try {
            // Save each section
            for (const section of SECTIONS) {
                const content = formData.get(section);
                
                // Check if note exists
                const existing = await db.fetch('platform_notes', {
                    filters: [
                        { column: 'platform', value: platform },
                        { column: 'section', value: section }
                    ]
                });
                
                if (existing.length > 0) {
                    await db.update('platform_notes', existing[0].id, { content });
                } else if (content) {
                    await db.insert('platform_notes', { platform, section, content });
                }
            }
            
            modal.classList.remove('active');
            loadPlatformData();
        } catch (error) {
            alert('Error saving platform notes: ' + error.message);
        }
    });
}

async function loadPlatformData() {
    try {
        // Fetch all platform notes
        const notes = await db.fetch('platform_notes', {});
        
        // Fetch creatives for performance stats
        const creatives = await db.fetch('creatives', {
            filters: [{ column: 'status', value: 'active' }]
        });
        
        // Group notes by platform
        const notesByPlatform = {};
        notes.forEach(note => {
            if (!notesByPlatform[note.platform]) {
                notesByPlatform[note.platform] = {};
            }
            notesByPlatform[note.platform][note.section] = note;
        });
        
        // Update each platform card
        PLATFORMS.forEach(platform => {
            const platformNotes = notesByPlatform[platform] || {};
            let latestUpdate = null;
            
            SECTIONS.forEach(section => {
                const note = platformNotes[section];
                const contentEl = document.querySelector(`#${platform}-${section} .section-content`);
                
                if (note?.content) {
                    contentEl.innerHTML = renderMarkdown(note.content);
                    if (!latestUpdate || new Date(note.updated_at) > new Date(latestUpdate)) {
                        latestUpdate = note.updated_at;
                    }
                } else {
                    contentEl.innerHTML = '<span class="text-muted">Not yet documented</span>';
                }
            });
            
            // Update timestamp
            const updatedEl = document.querySelector(`#${platform}-updated`);
            updatedEl.textContent = latestUpdate 
                ? `Last updated: ${formatDate(latestUpdate, 'long')}`
                : 'Last updated: Never';
        });
        
        // Platform comparison
        const comparisonEl = document.getElementById('platformComparison');
        const platformStats = {};
        
        PLATFORMS.forEach(platform => {
            const platformCreatives = creatives.filter(c => c.platform === platform);
            const totalSpend = platformCreatives.reduce((sum, c) => sum + (parseFloat(c.spend) || 0), 0);
            const totalRevenue = platformCreatives.reduce((sum, c) => sum + ((parseFloat(c.spend) || 0) * (parseFloat(c.roas) || 0)), 0);
            
            platformStats[platform] = {
                count: platformCreatives.length,
                spend: totalSpend,
                avgRoas: totalSpend > 0 ? (totalRevenue / totalSpend) : 0
            };
        });
        
        comparisonEl.innerHTML = `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Active Creatives</th>
                            <th>Total Spend</th>
                            <th>Avg ROAS</th>
                            <th>Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${PLATFORMS.map(platform => {
                            const stats = platformStats[platform];
                            const roasColor = stats.avgRoas >= 2.5 ? 'var(--success)' 
                                : stats.avgRoas >= 1.5 ? 'var(--warning)' 
                                : 'var(--danger)';
                            
                            return `
                                <tr>
                                    <td style="font-weight:500;">
                                        ${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </td>
                                    <td class="mono">${stats.count}</td>
                                    <td class="mono">$${stats.spend.toLocaleString()}</td>
                                    <td class="mono" style="color:${roasColor};">${stats.avgRoas.toFixed(2)}x</td>
                                    <td>
                                        <div style="width:100px;height:8px;background:var(--bg-light);border-radius:4px;overflow:hidden;">
                                            <div style="width:${Math.min(stats.avgRoas / 3 * 100, 100)}%;height:100%;background:${roasColor};"></div>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading platform data:', error);
    }
}

async function openEditModal(platform) {
    const notes = await db.fetch('platform_notes', {
        filters: [{ column: 'platform', value: platform }]
    });
    
    const notesBySection = {};
    notes.forEach(n => notesBySection[n.section] = n.content);
    
    const form = document.querySelector('#platformForm');
    form.querySelector('[name="platform"]').value = platform;
    
    SECTIONS.forEach(section => {
        form.querySelector(`[name="${section}"]`).value = notesBySection[section] || '';
    });
    
    document.querySelector('#platformModalTitle').textContent = 
        `Edit ${platform.charAt(0).toUpperCase() + platform.slice(1)} Notes`;
    document.querySelector('#platformModal').classList.add('active');
}

function getPlatformIcon(platform) {
    const icons = {
        meta: '📘',
        tiktok: '🎵',
        youtube: '📺'
    };
    return icons[platform] || '📱';
}

function formatSectionTitle(section) {
    const titles = {
        'best-practices': '✅ Best Practices',
        'specs': '📐 Specs & Requirements',
        'trends': '🔥 Current Trends',
        'algorithm': '🤖 Algorithm Notes',
        'rules': '📜 Our Rules'
    };
    return titles[section] || section;
}

// Simple markdown renderer
function renderMarkdown(text) {
    if (!text) return '';
    
    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h4 style="font-weight:600;margin:8px 0 4px;">$1</h4>')
        .replace(/^## (.*$)/gm, '<h3 style="font-weight:600;margin:12px 0 6px;">$1</h3>')
        .replace(/^# (.*$)/gm, '<h2 style="font-weight:700;margin:16px 0 8px;">$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Unordered lists
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Wrap list items
        .replace(/(<li>.*<\/li>)/g, '<ul style="margin:4px 0;padding-left:20px;">$1</ul>')
        // Clean up multiple ul tags
        .replace(/<\/ul><br><ul[^>]*>/g, '');
}
