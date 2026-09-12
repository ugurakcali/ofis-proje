# 🏢 Mimari Proje & Ofis Görev Arşivi - Tam Kurulum ve Kullanım Kılavuzu

Bu proje artık hem **GitHub Pages** üzerinden internette barındırılabilir, hem **Supabase** bulut veritabanı ile dünyanın her yerinden anlık eşitlenebilir, hem de isterseniz **ofis içi yerel ağda (LAN)** çalıştırılabilir.

---

## ☁️ 1. YOL (ÖNERİLEN): GitHub Pages + Supabase Bulut Veritabanı

Bu yöntemle ofisteki hiçbir bilgisayarı açık bırakmaya gerek kalmaz. Herkes telefonundan, evinden veya ofisinden aynı linke girip çalışabilir.

### Adım 1: Supabase Projesini Açma (1 Dakika)
1. [supabase.com](https://supabase.com) adresine gidin ve ücretsiz bir hesap açıp **"New Project"** butonuna basın.
2. Projeniz açılınca sol menüdeki **"SQL Editor"** sekmesine tıklayın.
3. Proje klasörünüzdeki [`supabase_setup.sql`](supabase_setup.sql) dosyasının içeriğini kopyalayıp buraya yapıştırın ve sağ alttaki **"Run"** butonuna basın. (Böylece `ofis_data` tablosu ve canlı senkronizasyon otomatik kurulur).
4. Sol alttaki **Project Settings (Çark simgesi) -> Data API** sayfasına gidin:
   - **Project URL** (örnek: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public API Key** (örnek: `eyJhbGciOi...`)
   bilgilerini kopyalayın.

### Adım 2: Anahtarları Kaydetme
* **İster dosya ile:** Proje klasöründeki [`supabase-config.js`](supabase-config.js) dosyasını açıp tırnakların içine yapıştırın.
* **İster ekrandan:** Uygulamayı açtığınızda sağ üstteki **"Bulut / Ağ Ayarları"** rozetine tıklayın, URL ve Key'i yapıştırıp **"Buluta Bağlan & Kaydet"** deyin.

---

### Adım 3: GitHub'a Yükleme ve GitHub Pages ile Yayına Alma
1. [github.com](https://github.com) üzerinde oturum açın ve **"New repository"** diyerek yeni bir repo oluşturun (örn: `ofis-proje`, Public olarak seçin).
2. Bu klasörde bir terminal (PowerShell) açıp şu iki komutu çalıştırın (kendi kullanıcı adınızı ve repo adınızı yazın):
   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
   git push -u origin main
   ```
3. GitHub reponuzun sayfasında **Settings -> Pages** sekmesine gidin:
   - **Source:** `Deploy from a branch` seçin.
   - **Branch:** `main` ve `/ (root)` seçip **Save** butonuna tıklayın.
4. 1-2 dakika içinde size bir web linki verilecektir:
   ```
   👉 https://KULLANICI_ADINIZ.github.io/REPO_ADINIZ/
   ```
5. Artık ofisteki tüm arkadaşlarınız bu linki tarayıcılarına kaydedip her yerden canlı çalışabilir!

---

## 🏢 2. YOL: Ofis İçi Yerel Ağ (LAN Sunucusu)

İnternet kullanmak istemiyorsanız, sadece ofisteki Wi-Fi/kablo üzerinden çalışmak isterseniz:

1. Ana bilgisayarda [`Baslat.bat`](Baslat.bat) dosyasına çift tıklayın.
2. Konsolda çıkan linki çalışma arkadaşlarınıza iletin:
   ```
   👉 http://192.168.1.53:3000
   ```
3. Veriler tamamen ana bilgisayardaki `data/database.json` dosyasında tutulur.

---

## ✨ Özellikler ve İpuçları
* **Canlı Rozet:** Sağ üstteki rozet Supabase'e bağlıyken `🟢 Supabase Bulut Canlı` gösterir.
* **Always-on-Top PiP:** Görev föylerini AutoCAD/Revit üzerinde mini pencere olarak sabitleyebilirsiniz.
* **Veri Yedekleme:** İstediğiniz zaman sağ üstteki rozete basıp **"Verileri Yedekle (JSON)"** diyerek tüm panonun yedeğini indirebilirsiniz.
