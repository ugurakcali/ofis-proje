/* ===== MİMZ OFİS - PARILTI & SPARKLE FİZİK MOTORU ===== */
        /* ==========================================================
           BEYAZ SİMLİ IŞILTI EFEKT MOTORU (GLITTER & SPARKLE ENGINE)
           - Mouse gezinirken beyaz simli ışıltı ve yıldız izi (Mouse Trail)
           - To-Do / Klasör kartlarına tıklayınca saçılarak patlayan ışıltı (Burst)
           - Her komutta (ekleme, silme, tamamlama, sıralama vb.) çevreye dağılan ışıltı
           ========================================================== */
        const sparkleCanvas = document.getElementById('sparkle-canvas');
        const sparkleCtx = sparkleCanvas ? sparkleCanvas.getContext('2d') : null;

        let sparkleParticles = [];
        let isSparkleAnimating = false;
        let lastMouseX = window.innerWidth / 2;
        let lastMouseY = window.innerHeight / 2;
        let lastTrailTime = 0;

        function isMobileScreen() {
            return window.innerWidth <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        }

        function resizeSparkleCanvas() {
            if (!sparkleCanvas || !sparkleCtx) return;
            if (isMobileScreen()) {
                sparkleCanvas.style.display = 'none';
                return;
            }
            sparkleCanvas.style.display = 'block';
            const dpr = window.devicePixelRatio || 1;
            sparkleCanvas.width = Math.floor(window.innerWidth * dpr);
            sparkleCanvas.height = Math.floor(window.innerHeight * dpr);
            sparkleCanvas.style.width = window.innerWidth + 'px';
            sparkleCanvas.style.height = window.innerHeight + 'px';
            sparkleCtx.setTransform(1, 0, 0, 1, 0, 0);
            sparkleCtx.scale(dpr, dpr);
        }
        window.addEventListener('resize', resizeSparkleCanvas);
        resizeSparkleCanvas();

        // 4 sivri uçlu elmas pırıltı yıldızı (✦) çizimi
        function drawSparkleStar(ctx, cx, cy, spikes, outerRadius, innerRadius, rotation) {
            let rot = (Math.PI / 2) * 3 + rotation;
            let step = Math.PI / spikes;
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                let x = cx + Math.cos(rot) * outerRadius;
                let y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
        }

        class SparkleParticle {
            constructor(x, y, options = {}) {
                this.x = x;
                this.y = y;
                this.type = options.type || (Math.random() < 0.45 ? 'star' : 'dust');

                const speed = options.speed !== undefined ? options.speed : (0.6 + Math.random() * 2.8);
                const angle = options.angle !== undefined ? options.angle : (Math.random() * Math.PI * 2);
                this.vx = options.vx !== undefined ? options.vx : Math.cos(angle) * speed;
                this.vy = options.vy !== undefined ? options.vy : Math.sin(angle) * speed;

                this.friction = options.friction !== undefined ? options.friction : 0.94;
                this.gravity = options.gravity !== undefined ? options.gravity : 0.04;

                this.maxSize = options.size || (this.type === 'star' ? (3.5 + Math.random() * 4.5) : (1.6 + Math.random() * 3.0));
                this.size = this.maxSize;
                this.maxLife = options.life || (25 + Math.random() * 32);
                this.life = this.maxLife;

                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.12;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.twinkleSpeed = 0.15 + Math.random() * 0.3;

                // Saf beyaz ve elmas ışıltısı tonları
                const randColor = Math.random();
                if (randColor < 0.75) {
                    this.baseColor = '255, 255, 255'; // Saf kristal beyaz
                } else if (randColor < 0.9) {
                    this.baseColor = '240, 248, 255'; // Elmas buzu
                } else {
                    this.baseColor = '255, 250, 235'; // Işıltılı platin beyaz
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;

                this.rotation += this.rotSpeed;
                this.life--;

                const progress = this.life / this.maxLife;
                this.size = this.maxSize * Math.max(0, progress);
                return this.life > 0;
            }

            draw(ctx) {
                if (this.size <= 0 || !ctx) return;
                const progress = this.life / this.maxLife;
                // Simli parıldama efekti (twinkle)
                const shimmer = 0.65 + 0.35 * Math.sin(this.twinklePhase + (this.maxLife - this.life) * this.twinkleSpeed);
                const alpha = Math.min(1, Math.max(0, progress * shimmer));

                ctx.save();
                ctx.translate(this.x, this.y);

                // Beyaz simli parlaklık haresi (glow)
                ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.95})`;
                ctx.shadowBlur = Math.max(3, this.size * 2);

                if (this.type === 'star') {
                    ctx.rotate(this.rotation);
                    ctx.fillStyle = `rgba(${this.baseColor}, ${alpha})`;
                    // 4 sivri uçlu narin elmas yıldızı
                    drawSparkleStar(ctx, 0, 0, 4, this.size, this.size * 0.22, 0);
                    ctx.fill();

                    // Yıldızın merkezinde ultra beyaz çekirdek pırıltısı
                    if (this.size > 2.5) {
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`;
                        ctx.fill();
                    }
                } else {
                    // Minik sim tanesi / elmas tozu
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.baseColor}, ${alpha})`;
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        /* KALICI ARKA PLAN TOZ IŞILTISI (AMBIENT GLITTER DUST)
           Ekranda hafifçe süzülen, sürekli var olan minik ışıltılı toz taneleri. */
        class AmbientDustParticle {
            constructor() { this.reset(true); }
            reset(initial) {
                this.x = Math.random() * window.innerWidth;
                this.y = initial ? Math.random() * window.innerHeight : window.innerHeight + 8;
                this.size = 0.7 + Math.random() * 2.1;
                this.speedY = -(0.05 + Math.random() * 0.22);
                this.speedX = (Math.random() - 0.5) * 0.1;
                this.driftPhase = Math.random() * Math.PI * 2;
                this.driftSpeed = 0.004 + Math.random() * 0.008;
                this.driftAmp = 0.15 + Math.random() * 0.35;
                this.baseAlpha = 0.15 + Math.random() * 0.45;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.twinkleSpeed = 0.01 + Math.random() * 0.025;
                this.isStar = Math.random() < 0.18;
            }
            update() {
                this.driftPhase += this.driftSpeed;
                this.twinklePhase += this.twinkleSpeed;
                this.x += this.speedX + Math.sin(this.driftPhase) * this.driftAmp * 0.02;
                this.y += this.speedY;
                if (this.y < -8 || this.x < -8 || this.x > window.innerWidth + 8) {
                    this.reset(false);
                }
            }
            draw(ctx) {
                const shimmer = 0.5 + 0.5 * Math.sin(this.twinklePhase);
                const alpha = this.baseAlpha * shimmer;
                if (alpha <= 0.01) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                if (this.isStar) {
                    ctx.shadowColor = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.2)})`;
                    ctx.shadowBlur = this.size * 2.5;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    drawSparkleStar(ctx, 0, 0, 4, this.size * 1.4, this.size * 0.3, this.driftPhase);
                    ctx.fill();
                } else {
                    // Performans için (binlerce tane olduğundan) gölge/blur kullanılmıyor
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        let ambientDustParticles = [];
        const AMBIENT_DUST_COUNT = 4000;
        function initAmbientDust() {
            if (isMobileScreen()) {
                ambientDustParticles = [];
                return;
            }
            ambientDustParticles = [];
            for (let i = 0; i < AMBIENT_DUST_COUNT; i++) {
                ambientDustParticles.push(new AmbientDustParticle());
            }
        }
        initAmbientDust();

        function startSparkleLoopIfNeeded() {
            if (isMobileScreen()) return;
            if (!isSparkleAnimating) {
                isSparkleAnimating = true;
                requestAnimationFrame(sparkleAnimationStep);
            }
        }

        function sparkleAnimationStep() {
            if (!sparkleCtx || !sparkleCanvas || isMobileScreen()) return;
            sparkleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Kalıcı arka plan toz ışıltısı her karede çizilir
            for (let i = 0; i < ambientDustParticles.length; i++) {
                const d = ambientDustParticles[i];
                d.update();
                d.draw(sparkleCtx);
            }

            for (let i = sparkleParticles.length - 1; i >= 0; i--) {
                const p = sparkleParticles[i];
                if (p.update()) {
                    p.draw(sparkleCtx);
                } else {
                    sparkleParticles.splice(i, 1);
                }
            }

            // Toz ışıltısı kalıcı olduğu için döngü hiç durmadan devam eder
            requestAnimationFrame(sparkleAnimationStep);
        }

        function spawnSparkle(x, y, options = {}) {
            if (isMobileScreen()) return;
            if (sparkleParticles.length > 320) {
                sparkleParticles.splice(0, 15);
            }
            sparkleParticles.push(new SparkleParticle(x, y, options));
            startSparkleLoopIfNeeded();
        }

        // Kalıcı toz ışıltısı animasyonunu hemen başlat
        startSparkleLoopIfNeeded();

        function isWritingModalOpen() {
            const pModal = document.getElementById('modal-overlay');
            if (pModal && pModal.style.display === 'flex') return true;
            const nModal = document.getElementById('note-modal-overlay');
            if (nModal && nModal.style.display === 'flex') return true;
            const netModal = document.getElementById('network-modal-overlay');
            if (netModal && netModal.style.display === 'flex') return true;
            return false;
        }

        /* 1. MOUSE GEZİNDİKÇE BEYAZ SİMLİ IŞILTI (MOUSE TRAIL) */
        window.addEventListener('mousemove', (e) => {
            if (isWritingModalOpen() || (e.target && e.target.closest && e.target.closest('#modal-content, .note-modal-box, .net-modal-box'))) {
                return;
            }
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            const now = performance.now();
            if (now - lastTrailTime > 22) {
                lastTrailTime = now;
                const count = Math.random() < 0.65 ? 1 : 2;
                for (let i = 0; i < count; i++) {
                    spawnSparkle(
                        e.clientX + (Math.random() - 0.5) * 10,
                        e.clientY + (Math.random() - 0.5) * 10,
                        {
                            type: Math.random() < 0.45 ? 'star' : 'dust',
                            size: 2.2 + Math.random() * 3.8,
                            vx: (Math.random() - 0.5) * 1.1,
                            vy: (Math.random() - 0.5) * 1.1 + 0.25,
                            gravity: 0.03,
                            friction: 0.95,
                            life: 22 + Math.random() * 26
                        }
                    );
                }
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isMobileScreen()) return;
            if (isWritingModalOpen() || (e.target && e.target.closest && e.target.closest('#modal-content, .note-modal-box, .net-modal-box'))) {
                return;
            }
            if (e.touches && e.touches[0]) {
                const t = e.touches[0];
                lastMouseX = t.clientX;
                lastMouseY = t.clientY;
                spawnSparkle(t.clientX, t.clientY, {
                    type: Math.random() < 0.5 ? 'star' : 'dust',
                    size: 2.6 + Math.random() * 3.2,
                    life: 25
                });
            }
        }, { passive: true });

        /* 2 & 3. SAÇILARAK DAĞILAN IŞILTI PATLAMASI (BURST / SCATTER) */
        function triggerSparkleBurst(x, y, count = 28, options = {}) {
            if (isMobileScreen()) return;
            const originX = (x !== undefined && x !== null) ? x : lastMouseX;
            const originY = (y !== undefined && y !== null) ? y : lastMouseY;
            const baseSpeed = options.burstSpeed || 4.2;

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (0.25 + Math.random() * 0.95) * baseSpeed;
                const isStar = Math.random() < 0.48;

                spawnSparkle(originX, originY, {
                    type: isStar ? 'star' : 'dust',
                    size: isStar ? (3.6 + Math.random() * 4.6) : (2.0 + Math.random() * 3.2),
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    friction: 0.93,
                    gravity: 0.05,
                    life: 30 + Math.random() * 35
                });
            }
        }

        // Bir elemanın kenarları boyunca dolanan yoğun ışıltı efekti
        // (örn. bir to-do maddesine tıklanınca etrafını sarar)
        function triggerFrameSparkle(el, count = 42) {
            if (isMobileScreen()) return;
            if (!el || !el.getBoundingClientRect) return;
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const perimeter = 2 * (rect.width + rect.height);

            for (let i = 0; i < count; i++) {
                const distance = (i / count) * perimeter + Math.random() * 6;
                let px, py;
                if (distance < rect.width) {
                    px = rect.left + distance; py = rect.top;
                } else if (distance < rect.width + rect.height) {
                    px = rect.right; py = rect.top + (distance - rect.width);
                } else if (distance < rect.width * 2 + rect.height) {
                    px = rect.right - (distance - rect.width - rect.height); py = rect.bottom;
                } else {
                    px = rect.left; py = rect.bottom - (distance - rect.width * 2 - rect.height);
                }
                px += (Math.random() - 0.5) * 8;
                py += (Math.random() - 0.5) * 8;

                spawnSparkle(px, py, {
                    type: Math.random() < 0.5 ? 'star' : 'dust',
                    size: 1.8 + Math.random() * 3.2,
                    vx: (Math.random() - 0.5) * 0.7,
                    vy: (Math.random() - 0.5) * 0.7 - 0.15,
                    friction: 0.95,
                    gravity: 0.015,
                    life: 35 + Math.random() * 35
                });
            }
        }

        // Herhangi bir komut/işlem tetiklendiğinde ışıltıyı çevreye dağıtır
        function triggerSparkleBurstOnAction(source = null) {
            if (isMobileScreen()) return;
            if (typeof isWritingModalOpen === 'function' && isWritingModalOpen()) return;
            let burstX = lastMouseX;
            let burstY = lastMouseY;

            if (source && source.getBoundingClientRect) {
                const rect = source.getBoundingClientRect();
                burstX = rect.left + rect.width / 2;
                burstY = rect.top + rect.height / 2;
            } else if (document.activeElement && document.activeElement !== document.body && document.activeElement.getBoundingClientRect) {
                const rect = document.activeElement.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    burstX = rect.left + rect.width / 2;
                    burstY = rect.top + rect.height / 2;
                }
            }
            triggerSparkleBurst(burstX, burstY, 28, { burstSpeed: 4.2 });
        }

        // Genel tıklama yakalayıcı: Her komut butonunda, klasörde ve checkbox'ta ışıltıyı saçar
        document.addEventListener('click', (e) => {
            if (isMobileScreen()) return;
            // Yazı yazma ve düzenleme modalları içinde ışıltı patlatma (yazı okumayı engellememek için)
            if ((typeof isWritingModalOpen === 'function' && isWritingModalOpen()) || e.target.closest('#modal-content, .note-modal-box, .net-modal-box')) {
                return;
            }
            const folderCard = e.target.closest('.project-card, .project-folder-badge, .filter-tab, .btn-back, .desktop-folder-card');
            if (folderCard) {
                // Klasör ve To-Do kartlarına tıklandığında yoğun saçılarak efektlenen ışıltı
                triggerSparkleBurst(e.clientX, e.clientY, 36, { burstSpeed: 5.2 });
                triggerFrameSparkle(folderCard, 30);
                return;
            }
            const taskItemEl = e.target.closest('.task-item');
            if (taskItemEl) {
                // Bir göreve (to-do) basıldığında etrafını saran yoğun ışıltı
                triggerSparkleBurst(e.clientX, e.clientY, 30, { burstSpeed: 4.4 });
                triggerFrameSparkle(taskItemEl, 44);
                return;
            }
            const interactive = e.target.closest('button, input[type="checkbox"], .color-dot, .btn-task-action, .task-drag-handle, .task-checkbox, .card-pip-btn');
            if (interactive) {
                triggerSparkleBurst(e.clientX, e.clientY, 24, { burstSpeed: 3.8 });
            }
        }, true);
