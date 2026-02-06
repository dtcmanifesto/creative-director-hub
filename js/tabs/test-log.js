// Test Log & Learnings Tab
import { db } from '../supabase.js';
import { formatDate, getStatusClass } from '../utils/helpers.js';

export async function initTestLog(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">🧪 Test Log & Learnings</h1>
                <p class="page-subtitle">What we tested, what we learned, extracted patterns</p>
            </div>
            <button class="btn btn-primary" id="addTestBtn">+ Log New Test</button>
        </div>
        
        <!-- Pattern Recognition -->
        <section class="mb-6">
            <h2>🎯 Winning Patterns</h2>
            <div class="card-grid card-grid-3" id="patternsGrid">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Codified Rules -->
        <section class="mb-6">
            <h2>📜 Codified Rules</h2>
            <div class="card" id="rulesContainer">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Test Log Table -->
        <section>
            <div class="section-header">
                <h2>📋 Test History</h2>
                <div class="filter-group">
                    <select class="form-select" id="testStatusFilter" style="width:140px;">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="complete">Complete</option>
                        <option value="inconclusive">Inconclusive</option>
                    </select>
                </div>
            </div>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Hypothesis</th>
                                <th>Variables</th>
                                <th>Platform</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Winner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="testTableBody">
                            <tr><td colspan="8"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Add/Edit Test Modal -->
        <div class="modal-overlay" id="testModal">
            <div class="modal" style="max-width:640px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="testModalTitle">Log New Test</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="testForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Test Name *</label>
                            <input type="text" class="form-input" name="name" required placeholder="e.g., Question Hook vs Bold Claim">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Hypothesis</label>
                            <textarea class="form-textarea" name="hypothesis" rows="2" placeholder="We believe that... will result in..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Variables Tested</label>
                            <div class="card-grid card-grid-3" style="gap:8px;">
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_hook"> Hook
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_offer"> Offer
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_format"> Format
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_thumbnail"> Thumbnail
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_cta"> CTA
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                    <input type="checkbox" name="var_angle"> Angle
                                </label>
                            </div>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Platform</label>
                                <select class="form-select" name="platform">
                                    <option value="">Select...</option>
                                    <option value="meta">Meta</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-select" name="status">
                                    <option value="active">Active</option>
                                    <option value="complete">Complete</option>
                                    <option value="inconclusive">Inconclusive</option>
                                </select>
                            </div>
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
                            <label class="form-label">Winner</label>
                            <input type="text" class="form-input" name="winner" placeholder="Which variant won?">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Learning Summary</label>
                            <textarea class="form-textarea" name="learning_summary" rows="3" placeholder="Key takeaway from this test..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveTestBtn">Save Test</button>
                </div>
            </div>
        </div>
        
        <!-- Add Learning Modal -->
        <div class="modal-overlay" id="learningModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add Learning Rule</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="learningForm">
                        <div class="form-group">
                            <label class="form-label">Rule *</label>
                            <textarea class="form-textarea" name="rule_text" rows="3" required placeholder="e.g., Always lead with movement in first 1s on TikTok"></textarea>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select class="form-select" name="category">
                                    <option value="hook">Hook</option>
                                    <option value="offer">Offer</option>
                                    <option value="format">Format</option>
                                    <option value="platform">Platform</option>
                                    <option value="audience">Audience</option>
                                    <option value="creative-element">Creative Element</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confidence</label>
                                <select class="form-select" name="confidence">
                                    <option value="high">High</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveLearningBtn">Save Rule</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadTestData();
}

function setupEventListeners(container) {
    const testModal = container.querySelector('#testModal');
    const learningModal = container.querySelector('#learningModal');
    
    // Add Test button
    container.querySelector('#addTestBtn').addEventListener('click', () => {
        container.querySelector('#testForm').reset();
        container.querySelector('#testModalTitle').textContent = 'Log New Test';
        testModal.classList.add('active');
    });
    
    // Close modals
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            testModal.classList.remove('active');
            learningModal.classList.remove('active');
        });
    });
    
    [testModal, learningModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
    
    // Save Test
    container.querySelector('#saveTestBtn').addEventListener('click', async () => {
        const form = container.querySelector('#testForm');
        const formData = new FormData(form);
        
        // Build variables_tested JSON
        const variables = {};
        ['hook', 'offer', 'format', 'thumbnail', 'cta', 'angle'].forEach(v => {
            variables[v] = formData.get(`var_${v}`) === 'on';
        });
        
        const data = {
            name: formData.get('name'),
            hypothesis: formData.get('hypothesis'),
            variables_tested: variables,
            platform: formData.get('platform'),
            status: formData.get('status'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            winner: formData.get('winner'),
            learning_summary: formData.get('learning_summary')
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('tests', id, data);
            } else {
                await db.insert('tests', data);
            }
            testModal.classList.remove('active');
            form.reset();
            loadTestData();
        } catch (error) {
            alert('Error saving test: ' + error.message);
        }
    });
    
    // Save Learning
    container.querySelector('#saveLearningBtn').addEventListener('click', async () => {
        const form = container.querySelector('#learningForm');
        const formData = new FormData(form);
        
        try {
            await db.insert('learnings', {
                rule_text: formData.get('rule_text'),
                category: formData.get('category'),
                confidence: formData.get('confidence')
            });
            learningModal.classList.remove('active');
            form.reset();
            loadTestData();
        } catch (error) {
            alert('Error saving learning: ' + error.message);
        }
    });
    
    // Status filter
    container.querySelector('#testStatusFilter').addEventListener('change', () => {
        loadTestData();
    });
}

async function loadTestData() {
    try {
        const statusFilter = document.getElementById('testStatusFilter').value;
        
        // Fetch tests
        const filters = statusFilter !== 'all' ? [{ column: 'status', value: statusFilter }] : [];
        const tests = await db.fetch('tests', {
            filters,
            order: { column: 'created_at', ascending: false }
        });
        
        // Fetch learnings
        const learnings = await db.fetch('learnings', {
            order: { column: 'created_at', ascending: false }
        });
        
        // Render patterns (group learnings by category)
        const patternsByCategory = {};
        learnings.forEach(l => {
            const cat = l.category || 'general';
            if (!patternsByCategory[cat]) patternsByCategory[cat] = [];
            patternsByCategory[cat].push(l);
        });
        
        const patternsGrid = document.getElementById('patternsGrid');
        const categories = Object.keys(patternsByCategory);
        if (categories.length > 0) {
            patternsGrid.innerHTML = categories.map(cat => `
                <div class="card">
                    <h3 style="text-transform:capitalize;margin-bottom:12px;">${cat}</h3>
                    <div style="font-size:24px;font-weight:700;color:var(--accent);margin-bottom:8px;">
                        ${patternsByCategory[cat].length}
                    </div>
                    <div class="text-muted">learnings</div>
                </div>
            `).join('');
        } else {
            patternsGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-text">Complete tests and extract learnings to see patterns</div>
                </div>
            `;
        }
        
        // Render rules
        const rulesContainer = document.getElementById('rulesContainer');
        const highConfidenceLearnings = learnings.filter(l => l.confidence === 'high');
        
        if (highConfidenceLearnings.length > 0) {
            rulesContainer.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <span class="text-secondary">${highConfidenceLearnings.length} high-confidence rules</span>
                    <button class="btn btn-sm btn-secondary" id="addRuleBtn">+ Add Rule</button>
                </div>
                ${highConfidenceLearnings.map(l => `
                    <div class="alert alert-success mb-3">
                        <span class="alert-icon">✓</span>
                        <div class="alert-content">
                            <div>${l.rule_text}</div>
                            <div class="text-muted" style="font-size:12px;margin-top:4px;">
                                ${l.category || 'General'} • ${l.confidence} confidence
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
        } else {
            rulesContainer.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-muted">No high-confidence rules yet</span>
                    <button class="btn btn-sm btn-secondary" id="addRuleBtn">+ Add Rule</button>
                </div>
            `;
        }
        
        // Add rule button
        document.getElementById('addRuleBtn')?.addEventListener('click', () => {
            document.getElementById('learningModal').classList.add('active');
        });
        
        // Render test table
        const tbody = document.getElementById('testTableBody');
        if (tests.length > 0) {
            tbody.innerHTML = tests.map(test => {
                const vars = test.variables_tested || {};
                const activeVars = Object.entries(vars).filter(([k, v]) => v).map(([k]) => k);
                
                return `
                    <tr>
                        <td style="font-weight:500;">${test.name}</td>
                        <td style="max-width:200px;" class="text-secondary">${test.hypothesis || '-'}</td>
                        <td>${activeVars.length > 0 ? activeVars.map(v => `<span class="badge badge-neutral" style="margin:2px;">${v}</span>`).join('') : '-'}</td>
                        <td>${test.platform?.toUpperCase() || '-'}</td>
                        <td class="mono">${formatDate(test.start_date) || '-'}</td>
                        <td><span class="badge ${getStatusClass(test.status)}">${test.status}</span></td>
                        <td>${test.winner || '-'}</td>
                        <td>
                            <button class="btn btn-ghost btn-sm" data-edit-test="${test.id}">Edit</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Edit handlers
            tbody.querySelectorAll('[data-edit-test]').forEach(btn => {
                btn.addEventListener('click', () => editTest(btn.dataset.editTest, tests));
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon">🧪</div>
                            <div class="empty-state-title">No tests logged</div>
                            <div class="empty-state-text">Start logging your A/B tests to build your knowledge base</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('Error loading test data:', error);
    }
}

function editTest(id, tests) {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    
    const form = document.querySelector('#testForm');
    form.querySelector('[name="id"]').value = test.id;
    form.querySelector('[name="name"]').value = test.name || '';
    form.querySelector('[name="hypothesis"]').value = test.hypothesis || '';
    form.querySelector('[name="platform"]').value = test.platform || '';
    form.querySelector('[name="status"]').value = test.status || 'active';
    form.querySelector('[name="start_date"]').value = test.start_date || '';
    form.querySelector('[name="end_date"]').value = test.end_date || '';
    form.querySelector('[name="winner"]').value = test.winner || '';
    form.querySelector('[name="learning_summary"]').value = test.learning_summary || '';
    
    const vars = test.variables_tested || {};
    ['hook', 'offer', 'format', 'thumbnail', 'cta', 'angle'].forEach(v => {
        form.querySelector(`[name="var_${v}"]`).checked = vars[v] || false;
    });
    
    document.querySelector('#testModalTitle').textContent = 'Edit Test';
    document.querySelector('#testModal').classList.add('active');
}
