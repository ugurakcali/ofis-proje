/* ===== MİMZ OFİS - PROJELER & GÖREVLER MOTORU ===== */

/* RUHSAT_DEFAULT_TEMPLATE ve createRuhsatProject, state.js dosyasından yüklenir */
if (typeof RUHSAT_DEFAULT_TEMPLATE === 'undefined' && typeof window !== 'undefined' && window.RUHSAT_DEFAULT_TEMPLATE) {
    var RUHSAT_DEFAULT_TEMPLATE = window.RUHSAT_DEFAULT_TEMPLATE;
}
if (typeof createRuhsatProject === 'undefined' && typeof window !== 'undefined' && window.createRuhsatProject) {
    var createRuhsatProject = window.createRuhsatProject;
}

function initProjects() {
            const saved = localStorage.getItem('mimzProjects');
            if (saved) {
                try { projects = JSON.parse(saved); } catch (e) { projects = []; }
            }

            // Eski bağımsız Ruhsat Föyü (mimari_kontrol_sistemi_v2) varsa içe aktar
            const oldRuhsatStorage = localStorage.getItem('mimari_kontrol_sistemi_v2');
            if (oldRuhsatStorage && !localStorage.getItem('mimari_kontrol_sistemi_v2_migrated')) {
                try {
                    const parsedOld = JSON.parse(oldRuhsatStorage);
                    if (parsedOld && parsedOld.projects) {
                        for (const pKey in parsedOld.projects) {
                            const oldP = parsedOld.projects[pKey];
                            if (oldP && oldP.data) {
                                const migratedProj = createRuhsatProject(oldP.metadata, oldP.data);
                                projects.unshift(migratedProj);
                            }
                        }
                        localStorage.setItem('mimari_kontrol_sistemi_v2_migrated', 'true');
                        saveProjects();
                        if (typeof showToast === 'function') {
                            showToast("Eski Ruhsat Kontrol Listesi verileriniz başarıyla içe aktarıldı!");
                        }
                    }
                } catch (e) { console.error('Ruhsat migration error:', e); }
            }

            // Projeler arasında eski 5 maddelik taslak varsa her birini 131 maddelik föye dönüştür
            let hasUpgraded = false;
            if (projects && projects.length > 0) {
                projects.forEach((p, idx) => {
                    const isOldDummy = p.tasks && p.tasks.length === 5 && p.tasks[0].text === 'KAT PLANLARINA SIVALAR';
                    if (isOldDummy) {
                        projects[idx] = createRuhsatProject(p.metadata);
                        hasUpgraded = true;
                    }
                    if (p.title && (p.title.includes('Ruhsat') || p.title.includes('Föy'))) {
                        p.isRuhsat = true;
                    }
                });
            }
            if (!projects || projects.length === 0) {
                projects = [createRuhsatProject()];
                hasUpgraded = true;
            }
            if (hasUpgraded) {
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
                    <span style="color: var(--primary-accent); font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        ${escapeHtml(currentViewFolder)}
                    </span>
                    <div class="breadcrumb-folder-actions">
                        <button class="btn-breadcrumb-action" onclick="promptRenameFolder('${escapeHtml(currentViewFolder)}')" title="Klasör Adını Değiştir">✏️ Yeniden Adlandır</button>
                        <button class="btn-breadcrumb-action" onclick="exportFolderToPdf('${escapeHtml(currentViewFolder)}')" title="Bu Klasördeki Dosyaları PDF Olarak Kaydet">📄 PDF</button>
                        <button class="btn-breadcrumb-action" onclick="exportFolderToTxt('${escapeHtml(currentViewFolder)}')" title="Bu Klasördeki Dosyaları TXT Olarak İndir">📝 TXT</button>
                        <button class="btn-breadcrumb-action danger" onclick="promptDeleteFolder('${escapeHtml(currentViewFolder)}')" title="Klasörü Sil">🗑️ Sil</button>
                    </div>
                `;
            } else {
                breadcrumb.innerHTML = `
                    <span style="display:flex; align-items:center; gap:6px;">
                        <svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        Ana Ekran (Masaüstü)
                    </span>
                `;
            }

            // 1. MASAÜSTÜ KLASÖRLERİ BÖLÜMÜ (Yalnızca Ana Ekrandayken gösterilir)
            if (!currentViewFolder) {
                const knownFolders = getAllKnownFolders();
                const foldersSection = document.createElement('div');
                foldersSection.className = 'desktop-folders-container';
                foldersSection.innerHTML = `
                    <div class="desktop-folders-header">
                        <div class="desktop-folders-title">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                            Masaüstü Klasörleri <span class="folders-count-badge">(${knownFolders.length})</span>
                        </div>
                        <button class="btn-create-folder-inline" onclick="promptCreateNewFolder()" title="Yeni Klasör Oluştur">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                            + Yeni Klasör
                        </button>
                    </div>
                `;

                const foldersGrid = document.createElement('div');
                foldersGrid.className = 'desktop-folders-grid';

                if (knownFolders.length === 0) {
                    foldersGrid.innerHTML = `
                        <div class="empty-folders-hint" onclick="promptCreateNewFolder()">
                            📁 Henüz özel klasör yok. Buraya veya "+ Yeni Klasör" butonuna tıklayarak ilk klasörünüzü oluşturabilirsiniz.
                        </div>
                    `;
                } else {
                    knownFolders.forEach(f => {
                        const pCount = projects.filter(p => (p.folder || '').trim() === f && (currentTab === 'active' ? !p.isArchived : p.isArchived)).length;
                        const nCount = officeNotes.filter(n => (n.folder || '').trim() === f && (currentTab === 'active' ? !n.isArchived : n.isArchived)).length;
                        const totalCount = pCount + nCount;

                        const folderCard = document.createElement('div');
                        folderCard.className = 'desktop-folder-card glitter-frame';
                        folderCard.title = `'${f}' klasörünü açmak için tıklayın. Dosya taşımak için kartı buraya sürükleyebilirsiniz.`;
                        folderCard.onclick = () => openFolder(f);
                        folderCard.ondragover = (e) => handleFolderDragOver(e);
                        folderCard.ondragleave = (e) => handleFolderDragLeave(e);
                        folderCard.ondrop = (e) => handleFolderDrop(f, e);

                        folderCard.innerHTML = `
                            <div class="folder-card-top">
                                <div class="folder-card-icon">
                                    <svg viewBox="0 0 24 24" class="folder-svg-icon"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                                </div>
                                <button class="folder-card-menu-btn" onclick="event.stopPropagation(); toggleFolderMenu('${escapeHtml(f)}', this, event)" title="Klasör İşlemleri">
                                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                                </button>
                            </div>
                            <div class="folder-card-name">${escapeHtml(f)}</div>
                            <div class="folder-card-count">${totalCount} dosya${pCount > 0 && nCount > 0 ? ` (${pCount} proje, ${nCount} not)` : ''}</div>
                        `;
                        foldersGrid.appendChild(folderCard);
                    });
                }
                foldersSection.appendChild(foldersGrid);
                container.appendChild(foldersSection);

                // Ana Ekran Dosyaları Başlığı
                const filesHeader = document.createElement('div');
                filesHeader.className = 'desktop-files-header';
                filesHeader.innerHTML = `
                    <div class="desktop-files-title">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ${appMode === 'ruhsat' ? 'Ana Ekrandaki Ruhsat ve İmar Föyleri' : 'Ana Ekrandaki To-Do Projeleri'}
                    </div>
                `;
                container.appendChild(filesHeader);
            }

            const itemsToRender = currentViewFolder 
                ? activeProjects.filter(p => (p.folder || '').trim() === currentViewFolder)
                : activeProjects.filter(p => { let f = (p.folder || '').trim(); return f === '' || f === 'Ana Ekran'; });

            const projectsGrid = document.createElement('div');
            projectsGrid.className = 'projects-grid-inner';

            if (itemsToRender.length === 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.style.gridColumn = '1 / -1';
                emptyDiv.style.textAlign = 'center';
                emptyDiv.style.padding = '40px 20px';
                emptyDiv.style.background = 'rgba(0,0,0,0.02)';
                emptyDiv.style.border = '2px dashed var(--border-color)';
                emptyDiv.style.borderRadius = '12px';
                emptyDiv.style.marginTop = '10px';

                if (currentViewFolder) {
                    emptyDiv.innerHTML = `
                        <div style="font-size: 2.2rem; margin-bottom: 12px;">📁</div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 8px;">"${escapeHtml(currentViewFolder)}" Klasörü Henüz Boş</h3>
                        <p style="opacity: 0.75; font-size: 0.9rem; margin-bottom: 16px;">Bu klasörün içine doğrudan yeni bir liste eklemek için aşağıdaki butona tıklayın veya ana ekrandaki dosyaları buraya sürükleyin / taşıyın.</p>
                        <button class="btn-main" onclick="${appMode === 'ruhsat' ? 'createNewProject(\'full\')' : 'createNewProject(\'blank\', \'ofis\')'}">+ Bu Klasöre ${appMode === 'ruhsat' ? 'Yeni Ruhsat Föyü Ekle' : 'Yeni To-Do Ekle'}</button>
                    `;
                } else {
                    emptyDiv.innerHTML = `
                        <div style="font-size: 2.2rem; margin-bottom: 12px;">🏛️</div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${appMode === 'ruhsat' ? 'Ana Ekranda Ruhsat / İmar Föyü Bulunmuyor' : 'Ana Ekranda Proje veya To-Do Bulunmuyor'}</h3>
                        <p style="opacity: 0.75; font-size: 0.9rem; margin-bottom: 16px;">${getAllKnownFolders().length > 0 ? 'Mevcut dosyalarınız yukarıdaki klasörlerin içinde yer alıyor olabilir. Ana ekrana yeni bir dosya eklemek için butona tıklayın.' : (appMode === 'ruhsat' ? '131 maddelik ve 12 bölümlü Kepez Belediyesi & PAİY kontrol listesini oluşturmak için butona tıklayın.' : 'Yeni bir liste eklemek için butona tıklayın.')}</p>
                        <button class="btn-main" onclick="${appMode === 'ruhsat' ? 'createNewProject(\'full\')' : 'createNewProject(\'blank\', \'ofis\')'}">+ ${appMode === 'ruhsat' ? 'Yeni Ruhsat / İmar Föyü Ekle' : 'Yeni To-Do Ekle'}</button>
                    `;
                }
                projectsGrid.appendChild(emptyDiv);
                container.appendChild(projectsGrid);
                if (currentPipProjectId) renderPipContent();
                return;
            }

            itemsToRender.sort((a, b) => (a.isPinned !== b.isPinned ? (a.isPinned ? -1 : 1) : b.id - a.id));

            itemsToRender.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card glitter-frame';
                card.draggable = true;
                card.ondragstart = (e) => handleProjectDragStart(e, project.id);

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
                    if (project.isRuhsat) {
                        project.tasks.forEach(t => {
                            if (t.subtasks && t.subtasks.length > 0) {
                                t.subtasks.forEach(st => { total++; if (st.completed) done++; });
                            } else {
                                total++; if (t.completed) done++;
                            }
                        });
                    } else {
                        project.tasks.forEach(t => {
                            total++; if (t.completed) done++;
                            if (t.subtasks) t.subtasks.forEach(st => { total++; if (st.completed) done++; });
                        });
                    }
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    previewHtml = `<div style="margin-bottom: 8px; font-weight:700; font-size:0.85rem; background:rgba(0,0,0,0.15); padding:3px 8px; border-radius:6px; display:inline-block;">${project.isRuhsat ? '<span style="background:rgba(255,255,255,0.2); padding:1px 5px; border-radius:4px; margin-right:5px;">🏛️ Ruhsat</span>' : ''}İlerleme: %${pct} (${done}/${total})</div>`;
                }

                card.innerHTML = `
                    <div class="card-top-actions">
                        <button class="card-menu-btn" onclick="toggleCardMenu('project', ${project.id}, this, event)" title="Klasöre Taşı / Arşivle / Sil / Dışa Aktar">
                            <svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                        <button class="card-pip-btn" onclick="openFloatingPip(${project.id}, event)" title="Tüm Uygulamaların Üstünde Tut (Masaüstü PiP)">
                            <svg class="icon-svg" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><rect x="11" y="9" width="9" height="7" rx="1" ry="1" fill="currentColor"></rect></svg>
                        </button>
                    </div>
                    <div class="project-title">${project.isRuhsat ? '🏛️ ' : ''}${project.title}${project.isPinned ? ' 📌' : ''}</div>
                    ${project.isRuhsat ? `
                        <div style="display:flex; flex-wrap:wrap; gap:6px; margin: 4px 0 8px 0; font-size:0.75rem;">
                            <span style="background:rgba(46,125,50,0.18); font-weight:700; padding:2px 8px; border-radius:4px;">12 Bölüm · 131 Kriter</span>
                            ${project.metadata?.mimar ? `<span style="background:rgba(0,0,0,0.08); padding:2px 6px; border-radius:4px;">Mimar: ${escapeHtml(project.metadata.mimar)}</span>` : ''}
                        </div>
                    ` : ''}
                    <div class="project-folder-badge" onclick="event.stopPropagation(); openFolderOrHome('${(project.folder || 'Ana Ekran').replace(/'/g, "\\'")}')" style="cursor:pointer;" title="Bu klasörü aç">
                        <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        ${project.folder || 'Ana Ekran'}
                    </div>
                    <div class="project-preview">${previewHtml}</div>
                    ${project.isRuhsat ? `
                        <div style="margin-top:10px; padding:6px 8px; background:rgba(0,0,0,0.08); border-radius:6px; font-size:0.78rem; font-weight:600; text-align:center; display:flex; align-items:center; justify-content:center; gap:6px;">
                            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            131 Maddelik Kontrol Listesini Aç
                        </div>
                    ` : ''}
                    <div class="project-card-date">${project.createdAt ? ('Oluşturma: ' + project.createdAt) : ''}${project.updatedAt ? (project.createdAt ? ' · Güncelleme: ' : 'Güncelleme: ') + project.updatedAt : ''}</div>
                `;
                projectsGrid.appendChild(card);
            });

            container.appendChild(projectsGrid);
            if (currentPipProjectId) renderPipContent();
        }

        function createNewProject(type, category = 'genel') {
            if (type === 'full' && category !== 'ofis') {
                const name = prompt("Yeni Ruhsat / İmar Projesinin Ada/Parsel Bilgisini Giriniz:", "Yeni Ada/Parsel");
                if (name === null) return;
                recordState();
                const newProj = createRuhsatProject({
                    projeAdi: "",
                    adaParsel: (name || 'Yeni Ada/Parsel').trim(),
                    tarih: new Date().toLocaleDateString('tr-TR'),
                    mimar: ""
                });
                newProj.folder = currentViewFolder || "Ana Ekran";
                projects.unshift(newProj);
                saveProjects();
                renderProjects();
                openModal(newProj.id);
                showToast("131 maddelik Ruhsat / İmar Kontrol Föyü oluşturuldu.");
                return;
            }

            const title = prompt("Proje Adı:", category === 'ofis' ? "Yeni Genel Görev / To-Do" : "Yeni Boş Proje / Görev");
            if (!title) return;
            recordState();
            const newProj = {
                id: Date.now(),
                title: title,
                folder: currentViewFolder || "Ana Ekran",
                color: category === 'ofis' ? '#f2c14e' : '#85b88f',
                isArchived: false,
                isPinned: false,
                isRuhsat: false,
                category: category,
                createdAt: getFormattedDate(),
                tasks: []
            };
            projects.unshift(newProj);
            saveProjects();
            renderProjects();
        }

        function openModal(projectId) {
            modalSubtaskAdderOpen.clear();
            currentEditingProjectId = projectId;
            const project = projects.find(p => p.id === projectId);
            if (!project) return;
            document.getElementById('modal-title').value = project.title;
            document.getElementById('modal-folder').value = project.folder || '';
            updateFolderDatalist();
            const modalContent = document.getElementById('modal-content');
            
            const sortBar = document.querySelector('.task-sort-bar');
            const newTaskContainer = document.querySelector('.new-task-container');
            if (project.isRuhsat) {
                if (sortBar) sortBar.style.display = 'none';
                if (newTaskContainer) newTaskContainer.style.display = 'none';
                modalContent.style.removeProperty('background-color');
                modalContent.style.removeProperty('color');
            } else {
                if (sortBar) sortBar.style.display = 'flex';
                if (newTaskContainer) newTaskContainer.style.display = 'flex';
                if (project.color) {
                    modalContent.style.backgroundColor = project.color;
                    modalContent.style.color = getContrastColor(project.color);
                } else {
                    modalContent.style.removeProperty('background-color');
                    modalContent.style.removeProperty('color');
                }
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
                        if (newF !== 'Ana Ekran' && !customFolders.includes(newF)) {
                            customFolders.push(newF);
                            saveCustomFolders();
                        }
                        project.updatedAt = getFormattedDate();
                        saveProjects();
                        renderProjects();
                    }
                }
            }
            document.getElementById('modal-overlay').style.display = 'none';
            currentEditingProjectId = null;
            modalSubtaskAdderOpen.clear();
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
            const task = project.tasks[taskIndex];
            const key = `${project.id}-${task.id || taskIndex}`;
            pipDrawerOpenMap.set(key, true);
            pipDrawerOpenMap.set(`${project.id}-${taskIndex}`, true);
            modalSubtaskAdderOpen.delete(taskIndex);

            refreshAllViews();
            showToast("Alt görev eklendi.");
        }

        function openModalSubtaskAdder(index) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (project && project.tasks && project.tasks[index]) {
                const task = project.tasks[index];
                const key = `${project.id}-${task.id || index}`;
                pipDrawerOpenMap.set(key, true);
                pipDrawerOpenMap.set(`${project.id}-${index}`, true);
            }
            modalSubtaskAdderOpen.add(index);
            renderTasks();
            setTimeout(() => {
                const inp = document.getElementById(`modal-sub-input-${index}`);
                if (inp) inp.focus();
            }, 50);
        }

        // Ana ekrandaki to-do'larda alt görevleri gizle/göster
        function toggleModalSubtaskDrawer(index, btnEl) {
            const project = projects.find(p => p.id === currentEditingProjectId) || getActiveProject(btnEl);
            if (!project || !project.tasks || !project.tasks[index]) return;
            const task = project.tasks[index];
            const key = `${project.id}-${task.id || index}`;
            const currentlyOpen = pipDrawerOpenMap.has(key) 
                ? pipDrawerOpenMap.get(key) 
                : (pipDrawerOpenMap.has(`${project.id}-${index}`) ? pipDrawerOpenMap.get(`${project.id}-${index}`) : true);
            const nextState = !currentlyOpen;
            pipDrawerOpenMap.set(key, nextState);
            pipDrawerOpenMap.set(`${project.id}-${index}`, nextState);
            modalSubtaskAdderOpen.delete(index);

            // DOM üzerinde anlık ve akıcı geçiş
            const taskEl = btnEl ? btnEl.closest('.task-item') : document.querySelector(`.task-item[data-index="${index}"]`);
            if (taskEl) {
                const container = taskEl.querySelector('.subtasks-container');
                const chevron = btnEl ? btnEl.querySelector('svg') : taskEl.querySelector('.sub-toggle svg');
                if (container) {
                    container.classList.toggle('expanded', nextState);
                }
                if (chevron) {
                    chevron.style.transform = `rotate(${nextState ? '0' : '-90'}deg)`;
                }
            } else {
                renderTasks();
            }
        }

        // Tüm alt görevleri tek tıkla topluca aç/kapat
        function toggleAllModalSubtasks() {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks) return;

            const tasksWithSub = project.tasks.map((t, idx) => ({ t, idx })).filter(({ t }) => t.subtasks && t.subtasks.length > 0);
            if (tasksWithSub.length === 0) {
                showToast("Bu projede henüz alt madde bulunmuyor.", "info");
                return;
            }

            let openCount = 0;
            tasksWithSub.forEach(({ t, idx }) => {
                const key = `${project.id}-${t.id || idx}`;
                const isOpen = pipDrawerOpenMap.has(key) 
                    ? pipDrawerOpenMap.get(key) 
                    : (pipDrawerOpenMap.has(`${project.id}-${idx}`) ? pipDrawerOpenMap.get(`${project.id}-${idx}`) : true);
                if (isOpen) openCount++;
            });

            // Herhangi biri açıksa hepsini daralt (gizle); hepsi kapalıysa hepsini aç (göster)
            const nextState = openCount === 0;

            tasksWithSub.forEach(({ t, idx }) => {
                const key = `${project.id}-${t.id || idx}`;
                pipDrawerOpenMap.set(key, nextState);
                pipDrawerOpenMap.set(`${project.id}-${idx}`, nextState);
                modalSubtaskAdderOpen.delete(idx);
            });

            renderTasks();
            showToast(nextState ? "Tüm alt maddeler gösterildi." : "Tüm alt maddeler gizlendi.", "info");
        }

        function handleAddSubtask(index, inputEl) {
            if (!inputEl || !inputEl.value.trim()) return;
            const text = inputEl.value.trim();
            addSubtask(index, text, inputEl);
            inputEl.value = '';
            modalSubtaskAdderOpen.delete(index);
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

            if (project.isRuhsat) {
                renderRuhsatChecklist(project, container);
                return;
            }

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
                const drawerKey = `${project.id}-${task.id || index}`;
                // Alt görevler kullanıcı tarafından gizlenmediyse açık başlar
                const isDrawerOpenStored = pipDrawerOpenMap.has(drawerKey) 
                    ? pipDrawerOpenMap.get(drawerKey) 
                    : (pipDrawerOpenMap.has(`${project.id}-${index}`) ? pipDrawerOpenMap.get(`${project.id}-${index}`) : true);
                const isExpanded = isDrawerOpenStored;

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
                        ${task.emoji ? renderTaskIcon(task.emoji) : ''}
                        <div class="task-content">
                            <span class="task-text ${task.completed ? 'completed' : ''}" data-hl-target="true" data-hl-type="task" data-hl-task-idx="${index}" ondblclick="startInlineEdit(${index}, null, this)" title="Çift tıklayarak düzenleyebilirsiniz">${task.text}</span>
                        </div>
                        
                        <button class="btn-task-action emoji btn-task-emoji" onclick="toggleEmojiPicker(${index}, this, event)" title="Göreve İkon Ekle / Değiştir">
                            ${task.emoji ? renderTaskIcon(task.emoji) : `<svg class="icon-svg icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2"/><circle cx="9" cy="9" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="0.9" fill="currentColor" stroke="none"/></svg>`}
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

        /* ===== GÖREV İKONU SEÇİCİ (TRANSPARAN BUZLU CAM VE ÇİZGİSEL İKONLAR) ===== */
        let emojiPickerTargetIndex = null;
        let emojiPickerContextEl = null;

        function buildEmojiPicker() {
            if (document.getElementById('emoji-picker-popover')) return;
            const el = document.createElement('div');
            el.id = 'emoji-picker-popover';
            el.className = 'emoji-picker-popover';

            const header = document.createElement('div');
            header.className = 'emoji-picker-header';
            header.innerHTML = `
                <div class="emoji-picker-title">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Çizgisel İkon Seçin
                </div>
                <div class="emoji-picker-sub">36 Teknik &amp; Mimari İkon</div>
            `;
            el.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'emoji-picker-grid';

            Object.keys(LINE_ICONS).forEach(key => {
                const item = LINE_ICONS[key];
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'emoji-pick-btn line-icon-btn';
                btn.title = item.label;
                btn.innerHTML = item.svg;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    pickTaskEmoji(emojiPickerTargetIndex, key, emojiPickerContextEl);
                    closeEmojiPicker();
                };
                grid.appendChild(btn);
            });
            el.appendChild(grid);

            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'emoji-pick-clear';
            clearBtn.innerHTML = `
                <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                <span>İkonu Kaldır</span>
            `;
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
            const pw = 280;
            const ph = popover.offsetHeight || 290;
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

        /* ===== DRAG & DROP DOSYA TAŞIMA VE MASAÜSTÜ KLASÖR MOTORU ===== */
        var draggedItemInfo = null;

        function handleProjectDragStart(event, projectId) {
            draggedItemInfo = { type: 'project', id: projectId };
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', JSON.stringify(draggedItemInfo));
        }

        function handleNoteDragStart(event, noteId) {
            draggedItemInfo = { type: 'note', id: noteId };
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', JSON.stringify(draggedItemInfo));
        }

        function handleFolderDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            const card = event.currentTarget;
            if (card) card.classList.add('drag-hover');
        }

        function handleFolderDragLeave(event) {
            const card = event.currentTarget;
            if (card) card.classList.remove('drag-hover');
        }

        function handleFolderDrop(targetFolder, event) {
            event.preventDefault();
            const card = event.currentTarget;
            if (card) card.classList.remove('drag-hover');
            if (!draggedItemInfo) return;

            if (draggedItemInfo.type === 'project') {
                const proj = projects.find(p => p.id === draggedItemInfo.id);
                if (proj) {
                    recordState();
                    proj.folder = targetFolder;
                    proj.updatedAt = getFormattedDate();
                    saveProjects();
                    showToast(`"${proj.title}" -> "${targetFolder}" klasörüne taşındı.`);
                    refreshAllViews();
                }
            } else if (draggedItemInfo.type === 'note') {
                const note = officeNotes.find(n => n.id === draggedItemInfo.id);
                if (note) {
                    note.folder = targetFolder;
                    note.updatedAt = getFormattedDate();
                    saveOfficeNotes();
                    showToast(`"${note.title}" -> "${targetFolder}" klasörüne taşındı.`);
                    refreshAllViews();
                    if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
                }
            }
            draggedItemInfo = null;
        }

        function promptCreateNewFolder() {
            const name = prompt("Oluşturmak istediğiniz yeni klasörün adını girin (Örn: Ruhsatlar, Şantiye, Belediye İşleri):");
            if (name === null) return;
            const trimmed = name.trim();
            if (!trimmed) { showToast("Klasör adı boş bırakılamaz.", "info"); return; }
            if (trimmed === "Ana Ekran") { showToast("Bu isim sistem tarafından kullanılmaktadır.", "info"); return; }
            createCustomFolder(trimmed);
        }

        function promptRenameFolder(oldName) {
            const name = prompt(`"${oldName}" klasörünün yeni adını girin:`, oldName);
            if (name === null) return;
            const trimmed = name.trim();
            if (!trimmed || trimmed === oldName) return;
            renameCustomFolder(oldName, trimmed);
        }

        function promptDeleteFolder(folderName) {
            const hasFiles = projects.some(p => (p.folder || '').trim() === folderName) || officeNotes.some(n => (n.folder || '').trim() === folderName);
            let msg = `"${folderName}" klasörünü silmek istediğinize emin misiniz?`;
            if (hasFiles) {
                msg += `\n\nNot: Klasörün içindeki dosyalar silinmeyecek, güvenle 'Ana Ekran'a aktarılacaktır.`;
            }
            if (!confirm(msg)) return;
            deleteCustomFolder(folderName, true);
        }

        function exportFolderToPdf(folderName) {
            const folderProjects = projects.filter(p => (p.folder || '').trim() === folderName);
            const folderNotes = officeNotes.filter(n => (n.folder || '').trim() === folderName);
            if (folderProjects.length === 0 && folderNotes.length === 0) {
                showToast("Bu klasörde dışa aktarılacak dosya yok.", "info");
                return;
            }
            let html = `
                <div class="report-header">
                    <div>
                        <h1 class="report-title">📁 Klasör: ${escapeHtml(folderName)}</h1>
                        <p style="margin:4px 0 0 0; font-size:10pt; color:#475569;">Klasör Raporu ve Çıktısı</p>
                    </div>
                    <div class="report-meta">
                        <div><b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}</div>
                        <div><b>Toplam Proje:</b> ${folderProjects.length}</div>
                        <div><b>Toplam Not:</b> ${folderNotes.length}</div>
                    </div>
                </div>
            `;
            folderProjects.forEach((p, idx) => {
                if (idx > 0) html += `<div class="page-break"></div>`;
                html += formatProjectToPdfHtml(p);
            });
            if (folderNotes.length > 0) {
                if (folderProjects.length > 0) html += `<div class="page-break"></div>`;
                html += `<h2 style="font-size:14pt; color:#9a3412; border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; margin-top:20px;">OFİS NOTLARI</h2>`;
                folderNotes.forEach(n => { html += formatNoteToPdfHtml(n); });
            }
            printHtmlContent(`${folderName} Klasörü Raporu`, html);
        }

        function exportFolderToTxt(folderName) {
            const folderProjects = projects.filter(p => (p.folder || '').trim() === folderName);
            const folderNotes = officeNotes.filter(n => (n.folder || '').trim() === folderName);
            if (folderProjects.length === 0 && folderNotes.length === 0) {
                showToast("Bu klasörde dışa aktarılacak dosya yok.", "info");
                return;
            }
            let out = [];
            out.push(`MİMZ OFİS - KLASÖR DIŞA AKTARIMI: ${folderName}`);
            out.push(`Tarih: ${new Date().toLocaleString('tr-TR')}`);
            out.push(`Toplam Proje: ${folderProjects.length} | Toplam Not: ${folderNotes.length}\n`);
            folderProjects.forEach(p => { out.push(formatProjectToTxt(p)); });
            folderNotes.forEach(n => { out.push(formatNoteToTxt(n)); });
            downloadTxtFile(`${folderName.replace(/[/\\?%*:|"<>]/g, '_')}_arsiv.txt`, out.join('\n'));
        }

        var activeMenuFolder = null;
        function buildFolderMenuPopover() {
            if (document.getElementById('folder-menu-popover')) return;
            const el = document.createElement('div');
            el.id = 'folder-menu-popover';
            el.className = 'card-menu-popover';
            el.addEventListener('mousedown', e => e.stopPropagation());
            document.body.appendChild(el);
        }

        function toggleFolderMenu(folderName, btnEl, event) {
            if (event) event.stopPropagation();
            buildFolderMenuPopover();
            const popover = document.getElementById('folder-menu-popover');
            if (popover.classList.contains('show') && activeMenuFolder === folderName) {
                closeFolderMenu();
                return;
            }
            activeMenuFolder = folderName;
            popover.innerHTML = `
                <button class="card-menu-item" onclick="closeFolderMenu(); openFolder('${escapeHtml(folderName)}')">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    Klasörü Aç
                </button>
                <button class="card-menu-item" onclick="closeFolderMenu(); promptRenameFolder('${escapeHtml(folderName)}')">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    Yeniden Adlandır...
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item" onclick="closeFolderMenu(); exportFolderToPdf('${escapeHtml(folderName)}')">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Klasörü PDF Olarak Kaydet
                </button>
                <button class="card-menu-item" onclick="closeFolderMenu(); exportFolderToTxt('${escapeHtml(folderName)}')">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Klasörü TXT Olarak İndir
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item danger" onclick="closeFolderMenu(); promptDeleteFolder('${escapeHtml(folderName)}')">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Klasörü Sil
                </button>
            `;
            const rect = btnEl.getBoundingClientRect();
            popover.classList.add('show');
            popover.style.visibility = 'hidden';
            const pw = popover.offsetWidth || 210;
            const ph = popover.offsetHeight || 190;
            let top = rect.bottom + 6;
            let left = rect.left;
            if (top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
            if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;
            if (left < 10) left = 10;
            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
            popover.style.visibility = 'visible';
        }

        function closeFolderMenu() {
            const popover = document.getElementById('folder-menu-popover');
            if (popover) popover.classList.remove('show');
            activeMenuFolder = null;
        }

        window.addEventListener('mousedown', (e) => {
            const popover = document.getElementById('folder-menu-popover');
            if (popover && popover.classList.contains('show') && !e.target.closest('#folder-menu-popover') && !e.target.closest('.folder-card-menu-btn')) {
                closeFolderMenu();
            }
        });

        function updateFolderDatalist() {
            const datalist = document.getElementById('folder-suggestions');
            if (!datalist) return;
            datalist.innerHTML = '';
            const known = getAllKnownFolders();
            known.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f;
                datalist.appendChild(opt);
            });
        }

        /* ===== KART 3 NOKTA MENÜSÜ (KLASÖRE TAŞI / ANA EKRAN / PDF / TXT / ARŞİV / SİL) ===== */
        var cardMenuTargetType = null;
        var cardMenuTargetId = null;

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

        function cardMenuExportPdf() {
            const type = cardMenuTargetType;
            const id = cardMenuTargetId;
            closeCardMenu();
            if (!id) return;
            if (type === 'project') exportProjectToPdf(id);
            else exportNoteToPdf(id);
        }

        function cardMenuExportTxt() {
            const type = cardMenuTargetType;
            const id = cardMenuTargetId;
            closeCardMenu();
            if (!id) return;
            if (type === 'project') exportProjectToTxt(id);
            else exportNoteToTxt(id);
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
                <div class="card-menu-sep"></div>
                <button class="card-menu-item" onclick="cardMenuExportPdf()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    PDF Olarak Kaydet
                </button>
                <button class="card-menu-item" onclick="cardMenuExportTxt()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    TXT Olarak İndir
                </button>
                <div class="card-menu-sep"></div>
                <button class="card-menu-item" onclick="cardMenuTogglePin()">
                    <svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/></svg>
                    ${item.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                </button>
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
            const ph = popover.offsetHeight || 230;
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
            const hint = known.length ? `\n\nMevcut Klasörler:\n• ${known.join('\n• ')}\n\n(Yukarıdaki listeden birini yazabilir veya yeni bir klasör adı girebilirsiniz)` : '\n\nHenüz klasör oluşturulmadı. Yeni bir klasör adı girebilirsiniz.';
            const current = (item.folder || '').trim();
            const target = prompt('Bu öğeyi hangi klasöre taşımak istersiniz?' + hint, current && current !== 'Ana Ekran' ? current : '');
            if (target === null) { closeCardMenu(); return; }
            const trimmed = target.trim();
            const dest = trimmed ? trimmed : 'Ana Ekran';
            item.folder = dest;
            if (dest !== 'Ana Ekran' && !customFolders.includes(dest)) {
                customFolders.push(dest);
                saveCustomFolders();
            }
            if (cardMenuTargetType === 'project') item.updatedAt = getFormattedDate();
            else item.updatedAt = getFormattedDate();
            cardMenuSaveAndRefresh();
            closeCardMenu();
            showToast(`"${dest}" klasörüne taşındı.`);
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


        /* ===== RUHSAT & İMAR FÖYÜ (131 MADDE & 12 BÖLÜM) ÖZEL YÖNETİMİ ===== */
        var ruhsatSearchQuery = '';
        var ruhsatActiveFilter = 'all'; // 'all', 'incomplete', 'completed'
        var ruhsatCollapsedSections = new Set();

        function escapeHtml(text) {
            if (!text && text !== 0) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderRuhsatChecklist(project, container) {
            project.metadata = project.metadata || {};
            const meta = project.metadata;

            // Toplam kriter ve tamamlanan sayısı
            let totalCriteria = 0, doneCriteria = 0;
            project.tasks.forEach(sec => {
                if (sec.subtasks) {
                    sec.subtasks.forEach(st => {
                        totalCriteria++;
                        if (st.completed) doneCriteria++;
                    });
                }
            });
            const totalPct = totalCriteria > 0 ? Math.round((doneCriteria / totalCriteria) * 100) : 0;

            let html = '<div class="ruhsat-container">';

            // 1. Proje Künyesi (Metadata Grid)
            html += `
                <div class="ruhsat-meta-grid">
                    <div class="ruhsat-meta-item">
                        <label>Proje Adı / Sahibi</label>
                        <input type="text" class="ruhsat-meta-input" value="${escapeHtml(meta.projeAdi || '')}" placeholder="Örn: Konut Projesi / Ahmet Yılmaz" oninput="updateRuhsatMetadata('projeAdi', this.value)">
                    </div>
                    <div class="ruhsat-meta-item">
                        <label>Ada / Parsel</label>
                        <input type="text" class="ruhsat-meta-input" value="${escapeHtml(meta.adaParsel || '')}" placeholder="Örn: 101 / 5" oninput="updateRuhsatMetadata('adaParsel', this.value)">
                    </div>
                    <div class="ruhsat-meta-item">
                        <label>Tarih / Revizyon</label>
                        <input type="text" class="ruhsat-meta-input" value="${escapeHtml(meta.tarih || '')}" placeholder="Örn: 12.09.2026 Rev:1" oninput="updateRuhsatMetadata('tarih', this.value)">
                    </div>
                    <div class="ruhsat-meta-item">
                        <label>Proje Müellifi / Mimar</label>
                        <input type="text" class="ruhsat-meta-input" value="${escapeHtml(meta.mimar || '')}" placeholder="Mimar Adı..." oninput="updateRuhsatMetadata('mimar', this.value)">
                    </div>
                </div>
            `;

            // 2. Arama ve Filtre Araç Çubuğu
            html += `
                <div class="ruhsat-toolbar">
                    <div class="ruhsat-search-box">
                        <svg class="ruhsat-search-icon" style="width:15px;height:15px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" class="ruhsat-search-input" id="ruhsat-filter-input" placeholder="🔍 131 kriter içinde anlık ara (örn: asansör, yangın, sığınak, rampa, emsal)..." value="${escapeHtml(ruhsatSearchQuery)}" oninput="handleRuhsatSearch(this.value)">
                    </div>
                    <div class="ruhsat-filter-group">
                        <button class="btn-ruhsat-filter ${ruhsatActiveFilter === 'all' ? 'active' : ''}" onclick="setRuhsatFilter('all')">Tümü (${totalCriteria})</button>
                        <button class="btn-ruhsat-filter ${ruhsatActiveFilter === 'incomplete' ? 'active' : ''}" onclick="setRuhsatFilter('incomplete')">Eksik Kalanlar (${totalCriteria - doneCriteria})</button>
                        <button class="btn-ruhsat-filter ${ruhsatActiveFilter === 'completed' ? 'active' : ''}" onclick="setRuhsatFilter('completed')">Tamamlananlar (${doneCriteria})</button>
                        <button class="btn-ruhsat-filter" onclick="toggleAllRuhsatSections()" title="Tüm bölümleri aç veya daralt">${ruhsatCollapsedSections.size >= (project.tasks?.length || 12) ? 'Tümünü Aç' : 'Tümünü Kapat'}</button>
                    </div>
                    <div class="ruhsat-progress-badge">
                        İlerleme: %${totalPct} (${doneCriteria} / ${totalCriteria})
                    </div>
                </div>
            `;

            // 3. Bölümler (Section Cards)
            const queryClean = (ruhsatSearchQuery || '').trim().toLowerCase();

            project.tasks.forEach((sec, sIdx) => {
                const subtasks = sec.subtasks || [];
                const secTotal = subtasks.length;
                const secDone = subtasks.filter(st => st.completed).length;
                const secPct = secTotal > 0 ? Math.round((secDone / secTotal) * 100) : 0;
                const isSecDone = secTotal > 0 && secDone === secTotal;
                const isCollapsed = ruhsatCollapsedSections.has(sIdx);

                // Filtreleme
                let visibleSubtasks = subtasks.map((st, iIdx) => ({ st, iIdx })).filter(({ st }) => {
                    if (ruhsatActiveFilter === 'incomplete' && st.completed) return false;
                    if (ruhsatActiveFilter === 'completed' && !st.completed) return false;
                    if (queryClean) {
                        const matchDesc = (st.desc || st.text || '').toLowerCase().includes(queryClean);
                        const matchNote = (st.note || '').toLowerCase().includes(queryClean);
                        const matchNo = (st.no || '').toLowerCase().includes(queryClean);
                        const matchSec = (sec.text || '').toLowerCase().includes(queryClean);
                        if (!matchDesc && !matchNote && !matchNo && !matchSec) return false;
                    }
                    return true;
                });

                // Eğer arama yapılmış ve bu bölümde hiçbir eşleşme yoksa bölümü gizle
                if (queryClean && visibleSubtasks.length === 0) {
                    return;
                }

                html += `
                    <div class="ruhsat-section-card ${isCollapsed ? 'collapsed' : ''}" id="ruhsat-sec-${sIdx}">
                        <div class="ruhsat-section-header" onclick="toggleRuhsatSectionCollapse(${sIdx})">
                            <div class="ruhsat-section-title-wrap">
                                <span>${sec.text}</span>
                                <span class="ruhsat-section-badge ${isSecDone ? 'completed' : ''}">${secDone} / ${secTotal} (%${secPct})</span>
                            </div>
                            <svg class="ruhsat-chevron" style="width:16px;height:16px;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        <div class="ruhsat-table-wrap">
                            <table class="ruhsat-table">
                                <thead>
                                    <tr>
                                        <th style="width:44px; text-align:center;">Durum</th>
                                        <th style="width:54px; text-align:center;">No</th>
                                        <th>Kontrol Kriteri / Gereklilik Detayı</th>
                                        <th style="width:300px;">Proje Notu</th>
                                        <th style="width:44px; text-align:center;">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

                if (visibleSubtasks.length === 0) {
                    html += `<tr><td colspan="5" style="text-align:center; padding:16px; opacity:0.6;">Bu filtreye uygun kriter maddesi bulunmuyor.</td></tr>`;
                } else {
                    visibleSubtasks.forEach(({ st: item, iIdx }) => {
                        let descFormatted = escapeHtml(item.desc || item.text || '');
                        if (queryClean) {
                            const reg = new RegExp('(' + escapeRegex(queryClean) + ')', 'gi');
                            descFormatted = descFormatted.replace(reg, '<mark>$1</mark>');
                        }

                        html += `
                            <tr class="ruhsat-row ${item.completed ? 'checked-row' : ''}">
                                <td style="width:44px; text-align:center;">
                                    <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleRuhsatSubtask(${sIdx}, ${iIdx}, this.checked)">
                                </td>
                                <td style="width:54px; text-align:center;">
                                    <span class="ruhsat-no-badge">${escapeHtml(item.no || (iIdx + 1).toString())}</span>
                                </td>
                                <td>
                                    <span class="ruhsat-desc-text ${item.completed ? 'completed' : ''}" ondblclick="editRuhsatDesc(${sIdx}, ${iIdx}, this)" title="Çift tıklayarak düzenleyebilirsiniz">${descFormatted}</span>
                                </td>
                                <td style="width:300px;">
                                    <input type="text" class="ruhsat-note-field" value="${escapeHtml(item.note || '')}" placeholder="Not ekleyin..." onchange="updateRuhsatNote(${sIdx}, ${iIdx}, this.value)" onblur="updateRuhsatNote(${sIdx}, ${iIdx}, this.value)">
                                </td>
                                <td style="width:44px; text-align:center;">
                                    <button class="delete-ruhsat-row-btn" onclick="deleteRuhsatItem(${sIdx}, ${iIdx})" title="Bu kriter maddesini sil">✕</button>
                                </td>
                            </tr>
                        `;
                    });
                }

                html += `
                                </tbody>
                            </table>
                        </div>
                        <button class="btn-add-ruhsat-row" onclick="addNewRuhsatItemPrompt(${sIdx})">+ Bu Bölüme Yeni Madde Ekle</button>
                    </div>
                `;
            });

            // Alt Kısım: Yeni Bölüm Ekleme Butonu
            html += `
                <div style="margin-top:10px; display:flex; justify-content:flex-end;">
                    <button class="btn-add-ruhsat-row" style="margin:0; border-style:solid;" onclick="addNewRuhsatSectionPrompt()">+ Yeni Özel Bölüm Ekle</button>
                </div>
            `;

            html += '</div>';
            container.innerHTML = html;
        }

        function toggleRuhsatSubtask(secIdx, itemIdx, isChecked) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks || !project.tasks[secIdx]) return;
            recordState();
            const sec = project.tasks[secIdx];
            if (sec.subtasks && sec.subtasks[itemIdx]) {
                sec.subtasks[itemIdx].completed = isChecked;
                sec.completed = sec.subtasks.every(s => s.completed);
            }
            project.updatedAt = getFormattedDate();
            saveProjects();
            renderProjects();
            renderTasks();
            if (isChecked && typeof triggerSparkleBurst === 'function') {
                triggerSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 28);
            }
        }

        function updateRuhsatNote(secIdx, itemIdx, val) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks || !project.tasks[secIdx]) return;
            const sec = project.tasks[secIdx];
            if (sec.subtasks && sec.subtasks[itemIdx]) {
                if (sec.subtasks[itemIdx].note !== val) {
                    sec.subtasks[itemIdx].note = val;
                    project.updatedAt = getFormattedDate();
                    saveProjects();
                }
            }
        }

        function editRuhsatDesc(secIdx, itemIdx, spanEl) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks || !project.tasks[secIdx]) return;
            const item = project.tasks[secIdx].subtasks[itemIdx];
            const currentDesc = item.desc || item.text || '';
            const newDesc = prompt("Kriter maddesi açıklamasını düzenleyin:", currentDesc);
            if (newDesc !== null && newDesc.trim() !== '') {
                recordState();
                item.desc = newDesc.trim();
                item.text = (item.no ? item.no + '. ' : '') + newDesc.trim();
                project.updatedAt = getFormattedDate();
                saveProjects();
                renderTasks();
            }
        }

        function addNewRuhsatItemPrompt(secIdx) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks || !project.tasks[secIdx]) return;
            const desc = prompt("Eklenecek yeni kontrol kriterini yazınız:");
            if (!desc || !desc.trim()) return;
            recordState();
            const sec = project.tasks[secIdx];
            if (!sec.subtasks) sec.subtasks = [];
            const newNo = sec.subtasks.length > 0 ? (parseInt(sec.subtasks[sec.subtasks.length - 1].no) + 1 || sec.subtasks.length + 1).toString() : "1";
            sec.subtasks.push({
                id: Date.now(),
                no: newNo,
                desc: desc.trim(),
                text: newNo + '. ' + desc.trim(),
                note: '',
                completed: false
            });
            sec.completed = false;
            project.updatedAt = getFormattedDate();
            saveProjects();
            renderProjects();
            renderTasks();
            showToast("Yeni kriter maddesi eklendi.");
        }

        function deleteRuhsatItem(secIdx, itemIdx) {
            if (!confirm("Bu kontrol kriteri maddesini silmek istediğinize emin misiniz?")) return;
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks || !project.tasks[secIdx]) return;
            recordState();
            const sec = project.tasks[secIdx];
            if (sec.subtasks && sec.subtasks[itemIdx]) {
                sec.subtasks.splice(itemIdx, 1);
                sec.completed = sec.subtasks.length > 0 && sec.subtasks.every(s => s.completed);
            }
            project.updatedAt = getFormattedDate();
            saveProjects();
            renderProjects();
            renderTasks();
            showToast("Kriter silindi. (Geri almak için Ctrl+Z)", "delete");
        }

        function addNewRuhsatSectionPrompt() {
            const title = prompt("Yeni bölüm başlığını giriniz (Örn: L. ÖZEL İMAR HÜKÜMLERİ):");
            if (!title || !title.trim()) return;
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project) return;
            recordState();
            if (!project.tasks) project.tasks = [];
            project.tasks.push({
                id: Date.now(),
                sectionKey: 'custom_' + Date.now(),
                text: title.trim(),
                completed: false,
                subtasks: []
            });
            project.updatedAt = getFormattedDate();
            saveProjects();
            renderProjects();
            renderTasks();
            showToast("Yeni bölüm eklendi.");
        }

        function updateRuhsatMetadata(field, value) {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project) return;
            if (!project.metadata) project.metadata = {};
            project.metadata[field] = (value || '').trim();
            if (field === 'adaParsel' || field === 'projeAdi') {
                const ap = project.metadata.adaParsel || '';
                const pa = project.metadata.projeAdi || '';
                project.title = ap ? (ap + (pa ? ' - ' + pa : '')) : (pa || 'Mimari Ruhsat Föyü');
                const titleInp = document.getElementById('modal-title');
                if (titleInp) titleInp.value = project.title;
            }
            project.updatedAt = getFormattedDate();
            saveProjects();
            renderProjects();
        }

        function handleRuhsatSearch(query) {
            ruhsatSearchQuery = query || '';
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (project) {
                renderRuhsatChecklist(project, document.getElementById('modal-tasks-container'));
                const inp = document.getElementById('ruhsat-filter-input');
                if (inp) {
                    inp.focus();
                    inp.selectionStart = inp.selectionEnd = inp.value.length;
                }
            }
        }

        function setRuhsatFilter(filterType) {
            ruhsatActiveFilter = filterType;
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (project) {
                renderRuhsatChecklist(project, document.getElementById('modal-tasks-container'));
            }
        }

        function toggleRuhsatSectionCollapse(sIdx) {
            sIdx = Number(sIdx);
            if (ruhsatCollapsedSections.has(sIdx)) {
                ruhsatCollapsedSections.delete(sIdx);
            } else {
                ruhsatCollapsedSections.add(sIdx);
            }
            const secCard = document.getElementById('ruhsat-sec-' + sIdx);
            if (secCard) {
                secCard.classList.toggle('collapsed', ruhsatCollapsedSections.has(sIdx));
            }
            // Buton etiketini güncelle
            const allBtn = document.querySelector('.ruhsat-filter-group button[onclick="toggleAllRuhsatSections()"]');
            if (allBtn) {
                const project = projects.find(p => p.id === currentEditingProjectId);
                const total = project && project.tasks ? project.tasks.length : 12;
                allBtn.textContent = ruhsatCollapsedSections.size >= total ? 'Tümünü Aç' : 'Tümünü Kapat';
            }
        }

        function toggleAllRuhsatSections() {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks) return;
            const total = project.tasks.length;
            const allCollapsed = ruhsatCollapsedSections.size >= total;
            if (allCollapsed) {
                ruhsatCollapsedSections.clear();
                showToast("Tüm bölümler genişletildi.", "info");
            } else {
                project.tasks.forEach((_, idx) => ruhsatCollapsedSections.add(Number(idx)));
                showToast("Tüm bölümler daraltıldı.", "info");
            }
            renderRuhsatChecklist(project, document.getElementById('modal-tasks-container'));
        }

        function escapeRegex(str) {
            return str.replace(/[.*+?^$${}()|[\]\\]/g, '\\$&');
        }
