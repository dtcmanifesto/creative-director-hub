// Utility functions

// Format currency
export function formatCurrency(value, decimals = 0) {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Format number with commas
export function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Format percentage
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return '-';
    return `${(value * 100).toFixed(decimals)}%`;
}

// Format ROAS
export function formatRoas(value) {
    if (value === null || value === undefined) return '-';
    return `${parseFloat(value).toFixed(2)}x`;
}

// Format date
export function formatDate(date, format = 'short') {
    if (!date) return '-';
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (format === 'relative') {
        return getRelativeTime(d);
    }
    return d.toLocaleDateString();
}

// Relative time (e.g., "2 days ago")
export function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}

// Days since date
export function daysSince(date) {
    if (!date) return null;
    const now = new Date();
    const then = new Date(date);
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// Get status badge class
export function getStatusClass(status) {
    const statusMap = {
        'active': 'status-active',
        'paused': 'status-paused',
        'killed': 'status-killed',
        'scaling': 'status-scaling',
        'declining': 'status-declining',
        'plateaued': 'status-plateaued',
        'complete': 'badge-success',
        'inconclusive': 'badge-warning',
        'high': 'badge-success',
        'medium': 'badge-warning',
        'low': 'badge-danger'
    };
    return statusMap[status?.toLowerCase()] || 'badge-neutral';
}

// Get trend indicator
export function getTrendIndicator(current, previous) {
    if (!current || !previous) return { direction: 'neutral', percent: 0 };
    
    const change = ((current - previous) / previous) * 100;
    return {
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        percent: Math.abs(change).toFixed(1)
    };
}

// Calculate fatigue score (0-100, higher = more fatigued)
export function calculateFatigueScore(metrics, days = 7) {
    if (!metrics || metrics.length < 2) return null;
    
    // Get last N days of data
    const recent = metrics.slice(-days);
    if (recent.length < 2) return null;
    
    // Calculate trends for key metrics (lower is worse for ROAS/CTR, higher is worse for CPA)
    const roasTrend = calculateTrendSlope(recent.map(m => m.roas));
    const ctrTrend = calculateTrendSlope(recent.map(m => m.ctr));
    const cpaTrend = calculateTrendSlope(recent.map(m => m.cpa));
    
    // Normalize and weight
    // Negative ROAS/CTR trends and positive CPA trends indicate fatigue
    let score = 0;
    if (roasTrend < 0) score += Math.min(Math.abs(roasTrend) * 50, 40);
    if (ctrTrend < 0) score += Math.min(Math.abs(ctrTrend) * 100, 30);
    if (cpaTrend > 0) score += Math.min(cpaTrend * 30, 30);
    
    return Math.min(Math.round(score), 100);
}

// Calculate linear regression slope
function calculateTrendSlope(values) {
    const n = values.length;
    if (n < 2) return 0;
    
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length < 2) return 0;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    validValues.forEach((y, x) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

// Get fatigue status from score
export function getFatigueStatus(score) {
    if (score === null) return { label: 'Unknown', class: 'badge-neutral' };
    if (score < 20) return { label: 'Scaling', class: 'status-scaling' };
    if (score < 50) return { label: 'Stable', class: 'badge-info' };
    if (score < 75) return { label: 'Plateaued', class: 'status-plateaued' };
    return { label: 'Declining', class: 'status-declining' };
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create element helper
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'innerHTML') {
            el.innerHTML = value;
        } else if (key.startsWith('on')) {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child) {
            el.appendChild(child);
        }
    });
    
    return el;
}

// Show toast notification
export function showToast(message, type = 'info') {
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        innerHTML: message
    });
    
    // Add toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = createElement('div', { className: 'toast-container' });
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Parse ad name for auto-tagging
// Format: FA_UGC_QuestionHook_Gym_Male2535_TalkingHead
export function parseAdName(name) {
    if (!name) return {};
    
    const parts = name.split('_');
    if (parts.length < 2) return {};
    
    const tags = {};
    
    // Common patterns to detect
    const patterns = {
        adType: ['UGC', 'Studio', 'Static', 'Carousel'],
        hookType: ['QuestionHook', 'BoldClaim', 'Testimonial', 'Problem', 'Solution', 'Curiosity'],
        environment: ['Gym', 'Home', 'Outdoors', 'Studio', 'Office', 'Garage', 'Park'],
        filmingStyle: ['TalkingHead', 'POV', 'BRoll', 'Demo', 'Lifestyle', 'Interview', 'ScreenRecord', 'SplitScreen', 'ASMR']
    };
    
    parts.forEach(part => {
        // Check each pattern category
        Object.entries(patterns).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (part.toLowerCase().includes(keyword.toLowerCase())) {
                    tags[category] = keyword;
                }
            });
        });
        
        // Check for age range (e.g., Male2535, Female3544)
        const ageMatch = part.match(/(Male|Female)(\d{4})/);
        if (ageMatch) {
            tags.talentGender = ageMatch[1].toLowerCase();
            tags.talentAgeRange = `${ageMatch[2].slice(0, 2)}-${ageMatch[2].slice(2)}`;
        }
    });
    
    return tags;
}
