const puppeteer = require('puppeteer');
const fs = require('fs');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Memuat variabel lingkungan dari file .env
dotenv.config();

const EMAIL = process.env.FB_EMAIL;
const PASSWORD = process.env.FB_PASSWORD;
const PROFILE_URL = 'https://www.facebook.com/profile.php?id=61566687997316'; // URL halaman profil
const INSIGHTS_URL = 'https://www.facebook.com/professional_dashboard/insights/posts/?ref=comet_direct_url_navigation'; // URL halaman insights
const COOKIE_FILE_PATH = 'fb_cookies.json'; // Atau lokasi lain dengan izin yang sesuai

// Fungsi untuk menunggu waktu tertentu
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fungsi untuk menyimpan cookies ke file
async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_FILE_PATH, JSON.stringify(cookies, null, 2));
    console.log('Cookies berhasil disimpan.');
}

// Fungsi untuk memuat cookies dari file
async function loadCookies(page) {
    if (fs.existsSync(COOKIE_FILE_PATH)) {
        const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE_PATH));
        await page.setCookie(...cookies);
        console.log('Cookies berhasil dimuat.');
        return true;
    }
    return false;
}

// Fungsi untuk mengklik tombol berdasarkan selector
async function clickButtonBySelector(page, selector) {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const button = await page.$(selector);
        if (button) {
            await button.click();
            return true;
        }
    } catch (error) {
        console.log(`Selector ${selector} tidak ditemukan: ${error.message}`);
    }
    return false;
}

// Fungsi untuk mengklik tombol berdasarkan selector aria-label
async function clickButtonByAriaLabel(page, ariaLabel) {
    const selector = `*[aria-label="${ariaLabel}"]`; // Gunakan selector berbasis aria-label
    return await clickButtonBySelector(page, selector); // Panggil fungsi yang sudah ada
}

// Fungsi untuk membaca konten dari file relevant_article_X.json dan menerjemahkannya
async function getPostContentFromJson(fileIndex) {
    const filePath = `relevant_article_${fileIndex}.json`; // Mengambil nama file sesuai indeks
    if (fs.existsSync(filePath)) {
        const articles = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const name = articles.source || 'No name';
        const title = articles.title || 'No title';
        const description = articles.description || 'No description';
        const content = articles.content || 'No content';
        const author = articles.author || 'Unknown author';
        const url = articles.url || 'No URL';
        const publishedAt = new Date(articles.publishedAt).toLocaleString('id-ID', {
            timeZone: 'UTC',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        return `${title}\n\n${description}\n\n${content}\n\nSumber: ${name}\n\nAuthor: ${author}\nPublished at: ${publishedAt}`;
    }
    throw new Error(`File ${filePath} tidak ditemukan atau tidak ada artikel.`);
}

// Fungsi untuk login dan navigasi ke halaman insights
async function loginAndNavigate(page) {
    const cookiesLoaded = await loadCookies(page);

    // Jika cookies tidak ada atau gagal dimuat, lakukan login manual
    if (!cookiesLoaded || await page.$('input[name="email"]')) {
        console.log('Melakukan login manual...');
        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });
        await page.type('input[name="email"]', EMAIL);
        await page.type('input[name="pass"]', PASSWORD);
        await Promise.all([
            page.click('button[name="login"]'),
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        ]);

        console.log('Login berhasil!');

        // Simpan cookies setelah login
        await saveCookies(page);
    } else {
        console.log('Sudah login menggunakan session cookies.');
    }

    // Navigasi ke halaman profil Facebook
    await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Halaman profil dimuat.');

    if (await clickButtonByAriaLabel(page, 'Beralih Sekarang')) {
        console.log('Tombol "Beralih Sekarang" berhasil diklik.');
    } else {
        console.log('Tombol "Beralih Sekarang" tidak ditemukan.');
    }

    await waitFor(5000);
    await page.goto(INSIGHTS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Halaman insights dimuat.');
}

// Fungsi untuk menjalankan proses
async function runProcess(page, fileIndex) {
    // Eksekusi script Python clpos.py
    exec('python3 clpos.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error saat menjalankan script Python: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error output Python: ${stderr}`);
            return;
        }
        console.log(`Output dari script Python: ${stdout}`);
    });

    // Ambil konten postingan dari file JSON yang sesuai
    const postContent = await getPostContentFromJson(fileIndex);
    const postBoxSelector = '[aria-label="Apa yang Anda pikirkan, Techno Trade Update?"]';

    await page.waitForSelector(postBoxSelector);
    const postBox = await page.$(postBoxSelector);
    
    if (postBox) {
        await postBox.type(postContent);
        console.log(`Isi postingan dari file relevant_article_${fileIndex}.json berhasil ditulis.`);
    } else {
        throw new Error('Kotak postingan tidak ditemukan.');
    }

    const publishButtonSelector = '[aria-label="Kirim"]';
    
    // Menambahkan waktu tunggu 60 detik sebelum klik tombol "Kirim"
    console.log('Menunggu 60 detik sebelum mengklik tombol "Kirim"...');
    await waitFor(60000); // Waktu tunggu 60 detik

    // Klik tombol "Kirim"
    if (await clickButtonBySelector(page, publishButtonSelector)) {
        console.log('Postingan berhasil diterbitkan!');
    } else {
        throw new Error('Tombol "Kirim" tidak ditemukan');
    }

    // Cek jika tombol "Lain Kali" ada dan klik jika ditemukan
    const laterButtonSelector = '[aria-label="Lain Kali"]';
    const laterButtonExists = await page.$(laterButtonSelector);
    
    if (laterButtonExists) {
        await clickButtonBySelector(page, laterButtonSelector);
        console.log('Tombol "Lain Kali" ditemukan dan diklik.');
    } else {
        console.log('Tombol "Lain Kali" tidak ditemukan, lanjutkan proses.');
    }
}

// Fungsi untuk menjalankan proses terus-menerus setiap 5 menit per artikel
async function runContinuousProcess() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    // Login dan navigasi ke halaman insights
    await loginAndNavigate(page);

    let fileIndex = 1; // Memulai dari file relevant_article_1.json

    while (fileIndex <= 100) { // Mengulangi proses untuk 100 file
        await runProcess(page, fileIndex);
        console.log(`Menunggu 12 menit sebelum memproses file relevant_article_${fileIndex + 1}.json...`);
        await waitFor(1200000); // Tunggu 12 menit (300000 ms)
        fileIndex++; // Beralih ke file berikutnya
    }

    console.log('Semua artikel dari relevant_article_1.json hingga relevant_article_100.json telah diproses.');
    await browser.close();
}

// Jalankan proses berkelanjutan
runContinuousProcess();
