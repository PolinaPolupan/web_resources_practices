const colors = {
    backgrounds: [
        'rgba(102, 126, 234, 0.7)',
        'rgba(118, 75, 162, 0.7)',
        'rgba(240, 147, 251, 0.7)',
        'rgba(245, 87, 108, 0.7)',
        'rgba(79, 172, 254, 0.7)',
        'rgba(0, 242, 254, 0.7)',
        'rgba(17, 153, 142, 0.7)',
        'rgba(56, 239, 125, 0.7)'
    ],
    borders: [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(240, 147, 251, 1)',
        'rgba(245, 87, 108, 1)',
        'rgba(79, 172, 254, 1)',
        'rgba(0, 242, 254, 1)',
        'rgba(17, 153, 142, 1)',
        'rgba(56, 239, 125, 1)'
    ]
};

if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
}

function getSourceBadgeColor(source) {
    const map = {
        '20minutes.fr': 'bg-primary',
        'ladepeche.fr': 'bg-success',
        'francematin.info': 'bg-warning text-dark',
        'flashinfo.fr': 'bg-danger',
        'actualite-fr.com': 'bg-info'
    };
    return map[source] || 'bg-secondary';
}

async function renderCharts() {
    const sourcesChart = document.getElementById('sourcesChart');
    if (!sourcesChart) {
        console.log('Not on stats page, skipping charts');
        return;
    }

    try {
        console.log('Fetching data...');
        const res = await fetch('/api/news');
        const news = await res.json();

        console.log('Loaded', news.length, 'articles');

        if (!news || !news.length) {
            const table = document.getElementById('recentArticles');
            if (table) {
                table.innerHTML = '<tr><td colspan="3" class="text-center py-4">Нет данных</td></tr>';
            }
            return;
        }

        const sourcesCount = {};
        const categoriesCount = {};
        const avgWordsSum = {};
        const avgWordsCount = {};
        const missingFields = {};
        const titleLengths = {};

        news.forEach(n => {
            const src = n.source || 'N/A';
            const cat = (n.category && n.category.trim()) ? n.category : 'Без категории';
            const titleWords = n.title ? n.title.split(/\s+/).length : 0;

            sourcesCount[src] = (sourcesCount[src] || 0) + 1;
            categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
            avgWordsSum[src] = (avgWordsSum[src] || 0) + titleWords;
            avgWordsCount[src] = (avgWordsCount[src] || 0) + 1;

            const missing = ['title', 'content', 'category', 'image', 'link']
                .filter(f => !n[f] || n[f] === 'N/A' || n[f] === '').length;

            missingFields[src] = (missingFields[src] || 0) + missing;
            titleLengths[titleWords] = (titleLengths[titleWords] || 0) + 1;
        });

        const sourcesLabels = Object.keys(sourcesCount);
        const avgWords = sourcesLabels.map(s => (avgWordsSum[s] / avgWordsCount[s]).toFixed(2));
        const missing = sourcesLabels.map(s => missingFields[s]);

        const totalFields = 5;
        const completeness = sourcesLabels.map(s => {
            const total = sourcesCount[s] * totalFields;
            return ((total - missingFields[s]) / total * 100).toFixed(1);
        });

        const sortedCategories = Object.entries(categoriesCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const totalArticlesEl = document.getElementById('totalArticles');
        if (totalArticlesEl) totalArticlesEl.textContent = news.length.toLocaleString();

        const totalSourcesEl = document.getElementById('totalSources');
        if (totalSourcesEl) totalSourcesEl.textContent = sourcesLabels.length;

        const totalCategoriesEl = document.getElementById('totalCategories');
        if (totalCategoriesEl) totalCategoriesEl.textContent = Object.keys(categoriesCount).length;

        const avgTitleLengthEl = document.getElementById('avgTitleLength');
        if (avgTitleLengthEl) {
            const totalAvg = (Object.values(avgWordsSum).reduce((a, b) => a + b, 0) / news.length).toFixed(1);
            avgTitleLengthEl.textContent = totalAvg;
        }

        new Chart(document.getElementById('sourcesChart'), {
            type: 'bar',
            data: {
                labels: sourcesLabels,
                datasets: [{
                    label: 'Статей',
                    data: Object.values(sourcesCount),
                    backgroundColor: colors.backgrounds,
                    borderColor: colors.borders,
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('sourcesPieChart'), {
            type: 'doughnut',
            data: {
                labels: sourcesLabels,
                datasets: [{
                    data: Object.values(sourcesCount),
                    backgroundColor: colors.backgrounds
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%'
            }
        });

        new Chart(document.getElementById('categoriesChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(categoriesCount).slice(0, 8),
                datasets: [{
                    data: Object.values(categoriesCount).slice(0, 8),
                    backgroundColor: colors.backgrounds
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        new Chart(document.getElementById('topCategoriesChart'), {
            type: 'bar',
            data: {
                labels: sortedCategories.map(c => c[0].substring(0, 25)),
                datasets: [{
                    label: 'Статей',
                    data: sortedCategories.map(c => c[1]),
                    backgroundColor: 'rgba(79, 172, 254, 0.7)',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('avgWordsChart'), {
            type: 'bar',
            data: {
                labels: sourcesLabels,
                datasets: [{
                    label: 'Слов',
                    data: avgWords,
                    backgroundColor: 'rgba(56, 239, 125, 0.7)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        const sortedLengths = Object.entries(titleLengths)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

        new Chart(document.getElementById('titleLengthChart'), {
            type: 'bar',
            data: {
                labels: sortedLengths.map(t => t[0] + ' сл.'),
                datasets: [{
                    label: 'Кол-во',
                    data: sortedLengths.map(t => t[1]),
                    backgroundColor: 'rgba(118, 75, 162, 0.7)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('missingFieldsChart'), {
            type: 'bar',
            data: {
                labels: sourcesLabels,
                datasets: [{
                    label: 'Пропущено',
                    data: missing,
                    backgroundColor: 'rgba(245, 87, 108, 0.7)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('completenessChart'), {
            type: 'radar',
            data: {
                labels: sourcesLabels,
                datasets: [{
                    label: 'Полнота %',
                    data: completeness,
                    backgroundColor: 'rgba(56, 239, 125, 0.3)',
                    borderColor: 'rgba(56, 239, 125, 1)',
                    pointBackgroundColor: 'rgba(56, 239, 125, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { beginAtZero: true, max: 100 } }
            }
        });

        const tableBody = document.getElementById('recentArticles');
        if (tableBody) {
            tableBody.innerHTML = news.slice(0, 15).map(n => `
                <tr>
                    <td><span class="badge ${getSourceBadgeColor(n.source)} badge-source">${n.source || 'N/A'}</span></td>
                    <td><a href="${n.link}" target="_blank" class="text-decoration-none">${(n.title || 'Без заголовка').substring(0, 70)}...</a></td>
                    <td><small class="text-muted">${n.category || '-'}</small></td>
                </tr>
            `).join('');
        }

        console.log('Charts rendered!');
    } catch (err) {
        console.error('Error:', err);
        const tableBody = document.getElementById('recentArticles');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Ошибка: ${err.message}</td></tr>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', renderCharts);
