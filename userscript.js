// ==UserScript==
// @name         Eren Chess.com Cloud Injector
// @version      1.0
// @description  Tahtayı Render bulutuna gönderir ve en iyi hamleyi görselleştirir.
// @match        https://www.chess.com/*
// @grant        none
// ==UserScript==

(function() {
    'use strict';

    // Eren'in Render üzerinde ayağa kaldırdığı canlı bulut adresi
    const BACKEND_URL = 'https://repo2-056n.onrender.com'; 
    let lastProcessedFen = "";

    // Chess.com tahtasındaki taşların konumlarını (DOM) okuyan fonksiyon
    function getBoardState() {
        const board = document.querySelector('.board, chess-board');
        if (!board) return null;

        const pieces = board.querySelectorAll('.piece');
        let piecesArray = [];

        pieces.forEach(piece => {
            const className = piece.className;
            const squareMatch = className.match(/square-(\d+)/);
            if (squareMatch) {
                const coords = squareMatch[1]; // Örn: "52" (e2 karesi koordinatı)
                const typeClass = className.split(' ').find(c => c.length === 2);
                piecesArray.push(`${coords}:${typeClass}`);
            }
        });
        return piecesArray.join(','); 
    }

    // Render bulut sunucusuna asenkron istek atarak en iyi hamleyi soran fonksiyon
    async function fetchBestMove(fen) {
        if (!fen || fen === lastProcessedFen) return;
        lastProcessedFen = fen;

        try {
            const response = await fetch(`${BACKEND_URL}/analyze?fen=${encodeURIComponent(fen)}`);
            const data = await response.json();
            
            if (data.success && data.bestmove) {
                const move = data.bestmove.split(' ')[1]; // Örn: "e2e4"
                drawVisualHint(move);
            }
        } catch (err) {
            console.error('Bulut sunucusu yanıt vermedi:', err);
        }
    }

    // Bulunan hamleyi Chess.com tahtasında yarı saydam kırmızı ve yeşil karelerle işaretleyen kod
    function drawVisualHint(move) {
        // Eski işaretleri temizle
        document.querySelectorAll('.eren-hint').forEach(el => el.remove());

        const board = document.querySelector('.board, chess-board');
        if (!board) return;

        const startSquare = move.substring(0, 2); // Başlangıç karesi
        const endSquare = move.substring(2, 4);   // Hedef kare

        [startSquare, endSquare].forEach((sq, idx) => {
            const hint = document.createElement('div');
            hint.className = 'eren-hint';
            hint.style.position = 'absolute';
            // Başlangıç karesini hafif kırmızı, gidilecek kareyi parlak yeşil yapar
            hint.style.backgroundColor = idx === 0 ? 'rgba(255, 0, 0, 0.25)' : 'rgba(0, 255, 0, 0.35)';
            hint.style.zIndex = '10';
            
            board.appendChild(hint);
        });
    }

    // Telefonun işlemcisini yormamak için her 1 saniyede bir tahtayı analiz döngüsüne sokar
    setInterval(() => {
        const fen = getBoardState();
        if (fen) fetchBestMove(fen);
    }, 1000);
})();
