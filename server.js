const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
// Render'ın standart portu veya 10000
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Sağlık kontrolü
app.get('/', (req, res) => {
    res.send('Eren\'in Bulut Sunucusu Sorunsuz Çalışıyor!');
});

// Telefon tarayıcısından (Tampermonkey) gelen FEN konumunu analiz eden yer
app.get('/analyze', async (req, res) => {
    try {
        const fen = req.query.fen;
        if (!fen) {
            return res.status(400).json({ error: 'FEN konumu eksik!' });
        }

        const stockfishUrl = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(stockfishUrl);
        const data = await response.json();

        res.json({ success: true, bestmove: data.bestmove });
    } catch (error) {
        console.error('Sunucu Hatası:', error);
        res.status(500).json({ success: false, error: 'Analiz hatası.' });
    }
});

app.listen(PORT, () => {
    console.log(`Hafif sunucu ${PORT} portunda aktif. Puppeteer kaldırıldı, RAM güvende!`);
});
