// Trending Now Tab
import { db } from '../firebase.js';
import { formatDate, daysSince, getStatusClass } from '../utils/helpers.js';

export async function initTrending(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">🔥 Trending Now</h1>
                <p class="page-subtitle">What's going viral right now — cultural pulse check</p>
            </div>
            <button class="btn btn-primary" id="addTrendBtn">+ Add Trend</button>
        </div>
        
        <!-- Steal & Adapt Queue -->
        <section class="mb-6">
            <h2>⚡ Steal & Adapt Queue</h2>
            <p class="text-secondary mb-4">High-relevance trends with the best adaptation potential</p>
            <div class="card-grid card-grid-3" id="stealAdaptQueue">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Filters -->
        <section class="mb-4">
            <div class="controls-bar">
                <div class="filter-group">
                    <span class="filter-label">Platform:</span>
                    <div class="toggle-group">
                        <button class="toggle-btn-group active" data-platform="all">All</button>
                        <button class="toggle-btn-group" data-platform="tiktok">TikTok</button>
                        <button class="toggle-btn-group" data-platform="instagram">Instagram</button>
                        <button class="toggle-btn-group" data-platform="youtube">YouTube</button>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Category:</span>
                    <select class="form-select" id="categoryFilter" style="width:140px;">
                        <option value="all">All</option>
                        <option value="sound">Sounds</option>
                        <option value="format">Formats</option>
                        <option value="hook">Hooks</option>
                        <option value="hashtag">Hashtags</option>
                        <option value="viral-ad">Viral Ads</option>
                    </select>
                </div>
            </div>
        </section>
        
        <!-- Trends Grid -->
        <section>
            <div class="card-grid card-grid-2" id="trendsGrid">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Add Trend Modal -->
        <div class="modal-overlay" id="trendModal">
            <div class="modal" style="max-width:600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Add Trend</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="trendForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Title *</label>
                            <input type="text" class="form-input" name="title" required placeholder="Trend name or description">
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Platform *</label>
                                <select class="form-select" name="platform" required>
                                    <option value="tiktok">TikTok</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category *</label>
                                <select class="form-select" name="category" required>
                                    <option value="sound">Sound</option>
                                    <option value="format">Format</option>
                                    <option value="hook">Hook</option>
                                    <option value="hashtag">Hashtag</option>
                                    <option value="viral-ad">Viral Ad</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-textarea" name="description" rows="2" placeholder="What is this trend about?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Example URLs (one per line)</label>
                            <textarea class="form-textarea" name="example_urls" rows="3" placeholder="https://..."></textarea>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Relevance Score</label>
                                <select class="form-select" name="relevance_score">
                                    <option value="high">High</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Est. Window (days)</label>
                                <input type="number" class="form-input" name="estimated_window_days" placeholder="14">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Adaptation Notes</label>
                            <textarea class="form-textarea" name="adaptation_notes" rows="3" placeholder="How can we adapt this for our brand?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-select" name="status">
                                <option value="active">Active</option>
                                <option value="peaked">Peaked</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveTrendBtn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadTrendingData();
}

let currentPlatform = 'all';
let currentCategory = 'all';

function setupEventListeners(container) {
    const modal = container.querySelector('#trendModal');
    
    // Add button
    container.querySelector('#addTrendBtn').addEventListener('click', () => {
        container.querySelector('#trendForm').reset();
        modal.classList.add('active');
    });
    
    // Close modal
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Platform filter
    container.querySelectorAll('[data-platform]').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('[data-platform]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
            loadTrendingData();
        });
    });
    
    // Category filter
    container.querySelector('#categoryFilter').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        loadTrendingData();
    });
    
    // Save
    container.querySelector('#saveTrendBtn').addEventListener('click', async () => {
        const form = container.querySelector('#trendForm');
        const formData = new FormData(form);
        
        const urls = formData.get('example_urls')?.split('\n').filter(u => u.trim()) || [];
        
        const data = {
            title: formData.get('title'),
            platform: formData.get('platform'),
            category: formData.get('category'),
            description: formData.get('description'),
            example_urls: urls,
            relevance_score: formData.get('relevance_score'),
            estimated_window_days: parseInt(formData.get('estimated_window_days')) || null,
            adaptation_notes: formData.get('adaptation_notes'),
            status: formData.get('status'),
            date_spotted: new Date().toISOString().split('T')[0]
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('trends', id, data);
            } else {
                await db.insert('trends', data);
            }
            modal.classList.remove('active');
            form.reset();
            loadTrendingData();
        } catch (error) {
            alert('Error saving trend: ' + error.message);
        }
    });
}

async function loadTrendingData() {
    try {
        const filters = [];
        if (currentPlatform !== 'all') {
            filters.push({ column: 'platform', value: currentPlatform });
        }
        if (currentCategory !== 'all') {
            filters.push({ column: 'category', value: currentCategory });
        }
        
        const trends = await db.fetch('trends', {
            filters,
            order: { column: 'date_spotted', ascending: false }
        });
        
        // Steal & Adapt queue (high relevance, active)
        const highRelevance = trends.filter(t => t.relevance_score === 'high' && t.status === 'active');
        const queueContainer = document.getElementById('stealAdaptQueue');
        
        if (highRelevance.length > 0) {
            queueContainer.innerHTML = highRelevance.slice(0, 6).map(trend => `
                <div class="card card-hover" style="border-left: 3px solid var(--accent);">
                    <div class="flex justify-between items-center mb-2">
                        <span class="badge badge-neutral">${trend.platform?.toUpperCase()}</span>
                        <span class="badge ${getRelevanceClass(trend.relevance_score)}">${trend.relevance_score}</span>
                    </div>
                    <h3 style="font-weight:600;margin-bottom:8px;">${trend.title}</h3>
                    <p class="text-secondary" style="font-size:13px;margin-bottom:12px;">${trend.description || ''}</p>
                    ${trend.adaptation_notes ? `
                        <div style="background:var(--bg-medium);padding:12px;border-radius:8px;font-size:13px;">
                            <strong style="color:var(--accent);">Adaptation:</strong> ${trend.adaptation_notes}
                        </div>
                    ` : ''}
                    <div class="text-muted mt-3" style="font-size:11px;">
                        ${trend.estimated_window_days ? `~${trend.estimated_window_days} day window • ` : ''}
                        Spotted ${formatDate(trend.date_spotted)}
                    </div>
                </div>
            `).join('');
        } else {
            queueContainer.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-text">No high-relevance trends right now</div>
                </div>
            `;
        }
        
        // All trends grid
        const trendsGrid = document.getElementById('trendsGrid');
        
        if (trends.length > 0) {
            trendsGrid.innerHTML = trends.map(trend => {
                const age = daysSince(trend.date_spotted);
                const isFading = age > 14;
                const isOld = age > 30;
                
                return `
                    <div class="card ${isOld ? 'opacity-50' : isFading ? 'opacity-75' : ''}" data-edit-trend="${trend.id}">
                        <div class="flex justify-between items-center mb-3">
                            <div class="flex gap-2">
                                <span class="badge badge-neutral">${trend.platform?.toUpperCase()}</span>
                                <span class="badge badge-neutral">${trend.category}</span>
                            </div>
                            <span class="badge ${getRelevanceClass(trend.relevance_score)}">${trend.relevance_score}</span>
                        </div>
                        <h3 style="font-weight:600;margin-bottom:8px;">${trend.title}</h3>
                        <p class="text-secondary" style="font-size:13px;">${trend.description || ''}</p>
                        ${trend.example_urls?.length > 0 ? `
                            <div class="mt-3">
                                ${trend.example_urls.slice(0, 2).map(url => `
                                    <a href="${url}" target="_blank" class="btn btn-ghost btn-sm" style="margin-right:4px;">🔗 Example</a>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="flex justify-between items-center mt-4">
                            <span class="badge ${getStatusBadge(trend.status)}">${trend.status}</span>
                            <span class="text-muted" style="font-size:11px;">
                                ${age} days ago
                                ${isOld ? ' • auto-archive soon' : isFading ? ' • fading' : ''}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Edit handlers
            trendsGrid.querySelectorAll('[data-edit-trend]').forEach(card => {
                card.addEventListener('click', () => editTrend(card.dataset.editTrend, trends));
            });
        } else {
            trendsGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-icon">🔥</div>
                    <div class="empty-state-title">No trends tracked</div>
                    <div class="empty-state-text">Start adding trends you spot on TikTok and Instagram</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading trends:', error);
    }
}

function getRelevanceClass(score) {
    if (score === 'high') return 'badge-success';
    if (score === 'medium') return 'badge-warning';
    return 'badge-neutral';
}

function getStatusBadge(status) {
    if (status === 'active') return 'status-active';
    if (status === 'peaked') return 'status-plateaued';
    return 'badge-neutral';
}

function editTrend(id, trends) {
    const trend = trends.find(t => t.id === id);
    if (!trend) return;
    
    const form = document.querySelector('#trendForm');
    form.querySelector('[name="id"]').value = trend.id;
    form.querySelector('[name="title"]').value = trend.title || '';
    form.querySelector('[name="platform"]').value = trend.platform || 'tiktok';
    form.querySelector('[name="category"]').value = trend.category || 'format';
    form.querySelector('[name="description"]').value = trend.description || '';
    form.querySelector('[name="example_urls"]').value = (trend.example_urls || []).join('\n');
    form.querySelector('[name="relevance_score"]').value = trend.relevance_score || 'medium';
    form.querySelector('[name="estimated_window_days"]').value = trend.estimated_window_days || '';
    form.querySelector('[name="adaptation_notes"]').value = trend.adaptation_notes || '';
    form.querySelector('[name="status"]').value = trend.status || 'active';
    
    document.querySelector('#trendModal').classList.add('active');
}
