// Daily Briefing Tab - Landing Page
import { db } from '../firebase.js';
import { formatCurrency, formatRoas, formatPercent, formatDate, getFatigueStatus, calculateFatigueScore } from '../utils/helpers.js';

export async function initDailyBriefing(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">☀️ Daily Briefing</h1>
            <p class="page-subtitle">Your creative intelligence snapshot for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <!-- Key Metrics -->
        <section class="mb-6">
            <div class="card-grid card-grid-4" id="metricsGrid">
                <div class="metric-card">
                    <div class="metric-label">Total Spend (7d)</div>
                    <div class="metric-value" id="totalSpend">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Blended ROAS</div>
                    <div class="metric-value" id="blendedRoas">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Top Performer</div>
                    <div class="metric-value" id="topPerformer" style="font-size: 16px;">--</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Needs Attention</div>
                    <div class="metric-value" id="needsAttention" style="font-size: 16px;">--</div>
                </div>
            </div>
        </section>
        
        <!-- Alerts Section -->
        <section class="mb-6">
            <h2>🚨 Alerts</h2>
            <div id="alertsContainer">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </section>
        
        <!-- Quick Actions -->
        <section class="mb-6">
            <h2>⚡ Quick Actions</h2>
            <div class="quick-actions">
                <a href="#fatigue-tracker" class="quick-action">
                    <span class="quick-action-icon">⚡</span>
                    <span>Review Fatigued Ads</span>
                </a>
                <a href="#competitor-intel" class="quick-action">
                    <span class="quick-action-icon">🔍</span>
                    <span>Check Competitor Intel</span>
                </a>
                <a href="#test-log" class="quick-action">
                    <span class="quick-action-icon">🧪</span>
                    <span>Log Test Results</span>
                </a>
                <a href="#trending" class="quick-action">
                    <span class="quick-action-icon">🔥</span>
                    <span>Browse Trends</span>
                </a>
                <a href="#performance" class="quick-action">
                    <span class="quick-action-icon">📊</span>
                    <span>View Winners Wall</span>
                </a>
            </div>
        </section>
        
        <!-- Focus of the Day -->
        <section class="mb-6">
            <div class="card">
                <h2>🎯 Focus of the Day</h2>
                <p id="focusOfDay" class="text-secondary">Analyzing your data...</p>
            </div>
        </section>
        
        <!-- Recent Activity -->
        <section>
            <h2>📋 Recent Activity</h2>
            <div class="card">
                <div id="recentActivity">
                    <div class="loading"><div class="spinner"></div></div>
                </div>
            </div>
        </section>
    `;
    
    await loadBriefingData(container);
}

async function loadBriefingData(container) {
    try {
        // Fetch creatives with recent metrics
        const creatives = await db.fetch('creatives', {
            filters: [{ column: 'status', value: 'active' }],
            order: { column: 'spend', ascending: false }
        });
        
        // Calculate totals
        const totalSpend = creatives.reduce((sum, c) => sum + (parseFloat(c.spend) || 0), 0);
        const totalRevenue = creatives.reduce((sum, c) => sum + ((parseFloat(c.spend) || 0) * (parseFloat(c.roas) || 0)), 0);
        const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        
        // Update metrics
        document.getElementById('totalSpend').textContent = formatCurrency(totalSpend);
        document.getElementById('blendedRoas').textContent = formatRoas(blendedRoas);
        
        // Top performer
        const topPerformer = creatives.sort((a, b) => (b.roas || 0) - (a.roas || 0))[0];
        if (topPerformer) {
            document.getElementById('topPerformer').textContent = topPerformer.name || 'N/A';
        }
        
        // Fetch metrics for fatigue analysis
        const metrics = await db.fetch('creative_metrics', {
            brandFilter: false,
            order: { column: 'date', ascending: false },
            limit: 500
        });
        
        // Group metrics by creative
        const metricsByCreative = {};
        metrics.forEach(m => {
            if (!metricsByCreative[m.creative_id]) {
                metricsByCreative[m.creative_id] = [];
            }
            metricsByCreative[m.creative_id].push(m);
        });
        
        // Find fatigued ads
        const fatiguedAds = [];
        creatives.forEach(creative => {
            const creativeMetrics = metricsByCreative[creative.id] || [];
            const fatigueScore = calculateFatigueScore(creativeMetrics, 7);
            if (fatigueScore !== null && fatigueScore >= 50) {
                fatiguedAds.push({ ...creative, fatigueScore });
            }
        });
        
        // Needs attention
        document.getElementById('needsAttention').textContent = 
            fatiguedAds.length > 0 ? `${fatiguedAds.length} fatigued` : 'All good!';
        
        // Build alerts
        const alertsContainer = document.getElementById('alertsContainer');
        let alertsHtml = '';
        
        if (fatiguedAds.length > 0) {
            alertsHtml += `
                <div class="alert alert-danger">
                    <span class="alert-icon">⚠️</span>
                    <div class="alert-content">
                        <div class="alert-title">${fatiguedAds.length} Ads Showing Fatigue</div>
                        <div>${fatiguedAds.slice(0, 3).map(a => a.name).join(', ')}${fatiguedAds.length > 3 ? ` and ${fatiguedAds.length - 3} more` : ''}</div>
                    </div>
                </div>
            `;
        }
        
        // Fetch trends for alerts
        const trends = await db.fetch('trends', {
            filters: [
                { column: 'status', value: 'active' },
                { column: 'relevance_score', value: 'high' }
            ],
            limit: 5
        });
        
        if (trends.length > 0) {
            alertsHtml += `
                <div class="alert alert-info">
                    <span class="alert-icon">🔥</span>
                    <div class="alert-content">
                        <div class="alert-title">${trends.length} High-Relevance Trends Spotted</div>
                        <div>${trends.slice(0, 2).map(t => t.title).join(', ')}</div>
                    </div>
                </div>
            `;
        }
        
        // Fetch recent competitor ads
        const competitorAds = await db.fetch('competitor_ads', {
            brandFilter: false,
            order: { column: 'date_spotted', ascending: false },
            limit: 5
        });
        
        const recentCompetitorAds = competitorAds.filter(ad => {
            const daysSince = (new Date() - new Date(ad.date_spotted)) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
        });
        
        if (recentCompetitorAds.length > 0) {
            alertsHtml += `
                <div class="alert alert-warning">
                    <span class="alert-icon">👁️</span>
                    <div class="alert-content">
                        <div class="alert-title">${recentCompetitorAds.length} New Competitor Ads This Week</div>
                        <div>Check competitor intel for details</div>
                    </div>
                </div>
            `;
        }
        
        // Fetch tests awaiting results
        const tests = await db.fetch('tests', {
            filters: [{ column: 'status', value: 'active' }]
        });
        
        if (tests.length > 0) {
            alertsHtml += `
                <div class="alert alert-success">
                    <span class="alert-icon">🧪</span>
                    <div class="alert-content">
                        <div class="alert-title">${tests.length} Active Tests Running</div>
                        <div>${tests.slice(0, 2).map(t => t.name).join(', ')}</div>
                    </div>
                </div>
            `;
        }
        
        if (!alertsHtml) {
            alertsHtml = '<div class="empty-state"><div class="empty-state-text">No alerts today. Everything looks good! 🎉</div></div>';
        }
        
        alertsContainer.innerHTML = alertsHtml;
        
        // Generate focus of the day
        let focus = '';
        if (fatiguedAds.length >= 3) {
            focus = `🔴 Priority: Review and iterate on ${fatiguedAds.length} fatigued ads before they drain budget.`;
        } else if (trends.length > 0) {
            focus = `🔵 Opportunity: ${trends.length} trending formats to adapt. Check Trending Now for inspiration.`;
        } else if (tests.length > 0) {
            focus = `🟢 Monitor: ${tests.length} active tests running. Check for statistically significant results.`;
        } else {
            focus = `✅ Steady state: Performance is stable. Good day to plan new tests or scout competitors.`;
        }
        document.getElementById('focusOfDay').textContent = focus;
        
        // Recent activity
        const recentActivityHtml = `
            <div class="text-secondary">
                <p>• ${creatives.length} active creatives running</p>
                <p>• ${formatCurrency(totalSpend)} spent in last 7 days</p>
                <p>• ${tests.length} tests in progress</p>
                <p>• ${trends.length} trends being tracked</p>
            </div>
        `;
        document.getElementById('recentActivity').innerHTML = recentActivityHtml;
        
    } catch (error) {
        console.error('Error loading briefing data:', error);
        document.getElementById('alertsContainer').innerHTML = `
            <div class="alert alert-danger">
                <span class="alert-icon">❌</span>
                <div class="alert-content">
                    <div class="alert-title">Error Loading Data</div>
                    <div>Check your Supabase connection. Error: ${error.message}</div>
                </div>
            </div>
        `;
    }
}
