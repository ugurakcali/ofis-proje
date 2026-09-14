/* ===== MİMZ OFİS - GENEL OFİS NOTLARI MOTORU ===== */

        /* ===== GENEL OFİS: NOT DEFTERİ MOTORU ===== */
        // officeNotes ve currentEditingNoteId state.js dosyasında tanımlanmıştır.

        function loadOfficeNotes() {
            const saved = localStorage.getItem('mimzOfficeNotes');
            if (saved) {
                try { officeNotes = JSON.parse(saved); } catch (e) { officeNotes = []; }
            }
        }


        function renderOfficeNotes() {
            const container = document.getElementById('office-notes-container');
            if (!container) return;
            container.innerHTML = '';

            let visibleNotes = officeNotes.filter(n => {
                const statusMatch = currentTab === 'active' ? !n.isArchived : n.isArchived;
                if (!statusMatch) return false;
                const f = (n.folder || '').trim();
                return currentViewFolder ? f === currentViewFolder : (f === '' || f === 'Ana Ekran');
            });
            visibleNotes.sort((a, b) => (a.isPinned !== b.isPinned ? (a.isPinned ? -1 : 1) : b.id - a.id));

            if (visibleNotes.length === 0) {
                container.innerHTML = `<div style="opacity:0.6; font-size:0.9rem; padding: 4px 2px; grid-column: 1 / -1;">${currentTab === 'archived' ? 'Bu görünümde arşivlenmiş not yok.' : 'Henüz not eklenmedi. "+ Yeni Not Ekle" ile başlayabilirsiniz.'}</div>`;
                return;
            }

            visibleNotes.forEach(note => {
                const card = document.createElement('div');
                card.className = 'note-card glitter-frame';
                card.draggable = true;
                card.ondragstart = (e) => handleNoteDragStart(e, note.id);
                if (note.color) card.style.backgroundColor = note.color;

                card.onclick = (e) => {
                    if (!e.target.closest('.note-card-del') && !e.target.closest('.note-card-menu-btn') && !e.target.closest('.note-card-pip-btn')) {
                        triggerSparkleBurst(e.clientX, e.clientY, 26, { burstSpeed: 4.2 });
                        openNoteEditor(note.id);
                    }
                };

                const preview = (note.content || '').trim();
                const escapedPreview = preview
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

                card.innerHTML = `
                    <button class="note-card-pip-btn" onclick="openFloatingPipNote(${note.id}, event)" title="Tüm Uygulamaların Üstünde Tut (Masaüstü PiP)">
                        <svg class="icon-svg" viewBox="0 0 24 24" style="width:13px;height:13px;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><rect x="11" y="9" width="9" height="7" rx="1" ry="1" fill="currentColor"></rect></svg>
                    </button>
                    <button class="note-card-menu-btn" onclick="toggleCardMenu('note', ${note.id}, this, event)" title="Klasöre Taşı / Arşivle / Sil">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </button>
                    <button class="note-card-del" onclick="deleteOfficeNote(${note.id}, event)" title="Notu Sil">
                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                    </button>
                    <div class="note-card-title">${note.isPinned ? '📌 ' : ''}${note.title || 'İsimsiz Not'}</div>
                    ${note.folder && note.folder !== 'Ana Ekran' ? `<div class="note-folder-badge" onclick="event.stopPropagation(); openFolderOrHome('${note.folder.replace(/'/g, "\\'")}')" style="cursor:pointer;" title="Bu klasörü aç">${note.folder}</div>` : ''}
                    <div class="note-card-preview">${escapedPreview ? escapedPreview : '<span style="opacity:0.5;">(Boş not)</span>'}</div>
                    <div class="note-card-date">${note.createdAt ? ('Oluşturma: ' + note.createdAt) : ''}${note.updatedAt ? (note.createdAt ? ' · Güncelleme: ' : 'Güncelleme: ') + note.updatedAt : ''}</div>
                `;
                container.appendChild(card);
            });

            if (currentPipTarget && currentPipTarget.type === 'note') renderPipContent();
        }

        function createOfficeNote() {
            const note = {
                id: Date.now(),
                title: "Yeni Not",
                content: "",
                color: '#fdf6b2',
                folder: currentViewFolder || 'Ana Ekran',
                isArchived: false,
                isPinned: false,
                subNotes: [],
                createdAt: getFormattedDate(),
                updatedAt: getFormattedDate()
            };
            officeNotes.unshift(note);
            saveOfficeNotes();
            renderOfficeNotes();
            openNoteEditor(note.id);
        }

        function openNoteEditor(noteId) {
            const note = officeNotes.find(n => n.id === noteId);
            if (!note) return;
            currentEditingNoteId = noteId;
            document.getElementById('note-title-input').value = note.title || '';
            document.getElementById('note-textarea').value = note.content || '';

            const noteBox = document.getElementById('note-modal-box');
            if (note.color) {
                noteBox.style.backgroundColor = note.color;
                noteBox.style.color = getContrastColor(note.color);
            } else {
                noteBox.style.removeProperty('background-color');
                noteBox.style.removeProperty('color');
            }

            document.getElementById('note-color-picker-wrapper').classList.remove('active');
            renderNoteSubNotes();
            document.getElementById('note-modal-overlay').style.display = 'flex';
            setTimeout(() => {
                const titleInp = document.getElementById('note-title-input');
                if (titleInp) titleInp.focus();
            }, 50);
        }

        /* NOT RENGİ MOTORU */
        function toggleNoteColorPicker() {
            buildNoteColorPicker();
            document.getElementById('note-color-picker-wrapper').classList.toggle('active');
        }

        function buildNoteColorPicker() {
            const picker = document.getElementById('note-color-picker');
            if (!picker || picker.childElementCount > 0) return;
            const hues = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345];
            const saturations = [45, 65];
            const lightneses = [25, 40, 60, 75, 88];
            const colors = [];

            hues.forEach(h => {
                saturations.forEach(s => {
                    lightneses.forEach(l => { colors.push(`hsl(${h}, ${s}%, ${l}%)`); });
                });
            });

            colors.forEach(col => {
                const dot = document.createElement('div');
                dot.className = 'color-dot';
                dot.style.backgroundColor = col;
                dot.onclick = () => {
                    applyNoteColor(col);
                    picker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                };
                picker.appendChild(dot);
            });
        }

        function applyNoteColor(color) {
            if (!currentEditingNoteId) return;
            const note = officeNotes.find(n => n.id === currentEditingNoteId);
            if (!note) return;
            note.color = color;
            note.updatedAt = getFormattedDate();
            saveOfficeNotes();

            const noteBox = document.getElementById('note-modal-box');
            if (noteBox) {
                noteBox.style.backgroundColor = color;
                noteBox.style.color = getContrastColor(color);
            }
            renderOfficeNotes();
        }

        function resetNoteColor() { applyNoteColor('#fdf6b2'); }

        /* NOT İÇİN EK NOT (ALT NOT) MOTORU */
        function renderNoteSubNotes() {
            const container = document.getElementById('note-subnotes-container');
            if (!container) return;
            container.innerHTML = '';
            const note = officeNotes.find(n => n.id === currentEditingNoteId);
            if (!note || !note.subNotes || note.subNotes.length === 0) return;

            note.subNotes.forEach(sn => {
                const item = document.createElement('div');
                item.className = 'note-subnote-item';
                const span = document.createElement('span');
                span.textContent = sn.text;
                span.title = 'Düzenlemek için çift tıklayın';
                span.ondblclick = () => editNoteSubNote(sn.id);
                const delBtn = document.createElement('button');
                delBtn.className = 'note-subnote-del';
                delBtn.title = 'Ek Notu Sil';
                delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>`;
                delBtn.onclick = () => deleteNoteSubNote(sn.id);
                item.appendChild(span);
                item.appendChild(delBtn);
                container.appendChild(item);
            });
        }

        function addNoteSubNote() {
            if (!currentEditingNoteId) return;
            const input = document.getElementById('note-subnote-input');
            const text = (input.value || '').trim();
            if (!text) return;
            const note = officeNotes.find(n => n.id === currentEditingNoteId);
            if (!note) return;
            if (!note.subNotes) note.subNotes = [];
            note.subNotes.push({ id: Date.now(), text: text });
            note.updatedAt = getFormattedDate();
            saveOfficeNotes();
            input.value = '';
            renderNoteSubNotes();
        }

        function editNoteSubNote(subNoteId) {
            const note = officeNotes.find(n => n.id === currentEditingNoteId);
            if (!note || !note.subNotes) return;
            const sn = note.subNotes.find(s => s.id === subNoteId);
            if (!sn) return;
            const updated = prompt('Ek Notu Düzenle:', sn.text);
            if (updated === null) return;
            const trimmed = updated.trim();
            if (!trimmed) return;
            sn.text = trimmed;
            note.updatedAt = getFormattedDate();
            saveOfficeNotes();
            renderNoteSubNotes();
        }

        function deleteNoteSubNote(subNoteId) {
            const note = officeNotes.find(n => n.id === currentEditingNoteId);
            if (!note || !note.subNotes) return;
            note.subNotes = note.subNotes.filter(s => s.id !== subNoteId);
            note.updatedAt = getFormattedDate();
            saveOfficeNotes();
            renderNoteSubNotes();
        }

        function closeNoteModalOverlay(event) {
            if (event.target === document.getElementById('note-modal-overlay')) saveAndCloseNoteModal();
        }

        function saveAndCloseNoteModal() {
            if (currentEditingNoteId) {
                const note = officeNotes.find(n => n.id === currentEditingNoteId);
                if (note) {
                    const newTitle = document.getElementById('note-title-input').value.trim() || 'İsimsiz Not';
                    const newContent = document.getElementById('note-textarea').value;
                    if (note.title !== newTitle || note.content !== newContent) {
                        note.title = newTitle;
                        note.content = newContent;
                        note.updatedAt = getFormattedDate();
                        saveOfficeNotes();
                    }
                }
            }
            document.getElementById('note-modal-overlay').style.display = 'none';
            currentEditingNoteId = null;
            renderOfficeNotes();
        }

        function deleteOfficeNote(noteId, event) {
            if (event) event.stopPropagation();
            if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return;
            officeNotes = officeNotes.filter(n => n.id !== noteId);
            saveOfficeNotes();
            renderOfficeNotes();
            showToast('Not silindi.', 'delete');
        }
