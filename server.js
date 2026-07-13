const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Render "Port açık mı?" diye kontrol ettiğinde bu cevap verecek
app.get('/', (req, res) => {
    res.send('Satranç botu arka planda aktif ve çalışıyor!');
});
// Eren'in muhtemelen gözden kaçırdığı kod bloğu:
app.get('/play', (req, res) => {
    res.send('Satranç sistemi hazır! Hamle sırası sende Eren.');
});
app.listen(PORT, () => {
    console.log(`Render için sahte port ${PORT} üzerinde dinleniyor...`);
});

// ... (Eren'in mevcut Puppeteer kodları buradan aşağıya aynen devam edecek)
// Satranç hamlelerini analiz eden simüle edilmiş basit bir motor fonksiyonu
// (Gerçek projelerde buraya Stockfish API'si veya motoru bağlanır)
function enIyiHamleyiBul(tahtaDurumu) {
    console.log("-> Tahta durumu analiz ediliyor...");
    // Burada yapay zeka en iyi hamleyi hesaplar
    // Örnek olarak e2 karesindeki piyonu e4'e sürmek için hamle döndürüyoruz
    return { kaynak: 'e2', hedef: 'e4' };
}

async function satrançBotunuBaşlat() {
    console.log("Satranç Botu Başlatılıyor...");

    // Tarayıcıyı görünür modda (headless: false) başlatıyoruz
    const browser = await puppeteer.launch({
    headless: true, // Tarayıcıyı arka planda, ekransız çalıştırır
    args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage' // Sunucu hafızasının yetersiz kalmasını önler
    ]
});

    const page = await browser.newPage();

    // Botun bağlanacağı online satranç sitesi
    const satrançSitesi = 'https://repo2-056n.onrender.com/play'; 
    console.log(`${satrançSitesi} adresine gidiliyor...`);
    await page.goto(satrançSitesi, { waitUntil: 'networkidle2' });

    // Maçın başlamasını bekliyoruz
    console.log("Maçın başlaması bekleniyor. Lütfen siyah veya beyaz seçin...");
    await page.waitForSelector('.chess-board', { timeout: 60000 });
    console.log("Satranç tahtası tespit edildi! Bot analiz moduna geçiyor.");

    // Oyun döngüsü (Maç bitene kadar hamleleri otomatik yapar)
    let oyunDevamEdiyor = true;
    while (oyunDevamEdiyor) {
        try {
            // Tarayıcı içindeki satranç tahtasının mevcut durumunu (HTML elementlerini) okuyoruz
            const tahtaDurumu = await page.evaluate(() => {
                const taslar = document.querySelectorAll('.piece');
                let konumlar = [];
                taslar.forEach(tas => {
                    konumlar.push(tas.className); // Taşın rengi, türü ve karesi
                });
                return konumlar;
            });

            // Yapay zeka motorundan en iyi hamleyi alıyoruz
            const hamle = enIyiHamleyiBul(tahtaDurumu);

            console.log(`Bot Hamlesi: ${hamle.kaynak} karesindeki taş ${hamle.hedef} karesine taşınıyor.`);

            // Puppeteer, web sayfasındaki taşları bulup tıklayarak hamleyi yapar
            await page.click(`.square-${hamle.kaynak}`);
            await page.waitForTimeout(500); // İnsansı bir gecikme ekliyoruz
            await page.click(`.square-${hamle.hedef}`);

            // Rakibin oynamasını beklemek için kısa bir duraklama
            await page.waitForTimeout(3000);

            // Oyunun bitip bitmediğini kontrol et
            const matKontrol = await page.$('.game-over-modal');
            if (matKontrol) {
                oyunDevamEdiyor = false;
                console.log("Oyun bitti! Sonuç kontrol ediliyor.");
            }

        } catch (error) {
            console.log("Hamle yapılırken bir hata oluştu veya oyun bitti:", error.message);
            oyunDevamEdiyor = false;
        }
    }

    console.log("Bot görevini tamamladı. Tarayıcı kapatılıyor.");
    await browser.close();
}

// Botu çalıştır
satrançBotunuBaşlat();
