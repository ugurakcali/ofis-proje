/* ===== MİMZ OFİS - PDF VE TXT DIŞA AKTARMA (EXPORT) MOTORU ===== */

/**
 * UTF-8 BOM destekli metin dosyası indirir (Türkçe karakterleri Notepad vb. sorunsuz açar).
 */
function downloadTxtFile(filename, content) {
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("TXT dosyası bilgisayarınıza indirildi.");
}

/**
 * Yazdırma ve "PDF Olarak Kaydet" için temiz, profesyonel bir yazdırma penceresi açar.
 */
function printHtmlContent(title, htmlBody) {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(title)}</title>
            <style>
                @page {
                    size: A4;
                    margin: 15mm 15mm 15mm 15mm;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #1a1a1a;
                    background: #ffffff;
                    margin: 0;
                    padding: 20px;
                    font-size: 10.5pt;
                    line-height: 1.45;
                }
                h1, h2, h3, h4 {
                    margin-top: 0;
                    color: #111827;
                }
                .report-header {
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }
                .report-title {
                    font-size: 18pt;
                    font-weight: 800;
                    color: #1e3a8a;
                    margin: 0;
                }
                .report-meta {
                    font-size: 9pt;
                    color: #64748b;
                    text-align: right;
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 8.5pt;
                    font-weight: 600;
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #cbd5e1;
                    margin-right: 6px;
                }
                .badge-ruhsat {
                    background: #ecfdf5;
                    color: #065f46;
                    border-color: #a7f3d0;
                }
                .progress-box {
                    margin: 10px 0 16px 0;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .progress-bar-bg {
                    width: 60%;
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: #10b981;
                }
                .task-section {
                    margin-top: 14px;
                    margin-bottom: 6px;
                    font-weight: 700;
                    font-size: 11pt;
                    color: #1e293b;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 4px;
                }
                .task-list {
                    list-style: none;
                    padding-left: 0;
                    margin: 8px 0;
                }
                .task-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 4px 0;
                    font-size: 9.5pt;
                    page-break-inside: avoid;
                }
                .checkbox {
                    width: 13px;
                    height: 13px;
                    border: 1.5px solid #64748b;
                    border-radius: 3px;
                    margin-top: 2px;
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: bold;
                }
                .checkbox.checked {
                    background: #10b981;
                    border-color: #10b981;
                    color: #ffffff;
                }
                .task-text {
                    flex-grow: 1;
                }
                .task-text.completed {
                    text-decoration: line-through;
                    color: #64748b;
                }
                .task-note {
                    font-size: 8.5pt;
                    color: #d97706;
                    background: #fef3c7;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-top: 2px;
                    display: inline-block;
                }
                .subtasks-list {
                    list-style: none;
                    padding-left: 24px;
                    margin: 4px 0 6px 0;
                }
                .subtask-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    padding: 2px 0;
                    font-size: 8.8pt;
                }
                .note-box {
                    border: 1px solid #fed7aa;
                    background: #fffbeb;
                    border-radius: 6px;
                    padding: 12px 14px;
                    margin-bottom: 16px;
                    page-break-inside: avoid;
                }
                .note-box-title {
                    font-weight: 700;
                    font-size: 11pt;
                    margin-bottom: 6px;
                    color: #9a3412;
                }
                .note-box-content {
                    font-size: 9.5pt;
                    white-space: pre-wrap;
                    color: #334155;
                }
                .page-break {
                    page-break-before: always;
                    margin-top: 20px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            ${htmlBody}
        </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
            if (document.body.contains(printFrame)) document.body.removeChild(printFrame);
        }, 4000);
    }, 450);

    showToast("PDF oluşturma / yazdırma penceresi açıldı.");
}

/* ==========================================================================
   TEKİL VE TOPLU TXT DIŞA AKTARMA FONKSİYONLARI
   ========================================================================== */

function formatProjectToTxt(proj) {
    let out = [];
    out.push("=".repeat(75));
    out.push(`PROJE: ${proj.title || "İsimsiz Proje"}${proj.isRuhsat ? " [RUHSAT & İMAR FÖYÜ]" : ""}`);
    out.push(`Klasör: ${proj.folder || "Ana Ekran"} | Durum: ${proj.isArchived ? "Arşivlenmiş" : "Aktif"}`);
    if (proj.createdAt) out.push(`Oluşturma: ${proj.createdAt}`);
    if (proj.updatedAt) out.push(`Son Güncelleme: ${proj.updatedAt}`);
    if (proj.metadata) {
        if (proj.metadata.adaParsel) out.push(`Ada/Parsel: ${proj.metadata.adaParsel}`);
        if (proj.metadata.mimar) out.push(`Mimar: ${proj.metadata.mimar}`);
        if (proj.metadata.projeAdi) out.push(`Proje Adı: ${proj.metadata.projeAdi}`);
    }

    let total = 0, done = 0;
    (proj.tasks || []).forEach(t => {
        if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach(st => { total++; if (st.completed) done++; });
        } else {
            total++; if (t.completed) done++;
        }
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    out.push(`İlerleme Durumu: %${pct} (${done} / ${total} tamamlandı)`);
    out.push("-".repeat(75));
    out.push("GÖREVLER / KRİTERLER:");

    (proj.tasks || []).forEach((t, idx) => {
        const mark = t.completed ? "[X]" : "[ ]";
        out.push(`${mark} ${t.text || `Madde ${idx + 1}`}`);
        if (t.note && t.note.trim()) {
            out.push(`    [Not: ${t.note.trim()}]`);
        }
        if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach(st => {
                const subMark = st.completed ? "[X]" : "[ ]";
                out.push(`    ${subMark} ${st.text || st.desc || ""}`);
                if (st.note && st.note.trim()) {
                    out.push(`        [Not: ${st.note.trim()}]`);
                }
            });
        }
    });
    out.push("=".repeat(75));
    out.push("\n");
    return out.join("\n");
}

function formatNoteToTxt(note) {
    let out = [];
    out.push("=".repeat(75));
    out.push(`NOT: ${note.title || "İsimsiz Not"}`);
    out.push(`Klasör: ${note.folder || "Ana Ekran"} | Durum: ${note.isArchived ? "Arşivlenmiş" : "Aktif"}`);
    if (note.createdAt) out.push(`Tarih: ${note.createdAt}`);
    if (note.updatedAt) out.push(`Güncelleme: ${note.updatedAt}`);
    out.push("-".repeat(75));
    out.push(note.content || "(Boş not)");
    if (note.subNotes && note.subNotes.length > 0) {
        out.push("\nEK NOTLAR:");
        note.subNotes.forEach(sn => {
            out.push(`- ${sn.text} (${sn.date || ""})`);
        });
    }
    out.push("=".repeat(75));
    out.push("\n");
    return out.join("\n");
}

function exportProjectToTxt(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) { showToast("Proje bulunamadı."); return; }
    const filename = `${(proj.title || "proje").replace(/[/\\?%*:|"<>]/g, "_")}_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTxtFile(filename, formatProjectToTxt(proj));
}

function exportNoteToTxt(noteId) {
    const note = officeNotes.find(n => n.id === noteId);
    if (!note) { showToast("Not bulunamadı."); return; }
    const filename = `${(note.title || "not").replace(/[/\\?%*:|"<>]/g, "_")}_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTxtFile(filename, formatNoteToTxt(note));
}

function exportAllToTxt() {
    let out = [];
    const dateStr = new Date().toLocaleString("tr-TR");
    out.push("********************************************************************************");
    out.push("                     MİMZ OFİS & MİMARİ PROJE ARŞİVİ                          ");
    out.push(`                Toplu Dışa Aktarma Raporu - ${dateStr}                        `);
    out.push(`   Toplam Proje: ${projects.length}  |  Toplam Ofis Notu: ${officeNotes.length} `);
    out.push("********************************************************************************\n\n");

    out.push("################################################################################");
    out.push("                               1. PROJELER VE TO-DO LİSTELERİ                   ");
    out.push("################################################################################\n");
    if (projects.length === 0) {
        out.push("Kayıtlı proje bulunmamaktadır.\n\n");
    } else {
        projects.forEach(p => {
            out.push(formatProjectToTxt(p));
        });
    }

    out.push("\n################################################################################");
    out.push("                               2. GENEL OFİS NOTLARI                           ");
    out.push("################################################################################\n");
    if (officeNotes.length === 0) {
        out.push("Kayıtlı ofis notu bulunmamaktadır.\n\n");
    } else {
        officeNotes.forEach(n => {
            out.push(formatNoteToTxt(n));
        });
    }

    const filename = `Mimz_Ofis_Tum_Kayitlar_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadTxtFile(filename, out.join("\n"));
}

/* ==========================================================================
   TEKİL VE TOPLU PDF DIŞA AKTARMA (YAZDIRMA) FONKSİYONLARI
   ========================================================================== */

function formatProjectToPdfHtml(proj) {
    let total = 0, done = 0;
    (proj.tasks || []).forEach(t => {
        if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach(st => { total++; if (st.completed) done++; });
        } else {
            total++; if (t.completed) done++;
        }
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    let tasksHtml = "";
    (proj.tasks || []).forEach((t, idx) => {
        const isSection = t.text && (t.text.startsWith("A. ") || t.text.startsWith("B. ") || t.text.startsWith("C. ") || t.text.startsWith("D. ") || t.text.startsWith("E. ") || t.text.startsWith("F. ") || t.text.startsWith("G. ") || t.text.startsWith("H. ") || t.text.startsWith("I. ") || t.text.startsWith("J. ") || t.text.startsWith("K. ") || t.text.startsWith("L. "));
        
        let subtasksHtml = "";
        if (t.subtasks && t.subtasks.length > 0) {
            subtasksHtml = `<ul class="subtasks-list">` + t.subtasks.map(st => `
                <li class="subtask-item">
                    <span class="checkbox ${st.completed ? "checked" : ""}">${st.completed ? "✓" : ""}</span>
                    <div style="flex-grow:1;">
                        <span class="${st.completed ? "task-text completed" : "task-text"}">${escapeHtml(st.text || st.desc || "")}</span>
                        ${st.note && st.note.trim() ? `<div class="task-note">Not: ${escapeHtml(st.note.trim())}</div>` : ""}
                    </div>
                </li>
            `).join("") + `</ul>`;
        }

        if (isSection) {
            tasksHtml += `
                <div class="task-section">${escapeHtml(t.text)}</div>
                ${t.note && t.note.trim() ? `<div class="task-note" style="margin-left:8px;">Not: ${escapeHtml(t.note.trim())}</div>` : ""}
                ${subtasksHtml}
            `;
        } else {
            tasksHtml += `
                <li class="task-item">
                    <span class="checkbox ${t.completed ? "checked" : ""}">${t.completed ? "✓" : ""}</span>
                    <div style="flex-grow:1;">
                        <span class="${t.completed ? "task-text completed" : "task-text"}">${escapeHtml(t.text || `Madde ${idx + 1}`)}</span>
                        ${t.note && t.note.trim() ? `<div class="task-note">Not: ${escapeHtml(t.note.trim())}</div>` : ""}
                        ${subtasksHtml}
                    </div>
                </li>
            `;
        }
    });

    return `
        <div class="project-pdf-block">
            <div class="report-header">
                <div>
                    <h2 class="report-title">${proj.isRuhsat ? "🏛️ " : ""}${escapeHtml(proj.title || "İsimsiz Proje")}</h2>
                    <div style="margin-top:6px;">
                        <span class="badge ${proj.isRuhsat ? "badge-ruhsat" : ""}">Klasör: ${escapeHtml(proj.folder || "Ana Ekran")}</span>
                        ${proj.isRuhsat ? `<span class="badge badge-ruhsat">12 Bölüm · 131 Kriter</span>` : ""}
                        ${proj.metadata && proj.metadata.adaParsel ? `<span class="badge">Ada/Parsel: ${escapeHtml(proj.metadata.adaParsel)}</span>` : ""}
                        ${proj.metadata && proj.metadata.mimar ? `<span class="badge">Mimar: ${escapeHtml(proj.metadata.mimar)}</span>` : ""}
                    </div>
                </div>
                <div class="report-meta">
                    <div><b>Tarih:</b> ${escapeHtml(proj.createdAt || new Date().toLocaleDateString("tr-TR"))}</div>
                    ${proj.updatedAt ? `<div><b>Güncelleme:</b> ${escapeHtml(proj.updatedAt)}</div>` : ""}
                </div>
            </div>

            <div class="progress-box">
                <span style="font-weight:700; font-size:9.5pt;">Tamamlanma Oranı: %${pct} (${done} / ${total})</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                </div>
            </div>

            <ul class="task-list">
                ${tasksHtml}
            </ul>
        </div>
    `;
}

function formatNoteToPdfHtml(note) {
    let subNotesHtml = "";
    if (note.subNotes && note.subNotes.length > 0) {
        subNotesHtml = `
            <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #fdba74; font-size:8.8pt;">
                <b>Ek Notlar:</b>
                <ul style="margin:4px 0 0 16px; padding:0;">
                    ${note.subNotes.map(sn => `<li>${escapeHtml(sn.text)} <span style="opacity:0.7; font-size:8pt;">(${escapeHtml(sn.date || "")})</span></li>`).join("")}
                </ul>
            </div>
        `;
    }

    return `
        <div class="note-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="note-box-title">📝 ${escapeHtml(note.title || "İsimsiz Not")}</div>
                <div style="font-size:8pt; color:#9a3412;">Klasör: ${escapeHtml(note.folder || "Ana Ekran")} | ${escapeHtml(note.createdAt || "")}</div>
            </div>
            <div class="note-box-content">${escapeHtml(note.content || "(Boş not)")}</div>
            ${subNotesHtml}
        </div>
    `;
}

function exportProjectToPdf(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) { showToast("Proje bulunamadı."); return; }
    printHtmlContent(proj.title || "Proje Raporu", formatProjectToPdfHtml(proj));
}

function exportNoteToPdf(noteId) {
    const note = officeNotes.find(n => n.id === noteId);
    if (!note) { showToast("Not bulunamadı."); return; }
    const html = `
        <div class="report-header">
            <h1 class="report-title">📝 ${escapeHtml(note.title || "Ofis Notu")}</h1>
            <div class="report-meta">
                <div>Klasör: ${escapeHtml(note.folder || "Ana Ekran")}</div>
                <div>Tarih: ${escapeHtml(note.createdAt || new Date().toLocaleDateString("tr-TR"))}</div>
            </div>
        </div>
        ${formatNoteToPdfHtml(note)}
    `;
    printHtmlContent(note.title || "Not Raporu", html);
}

function exportAllToPdf() {
    const dateStr = new Date().toLocaleString("tr-TR");
    let html = `
        <div class="report-header" style="border-bottom: 3px solid #1e3a8a; margin-bottom: 24px;">
            <div>
                <h1 class="report-title" style="font-size:22pt;">🏛️ MİMZ OFİS - PROJE VE GÖREV ARŞİVİ</h1>
                <p style="margin:4px 0 0 0; font-size:10pt; color:#475569;">Kepez Belediyesi & PAİY Ruhsat Föyleri, Genel Projeler ve Ofis Notları Raporu</p>
            </div>
            <div class="report-meta">
                <div><b>Tarih:</b> ${dateStr}</div>
                <div><b>Toplam Proje:</b> ${projects.length}</div>
                <div><b>Toplam Not:</b> ${officeNotes.length}</div>
            </div>
        </div>
    `;

    if (projects.length > 0) {
        html += `<h2 style="font-size:14pt; color:#1e3a8a; border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; margin-top:20px;">PROJELER VE KONTROL LİSTELERİ</h2>`;
        projects.forEach((proj, idx) => {
            if (idx > 0) html += `<div class="page-break"></div>`;
            html += formatProjectToPdfHtml(proj);
        });
    }

    if (officeNotes.length > 0) {
        html += `<div class="page-break"></div>`;
        html += `<h2 style="font-size:14pt; color:#9a3412; border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; margin-top:20px;">GENEL OFİS NOTLARI</h2>`;
        officeNotes.forEach(note => {
            html += formatNoteToPdfHtml(note);
        });
    }

    printHtmlContent("Mimz Ofis - Tüm Proje ve Not Arşivi", html);
}

/* ===== BAŞLIK DIŞA AKTAR (EXPORT) MENÜSÜ POPOVER MOTORU ===== */
function buildExportMenuPopover() {
    if (document.getElementById('export-menu-popover')) return;
    const el = document.createElement('div');
    el.id = 'export-menu-popover';
    el.className = 'card-menu-popover export-menu-popover';
    el.addEventListener('mousedown', e => e.stopPropagation());
    document.body.appendChild(el);
}

function toggleExportMenu(btnEl, event) {
    if (event) event.stopPropagation();
    buildExportMenuPopover();
    const popover = document.getElementById('export-menu-popover');
    if (popover.classList.contains('show')) {
        closeExportMenu();
        return;
    }

    const inFolder = typeof currentViewFolder !== 'undefined' && currentViewFolder;
    let folderButtons = '';
    if (inFolder) {
        folderButtons = `
            <div class="card-menu-header-label">📁 "${escapeHtml(currentViewFolder)}" Klasörü</div>
            <button class="card-menu-item" onclick="closeExportMenu(); exportFolderToPdf('${escapeHtml(currentViewFolder)}')">
                <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Bu Klasörü PDF Olarak Kaydet
            </button>
            <button class="card-menu-item" onclick="closeExportMenu(); exportFolderToTxt('${escapeHtml(currentViewFolder)}')">
                <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Bu Klasörü TXT Olarak İndir
            </button>
            <div class="card-menu-sep"></div>
        `;
    }

    const pCount = (typeof projects !== 'undefined') ? projects.length : 0;
    const nCount = (typeof officeNotes !== 'undefined') ? officeNotes.length : 0;

    popover.innerHTML = `
        ${folderButtons}
        <div class="card-menu-header-label">🏛️ Tüm Dosyalar (${pCount} Proje, ${nCount} Not)</div>
        <button class="card-menu-item" onclick="closeExportMenu(); exportAllToPdf()">
            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Tümünü PDF Olarak Kaydet
        </button>
        <button class="card-menu-item" onclick="closeExportMenu(); exportAllToTxt()">
            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Tümünü TXT Olarak İndir
        </button>
    `;

    const rect = btnEl.getBoundingClientRect();
    popover.classList.add('show');
    popover.style.visibility = 'hidden';
    const pw = popover.offsetWidth || 230;
    const ph = popover.offsetHeight || 180;
    let top = rect.bottom + 6;
    let left = rect.left;
    if (top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
    if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
    if (left < 10) left = 10;
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.visibility = 'visible';
}

function closeExportMenu() {
    const popover = document.getElementById('export-menu-popover');
    if (popover) popover.classList.remove('show');
}

window.addEventListener('mousedown', (e) => {
    const popover = document.getElementById('export-menu-popover');
    if (popover && popover.classList.contains('show') && !e.target.closest('#export-menu-popover') && !e.target.closest('.export-btn')) {
        closeExportMenu();
    }
});

