// Performance Tab - Winners Wall
import { db } from '../supabase.js';
import { formatCurrency, formatRoas, formatPercent, formatDate, daysSince, getStatusClass } from '../utils/helpers.js';

let currentSort = { column: 'roas', ascending: false };
let currentFilters = { platform: 'all', adType: 'all', dateRange: '30d' };

export async function initPerformance(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">📊 Performance</h1>
            <p class="page-subtitle">Top-performing creatives at a glance</p>
        </div>
        
        <!-- Winners Wall -->
        <section class="mb-6">
            <div class="section-header">
                <h2>🏆 Winners Wall</h2>
            </div>
            <div class="winners-grid" id="winnersWall">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Controls -->
        <section class="mb-4">
            <div class="controls-bar">
                <div class="filter-group">
                    <span class="filter-label">Sort by:</span>
                    <div class="toggle-group">
                        <button class="toggle-btn-group active" data-sort="roas">ROAS</button>
                        <button class="toggle-btn-group" data-sort="spend">Spend</button>
                        <button class="toggle-btn-group" data-sort="cpa">CPA</button>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Platform:</span>
                    <select class="form-select" id="platformFilter" style="width: 120px;">
                        <option value="all">All</option>
                        <option value="meta">Meta</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Type:</span>
                    <select class="form-select" id="adTypeFilter" style="width: 120px;">
                        <option value="all">All</option>
                        <option value="ugc">UGC</option>
                        <option value="studio">Studio</option>
                        <option value="static">Static</option>
                        <option value="carousel">Carousel</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Period:</span>
                    <select class="form-select" id="dateRangeFilter" style="width: 120px;">
                        <option value="7d">Last 7 days</option>
                        <option value="30d" selected>Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="addCreativeBtn">
                    + Add Creative
                </button>
            </div>
        </section>
        
        <!-- Leaderboard Table -->
        <section>
            <div class="card">
                <div class="table-wrapper">
                    <table id="leaderboardTable">
                        <thead>
                            <tr>
                                <th>Creative</th>
                                <th>Platform</th>
                                <th>Type</th>
                                <th>Hook</th>
                                <th class="sortable" data-sort="launch_date">Days Running</th>
                                <th class="sortable" data-sort="spend">Spend</th>
                                <th class="sortable" data-sort="roas">ROAS</th>
                                <th class="sortable" data-sort="cpa">CPA</th>
                                <th class="sortable" data-sort="ctr">CTR</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboardBody">
                            <tr><td colspan="10"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Add Creative Modal -->
        <div class="modal-overlay" id="addCreativeModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add Creative</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="addCreativeForm">
                        <div class="form-group">
                            <label class="form-label">Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="e.g., FA_UGC_QuestionHook_Gym">
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Platform *</label>
                                <select class="form-select" name="platform" required>
                                    <option value="meta">Meta</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ad Type</label>
                                <select class="form-select" name="ad_type">
                                    <option value="">Select...</option>
                                    <option value="ugc">UGC</option>
                                    <option value="studio">Studio</option>
                                    <option value="static">Static</option>
                                    <option value="carousel">Carousel</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Hook Type</label>
                                <input type="text" class="form-input" name="hook_type" placeholder="e.g., Question, Bold Claim">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Creator Name</label>
                                <input type="text" class="form-input" name="creator_name" placeholder="e.g., John D.">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Thumbnail URL</label>
                            <input type="url" class="form-input" name="thumbnail_url" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Meta Ad ID</label>
                            <input type="text" class="form-input" name="meta_ad_id" placeholder="For API sync">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Launch Date</label>
                            <input type="date" class="form-input" name="launch_date">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2" placeholder="Any additional notes..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveCreativeBtn">Save Creative</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadPerformanceData();
}

function setupEventListeners(container) {
    // Sort toggles
    container.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortCol = btn.dataset.sort;
            
            // Update toggle group active state
            if (btn.classList.contains('toggle-btn-group')) {
                container.querySelectorAll('.toggle-btn-group').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            
            currentSort = {
                column: sortCol,
                ascending: currentSort.column === sortCol ? !currentSort.ascending : false
            };
            loadPerformanceData();
        });
    });
    
    // Filters
    ['platformFilter', 'adTypeFilter', 'dateRangeFilter'].forEach(id => {
        container.querySelector(`#${id}`).addEventListener('change', (e) => {
            const key = id.replace('Filter', '').replace(/([A-Z])/g, '_$1').toLowerCase();
            currentFilters[key === 'ad_type' ? 'adType' : key === 'date_range' ? 'dateRange' : key] = e.target.value;
            loadPerformanceData();
        });
    });
    
    // Add Creative Modal
    const modal = container.querySelector('#addCreativeModal');
    container.querySelector('#addCreativeBtn').addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Save Creative
    container.querySelector('#saveCreativeBtn').addEventListener('click', async () => {
        const form = container.querySelector('#addCreativeForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        if (!data.name) {
            alert('Name is required');
            return;
        }
        
        try {
            await db.insert('creatives', {
                ...data,
                status: 'active',
                spend: 0,
                roas: null,
                cpa: null,
                ctr: null
            });
            
            modal.classList.remove('active');
            form.reset();
            loadPerformanceData();
        } catch (error) {
            console.error('Error saving creative:', error);
            alert('Error saving creative: ' + error.message);
        }
    });
}

async function loadPerformanceData() {
    try {
        // Build filters
        const filters = [];
        if (currentFilters.platform !== 'all') {
            filters.push({ column: 'platform', value: currentFilters.platform });
        }
        if (currentFilters.adType !== 'all') {
            filters.push({ column: 'ad_type', value: currentFilters.adType });
        }
        
        const creatives = await db.fetch('creatives', {
            filters,
            order: { column: currentSort.column, ascending: currentSort.ascending }
        });
        
        // Filter by date range
        let filteredCreatives = creatives;
        if (currentFilters.dateRange !== 'all') {
            const days = parseInt(currentFilters.dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filteredCreatives = creatives.filter(c => 
                !c.launch_date || new Date(c.launch_date) >= cutoffDate
            );
        }
        
        // Render Winners Wall (top 5 by ROAS)
        const topWinners = [...filteredCreatives]
            .filter(c => c.roas && c.roas > 0)
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 5);
        
        const winnersWall = document.getElementById('winnersWall');
        if (topWinners.length > 0) {
            winnersWall.innerHTML = topWinners.map((creative, i) => `
                <div class="winner-card">
                    <span class="winner-rank">#${i + 1}</span>
                    ${creative.thumbnail_url 
                        ? `<img src="${creative.thumbnail_url}" class="winner-thumbnail" alt="${creative.name}">`
                        : `<div class="winner-thumbnail" style="display:flex;align-items:center;justify-content:center;font-size:32px;background:var(--bg-medium);">🎬</div>`
                    }
                    <div class="winner-name">${creative.name}</div>
                    <div class="winner-meta">
                        ${creative.platform?.toUpperCase() || 'N/A'} • ${creative.ad_type || 'N/A'} • ${daysSince(creative.launch_date) || '?'} days
                    </div>
                    <div class="winner-stats">
                        <div class="winner-stat">
                            <div class="winner-stat-value">${formatRoas(creative.roas)}</div>
                            <div class="winner-stat-label">ROAS</div>
                        </div>
                        <div class="winner-stat">
                            <div class="winner-stat-value">${formatCurrency(creative.spend)}</div>
                            <div class="winner-stat-label">Spend</div>
                        </div>
                        <div class="winner-stat">
                            <div class="winner-stat-value">${formatCurrency(creative.cpa)}</div>
                            <div class="winner-stat-label">CPA</div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            winnersWall.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🏆</div>
                    <div class="empty-state-title">No winners yet</div>
                    <div class="empty-state-text">Add creatives and sync performance data to see your top performers</div>
                </div>
            `;
        }
        
        // Render Leaderboard Table
        const tbody = document.getElementById('leaderboardBody');
        if (filteredCreatives.length > 0) {
            tbody.innerHTML = filteredCreatives.map(creative => `
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            ${creative.thumbnail_url 
                                ? `<img src="${creative.thumbnail_url}" class="thumbnail" alt="">`
                                : `<div class="thumbnail" style="display:flex;align-items:center;justify-content:center;">🎬</div>`
                            }
                            <div>
                                <div style="font-weight:500;">${creative.name}</div>
                                ${creative.creator_name ? `<div class="text-muted" style="font-size:12px;">by ${creative.creator_name}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td><span class="badge badge-neutral">${creative.platform?.toUpperCase() || '-'}</span></td>
                    <td>${creative.ad_type || '-'}</td>
                    <td>${creative.hook_type || '-'}</td>
                    <td class="mono">${daysSince(creative.launch_date) ?? '-'}</td>
                    <td class="mono">${formatCurrency(creative.spend)}</td>
                    <td class="mono" style="color: ${creative.roas >= 2.5 ? 'var(--success)' : creative.roas >= 1.5 ? 'var(--warning)' : 'var(--danger)'};">${formatRoas(creative.roas)}</td>
                    <td class="mono">${formatCurrency(creative.cpa)}</td>
                    <td class="mono">${creative.ctr ? formatPercent(creative.ctr) : '-'}</td>
                    <td><span class="badge ${getStatusClass(creative.status)}">${creative.status}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10">
                        <div class="empty-state">
                            <div class="empty-state-icon">📊</div>
                            <div class="empty-state-title">No creatives found</div>
                            <div class="empty-state-text">Add your first creative to start tracking performance</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('Error loading performance data:', error);
        document.getElementById('leaderboardBody').innerHTML = `
            <tr><td colspan="10" class="text-danger">Error loading data: ${error.message}</td></tr>
        `;
    }
}
