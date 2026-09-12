# 🏢 Mimari Proje & Ofis Görev Arşivi - Çok Kullanıcılı Ağ Kullanım Kılavuzu

Bu sistem, ofisinizdeki tüm çalışma arkadaşlarının **aynı yerel ağ (Wi-Fi veya Ethernet kablosu)** üzerinden eşzamanlı olarak aynı mimari föylere, yapılacaklar listelerine ve ofis notlarına erişmesini sağlar.

---

## 🚀 1. Sistemi Başlatma (Ana Bilgisayar / Sunucu)

1. Proje klasöründeki **`Baslat.bat`** dosyasına çift tıklayın.
2. Açılan siyah pencere otomatik olarak yerel sunucuyu kurup başlatacak ve varsayılan tarayıcınızda uygulamayı açacaktır:
   - **Bu Bilgisayardan Giriş:** `http://localhost:3000`
3. Siyah konsol penceresinde çalışma arkadaşlarınız için ağ linki belirecektir. Örneğin:
   ```
   👉 http://192.168.1.53:3000
   ```
   *(Pencere açık kaldığı sürece ağdaki herkes bağlanabilir).*

---

## 👥 2. Çalışma Arkadaşlarınızın Bağlanması

1. Çalışma arkadaşınızın bilgisayarında (veya tablet/telefonunda) tarayıcısını (Chrome, Edge, Firefox vb.) açın.
2. Adres çubuğuna yukarıdaki linki yazın (örneğin: `http://192.168.1.53:3000`).
3. Hepsi bu kadar! Herkes anında ortak panoya bağlanır.

> [!TIP]
> **Hızlı Link Kopyalama:** Uygulamanın sağ üst köşesindeki **🟢 Ağda Canlı** rozetine tıkladığınızda, ofis içi paylaşım linkini tek tıkla kopyalayabileceğiniz bir pencere açılır.

---

## ⚡ 3. Canlı (Real-Time) Senkronizasyon Özellikleri

* **Eşzamanlı Düzenleme:** Biri bir projeyi işaretlediğinde, yeni madde eklediğinde, sildiğinde veya not yazdığında, diğer tüm arkadaşların ekranı **sayfayı yenilemeye gerek kalmadan canlı olarak** güncellenir.
* **Aktif Kullanıcı Sayacı:** Sağ üstteki rozette şu anda ağda kaç kişinin bağlı olduğu anlık olarak görünür (örn. `Ağda Canlı (3 Kullanıcı)`).
* **Veri Güvenliği ve Yedekleme:** 
  * Tüm projeler ve notlar ana bilgisayardaki `data/database.json` dosyasında saklanır.
  * Her kayıtta otomatik olarak `data/database.backup.json` yedeği alınır.
  * İstenildiği zaman arayüzdeki ağ modalından **"Verileri Yedekle (JSON)"** butonuna basılarak tek tıkla dosya indirilebilir.
* **Çevrimdışı / Çift Mod:** Eğer sunucu kapalıyken `mymim111.html` doğrudan açılırsa, yerel modda (`localStorage`) çalışmaya devam eder; hiçbir veri kaybolmaz.

---

## 🛠️ 4. Sıkça Sorulan Sorular

* **Diğer bilgisayarlar bağlanamıyor, ne yapmalıyım?**
  * Her iki bilgisayarın da aynı Wi-Fi ya da ofis ağına bağlı olduğundan emin olun.
  * Windows Güvenlik Duvarı (Firewall) ilk açılışta izin isterse *"Özel ağlarda erişime izin ver"* seçeneğini onaylayın.
* **Sunucu bilgisayarını değiştirebilir miyiz?**
  * Evet! `ofis proje` klasörünü yeni bilgisayara kopyalayıp orada `Baslat.bat` çalıştırmanız yeterlidir.
