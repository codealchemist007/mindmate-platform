// assets/js/charts.js

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('sentimentChart');
    
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Anxiety Level',
                        data: [4, 3, 5, 2, 6, 4, 3], // Dummy Data
                        borderColor: '#6366f1', // Brand Color
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Mood Score',
                        data: [7, 6, 5, 8, 5, 7, 8], // Dummy Data
                        borderColor: '#10b981', // Medical Green
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
});

function updateChartTheme(isDark) {
    if(!sentimentChart) return;
    const textColor = isDark ? '#cbd5e1' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    
    sentimentChart.options.scales.y.grid.color = gridColor;
    sentimentChart.options.scales.y.ticks.color = textColor;
    sentimentChart.options.scales.x.ticks.color = textColor;
    sentimentChart.update();
}