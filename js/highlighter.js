/* ===== MİMZ OFİS - VURGU (FOSFORLU KALEM) VE ÇİZGİ MOTORU ===== */
        /* VURGU & ÇİZGİ MOTORU */
        const hlToolbar = document.getElementById('highlighter-toolbar');

        hlToolbar.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
        hlToolbar.addEventListener('mouseup', e => { e.stopPropagation(); });

        hlToolbar.querySelectorAll('.hl-tool-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const hlClass = btn.dataset.hl;
                applyHighlight(hlClass);
            };
        });

        function handleSelection() {
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                    hlToolbar.style.display = 'none';
                    return;
                }

                const selectedText = sel.toString().trim();
                if (!selectedText) {
                    hlToolbar.style.display = 'none';
                    return;
                }

                const range = sel.getRangeAt(0);
                let container = range.commonAncestorContainer;
                if (container.nodeType === Node.TEXT_NODE) container = container.parentElement;

                if (container.isContentEditable || (container.closest && container.closest('[contenteditable="true"]'))) {
                    hlToolbar.style.display = 'none';
                    return;
                }

                let targetTextEl = container.closest('[data-hl-target="true"]');
                if (!targetTextEl) {
                    const startEl = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer;
                    targetTextEl = startEl.closest('[data-hl-target="true"]');
                }

                if (!targetTextEl) {
                    hlToolbar.style.display = 'none';
                    return;
                }

                activeHlRange = range.cloneRange();
                activeHlTargetInfo = {
                    targetEl: targetTextEl,
                    type: targetTextEl.dataset.hlType,
                    taskIdx: parseInt(targetTextEl.dataset.hlTaskIdx),
                    subIdx: (targetTextEl.dataset.hlSubIdx !== undefined && targetTextEl.dataset.hlSubIdx !== "") ? parseInt(targetTextEl.dataset.hlSubIdx) : null
                };

                const rect = range.getBoundingClientRect();
                hlToolbar.style.display = 'flex';
                hlToolbar.style.visibility = 'hidden';
                
                const tbWidth = hlToolbar.offsetWidth || 280;
                const tbHeight = hlToolbar.offsetHeight || 36;
                
                let topPos = rect.top - tbHeight - 8;
                let leftPos = rect.left + (rect.width / 2) - (tbWidth / 2);

                if (topPos < 10) topPos = rect.bottom + 8;
                if (leftPos < 10) leftPos = 10;
                if (leftPos + tbWidth > window.innerWidth - 10) leftPos = window.innerWidth - tbWidth - 10;

                hlToolbar.style.top = `${topPos}px`;
                hlToolbar.style.left = `${leftPos}px`;
                hlToolbar.style.visibility = 'visible';
            }, 20);
        }

        function applyHighlight(className) {
            if (!activeHlRange || !activeHlTargetInfo) return;
            
            const selectedStr = activeHlRange.toString();
            if (!selectedStr || !selectedStr.trim()) {
                hlToolbar.style.display = 'none';
                return;
            }

            const { targetEl, type, taskIdx, subIdx } = activeHlTargetInfo;
            if (!targetEl || !document.body.contains(targetEl)) return;

            recordState();

            if (className === 'clear') {
                const spans = targetEl.querySelectorAll('[class*="hl-pen-"]');
                spans.forEach(span => {
                    const parent = span.parentNode;
                    if (parent) {
                        while (span.firstChild) parent.insertBefore(span.firstChild, span);
                        parent.removeChild(span);
                    }
                });
            } else {
                try {
                    const fragment = activeHlRange.extractContents();
                    if (!fragment || !fragment.textContent || !fragment.textContent.trim()) {
                        if (fragment) activeHlRange.insertNode(fragment);
                        hlToolbar.style.display = 'none';
                        return;
                    }
                    const span = document.createElement('span');
                    span.className = className;
                    span.appendChild(fragment);
                    activeHlRange.insertNode(span);
                } catch (err) {
                    console.warn('Vurgulama hatası:', err);
                    return;
                }
            }

            targetEl.normalize();
            const updatedHTML = targetEl.innerHTML;

            const project = getActiveProject(targetEl);
            if (project && project.tasks && project.tasks[taskIdx]) {
                if (type === 'subtask' && subIdx !== null && project.tasks[taskIdx].subtasks && project.tasks[taskIdx].subtasks[subIdx]) {
                    project.tasks[taskIdx].subtasks[subIdx].text = updatedHTML;
                } else {
                    project.tasks[taskIdx].text = updatedHTML;
                }
                project.updatedAt = getFormattedDate();
                saveProjects();
            }

            hlToolbar.style.display = 'none';
            if (window.getSelection()) window.getSelection().removeAllRanges();

            refreshAllViews();
        }

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);

        window.addEventListener('mousedown', (e) => {
            if (!e.target.closest('#highlighter-toolbar')) hlToolbar.style.display = 'none';
        });
