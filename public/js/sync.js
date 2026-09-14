/* ===== MİMZ OFİS - GERÇEK ZAMANLI AĞ & SUPABASE SENKRONİZASYONU ===== */
        /* ==========================================================
           ORTAK AĞ & SUPABASE BULUT SENKRONİZASYON MOTORU
           ========================================================== */
        const myClientId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
        const isServerHosted = (window.location.protocol === 'http:' || window.location.protocol === 'https:');
        let syncWs = null;
        let syncSaveTimeout = null;
        let isSyncConnected = false;
        let serverInfo = null;

        let supabaseClient = null;
        let supabaseChannel = null;
        let isSupabaseActive = false;

        function updateNetworkBadge(status, text) {
            const dot = document.getElementById('net-dot');
            const label = document.getElementById('net-status-text');
            if (dot) dot.className = 'net-dot ' + status;
            if (label) label.textContent = text;
        }

        function switchNetTab(tab) {
            const btnSupabase = document.getElementById('tab-btn-supabase');
            const btnLan = document.getElementById('tab-btn-lan');
            const contentSupabase = document.getElementById('net-tab-supabase-content');
            const contentLan = document.getElementById('net-tab-lan-content');

            if (tab === 'supabase') {
                btnSupabase.classList.add('active');
                btnLan.classList.remove('active');
                contentSupabase.style.display = 'flex';
                contentLan.style.display = 'none';
            } else {
                btnSupabase.classList.remove('active');
                btnLan.classList.add('active');
                contentSupabase.style.display = 'none';
                contentLan.style.display = 'flex';
            }
        }

        /* ===== SUPABASE BULUT YÖNETİMİ ===== */
        function getSupabaseCredentials() {
            let url = (localStorage.getItem('mimzSupabaseUrl') || '').trim();
            let key = (localStorage.getItem('mimzSupabaseKey') || '').trim();
            if ((!url || !key) && window.SUPABASE_CONFIG) {
                if (!url && window.SUPABASE_CONFIG.url) url = window.SUPABASE_CONFIG.url.trim();
                if (!key && window.SUPABASE_CONFIG.anonKey) key = window.SUPABASE_CONFIG.anonKey.trim();
            }
            return { url, key };
        }

        async function initSupabaseSync() {
            const statusInd = document.getElementById('supabase-status-indicator');
            const urlInput = document.getElementById('supabase-url-input');
            const keyInput = document.getElementById('supabase-key-input');

            const { url, key } = getSupabaseCredentials();
            if (urlInput) urlInput.value = url;
            if (keyInput) keyInput.value = key;

            if (!url || !key) {
                if (statusInd) {
                    statusInd.textContent = 'Bağlı Değil (URL ve Key girin)';
                    statusInd.style.color = '#ff9f43';
                }
                return false;
            }

            if (!window.supabase) {
                console.warn('Supabase JS kütüphanesi yüklenemedi.');
                if (statusInd) {
                    statusInd.textContent = 'Supabase SDK yüklenemedi (İnternet bağlantınızı kontrol edin)';
                    statusInd.style.color = '#ff4757';
                }
                return false;
            }

            try {
                if (statusInd) {
                    statusInd.textContent = 'Bağlanıyor...';
                    statusInd.style.color = '#70a1ff';
                }
                supabaseClient = window.supabase.createClient(url, key);

                // İlk veriyi çek (Projeler ve Notlar)
                const { data, error } = await supabaseClient
                    .from('ofis_data')
                    .select('*')
                    .eq('id', 'main')
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.warn('Supabase veri çekme uyarısı:', error.message);
                }

                if (data && Array.isArray(data.projects) && data.projects.length > 0) {
                    projects = data.projects;
                    projects.forEach((p, idx) => {
                        const isDummy = p.tasks && p.tasks.length === 5 && p.tasks[0].text === 'KAT PLANLARINA SIVALAR';
                        if (isDummy && typeof createRuhsatProject === 'function') {
                            projects[idx] = createRuhsatProject(p.metadata);
                        }
                    });
                    officeNotes = Array.isArray(data.office_notes) ? data.office_notes : [];
                    localStorage.setItem('mimzProjects', JSON.stringify(projects));
                    localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
                } else {
                    await uploadLocalDataToSupabase(false);
                }

                // Buluttaki Özel Klasörleri çek
                try {
                    const { data: folderData } = await supabaseClient
                        .from('ofis_data')
                        .select('*')
                        .eq('id', 'folders')
                        .single();

                    if (folderData && Array.isArray(folderData.projects)) {
                        folderData.projects.forEach(f => {
                            const tr = (f || '').trim();
                            if (tr && !customFolders.includes(tr)) customFolders.push(tr);
                        });
                        localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
                    }
                } catch (fErr) {
                    console.warn('Supabase klasör çekme uyarısı:', fErr);
                }

                if (typeof extractAndRegisterKnownFolders === 'function') {
                    extractAndRegisterKnownFolders(false);
                }
                refreshAllViews();
                if (typeof renderOfficeNotes === 'function') renderOfficeNotes();

                // Canlı Realtime Aboneliği Başlat
                if (supabaseChannel) {
                    try { supabaseClient.removeChannel(supabaseChannel); } catch (e) {}
                }

                supabaseChannel = supabaseClient
                    .channel('public:ofis_data')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'ofis_data' }, (payload) => {
                        if (!payload.new) return;
                        if (payload.new.id === 'main' && payload.new.projects) {
                            projects = payload.new.projects;
                            projects.forEach((p, idx) => {
                                const isDummy = p.tasks && p.tasks.length === 5 && p.tasks[0].text === 'KAT PLANLARINA SIVALAR';
                                if (isDummy && typeof createRuhsatProject === 'function') {
                                    projects[idx] = createRuhsatProject(p.metadata);
                                }
                            });
                            officeNotes = payload.new.office_notes || [];
                            localStorage.setItem('mimzProjects', JSON.stringify(projects));
                            localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
                            if (typeof extractAndRegisterKnownFolders === 'function') {
                                extractAndRegisterKnownFolders(false);
                            }
                            refreshAllViews();
                            if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
                            showToast('Bulut: Veriler anlık eşitlendi.', 'info');
                        } else if (payload.new.id === 'folders' && Array.isArray(payload.new.projects)) {
                            customFolders = payload.new.projects;
                            localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
                            if (typeof extractAndRegisterKnownFolders === 'function') {
                                extractAndRegisterKnownFolders(false);
                            }
                            refreshAllViews();
                            if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
                            showToast('Bulut: Klasörler anlık eşitlendi.', 'info');
                        }
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            isSupabaseActive = true;
                            updateNetworkBadge('online', '🟢 Supabase Bulut Canlı');
                            if (statusInd) {
                                statusInd.textContent = '🟢 Bağlı ve Gerçek Zamanlı Eşitleniyor';
                                statusInd.style.color = '#2ed573';
                            }
                        }
                    });

                isSupabaseActive = true;
                updateNetworkBadge('online', '🟢 Supabase Bulut Canlı');
                if (statusInd) {
                    statusInd.textContent = '🟢 Bağlı ve Gerçek Zamanlı Eşitleniyor';
                    statusInd.style.color = '#2ed573';
                }
                return true;
            } catch (err) {
                console.error('Supabase bağlantı hatası:', err);
                if (statusInd) {
                    statusInd.textContent = 'Bağlantı hatası: ' + err.message;
                    statusInd.style.color = '#ff4757';
                }
                return false;
            }
        }

        async function saveAndConnectSupabase() {
            const urlInput = document.getElementById('supabase-url-input');
            const keyInput = document.getElementById('supabase-key-input');
            const url = (urlInput.value || '').trim();
            const key = (keyInput.value || '').trim();

            if (!url || !key) {
                alert('Lütfen hem Supabase Project URL hem de Anon Public Key alanlarını doldurun.');
                return;
            }

            localStorage.setItem('mimzSupabaseUrl', url);
            localStorage.setItem('mimzSupabaseKey', key);
            showToast('Bilgiler kaydedildi, bağlanılıyor...', 'info');

            const success = await initSupabaseSync();
            if (success) {
                showToast('✅ Supabase bulut veritabanına başarıyla bağlandı!', 'info');
            }
        }

        async function uploadLocalDataToSupabase(showAlert = true) {
            if (!supabaseClient) {
                alert('Önce Supabase URL ve Key bilgilerinizi kaydedip bağlanmalısınız.');
                return;
            }
            if (showAlert && !confirm('Bu tarayıcıdaki mevcut yerel projeler ve notlar Supabase veritabanına yüklenecektir. Devam edilsin mi?')) return;

            try {
                const { error } = await supabaseClient
                    .from('ofis_data')
                    .upsert({
                        id: 'main',
                        projects: projects,
                        office_notes: officeNotes,
                        updated_at: new Date().toISOString()
                    });

                await supabaseClient
                    .from('ofis_data')
                    .upsert({
                        id: 'folders',
                        projects: customFolders,
                        office_notes: [],
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    alert('Yükleme hatası: ' + error.message + '\n\nİpucu: Supabase SQL Editor alanında supabase_setup.sql kodunu çalıştırdığınızdan emin olun.');
                } else {
                    showToast('✅ Yerel veriler ve klasörler Supabase bulutuna yüklendi!', 'info');
                }
            } catch (e) {
                alert('Hata: ' + e.message);
            }
        }

        function disconnectSupabase() {
            if (!confirm('Supabase bulut bağlantı bilgileri bu tarayıcıdan silinecek. Onaylıyor musunuz?')) return;
            localStorage.removeItem('mimzSupabaseUrl');
            localStorage.removeItem('mimzSupabaseKey');
            if (supabaseChannel && supabaseClient) {
                try { supabaseClient.removeChannel(supabaseChannel); } catch (e) {}
            }
            supabaseClient = null;
            supabaseChannel = null;
            isSupabaseActive = false;
            document.getElementById('supabase-url-input').value = '';
            document.getElementById('supabase-key-input').value = '';
            const statusInd = document.getElementById('supabase-status-indicator');
            if (statusInd) {
                statusInd.textContent = 'Bağlantı kesildi.';
                statusInd.style.color = '#ff9f43';
            }
            initSyncEngine();
            showToast('Supabase bağlantısı kaldırıldı.');
        }

        /* ===== BİRLEŞİK DEĞİŞİKLİK BİLDİRİMİ ===== */
        function notifyServerStateChange() {
            if (syncSaveTimeout) clearTimeout(syncSaveTimeout);
            syncSaveTimeout = setTimeout(() => {
                if (isSupabaseActive && supabaseClient) {
                    supabaseClient
                        .from('ofis_data')
                        .upsert({
                            id: 'main',
                            projects: projects,
                            office_notes: officeNotes,
                            updated_at: new Date().toISOString()
                        })
                        .then(({ error }) => {
                            if (error) console.error('Supabase kaydetme hatası:', error.message);
                        });

                    supabaseClient
                        .from('ofis_data')
                        .upsert({
                            id: 'folders',
                            projects: customFolders,
                            office_notes: [],
                            updated_at: new Date().toISOString()
                        })
                        .then(({ error }) => {
                            if (error) console.error('Supabase klasör kaydetme hatası:', error.message);
                        });
                }

                if (isServerHosted) {
                    const payload = { projects, officeNotes, customFolders };
                    if (syncWs && syncWs.readyState === WebSocket.OPEN) {
                        syncWs.send(JSON.stringify({
                            type: 'SAVE_STATE',
                            clientId: myClientId,
                            data: payload
                        }));
                    } else {
                        fetch('/api/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                projects: projects,
                                officeNotes: officeNotes,
                                customFolders: customFolders,
                                senderId: myClientId
                            })
                        }).catch(() => {});
                    }
                }
            }, 150);
        }

        /* ===== SENKRONİZASYON MOTORU BAŞLATICI ===== */
        async function initSyncEngine() {
            const supabaseConnected = await initSupabaseSync();
            if (supabaseConnected) return;

            if (isServerHosted) {
                fetchServerInfo();
                connectWebSocket();
            } else {
                updateNetworkBadge('local', 'Bulut / Ağ Ayarları (Tıklayın)');
            }
        }

        function fetchServerInfo() {
            fetch('/api/info')
                .then(r => r.json())
                .then(data => {
                    serverInfo = data;
                    renderNetworkIpList();
                })
                .catch(() => {});
        }

        function connectWebSocket() {
            const wsProto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const wsUrl = wsProto + window.location.host;
            
            updateNetworkBadge('offline', 'Ağa Bağlanıyor...');

            try {
                syncWs = new WebSocket(wsUrl);
            } catch (e) {
                updateNetworkBadge('offline', 'Bağlantı Hatası');
                setTimeout(connectWebSocket, 3000);
                return;
            }

            syncWs.onopen = () => {
                isSyncConnected = true;
                syncWs.send(JSON.stringify({ type: 'IDENTIFY', clientId: myClientId }));
                updateNetworkBadge('online', 'Ağda Canlı');
            };

            syncWs.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'INIT') {
                        if (msg.data && Array.isArray(msg.data.projects)) {
                            checkLocalStorageMigration(msg.data);
                            projects = msg.data.projects;
                            officeNotes = Array.isArray(msg.data.officeNotes) ? msg.data.officeNotes : [];
                            if (Array.isArray(msg.data.customFolders)) {
                                customFolders = msg.data.customFolders;
                                localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
                            }
                            localStorage.setItem('mimzProjects', JSON.stringify(projects));
                            localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
                            if (typeof extractAndRegisterKnownFolders === 'function') {
                                extractAndRegisterKnownFolders(false);
                            }
                            refreshAllViews();
                            if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
                        }
                    } else if (msg.type === 'REMOTE_UPDATE') {
                        if (msg.senderId === myClientId) return;
                        if (msg.data) {
                            projects = msg.data.projects || [];
                            officeNotes = msg.data.officeNotes || [];
                            if (Array.isArray(msg.data.customFolders)) {
                                customFolders = msg.data.customFolders;
                                localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
                            }
                            localStorage.setItem('mimzProjects', JSON.stringify(projects));
                            localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
                            if (typeof extractAndRegisterKnownFolders === 'function') {
                                extractAndRegisterKnownFolders(false);
                            }
                            refreshAllViews();
                            if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
                            showToast('Ortak Çalışma: Ekip arkadaşınız değişiklik yaptı.', 'info');
                        }
                    } else if (msg.type === 'CLIENT_COUNT') {
                        if (msg.count > 1) {
                            updateNetworkBadge('online', `Ağda Canlı (${msg.count} Kullanıcı)`);
                        } else {
                            updateNetworkBadge('online', 'Ağda Canlı (1 Kullanıcı)');
                        }
                    }
                } catch (err) {
                    console.error('Senkronizasyon hatası:', err);
                }
            };

            syncWs.onclose = () => {
                isSyncConnected = false;
                updateNetworkBadge('offline', 'Bağlantı Kesildi (Yeniden deneniyor...)');
                setTimeout(connectWebSocket, 3000);
            };

            syncWs.onerror = () => {
                syncWs.close();
            };
        }

        function checkLocalStorageMigration(serverData) {
            try {
                const localP = JSON.parse(localStorage.getItem('mimzProjects') || '[]');
                const localN = JSON.parse(localStorage.getItem('mimzOfficeNotes') || '[]');
                if (localP.length > 1 && serverData.projects.length <= 1) {
                    fetch('/api/migrate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projects: localP, officeNotes: localN })
                    }).then(r => r.json()).then(res => {
                        if (res.success) {
                            showToast('Önceki yerel verileriniz sunucuya aktarıldı!', 'info');
                        }
                    }).catch(() => {});
                }
            } catch (e) {}
        }

        function renderNetworkIpList() {
            const list = document.getElementById('network-ip-list');
            if (!list) return;
            if (!isServerHosted) {
                list.innerHTML = `
                    <div style="background:rgba(255,165,0,0.15); border:1px solid rgba(255,165,0,0.3); padding:12px; border-radius:10px; font-size:0.88rem;">
                        ⚠️ <b>Şu anda yerel dosya (file://) veya GitHub Pages modundasınız.</b><br>
                        Ofisteki arkadaşlarınızla doğrudan internet üzerinden çalışmak için lütfen yukarıdaki <b>☁️ Supabase Bulut</b> sekmesini kullanın.
                    </div>
                `;
                return;
            }

            const port = (serverInfo && serverInfo.port) || window.location.port || 3000;
            const ips = (serverInfo && serverInfo.ips) || [];
            let html = '';

            html += `
                <div class="net-ip-box">
                    <div>
                        <div style="font-size:0.75rem; opacity:0.7; font-weight:700;">BU BİLGİSAYAR</div>
                        <div class="net-ip-text">http://localhost:${port}</div>
                    </div>
                    <button class="btn-copy" onclick="copyToClipboard('http://localhost:${port}', this)">Kopyala</button>
                </div>
            `;

            ips.forEach(ip => {
                const url = `http://${ip.address}:${port}`;
                html += `
                    <div class="net-ip-box">
                        <div>
                            <div style="font-size:0.75rem; opacity:0.7; font-weight:700;">OFİS AĞINDAKİ ARKADAŞLARINIZ İÇİN (${ip.name})</div>
                            <div class="net-ip-text">${url}</div>
                        </div>
                        <button class="btn-copy" onclick="copyToClipboard('${url}', this)">Kopyala</button>
                    </div>
                `;
            });

            if (ips.length === 0) {
                const currentUrl = window.location.origin;
                html += `
                    <div class="net-ip-box">
                        <div>
                            <div style="font-size:0.75rem; opacity:0.7; font-weight:700;">AĞ BAĞLANTISI</div>
                            <div class="net-ip-text">${currentUrl}</div>
                        </div>
                        <button class="btn-copy" onclick="copyToClipboard('${currentUrl}', this)">Kopyala</button>
                    </div>
                `;
            }

            list.innerHTML = html;
        }

        function copyToClipboard(text, btnEl) {
            navigator.clipboard.writeText(text).then(() => {
                const old = btnEl.textContent;
                btnEl.textContent = 'Kopyalandı! ✓';
                btnEl.style.backgroundColor = '#2ed573';
                setTimeout(() => {
                    btnEl.textContent = old;
                    btnEl.style.removeProperty('background-color');
                }, 1500);
                showToast('Bağlantı linki panoya kopyalandı.');
            }).catch(() => {
                prompt('Bağlantı adresi:', text);
            });
        }

        function openNetworkModal() {
            renderNetworkIpList();
            initSupabaseSync();
            document.getElementById('network-modal-overlay').style.display = 'flex';
        }

        function closeNetworkModal(e) {
            if (!e || e.target === document.getElementById('network-modal-overlay') || e.type === 'click') {
                document.getElementById('network-modal-overlay').style.display = 'none';
            }
        }

        function exportDatabaseJson() {
            const data = {
                projects: projects,
                officeNotes: officeNotes,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ofis_proje_yedek_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Veritabanı yedeği indirildi.');
        }

        function triggerJsonImport() {
            const inp = document.getElementById('json-import-input');
            if (inp) {
                inp.value = '';
                inp.click();
            }
        }

        function handleJsonImport(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    let importedProjects = null;
                    let importedNotes = null;
                    if (Array.isArray(parsed)) {
                        importedProjects = parsed;
                    } else if (parsed && typeof parsed === 'object') {
                        importedProjects = parsed.projects || parsed.mimzProjects || null;
                        importedNotes = parsed.officeNotes || parsed.office_notes || parsed.mimzOfficeNotes || null;
                    }

                    if (!importedProjects && !importedNotes) {
                        alert('Geçersiz yedek dosyası formatı.');
                        return;
                    }

                    if (confirm('Yedek dosyasındaki veriler içe aktarılacak ve mevcut verileriniz güncellenecektir. Onaylıyor musunuz?')) {
                        if (importedProjects && Array.isArray(importedProjects)) {
                            projects = importedProjects;
                            saveProjects();
                        }
                        if (importedNotes && Array.isArray(importedNotes)) {
                            officeNotes = importedNotes;
                            saveOfficeNotes();
                        }
                        refreshAllViews();

                        if (isSupabaseActive && supabaseClient) {
                            await uploadLocalDataToSupabase(false);
                            showToast('✅ Veriler yüklendi ve Supabase bulutuna eşitlendi!', 'info');
                        } else {
                            showToast('✅ Veriler başarıyla içe aktarıldı!', 'info');
                        }
                    }
                } catch (err) {
                    alert('Dosya okunamadı veya JSON formatı hatalı: ' + err.message);
                }
            };
            reader.readAsText(file);
        }

        function migrateLocalToRemote(force = false) {
            if (!confirm('Bu tarayıcıdaki yerel veriler sunucudaki ortak veritabanına yüklenecektir. Devam edilsin mi?')) return;
            const localP = JSON.parse(localStorage.getItem('mimzProjects') || '[]');
            const localN = JSON.parse(localStorage.getItem('mimzOfficeNotes') || '[]');
            fetch('/api/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projects: localP, officeNotes: localN, force: force })
            }).then(r => r.json()).then(res => {
                if (res.success) {
                    showToast('Veriler sunucuya aktarıldı!', 'info');
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    showToast('Aktarım yapılamadı: ' + res.message, 'info');
                }
            }).catch(e => {
                showToast('Hata: ' + e.message, 'info');
            });
        }
