/* ===== MİMZ OFİS - PROJELER & GÖREVLER MOTORU ===== */
const fs = require('fs');
const path = require('path');

const RUHSAT_DEFAULT_TEMPLATE = {
    "A": {
        title: "A. GEREKEN EVRAKLAR (Kapaklı Dosya İçerisinde)",
        items: [
            { no: "1", desc: "Önonay Dilekçesi", note: "", checked: false },
            { no: "2", desc: "İmar Durum Belgesi (Plan notları ve şema olan yerlerde ölçüleri bulunan)", note: "", checked: false },
            { no: "3", desc: "Fen İşleri Müdürlüğü'nden alınmış onaylı Yol Kotu Tutanağı", note: "", checked: false },
            { no: "4", desc: "Tapu Kayıt Sureti (Son 1 aylık)", note: "", checked: false },
            { no: "5", desc: "Aplikasyon Krokisi", note: "", checked: false },
            { no: "6", desc: "Onaylı Plankote (Çevreleyen parseller ve yol kotu tutanağı ile irtibatlı)", note: "", checked: false },
            { no: "7", desc: "Ölçü Krokisi", note: "", checked: false },
            { no: "8", desc: "Numarataj Krokisi", note: "", checked: false },
            { no: "9", desc: "Paylaşım Krokili Kat Karşılığı İnşaat Sözleşmesi", note: "", checked: false },
            { no: "10", desc: "Mimari Proje CD'si (DWG veya DXF formatında)", note: "", checked: false }
        ]
    },
    "B": {
        title: "B. MİMARİ PROJE PAFTA DÜZENİ",
        items: [
            { no: "1", desc: "Tüm bilgilerin yer aldığı proje kapağı hazırlanmalıdır.", note: "", checked: false },
            { no: "2", desc: "İtfaiye onayı için ayrılmış alan paftada bulunmalıdır.", note: "", checked: false },
            { no: "3", desc: "İmar durum belgesi paftaya işlenmelidir.", note: "", checked: false },
            { no: "4", desc: "Numarataj bilgisi / krokisi eklenmelidir.", note: "", checked: false },
            { no: "5", desc: "Yol kotu tutanağı (Fen İşleri Müdürlüğü onaylı) paftada yer almalıdır.", note: "", checked: false },
            { no: "6", desc: "Liste beyanı bulunmalıdır.", note: "", checked: false },
            { no: "7", desc: "Bağımsız Bölüm net m² ve brüt m² tabloları eksiksiz eklenmelidir.", note: "", checked: false },
            { no: "8", desc: "Belediye hesapları için ayrılmış alan bırakılmalıdır.", note: "", checked: false },
            { no: "9", desc: "Otopark hesabı tablosu ve detayları yer almalıdır.", note: "", checked: false },
            { no: "10", desc: "Ağaç hesabı yapılmalı ve paftada gösterilmelidir.", note: "", checked: false },
            { no: "11", desc: "TAKS / KAKS (Emsal) alanı ve Sığınak hesabı net şekilde gösterilmelidir.", note: "", checked: false }
        ]
    },
    "C": {
        title: "C. 1. VAZİYET PLANI (1/200)",
        items: [
            { no: "1", desc: "Kuzey işareti net olarak gösterilecektir.", note: "", checked: false },
            { no: "2", desc: "Tabii zemin kotları, bitmiş zemin kotları ile çatı saçağı ve mahyası üzerine kotlar yazılacaktır.", note: "", checked: false },
            { no: "3", desc: "Vaziyet planında kesinlikle ölçü verilmeyecektir (Kural kontrolü).", note: "", checked: false },
            { no: "4", desc: "Tasarlanan bina kütlesi dış konturlarıyla ve yerleşme planındaki konumuna uygun olarak gösterilecektir.", note: "", checked: false },
            { no: "5", desc: "Yaya ve taşıt giriş çıkışları, ulaşım aksları, yollar, komşu parseller, yangın tahliye sistemleri, bina giriş çıkışları işlenecektir.", note: "", checked: false },
            { no: "6", desc: "Birden fazla blok var ise: Bloklara isim (A, B, C... harfleriyle) ve kot verilecek, blok giriş çıkışları belirtilecektir.", note: "", checked: false },
            { no: "7", desc: "Otopark yönetmeliğine uygun olarak parsel içinde düzenlenen otopark yerleri çizilecektir.", note: "", checked: false },
            { no: "8", desc: "Ağaçlar ve peyzaj / yeşil alanlar gösterilecektir.", note: "", checked: false },
            { no: "9", desc: "Araç rampaları, bekçi/güvenlik kulübeleri, havuz, foseptik vb. (var ise) işlenecektir.", note: "", checked: false },
            { no: "10", desc: "Bahçe duvarı detayı (yol cephesinde max 0.50m) çizilecektir.", note: "", checked: false },
            { no: "11", desc: "Arazide 3 metreden fazla yapılan betonarme duvarlar 'İSTİNAT DUVARI' olarak tanımlanacak, uzunluk ve yüksekliği belirtilecek, ruhsata esas istinat duvarı projeleri hazırlanacaktır.", note: "", checked: false }
        ]
    },
    "D": {
        title: "D. 2. YERLEŞİM PLANI (1/200)",
        items: [
            { no: "1", desc: "Kuzey işareti gösterilecektir.", note: "", checked: false },
            { no: "2", desc: "Arazide önemli noktalarda kotlar gösterilecektir.", note: "", checked: false },
            { no: "3", desc: "Yapının (havuz, su deposu, sığınak, otopark vb. dahil) arazi üzerindeki konumu, köşe noktalarının araziye dik ve arazi köşelerine ölçüleri, zemin kat izdüşümü dışında kalan bodrum katları ve üst kat çıkma mesafeleri nokta nokta gösterilecektir. (20cm motif ve yangın merdiveni yapı yaklaşma sınırını hiçbir şekilde geçemez!)", note: "", checked: false },
            { no: "4", desc: "Geçici-Madde 3: Teşekkülât kullanılması durumunda sağındaki veya solundaki parselde bulunan yapıların yerleşimi ve çıkmaları nokta nokta gösterilecektir.", note: "", checked: false },
            { no: "5", desc: "Parsel içinde düzenlenen otopark yerleri belirtilecek ve ölçülendirilecektir. Varsa araç rampalarının eğimi, genişliği ve uzunluğu yazılacaktır.", note: "", checked: false },
            { no: "6", desc: "Binaların dış kontur ölçüleri yazılacaktır. Birden fazla blok varsa: Blok isimleri (A, B, C...), kat sayısı, saçak ve subasman kotları, giriş çıkışları yazılacaktır.", note: "", checked: false },
            { no: "7", desc: "Binanın parsel sınırlarına kadar iki kesit silüeti çizilecektir (Arazinin topoğrafik yapısını ve binaların kotlandırıldığını gösteren).", note: "", checked: false },
            { no: "8", desc: "Arazide 3 metreden fazla yapılan betonarme duvarlar İSTİNAT DUVARI olarak tanımlanacak, uzunluğu ve yüksekliği belirtilecektir.", note: "", checked: false }
        ]
    },
    "E": {
        title: "E. 3. HAFRİYAT PLANI (1/200)",
        items: [
            { no: "1", desc: "Projeye göre tesviye edilen arazinin kazı ve dolgu alanlarını gösteren plan olacaktır. Bina konturu ve dışındaki çalışma alanlarının ölçüleri ve kotları yazılacaktır.", note: "", checked: false },
            { no: "2", desc: "Hafriyard / kazı ve dolgu alanları ile hacimleri hesaplanacak, toprak hesabı paftada verilecektir.", note: "", checked: false },
            { no: "3", desc: "3 metreden yüksek betonarme istinat duvarları tanımlanacak, ölçülendirilecek ve ruhsata esas projeleri eklenecektir.", note: "", checked: false }
        ]
    },
    "F1": {
        title: "F. PLANLAR (1/50) - 1. BODRUM KAT",
        items: [
            { no: "1", desc: "Bina çekirdeğinin (ortak merdiven ve asansörün) tüm bodrum katlara ulaştırılması zorunludur.", note: "", checked: false },
            { no: "2", desc: "Bodrum katta zemin kat izdüşümü gösterilmelidir. (Zemin kat izdüşümü dışında sığınak ve otopark gösterilebilir.)", note: "", checked: false },
            { no: "3", desc: "Varsa sığınak ihtiyacı yönetmeliğe uygun ayrılacak ve sığınak hesabı yapılacaktır.", note: "", checked: false },
            { no: "4", desc: "Kuranglezler: Derinlik max 2.00m, genişlik min 0.80m - max 1.20m olacaktır. Binanın hiçbir cephesinde mütemadiyen tesis edilemez. Yapıldığı pencere genişliğini 0.50m'den fazla geçemez.", note: "", checked: false },
            { no: "5", desc: "Ticari alanlarda yapılan ve ticari olarak kullanılan bodrum katlara engelli erişimi zorunlu olarak sağlanacaktır.", note: "", checked: false },
            { no: "6", desc: "Hidrofor ve su deposu: İçinde kolon vb. inşaat elemanları yapılamaz ve kesinlikle ıslak hacim altında konumlandırılamaz.", note: "", checked: false }
        ]
    },
    "F2": {
        title: "F. PLANLAR (1/50) - 2. KAT PLANLARI",
        items: [
            { no: "1", desc: "Bitişik binalarda dilatasyon derzleri her katta gösterilecektir (5 cm olacaktır).", note: "", checked: false },
            { no: "2", desc: "Engelli rampaları: Genişlik min 1.00m. Subasman kotu 0.50m olan yapılarda %7 eğim, 1.00m olanlarda %6 eğim. Yönetmeliğe uygun korkuluk. Engelli platformu: merdivene bitişik dar kenar min 0.90m, alan min 1.20m².", note: "", checked: false },
            { no: "3", desc: "Bina Girişi ve Kapısı: Giriş koridoru genişliği ana merdiven/asansöre kadar min 1.50m (Umumi binalarda min 2.20m). Giriş saçağı işlenecek. Merdiven altı şakulü min 2.20m olacak.", note: "", checked: false },
            { no: "4", desc: "Zemin katlarda üst kat çıkma izleri nokta nokta işlenecektir.", note: "", checked: false },
            { no: "5", desc: "Zemin Teraslar: Otopark olması durumunda arka bahçe sınırına max 5.00m, yan bahçe sınırına max 3.00m yaklaşabilir. Korkuluk yapılacaktır. Terasların üzeri kapalı olamaz.", note: "", checked: false },
            { no: "6", desc: "1. normal kat planında zemin kat izleri, çatı katı planında normal kat izleri nokta nokta işlenecektir.", note: "", checked: false },
            { no: "7", desc: "Ortak merdiven kolu genişliği: Konutlarda min 1.20m, diğer yapılarda min 1.50m. Konut içi bağımsız bölüm merdivenleri min 1.00m (ahşap olamaz). Ortak merdiven tüm katlara ulaşmalıdır.", note: "", checked: false },
            { no: "8", desc: "Merdiven Rıht Yüksekliği: Asansörlü binalarda max 0.18m, asansörsüz binalarda max 0.16m olacaktır.", note: "", checked: false },
            { no: "9", desc: "Merdiven basamak genişliği min 0.27m; balanslı merdivenlerde en dar kenar min 0.10m, basamak ortası min 0.27m olacaktır. Basamak uçları damlalıksız (çıkıntısız) olacaktır.", note: "", checked: false },
            { no: "10", desc: "Merdiven ölçüleri, basamak hesabı, merdiven ve sahanlık boyutları planlar üzerinde eksiksiz yazılacaktır.", note: "", checked: false },
            { no: "11", desc: "Hava bacaları her türlü binada min 0.60m x 0.60m (0.36m²) olacaktır. Hiçbir yapı elemanı ile daraltılamaz.", note: "", checked: false },
            { no: "12", desc: "Işıklık ölçüleri: 1-6 katlı binalarda dar kenar min 1.50m, alan min 4.50m². 7 ve üzeri katlı binalarda dar kenar min 2.00m, alan min 9.00m² olacaktır.", note: "", checked: false },
            { no: "13", desc: "Duman bacaları: Kaloriferli konutlarda 1 yaşam alanı ve mutfaklarda birer adet; umumi binalarda her bağımsız bölümde birer adet olacaktır.", note: "", checked: false },
            { no: "14", desc: "Kullanım net alanı 2000 m² ve üzerinde olan yapılarda merkezi ısıtma sistemi yapılacaktır.", note: "", checked: false },
            { no: "15", desc: "Asansör Zorunluluğu: İmar planında kat adedi 3 olan binalarda asansör boşluğu bırakılmalı, 4 ve üzeri olanlarda asansör tesis edilmelidir. Umumi binalarda katlar alanı >800m² ve kat >1 ise min 1 asansör zorunlukdur.", note: "", checked: false },
            { no: "16", desc: "Asansör Kabin ve Boşluk Ölçüleri: Kabin dar kenarı min 1.20m, alanı min 1.80m² olacak şekilde asansör boşluğu en az 2.00m x 2.10m olacaktır.", note: "", checked: false },
            { no: "17", desc: "Yüksek Yapılarda Asansör: Saçak kotu 21.50m'yi geçince 2 asansör (biri min 2.00x2.10m, diğeri trafik hesabına göre min 1.60x1.60m). Saçak kotu 30.50m'de biri 2.00x2.10m, diğeri sedye asansörü (2.40x3.00m) olmalıdır. 10 kat ve üzeri binalarda en az biri dar kenar 1.20m, alan 2.52m², kapı net 1.10m olmalıdır.", note: "", checked: false },
            { no: "18", desc: "Asansör Sahanlık Genişliği: Sürgülü kapılarda en az 1.20m, dışa açılan kapılarda en az 1.50m olacaktır.", note: "", checked: false },
            { no: "19", desc: "Korkuluklar: Yükseklik min 1.10m olmalıdır. Can güvenliğini tehlikeye atmayan malzemeden yapılmalı, cam ise kırılmaz/dağılmaz olduğu projede belirtilmelidir.", note: "", checked: false },
            { no: "20", desc: "Kapı Genişlikleri: Bina giriş kapıları min 1.50m, bağımsız bölüm giriş kapıları min 1.00m, mahal kapıları min 0.90m, balkon kapılarından en az 1 tanesi min 0.90m (tuvalet kapıları min 0.80m).", note: "", checked: false },
            { no: "21", desc: "Kapalı Çıkmalar: Yol cephelerinde parsel sınırında kalmak ve yapı yaklaşma sınırından itibaren max 1.50m taşmak kaydıyla yapılabilir. Arka/yan bahçelerde parsel sınırına 3.00m'den fazla yaklaşmamak kaydıyla max 1.50m yapılabilir.", note: "", checked: false },
            { no: "22", desc: "Açık Çıkmalar (Balkonlar): Yol cephesinde max 1.50m taşabilir. Arka ve yan bahçelerde parsel sınırına 3.00m'den fazla yaklaşmamak kaydıyla max 1.50m taşabilir.", note: "", checked: false },
            { no: "23", desc: "Güneş Kırıcılar: Cephe estetiği göz önüne alınarak, hafif malzemeden, parsel sınırını taşmadan, kapalı mekân oluşturmadan max 0.50m'ye kadar yapılabilir.", note: "", checked: false },
            { no: "24", desc: "Kapıcı Dairesi Zorunluluğu: Katı yakıtlı konutlarda >40 dairede 1 adet, >80 dairede 2 adet. Diğer ısıtma sistemlerinde >60 dairede 1 adet, >150 dairede 2 adet.", note: "", checked: false },
            { no: "25", desc: "Kapıcı Dairesi Ölçüleri: En az brüt 50m² olacaktır. 2 yatak odası, 1 oturma odası, mutfak ve banyo bulunacaktır.", note: "", checked: false },
            { no: "26", desc: "Bekçi Odası ve Kontrol Kulübesi: İnşaat alanı >2000m² işyeri/bürolarda bekçi odası zorunludur.", note: "", checked: false },
            { no: "27", desc: "PAİ̇Y Madde 29 Minimum Piyes Ölçüleri Kontrolü (Oda: 12m², Yatak O.: 9m², Mutfak: 3.3m², Banyo: 3m², WC: 1.2m²)", note: "", checked: false },
            { no: "28", desc: "Her kat planında kesit geçirilen yerlerden kesit çizgisi ve bakış yönü gösterilecektir.", note: "", checked: false },
            { no: "29", desc: "Her mahallin içine, mahal ismi ve net m² alanı açıkça yazılacaktır.", note: "", checked: false },
            { no: "30", desc: "Projeye uygun harf ve sayılarla eksiksiz bir aks sistemi oluşturulacaktır.", note: "", checked: false },
            { no: "31", desc: "İnşai elemanlar (kolon, perde, duvar) ayrı taranacak veya koyulaştırılacaktır.", note: "", checked: false },
            { no: "32", desc: "Çamaşır/bulaşık makinesi, kombi vb. cihaz yerleri planlarda gösterilecektir.", note: "", checked: false },
            { no: "33", desc: "Islak hacimler tefriş edilecek, süzgeç yerleri ve eğimler belirtilecektir.", note: "", checked: false },
            { no: "34", desc: "Mahallerin duvar, döşeme ve tavan kaplama malzemeleri belirtilecektir.", note: "", checked: false },
            { no: "35", desc: "Merdiven detayı 1/20 ölçeğinde çizilecek; TSE standartlarına uygun korkuluklar gösterilecektir.", note: "", checked: false }
        ]
    },
    "F3": {
        title: "F. PLANLAR (1/50) - 3. ÇATI KATI VE ÇATI PLANI",
        items: [
            { no: "1", desc: "Çatı eğimi saçak ucundan hesaplanır. Mahya yüksekliği max 4.00m, eğim max %35 olabilir.", note: "", checked: false },
            { no: "2", desc: "Ayrık binalarda kırma, ikili bloklarda müşterek kırma çatı çözülecektir.", note: "", checked: false },
            { no: "3", desc: "Çatı Piyesi: Çatı eğimi içinde kalmak şartıyla alt bağımsız bölümle içeriden irtibatlı mekânlar yapılabilir.", note: "", checked: false },
            { no: "4", desc: "Çatı çıkmaları: Saçak çıkması yapılmayan binalarda max 1.00m, çıkma yapılanlarda max 0.50m.", note: "", checked: false },
            { no: "5", desc: "Tüm kotlar (mahya, saçak, teras) çatı planında yazılacaktır.", note: "", checked: false },
            { no: "6", desc: "Çatı meyilleri (yön ve % olarak), su toplama yerleri ve detayları işlenecektir.", note: "", checked: false },
            { no: "7", desc: "Gün ısı sistemi varsa kollektör yerleri, anten yerleri gösterilecektir.", note: "", checked: false },
            { no: "8", desc: "Göğebakana çıkış tanımlanmalı, duman tahliye şaftı gösterilmelidir.", note: "", checked: false },
            { no: "9", desc: "Parapet ve teras korkuluğu yüksekliği net 110 cm olacaktır.", note: "", checked: false },
            { no: "10", desc: "Çatı planında çatı konstrüksiyonu gösterilecek ve malzemeler belirtilecektir.", note: "", checked: false },
            { no: "11", desc: "Bacalar, şaftlar ve ışıklıkların tamamı çatı planında gösterilmelidir.", note: "", checked: false },
            { no: "12", desc: "Dubleks merdiveni genişliği min 90 cm olacak, basamak/rıht kontrol edilecektir.", note: "", checked: false }
        ]
    },
    "GH": {
        title: "G. DIŞ ÖLÇÜ & H. İÇ ÖLÇÜ KRİTERLERİ",
        items: [
            { no: "G1", desc: "Dış Ölçü 1. Sıra: Blok toplam dış ölçüsü (Emsal ölçüsü + 20cm motif).", note: "", checked: false },
            { no: "G2", desc: "Dış Ölçü 2. Sıra: Taşıyıcı akslar ve aks aralık ölçüleri.", note: "", checked: false },
            { no: "G3", desc: "Dış Ölçü 3. Sıra: Bina cephe hareketleri ölçüleri.", note: "", checked: false },
            { no: "G4", desc: "Dış Ölçü 4. Sıra: Doluluk - boşluk (pencere, kapı) ölçüleri.", note: "", checked: false },
            { no: "H1", desc: "İç Ölçü: Her hacimde en az yatay ve dikeyde ikişer ölçü çizgisi verilecektir.", note: "", checked: false },
            { no: "H2", desc: "İç Ölçü: Pencere ve kapı boşluk ölçüleri net olarak yazılacaktır.", note: "", checked: false },
            { no: "H3", desc: "İç Ölçü: Tüm mahallerin bütün iç boyut ölçüleri mutlaka eksiksiz verilecektir.", note: "", checked: false }
        ]
    },
    "II": {
        title: "I. KESİTLER (1/50) & İ. GÖRÜNÜŞLER (1/50)",
        items: [
            { no: "I1", desc: "En az iki kesit çizilmelidir. Biri ana merdiven ve bina girişinden geçmelidir.", note: "", checked: false },
            { no: "I2", desc: "Kesitin geçtiği mahallerin isimleri, kotları ve aksları verilmelidir.", note: "", checked: false },
            { no: "I3", desc: "Pencere altı dolu kısımların malzeme açılımı, kiriş bitişi ayrı ayrı kotlandırılmalıdır.", note: "", checked: false },
            { no: "I4", desc: "Parapet denizlik detaylarına uygun çizilmeli, ısı yalıtım projesine uygun olmalıdır.", note: "", checked: false },
            { no: "I5", desc: "Çatı konstrüksiyonu gerçek şekliyle çizilmeli, eğim yazılmalıdır.", note: "", checked: false },
            { no: "I6", desc: "Bodrum duvarlarında ve temelde ısı/su yalıtımı kesit üzerinde açıklanmalıdır.", note: "", checked: false },
            { no: "İ1", desc: "Yapının durumuna göre dört görünüşü de çizilmelidir.", note: "", checked: false },
            { no: "İ2", desc: "Farklı düşey düzlemler derinlik hissi verecek çizim teknikleriyle gösterilmelidir.", note: "", checked: false },
            { no: "İ3", desc: "Doğal zemin nokta nokta, öneri zemin devamlı çizgi ile gösterilip kotlandırılmalıdır.", note: "", checked: false },
            { no: "İ4", desc: "Zemin altında kalan yapı dış hatları kesik çizgilerle belirtilmelidir.", note: "", checked: false },
            { no: "İ5", desc: "Dış duvar kaplamaları yazılmalı, yağmur olukları ve iniş boruları gösterilmelidir.", note: "", checked: false },
            { no: "İ6", desc: "Kapı/pencere görünüşleri çizilmeli, açılan kanat yönleri işaretlenmelidir.", note: "", checked: false },
            { no: "İ7", desc: "Saçaklar, balkonlar, kalkan duvarlar, oluk, mahya ve bacalara kot verilmelidir.", note: "", checked: false },
            { no: "İ8", desc: "Planda görünmeyen ölçüler (korkuluk yüksekliği, söveler vb.) görünüşte yazılmalıdır.", note: "", checked: false }
        ]
    },
    "J": {
        title: "J. DİĞER HUSUSLAR VE YÖNETMELİK UYGUNLUĞU",
        items: [
            { no: "1", desc: "Binaların Yangından Korunması Hakkında Yönetmelik hükümlerine tam uyum.", note: "", checked: false },
            { no: "2", desc: "Sığınak Yönetmeliği hükümlerine ve asgari ölçülerine uyum.", note: "", checked: false },
            { no: "3", desc: "Otopark Yönetmeliği hükümlerine uyum.", note: "", checked: false },
            { no: "4", desc: "Binalarda Enerji Performansı Yönetmeliği'ne uyum.", note: "", checked: false },
            { no: "5", desc: "Deprem Bölgelerinde Yapılacak Binalar Hakkında Yönetmelik (TBDY) uyumu.", note: "", checked: false },
            { no: "6", desc: "İlgili tüm TSE standartlarına (erişilebilirlik, malzeme vb.) uyum.", note: "", checked: false },
            { no: "7", desc: "Tüm projelerde Elektrik Pano Odası mutlaka aranacak ve planda gösterilecektir.", note: "", checked: false },
            { no: "8", desc: "Tüm yapılarda Su Deposu alanı mutlaka aranacak ve planda çözülecektir.", note: "", checked: false },
            { no: "9", desc: "5.50 kotu üzerinde yapılan kat terasları ana merdivenle irtibatlandırılacaktır.", note: "", checked: false },
            { no: "10", desc: "Altyapı Katılım Ücreti (AYKU) ve Katılım İştirak Ücreti hesaplanacaktır.", note: "", checked: false }
        ]
    },
    "K": {
        title: "K. TABAN ALANI VE EMSAL HESABI KRİTERLERİ (ÖZEL KONTROL)",
        items: [
            { no: "K1", desc: "Taban Alanına Dahil Edilmeyen Koşulsuz Alanlar (Yangın merdiveni, açık havuz, pergola, jeneratör odası vb.)", note: "", checked: false },
            { no: "K2", desc: "Bodrum Katlarda %30 Emsal Hesabına Girmeyen Alanlar (Gömülü otopark, sığınak, su deposu, ortak alanlar)", note: "", checked: false },
            { no: "K3", desc: "Emsal Hesabında %30 İndirim ile Düşülecek Alanlar (Balkonlar, kat holleri, asansör önü sahanlıkları)", note: "", checked: false },
            { no: "K4", desc: "Emsal Harici Koşulsuz Düşülen Alanlar (Zorunlu yangın merdiveni/holü 6m², ortak alan teras çatılar)", note: "", checked: false }
        ]
    }
};

function createRuhsatProject(metadata, customTemplate) {
    const tmpl = customTemplate || JSON.parse(JSON.stringify(RUHSAT_DEFAULT_TEMPLATE));
    const meta = metadata || {
        projeAdi: "Örnek Proje",
        adaParsel: "101 / 5",
        tarih: "08/07/2026",
        mimar: "Ahmet Yılmaz"
    };

    const tasks = Object.keys(tmpl).map((secKey, sIdx) => {
        const sec = tmpl[secKey];
        return {
            id: sIdx + 1,
            sectionKey: secKey,
            text: sec.title,
            completed: false,
            subtasks: (sec.items || []).map((item, iIdx) => ({
                id: (sIdx + 1) * 1000 + (iIdx + 1),
                no: item.no || (iIdx + 1).toString(),
                desc: item.desc || '',
                text: `${item.no || (iIdx + 1)}. ${item.desc || ''}`,
                note: item.note || '',
                completed: !!item.checked
            }))
        };
    });

    const title = meta.adaParsel 
        ? `${meta.adaParsel}${meta.projeAdi ? ' - ' + meta.projeAdi : ''}`
        : (meta.projeAdi || "Mimari Proje İnceleme ve Ruhsat Kontrol Listesi");

    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: title,
        folder: "Ana Ekran",
        color: "#4a544e",
        isArchived: false,
        isPinned: false,
        isRuhsat: true,
        category: "genel",
        metadata: meta,
        createdAt: getFormattedDate(),
        tasks: tasks
    };
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

            // Proje yoksa veya sadece eski 5 maddelik taslak varsa 131 maddelik föy ile başlat
            const isOldDummyProject = projects && projects.length === 1 && projects[0].tasks && projects[0].tasks.length === 5 && projects[0].tasks[0].text === 'KAT PLANLARINA SIVALAR';
            if (!projects || projects.length === 0 || isOldDummyProject) {
                projects = [createRuhsatProject()];
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
            if (type === 'full' && category !== 'ofis') {
                const adaParsel = prompt("Yeni Ruhsat / İmar Projesinin Ada/Parsel Bilgisi (Örn: 102 / 5):", "101 / 5");
                if (adaParsel === null) return;
                const projeAdi = prompt("Proje Adı veya Sahibi (İsteğe bağlı):", "Yeni Mimari Proje");
                if (projeAdi === null) return;
                recordState();
                const newProj = createRuhsatProject({
                    projeAdi: (projeAdi || '').trim(),
                    adaParsel: (adaParsel || '').trim(),
                    tarih: new Date().toLocaleDateString('tr-TR'),
                    mimar: ""
                });
                newProj.folder = currentViewFolder || "Ana Ekran";
                projects.unshift(newProj);
                saveProjects();
                renderProjects();
                openModal(newProj.id);
                showToast("Yeni 131 maddelik Ruhsat / İmar Kontrol Föyü oluşturuldu.");
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


        /* ===== RUHSAT & İMAR FÖYÜ (131 MADDE & 12 BÖLÜM) ÖZEL YÖNETİMİ ===== */
        let ruhsatSearchQuery = '';
        let ruhsatActiveFilter = 'all'; // 'all', 'incomplete', 'completed'
        let ruhsatCollapsedSections = new Set();

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
                        <button class="btn-ruhsat-filter" onclick="toggleAllRuhsatSections()" title="Tüm bölümleri aç veya daralt">Aç / Kapat</button>
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
            if (ruhsatCollapsedSections.has(sIdx)) {
                ruhsatCollapsedSections.delete(sIdx);
            } else {
                ruhsatCollapsedSections.add(sIdx);
            }
            const secCard = document.getElementById('ruhsat-sec-' + sIdx);
            if (secCard) {
                secCard.classList.toggle('collapsed', ruhsatCollapsedSections.has(sIdx));
            }
        }

        function toggleAllRuhsatSections() {
            const project = projects.find(p => p.id === currentEditingProjectId);
            if (!project || !project.tasks) return;
            if (ruhsatCollapsedSections.size >= project.tasks.length / 2) {
                ruhsatCollapsedSections.clear();
            } else {
                project.tasks.forEach((_, idx) => ruhsatCollapsedSections.add(idx));
            }
            renderRuhsatChecklist(project, document.getElementById('modal-tasks-container'));
        }

        function escapeRegex(str) {
            return str.replace(/[.*+?^$${}()|[\]\\]/g, '\\$&');
        }
