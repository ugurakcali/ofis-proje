/* ===== MİMZ OFİS - UYGULAMA BAŞLATICI VE GLOBAL OLAYLAR ===== */
        function switchFilterTab(tab) {
            currentTab = tab;
            document.getElementById('tab-active').classList.toggle('active', tab === 'active');
            document.getElementById('tab-archived').classList.toggle('active', tab === 'archived');
            triggerSparkleBurstOnAction();
            renderProjects();
            if (appMode === 'ofis') renderOfficeNotes();
        }

        // RUHSAT/İMAR PROJELERİ ile GENEL OFİS İŞLERİ arasında geçiş
        function switchAppMode(mode) {
            appMode = mode;
            currentViewFolder = null;
            document.getElementById('mode-tab-ruhsat').classList.toggle('active', mode === 'ruhsat');
            document.getElementById('mode-tab-ofis').classList.toggle('active', mode === 'ofis');
            document.getElementById('header-buttons-ruhsat').style.display = mode === 'ruhsat' ? 'flex' : 'none';
            document.getElementById('header-buttons-ofis').style.display = mode === 'ofis' ? 'flex' : 'none';
            document.getElementById('office-notes-section').style.display = mode === 'ofis' ? 'block' : 'none';
            triggerSparkleBurstOnAction();
            renderProjects();
            if (mode === 'ofis') renderOfficeNotes();
        }

        function openFolderOrHome(folderName) {
            const f = (folderName || '').trim();
            if (!f || f === 'Ana Ekran') { goHome(); return; }
            openFolder(f);
        }

        function openFolder(folderName) { 
            currentViewFolder = folderName; 
            triggerSparkleBurstOnAction();
            renderProjects(); 
            if (appMode === 'ofis') renderOfficeNotes();
        }
        function goHome() { 
            currentViewFolder = null; 
            triggerSparkleBurstOnAction();
            renderProjects(); 
            if (appMode === 'ofis') renderOfficeNotes();
        }

        /* KLAVYE KISAYOLLARI */
        window.addEventListener('keydown', (e) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            const isEditingContent = document.activeElement && document.activeElement.isContentEditable;
            const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || isEditingContent;

            if (isCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                if (!isTyping) { e.preventDefault(); undoAction(); }
            }
            else if (isCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                if (!isTyping) { e.preventDefault(); redoAction(); }
            }
            else if (isCtrl && e.key.toLowerCase() === 'u') {
                if (activeHlRange && activeHlTargetInfo && !isEditingContent) {
                    e.preventDefault();
                    applyHighlight('hl-pen-underline');
                }
            }
        });


// Uygulama Başlatma ve Yaşam Döngüsü Dinleyicisi
function initMimzApp() {
    applyTheme();
    initAmbientDust();
    buildColorPicker();
    initProjects();
    loadOfficeNotes();
    initSyncEngine();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMimzApp);
} else {
    initMimzApp();
}
