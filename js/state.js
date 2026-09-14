/* ===== MİMZ OFİS - GLOBAL DURUM VE YARDIMCI METODLAR ===== */
        let isLightMode = localStorage.getItem('mimzTheme') === 'light';
        let customAppBgColor = localStorage.getItem('mimzCustomAppBg');
        let currentTab = 'active'; 
        let currentViewFolder = null;
        let appMode = 'ruhsat'; // 'ruhsat' = Ruhsat/İmar projeleri, 'ofis' = Genel Ofis işleri

        let currentEditingProjectId = null;
        let currentPipProjectId = null;
        let currentPipTarget = { type: 'project', id: null };
        let nativePipWindow = null; 
        let isPipDragging = false;
        let pipStartX, pipStartY, pipStartLeft, pipStartTop;

        let activeHlRange = null;
        let activeHlTargetInfo = null;
        let dragSourceTaskIndex = null;

        // Modal ve PiP alt görev açık kalma durum haritası
        const pipDrawerOpenMap = new Map(); // key: `${projectId}-${taskIndex}` -> boolean
        const modalSubtaskAdderOpen = new Set(); // set of taskIndex


let projects = [];
let officeNotes = [];
let customFolders = [];
try {
    const storedFolders = localStorage.getItem('mimzCustomFolders');
    if (storedFolders) customFolders = JSON.parse(storedFolders);
} catch (e) { customFolders = []; }
if (!Array.isArray(customFolders)) customFolders = [];

/* ===== RUHSAT & İMAR FÖYÜ STANDART ŞABLONU (12 BÖLÜM & 131 KRİTER) ===== */
var RUHSAT_DEFAULT_TEMPLATE = {

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
if (typeof window !== "undefined") {
    window.RUHSAT_DEFAULT_TEMPLATE = RUHSAT_DEFAULT_TEMPLATE;
    window.createRuhsatProject = createRuhsatProject;
}


        /* GERİ AL (UNDO) VE YİNELE (REDO) MOTORU */
        let undoStack = [];
        let redoStack = [];
        const MAX_HISTORY = 50;

        function recordState(sourceEl = null) {
            try {
                const snapshot = JSON.stringify(projects);
                if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snapshot) return;
                undoStack.push(snapshot);
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                redoStack = [];
                // Her komutta simli ışıltı dağıt
                triggerSparkleBurstOnAction(sourceEl);
            } catch (e) {
                console.error("Durum kaydedilemedi:", e);
            }
        }

        function undoAction() {
            if (undoStack.length === 0) {
                showToast("Geri alınacak önceki işlem yok.", "info");
                return;
            }
            const currentSnapshot = JSON.stringify(projects);
            redoStack.push(currentSnapshot);

            const prevSnapshot = undoStack.pop();
            projects = JSON.parse(prevSnapshot);
            saveProjects();
            refreshAllViews();
            triggerSparkleBurstOnAction();
            showToast("İşlem geri alındı (Undo)", "undo");
        }

        function redoAction() {
            if (redoStack.length === 0) {
                showToast("Yinelenecek işlem yok.", "info");
                return;
            }
            const currentSnapshot = JSON.stringify(projects);
            undoStack.push(currentSnapshot);

            const nextSnapshot = redoStack.pop();
            projects = JSON.parse(nextSnapshot);
            saveProjects();
            refreshAllViews();
            triggerSparkleBurstOnAction();
            showToast("İşlem yinelendi (Redo)", "redo");
        }

        function getActiveProject(elementOrContext) {
            if (elementOrContext) {
                const doc = elementOrContext.ownerDocument || document;
                const inPip = (doc !== document) || (elementOrContext.closest && (elementOrContext.closest('#floating-pip-widget') || elementOrContext.closest('#native-pip-root')));
                if (inPip && currentPipProjectId) {
                    const p = projects.find(item => item.id === currentPipProjectId);
                    if (p) return p;
                }
                const inModal = elementOrContext.closest && elementOrContext.closest('#modal-content');
                if (inModal && currentEditingProjectId) {
                    const p = projects.find(item => item.id === currentEditingProjectId);
                    if (p) return p;
                }
            }
            if (document.getElementById('modal-overlay').style.display === 'flex' && currentEditingProjectId) {
                const p = projects.find(item => item.id === currentEditingProjectId);
                if (p) return p;
            }
            if (currentPipProjectId) {
                const p = projects.find(item => item.id === currentPipProjectId);
                if (p) return p;
            }
            if (currentEditingProjectId) {
                const p = projects.find(item => item.id === currentEditingProjectId);
                if (p) return p;
            }
            return projects[0] || null;
        }

        function refreshAllViews() {
            if (document.getElementById('modal-overlay').style.display === 'flex' && currentEditingProjectId) {
                const proj = projects.find(p => p.id === currentEditingProjectId);
                if (proj) {
                    document.getElementById('modal-title').value = proj.title || '';
                    document.getElementById('modal-folder').value = proj.folder || '';
                }
                renderTasks();
            }
            renderPipContent();
            renderProjects();
        }

        let toastTimeout = null;
        function showToast(msg, type = "info") {
            const toast = document.getElementById('toast');
            if (!toast) return;
            let iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
            if (type === "undo") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
            else if (type === "redo") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>`;
            else if (type === "delete") iconSvg = `<svg class="icon-svg icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>`;
            
            toast.innerHTML = `${iconSvg}<span>${msg}</span>`;
            toast.classList.add('show');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 2200);
        }

        function getContrastColor(colorStr) {
            if (!colorStr) return '#1a1a1a';
            const hslMatch = colorStr.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
            if (hslMatch) {
                const lightness = parseInt(hslMatch[3], 10);
                return lightness > 55 ? '#1a1a1a' : '#ffffff';
            }
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness > 135 ? '#1a1a1a' : '#ffffff';
            }
            return '#1a1a1a';
        }

        function getColorBrightness(colorStr) {
            if (!colorStr) return 255;
            let hex = colorStr.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return 255;
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return (r * 299 + g * 587 + b * 114) / 1000;
        }

        function darkenColor(colorStr, factor) {
            let hex = (colorStr || '').replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return colorStr;
            const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
            const r = clamp(parseInt(hex.substring(0, 2), 16) * factor);
            const g = clamp(parseInt(hex.substring(2, 4), 16) * factor);
            const b = clamp(parseInt(hex.substring(4, 6), 16) * factor);
            const toHex = n => n.toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        function hexToHsl(hex) {
            let h = (hex || '').replace('#', '');
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            if (h.length !== 6) h = '808080';
            const r = parseInt(h.substring(0, 2), 16) / 255;
            const g = parseInt(h.substring(2, 4), 16) / 255;
            const b = parseInt(h.substring(4, 6), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const l = (max + min) / 2;
            let hue = 0, sat = 0;
            const d = max - min;
            if (d !== 0) {
                sat = d / (1 - Math.abs(2 * l - 1));
                switch (max) {
                    case r: hue = ((g - b) / d) % 6; break;
                    case g: hue = (b - r) / d + 2; break;
                    case b: hue = (r - g) / d + 4; break;
                }
                hue *= 60;
                if (hue < 0) hue += 360;
            }
            return { h: hue, s: sat * 100, l: l * 100 };
        }

        function hslToHex(h, s, l) {
            s = Math.max(0, Math.min(100, s)) / 100;
            l = Math.max(0, Math.min(100, l)) / 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h / 60) % 2 - 1));
            const m = l - c / 2;
            let r = 0, g = 0, b = 0;
            if (h < 60) { r = c; g = x; b = 0; }
            else if (h < 120) { r = x; g = c; b = 0; }
            else if (h < 180) { r = 0; g = c; b = x; }
            else if (h < 240) { r = 0; g = x; b = c; }
            else if (h < 300) { r = x; g = 0; b = c; }
            else { r = c; g = 0; b = x; }
            const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        // Vurgu (accent) renklerini SABİT pembe yerine, o an ekrandaki arka planın
        // kendi tonundan (hue) türetir: arka plan yeşilse vurgular yeşil, maviyse mavi olur.
        // Sadece açık/koyuluk (lightness) ayarlanır ki kontrast her zaman okunaklı kalsın.
        function applyAccentForBackground(bgColor) {
            const bgHsl = hexToHsl(bgColor);
            // Arka plan neredeyse gri/rentsizse (doygunluk çok düşükse) orijinal toz pembe tonuna dön
            const hue = bgHsl.s < 6 ? 291 : bgHsl.h;
            const sat = Math.max(bgHsl.s, 40);
            const bgIsLight = bgHsl.l > 55;
            const primary = hslToHex(hue, sat, bgIsLight ? 36 : 78);
            const secondary = hslToHex(hue, sat, bgIsLight ? 46 : 66);
            const hover = hslToHex(hue, sat, bgIsLight ? 28 : 87);
            document.body.style.setProperty('--primary-accent', primary);
            document.body.style.setProperty('--secondary-accent', secondary);
            document.body.style.setProperty('--accent-text-color', getContrastColor(primary));
            document.body.style.setProperty('--btn-hover-bg', hover);
        }

        function clearCustomAccent() {
            document.body.style.removeProperty('--primary-accent');
            document.body.style.removeProperty('--secondary-accent');
            document.body.style.removeProperty('--accent-text-color');
            document.body.style.removeProperty('--btn-hover-bg');
        }

        function applyTheme() {
            const btn = document.getElementById('theme-btn');
            if (isLightMode) {
                document.body.classList.add('light-mode');
                if (btn) {
                    btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`; 
                    btn.title = "Koyu Temaya Geç";
                }
            } else {
                document.body.classList.remove('light-mode');
                if (btn) {
                    btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`; 
                    btn.title = "Açık Temaya Geç";
                }
            }

            if (customAppBgColor) {
                document.body.style.setProperty('--bg-color', customAppBgColor);
                const bgPicker = document.getElementById('bg-color-picker');
                if (bgPicker) bgPicker.value = customAppBgColor;
                applyAccentForBackground(customAppBgColor);
            } else {
                document.body.style.removeProperty('--bg-color');
                clearCustomAccent();
            }

            // "+ Yeni ... Ekle" butonlarına basıldığında, o an aktif olan arka planın
            // daha koyu bir tonunu kullan (özel seçilmiş renk ya da varsayılan tema rengi).
            const effectiveBg = customAppBgColor || (isLightMode ? '#f4f5f7' : '#1e1f22');
            document.body.style.setProperty('--btn-active-bg', darkenColor(effectiveBg, 0.78));
        }
        
        function toggleTheme() {
            isLightMode = !isLightMode;
            localStorage.setItem('mimzTheme', isLightMode ? 'light' : 'dark');
            customAppBgColor = null;
            localStorage.removeItem('mimzCustomAppBg');
            applyTheme();
            const btn = document.getElementById('theme-btn');
            triggerSparkleBurstOnAction(btn);
        }

        function changeAppBgColor(event) {
            customAppBgColor = event.target.value;
            localStorage.setItem('mimzCustomAppBg', customAppBgColor);
            applyTheme();
            triggerSparkleBurstOnAction(event.target);
        }

        applyTheme();

        function getFormattedDate() {
            return new Date().toLocaleString('tr-TR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

function saveProjects() {
    localStorage.setItem('mimzProjects', JSON.stringify(projects));
    if (typeof notifyServerStateChange === 'function') notifyServerStateChange();
}

function saveOfficeNotes() {
    localStorage.setItem('mimzOfficeNotes', JSON.stringify(officeNotes));
    if (typeof notifyServerStateChange === 'function') notifyServerStateChange();
}

function saveCustomFolders() {
    localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
    if (typeof notifyServerStateChange === 'function') notifyServerStateChange();
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function extractAndRegisterKnownFolders(triggerSync = true) {
    let changed = false;
    (projects || []).forEach(p => {
        const f = (p.folder || '').trim();
        if (f && f !== 'Ana Ekran' && !customFolders.includes(f)) {
            customFolders.push(f);
            changed = true;
        }
    });
    (officeNotes || []).forEach(n => {
        const f = (n.folder || '').trim();
        if (f && f !== 'Ana Ekran' && !customFolders.includes(f)) {
            customFolders.push(f);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('mimzCustomFolders', JSON.stringify(customFolders));
        if (triggerSync && typeof notifyServerStateChange === 'function') {
            notifyServerStateChange();
        }
    }
    return changed;
}

function getAllKnownFolders() {
    extractAndRegisterKnownFolders(false);
    const set = new Set();
    (customFolders || []).forEach(f => {
        const tr = (f || '').trim();
        if (tr && tr !== 'Ana Ekran') set.add(tr);
    });
    (projects || []).forEach(p => {
        const f = (p.folder || '').trim();
        if (f && f !== 'Ana Ekran') set.add(f);
    });
    (officeNotes || []).forEach(n => {
        const f = (n.folder || '').trim();
        if (f && f !== 'Ana Ekran') set.add(f);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
}

function createCustomFolder(name) {
    const tr = (name || '').trim();
    if (!tr || tr === 'Ana Ekran') {
        showToast('Geçerli bir klasör adı girin.', 'info');
        return false;
    }
    if (!customFolders.includes(tr)) {
        customFolders.push(tr);
        saveCustomFolders();
    }
    showToast(`"${tr}" klasörü oluşturuldu.`);
    if (typeof renderProjects === 'function') renderProjects();
    if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
    return true;
}

function renameCustomFolder(oldName, newName) {
    const oldTr = (oldName || '').trim();
    const newTr = (newName || '').trim();
    if (!oldTr || !newTr || oldTr === newTr) return false;
    if (newTr === 'Ana Ekran') {
        showToast('Klasör adı "Ana Ekran" olamaz.', 'info');
        return false;
    }

    // customFolders güncelle
    const idx = customFolders.indexOf(oldTr);
    if (idx !== -1) {
        customFolders[idx] = newTr;
    } else {
        customFolders.push(newTr);
    }
    saveCustomFolders();

    // Projeleri güncelle
    let projChanged = false;
    projects.forEach(p => {
        if ((p.folder || '').trim() === oldTr) {
            p.folder = newTr;
            projChanged = true;
        }
    });
    if (projChanged) saveProjects();

    // Notları güncelle
    let noteChanged = false;
    officeNotes.forEach(n => {
        if ((n.folder || '').trim() === oldTr) {
            n.folder = newTr;
            noteChanged = true;
        }
    });
    if (noteChanged) saveOfficeNotes();

    if (currentViewFolder === oldTr) {
        currentViewFolder = newTr;
    }

    showToast(`Klasör "${newTr}" olarak güncellendi.`);
    if (typeof renderProjects === 'function') renderProjects();
    if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
    return true;
}

function deleteCustomFolder(name, moveFilesToHome = true) {
    const tr = (name || '').trim();
    if (!tr || tr === 'Ana Ekran') return;

    customFolders = customFolders.filter(f => f !== tr);
    saveCustomFolders();

    if (moveFilesToHome) {
        let projChanged = false;
        projects.forEach(p => {
            if ((p.folder || '').trim() === tr) {
                p.folder = 'Ana Ekran';
                projChanged = true;
            }
        });
        if (projChanged) saveProjects();

        let noteChanged = false;
        officeNotes.forEach(n => {
            if ((n.folder || '').trim() === tr) {
                n.folder = 'Ana Ekran';
                noteChanged = true;
            }
        });
        if (noteChanged) saveOfficeNotes();
    }

    if (currentViewFolder === tr) {
        currentViewFolder = null;
    }

    showToast(`"${tr}" klasörü silindi.`);
    if (typeof renderProjects === 'function') renderProjects();
    if (typeof renderOfficeNotes === 'function') renderOfficeNotes();
}

/* ===== SİYAH-BEYAZ ÇİZGİSEL İKONLAR (36 ADET TEKNİK/MİMARİ VE İŞ İKONU) ===== */
var LINE_ICONS = (typeof window !== 'undefined' ? window : global).LINE_ICONS = {
    "check": { label: "Onay / Tamam", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' },
    "x": { label: "İptal / Çarpı", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' },
    "star": { label: "Yıldız / Önemli", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
    "heart": { label: "Favori", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
    "pin": { label: "İğne / Sabit", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>' },
    "alert": { label: "Dikkat / Uyarı", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
    "flag": { label: "Bayrak / Öncelik", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>' },
    "bulb": { label: "Fikir / Tasarım", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>' },
    "target": { label: "Hedef", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
    "building": { label: "Bina / Mimari", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>' },
    "home": { label: "Konut / Ev", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    "ruler": { label: "Cetvel / Gönye", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="m21.7 8.3-6-6a1 1 0 0 0-1.4 0l-12 12a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0l12-12a1 1 0 0 0 0-1.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>' },
    "compass": { label: "Pusula / Açı", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>' },
    "hammer": { label: "Çekiç / İnşaat", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-1.25-1.25a2 2 0 0 0-2.83 0l-1.8 1.8 4.07 4.08 1.81-1.8a2 2 0 0 0 0-2.83Z"/></svg>' },
    "wrench": { label: "Uygulama / Ayar", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
    "calendar": { label: "Takvim / Randevu", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
    "clock": { label: "Saat / Süre", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    "file": { label: "Belge / Pafta", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
    "file-check": { label: "Onaylı Evrak", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>' },
    "folder": { label: "Klasör / Dosya", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>' },
    "layers": { label: "Katmanlar / Paftalar", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' },
    "box": { label: "Parsel / Kutu", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
    "map-pin": { label: "Ada / Parsel / Konum", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' },
    "phone": { label: "Telefon / İletişim", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
    "mail": { label: "Yazışma / E-posta", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
    "user": { label: "Mimar / Müşteri", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
    "users": { label: "Ekip / İdare", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    "cash": { label: "Hakediş / Maliyet", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' },
    "tag": { label: "Etiket", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
    "camera": { label: "Şantiye Fotoğrafı", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>' },
    "lock": { label: "Resmi / Kilitli", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' },
    "eye": { label: "Kontrol / İnceleme", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' },
    "zap": { label: "Acil / Şimşek", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    "smile": { label: "Olumlu", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
    "meh": { label: "Nötr", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
    "frown": { label: "Eksik / Sorun", svg: '<svg class="line-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' }
};

function renderTaskIcon(iconKey) {
    if (!iconKey) return '';
    if (LINE_ICONS[iconKey]) {
        return `<span class="task-line-icon" title="${LINE_ICONS[iconKey].label}">${LINE_ICONS[iconKey].svg}</span>`;
    }
    // Geriye dönük emoji uyumluluğu
    return `<span class="task-emoji-tag">${escapeHtml(iconKey)}</span>`;
}
