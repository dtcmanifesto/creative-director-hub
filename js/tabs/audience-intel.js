// Audience Intel Tab
import { db } from '../firebase.js';

export async function initAudienceIntel(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">🧠 Audience Intel</h1>
                <p class="page-subtitle">Avatar profiles, VOC data, objection maps</p>
            </div>
            <div class="flex gap-3">
                <button class="btn btn-secondary" id="addObjectionBtn">+ Add Objection</button>
                <button class="btn btn-primary" id="addAvatarBtn">+ Add Avatar</button>
            </div>
        </div>
        
        <!-- Avatar Profiles -->
        <section class="mb-6">
            <h2>👤 Avatar Profiles</h2>
            <div class="card-grid card-grid-2" id="avatarProfiles">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Objection Map -->
        <section class="mb-6">
            <h2>🛡️ Objection Map</h2>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Objection</th>
                                <th>Frequency</th>
                                <th>Counter Arguments</th>
                                <th>Proof Points</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="objectionsBody">
                            <tr><td colspan="5"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Awareness Levels -->
        <section>
            <h2>📊 Awareness Level Messaging</h2>
            <div class="card-grid card-grid-5" id="awarenessLevels">
                <div class="card" style="border-top:3px solid #EF4444;">
                    <h4 style="font-size:13px;margin-bottom:8px;">Unaware</h4>
                    <p class="text-muted" style="font-size:12px;">Don't know they have a problem</p>
                </div>
                <div class="card" style="border-top:3px solid #F97316;">
                    <h4 style="font-size:13px;margin-bottom:8px;">Problem Aware</h4>
                    <p class="text-muted" style="font-size:12px;">Know the problem, not the solution</p>
                </div>
                <div class="card" style="border-top:3px solid #EAB308;">
                    <h4 style="font-size:13px;margin-bottom:8px;">Solution Aware</h4>
                    <p class="text-muted" style="font-size:12px;">Know solutions exist, not us specifically</p>
                </div>
                <div class="card" style="border-top:3px solid #22C55E;">
                    <h4 style="font-size:13px;margin-bottom:8px;">Product Aware</h4>
                    <p class="text-muted" style="font-size:12px;">Know our product, not convinced yet</p>
                </div>
                <div class="card" style="border-top:3px solid #3B82F6;">
                    <h4 style="font-size:13px;margin-bottom:8px;">Most Aware</h4>
                    <p class="text-muted" style="font-size:12px;">Ready to buy, need a push</p>
                </div>
            </div>
        </section>
        
        <!-- Add Avatar Modal -->
        <div class="modal-overlay" id="avatarModal">
            <div class="modal" style="max-width:640px;">
                <div class="modal-header">
                    <h3 class="modal-title">Add Avatar</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="avatarForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Avatar Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="e.g., Weekend Warrior, Home Gym Dad">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Demographics (JSON)</label>
                            <textarea class="form-textarea" name="demographics" rows="3" placeholder='{"age": "35-45", "gender": "male", "income": "$75k-150k"}'></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Pain Points (one per line)</label>
                            <textarea class="form-textarea" name="pain_points" rows="3" placeholder="Limited time for gym&#10;Expensive memberships&#10;Intimidated by gym culture"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Desires (one per line)</label>
                            <textarea class="form-textarea" name="desires" rows="3" placeholder="Stay in shape&#10;Build strength&#10;Train on own schedule"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Language Samples (one per line)</label>
                            <textarea class="form-textarea" name="language_samples" rows="3" placeholder="Actual phrases and words they use..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Awareness Level</label>
                            <select class="form-select" name="awareness_level">
                                <option value="">Select...</option>
                                <option value="unaware">Unaware</option>
                                <option value="problem-aware">Problem Aware</option>
                                <option value="solution-aware">Solution Aware</option>
                                <option value="product-aware">Product Aware</option>
                                <option value="most-aware">Most Aware</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveAvatarBtn">Save</button>
                </div>
            </div>
        </div>
        
        <!-- Add Objection Modal -->
        <div class="modal-overlay" id="objectionModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add Objection</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="objectionForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Objection *</label>
                            <textarea class="form-textarea" name="objection_text" rows="2" required placeholder="What do they say?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Frequency</label>
                            <select class="form-select" name="frequency">
                                <option value="common">Common</option>
                                <option value="occasional">Occasional</option>
                                <option value="rare">Rare</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Counter Arguments (one per line)</label>
                            <textarea class="form-textarea" name="counter_arguments" rows="3" placeholder="How do we respond?"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Proof Points (one per line)</label>
                            <textarea class="form-textarea" name="proof_points" rows="3" placeholder="Evidence to support counters..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Source</label>
                            <input type="text" class="form-input" name="source" placeholder="Where did this come from?">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveObjectionBtn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadAudienceData();
}

function setupEventListeners(container) {
    const avatarModal = container.querySelector('#avatarModal');
    const objectionModal = container.querySelector('#objectionModal');
    
    // Add buttons
    container.querySelector('#addAvatarBtn').addEventListener('click', () => {
        container.querySelector('#avatarForm').reset();
        avatarModal.classList.add('active');
    });
    
    container.querySelector('#addObjectionBtn').addEventListener('click', () => {
        container.querySelector('#objectionForm').reset();
        objectionModal.classList.add('active');
    });
    
    // Close modals
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            avatarModal.classList.remove('active');
            objectionModal.classList.remove('active');
        });
    });
    
    [avatarModal, objectionModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
    
    // Save Avatar
    container.querySelector('#saveAvatarBtn').addEventListener('click', async () => {
        const form = container.querySelector('#avatarForm');
        const formData = new FormData(form);
        
        let demographics = {};
        try {
            const demoStr = formData.get('demographics');
            if (demoStr) demographics = JSON.parse(demoStr);
        } catch (e) {}
        
        const data = {
            name: formData.get('name'),
            demographics,
            pain_points: formData.get('pain_points')?.split('\n').filter(p => p.trim()) || [],
            desires: formData.get('desires')?.split('\n').filter(d => d.trim()) || [],
            language_samples: formData.get('language_samples')?.split('\n').filter(l => l.trim()) || [],
            awareness_level: formData.get('awareness_level'),
            notes: formData.get('notes')
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('avatars', id, data);
            } else {
                await db.insert('avatars', data);
            }
            avatarModal.classList.remove('active');
            form.reset();
            loadAudienceData();
        } catch (error) {
            alert('Error saving avatar: ' + error.message);
        }
    });
    
    // Save Objection
    container.querySelector('#saveObjectionBtn').addEventListener('click', async () => {
        const form = container.querySelector('#objectionForm');
        const formData = new FormData(form);
        
        const data = {
            objection_text: formData.get('objection_text'),
            frequency: formData.get('frequency'),
            counter_arguments: formData.get('counter_arguments')?.split('\n').filter(c => c.trim()) || [],
            proof_points: formData.get('proof_points')?.split('\n').filter(p => p.trim()) || [],
            source: formData.get('source')
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('objections', id, data);
            } else {
                await db.insert('objections', data);
            }
            objectionModal.classList.remove('active');
            form.reset();
            loadAudienceData();
        } catch (error) {
            alert('Error saving objection: ' + error.message);
        }
    });
}

async function loadAudienceData() {
    try {
        // Fetch avatars
        const avatars = await db.fetch('avatars', {
            order: { column: 'name', ascending: true }
        });
        
        // Fetch objections
        const objections = await db.fetch('objections', {
            order: { column: 'frequency', ascending: true }
        });
        
        // Render avatars
        const avatarContainer = document.getElementById('avatarProfiles');
        if (avatars.length > 0) {
            avatarContainer.innerHTML = avatars.map(avatar => `
                <div class="card card-hover" data-edit-avatar="${avatar.id}">
                    <div class="flex justify-between items-center mb-3">
                        <h3 style="font-weight:600;">${avatar.name}</h3>
                        ${avatar.awareness_level ? `<span class="badge badge-neutral">${avatar.awareness_level}</span>` : ''}
                    </div>
                    ${avatar.demographics ? `
                        <div class="text-muted mb-3" style="font-size:12px;">
                            ${Object.entries(avatar.demographics).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </div>
                    ` : ''}
                    ${avatar.pain_points?.length > 0 ? `
                        <div class="mb-3">
                            <div style="font-size:12px;font-weight:500;color:var(--danger);margin-bottom:4px;">Pain Points</div>
                            <ul style="margin:0;padding-left:16px;font-size:13px;">
                                ${avatar.pain_points.slice(0, 3).map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${avatar.desires?.length > 0 ? `
                        <div class="mb-3">
                            <div style="font-size:12px;font-weight:500;color:var(--success);margin-bottom:4px;">Desires</div>
                            <ul style="margin:0;padding-left:16px;font-size:13px;">
                                ${avatar.desires.slice(0, 3).map(d => `<li>${d}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${avatar.language_samples?.length > 0 ? `
                        <div>
                            <div style="font-size:12px;font-weight:500;color:var(--info);margin-bottom:4px;">They say...</div>
                            <div style="font-style:italic;font-size:13px;color:var(--text-secondary);">
                                "${avatar.language_samples[0]}"
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            avatarContainer.querySelectorAll('[data-edit-avatar]').forEach(card => {
                card.addEventListener('click', () => editAvatar(card.dataset.editAvatar, avatars));
            });
        } else {
            avatarContainer.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-icon">👤</div>
                    <div class="empty-state-title">No avatars defined</div>
                    <div class="empty-state-text">Create detailed customer avatars to fuel your creative</div>
                </div>
            `;
        }
        
        // Render objections
        const objectionsBody = document.getElementById('objectionsBody');
        if (objections.length > 0) {
            objectionsBody.innerHTML = objections.map(obj => `
                <tr data-edit-objection="${obj.id}">
                    <td style="font-weight:500;">${obj.objection_text}</td>
                    <td><span class="badge ${getFrequencyClass(obj.frequency)}">${obj.frequency}</span></td>
                    <td style="max-width:250px;">
                        ${obj.counter_arguments?.length > 0 
                            ? obj.counter_arguments.map(c => `<div style="font-size:13px;">• ${c}</div>`).join('') 
                            : '-'}
                    </td>
                    <td style="max-width:250px;">
                        ${obj.proof_points?.length > 0 
                            ? obj.proof_points.map(p => `<div style="font-size:13px;">• ${p}</div>`).join('') 
                            : '-'}
                    </td>
                    <td>
                        <button class="btn btn-ghost btn-sm">Edit</button>
                    </td>
                </tr>
            `).join('');
            
            objectionsBody.querySelectorAll('[data-edit-objection]').forEach(row => {
                row.addEventListener('click', () => editObjection(row.dataset.editObjection, objections));
            });
        } else {
            objectionsBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-text">Map out customer objections and how to counter them</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('Error loading audience data:', error);
    }
}

function getFrequencyClass(freq) {
    if (freq === 'common') return 'badge-danger';
    if (freq === 'occasional') return 'badge-warning';
    return 'badge-neutral';
}

function editAvatar(id, avatars) {
    const avatar = avatars.find(a => a.id === id);
    if (!avatar) return;
    
    const form = document.querySelector('#avatarForm');
    form.querySelector('[name="id"]').value = avatar.id;
    form.querySelector('[name="name"]').value = avatar.name || '';
    form.querySelector('[name="demographics"]').value = avatar.demographics ? JSON.stringify(avatar.demographics, null, 2) : '';
    form.querySelector('[name="pain_points"]').value = (avatar.pain_points || []).join('\n');
    form.querySelector('[name="desires"]').value = (avatar.desires || []).join('\n');
    form.querySelector('[name="language_samples"]').value = (avatar.language_samples || []).join('\n');
    form.querySelector('[name="awareness_level"]').value = avatar.awareness_level || '';
    form.querySelector('[name="notes"]').value = avatar.notes || '';
    
    document.querySelector('#avatarModal').classList.add('active');
}

function editObjection(id, objections) {
    const obj = objections.find(o => o.id === id);
    if (!obj) return;
    
    const form = document.querySelector('#objectionForm');
    form.querySelector('[name="id"]').value = obj.id;
    form.querySelector('[name="objection_text"]').value = obj.objection_text || '';
    form.querySelector('[name="frequency"]').value = obj.frequency || 'occasional';
    form.querySelector('[name="counter_arguments"]').value = (obj.counter_arguments || []).join('\n');
    form.querySelector('[name="proof_points"]').value = (obj.proof_points || []).join('\n');
    form.querySelector('[name="source"]').value = obj.source || '';
    
    document.querySelector('#objectionModal').classList.add('active');
}
