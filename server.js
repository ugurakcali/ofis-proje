const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'database.backup.json');

// data dizinini oluştur
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Varsayılan başlangıç verisi
function getDefaultData() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
                return parsed;
            }
        }
    } catch (e) {}

    const formattedDate = new Date().toLocaleString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return {
        projects: [],
        officeNotes: [],
        lastUpdated: Date.now()
    };
}

// Veritabanı okuma
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.projects)) {
                if (!Array.isArray(parsed.officeNotes)) parsed.officeNotes = [];
                return parsed;
            }
        }
    } catch (err) {
        console.error('Veritabanı okuma hatası, yedek kontrol ediliyor:', err.message);
        if (fs.existsSync(BACKUP_FILE)) {
            try {
                const bRaw = fs.readFileSync(BACKUP_FILE, 'utf8');
                return JSON.parse(bRaw);
            } catch (bErr) {
                console.error('Yedek okuma hatası:', bErr.message);
            }
        }
    }
    const initData = getDefaultData();
    saveDatabase(initData);
    return initData;
}

// Veritabanı güvenli kaydetme (Atomik yazım ve yedekleme)
let isWriting = false;
let pendingSaveData = null;

function saveDatabase(data) {
    if (isWriting) {
        pendingSaveData = data;
        return;
    }
    isWriting = true;
    try {
        data.lastUpdated = Date.now();
        const jsonStr = JSON.stringify(data, null, 2);
        
        // Önceki dosyayı yedekle
        if (fs.existsSync(DB_FILE)) {
            try {
                fs.copyFileSync(DB_FILE, BACKUP_FILE);
            } catch (e) {}
        }

        // Geçici dosyaya yazıp taşıyarak atomik kayıt yap
        const tempFile = DB_FILE + '.tmp';
        fs.writeFileSync(tempFile, jsonStr, 'utf8');
        fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
        console.error('Veritabanı yazma hatası:', err);
    } finally {
        isWriting = false;
        if (pendingSaveData) {
            const next = pendingSaveData;
            pendingSaveData = null;
            saveDatabase(next);
        }
    }
}

// Bellekteki güncel veri
let currentData = loadDatabase();

// Yerel IP adreslerini bul
function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({ name, address: iface.address });
            }
        }
    }
    return addresses;
}

// Express Uygulaması
const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS izinleri (farklı port veya cihazlardan erişim için)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Statik dosyaları sun (public dizini ve proje kök dizini)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// API: Güncel veriyi getir
app.get('/api/data', (req, res) => {
    res.json({
        success: true,
        data: currentData,
        serverTime: Date.now()
    });
});

// API: Veri kaydet ve yayınla
app.post('/api/save', (req, res) => {
    const { projects, officeNotes, senderId } = req.body;
    if (!Array.isArray(projects) || !Array.isArray(officeNotes)) {
        return res.status(400).json({ success: false, message: 'Geçersiz veri formatı.' });
    }

    currentData.projects = projects;
    currentData.officeNotes = officeNotes;
    currentData.lastUpdated = Date.now();
    saveDatabase(currentData);

    // Tüm istemcilere anlık bildir
    broadcastUpdate(senderId);

    res.json({ success: true, lastUpdated: currentData.lastUpdated });
});

// API: İstemcinin yerel verisini aktar (Migrate)
app.post('/api/migrate', (req, res) => {
    const { projects, officeNotes, force } = req.body;
    // Eğer sunucu veritabanı boşsa ya da force istenmişse içeri al
    if (force || currentData.projects.length <= 1) {
        if (Array.isArray(projects) && projects.length > 0) currentData.projects = projects;
        if (Array.isArray(officeNotes) && officeNotes.length > 0) currentData.officeNotes = officeNotes;
        currentData.lastUpdated = Date.now();
        saveDatabase(currentData);
        broadcastUpdate();
        return res.json({ success: true, message: 'Veriler sunucuya aktarıldı.' });
    }
    res.json({ success: false, message: 'Sunucuda zaten mevcut veri var.' });
});

// API: Ağ ve sunucu bilgisi
app.get('/api/info', (req, res) => {
    res.json({
        port: PORT,
        ips: getLocalIpAddresses(),
        clientCount: wss ? wss.clients.size : 0
    });
});

// HTTP ve WebSocket Sunucusu
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastUpdate(excludeSenderId = null) {
    const payload = JSON.stringify({
        type: 'REMOTE_UPDATE',
        senderId: excludeSenderId,
        data: {
            projects: currentData.projects,
            officeNotes: currentData.officeNotes,
            lastUpdated: currentData.lastUpdated
        }
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            // Eğer gönderen kimliği varsa bile karşı taraflara gönder
            if (!excludeSenderId || client._clientId !== excludeSenderId) {
                client.send(payload);
            }
        }
    });
}

wss.on('connection', (ws, req) => {
    // İstemciye hoş geldin ve ilk veriyi gönder
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.send(JSON.stringify({
        type: 'INIT',
        data: {
            projects: currentData.projects,
            officeNotes: currentData.officeNotes,
            lastUpdated: currentData.lastUpdated
        }
    }));

    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message.toString());
            if (parsed.type === 'IDENTIFY') {
                ws._clientId = parsed.clientId;
            } else if (parsed.type === 'SAVE_STATE') {
                if (parsed.data) {
                    if (Array.isArray(parsed.data.projects)) currentData.projects = parsed.data.projects;
                    if (Array.isArray(parsed.data.officeNotes)) currentData.officeNotes = parsed.data.officeNotes;
                    currentData.lastUpdated = Date.now();
                    saveDatabase(currentData);
                    broadcastUpdate(parsed.clientId);
                }
            }
        } catch (e) {
            console.error('WS mesaj hatası:', e);
        }
    });

    ws.on('close', () => {
        broadcastClientCount();
    });

    broadcastClientCount();
});

function broadcastClientCount() {
    const msg = JSON.stringify({
        type: 'CLIENT_COUNT',
        count: wss.clients.size
    });
    wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
    });
}

// 25 saniyede bir ping atarak bağlantıyı canlı tut
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 25000);

wss.on('close', () => clearInterval(heartbeatInterval));

// Sunucuyu başlat
server.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIpAddresses();
    console.log('\n==================================================================');
    console.log('   MİMARİ PROJE & OFİS GÖREV ARŞİVİ - MERKEZİ AĞ SUNUCUSU');
    console.log('==================================================================');
    console.log(` * Bu Bilgisayardan Giriş : http://localhost:${PORT}`);
    if (ips.length > 0) {
        console.log('\n * Aynı Wi-Fi/Ağdaki Çalışma Arkadaşlarınız İçin Bağlantı Linkleri:');
        ips.forEach(ip => {
            console.log(`   👉 http://${ip.address}:${PORT}  (${ip.name})`);
        });
    } else {
        console.log(` * Ağ IP adresi bulunamadı, localhost:${PORT} üzerinden çalışıyor.`);
    }
    console.log(`\n * Veritabanı Klasörü      : ${DB_FILE}`);
    console.log('==================================================================\n');
});
