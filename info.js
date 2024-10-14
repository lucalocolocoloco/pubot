const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

// API Key for NewsAPI
const apiKey = '8228006998274f3cb39d05ae86eb8eea';
let articleIndex = 0; // Variabel untuk melacak rangking artikel

async function getNews(queries, language = 'en', fromDate = null, pageSize = 100) { // Mengambil 100 berita
    const articles = [];
    if (!fromDate) {
        fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }

    for (const query of queries) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&language=${language}&pageSize=${pageSize}&apiKey=${apiKey}`;
        
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                // Map articles to include only source as a string (name)
                const mappedArticles = response.data.articles.map(article => ({
                    ...article,
                    source: article.source.name // Mengubah source menjadi string
                }));
                articles.push(...mappedArticles);
            } else {
                console.error(`Error fetching data for ${query}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${query}: ${error.message}`);
        }
    }
    return articles;
}

function isRelevantArticle(article, keywords) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    return keywords.some(keyword => title.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase()));
}

function rankArticlesByDate(articles) {
    // Sort articles by published date (newest to oldest)
    return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function saveArticleToFile(article, filename = 'relevant_article.json') {
    const jsonData = JSON.stringify(article, null, 2); // Convert the article to JSON format
    fs.writeFileSync(filename, jsonData, 'utf8'); // Write the JSON data to a file
    console.log(`Article saved to ${filename}`);
}

// Menggunakan kata kunci yang relevan dengan trading, saham, dan cryptocurrency
const keywords = [
    "trading", "stock market", "cryptocurrency", "bitcoin", "ethereum", 
    "blockchain", "forex", "financial markets", "investment", "technical analysis", 
    "economic news", "market trends", "crypto news", "defi", "NFT", 
    "dogecoin", "altcoins"
];

(async function fetchNews() {
    while (true) {
        const articles = await getNews(keywords, 'en', null, 100); // Mengambil 100 artikel per iterasi
        
        if (articles.length) {
            const relevantArticles = articles.filter(article => isRelevantArticle(article, keywords));
            
            if (relevantArticles.length) {
                // Ranking articles by published date
                const rankedArticles = rankArticlesByDate(relevantArticles); // Ambil semua relevan
                
                // Batasi output ke 100 artikel teratas
                const topArticles = rankedArticles.slice(0, 100);

                // Proses setiap artikel dan simpan satu per satu
                topArticles.forEach((topArticle, index) => {
                    // Save the top article to JSON file
                    saveArticleToFile(topArticle, `relevant_article_${index + 1}.json`);
                    
                    // Displaying the article ranked by publication date
                    const title = topArticle.title;
                    const description = topArticle.description || ""; // Ambil deskripsi lengkap
                    const source = topArticle.source; // Sudah berupa string
                    const publishedAt = topArticle.publishedAt;
                    const content = topArticle.content || ""; // Ambil isi artikel lengkap
                    console.log(`Article Rank ${articleIndex + 1}:`);
                    console.log(`Title: ${title}`);
                    console.log(`Description: ${description}`);
                    console.log(`Source: ${source}`);
                    console.log(`Published At: ${publishedAt}`);
                    console.log(`Content: ${content}`);

                    // Increment article index for next iteration
                    articleIndex++;
                });
            } else {
                console.log("No relevant articles found.");
            }
        } else {
            console.log("No articles found.");
        }

        await new Promise(resolve => setTimeout(resolve, 1200000)); // Sleep for 40 seconds
    }
})();
