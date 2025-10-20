const fs = require('fs');

function writeHeader(file, headers) {
    fs.writeFileSync(file, headers.join('\t') + '\n');
}

function appendRow(file, row) {
    fs.appendFileSync(file, row.join('\t') + '\n');
}

function analyzeTSV(file, hasDate = false) {
    const content = fs.readFileSync(file, 'utf-8').trim();
    const lines = content.split('\n').slice(1);
    const total = lines.length;

    let words = [];
    let missing = [];
    let dates = [];

    lines.forEach(line => {
        const cols = line.split('\t');
        cols.forEach(col => { if (!col || col === 'N/A') missing.push(col); });
        words.push(...(cols[0] ? cols[0].split(/\s+/) : []));
        if (hasDate) dates.push(cols[3] || null);
    });

    const uniqueWords = new Set(words).size;
    const wordCounts = lines.map(line => line.split('\t')[0].split(/\s+/).length).sort((a,b)=>a-b);
    const minWords = wordCounts[0] || 0;
    const maxWords = wordCounts[wordCounts.length-1] || 0;
    const sumWords = wordCounts.reduce((a,b)=>a+b,0);
    const avgWords = wordCounts.length ? (sumWords / wordCounts.length).toFixed(2) : 0;
    const medianWords = wordCounts.length ? (wordCounts.length % 2 === 1 ? wordCounts[Math.floor(wordCounts.length/2)] : ((wordCounts[wordCounts.length/2-1]+wordCounts[wordCounts.length/2])/2)) : 0;

    let dateRange = 'N/A';
    if (hasDate && dates.length) {
        const validDates = dates.filter(d => d && d !== 'N/A').map(d => new Date(d)).sort((a,b)=>a-b);
        if (validDates.length) dateRange = `${validDates[0].toISOString()} - ${validDates[validDates.length-1].toISOString()}`;
    }

    return { totalRecords: total, uniqueWords, minWords, maxWords, avgWords, medianWords, missingFields: missing.length, dateRange };
}

module.exports = { writeHeader, appendRow, analyzeTSV };
