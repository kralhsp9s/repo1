const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Stockfish API'sine istek atan yardımcı fonksiyon
async function callStockfish(fen) {
    try {
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(url);
        const text = await response.text();
        const match = text.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
        return (match && match[1]) ? match[1] : null;
    } catch (e) {
        return null;
    }
}

app.get('/analyze', async (req, res) => {
    try {
        const originalFen = req.query.fen;
        if (!originalFen) return res.status(400).json({ success: false, error: 'FEN eksik' });

        console.log(`[GELEN FEN]: ${originalFen}`);

        // --- OTO-ONARIM (FAIL-SAFE) MEKANİZMASI ---
        let bestmove = null;
        let attemptFen = originalFen;

        // 1. Orijinal FEN ile şansımızı deniyoruz
        bestmove = await callStockfish(attemptFen);

        // 2. Başarısız olursa: Rok haklarını sıfırlayıp tekrar deniyoruz (-)
        if (!bestmove) {
            console.log("[FAIL-SAFE] Orijinal FEN reddedildi. Rok hakları temizleniyor...");
            const parts = originalFen.split(' ');
            if (parts.length >= 3) {
                parts[2] = '-'; 
                attemptFen = parts.join(' ');
                bestmove = await callStockfish(attemptFen);
            }
        }

        // 3. Hala başarısızsa: Sırayı tersine çeviriyoruz (Şah durumlarındaki kilitlenmeyi çözer)
        if (!bestmove) {
            console.log("[FAIL-SAFE] Roksuz FEN reddedildi. Sıra (Turn) yönü değiştiriliyor...");
            const parts = originalFen.split(' ');
            if (parts.length >= 3) {
                parts[1] = parts[1] === 'w' ? 'b' : 'w'; 
                parts[2] = '-'; 
                attemptFen = parts.join(' ');
                bestmove = await callStockfish(attemptFen);
            }
        }

        if (bestmove) {
            console.log(`[BAŞARILI] Hamle Alındı: ${bestmove}`);
            return res.json({ success: true, bestmove: bestmove });
        } else {
            console.error(`[CRITICAL] Stockfish tüm varyasyonları reddetti!`);
            return res.json({ success: false, error: 'Stockfish pozisyonu hiçbir varyasyonda kabul etmedi.' });
        }

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(process.env.PORT || 10000, () => console.log('Yıkılmaz Server Ayakta!'));
