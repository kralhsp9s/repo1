const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Chess.com'dan (dış dünyadan) gelecek isteklerin engellenmemesi için CORS aktif ediliyor
app.use(cors());
app.use(express.json());

// Sunucu sağlık kontrolü hattı
app.get('/', (req, res) => {
    res.send('Eren\'in Satranç Analiz Sunucusu Aktif!');
});

// Telefon tarayıcısından gelecek anlık tahta analiz isteklerini karşılayan endpoint
app.get('/analyze', async (req, res) => {
    try {
        const fen = req.query.fen;
        if (!fen) {
            return res.status(400).json({ error: 'FEN konumu eksik!' });
        }

        // Bulut sunucusu, gelen tahta verisini güçlü Stockfish API'sine yönlendiriyor
        const stockfishUrl = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(stockfishUrl);
        const data = await response.json();

        // Hesaplanan en iyi hamleyi (Best Move) milisaniyeler içinde telefona geri fırlatır
        res.json({ success: true, bestmove: data.bestmove });
    } catch (error) {
        console.error('Sunucu Hatası:', error);
        res.status(500).json({ success: false, error: 'Analiz hatası.' });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başarıyla ayağa kalktı.`);
});        '--disable-dev-shm-usage' // Sunucu hafızasının yetersiz kalmasını önler
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
