// Chart.js configuration and helpers

// Brand colors
const COLORS = {
    accent: '#F0582B',
    accentLight: 'rgba(240, 88, 43, 0.2)',
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#EF4444',
    info: '#3B82F6',
    gray: '#666666',
    grayLight: '#333333'
};

// Chart color palette for multiple datasets
const CHART_PALETTE = [
    '#F0582B', // accent
    '#3B82F6', // blue
    '#22C55E', // green
    '#EAB308', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316'  // orange
];

// Default chart options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#1A1A1A',
            titleColor: '#FFFFFF',
            bodyColor: '#A0A0A0',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
            },
            ticks: {
                color: '#666666',
                font: { size: 11 }
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
            },
            ticks: {
                color: '#666666',
                font: { size: 11 }
            }
        }
    }
};

// Create sparkline chart
export function createSparkline(canvas, data, color = COLORS.accent) {
    if (!canvas || !data || data.length === 0) return null;
    
    const ctx = canvas.getContext('2d');
    
    // Determine trend color
    const trend = data[data.length - 1] - data[0];
    const lineColor = trend >= 0 ? COLORS.success : COLORS.danger;
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i),
            datasets: [{
                data: data,
                borderColor: lineColor,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// Create line chart
export function createLineChart(canvas, labels, datasets, options = {}) {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    const chartDatasets = datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color || CHART_PALETTE[i % CHART_PALETTE.length],
        backgroundColor: ds.fill ? `${ds.color || CHART_PALETTE[i]}20` : 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: ds.fill || false,
        tension: 0.3
    }));
    
    return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: chartDatasets },
        options: {
            ...defaultOptions,
            ...options,
            plugins: {
                ...defaultOptions.plugins,
                legend: {
                    display: datasets.length > 1,
                    position: 'top',
                    labels: {
                        color: '#A0A0A0',
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
}

// Create bar chart
export function createBarChart(canvas, labels, data, options = {}) {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: data,
                backgroundColor: options.colors || COLORS.accent,
                borderRadius: 4,
                barThickness: options.barThickness || 'flex',
                maxBarThickness: options.maxBarThickness || 50
            }]
        },
        options: {
            ...defaultOptions,
            ...options,
            indexAxis: options.horizontal ? 'y' : 'x'
        }
    });
}

// Create horizontal bar chart
export function createHorizontalBarChart(canvas, labels, data, options = {}) {
    return createBarChart(canvas, labels, data, { ...options, horizontal: true });
}

// Create pie/donut chart
export function createPieChart(canvas, labels, data, options = {}) {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
        type: options.donut ? 'doughnut' : 'pie',
        data: {
            labels,
            datasets: [{
                data: data,
                backgroundColor: CHART_PALETTE,
                borderColor: '#0A0A0A',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: options.donut ? '60%' : 0,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#A0A0A0',
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: defaultOptions.plugins.tooltip
            }
        }
    });
}

// Create donut chart
export function createDonutChart(canvas, labels, data, options = {}) {
    return createPieChart(canvas, labels, data, { ...options, donut: true });
}

// Create stacked bar chart for mix analysis
export function createStackedBarChart(canvas, labels, datasets, options = {}) {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    const chartDatasets = datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color || CHART_PALETTE[i % CHART_PALETTE.length],
        borderRadius: 4
    }));
    
    return new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: chartDatasets },
        options: {
            ...defaultOptions,
            ...options,
            scales: {
                x: {
                    ...defaultOptions.scales.x,
                    stacked: true
                },
                y: {
                    ...defaultOptions.scales.y,
                    stacked: true
                }
            },
            plugins: {
                ...defaultOptions.plugins,
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#A0A0A0',
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

// Create gauge chart (for fatigue score)
export function createGaugeChart(canvas, value, maxValue = 100) {
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    // Determine color based on value
    let color = COLORS.success;
    if (value > 75) color = COLORS.danger;
    else if (value > 50) color = COLORS.warning;
    else if (value > 25) color = COLORS.info;
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, maxValue - value],
                backgroundColor: [color, COLORS.grayLight],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: -90,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Destroy chart if exists
export function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}

export { COLORS, CHART_PALETTE };
