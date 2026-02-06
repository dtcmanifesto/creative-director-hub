// Creative Mix Analysis Tab
import { db } from '../firebase.js';
import { formatPercent } from '../utils/helpers.js';
import { createDonutChart, createBarChart, destroyChart, CHART_PALETTE } from '../utils/charts.js';

let charts = [];

export async function initCreativeMix(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">🎬 Creative Mix Analysis</h1>
            <p class="page-subtitle">Identify gaps and opportunities in your creative strategy</p>
        </div>
        
        <!-- Gap Analysis Alert -->
        <section class="mb-6" id="gapAlerts">
            <div class="loading"><div class="spinner"></div></div>
        </section>
        
        <!-- Charts Grid -->
        <section class="mb-6">
            <div class="card-grid card-grid-2">
                <!-- Environment Breakdown -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Environment Breakdown</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="environmentChart"></canvas>
                    </div>
                </div>
                
                <!-- Format Mix -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Format Mix</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="formatChart"></canvas>
                    </div>
                </div>
                
                <!-- Filming Style -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Filming Style</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="filmingStyleChart"></canvas>
                    </div>
                </div>
                
                <!-- Talent Demographics -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Talent Demographics</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="demographicsChart"></canvas>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Detailed Breakdown Tables -->
        <section>
            <div class="card-grid card-grid-2">
                <!-- Performance by Environment -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Performance by Environment</h3>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Environment</th>
                                    <th>Count</th>
                                    <th>% of Total</th>
                                    <th>Avg ROAS</th>
                                </tr>
                            </thead>
                            <tbody id="environmentTable">
                                <tr><td colspan="4"><div class="loading"><div class="spinner"></div></div></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Performance by Format -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Performance by Format</h3>
                    </div>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Format</th>
                                    <th>Count</th>
                                    <th>% of Total</th>
                                    <th>Avg ROAS</th>
                                </tr>
                            </thead>
                            <tbody id="formatTable">
                                <tr><td colspan="4"><div class="loading"><div class="spinner"></div></div></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    await loadCreativeMixData();
}

async function loadCreativeMixData() {
    // Destroy existing charts
    charts.forEach(chart => destroyChart(chart));
    charts = [];
    
    try {
        // Fetch creatives with their tags
        const creatives = await db.fetch('creatives', {
            filters: [{ column: 'status', value: 'active' }]
        });
        
        const tags = await db.fetch('creative_tags', { brandFilter: false });
        
        // Create a map of creative_id to tags
        const tagsByCreative = {};
        tags.forEach(t => {
            tagsByCreative[t.creative_id] = t;
        });
        
        // Merge creatives with their tags
        const creativesWithTags = creatives.map(c => ({
            ...c,
            tags: tagsByCreative[c.id] || {}
        }));
        
        // Calculate distributions
        const envCounts = {};
        const formatCounts = {};
        const styleCounts = {};
        const genderCounts = {};
        const ageCounts = {};
        
        // Performance aggregates
        const envPerformance = {};
        const formatPerformance = {};
        
        creativesWithTags.forEach(c => {
            // Environment
            const env = c.tags.environment || 'Unknown';
            envCounts[env] = (envCounts[env] || 0) + 1;
            if (!envPerformance[env]) envPerformance[env] = { count: 0, totalRoas: 0 };
            envPerformance[env].count++;
            envPerformance[env].totalRoas += parseFloat(c.roas) || 0;
            
            // Format (from creative or tags)
            const format = c.tags.format || c.ad_type || 'Unknown';
            formatCounts[format] = (formatCounts[format] || 0) + 1;
            if (!formatPerformance[format]) formatPerformance[format] = { count: 0, totalRoas: 0 };
            formatPerformance[format].count++;
            formatPerformance[format].totalRoas += parseFloat(c.roas) || 0;
            
            // Filming style
            const style = c.tags.filming_style || 'Unknown';
            styleCounts[style] = (styleCounts[style] || 0) + 1;
            
            // Gender
            const gender = c.tags.talent_gender || 'Unknown';
            genderCounts[gender] = (genderCounts[gender] || 0) + 1;
            
            // Age
            const age = c.tags.talent_age_range || 'Unknown';
            ageCounts[age] = (ageCounts[age] || 0) + 1;
        });
        
        const total = creativesWithTags.length;
        
        // Render charts
        if (total > 0) {
            // Environment chart
            const envLabels = Object.keys(envCounts);
            const envData = Object.values(envCounts);
            const envCanvas = document.getElementById('environmentChart');
            charts.push(createDonutChart(envCanvas, envLabels, envData));
            
            // Format chart
            const formatLabels = Object.keys(formatCounts);
            const formatData = Object.values(formatCounts);
            const formatCanvas = document.getElementById('formatChart');
            charts.push(createDonutChart(formatCanvas, formatLabels, formatData));
            
            // Filming style chart
            const styleLabels = Object.keys(styleCounts);
            const styleData = Object.values(styleCounts);
            const styleCanvas = document.getElementById('filmingStyleChart');
            charts.push(createBarChart(styleCanvas, styleLabels, styleData, { horizontal: true }));
            
            // Demographics chart (gender)
            const genderLabels = Object.keys(genderCounts);
            const genderData = Object.values(genderCounts);
            const demoCanvas = document.getElementById('demographicsChart');
            charts.push(createDonutChart(demoCanvas, genderLabels, genderData));
        }
        
        // Render environment table
        const envTableBody = document.getElementById('environmentTable');
        envTableBody.innerHTML = Object.entries(envPerformance)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([env, data]) => `
                <tr>
                    <td>${env}</td>
                    <td class="mono">${data.count}</td>
                    <td class="mono">${formatPercent(data.count / total)}</td>
                    <td class="mono">${data.count > 0 ? (data.totalRoas / data.count).toFixed(2) + 'x' : '-'}</td>
                </tr>
            `).join('') || '<tr><td colspan="4" class="text-muted">No data</td></tr>';
        
        // Render format table
        const formatTableBody = document.getElementById('formatTable');
        formatTableBody.innerHTML = Object.entries(formatPerformance)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([format, data]) => `
                <tr>
                    <td>${format}</td>
                    <td class="mono">${data.count}</td>
                    <td class="mono">${formatPercent(data.count / total)}</td>
                    <td class="mono">${data.count > 0 ? (data.totalRoas / data.count).toFixed(2) + 'x' : '-'}</td>
                </tr>
            `).join('') || '<tr><td colspan="4" class="text-muted">No data</td></tr>';
        
        // Generate gap alerts
        const gaps = [];
        
        // Check for missing environments
        const allEnvironments = ['gym', 'home', 'outdoors', 'studio', 'garage'];
        const missingEnvs = allEnvironments.filter(e => !envCounts[e] || envCounts[e] === 0);
        if (missingEnvs.length > 0) {
            gaps.push({
                type: 'warning',
                title: 'Missing Environments',
                text: `No ads filmed in: ${missingEnvs.join(', ')}`
            });
        }
        
        // Check for over-concentration
        Object.entries(envCounts).forEach(([env, count]) => {
            const percent = count / total;
            if (percent > 0.5 && total >= 5) {
                gaps.push({
                    type: 'warning',
                    title: 'Over-indexed Environment',
                    text: `${formatPercent(percent)} of ads are filmed in ${env}. Consider diversifying.`
                });
            }
        });
        
        // Check talent diversity
        if (genderCounts['male'] && !genderCounts['female'] && total >= 5) {
            gaps.push({
                type: 'info',
                title: 'Talent Diversity',
                text: 'All talent is male. Consider testing female creators.'
            });
        }
        
        // Check format diversity
        const formatTypes = Object.keys(formatCounts).filter(f => f !== 'Unknown');
        if (formatTypes.length < 3 && total >= 5) {
            gaps.push({
                type: 'info',
                title: 'Limited Format Variety',
                text: `Only ${formatTypes.length} format type(s) in use. Test static, carousel, or different video styles.`
            });
        }
        
        // Render gap alerts
        const gapAlertsContainer = document.getElementById('gapAlerts');
        if (gaps.length > 0) {
            gapAlertsContainer.innerHTML = gaps.map(gap => `
                <div class="alert alert-${gap.type}">
                    <span class="alert-icon">${gap.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <div class="alert-content">
                        <div class="alert-title">${gap.title}</div>
                        <div>${gap.text}</div>
                    </div>
                </div>
            `).join('');
        } else if (total === 0) {
            gapAlertsContainer.innerHTML = `
                <div class="alert alert-info">
                    <span class="alert-icon">ℹ️</span>
                    <div class="alert-content">
                        <div class="alert-title">No Creative Data</div>
                        <div>Add creatives and tag them to see mix analysis</div>
                    </div>
                </div>
            `;
        } else {
            gapAlertsContainer.innerHTML = `
                <div class="alert alert-success">
                    <span class="alert-icon">✅</span>
                    <div class="alert-content">
                        <div class="alert-title">Good Creative Mix</div>
                        <div>No major gaps detected in your creative strategy</div>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading creative mix data:', error);
        document.getElementById('gapAlerts').innerHTML = `
            <div class="alert alert-danger">
                <span class="alert-icon">❌</span>
                <div class="alert-content">Error loading data: ${error.message}</div>
            </div>
        `;
    }
}
