const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/analyze', async (req, res) => {
    try {
        const fen = req.query.fen;
        if (!fen) return res.status(400).json({ success: false, error: 'FEN eksik' });

        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(url);
        const text = await response.text(); // JSON yerine ham metin olarak okuyoruz ki patlamasın

        // REGEX SİHRE: Metnin içinde "bestmove e2e4" kalıbını cımbızla çekiyoruz
        const match = text.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);

        if (match && match[1]) {
            console.log(`[BAŞARILI] Bulunan Hamle: ${match[1]}`);
            return res.json({ success: true, bestmove: match[1] });
        } else {
            console.error(`[API REDDETTİ] Stockfish bu FEN'i çözemedi: ${fen}`);
            return res.json({ success: false, error: 'Stockfish pozisyonu kural dışı buldu.', raw: text });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(process.env.PORT || 10000, () => console.log('Yıkılmaz Server Aktif!'));
