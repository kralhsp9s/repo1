const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

async function callStockfish(fen) {
    try {
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}`;
        const response = await fetch(url);
        const text = await response.text();
        
        console.log(`[STOCKFISH HAM YANIT]: ${text}`); // Eren burayı Render loglarında görsün!

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

        console.log(`[SUNUCUYA GELEN FEN]: ${originalFen}`);

        let bestmove = await callStockfish(originalFen);

        // FAIL-SAFE 1: Rok haklarını silip dene
        if (!bestmove) {
            const parts = originalFen.split(' ');
            if (parts.length >= 3) {
                parts[2] = '-'; 
                bestmove = await callStockfish(parts.join(' '));
            }
        }

        // FAIL-SAFE 2: Sırayı tersine çevirip dene
        if (!bestmove) {
            const parts = originalFen.split(' ');
            if (parts.length >= 3) {
                parts[1] = parts[1] === 'w' ? 'b' : 'w'; 
                parts[2] = '-';
                bestmove = await callStockfish(parts.join(' '));
            }
        }

        if (bestmove) {
            return res.json({ success: true, bestmove: bestmove });
        } else {
            return res.json({ success: false, error: 'Stockfish pozisyonu tamamen reddetti.' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(process.env.PORT || 10000, () => console.log('Sunucu Savaş Modunda Aktif!'));
