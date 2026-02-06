// Fatigue Tracker Tab
import { db } from '../supabase.js';
import { formatCurrency, formatRoas, formatPercent, formatDate, daysSince, calculateFatigueScore, getFatigueStatus } from '../utils/helpers.js';
import { createSparkline, destroyChart } from '../utils/charts.js';

let currentPeriod = '7d';
let charts = [];

export async function initFatigueTracker(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">⚡ Creative Fatigue Tracker</h1>
            <p class="page-subtitle">Monitor ad performance trends and know when to iterate</p>
        </div>
        
        <!-- Summary Cards -->
        <section class="mb-6">
            <div class="card-grid card-grid-4" id="fatigueSummary">
                <div class="metric-card">
                    <div class="metric-label">Active Ads</div>
                    <div class="metric-value" id="activeAdsCount">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Scaling</div>
                    <div class="metric-value" id="scalingCount" style="color: var(--success);">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Plateaued</div>
                    <div class="metric-value" id="plateauedCount" style="color: var(--warning);">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Declining</div>
                    <div class="metric-value" id="decliningCount" style="color: var(--danger);">--</div>
                </div>
            </div>
        </section>
        
        <!-- Period Toggle -->
        <section class="mb-4">
            <div class="controls-bar">
                <div class="filter-group">
                    <span class="filter-label">Analysis Period:</span>
                    <div class="toggle-group">
                        <button class="toggle-btn-group active" data-period="7d">7 Days</button>
                        <button class="toggle-btn-group" data-period="14d">14 Days</button>
                        <button class="toggle-btn-group" data-period="30d">30 Days</button>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Fatigue Table -->
        <section>
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Creative</th>
                                <th>Days Running</th>
                                <th>Spend Trend</th>
                                <th>ROAS Trend</th>
                                <th>CTR Trend</th>
                                <th>CPA Trend</th>
                                <th>Fatigue Score</th>
                                <th>Status</th>
                                <th>Suggestion</th>
                            </tr>
                        </thead>
                        <tbody id="fatigueTableBody">
                            <tr><td colspan="9"><div class="loading"><div class="spinner"></div></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        
        <!-- Iteration Suggestions -->
        <section class="mt-6">
            <h2>💡 Iteration Suggestions</h2>
            <div id="iterationSuggestions" class="card">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
    `;
    
    setupEventListeners(container);
    await loadFatigueData();
}

function setupEventListeners(container) {
    container.querySelectorAll('[data-period]').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            loadFatigueData();
        });
    });
}

async function loadFatigueData() {
    // Destroy existing charts
    charts.forEach(chart => destroyChart(chart));
    charts = [];
    
    try {
        const days = parseInt(currentPeriod);
        
        // Fetch active creatives
        const creatives = await db.fetch('creatives', {
            filters: [{ column: 'status', value: 'active' }]
        });
        
        // Fetch metrics for the period
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const metrics = await db.fetch('creative_metrics', {
            brandFilter: false,
            order: { column: 'date', ascending: true }
        });
        
        // Group metrics by creative
        const metricsByCreative = {};
        metrics.forEach(m => {
            if (new Date(m.date) >= cutoffDate) {
                if (!metricsByCreative[m.creative_id]) {
                    metricsByCreative[m.creative_id] = [];
                }
                metricsByCreative[m.creative_id].push(m);
            }
        });
        
        // Calculate fatigue for each creative
        const fatigueData = creatives.map(creative => {
            const creativeMetrics = metricsByCreative[creative.id] || [];
            const fatigueScore = calculateFatigueScore(creativeMetrics, days);
            const status = getFatigueStatus(fatigueScore);
            
            return {
                ...creative,
                metrics: creativeMetrics,
                fatigueScore,
                status
            };
        }).sort((a, b) => (b.fatigueScore || 0) - (a.fatigueScore || 0));
        
        // Update summary counts
        document.getElementById('activeAdsCount').textContent = fatigueData.length;
        document.getElementById('scalingCount').textContent = fatigueData.filter(d => d.fatigueScore !== null && d.fatigueScore < 20).length;
        document.getElementById('plateauedCount').textContent = fatigueData.filter(d => d.fatigueScore !== null && d.fatigueScore >= 50 && d.fatigueScore < 75).length;
        document.getElementById('decliningCount').textContent = fatigueData.filter(d => d.fatigueScore !== null && d.fatigueScore >= 75).length;
        
        // Render table
        const tbody = document.getElementById('fatigueTableBody');
        if (fatigueData.length > 0) {
            tbody.innerHTML = fatigueData.map((item, index) => `
                <tr>
                    <td>
                        <div style="font-weight:500;">${item.name}</div>
                        <div class="text-muted" style="font-size:12px;">${item.platform?.toUpperCase() || ''}</div>
                    </td>
                    <td class="mono">${daysSince(item.launch_date) ?? '-'}</td>
                    <td><canvas id="sparkline-spend-${index}" class="sparkline"></canvas></td>
                    <td><canvas id="sparkline-roas-${index}" class="sparkline"></canvas></td>
                    <td><canvas id="sparkline-ctr-${index}" class="sparkline"></canvas></td>
                    <td><canvas id="sparkline-cpa-${index}" class="sparkline"></canvas></td>
                    <td>
                        <span class="mono" style="font-size:18px;font-weight:600;">${item.fatigueScore ?? '-'}</span>
                        <span class="text-muted">/100</span>
                    </td>
                    <td><span class="badge ${item.status.class}">${item.status.label}</span></td>
                    <td style="max-width:200px;">${getSuggestion(item)}</td>
                </tr>
            `).join('');
            
            // Create sparkline charts after rendering
            requestAnimationFrame(() => {
                fatigueData.forEach((item, index) => {
                    if (item.metrics.length >= 2) {
                        const spendCanvas = document.getElementById(`sparkline-spend-${index}`);
                        const roasCanvas = document.getElementById(`sparkline-roas-${index}`);
                        const ctrCanvas = document.getElementById(`sparkline-ctr-${index}`);
                        const cpaCanvas = document.getElementById(`sparkline-cpa-${index}`);
                        
                        if (spendCanvas) charts.push(createSparkline(spendCanvas, item.metrics.map(m => m.spend)));
                        if (roasCanvas) charts.push(createSparkline(roasCanvas, item.metrics.map(m => m.roas)));
                        if (ctrCanvas) charts.push(createSparkline(ctrCanvas, item.metrics.map(m => m.ctr)));
                        if (cpaCanvas) charts.push(createSparkline(cpaCanvas, item.metrics.map(m => m.cpa)));
                    }
                });
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="empty-state">
                            <div class="empty-state-icon">⚡</div>
                            <div class="empty-state-title">No active creatives</div>
                            <div class="empty-state-text">Add creatives and sync daily metrics to track fatigue</div>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Render iteration suggestions
        const decliningAds = fatigueData.filter(d => d.fatigueScore >= 50);
        const suggestionsContainer = document.getElementById('iterationSuggestions');
        
        if (decliningAds.length > 0) {
            suggestionsContainer.innerHTML = `
                <div class="mb-4">
                    <p class="text-secondary mb-4">Based on your fatigued creatives, here are specific iteration ideas:</p>
                </div>
                ${decliningAds.slice(0, 5).map(ad => `
                    <div class="alert alert-warning mb-4">
                        <div class="alert-content">
                            <div class="alert-title">${ad.name}</div>
                            <div>${getDetailedSuggestion(ad)}</div>
                        </div>
                    </div>
                `).join('')}
            `;
        } else {
            suggestionsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">All ads performing well</div>
                    <div class="empty-state-text">No iteration needed right now. Keep monitoring!</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading fatigue data:', error);
        document.getElementById('fatigueTableBody').innerHTML = `
            <tr><td colspan="9" class="text-danger">Error loading data: ${error.message}</td></tr>
        `;
    }
}

function getSuggestion(item) {
    if (item.fatigueScore === null) return '<span class="text-muted">Need more data</span>';
    if (item.fatigueScore < 20) return '<span style="color:var(--success)">Keep scaling</span>';
    if (item.fatigueScore < 50) return '<span class="text-secondary">Monitor closely</span>';
    if (item.fatigueScore < 75) return '<span style="color:var(--warning)">Consider new hook</span>';
    return '<span style="color:var(--danger)">Iterate or kill</span>';
}

function getDetailedSuggestion(ad) {
    const suggestions = [];
    
    if (ad.hook_type) {
        suggestions.push(`Try a different hook style (current: ${ad.hook_type})`);
    } else {
        suggestions.push('Test a question hook or bold claim opener');
    }
    
    if (ad.ad_type === 'ugc') {
        suggestions.push('Try a different creator or filming environment');
    } else if (ad.ad_type === 'static') {
        suggestions.push('Test a video version or carousel format');
    }
    
    suggestions.push('Keep the same offer/CTA if conversion rate is still good');
    
    return suggestions.join(' • ');
}
