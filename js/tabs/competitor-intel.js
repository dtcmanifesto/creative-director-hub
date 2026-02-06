// Competitor Intel Tab
import { db } from '../firebase.js';
import { formatDate, getRelativeTime } from '../utils/helpers.js';

export async function initCompetitorIntel(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">🔍 Competitor Intel</h1>
                <p class="page-subtitle">What competitors are running, side-by-side analysis</p>
            </div>
            <button class="btn btn-primary" id="addCompetitorBtn">+ Add Competitor</button>
        </div>
        
        <!-- Competitor Profiles -->
        <section class="mb-6">
            <h2>📊 Competitor Profiles</h2>
            <div class="card-grid card-grid-3" id="competitorProfiles">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Recent Competitor Ads -->
        <section class="mb-6">
            <div class="section-header">
                <h2>📺 Recent Competitor Ads</h2>
                <button class="btn btn-secondary btn-sm" id="addAdBtn">+ Log Ad</button>
            </div>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Competitor</th>
                                <th>Platform</th>
                                <th>Hook</th>
                                <th>Angle</th>
                                <th>Format</th>
                                <th>Date Spotted</th>
                                <th>Rewritten Hook</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="competitorAdsBody">
                            <tr><td colspan="8"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Swipe File -->
        <section>
            <h2>💾 Swipe File</h2>
            <div id="swipeFile" class="card-grid card-grid-4">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Add Competitor Modal -->
        <div class="modal-overlay" id="competitorModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add Competitor</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="competitorForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="Competitor name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Website URL</label>
                            <input type="url" class="form-input" name="url" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Positioning</label>
                            <textarea class="form-textarea" name="positioning" rows="2" placeholder="How do they position themselves?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Strengths</label>
                            <textarea class="form-textarea" name="strengths" rows="2" placeholder="What do they do well?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Weaknesses</label>
                            <textarea class="form-textarea" name="weaknesses" rows="2" placeholder="Where do they fall short?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveCompetitorBtn">Save</button>
                </div>
            </div>
        </div>
        
        <!-- Add Competitor Ad Modal -->
        <div class="modal-overlay" id="competitorAdModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Log Competitor Ad</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="competitorAdForm">
                        <div class="form-group">
                            <label class="form-label">Competitor *</label>
                            <select class="form-select" name="competitor_id" required id="competitorSelect">
                                <option value="">Select competitor...</option>
                            </select>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Platform</label>
                                <select class="form-select" name="platform">
                                    <option value="meta">Meta</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Format</label>
                                <select class="form-select" name="format">
                                    <option value="">Select...</option>
                                    <option value="ugc">UGC</option>
                                    <option value="studio">Studio</option>
                                    <option value="static">Static</option>
                                    <option value="carousel">Carousel</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Hook Text</label>
                            <textarea class="form-textarea" name="hook_text" rows="2" placeholder="Opening hook..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Angle</label>
                            <input type="text" class="form-input" name="angle" placeholder="Main messaging angle">
                        </div>
                        <div class="form-group">
                            <label class="form-label">CTA</label>
                            <input type="text" class="form-input" name="cta" placeholder="Call to action">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Rewritten Hook (for us)</label>
                            <textarea class="form-textarea" name="rewritten_hook" rows="2" placeholder="How would we adapt this hook?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Screenshot URL</label>
                            <input type="url" class="form-input" name="screenshot_url" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Video URL</label>
                            <input type="url" class="form-input" name="video_url" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveCompetitorAdBtn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadCompetitorData();
}

function setupEventListeners(container) {
    const competitorModal = container.querySelector('#competitorModal');
    const adModal = container.querySelector('#competitorAdModal');
    
    // Add Competitor button
    container.querySelector('#addCompetitorBtn').addEventListener('click', () => {
        container.querySelector('#competitorForm').reset();
        competitorModal.classList.add('active');
    });
    
    // Add Ad button
    container.querySelector('#addAdBtn').addEventListener('click', () => {
        container.querySelector('#competitorAdForm').reset();
        adModal.classList.add('active');
    });
    
    // Close modals
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            competitorModal.classList.remove('active');
            adModal.classList.remove('active');
        });
    });
    
    [competitorModal, adModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
    
    // Save Competitor
    container.querySelector('#saveCompetitorBtn').addEventListener('click', async () => {
        const form = container.querySelector('#competitorForm');
        const formData = new FormData(form);
        
        try {
            const id = formData.get('id');
            const data = {
                name: formData.get('name'),
                url: formData.get('url'),
                positioning: formData.get('positioning'),
                strengths: formData.get('strengths'),
                weaknesses: formData.get('weaknesses'),
                notes: formData.get('notes')
            };
            
            if (id) {
                await db.update('competitors', id, data);
            } else {
                await db.insert('competitors', data);
            }
            
            competitorModal.classList.remove('active');
            form.reset();
            loadCompetitorData();
        } catch (error) {
            alert('Error saving competitor: ' + error.message);
        }
    });
    
    // Save Competitor Ad
    container.querySelector('#saveCompetitorAdBtn').addEventListener('click', async () => {
        const form = container.querySelector('#competitorAdForm');
        const formData = new FormData(form);
        
        try {
            await db.insert('competitor_ads', {
                competitor_id: formData.get('competitor_id'),
                platform: formData.get('platform'),
                format: formData.get('format'),
                hook_text: formData.get('hook_text'),
                angle: formData.get('angle'),
                cta: formData.get('cta'),
                rewritten_hook: formData.get('rewritten_hook'),
                screenshot_url: formData.get('screenshot_url'),
                video_url: formData.get('video_url'),
                notes: formData.get('notes'),
                date_spotted: new Date().toISOString().split('T')[0]
            }, { skipBrandId: true });
            
            adModal.classList.remove('active');
            form.reset();
            loadCompetitorData();
        } catch (error) {
            alert('Error saving ad: ' + error.message);
        }
    });
}

async function loadCompetitorData() {
    try {
        // Fetch competitors
        const competitors = await db.fetch('competitors', {
            order: { column: 'name', ascending: true }
        });
        
        // Fetch competitor ads
        const ads = await db.fetch('competitor_ads', {
            brandFilter: false,
            order: { column: 'date_spotted', ascending: false }
        });
        
        // Map competitor names to ads
        const competitorMap = {};
        competitors.forEach(c => competitorMap[c.id] = c);
        
        // Update competitor select in modal
        const select = document.getElementById('competitorSelect');
        select.innerHTML = `
            <option value="">Select competitor...</option>
            ${competitors.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        `;
        
        // Render competitor profiles
        const profilesContainer = document.getElementById('competitorProfiles');
        if (competitors.length > 0) {
            profilesContainer.innerHTML = competitors.map(c => {
                const adCount = ads.filter(a => a.competitor_id === c.id).length;
                return `
                    <div class="card card-hover" style="cursor:pointer;" data-edit-competitor="${c.id}">
                        <div class="flex justify-between items-center mb-3">
                            <h3 style="font-weight:600;">${c.name}</h3>
                            <span class="badge badge-neutral">${adCount} ads</span>
                        </div>
                        ${c.url ? `<a href="${c.url}" target="_blank" class="text-accent" style="font-size:12px;">${c.url}</a>` : ''}
                        ${c.positioning ? `<p class="text-secondary mt-2" style="font-size:13px;">${c.positioning}</p>` : ''}
                        <div class="text-muted mt-3" style="font-size:11px;">
                            Updated ${getRelativeTime(c.last_updated)}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Edit handlers
            profilesContainer.querySelectorAll('[data-edit-competitor]').forEach(card => {
                card.addEventListener('click', () => {
                    const comp = competitors.find(c => c.id === card.dataset.editCompetitor);
                    if (comp) editCompetitor(comp);
                });
            });
        } else {
            profilesContainer.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">No competitors tracked</div>
                    <div class="empty-state-text">Add your first competitor to start building intel</div>
                </div>
            `;
        }
        
        // Render competitor ads table
        const adsBody = document.getElementById('competitorAdsBody');
        if (ads.length > 0) {
            adsBody.innerHTML = ads.slice(0, 20).map(ad => `
                <tr>
                    <td style="font-weight:500;">${competitorMap[ad.competitor_id]?.name || 'Unknown'}</td>
                    <td><span class="badge badge-neutral">${ad.platform?.toUpperCase() || '-'}</span></td>
                    <td style="max-width:200px;">${ad.hook_text || '-'}</td>
                    <td>${ad.angle || '-'}</td>
                    <td>${ad.format || '-'}</td>
                    <td class="mono">${formatDate(ad.date_spotted)}</td>
                    <td style="max-width:200px;color:var(--accent);">${ad.rewritten_hook || '-'}</td>
                    <td>
                        ${ad.screenshot_url ? `<a href="${ad.screenshot_url}" target="_blank" class="btn btn-ghost btn-sm">📷</a>` : ''}
                        ${ad.video_url ? `<a href="${ad.video_url}" target="_blank" class="btn btn-ghost btn-sm">🎬</a>` : ''}
                    </td>
                </tr>
            `).join('');
        } else {
            adsBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-text">No competitor ads logged yet</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Render swipe file (ads with rewritten hooks)
        const swipeFile = document.getElementById('swipeFile');
        const swipeAds = ads.filter(a => a.rewritten_hook);
        
        if (swipeAds.length > 0) {
            swipeFile.innerHTML = swipeAds.map(ad => `
                <div class="card">
                    <div class="text-muted" style="font-size:11px;margin-bottom:8px;">
                        ${competitorMap[ad.competitor_id]?.name || 'Unknown'} • ${ad.platform?.toUpperCase() || ''}
                    </div>
                    <div style="font-size:13px;margin-bottom:12px;">
                        <strong>Original:</strong> ${ad.hook_text || 'N/A'}
                    </div>
                    <div style="font-size:13px;color:var(--accent);">
                        <strong>Our version:</strong> ${ad.rewritten_hook}
                    </div>
                </div>
            `).join('');
        } else {
            swipeFile.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-text">Rewrite competitor hooks to build your swipe file</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading competitor data:', error);
    }
}

function editCompetitor(competitor) {
    const form = document.querySelector('#competitorForm');
    form.querySelector('[name="id"]').value = competitor.id;
    form.querySelector('[name="name"]').value = competitor.name || '';
    form.querySelector('[name="url"]').value = competitor.url || '';
    form.querySelector('[name="positioning"]').value = competitor.positioning || '';
    form.querySelector('[name="strengths"]').value = competitor.strengths || '';
    form.querySelector('[name="weaknesses"]').value = competitor.weaknesses || '';
    form.querySelector('[name="notes"]').value = competitor.notes || '';
    
    document.querySelector('#competitorModal').classList.add('active');
}
