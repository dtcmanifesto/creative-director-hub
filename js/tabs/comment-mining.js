// Comment Mining Tab
import { db } from '../supabase.js';
import { formatDate } from '../utils/helpers.js';
import { createBarChart, destroyChart } from '../utils/charts.js';

let chart = null;

export async function initCommentMining(container) {
    container.innerHTML = `
        <div class="page-header flex justify-between items-center">
            <div>
                <h1 class="page-title">💬 Comment Mining</h1>
                <p class="page-subtitle">Ad comment analysis for angle and hook discovery</p>
            </div>
            <button class="btn btn-primary" id="addCommentBtn">+ Add Comment</button>
        </div>
        
        <!-- Golden Nuggets -->
        <section class="mb-6">
            <h2>💎 Golden Nuggets</h2>
            <p class="text-secondary mb-4">Comments that could become hooks or angles</p>
            <div class="card-grid card-grid-3" id="goldenNuggets">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Theme Frequency Chart -->
        <section class="mb-6">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Theme Frequency</h3>
                </div>
                <div class="chart-container" style="height:250px;">
                    <canvas id="themeChart"></canvas>
                </div>
            </div>
        </section>
        
        <!-- Filters -->
        <section class="mb-4">
            <div class="controls-bar">
                <div class="filter-group">
                    <span class="filter-label">Theme:</span>
                    <select class="form-select" id="themeFilter" style="width:140px;">
                        <option value="all">All Themes</option>
                        <option value="objection">Objections</option>
                        <option value="praise">Praise</option>
                        <option value="question">Questions</option>
                        <option value="use-case">Use Cases</option>
                        <option value="comparison">Comparisons</option>
                        <option value="trigger">Purchase Triggers</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Sentiment:</span>
                    <select class="form-select" id="sentimentFilter" style="width:140px;">
                        <option value="all">All</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                        <option value="question">Question</option>
                    </select>
                </div>
            </div>
        </section>
        
        <!-- Comments Table -->
        <section>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style="width:40%;">Comment</th>
                                <th>Theme</th>
                                <th>Sentiment</th>
                                <th>Platform</th>
                                <th>Date</th>
                                <th>Golden</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="commentsBody">
                            <tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Add Comment Modal -->
        <div class="modal-overlay" id="commentModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add Comment</h3>
                    <button class="modal-close" data-close-modal>×</button>
                </div>
                <div class="modal-body">
                    <form id="commentForm">
                        <input type="hidden" name="id">
                        <div class="form-group">
                            <label class="form-label">Comment Text *</label>
                            <textarea class="form-textarea" name="comment_text" rows="3" required placeholder="Paste the comment..."></textarea>
                        </div>
                        <div class="card-grid card-grid-2">
                            <div class="form-group">
                                <label class="form-label">Theme</label>
                                <select class="form-select" name="theme">
                                    <option value="">Select...</option>
                                    <option value="objection">Objection</option>
                                    <option value="praise">Praise</option>
                                    <option value="question">Question</option>
                                    <option value="use-case">Use Case</option>
                                    <option value="comparison">Comparison</option>
                                    <option value="trigger">Purchase Trigger</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Sentiment</label>
                                <select class="form-select" name="sentiment">
                                    <option value="neutral">Neutral</option>
                                    <option value="positive">Positive</option>
                                    <option value="negative">Negative</option>
                                    <option value="question">Question</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Platform</label>
                            <select class="form-select" name="platform">
                                <option value="meta">Meta</option>
                                <option value="tiktok">TikTok</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                <input type="checkbox" name="is_golden_nugget">
                                <span>💎 Mark as Golden Nugget</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-textarea" name="notes" rows="2" placeholder="Why is this interesting?"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-close-modal>Cancel</button>
                    <button class="btn btn-primary" id="saveCommentBtn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners(container);
    await loadCommentData();
}

let currentTheme = 'all';
let currentSentiment = 'all';

function setupEventListeners(container) {
    const modal = container.querySelector('#commentModal');
    
    // Add button
    container.querySelector('#addCommentBtn').addEventListener('click', () => {
        container.querySelector('#commentForm').reset();
        modal.classList.add('active');
    });
    
    // Close modal
    container.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('active'));
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Filters
    container.querySelector('#themeFilter').addEventListener('change', (e) => {
        currentTheme = e.target.value;
        loadCommentData();
    });
    
    container.querySelector('#sentimentFilter').addEventListener('change', (e) => {
        currentSentiment = e.target.value;
        loadCommentData();
    });
    
    // Save
    container.querySelector('#saveCommentBtn').addEventListener('click', async () => {
        const form = container.querySelector('#commentForm');
        const formData = new FormData(form);
        
        const data = {
            comment_text: formData.get('comment_text'),
            theme: formData.get('theme'),
            sentiment: formData.get('sentiment'),
            platform: formData.get('platform'),
            is_golden_nugget: formData.get('is_golden_nugget') === 'on',
            notes: formData.get('notes'),
            date_spotted: new Date().toISOString().split('T')[0]
        };
        
        try {
            const id = formData.get('id');
            if (id) {
                await db.update('comments', id, data);
            } else {
                await db.insert('comments', data);
            }
            modal.classList.remove('active');
            form.reset();
            loadCommentData();
        } catch (error) {
            alert('Error saving comment: ' + error.message);
        }
    });
}

async function loadCommentData() {
    if (chart) destroyChart(chart);
    
    try {
        const filters = [];
        if (currentTheme !== 'all') {
            filters.push({ column: 'theme', value: currentTheme });
        }
        if (currentSentiment !== 'all') {
            filters.push({ column: 'sentiment', value: currentSentiment });
        }
        
        const comments = await db.fetch('comments', {
            filters,
            order: { column: 'date_spotted', ascending: false }
        });
        
        // All comments for chart
        const allComments = await db.fetch('comments', {
            order: { column: 'date_spotted', ascending: false }
        });
        
        // Golden nuggets
        const nuggets = allComments.filter(c => c.is_golden_nugget);
        const nuggetsContainer = document.getElementById('goldenNuggets');
        
        if (nuggets.length > 0) {
            nuggetsContainer.innerHTML = nuggets.slice(0, 6).map(c => `
                <div class="card" style="border-left:3px solid var(--warning);">
                    <div class="text-muted" style="font-size:11px;margin-bottom:8px;">
                        ${c.theme || 'Uncategorized'} • ${c.platform?.toUpperCase() || ''}
                    </div>
                    <p style="font-size:14px;font-style:italic;">"${c.comment_text}"</p>
                    ${c.notes ? `<p class="text-secondary mt-2" style="font-size:12px;">${c.notes}</p>` : ''}
                </div>
            `).join('');
        } else {
            nuggetsContainer.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-state-text">Mark comments as golden nuggets to highlight them here</div>
                </div>
            `;
        }
        
        // Theme frequency chart
        const themeCounts = {};
        allComments.forEach(c => {
            const theme = c.theme || 'uncategorized';
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
        
        const chartCanvas = document.getElementById('themeChart');
        if (Object.keys(themeCounts).length > 0) {
            chart = createBarChart(
                chartCanvas,
                Object.keys(themeCounts),
                Object.values(themeCounts),
                { horizontal: true }
            );
        }
        
        // Comments table
        const commentsBody = document.getElementById('commentsBody');
        if (comments.length > 0) {
            commentsBody.innerHTML = comments.map(c => `
                <tr data-edit-comment="${c.id}">
                    <td style="font-size:13px;">"${c.comment_text}"</td>
                    <td><span class="badge badge-neutral">${c.theme || '-'}</span></td>
                    <td><span class="badge ${getSentimentClass(c.sentiment)}">${c.sentiment || '-'}</span></td>
                    <td>${c.platform?.toUpperCase() || '-'}</td>
                    <td class="mono">${formatDate(c.date_spotted)}</td>
                    <td>${c.is_golden_nugget ? '💎' : ''}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" data-toggle-nugget="${c.id}" title="Toggle golden nugget">
                            ${c.is_golden_nugget ? '⭐' : '☆'}
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Toggle nugget handlers
            commentsBody.querySelectorAll('[data-toggle-nugget]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const comment = comments.find(c => c.id === btn.dataset.toggleNugget);
                    if (comment) {
                        await db.update('comments', comment.id, { is_golden_nugget: !comment.is_golden_nugget });
                        loadCommentData();
                    }
                });
            });
            
            // Edit handlers
            commentsBody.querySelectorAll('[data-edit-comment]').forEach(row => {
                row.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        editComment(row.dataset.editComment, comments);
                    }
                });
            });
        } else {
            commentsBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">💬</div>
                            <div class="empty-state-title">No comments logged</div>
                            <div class="empty-state-text">Start mining ad comments for insights</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function getSentimentClass(sentiment) {
    if (sentiment === 'positive') return 'badge-success';
    if (sentiment === 'negative') return 'badge-danger';
    if (sentiment === 'question') return 'badge-info';
    return 'badge-neutral';
}

function editComment(id, comments) {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    const form = document.querySelector('#commentForm');
    form.querySelector('[name="id"]').value = comment.id;
    form.querySelector('[name="comment_text"]').value = comment.comment_text || '';
    form.querySelector('[name="theme"]').value = comment.theme || '';
    form.querySelector('[name="sentiment"]').value = comment.sentiment || 'neutral';
    form.querySelector('[name="platform"]').value = comment.platform || 'meta';
    form.querySelector('[name="is_golden_nugget"]').checked = comment.is_golden_nugget || false;
    form.querySelector('[name="notes"]').value = comment.notes || '';
    
    document.querySelector('#commentModal').classList.add('active');
}
