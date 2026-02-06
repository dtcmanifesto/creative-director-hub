// Offer Matrix Tab
import { db } from '../supabase.js';
import { formatCurrency, formatRoas, formatPercent, formatDate, getStatusClass } from '../utils/helpers.js';

export async function initOfferMatrix(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">🎯 Offer Matrix</h1>
                <p class="page-subtitle">What commercial levers exist and which ones convert</p>
            </div>
            <button class="btn btn-primary" id="addOfferBtn">+ Add Offer</button>
        </div>
        
        <!-- Active Offers -->
        <section class="mb-6">
            <h2>🟢 What Can I Promote Right Now?</h2>
            <div class="card-grid card-grid-3" id="activeOffers">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- All Offers Table -->
        <section class="mb-6">
            <div class="section-header">
                <h2>📊 All Offers</h2>
                <div class="filter-group">
                    <select class="form-select" id="offerStatusFilter" style="width:120px;">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Offer</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Conditions</th>
                                <th>Dates</th>
                                <th>Avg ROAS</th>
                                <th>Avg CPA</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="offersBody">
                            <tr><td colspan="9"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Offer x Angle Pairings -->
        <section>
            <h2>🔥 Top Offer × Angle Pairings</h2>
            <div class="card" id="pairingInsights">
                <p class="text-muted">Performance data from tests will populate this section</p>
            </div>
        </section>
        
        <!-- Add Offer Modal -->
        <div class="modal-overlay" id="offerModal">
            <div class="modal" style="max-width:560px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="offerModalTitle">Add Offer</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="offerForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Offer Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="e.g., Spring Sale 20% Off">
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Type *</label>
                                <select class="form-select" name="type" required>
                                    <option value="discount">Discount</option>
                                    <option value="bundle">Bundle</option>
                                    <option value="free-shipping">Free Shipping</option>
                                    <option value="gift-with-purchase">Gift with Purchase</option>
                                    <option value="bogo">BOGO</option>
                                    <option value="financing">Financing</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Value</label>
                                <input type="text" class="form-input" name="value" placeholder="e.g., 20%, $50 off, Free mat">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Conditions</label>
                            <input type="text" class="form-input" name="conditions" placeholder="e.g., Min $200 purchase, First-time buyers only">
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Start Date</label>
                                <input type="date" class="form-input" name="start_date">
                            </div>
                            <div class="form-group">
                                <label class="form-label">End Date</label>
                                <input type="date" class="form-input" name="end_date">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-select" name="status">
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Best Paired Angles (one per line)</label>
                            <textarea class="form-textarea" name="best_paired_angles" rows="3" placeholder="Pain point&#10;Transformation&#10;Social proof"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveOfferBtn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadOfferData();
}

let currentStatus = 'all';

function setupEventListeners(container) {
    const modal = container.querySelector('#offerModal');
    
    // Add button
    container.querySelector('#addOfferBtn').addEventListener('click', () => {
        container.querySelector('#offerForm').reset();
        container.querySelector('#offerModalTitle').textContent = 'Add Offer';
        modal.classList.add('active');
    });
    
    // Close modal
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Status filter
    container.querySelector('#offerStatusFilter').addEventListener('change', (e) => {
        currentStatus = e.target.value;
        loadOfferData();
    });
    
    // Save
    container.querySelector('#saveOfferBtn').addEventListener('click', async () => {
        const form = container.querySelector('#offerForm');
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            value: formData.get('value'),
            conditions: formData.get('conditions'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            status: formData.get('status'),
            best_paired_angles: formData.get('best_paired_angles')?.split('\n').filter(a => a.trim()) || [],
            notes: formData.get('notes')
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('offers', id, data);
            } else {
                await db.insert('offers', data);
            }
            modal.classList.remove('active');
            form.reset();
            loadOfferData();
        } catch (error) {
            alert('Error saving offer: ' + error.message);
        }
    });
}

async function loadOfferData() {
    try {
        const filters = currentStatus !== 'all' ? [{ column: 'status', value: currentStatus }] : [];
        
        const offers = await db.fetch('offers', {
            filters,
            order: { column: 'created_at', ascending: false }
        });
        
        // Active offers for quick view
        const activeOffers = offers.filter(o => o.status === 'active');
        const activeContainer = document.getElementById('activeOffers');
        
        if (activeOffers.length > 0) {
            activeContainer.innerHTML = activeOffers.map(offer => `
                <div class="card" style="border-left:3px solid var(--success);">
                    <div class="flex justify-between items-center mb-2">
                        <span class="badge badge-neutral">${offer.type}</span>
                        ${offer.avg_roas ? `<span class="badge badge-success">${formatRoas(offer.avg_roas)}</span>` : ''}
                    </div>
                    <h3 style="font-weight:600;margin-bottom:8px;">${offer.name}</h3>
                    ${offer.value ? `<div style="font-size:20px;font-weight:700;color:var(--accent);margin-bottom:8px;">${offer.value}</div>` : ''}
                    ${offer.conditions ? `<p class="text-muted" style="font-size:12px;">${offer.conditions}</p>` : ''}
                    ${offer.end_date ? `
                        <div class="text-muted mt-3" style="font-size:11px;">
                            Ends ${formatDate(offer.end_date)}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            activeContainer.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-icon">🎯</div>
                    <div class="empty-state-title">No active offers</div>
                    <div class="empty-state-text">Add an offer to start promoting</div>
                </div>
            `;
        }
        
        // All offers table
        const offersBody = document.getElementById('offersBody');
        if (offers.length > 0) {
            offersBody.innerHTML = offers.map(offer => `
                <tr data-edit-offer="${offer.id}">
                    <td style="font-weight:500;">${offer.name}</td>
                    <td><span class="badge badge-neutral">${offer.type}</span></td>
                    <td class="mono">${offer.value || '-'}</td>
                    <td style="max-width:200px;" class="text-secondary">${offer.conditions || '-'}</td>
                    <td class="mono" style="font-size:12px;">
                        ${offer.start_date ? formatDate(offer.start_date) : '?'} - ${offer.end_date ? formatDate(offer.end_date) : '?'}
                    </td>
                    <td class="mono">${offer.avg_roas ? formatRoas(offer.avg_roas) : '-'}</td>
                    <td class="mono">${offer.avg_cpa ? formatCurrency(offer.avg_cpa) : '-'}</td>
                    <td><span class="badge ${getStatusClass(offer.status)}">${offer.status}</span></td>
                    <td>
                        <button class="btn btn-ghost btn-sm">Edit</button>
                    </td>
                </tr>
            `).join('');
            
            // Edit handlers
            offersBody.querySelectorAll('[data-edit-offer]').forEach(row => {
                row.addEventListener('click', () => editOffer(row.dataset.editOffer, offers));
            });
        } else {
            offersBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="empty-state">
                            <div class="empty-state-text">No offers found</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Pairing insights
        const pairingContainer = document.getElementById('pairingInsights');
        const offersWithAngles = offers.filter(o => o.best_paired_angles?.length > 0);
        
        if (offersWithAngles.length > 0) {
            pairingContainer.innerHTML = `
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Offer</th>
                                <th>Best Angles</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${offersWithAngles.map(o => `
                                <tr>
                                    <td style="font-weight:500;">${o.name}</td>
                                    <td>${o.best_paired_angles.map(a => `<span class="badge badge-neutral" style="margin:2px;">${a}</span>`).join('')}</td>
                                    <td>${o.avg_roas ? `${formatRoas(o.avg_roas)} ROAS` : 'No data yet'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading offers:', error);
    }
}

function editOffer(id, offers) {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;
    
    const form = document.querySelector('#offerForm');
    form.querySelector('[name="id"]').value = offer.id;
    form.querySelector('[name="name"]').value = offer.name || '';
    form.querySelector('[name="type"]').value = offer.type || 'discount';
    form.querySelector('[name="value"]').value = offer.value || '';
    form.querySelector('[name="conditions"]').value = offer.conditions || '';
    form.querySelector('[name="start_date"]').value = offer.start_date || '';
    form.querySelector('[name="end_date"]').value = offer.end_date || '';
    form.querySelector('[name="status"]').value = offer.status || 'active';
    form.querySelector('[name="best_paired_angles"]').value = (offer.best_paired_angles || []).join('\n');
    form.querySelector('[name="notes"]').value = offer.notes || '';
    
    document.querySelector('#offerModalTitle').textContent = 'Edit Offer';
    document.querySelector('#offerModal').classList.add('active');
}
