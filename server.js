    const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Eren\'in Analiz Sunucusu Aktif!');
});

app.get('/analyze', async (req, res) => {
    try {
        const fen = req.query.fen;
        if (!fen) {
            return res.status(400).json({ error: 'FEN konumu eksik!' });
        }

        const stockfishUrl = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(stockfishUrl);
        const data = await response.json();

        // Teşhis için Render loglarına gelen ham veriyi yazdırıyoruz
        console.log("Stockfish API Ham Yanıtı:", data);

        if (!data.success) {
            return res.json({ success: false, error: data.data || 'Stockfish analizi reddetti.' });
        }

        // HATA DÜZELTME: API'den gelen veriyi güvenli bir şekilde ayıklıyoruz
        let enIyiHamle = data.bestmove || data.data || "";

        res.json({ success: true, bestmove: enIyiHamle });
    } catch (error) {
        console.error('Sunucu Hatası:', error);
        res.status(500).json({ success: false, error: 'Analiz hatası.' });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda hatasız ayağa kalktı.`);
});
