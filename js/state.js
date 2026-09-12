/* ===== MİMZ OFİS - GLOBAL DURUM VE YARDIMCI METODLAR ===== */
        let isLightMode = localStorage.getItem('mimzTheme') === 'light';
        let customAppBgColor = localStorage.getItem('mimzCustomAppBg');
        let currentTab = 'active'; 
        let currentViewFolder = null;
        let appMode = 'ruhsat'; // 'ruhsat' = Ruhsat/İmar projeleri, 'ofis' = Genel Ofis işleri

        let currentEditingProjectId = null;
        let currentPipProjectId = null;
        let currentPipTarget = { type: 'project', id: null };
        let nativePipWindow = null; 
        let isPipDragging = false;
        let pipStartX, pipStartY, pipStartLeft, pipStartTop;

        let activeHlRange = null;
        let activeHlTargetInfo = null;
        let dragSourceTaskIndex = null;

        // Modal ve PiP alt görev açık kalma durum haritası
        const pipDrawerOpenMap = new Map(); // key: `${projectId}-${taskIndex}` -> boolean
        const modalSubtaskAdderOpen = new Set(); // set of taskIndex


let projects = [];
let officeNotes = [];

        /* GERİ AL (UNDO) VE YİNELE (REDO) MOTORU */
        let undoStack = [];
        let redoStack = [];
        const MAX_HISTORY = 50;

        function recordState(sourceEl = null) {
            try {
                const snapshot = JSON.stringify(projects);
                if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snapshot) return;
                undoStack.push(snapshot);
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                redoStack = [];
                // Her komutta simli ışıltı dağıt
                triggerSparkleBurstOnAction(sourceEl);
            } catch (e) {
                console.error("Durum kaydedilemedi:", e);
            }
        }

        function undoAction() {
            if (undoStack.length === 0) {
                showToast("Geri alınacak önceki işlem yok.", "info");
                return;
            }
            const currentSnapshot = JSON.stringify(projects);
            redoStack.push(currentSnapshot);

            const prevSnapshot = undoStack.pop();
            projects = JSON.parse(prevSnapshot);
            saveProjects();
            refreshAllViews();
            triggerSparkleBurstOnAction();
            showToast("İşlem geri alındı (Undo)", "undo");
        }

        function redoAction() {
            if (redoStack.length === 0) {
                showToast("Yinelenecek işlem yok.", "info");
                return;
            }
            const currentSnapshot = JSON.stringify(projects);
            undoStack.push(currentSnapshot);

            const nextSnapshot = redoStack.pop();
            projects = JSON.parse(nextSnapshot);
            saveProjects();
            refreshAllViews();
            triggerSparkleBurstOnAction();
            showToast("İşlem yinelendi (Redo)", "redo");
        }

        function getActiveProject(elementOrContext) {
            if (elementOrContext) {
                const doc = elementOrContext.ownerDocument || document;
                const inPip = (doc !== document) || (elementOrContext.closest && (elementOrContext.closest('#floating-pip-widget') || elementOrContext.closest('#native-pip-root')));
                if (inPip && currentPipProjectId) {
                    const p = projects.find(item => item.id === currentPipProjectId);
                    if (p) return p;
                }
                const inModal = elementOrContext.closest && elementOrContext.closest('#modal-content');
                if (inModal && currentEditingProjectId) {
                    const p = projects.find(item => item.id === currentEditingProjectId);
                    if (p) return p;
                }
            }
            if (document.getElementById('modal-overlay').style.display === 'flex' && currentEditingProjectId) {
                const p = projects.find(item => item.id === currentEditingProjectId);
                if (p) return p;
            }
            if (currentPipProjectId) {
                const p = projects.find(item => item.id === currentPipProjectId);
                if (p) return p;
            }
            if (currentEditingProjectId) {
                const p = projects.find(item => item.id === currentEditingProjectId);
                if (p) return p;
            }
            return projects[0] || null;
        }

        function refreshAllViews() {
            if (document.getElementById('modal-overlay').style.display === 'flex' && currentEditingProjectId) {
                const proj = projects.find(p => p.id === currentEditingProjectId);
                if (proj) {
                    document.getElementById('modal-title').value = proj.title || '';
                    document.getElementById('modal-folder').value = proj.folder || '';
                }
                renderTasks();
            }
            renderPipContent();
            renderProjects();
        }

        let toastTimeout = null;
        function showToast(msg, type = "info") {
            const toast = document.getElementById('toast');
            if (!toast) return;
            let iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
            if (type === "undo") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
            else if (type === "redo") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>`;
            else if (type === "delete") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>`;
            
            toast.innerHTML = `${iconSvg}<span>${msg}</span>`;
            toast.classList.add('show');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 2200);
        }

        function getContrastColor(colorStr) {
            if (!colorStr) return '#1a1a1a';
            const hslMatch = colorStr.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
            if (hslMatch) {
                const lightness = parseInt(hslMatch[3], 10);
                return lightness > 55 ? '#1a1a1a' : '#ffffff';
            }
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness > 135 ? '#1a1a1a' : '#ffffff';
            }
            return '#1a1a1a';
        }

        function getColorBrightness(colorStr) {
            if (!colorStr) return 255;
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return 255;
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return (r * 299 + g * 587 + b * 114) / 1000;
        }

        function darkenColor(colorStr, factor) {
            let hex = (colorStr || '').replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return colorStr;
            const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
            const r = clamp(parseInt(hex.substring(0, 2), 16) * factor);
            const g = clamp(parseInt(hex.substring(2, 4), 16) * factor);
            const b = clamp(parseInt(hex.substring(4, 6), 16) * factor);
            const toHex = n => n.toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        function hexToHsl(hex) {
            let h = (hex || '').replace('#', '');
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            if (h.length !== 6) h = '808080';
            const r = parseInt(h.substring(0, 2), 16) / 255;
            const g = parseInt(h.substring(2, 4), 16) / 255;
            const b = parseInt(h.substring(4, 6), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const l = (max + min) / 2;
            let hue = 0, sat = 0;
            const d = max - min;
            if (d !== 0) {
                sat = d / (1 - Math.abs(2 * l - 1));
                switch (max) {
                    case r: hue = ((g - b) / d) % 6; break;
                    case g: hue = (b - r) / d + 2; break;
                    case b: hue = (r - g) / d + 4; break;
                }
                hue *= 60;
                if (hue < 0) hue += 360;
            }
            return { h: hue, s: sat * 100, l: l * 100 };
        }

        function hslToHex(h, s, l) {
            s = Math.max(0, Math.min(100, s)) / 100;
            l = Math.max(0, Math.min(100, l)) / 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l - c / 2;
            let r = 0, g = 0, b = 0;
            if (h < 60) { r = c; g = x; b = 0; }
            else if (h < 120) { r = x; g = c; b = 0; }
            else if (h < 180) { r = 0; g = c; b = x; }
            else if (h < 240) { r = 0; g = x; b = c; }
            else if (h < 300) { r = x; g = 0; b = c; }
            else { r = c; g = 0; b = x; }
            const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        // Vurgu (accent) renklerini SABİT pembe yerine, o an ekrandaki arka planın
        // kendi tonundan (hue) türetir: arka plan yeşilse vurgular yeşil, maviyse mavi olur.
        // Sadece açık/koyuluk (lightness) ayarlanır ki kontrast her zaman okunaklı kalsın.
        function applyAccentForBackground(bgColor) {
            const bgHsl = hexToHsl(bgColor);
            // Arka plan neredeyse gri/rentsizse (doygunluk çok düşükse) orijinal toz pembe tonuna dön
            const hue = bgHsl.s < 6 ? 291 : bgHsl.h;
            const sat = Math.max(bgHsl.s, 40);
            const bgIsLight = bgHsl.l > 55;
            const primary = hslToHex(hue, sat, bgIsLight ? 36 : 78);
            const secondary = hslToHex(hue, sat, bgIsLight ? 46 : 66);
            const hover = hslToHex(hue, sat, bgIsLight ? 28 : 87);
            document.body.style.setProperty('--primary-accent', primary);
            document.body.style.setProperty('--secondary-accent', secondary);
            document.body.style.setProperty('--accent-text-color', getContrastColor(primary));
            document.body.style.setProperty('--btn-hover-bg', hover);
        }

        function clearCustomAccent() {
            document.body.style.removeProperty('--primary-accent');
            document.body.style.removeProperty('--secondary-accent');
            document.body.style.removeProperty('--accent-text-color');
            document.body.style.removeProperty('--btn-hover-bg');
        }

        function applyTheme() {
            const btn = document.getElementById('theme-btn');
            if (isLightMode) {
                document.body.classList.add('light-mode');
                btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`; 
                btn.title = "Koyu Temaya Geç";
            } else {
                document.body.classList.remove('light-mode');
                btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`; 
                btn.title = "Açık Temaya Geç";
            }

            if (customAppBgColor) {
                document.body.style.setProperty('--bg-color', customAppBgColor);
                document.getElementById('bg-color-picker').value = customAppBgColor;
                applyAccentForBackground(customAppBgColor);
            } else {
                document.body.style.removeProperty('--bg-color');
                clearCustomAccent();
            }

            // "+ Yeni ... Ekle" butonlarına basıldığında, o an aktif olan arka planın
            // daha koyu bir tonunu kullan (özel seçilmiş renk ya da varsayılan tema rengi).
            const effectiveBg = customAppBgColor || (isLightMode ? '#f4f5f7' : '#1e1f22');
            document.body.style.setProperty('--btn-active-bg', darkenColor(effectiveBg, 0.78));
        }
        
        function toggleTheme() {
            isLightMode = !isLightMode;
            localStorage.setItem('mimzTheme', isLightMode ? 'light' : 'dark');
            customAppBgColor = null;
            localStorage.removeItem('mimzCustomAppBg');
            applyTheme();
            const btn = document.getElementById('theme-btn');
            triggerSparkleBurstOnAction(btn);
        }

        function changeAppBgColor(event) {
            customAppBgColor = event.target.value;
            localStorage.setItem('mimzCustomAppBg', customAppBgColor);
            applyTheme();
            triggerSparkleBurstOnAction(event.target);
        }

        applyTheme();

        function getFormattedDate() {
            return new Date().toLocaleString('tr-TR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

function saveProjects() {
    localStorage.setItem('mimzProjects', JSON.stringify(projects));
    if (typeof notifyServerStateChange === 'function') notifyServerStateChange();
}

function saveOfficeNotes() {
    localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
    if (typeof notifyServerStateChange === 'function') notifyServerStateChange();
}
