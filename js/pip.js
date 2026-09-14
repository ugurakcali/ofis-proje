/* ===== MİMZ OFİS - ALWAYS-ON-TOP PiP & YÜZEN WIDGET MOTORU ===== */
        /* ALWAYS-ON-TOP OS PiP MOTORU */
        const PIP_INTERNAL_CSS = `
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            body { margin: 0; padding: 0; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
            .pip-header {
                padding: 8px 12px; background: rgba(0, 0, 0, 0.08); border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                display: flex; align-items: center; justify-content: space-between; user-select: none; gap: 8px; flex-shrink: 0;
            }
            .pip-header-left { display: flex; align-items: center; gap: 8px; overflow: hidden; flex-grow: 1; }
            .pip-title { font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
            .pip-title:hover { text-decoration: underline; }
            .pip-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(0, 0, 0, 0.15); white-space: nowrap; }
            .pip-actions { display: flex; align-items: center; gap: 4px; }
            .pip-btn { background: transparent; border: none; color: inherit; cursor: pointer; padding: 4px 6px; border-radius: 6px; opacity: 0.75; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
            .pip-btn:hover { opacity: 1; background: rgba(0, 0, 0, 0.12); }
            .spectrum-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
            
            .pip-toolbar {
                display: flex; align-items: center; justify-content: space-between; padding: 5px 10px;
                background: rgba(0, 0, 0, 0.04); border-bottom: 1px solid rgba(0, 0, 0, 0.07);
                font-size: 0.75rem; gap: 5px; flex-wrap: wrap; flex-shrink: 0;
            }
            .pip-sort-group { display: flex; align-items: center; gap: 4px; }
            .pip-sort-btn {
                background: rgba(0, 0, 0, 0.08); border: 1px solid rgba(0, 0, 0, 0.12); color: inherit;
                padding: 3px 7px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer;
            }
            .pip-sort-btn:hover { background: rgba(0, 0, 0, 0.2); }

            .pip-body {
                padding: 8px 10px; overflow-y: auto; overflow-x: hidden; flex-grow: 1;
                min-height: 0 !important; display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin;
            }
            .pip-body::-webkit-scrollbar { width: 5px; }
            .pip-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 4px; }
            .pip-task-card {
                display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.08);
                border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.05); overflow: hidden; flex-shrink: 0 !important;
            }
            .pip-task-card:hover { background: rgba(0, 0, 0, 0.12); }
            .pip-task-main { display: flex; align-items: center; gap: 6px; padding: 7px 9px; min-height: 38px; box-sizing: border-box; }
            .pip-task-main input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: currentColor; margin: 0; flex-shrink: 0; }
            .pip-task-text { font-size: 0.86rem; font-weight: 600; flex-grow: 1; line-height: 1.3; word-break: break-word; cursor: text; border-radius: 4px; padding: 2px 4px; }
            .pip-task-text.completed { text-decoration: line-through; opacity: 0.5; }
            .pip-sub-counter { font-size: 0.72rem; opacity: 0.8; font-weight: 700; white-space: nowrap; padding: 2px 6px; border-radius: 4px; background: rgba(0, 0, 0, 0.08); cursor: pointer; flex-shrink: 0; }
            .pip-sub-counter:hover { background: rgba(0, 0, 0, 0.18); }
            
            .pip-subtasks-drawer { display: none; flex-direction: column; gap: 5px; padding: 6px 8px 8px 20px; background: rgba(0, 0, 0, 0.04); border-top: 1px dashed rgba(0, 0, 0, 0.12); flex-shrink: 0; }
            .pip-subtasks-drawer.expanded { display: flex; }
            .pip-subtask-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 500; }
            .pip-subtask-item input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; accent-color: currentColor; margin: 0; flex-shrink: 0; }
            .pip-subtask-text { flex-grow: 1; cursor: text; border-radius: 4px; padding: 2px 4px; }
            .pip-subtask-text.completed { text-decoration: line-through; opacity: 0.5; }
            
            .pip-subtask-add-row { display: flex; gap: 5px; margin-top: 4px; align-items: center; }
            .pip-subtask-input { flex-grow: 1; padding: 4px 8px; border-radius: 5px; border: 1px dashed rgba(0, 0, 0, 0.25); background: rgba(0, 0, 0, 0.06); color: inherit; font-size: 0.78rem; outline: none; }
            .pip-subtask-input:focus { border-style: solid; border-color: currentColor; background: rgba(0, 0, 0, 0.1); }
            .pip-subtask-add-btn { background: rgba(0, 0, 0, 0.12); border: 1px solid rgba(0, 0, 0, 0.15); color: inherit; padding: 4px 8px; border-radius: 5px; font-size: 0.74rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
            .pip-subtask-add-btn:hover { background: rgba(0, 0, 0, 0.22); }
            
            .pip-footer { padding: 8px 10px; background: rgba(0, 0, 0, 0.06); border-top: 1px solid rgba(0, 0, 0, 0.08); display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
            .pip-input { flex-grow: 1; padding: 6px 10px; border-radius: 7px; border: 1px solid rgba(0, 0, 0, 0.15); background: rgba(0, 0, 0, 0.08); color: inherit; font-size: 0.82rem; outline: none; }
            .pip-add-btn { background: #ffffff; color: #1a1a1a; border: none; padding: 6px 12px; border-radius: 7px; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
            
            .task-move-btns { display: flex; flex-direction: column; gap: 2px; }
            .btn-move { background: rgba(0, 0, 0, 0.12); border: none; border-radius: 4px; color: inherit; width: 18px; height: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.6; }
            .btn-task-action { background: transparent; border: none; color: inherit; opacity: 0.6; cursor: pointer; padding: 3px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
            .btn-task-action:hover { opacity: 1; background: rgba(128,128,128,0.2); }
            .btn-task-action.del:hover { color: #ff4757; background: rgba(255, 71, 87, 0.15); }
            [contenteditable="true"] { outline: 2px solid #fff !important; background: rgba(255, 255, 255, 0.15) !important; }
            .hl-pen-underline { text-decoration: underline !important; text-decoration-color: #ff3344 !important; text-decoration-thickness: 2.5px !important; text-underline-offset: 3px !important; font-weight: 700; display: inline; }
            .hl-pen-strike { text-decoration: line-through !important; text-decoration-color: #ff1744 !important; text-decoration-thickness: 2px !important; opacity: 0.75; display: inline; }
            .hl-pen-yellow { background-color: rgba(255, 235, 59, 0.85) !important; color: #111827 !important; border-radius: 3px; padding: 1px 4px; font-weight: 600; display: inline; }
            .hl-pen-green { background-color: rgba(105, 240, 174, 0.85) !important; color: #111827 !important; border-radius: 3px; padding: 1px 4px; font-weight: 600; display: inline; }
            .hl-pen-blue { background-color: rgba(128, 216, 255, 0.85) !important; color: #111827 !important; border-radius: 3px; padding: 1px 4px; font-weight: 600; display: inline; }
            .hl-pen-pink { background-color: rgba(255, 128, 171, 0.85) !important; color: #111827 !important; border-radius: 3px; padding: 1px 4px; font-weight: 600; display: inline; }
            .hl-pen-orange { background-color: rgba(255, 209, 128, 0.85) !important; color: #111827 !important; border-radius: 3px; padding: 1px 4px; font-weight: 600; display: inline; }

            /* PiP Not Görünümü */
            .pip-note-container {
                display: flex; flex-direction: column; gap: 8px; flex-grow: 1; height: 100%; min-height: 0; box-sizing: border-box;
            }
            .pip-note-textarea {
                width: 100%; flex-grow: 1; min-height: 140px; resize: none;
                background: rgba(0, 0, 0, 0.06); border: 1px solid rgba(0, 0, 0, 0.15);
                border-radius: 8px; padding: 10px; color: inherit; font-family: inherit;
                font-size: 0.92rem; line-height: 1.5; outline: none; box-sizing: border-box;
            }
            .pip-note-textarea:focus { background: rgba(0, 0, 0, 0.1); border-color: rgba(0, 0, 0, 0.35); }
            .pip-note-subnotes-wrap {
                display: flex; flex-direction: column; gap: 6px;
                background: rgba(0, 0, 0, 0.05); border-radius: 8px; padding: 8px 10px;
                border: 1px solid rgba(0, 0, 0, 0.08); flex-shrink: 0; max-height: 190px;
            }
            .pip-subnotes-header {
                display: flex; align-items: center; justify-content: space-between;
                font-size: 0.76rem; font-weight: 700; opacity: 0.85;
            }
            .pip-subnotes-badge {
                background: rgba(0, 0, 0, 0.12); padding: 1px 7px; border-radius: 10px; font-size: 0.7rem;
            }
            .pip-subnotes-list {
                display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 110px; scrollbar-width: thin;
            }
            .pip-subnote-row {
                display: flex; align-items: center; gap: 6px; font-size: 0.82rem;
                background: rgba(0, 0, 0, 0.05); padding: 4px 8px; border-radius: 5px;
            }
            .pip-subnote-bullet { opacity: 0.6; font-weight: 700; }
            .pip-subnote-text { flex-grow: 1; cursor: text; word-break: break-word; }
            .pip-subnote-del {
                background: transparent; border: none; color: inherit; opacity: 0.5;
                cursor: pointer; padding: 2px 4px; display: flex; align-items: center; border-radius: 4px;
            }
            .pip-subnote-del:hover { opacity: 1; color: #ff4757; background: rgba(255, 71, 87, 0.15); }
            .pip-subnote-add-row { display: flex; gap: 6px; margin-top: 4px; }
            .pip-subnote-input {
                flex-grow: 1; padding: 5px 8px; border-radius: 6px; border: 1px dashed rgba(0, 0, 0, 0.25);
                background: rgba(0, 0, 0, 0.06); color: inherit; font-size: 0.8rem; outline: none;
            }
            .pip-subnote-input:focus { border-style: solid; border-color: currentColor; background: rgba(0, 0, 0, 0.1); }
            .pip-subnote-add-btn {
                background: rgba(0, 0, 0, 0.15); border: 1px solid rgba(0, 0, 0, 0.18); color: inherit;
                padding: 5px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer;
            }
            .pip-subnote-add-btn:hover { background: rgba(0, 0, 0, 0.25); }
        `;

        async function openNativeOsPip(targetId, type = 'project') {
            if (type === 'project') {
                currentPipProjectId = targetId;
                currentPipTarget = { type: 'project', id: targetId };
            } else {
                currentPipProjectId = null;
                currentPipTarget = { type: 'note', id: targetId };
            }

            if ('documentPictureInPicture' in window) {
                try {
                    if (nativePipWindow && !nativePipWindow.closed) {
                        nativePipWindow.focus();
                        renderPipContent();
                        return;
                    }

                    nativePipWindow = await window.documentPictureInPicture.requestWindow({ width: 380, height: 530 });
                    const styleEl = nativePipWindow.document.createElement('style');
                    styleEl.textContent = PIP_INTERNAL_CSS;
                    nativePipWindow.document.head.appendChild(styleEl);

                    nativePipWindow.addEventListener('pagehide', () => {
                        nativePipWindow = null;
                        currentPipProjectId = null;
                        currentPipTarget = { type: 'project', id: null };
                    });

                    document.getElementById('floating-pip-widget').style.display = 'none';
                    document.getElementById('modal-overlay').style.display = 'none';
                    document.getElementById('note-modal-overlay').style.display = 'none';
                    currentEditingProjectId = null;
                    currentEditingNoteId = null;
                    renderPipContent();
                    showToast(type === 'note' ? "📝 Not masaüstünde sabitlendi!" : "📌 Panel masaüstünde sabitlendi!");
                    return;
                } catch (err) {
                    console.warn("Native PiP açılamadı, sayfa içi widget devrede:", err);
                }
            }

            const widget = document.getElementById('floating-pip-widget');
            widget.style.display = 'flex';
            widget.classList.remove('pip-minimized');
            document.getElementById('modal-overlay').style.display = 'none';
            document.getElementById('note-modal-overlay').style.display = 'none';
            currentEditingProjectId = null;
            currentEditingNoteId = null;
            renderPipContent();
        }

        function openFloatingPip(projectId, event) {
            if (event) event.stopPropagation();
            openNativeOsPip(projectId, 'project');
        }

        function openFloatingPipNote(noteId, event) {
            if (event) event.stopPropagation();
            openNativeOsPip(noteId, 'note');
        }

        function popoutModalToPip() {
            if (currentEditingProjectId) {
                const id = currentEditingProjectId;
                saveAndCloseModal();
                openFloatingPip(id);
            }
        }

        function popoutNoteModalToPip() {
            if (currentEditingNoteId) {
                const id = currentEditingNoteId;
                saveAndCloseNoteModal();
                openFloatingPipNote(id);
            }
        }

        function maximizePipToModal() {
            if (currentPipTarget && currentPipTarget.type === 'note') {
                const id = currentPipTarget.id;
                closePipWidget();
                openNoteEditor(id);
            } else if (currentPipProjectId || (currentPipTarget && currentPipTarget.type === 'project')) {
                const id = currentPipProjectId || currentPipTarget.id;
                closePipWidget();
                openModal(id);
            }
        }

        function closePipWidget() {
            if (nativePipWindow && !nativePipWindow.closed) {
                nativePipWindow.close();
                nativePipWindow = null;
            }
            document.getElementById('floating-pip-widget').style.display = 'none';
            currentPipProjectId = null;
            currentPipTarget = { type: 'project', id: null };
        }

        function toggleMinimizePip() { document.getElementById('floating-pip-widget').classList.toggle('pip-minimized'); }

        function renamePipTarget() {
            if (currentPipTarget && currentPipTarget.type === 'note') {
                const note = officeNotes.find(n => n.id === currentPipTarget.id);
                if (!note) return;
                const newT = prompt("Not Başlığı:", note.title);
                if (newT !== null && newT.trim() && newT.trim() !== note.title) {
                    recordState();
                    note.title = newT.trim();
                    note.updatedAt = getFormattedDate();
                    saveOfficeNotes();
                    renderPipContent();
                    renderOfficeNotes();
                    showToast("Not başlığı güncellendi.");
                }
                return;
            }
            renamePipProject();
        }

        function renamePipProject() {
            const projId = currentPipProjectId || (currentPipTarget && currentPipTarget.type === 'project' ? currentPipTarget.id : null);
            if (!projId) return;
            const project = projects.find(p => p.id === projId);
            if (!project) return;
            const newT = prompt("Proje Başlığı:", project.title);
            if (newT && newT.trim() && newT.trim() !== project.title) {
                recordState();
                project.title = newT.trim();
                project.updatedAt = getFormattedDate();
                saveProjects();
                refreshAllViews();
                showToast("Proje başlığı güncellendi.");
            }
        }

        function renderPipContent() {
            const isNote = currentPipTarget && currentPipTarget.type === 'note';
            const isProject = (!isNote && currentPipProjectId) || (currentPipTarget && currentPipTarget.type === 'project');

            if (!isNote && !isProject) return;

            let targetDoc = document;
            if (nativePipWindow && !nativePipWindow.closed) {
                targetDoc = nativePipWindow.document;
                if (!targetDoc.getElementById('native-pip-root')) {
                    targetDoc.body.innerHTML = `
                        <div id="native-pip-root" style="display:flex; flex-direction:column; height:100vh; overflow:hidden;">
                            <div class="pip-header">
                                <div class="pip-header-left">
                                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><rect x="11" y="9" width="9" height="7" rx="1" ry="1" fill="currentColor"></rect></svg>
                                    <div class="pip-title" id="native-pip-title" title="Başlığı düzenlemek için tıklayın"></div>
                                    <div class="pip-badge" id="native-pip-badge"></div>
                                </div>
                                <div class="pip-actions">
                                    <button class="pip-btn" id="native-undo-btn" title="Geri Al (Ctrl+Z)">
                                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                                    </button>
                                    <button class="pip-btn" id="native-redo-btn" title="Yinele (Ctrl+Y)">
                                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                                    </button>
                                    <label class="pip-btn" title="Renk Değiştir">
                                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                                        <input type="color" id="native-color-picker" class="spectrum-input-hidden">
                                    </label>
                                    <button class="pip-btn" id="native-max-btn" title="Tam Ekrana Genişlet">
                                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="pip-toolbar" id="native-pip-toolbar">
                                <span style="opacity:0.75; font-weight:700;">Sırala:</span>
                                <div class="pip-sort-group">
                                    <button class="pip-sort-btn" id="native-sort-az" title="A'dan Z'ye">A-Z</button>
                                    <button class="pip-sort-btn" id="native-sort-za" title="Z'den A'ya">Z-A</button>
                                    <button class="pip-sort-btn" id="native-sort-done" title="Tamamlananlar Alta">Alta</button>
                                    <button class="pip-sort-btn" id="native-sort-rev" title="Ters Çevir">Ters</button>
                                </div>
                            </div>
                            <div class="pip-body" id="native-pip-list"></div>
                            <div class="pip-footer" id="native-pip-footer">
                                <input type="text" id="native-pip-input" class="pip-input" placeholder="Hızlı ana madde ekle...">
                                <button class="pip-add-btn" id="native-pip-add-btn">Ekle</button>
                            </div>
                        </div>
                    `;
                    const nInput = targetDoc.getElementById('native-pip-input');
                    const nBtn = targetDoc.getElementById('native-pip-add-btn');
                    if (nBtn && nInput) {
                        nBtn.onclick = () => { addPipTaskFromVal(nInput.value); nInput.value = ''; };
                        nInput.onkeypress = (e) => { if (e.key === 'Enter') { addPipTaskFromVal(nInput.value); nInput.value = ''; } };
                    }
                    
                    const nColor = targetDoc.getElementById('native-color-picker');
                    if (nColor) nColor.oninput = (e) => applyProjectColor(e.target.value);

                    const nUndo = targetDoc.getElementById('native-undo-btn');
                    if (nUndo) nUndo.onclick = () => undoAction();

                    const nRedo = targetDoc.getElementById('native-redo-btn');
                    if (nRedo) nRedo.onclick = () => redoAction();

                    const nMax = targetDoc.getElementById('native-max-btn');
                    if (nMax) nMax.onclick = () => maximizePipToModal();

                    targetDoc.getElementById('native-sort-az').onclick = () => sortTasks('az');
                    targetDoc.getElementById('native-sort-za').onclick = () => sortTasks('za');
                    targetDoc.getElementById('native-sort-done').onclick = () => sortTasks('completed');
                    targetDoc.getElementById('native-sort-rev').onclick = () => sortTasks('reverse');

                    targetDoc.getElementById('native-pip-title').onclick = renamePipTarget;
                }
            }

            if (isNote) {
                const note = officeNotes.find(n => n.id === currentPipTarget.id);
                if (!note) return;

                const cardBgColor = note.color || '#fdf6b2';
                const cardTextColor = getContrastColor(cardBgColor);
                const badgeText = '📝 Not';

                let listEl, titleEl, badgeEl, toolbarEl, footerEl;

                if (nativePipWindow && !nativePipWindow.closed) {
                    targetDoc = nativePipWindow.document;
                    targetDoc.body.style.backgroundColor = cardBgColor;
                    targetDoc.body.style.color = cardTextColor;
                    const root = targetDoc.getElementById('native-pip-root');
                    if (root) {
                        root.style.backgroundColor = cardBgColor;
                        root.style.color = cardTextColor;
                    }
                    titleEl = targetDoc.getElementById('native-pip-title');
                    badgeEl = targetDoc.getElementById('native-pip-badge');
                    listEl = targetDoc.getElementById('native-pip-list');
                    toolbarEl = targetDoc.getElementById('native-pip-toolbar');
                    footerEl = targetDoc.getElementById('native-pip-footer');
                } else {
                    const widget = document.getElementById('floating-pip-widget');
                    widget.style.backgroundColor = cardBgColor;
                    widget.style.color = cardTextColor;

                    titleEl = document.getElementById('pip-project-title');
                    badgeEl = document.getElementById('pip-task-progress');
                    listEl = document.getElementById('pip-task-list');
                    toolbarEl = widget.querySelector('.pip-toolbar');
                    footerEl = widget.querySelector('.pip-footer');
                }

                if (toolbarEl) toolbarEl.style.display = 'none';
                if (footerEl) footerEl.style.display = 'none';

                if (titleEl) {
                    titleEl.textContent = note.title || 'İsimsiz Not';
                    titleEl.onclick = renamePipTarget;
                }
                if (badgeEl) badgeEl.textContent = badgeText;
                if (!listEl) return;

                listEl.innerHTML = `
                    <div class="pip-note-container">
                        <textarea class="pip-note-textarea" id="pip-note-editor-ta" placeholder="Notunuzu buraya yazın..." spellcheck="false"></textarea>
                        <div class="pip-note-subnotes-wrap">
                            <div class="pip-subnotes-header">
                                <span>Ek Notlar / Maddeler</span>
                                <span class="pip-subnotes-badge" id="pip-subnotes-count">${(note.subNotes || []).length}</span>
                            </div>
                            <div class="pip-subnotes-list" id="pip-subnotes-items"></div>
                            <div class="pip-subnote-add-row">
                                <input type="text" class="pip-subnote-input" id="pip-subnote-add-inp" placeholder="Ek not / madde ekle..." enterkeyhint="done">
                                <button class="pip-subnote-add-btn" id="pip-subnote-add-btn">Ekle</button>
                            </div>
                        </div>
                    </div>
                `;

                const ta = listEl.querySelector('#pip-note-editor-ta');
                if (ta) {
                    ta.value = note.content || '';
                    ta.oninput = () => {
                        note.content = ta.value;
                        note.updatedAt = getFormattedDate();
                        saveOfficeNotes();
                        const mainTa = document.getElementById('note-textarea');
                        if (mainTa && currentEditingNoteId === note.id) mainTa.value = ta.value;
                        renderOfficeNotes();
                    };
                }

                const subItemsList = listEl.querySelector('#pip-subnotes-items');
                if (subItemsList) {
                    subItemsList.innerHTML = '';
                    if (note.subNotes && note.subNotes.length > 0) {
                        note.subNotes.forEach(sn => {
                            const row = targetDoc.createElement('div');
                            row.className = 'pip-subnote-row';
                            
                            const bullet = targetDoc.createElement('span');
                            bullet.className = 'pip-subnote-bullet';
                            bullet.textContent = '•';
                            
                            const textSpan = targetDoc.createElement('span');
                            textSpan.className = 'pip-subnote-text';
                            textSpan.textContent = sn.text;
                            textSpan.title = 'Düzenlemek için çift tıklayın';
                            textSpan.ondblclick = () => {
                                const updated = prompt('Ek Notu Düzenle:', sn.text);
                                if (updated !== null && updated.trim() && updated.trim() !== sn.text) {
                                    sn.text = updated.trim();
                                    note.updatedAt = getFormattedDate();
                                    saveOfficeNotes();
                                    renderPipContent();
                                    renderOfficeNotes();
                                }
                            };

                            const delBtn = targetDoc.createElement('button');
                            delBtn.className = 'pip-subnote-del';
                            delBtn.title = 'Sil';
                            delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>`;
                            delBtn.onclick = (e) => {
                                e.stopPropagation();
                                note.subNotes = note.subNotes.filter(s => s.id !== sn.id);
                                note.updatedAt = getFormattedDate();
                                saveOfficeNotes();
                                renderPipContent();
                                renderOfficeNotes();
                            };

                            row.appendChild(bullet);
                            row.appendChild(textSpan);
                            row.appendChild(delBtn);
                            subItemsList.appendChild(row);
                        });
                    } else {
                        subItemsList.innerHTML = `<div style="opacity:0.5; font-size:0.75rem; padding: 2px 0;">Henüz ek not yok.</div>`;
                    }
                }

                const addInp = listEl.querySelector('#pip-subnote-add-inp');
                const addBtn = listEl.querySelector('#pip-subnote-add-btn');
                if (addInp && addBtn) {
                    const doAdd = () => {
                        const val = (addInp.value || '').trim();
                        if (!val) return;
                        if (!note.subNotes) note.subNotes = [];
                        note.subNotes.push({ id: Date.now(), text: val });
                        note.updatedAt = getFormattedDate();
                        saveOfficeNotes();
                        renderPipContent();
                        renderOfficeNotes();
                    };
                    addBtn.onclick = doAdd;
                    addInp.onkeypress = (e) => { if (e.key === 'Enter') doAdd(); };
                }
                return;
            }

            // Project mode:
            const projId = currentPipProjectId || (currentPipTarget && currentPipTarget.type === 'project' ? currentPipTarget.id : null);
            if (!projId) return;
            const project = projects.find(p => p.id === projId);
            if (!project) return;

            let toolbarEl, footerEl;
            if (nativePipWindow && !nativePipWindow.closed) {
                toolbarEl = targetDoc.getElementById('native-pip-toolbar');
                footerEl = targetDoc.getElementById('native-pip-footer');
            } else {
                const widget = document.getElementById('floating-pip-widget');
                toolbarEl = widget.querySelector('.pip-toolbar');
                footerEl = widget.querySelector('.pip-footer');
            }
            if (toolbarEl) toolbarEl.style.display = 'flex';
            if (footerEl) footerEl.style.display = 'flex';

            const cardBgColor = project.color || '#85b88f';
            const cardTextColor = getContrastColor(cardBgColor);

            let total = 0, done = 0;
            if (project.tasks) {
                project.tasks.forEach(t => {
                    total++; if (t.completed) done++;
                    if (t.subtasks) t.subtasks.forEach(st => { total++; if (st.completed) done++; });
                });
            }
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const badgeText = `%${pct} (${done}/${total})`;

            let listEl, titleEl, badgeEl;

            if (nativePipWindow && !nativePipWindow.closed) {
                targetDoc = nativePipWindow.document;
                targetDoc.body.style.backgroundColor = cardBgColor;
                targetDoc.body.style.color = cardTextColor;
                const root = targetDoc.getElementById('native-pip-root');
                if (root) {
                    root.style.backgroundColor = cardBgColor;
                    root.style.color = cardTextColor;
                }

                titleEl = targetDoc.getElementById('native-pip-title');
                badgeEl = targetDoc.getElementById('native-pip-badge');
                listEl = targetDoc.getElementById('native-pip-list');
            } else {
                const widget = document.getElementById('floating-pip-widget');
                widget.style.backgroundColor = cardBgColor;
                widget.style.color = cardTextColor;

                titleEl = document.getElementById('pip-project-title');
                titleEl.onclick = renamePipTarget;
                badgeEl = document.getElementById('pip-task-progress');
                listEl = document.getElementById('pip-task-list');
            }

            if (!listEl) return;

            titleEl.textContent = project.title;
            titleEl.onclick = renamePipTarget;
            badgeEl.textContent = badgeText;
            listEl.innerHTML = '';

            if (!project.tasks || project.tasks.length === 0) {
                listEl.innerHTML = `<div style="text-align:center; opacity:0.6; padding:20px; font-size:0.85rem;">Henüz görev yok. Aşağıdan ekleyebilirsiniz.</div>`;
                return;
            }

            const totalPipTasks = project.tasks.length;

            project.tasks.forEach((task, index) => {
                const card = targetDoc.createElement('div');
                card.className = 'pip-task-card';

                const subCount = task.subtasks ? task.subtasks.length : 0;
                const subDone = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
                
                const drawerKey = `${project.id}-${task.id || index}`;
                // Alt görevler varsa veya kullanıcı açtıysa açık tut
                const isExpanded = pipDrawerOpenMap.has(drawerKey) 
                    ? pipDrawerOpenMap.get(drawerKey) 
                    : (pipDrawerOpenMap.has(`${project.id}-${index}`) ? pipDrawerOpenMap.get(`${project.id}-${index}`) : (subCount > 0));

                let subItemsHtml = '';
                if (subCount > 0) {
                    task.subtasks.forEach((st, sIdx) => {
                        subItemsHtml += `
                            <div class="pip-subtask-item">
                                <div class="task-move-btns">
                                    <button class="btn-move" data-submove="up" data-t="${index}" data-s="${sIdx}" ${sIdx === 0 ? 'disabled' : ''} title="Yukarı Taşı">
                                        <svg style="width:8px;height:8px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m18 15-6-6-6 6"/></svg>
                                    </button>
                                    <button class="btn-move" data-submove="down" data-t="${index}" data-s="${sIdx}" ${sIdx === task.subtasks.length - 1 ? 'disabled' : ''} title="Aşağı Taşı">
                                        <svg style="width:8px;height:8px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m6 9 6 6 6-6"/></svg>
                                    </button>
                                </div>
                                <input type="checkbox" class="pip-subtask-checkbox" ${st.completed ? 'checked' : ''} data-tidx="${index}" data-sidx="${sIdx}">
                                <span class="pip-subtask-text ${st.completed ? 'completed' : ''}" data-hl-target="true" data-hl-type="subtask" data-hl-task-idx="${index}" data-hl-sub-idx="${sIdx}" title="Çift tıklayarak düzenleyin">${st.text}</span>
                                <button class="btn-task-action edit" data-subedit="${index}" data-s="${sIdx}" style="padding:2px;" title="Alt Görevi Düzenle">
                                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                                <button class="btn-task-action del" data-subdel="${index}" data-s="${sIdx}" style="padding:2px;" title="Alt Görevi Sil">
                                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                                </button>
                            </div>
                        `;
                    });
                }

                const subDrawerHtml = `
                    <div class="pip-subtasks-drawer ${isExpanded ? 'expanded' : ''}" id="pip-drawer-${index}">
                        ${subItemsHtml}
                        <div class="pip-subtask-add-row">
                            <input type="text" class="pip-subtask-input" placeholder="+ Alt görev ekle (Enter)..." data-task-idx="${index}">
                            <button class="pip-subtask-add-btn" data-task-idx="${index}">Ekle</button>
                        </div>
                    </div>
                `;

                card.innerHTML = `
                    <div class="pip-task-main">
                        <div class="task-move-btns">
                            <button class="btn-move" data-move="up" data-t="${index}" ${index === 0 ? 'disabled' : ''} title="Yukarı Taşı">
                                <svg style="width:8px;height:8px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <button class="btn-move" data-move="down" data-t="${index}" ${index === totalPipTasks - 1 ? 'disabled' : ''} title="Aşağı Taşı">
                                <svg style="width:8px;height:8px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                        </div>
                        <input type="checkbox" class="pip-task-checkbox" ${task.completed ? 'checked' : ''} data-tidx="${index}">
                        ${task.emoji ? renderTaskIcon(task.emoji) : ''}
                        <span class="pip-task-text ${task.completed ? 'completed' : ''}" data-hl-target="true" data-hl-type="task" data-hl-task-idx="${index}" title="Çift tıklayarak düzenleyin">${task.text}</span>
                        
                        <button class="btn-task-action" data-pip-add-sub="${index}" style="padding:3px;" title="Alt Görev Ekle">
                            <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                        <button class="btn-task-action edit" data-edit="${index}" style="padding:3px;" title="Görevi Düzenle">
                            <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button class="btn-task-action del" data-del="${index}" style="padding:3px;" title="Görevi Sil">
                            <svg style="width:12px;height:12px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                        </button>
                        ${subCount > 0 ? `<span class="pip-sub-counter" data-toggle="${index}" title="Genişlet / Daralt">${isExpanded ? '▾' : '▸'} ${subDone}/${subCount} alt</span>` : ''}
                    </div>
                    ${subDrawerHtml}
                `;

                // Checkbox olayları
                card.querySelectorAll('input.pip-task-checkbox').forEach(chk => {
                    chk.onchange = (e) => {
                        const t = parseInt(e.target.dataset.tidx);
                        toggleTask(t, chk);
                    };
                });
                card.querySelectorAll('input.pip-subtask-checkbox').forEach(chk => {
                    chk.onchange = (e) => {
                        const t = parseInt(e.target.dataset.tidx);
                        const s = parseInt(e.target.dataset.sidx);
                        toggleSubtask(t, s, chk);
                    };
                });

                // Taşıma butonları
                card.querySelectorAll('[data-move]').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        const t = parseInt(btn.dataset.t);
                        moveTask(t, btn.dataset.move === 'up' ? t - 1 : t + 1, btn);
                    };
                });
                card.querySelectorAll('[data-submove]').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        const t = parseInt(btn.dataset.t);
                        const s = parseInt(btn.dataset.s);
                        moveSubtask(t, s, btn.dataset.submove === 'up' ? s - 1 : s + 1, btn);
                    };
                });

                // Düzenleme butonları
                const editBtn = card.querySelector('[data-edit]');
                if (editBtn) editBtn.onclick = (e) => { e.stopPropagation(); startInlineEdit(index, null, editBtn); };
                card.querySelectorAll('[data-subedit]').forEach(sBtn => {
                    sBtn.onclick = (e) => { e.stopPropagation(); startInlineEdit(index, parseInt(sBtn.dataset.s), sBtn); };
                });

                // Silme butonları
                const delBtn = card.querySelector('[data-del]');
                if (delBtn) delBtn.onclick = (e) => { e.stopPropagation(); deleteTask(index, delBtn); };
                card.querySelectorAll('[data-subdel]').forEach(sdBtn => {
                    sdBtn.onclick = (e) => { e.stopPropagation(); deleteSubtask(index, parseInt(sdBtn.dataset.s), sdBtn); };
                });

                // Çift tıklama ile düzenleme
                const pText = card.querySelector('.pip-task-text');
                if (pText) pText.ondblclick = () => startInlineEdit(index, null, pText);
                card.querySelectorAll('.pip-subtask-text').forEach((stText, sIdx) => {
                    stText.ondblclick = () => startInlineEdit(index, sIdx, stText);
                });

                // Alt Görev Çekmecesini Aç/Kapat
                const counterBtn = card.querySelector('[data-toggle]');
                if (counterBtn) {
                    counterBtn.onclick = (e) => {
                        e.stopPropagation();
                        const key = `${project.id}-${task.id || index}`;
                        const currentlyOpen = pipDrawerOpenMap.has(key) 
                            ? pipDrawerOpenMap.get(key) 
                            : (pipDrawerOpenMap.has(`${project.id}-${index}`) ? pipDrawerOpenMap.get(`${project.id}-${index}`) : (subCount > 0));
                        const nextState = !currentlyOpen;
                        pipDrawerOpenMap.set(key, nextState);
                        pipDrawerOpenMap.set(`${project.id}-${index}`, nextState);
                        
                        const drawer = card.querySelector('.pip-subtasks-drawer');
                        if (drawer) {
                            drawer.classList.toggle('expanded', nextState);
                        }
                        counterBtn.innerHTML = `${nextState ? '▾' : '▸'} ${subDone}/${subCount} alt`;
                    };
                }

                // Alt Görev Ekle Butonuna Basınca Çekmeceyi Aç ve Odaklan
                const addSubBtn = card.querySelector('[data-pip-add-sub]');
                if (addSubBtn) {
                    addSubBtn.onclick = (e) => {
                        e.stopPropagation();
                        const key = `${project.id}-${task.id || index}`;
                        pipDrawerOpenMap.set(key, true);
                        pipDrawerOpenMap.set(`${project.id}-${index}`, true);
                        renderPipContent();
                        setTimeout(() => {
                            const inp = targetDoc.querySelector(`.pip-subtask-input[data-task-idx="${index}"]`);
                            if (inp) inp.focus();
                        }, 50);
                    };
                }

                // Çekmece içi Alt Görev Inputu ve Butonu
                const subInput = card.querySelector(`.pip-subtask-input[data-task-idx="${index}"]`);
                const subAddBtn = card.querySelector(`.pip-subtask-add-btn[data-task-idx="${index}"]`);
                if (subInput && subAddBtn) {
                    const doAdd = () => {
                        const val = subInput.value.trim();
                        if (val) {
                            addSubtask(index, val, subInput);
                            subInput.value = '';
                            setTimeout(() => {
                                const nextInp = targetDoc.querySelector(`.pip-subtask-input[data-task-idx="${index}"]`);
                                if (nextInp) nextInp.focus();
                            }, 50);
                        }
                    };
                    subAddBtn.onclick = (e) => { e.stopPropagation(); doAdd(); };
                    subInput.onkeydown = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            doAdd();
                        }
                    };
                }

                listEl.appendChild(card);
            });
        }

        function addPipTaskFromVal(val) {
            const projId = currentPipProjectId || (currentPipTarget && currentPipTarget.type === 'project' ? currentPipTarget.id : null);
            if (!val || !val.trim() || !projId) return;
            const project = projects.find(p => p.id === projId);
            if (project) {
                recordState();
                if (!project.tasks) project.tasks = [];
                project.tasks.push({ id: Date.now(), text: val.trim(), completed: false, subtasks: [] });
                project.updatedAt = getFormattedDate();
                saveProjects();
                renderPipContent();
                renderProjects();
            }
        }

        function addPipTask() {
            const inp = document.getElementById('pip-new-task-input');
            const projId = currentPipProjectId || (currentPipTarget && currentPipTarget.type === 'project' ? currentPipTarget.id : null);
            if (inp && inp.value.trim() && projId) {
                addPipTaskFromVal(inp.value.trim());
                inp.value = '';
            }
        }

        // Sayfa İçi PiP Drag
        (function initDrag() {
            const header = document.getElementById('pip-drag-header');
            const widget = document.getElementById('floating-pip-widget');
            header.addEventListener('mousedown', function(e) {
                if (e.target.closest('button') || e.target.closest('label') || e.target.closest('.pip-title')) return;
                isPipDragging = true;
                widget.classList.add('pip-dragging');
                pipStartX = e.clientX;
                pipStartY = e.clientY;
                const rect = widget.getBoundingClientRect();
                pipStartLeft = rect.left;
                pipStartTop = rect.top;
                widget.style.bottom = 'auto';
                widget.style.right = 'auto';
                widget.style.left = pipStartLeft + 'px';
                widget.style.top = pipStartTop + 'px';

                function onMove(ev) {
                    if (!isPipDragging) return;
                    widget.style.left = (pipStartLeft + ev.clientX - pipStartX) + 'px';
                    widget.style.top = (pipStartTop + ev.clientY - pipStartY) + 'px';
                }
                function onUp() {
                    isPipDragging = false;
                    widget.classList.remove('pip-dragging');
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        })();
