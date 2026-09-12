/* ===== MİMZ OFİS - PROJELER & GÖREVLER MOTORU ===== */
        function initProjects() {
            const saved = localStorage.getItem('mimzProjects');
            if (saved) {
                try { projects = JSON.parse(saved); } catch (e) { projects = []; }
            }
            if (!projects || projects.length === 0) {
                projects = [
                    {
                        id: Date.now(),
                        title: "Örnek Ruhsat / İmar Föyü",
                        folder: "Ana Ekran",
                        color: '#85b88f',
                        isArchived: false,
                        isPinned: false,
                        createdAt: getFormattedDate(),
                        tasks: [
                            { id: 1, text: "KAT PLANLARINA SIVALAR", completed: false, subtasks: [{ id: 11, text: "1. Kat", completed: false }, { id: 12, text: "Zemin Kat", completed: false }, { id: 13, text: "Bodrum", completed: false }] },
                            { id: 2, text: "KESİT AKSLARI EKLENECEK", completed: false, subtasks: [] },
                            { id: 3, text: "KESİT ÖLÇÜLER", completed: false, subtasks: [{ id: 31, text: "A-A Kesiti", completed: false }, { id: 32, text: "B-B Kesiti", completed: false }] },
                            { id: 4, text: "YANGIN TAHLİYE PLANLARI", completed: false, subtasks: [] },
                            { id: 5, text: "ŞEMATİK KESİTLER", completed: false, subtasks: [] }
                        ]
                    }
                ];
                saveProjects();
            }
            renderProjects();
        }


        function renderProjects() {
            const container = document.getElementById('projects-container');
            const breadcrumb = document.getElementById('breadcrumb-container');
            container.innerHTML = '';
            let activeProjects = projects.filter(p => {
                const projCategory = p.category || 'genel';
                const categoryMatch = appMode === 'ofis' ? projCategory === 'ofis' : projCategory !== 'ofis';
                const statusMatch = currentTab === 'active' ? !p.isArchived : p.isArchived;
                return categoryMatch && statusMatch;
            });
            
            if (currentViewFolder) {
                breadcrumb.innerHTML = `
                    <button class="btn-back" onclick="goHome()">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                        Ana Ekran
                    </button>
                    <span>/</span>
                    <span style="color: var(--primary-accent);">${currentViewFolder}</span>
                `;
            } else {
                breadcrumb.innerHTML = `
                    <span style="display:flex; align-items:center; gap:6px;">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        Ana Ekran
                    </span>
                `;
            }

            const itemsToRender = currentViewFolder 
                ? activeProjects.filter(p => (p.folder || '').trim() === currentViewFolder)
                : activeProjects.filter(p => { let f = (p.folder || '').trim(); return f === '' || f === 'Ana Ekran'; });

            itemsToRender.sort((a, b) => (a.isPinned !== b.isPinned ? (a.isPinned ? -1 : 1) : b.id - a.id));

            itemsToRender.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card glitter-frame';
                if (project.color) {
                    card.style.backgroundColor = project.color;
                    const contrastText = getContrastColor(project.color);
                    if (contrastText) card.style.color = contrastText;
                }

                card.onclick = (e) => {
                    if (!e.target.closest('button')) {
                        triggerSparkleBurst(e.clientX, e.clientY, 36, { burstSpeed: 5.2 });
                        openModal(project.id);
                    }
                };

                let previewHtml = '';
                if (project.tasks && project.tasks.length > 0) {
                    let total = 0, done = 0;
                    project.tasks.forEach(t => {
                        total++; if (t.completed) done++;
                        if (t.subtasks) t.subtasks.forEach(st => { total++; if (st.completed) done++; });
                    });
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    previewHtml = `<div style="margin-bottom: 8px; font-weight:700; font-size:0.85rem; background:rgba(0,0,0,0.15); padding:3px 8px; border-radius:6px; display:inline-block;">İlerleme: %${pct} (${done}/${total})</div>`;
                }

                card.innerHTML = `
                    <div class="card-top-actions">
                        <button class="card-menu-btn" onclick="toggleCardMenu('project', ${project.id}, this, event)" title="Klasöre Taşı / Arşivle / Sil">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                        <button class="card-pip-btn" onclick="openFloatingPip(${project.id}, event)" title="Tüm Uygulamaların Üstünde Tut (Masaüstü PiP)">
                            <svg class="icon-svg" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><rect x="11" y="9" width="9" height="7" rx="1" ry="1" fill="currentColor"></rect></svg>
                        </button>
                    </div>
                    <div class="project-title">${project.title}${project.isPinned ? ' 📌' : ''}</div>
                    <div class="project-folder-badge" onclick="event.stopPropagation(); openFolderOrHome('${(project.folder || 'Ana Ekran').replace(/'/g, "\\'")}')" style="cursor:pointer;" title="Bu klasörü aç">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        ${project.folder || 'Ana Ekran'}
                    </div>
                    <div class="project-preview">${previewHtml}</div>
                    <div class="project-card-date">${project.createdAt ? ('Oluşturma: ' + project.createdAt) : ''}${project.updatedAt ? (project.createdAt ? ' · Güncelleme: ' : 'Güncelleme: ') + project.updatedAt : ''}</div>
                `;
                container.appendChild(card);
            });

            if (currentPipProjectId) renderPipContent();
        }

        function createNewProject(type, category = 'genel') {
            const title = prompt("Proje Adı:", category === 'ofis' ? "Yeni Genel Görev / To-Do" : "Yeni Proje / Görev");
            if (!title) return;
            recordState();
            const newProj = {
                id: Date.now(),
                title: title,
                folder: currentViewFolder || "Ana Ekran",
                color: category === 'ofis' ? '#f2c14e' : '#85b88f',
                isArchived: false,
                isPinned: false,
                category: category,
                createdAt: getFormattedDate(),
                tasks: type === 'blank' ? [] : [
                    { id: 1, text: "KAT PLANLARINA SIVALAR", completed: false, subtasks: [{ id: 11, text: "1. Kat", completed: false }, { id: 12, text: "Zemin Kat", completed: false }, { id: 13, text: "Bodrum", completed: false }] },
                    { id: 2, text: "KESİT AKSLARI EKLENECEK", completed: false, subtasks: [] },
                    { id: 3, text: "KESİT ÖLÇÜLER", completed: false, subtasks: [{ id: 31, text: "A-A Kesiti", completed: false }, { id: 32, text: "B-B Kesiti", completed: false }] },
                    { id: 4, text: "YANGIN TAHLİYE PLANLARI", completed: false, subtasks: [] },
                    { id: 5, text: "ŞEMATİK KESİTLER", completed: false, subtasks: [] }
                ]
            };
            projects.unshift(newProj);
            saveProjects();
            renderProjects();
        }

        function openModal(projectId) {
            currentEditingProjectId = projectId;
            const project = projects.find(p => p.id === projectId);
            if (!project) return;
            document.getElementById('modal-title').value = project.title;
            document.getElementById('modal-folder').value = project.folder || '';
            const modalContent = document.getElementById('modal-content');
            if (project.color) {
                modalContent.style.backgroundColor = project.color;
                modalContent.style.color = getContrastColor(project.color);
            } else {
                modalContent.style.removeProperty('background-color');
                modalContent.style.removeProperty('color');
            }
            document.getElementById('modal-overlay').style.display = 'flex';
            renderTasks();
        }

        function closeModal(event) {
            if (event.target === document.getElementById('modal-overlay')) saveAndCloseModal();
        }

        function saveAndCloseModal() {
            if (currentEditingProjectId) {
                const project = projects.find(p => p.id === currentEditingProjectId);
                if (project) {
                    const newT = document.getElementById('modal-title').value.trim() || "İsimsiz Proje";
                    const newF = document.getElementById('modal-folder').value.trim() || 'Ana Ekran';
                    if (project.title !== newT || project.folder !== newF) {
                        recordState();
                        project.title = newT;
                        project.folder = newF;
                        saveProjects();
                        renderProjects();
                    }
                }
            }
            document.getElementById('modal-overlay').style.display = 'none';
            currentEditingProjectId = null;
        }

        function resetProjectColor() { applyProjectColor('#85b88f'); }

        /* GÖREV VE ALT GÖREV SIRALAMA / TAŞIMA */
        function moveTask(fromIdx, toIdx, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks) return;
            if (toIdx < 0 || toIdx >= project.tasks.length) return;
            
            recordState();
            const item = project.tasks.splice(fromIdx, 1)[0];
            project.tasks.splice(toIdx, 0, item);
            project.updatedAt = getFormattedDate();
            saveProjects();
            refreshAllViews();
        }

        function moveSubtask(tIdx, fromSIdx, toSIdx, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks[tIdx] || !project.tasks[tIdx].subtasks) return;
            if (toSIdx < 0 || toSIdx >= project.tasks[tIdx].subtasks.length) return;

            recordState();
            const item = project.tasks[tIdx].subtasks.splice(fromSIdx, 1)[0];
            project.tasks[tIdx].subtasks.splice(toSIdx, 0, item);
            project.updatedAt = getFormattedDate();
            saveProjects();
            refreshAllViews();
        }

        function sortTasks(type, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks || project.tasks.length === 0) return;

            recordState();
            if (type === 'az') {
                project.tasks.sort((a, b) => (a.text || '').replace(/<[^>]*>/g, '').trim().localeCompare((b.text || '').replace(/<[^>]*>/g, '').trim(), 'tr'));
            } else if (type === 'za') {
                project.tasks.sort((a, b) => (b.text || '').replace(/<[^>]*>/g, '').trim().localeCompare((a.text || '').replace(/<[^>]*>/g, '').trim(), 'tr'));
            } else if (type === 'completed') {
                project.tasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
            } else if (type === 'reverse') {
                project.tasks.reverse();
            }

            project.updatedAt = getFormattedDate();
            saveProjects();
            refreshAllViews();
            showToast("Görevler sıralandı.");
        }

        function deleteTask(taskIdx, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks) return;
            recordState();
            project.tasks.splice(taskIdx, 1);
            project.updatedAt = getFormattedDate();
            saveProjects();
            refreshAllViews();
            showToast("Görev silindi. (Geri almak için Ctrl+Z)", "delete");
        }

        function deleteSubtask(taskIdx, subIdx, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks[taskIdx] || !project.tasks[taskIdx].subtasks) return;
            recordState();
            project.tasks[taskIdx].subtasks.splice(subIdx, 1);
            if (project.tasks[taskIdx].subtasks.length > 0) {
                project.tasks[taskIdx].completed = project.tasks[taskIdx].subtasks.every(s => s.completed);
            }
            project.updatedAt = getFormattedDate();
            saveProjects();
            refreshAllViews();
            showToast("Alt görev silindi. (Geri almak için Ctrl+Z)", "delete");
        }

        /* ALT GÖREV EKLEME MOTORU */
        function addSubtask(taskIndex, text, contextEl) {
            const project = getActiveProject(contextEl);
            if (!project || !project.tasks || !project.tasks[taskIndex]) return;
            const cleanText = (text || '').trim();
            if (!cleanText) return;

            recordState();
            if (!project.tasks[taskIndex].subtasks) {
                project.tasks[taskIndex].subtasks = [];
            }
            project.tasks[taskIndex].subtasks.push({
                id: Date.now(),
                text: cleanText,
                completed: false
            });
            project.tasks[taskIndex].completed = false; // yeni eklenen tamamlanmamış alt görev görevi açar
            project.updatedAt = getFormattedDate();
            saveProjects();

            // Eklenen görevin çekmecesini açık tut
            pipDrawerOpenMap.set(`${project.id}-${taskIndex}`, true);
            modalSubtaskAdderOpen.add(taskIndex);

            refreshAllViews();
            showToast("Alt görev eklendi.");
        }

        function openModalSubtaskAdder(index) {
            modalSubtaskAdderOpen.add(index);
            renderTasks();
            setTimeout(() => {
                const inp = document.getElementById(`modal-sub-input-${index}`);
                if (inp) inp.focus();
            }, 50);
        }

        // Ana ekrandaki to-do'larda alt görevleri gizle/göster
        function toggleModalSubtaskDrawer(index, btnEl) {
            const project = getActiveProject(btnEl);
            if (!project) return;
            const key = `${project.id}-${index}`;
            const currentlyOpen = pipDrawerOpenMap.has(key) ? pipDrawerOpenMap.get(key) : true;
            pipDrawerOpenMap.set(key, !currentlyOpen);
            renderTasks();
        }

        function handleAddSubtask(index, inputEl) {
            if (!inputEl || !inputEl.value.trim()) return;
            const text = inputEl.value.trim();
            addSubtask(index, text, inputEl);
            inputEl.value = '';
            setTimeout(() => {
                const nextInp = document.getElementById(`modal-sub-input-${index}`);
                if (nextInp) nextInp.focus();
            }, 50);
        }

        /* INLINE DÜZENLEME MOTORU (GÖREV & ALT GÖREV) */
        function startInlineEdit(taskIndex, subIndex = null, triggerEl) {
            let row = triggerEl.closest('.task-main-row') || triggerEl.closest('.subtask-item') || triggerEl.closest('.pip-task-main') || triggerEl.closest('.pip-subtask-item');
            if (!row) return;

            let textEl = row.querySelector('[data-hl-target="true"]');
            if (!textEl || textEl.isContentEditable) return;

            const originalHTML = textEl.innerHTML;
            textEl.contentEditable = "true";
            textEl.focus();

            const doc = triggerEl.ownerDocument || document;
            const win = doc.defaultView || window;
            const range = doc.createRange();
            range.selectNodeContents(textEl);
            const sel = win.getSelection ? win.getSelection() : null;
            if (sel) {
                try {
                    sel.removeAllRanges();
                    sel.addRange(range);
                } catch (e) {}
            }

            let isSaved = false;
            const saveChanges = () => {
                if (isSaved) return;
                isSaved = true;
                textEl.contentEditable = "false";
                textEl.onkeydown = null;
                textEl.onblur = null;

                const newHTML = textEl.innerHTML.trim();
                const plainText = textEl.textContent.trim();

                if (!plainText) {
                    textEl.innerHTML = originalHTML;
                    refreshAllViews();
                    return;
                }

                if (newHTML !== originalHTML) {
                    recordState();
                    const project = getActiveProject(triggerEl);
                    if (project && project.tasks && project.tasks[taskIndex]) {
                        if (subIndex !== null && project.tasks[taskIndex].subtasks && project.tasks[taskIndex].subtasks[subIndex]) {
                            project.tasks[taskIndex].subtasks[subIndex].text = newHTML;
                        } else {
                            project.tasks[taskIndex].text = newHTML;
                        }
                        project.updatedAt = getFormattedDate();
                        saveProjects();
                        showToast("Düzenleme kaydedildi.");
                    }
                }

                // Alt görev düzenlendiyse çekmecenin açık kalmasını sağla
                if (subIndex !== null) {
                    const project = getActiveProject(triggerEl);
                    if (project) pipDrawerOpenMap.set(`${project.id}-${taskIndex}`, true);
                }

                refreshAllViews();
            };

            textEl.onkeydown = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
                else if (e.key === 'Escape') { 
                    e.preventDefault(); 
                    isSaved = true; 
                    textEl.contentEditable = "false"; 
                    textEl.innerHTML = originalHTML; 
                    refreshAllViews(); 
                }
            };
            textEl.onblur = saveChanges;
        }

        /* MODAL GÖREV LİSTESİ ÇİZİMİ */
        function renderTasks() {
            const project = projects.find(p => p.id === currentEditingProjectId);
            const container = document.getElementById('modal-tasks-container');
            container.innerHTML = '';
            if (!project || !project.tasks) return;

            const totalTasks = project.tasks.length;

            project.tasks.forEach((task, index) => {
                const el = document.createElement('div');
                el.className = 'task-item glitter-frame';
                el.dataset.index = index;

                el.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; el.classList.add('drag-over'); };
                el.ondragleave = () => { el.classList.remove('drag-over'); };
                el.ondrop = (e) => {
                    e.preventDefault();
                    el.classList.remove('drag-over');
                    if (dragSourceTaskIndex !== null && dragSourceTaskIndex !== index) {
                        moveTask(dragSourceTaskIndex, index, el);
                    }
                    dragSourceTaskIndex = null;
                };

                const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                const isAdderOpen = modalSubtaskAdderOpen.has(index);
                const subCount = hasSubtasks ? task.subtasks.length : 0;
                const subDone = hasSubtasks ? task.subtasks.filter(s => s.completed).length : 0;
                const drawerKey = `${project.id}-${index}`;
                // Alt görevler kullanıcı tarafından gizlenmediyse (veya daha önce hiç dokunulmadıysa) açık başlar
                const isDrawerOpenStored = pipDrawerOpenMap.has(drawerKey) ? pipDrawerOpenMap.get(drawerKey) : true;
                const isExpanded = isAdderOpen ? true : isDrawerOpenStored;

                let subHtml = '';
                if (hasSubtasks || isAdderOpen) {
                    subHtml = `<div class="subtasks-container ${isExpanded ? 'expanded' : ''}">`;
                    if (hasSubtasks) {
                        task.subtasks.forEach((st, sIdx) => {
                            subHtml += `
                                <div class="subtask-item">
                                    <div class="task-move-btns">
                                        <button class="btn-move" onclick="moveSubtask(${index}, ${sIdx}, ${sIdx - 1}, this)" title="Yukarı Taşı" ${sIdx === 0 ? 'disabled' : ''}>
                                            <svg style="width:9px;height:9px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m18 15-6-6-6 6"/></svg>
                                        </button>
                                        <button class="btn-move" onclick="moveSubtask(${index}, ${sIdx}, ${sIdx + 1}, this)" title="Aşağı Taşı" ${sIdx === task.subtasks.length - 1 ? 'disabled' : ''}>
                                            <svg style="width:9px;height:9px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m6 9 6 6 6-6"/></svg>
                                        </button>
                                    </div>
                                    <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtask(${index}, ${sIdx}, this)">
                                    <span class="${st.completed ? 'completed-text' : ''}" data-hl-target="true" data-hl-type="subtask" data-hl-task-idx="${index}" data-hl-sub-idx="${sIdx}" ondblclick="startInlineEdit(${index}, ${sIdx}, this)" title="Çift tıklayarak düzenleyebilirsiniz">${st.text}</span>
                                    
                                    <button class="btn-task-action edit" onclick="startInlineEdit(${index}, ${sIdx}, this)" title="Alt Görevi Düzenle">
                                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                    <button class="btn-task-action del" onclick="deleteSubtask(${index}, ${sIdx}, this)" title="Alt Görevi Sil">
                                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                                    </button>
                                </div>
                            `;
                        });
                    }
                    subHtml += `
                        <div class="modal-subtask-add-row">
                            <input type="text" class="modal-subtask-input" id="modal-sub-input-${index}" placeholder="Yeni alt görev yaz ve Enter'a bas..." onkeydown="if(event.key==='Enter') { event.preventDefault(); handleAddSubtask(${index}, this); }">
                            <button class="btn-subtask-submit" onclick="handleAddSubtask(${index}, this.previousElementSibling)">+ Ekle</button>
                        </div>
                    </div>`;
                }

                el.innerHTML = `
                    <div class="task-main-row">
                        <span class="task-drag-handle" title="Sıralamak için basılı tutup sürükleyin">
                            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="9" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/>
                                <circle cx="9" cy="12" r="1.8"/><circle cx="15" cy="12" r="1.8"/>
                                <circle cx="9" cy="18" r="1.8"/><circle cx="15" cy="18" r="1.8"/>
                            </svg>
                        </span>
                        <div class="task-move-btns">
                            <button class="btn-move" onclick="moveTask(${index}, ${index - 1}, this)" title="Yukarı Taşı" ${index === 0 ? 'disabled' : ''}>
                                <svg style="width:9px;height:9px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <button class="btn-move" onclick="moveTask(${index}, ${index + 1}, this)" title="Aşağı Taşı" ${index === totalTasks - 1 ? 'disabled' : ''}>
                                <svg style="width:9px;height:9px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                        </div>
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index}, this)">
                        ${task.emoji ? `<span class="task-emoji-tag" title="Görev Emojisi">${task.emoji}</span>` : ''}
                        <div class="task-content">
                            <span class="task-text ${task.completed ? 'completed' : ''}" data-hl-target="true" data-hl-type="task" data-hl-task-idx="${index}" ondblclick="startInlineEdit(${index}, null, this)" title="Çift tıklayarak düzenleyebilirsiniz">${task.text}</span>
                        </div>
                        
                        <button class="btn-task-action emoji btn-task-emoji" onclick="toggleEmojiPicker(${index}, this, event)" title="Göreve Emoji Ekle / Değiştir">
                            ${task.emoji ? task.emoji : `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="0.9" fill="currentColor" stroke="none"/></svg>`}
                        </button>
                        <button class="btn-task-action add-sub" onclick="openModalSubtaskAdder(${index})" title="Bu maddeye alt görev ekle">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                            <span>+ Alt Görev</span>
                        </button>
                        ${hasSubtasks ? `
                        <button class="btn-task-action sub-toggle" onclick="toggleModalSubtaskDrawer(${index}, this)" title="Alt Görevleri Gizle / Göster">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24" style="transform: rotate(${isExpanded ? '0' : '-90'}deg);"><path d="m6 9 6 6 6-6"/></svg>
                            <span>${subDone}/${subCount}</span>
                        </button>` : ''}
                        <button class="btn-task-action edit" onclick="startInlineEdit(${index}, null, this)" title="Görevi Düzenle">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button class="btn-task-action del" onclick="deleteTask(${index}, this)" title="Maddeyi Sil">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                        </button>
                    </div>
                    ${subHtml}
                `;

                const dragHandle = el.querySelector('.task-drag-handle');
                dragHandle.onmousedown = () => { el.draggable = true; };
                dragHandle.onmouseup = () => { el.draggable = false; };

                el.ondragstart = (e) => {
                    dragSourceTaskIndex = index;
                    el.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', index);
                };
                el.ondragend = () => {
                    el.draggable = false;
                    el.classList.remove('dragging');
                    document.querySelectorAll('.task-item').forEach(i => i.classList.remove('drag-over'));
                };

                container.appendChild(el);
            });
        }

        /* ===== GÖREV EMOJİSİ SEÇİCİ ===== */
        const taskEmojiOptions = ['♡','☆','◇','♧','♤','😀','😁','😂','🙂','😉','😍','😎','🤔','😴','😢','😡','🤯','👍','👎','👏','🙏','🔥','⭐','✅','❌','⚠️','📌','💡','🎯','🏗️','📐','🧱','🏠','📅','⏰','💰','📞'];
        let emojiPickerTargetIndex = null;
        let emojiPickerContextEl = null;

        function buildEmojiPicker() {
            if (document.getElementById('emoji-picker-popover')) return;
            const el = document.createElement('div');
            el.id = 'emoji-picker-popover';
            el.className = 'emoji-picker-popover';
            taskEmojiOptions.forEach(em => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'emoji-pick-btn';
                btn.textContent = em;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    pickTaskEmoji(emojiPickerTargetIndex, em, emojiPickerContextEl);
                    closeEmojiPicker();
                };
                el.appendChild(btn);
            });
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'emoji-pick-clear';
            clearBtn.textContent = 'Emojiyi Kaldır';
            clearBtn.onclick = (e) => {
                e.stopPropagation();
                pickTaskEmoji(emojiPickerTargetIndex, '', emojiPickerContextEl);
                closeEmojiPicker();
            };
            el.appendChild(clearBtn);
            el.addEventListener('mousedown', e => e.stopPropagation());
            document.body.appendChild(el);
        }

        function toggleEmojiPicker(index, btnEl, event) {
            if (event) event.stopPropagation();
            buildEmojiPicker();
            const popover = document.getElementById('emoji-picker-popover');
            if (popover.classList.contains('show') && emojiPickerTargetIndex === index && emojiPickerContextEl === btnEl) {
                closeEmojiPicker();
                return;
            }
            emojiPickerTargetIndex = index;
            emojiPickerContextEl = btnEl;
            const rect = btnEl.getBoundingClientRect();
            popover.classList.add('show');
            popover.style.visibility = 'hidden';
            const pw = popover.offsetWidth || 264;
            const ph = popover.offsetHeight || 150;
            let top = rect.bottom + 6;
            let left = rect.left;
            if (top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
            if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
            if (left < 10) left = 10;
            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
            popover.style.visibility = 'visible';
        }

        function closeEmojiPicker() {
            const popover = document.getElementById('emoji-picker-popover');
            if (popover) popover.classList.remove('show');
            emojiPickerTargetIndex = null;
            emojiPickerContextEl = null;
        }

        window.addEventListener('mousedown', (e) => {
            const popover = document.getElementById('emoji-picker-popover');
            if (popover && popover.classList.contains('show') && !e.target.closest('#emoji-picker-popover') && !e.target.closest('.btn-task-emoji')) {
                closeEmojiPicker();
            }
        });

        function pickTaskEmoji(index, emoji, contextEl) {
            const project = getActiveProject(contextEl);
            if (project && project.tasks && project.tasks[index]) {
                recordState();
                project.tasks[index].emoji = emoji;
                project.updatedAt = getFormattedDate();
                saveProjects();
                refreshAllViews();
            }
        }

        function toggleTask(index, contextEl) {
            const project = getActiveProject(contextEl);
            if (project && project.tasks && project.tasks[index]) {
                recordState();
                const val = !project.tasks[index].completed;
                project.tasks[index].completed = val;
                if (project.tasks[index].subtasks) {
                    project.tasks[index].subtasks.forEach(s => s.completed = val);
                }
                project.updatedAt = getFormattedDate();
                saveProjects();
                refreshAllViews();
            }
        }

        function toggleSubtask(tIdx, sIdx, contextEl) {
            const project = getActiveProject(contextEl);
            if (project && project.tasks && project.tasks[tIdx] && project.tasks[tIdx].subtasks && project.tasks[tIdx].subtasks[sIdx]) {
                recordState();
                const sub = project.tasks[tIdx].subtasks[sIdx];
                sub.completed = !sub.completed;
                project.tasks[tIdx].completed = project.tasks[tIdx].subtasks.every(s => s.completed);
                project.updatedAt = getFormattedDate();
                saveProjects();
                refreshAllViews();
            }
        }

        function addNewTask() {
            const input = document.getElementById('new-task-input');
            if (!input.value.trim()) return;
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (project) {
                recordState();
                if (!project.tasks) project.tasks = [];
                project.tasks.push({ id: Date.now(), text: input.value.trim(), completed: false, subtasks: [] });
                project.updatedAt = getFormattedDate();
                saveProjects();
                input.value = '';
                renderTasks();
                renderProjects();
            }
        }

        function toggleColorPicker() { document.getElementById('color-picker-wrapper').classList.toggle('active'); }

        function buildColorPicker() {
            const picker = document.getElementById('color-picker');
            picker.innerHTML = '';
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
                    applyProjectColor(col);
                    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                };
                picker.appendChild(dot);
            });
        }

        function applyProjectColor(color) {
            if (currentPipTarget && currentPipTarget.type === 'note') {
                const note = officeNotes.find(n => n.id === currentPipTarget.id);
                if (note) {
                    recordState();
                    note.color = color;
                    note.updatedAt = getFormattedDate();
                    saveOfficeNotes();

                    const noteBox = document.getElementById('note-modal-box');
                    if (noteBox && currentEditingNoteId === note.id) {
                        noteBox.style.backgroundColor = color;
                        noteBox.style.color = getContrastColor(color);
                    }

                    renderPipContent();
                    renderOfficeNotes();
                }
                return;
            }
            const targetProj = currentEditingProjectId ? projects.find(p => p.id === currentEditingProjectId) : (currentPipProjectId ? projects.find(p => p.id === currentPipProjectId) : (currentPipTarget && currentPipTarget.type === 'project' ? projects.find(p => p.id === currentPipTarget.id) : null));
            if (targetProj) {
                recordState();
                targetProj.color = color;
                targetProj.updatedAt = getFormattedDate();
                saveProjects();
                
                const modalContent = document.getElementById('modal-content');
                if (modalContent && currentEditingProjectId === targetProj.id) {
                    modalContent.style.backgroundColor = color;
                    modalContent.style.color = getContrastColor(color);
                }
                
                renderPipContent();
                renderProjects();
            }
        }

        /* ===== KART 3 NOKTA MENÜSÜ (KLASÖRE TAŞI / ANA EKRAN / ARŞİV / SİL) ===== */
        let cardMenuTargetType = null;
        let cardMenuTargetId = null;

        function getAllKnownFolders() {
            const set = new Set();
            projects.forEach(p => { const f = (p.folder || '').trim(); if (f && f !== 'Ana Ekran') set.add(f); });
            officeNotes.forEach(n => { const f = (n.folder || '').trim(); if (f && f !== 'Ana Ekran') set.add(f); });
            return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
        }

        function buildCardMenuPopover() {
            if (document.getElementById('card-menu-popover')) return;
            const el = document.createElement('div');
            el.id = 'card-menu-popover';
            el.className = 'card-menu-popover';
            el.addEventListener('mousedown', e => e.stopPropagation());
            document.body.appendChild(el);
        }

        function cardMenuOpenPip() {
            const type = cardMenuTargetType;
            const id = cardMenuTargetId;
            closeCardMenu();
            if (!id) return;
            if (type === 'project') openFloatingPip(id);
            else openFloatingPipNote(id);
        }

        function toggleCardMenu(type, id, btnEl, event) {
            if (event) event.stopPropagation();
            buildCardMenuPopover();
            const popover = document.getElementById('card-menu-popover');
            if (popover.classList.contains('show') && cardMenuTargetType === type && cardMenuTargetId === id) {
                closeCardMenu();
                return;
            }
            cardMenuTargetType = type;
            cardMenuTargetId = id;

            const item = type === 'project' ? projects.find(p => p.id === id) : officeNotes.find(n => n.id === id);
            if (!item) return;

            popover.innerHTML = `
                <button class="card-menu-item" onclick="cardMenuOpenPip()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><rect x="11" y="9" width="9" height="7" rx="1" ry="1" fill="currentColor"></rect></svg>
                    Masaüstünde Tut (PiP)
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item" onclick="cardMenuMoveToFolder()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    Klasöre Taşı...
                </button>
                <button class="card-menu-item" onclick="cardMenuMoveHome()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>
                    Ana Ekrana Taşı
                </button>
                <button class="card-menu-item" onclick="cardMenuTogglePin()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/></svg>
                    ${item.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item" onclick="cardMenuToggleArchive()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
                    ${item.isArchived ? 'Arşivden Çıkar' : 'Arşivle'}
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item danger" onclick="cardMenuDelete()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Sil
                </button>
            `;

            const rect = btnEl.getBoundingClientRect();
            popover.classList.add('show');
            popover.style.visibility = 'hidden';
            const pw = popover.offsetWidth || 210;
            const ph = popover.offsetHeight || 200;
            let top = rect.bottom + 6;
            let left = rect.left;
            if (top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
            if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
            if (left < 10) left = 10;
            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
            popover.style.visibility = 'visible';
        }

        function closeCardMenu() {
            const popover = document.getElementById('card-menu-popover');
            if (popover) popover.classList.remove('show');
            cardMenuTargetType = null;
            cardMenuTargetId = null;
        }

        window.addEventListener('mousedown', (e) => {
            const popover = document.getElementById('card-menu-popover');
            if (popover && popover.classList.contains('show') && !e.target.closest('#card-menu-popover') && !e.target.closest('.card-menu-btn') && !e.target.closest('.note-card-menu-btn')) {
                closeCardMenu();
            }
        });

        function cardMenuGetItem() {
            if (!cardMenuTargetType || cardMenuTargetId === null) return null;
            return cardMenuTargetType === 'project' ? projects.find(p => p.id === cardMenuTargetId) : officeNotes.find(n => n.id === cardMenuTargetId);
        }

        function cardMenuSaveAndRefresh() {
            if (cardMenuTargetType === 'project') { saveProjects(); renderProjects(); renderPipContent(); }
            else { saveOfficeNotes(); renderOfficeNotes(); renderPipContent(); }
        }

        function cardMenuMoveToFolder() {
            const item = cardMenuGetItem();
            if (!item) return;
            const known = getAllKnownFolders();
            const hint = known.length ? `\n\nMevcut klasörler: ${known.join(', ')}` : '';
            const current = (item.folder || '').trim();
            const target = prompt('Bu öğeyi hangi klasöre taşımak istersiniz?' + hint, current && current !== 'Ana Ekran' ? current : '');
            if (target === null) { closeCardMenu(); return; }
            const trimmed = target.trim();
            item.folder = trimmed ? trimmed : 'Ana Ekran';
            if (cardMenuTargetType === 'project') item.updatedAt = getFormattedDate();
            else item.updatedAt = getFormattedDate();
            cardMenuSaveAndRefresh();
            closeCardMenu();
            showToast('Klasör güncellendi.');
        }

        function cardMenuMoveHome() {
            const item = cardMenuGetItem();
            if (!item) return;
            item.folder = 'Ana Ekran';
            item.updatedAt = getFormattedDate();
            cardMenuSaveAndRefresh();
            closeCardMenu();
            showToast('Ana ekrana taşındı.');
        }

        function cardMenuTogglePin() {
            const item = cardMenuGetItem();
            if (!item) return;
            item.isPinned = !item.isPinned;
            item.updatedAt = getFormattedDate();
            cardMenuSaveAndRefresh();
            closeCardMenu();
            showToast(item.isPinned ? 'Sabitlendi.' : 'Sabitleme kaldırıldı.');
        }

        function cardMenuToggleArchive() {
            const item = cardMenuGetItem();
            if (!item) return;
            item.isArchived = !item.isArchived;
            item.updatedAt = getFormattedDate();
            cardMenuSaveAndRefresh();
            closeCardMenu();
            showToast(item.isArchived ? 'Arşivlendi.' : 'Arşivden çıkarıldı.');
        }

        function cardMenuDelete() {
            const type = cardMenuTargetType;
            const id = cardMenuTargetId;
            const item = cardMenuGetItem();
            if (!item) return;
            const label = type === 'project' ? (item.title || 'bu proje/to-do') : (item.title || 'bu not');
            if (!confirm(`"${label}" kalıcı olarak silinsin mi?`)) { closeCardMenu(); return; }
            if (type === 'project') {
                projects = projects.filter(p => p.id !== id);
            } else {
                officeNotes = officeNotes.filter(n => n.id !== id);
            }
            closeCardMenu();
            cardMenuSaveAndRefreshForType(type);
            showToast('Silindi.', 'delete');
        }

        function cardMenuSaveAndRefreshForType(type) {
            if (type === 'project') { saveProjects(); renderProjects(); renderPipContent(); }
            else { saveOfficeNotes(); renderOfficeNotes(); renderPipContent(); }
        }
