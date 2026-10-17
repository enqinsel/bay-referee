# BAY REFEREE Motion Pattern Library V1

Bu kütüphane hareket seçme aracıdır; bölümde sergilenecek efekt listesi değildir. Onaylı formatı, avatarı, son sesi, Whisper saatini, Türkçe caption’ları, vurgu sistemini veya renderer’ı değiştirmez. Önce `motion-grammar.md` oku. Sahnenin semantik amacı bir pattern gerektirmiyorsa hold seçmek geçerlidir.

Her pattern için **kaynak nesne → hedef durum** ve **miras kalan state** yazılmalıdır. Yeni nesne gerekiyorsa nereden geldiği anlaşılmalıdır. Pattern seçimi sabit koreografi, süre, BPM veya easing dayatmaz. Zamanı final ses ve semantik beat belirler. Aynı anda bir ana focal event bütçesi korunur. İnsan consolidation kararıyla V1.1'in görünür koreografi seviyesi production referansıdır; V1.2 tam koreografisi varsayılan değildir. Altı koşullu fizik prensibi ve güncel karar [motion-grammar.md](motion-grammar.md) içindedir; 58 pattern repertuarını büyütmez. Motion Lab kapanmıştır.

## Kanıt işaretleri

- **O / PMxx:** Gerçek referans MP4’ün kronolojik örneklerinde görülen davranış veya sınırlı bir analoji. Kaynak kimliği/kodu/koreografisi kopyalanmaz. Bay için uygunluk hâlâ değerlendirme gerektirir.
- **P:** Kullanıcının brief’inde istenen repertuar; bu araştırma grubunda doğrulanmış dış örneği yok. Bir üretim başarısı iddiası değildir; ihtiyaç olduğunda state/transition testi gerekir.
- **B:** Kullanıcı tarafından onaylı Bay baseline’ında bulunan ilişki. Yeni varyasyonun daha iyi olduğunu veya otomatik onaylandığını göstermez.

PM kayıtlarının tam gözlem, zaman ve dosya kanıtı proje içindeki `brand/bay-referee/motion-research/sources.md` ve `research/types-shapes.json`, `diagrams-code.json`, `characters-photos.json` kayıtlarındadır. 36 örneğin33'ü tüm süre boyunca2fps, üç uzun film0.5fps kronolojik incelendi; kritik geçişler10/12fps örneklendi. Bu, her encoded frame'in izlenmesi veya ses dinleme değildir. Video üzerinden deterministic kod, tam easing veya ses senkronu doğrulanmış sayılmaz.

## Süreklilik — 7 pattern

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `PERSISTENT_CARRIER` | Aynı özne birkaç aşamada rol değiştirir. | Tanınan nesne → yeni işlev; kimlik ve takip edilebilir konum korunur. | Sırf geçiş bağlamak için topu alakasız simgeye dönüştürme. | İzlenen top, pas anının referansı olarak kalır. | O: PM31 aynı fotoğraf (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `STATE_TRANSFORM` | Aynı nesnenin durumu gerçekten değişir. | Mevcut nesne → yeni state; gerekli anchor/kimlik miras kalır. | Her nesneyi keyfî shape morph’a sokma. | Hareketli topun seçilen anda sabit ölçüm referansı olması. | O: PM31 (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `CONTEXT_RETAIN` | Yeni bilgi önceki ilişkiye dayanır. | Önceki primary → sakin context; konum/bağlantı okunur kalır. | Context’i anlamsız küçük kalıntıya dönüştürme. | Ofsayt çizgisi gelirken oyuncu ve top referanslarını tut. | O: PM13 aynı bardak, PM25 dönüş yığını (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `MOTION_INHERIT` | Bir hareket sonraki hareketi doğurur. | Kaynağın yönü/anchor’ı → hedefin başlangıcı; fiziksel mantık korunur. | Sadece benzer renk veya merkez, miras değildir. | Ölçüm çizgisinin başlangıcı seçili oyuncu anchor’ından doğar. | O: PM07; PM05 yerel analoji |
| `HANDOFF` | Anlatım odağı başka nesneye geçer. | Kaynak işaret/çıktı → alıcı; kaynak önce tanınır, sonra odağı bırakır. | İki nesneyi aynı anda eşit güçte parlatma. | SAOT sonucu VAR incelemesine aktarılır. | B: mevcut SAOT→VAR ilişkisi; O: PM07 sınırlı aktarım analojisi |
| `DOCK` | Bir mekanizma başka sistemin içine bağlanır. | Analiz nesnesi → kabul eden yüzey/yuva; iki kimlik ve son bağlantı korunur. | Hedef belirsizken serbest küçülme/fade kullanma. | SAOT analizi VAR monitörüne yerleşir. | B: onaylı VAR/SAOT payoff |
| `EXPAND_CONTRACT` | Mevcut yüzey sonraki bilgi için alan açar. | Nesne/yüzey → büyük/küçük çalışma alanı; aynı sınır izlenir. | Tam ekran kaplama otomatik geçiş değildir; caption’ları örtme. | Mevcut monitör yalnız inceleme gerektiğinde büyür. | O: PM01, PM03, PM07 |

## İlişki hareketleri — 9 pattern

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `ATTACH` | İki nesne arasında yeni ilişki kurulur. | Ayrı nesneler → görünür bağ; uçlar kendi kimliğini tutar. | Dekoratif connector ekleme. | Oyuncu ile kulüp arasındaki sözleşme bağının kurulması. | O: PM04 yapısal bağ analojisi |
| `DETACH` | Var olan bağ sona erer. | Görünür bağlantı → kopmuş ilişki; iki taraf yerinde anlaşılır kalır. | Bağ kurulmadan kopuş göstermeme. | Sözleşme sona ererken oyuncu-kulüp bağı ayrılır. | P |
| `BLOCK` | Hareketin önünde kural/engel vardır. | Hareket eden nesne → görünür sınırda durma; hedef hâlâ anlaşılırdır. | Fiziksel yasa gibi sunulan yanlış futbol kuralı üretme. | Bir transferin önündeki belirli şartı görünür engel olarak anlat. | O: PM03, PM12 |
| `RELEASE` | Kısıt kalktığı için hareket devam eder. | Kurulu engel → açılan yol; bekleyen nesne devam eder. | Sebep görünmeden nesneyi ışınlama. | Sözleşme şartı tamamlanınca oyuncu hareketi serbest kalır. | O: PM03, PM12 |
| `COLLIDE` | Temas sonuç doğurur. | Hareket → temas → tepki; temas noktası korunur. | Kart/para/etiketi sebepsiz sekme efektine sokma. | Topun oyuncu ayağına temasından sonra yön değiştirmesi. | O: PM01 temas ve tepki; PM12 engel teması |
| `PULL_PUSH` | Baskı, kuvvet veya pazarlık ilişkisi değişir. | Kuvvet kaynağı → karşı nesne tepkisi; iki uç ve yön bellidir. | Soyut gücü doğrulanmış miktar gibi göstermeme. | İki tarafın sözleşme şartını farklı yönlere çekmesi, anlatım bunu söylüyorsa. | P |
| `PATH_FOLLOW` | Nesnenin izlemesi gereken anlamlı rota vardır. | Tanınan özne → rota boyunca hedef; kimlik ve yön korunur. | Boşluğu doldurmak için dolaştırma. | Oyuncunun pas koridoruna koşması. | O: PM05 runner; PM10 endpoint yolu |
| `ROUTE_DRAW` | Hareket veya niyet, iz oluşturur. | Hareket kaynağı → ilerleyen çizgi; çizginin ucu kaynakla bağlıdır. | Rota ile nesneyi bağımsız hızlandırma. | Topun ilerlediği pas yolunun arkasında kısa iz oluşması. | O: PM07, PM10 |
| `ROLE_SWAP` | Mevcut iki öznenin görevi/önemi değişir. | Aynı iki nesne → değişen aktif roller; kimlikler korunur. | Rol değişimini sadece renk değişimiyle belirsiz bırakma. | İki orta saha oyuncusunun biri öne çıkarken diğerinin dengeyi devralması. | P; PM08 biçim değişimi rol anlamını kanıtlamaz |

## Açıklama hareketleri — 8 pattern

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `FOCUS_SHIFT` | Anlatılan kavram veya aktif taraf değişir. | Aktif özne → context; hedef → primary; ortak dünya korunur. | Dört katmanı aynı anda eşit güçte vurgulama. | VAR açıklanırken SAOT sakin kalır; sıra gelince vurgu devredilir. | O: PM07; PM02 yoğunluk karşıtı örnek |
| `COMPARE_BALANCE` | İki kavram aynı ölçüte göre karşılaştırılır. | Aynı dünya/ölçek → farkı görünen iki davranış. | İki kurumsal kart veya iki eşzamanlı açıklama yapma. | VAR’ın incelemesi ile SAOT’un ölçümü aynı saha üzerinde ayırt edilir. | O: PM09 ortak başlangıç/hedef |
| `CAUSE_REACTION` | Bir olay başka olayı doğurur. | Görünür sebep → kısa okunur sonuç; önce-sonra sırası korunur. | Sonucu sebebinden önce gösterme. | Pas temasının seçilmesi, ölçüm anını sabitler. | O: PM01, PM03, PM07, PM12 |
| `PROCESS_BUILD` | Bir işlem birkaç bağımlı aşamada gelişir. | State → eklenen/dönüşen bilgi; önceki gerekli referanslar kalır. | Yan yana bağımsız mini slaytlar üretme. | Tracking → kick point → offside line. | O: PM13 akış/seviye, PM18 kapasite (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `RULE_RECONFIGURE` | Kural, mevcut ilişkiyi değiştirir. | Aynı nesneler + açıklanan kural → değişmiş izin/bağ/durum. | Görsel basitlik uğruna yanlış kural kurma. | Kural değişikliği mevcut oyuncu-kulüp bağını yeniden düzenler. | P; PM12 yalnız kısıt davranışı analojisi |
| `NESTED_SYSTEM` | Özel mekanizma daha geniş sistemin parçasıdır. | Alt sistem → ana sistemin içinde okunur konum; katkı ilişkisi korunur. | Birini diğerinin rakibi veya yerine geçen otorite gibi gösterme. | SAOT, VAR’ın ofsayt incelemesine katkı olarak yerleşir. | O: PM25 (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `EVIDENCE_ENTER` | Yeni bir iddiayı kanıt destekler. | İddia/nesne → ilgili belge/fotoğraf; sahne referansı korunur. | Kanıtı tam ekran belgesel montajına çevirme. | Oyuncu anlatılırken ilgili arşiv fotoğrafı aynı dünyada kanıt olur. | P; gerçek medya araştırmasının ayrıca doğrulanması gerekir |
| `SCALE_HIERARCHY` | Önem veya sistem kapsamı değişir. | Aynı nesneler → değişen okunur ölçek; ilişki ve hedef korunur. | Kamera zoom’u veya küçük okunmaz nesne üretme. | Analiz monitöre dock olurken monitörün ana sistem rolü belirginleşir. | B: mevcut payoff; O: PM03 context ölçeği |

## Editoryal tipografi — 9 pattern

Yalnız **EDITORIAL TEXT** daha kinetik olabilir. **CAPTION** eksiksiz konuşmayı sakin ve okunur taşır; **LABEL** nesnenin kimliğini korur. Exact wording narration/text-audit authority’den gelir. Tam karaoke yok. Mevcut WORD_ACCENT / UNDERLINE_DRAW / HARD_MARKER sistemi için bu tablo yeni stil üretme gerekçesi değildir.

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `WORD_ACCENT` | Bir kavram hatırlanmalıdır. | Okunur kelime → seçilmiş vurgu; metin konumu ve kelimeler korunur. | Her kelimeyi boyama; role color ile semantic vurgu karışmasın. | Onaylı metindeki “KORUR” vurgulanır. | B: V2.1 highlight authority |
| `UNDERLINE_DRAW` | Sözcük tek focal vurgu olur. | Kelimenin baseline’ı → kısa çizgi; anchor kelimeye bağlıdır. | Dekoratif alt çizgi döngüsü veya caption karaoke yapma. | Anlatıldığı anda “DENGE” altında mevcut treatment açılır. | B: V2.1; O: PM11 yerel underline örneği |
| `HARD_MARKER` | Kısa ifade güçlü fakat tek vurgu ister. | Metin → arkasında sert marker; okunurluk/konum korunur. | Rounded pill kalabalığı ve arka arkaya marker bombardımanı yok. | Yetkili kısa final ifade mevcut marker’la öne çıkar. | B: V2.1 highlight authority |
| `WORD_REPLACE` | Aynı slotta kavram/durum gerçekten değişir. | Önceki ifade → yeni ifade; ortak bağlam ve okuma alanı korunur. | Kaynak okunmadan yeni metni üzerine bindirme. | Aynı açıklama slotunda eski/yeni kural terimi değişir. | O: PM01, PM06; Bay wording ayrıca onaylı olmalı |
| `TYPE_ATTACH_TO_OBJECT` | Terimin hangi nesneye ait olduğu açıklanmalıdır. | Label/editorial ifade → ilgili anchor’a bağlanma; ilişki tutulur. | Serbest uçan küçük etiket veya gereksiz connector üretme. | “PAS ANI” yalnız seçilen top/frame referansına bağlanır. | P |
| `TYPE_FOLLOWS_OBJECT` | Hareket eden nesnenin kimliği kaybolabilir. | Nesne hareketi → bağlı kısa etiket; mesafe/yön mantığı korunur. | Etiketi kendi spring’iyle nesneden koparma. | Seçili oyuncu marker’ının kısa rol etiketi onunla taşınır. | P; PM07 ilişki analojisi, doğrudan takip etiketi kanıtı değil |
| `TYPE_REVEALS_STATE` | Görsel durum değişti ve adı gerekli. | Görünür değişim → yeni kısa metin; önce sebep okunur. | Görselden önce sonucu ilan etme veya yeni bilgi uydurma. | Ölçüm sabitlendikten sonra onaylı durum sözcüğü görünür. | O: PM12 sayaç/durum güncellemesi |
| `TYPE_BECOMES_OBJECT` | Kelimenin fiziksel görevi anlamı açıklar. | Önce okunan editorial sözcük → işlevli nesne; tanınabilirlik korunur. | Tam altyazıyı döndürme/parçalama; sırf eğlence için harf morph’u yok. | Bir “BAĞLANTI” kavramı ilgili iki nesne arasında işlev alabilir. | O: PM04; PM09 harf→nokta |
| `OBJECT_BECOMES_TYPE` | Bilinen nesne sonuç ifadesini tamamlar. | Taşıyıcı nesne → metinsel rol; kimliği son anda anlaşılır kalır. | Topu her bölümde noktalama işaretine zorlama. | Yalnız anlam uyuyorsa mevcut nesne final editorial işaretine dönüşür. | O: PM10 son nokta |

## Karakter / attention direction — 6 pattern

Bu kategorinin esas otoritesi onaylı Bay avatarı ve kullanıcı brief’idir. Tipografi/shape örneklerindeki şekiller, canlı rehber davranışının doğrulanmış örneği sayılmaz. Avatar sabit kalabilir; her state’te poz değiştirmek zorunlu değildir.

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `GAZE_LEAD` | Bakış izleyiciyi sıradaki hedefe yönlendirmeli. | Mevcut bakış → aktive olacak nesne; hedefin konumu korunur. | Hedef yokken rastgele sağ-sol bakış yapma. | Hakem, pas anı vurgulanırken topa yönelir. | P / onaylı pose pack |
| `GESTURE_LEAD` | Yeni ilişkiye yön gösterme gerekir. | Hazır el → hedefi işaret; ardından hedef aktive olur. | Avatar ve diagramı aynı anda eşit güçlü oynatma. | Hakem, VAR monitörü devralmadan ona işaret eder. | O: PM25 monitör işareti (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `GESTURE_CONFIRM` | Sonuç oluştu ve onay anlamlı. | Görünür sonuç → kısa doğrulama jesti; sonuç primary kalır. | Sonuçtan önce onay veya sürekli thumbs-up yok. | Analiz yerleşince rehber kısa onay verir. | P / onaylı pose pack |
| `YIELD_SPACE` | Diagramın açıklanması için alan gerekir. | Avatarın mevcut yeri → kontrollü boşaltılmış alan; bakış ilişkisi kalır. | Her geçişte karakter kaydırma; caption safe zone’u bozma. | Monitör detayı büyürken hakem kenarda sakin kalır. | P; geometri/caption QA gerekir |
| `REACTION` | Anlatıdaki belirli sebep bir tepki doğurur. | Görülen olay → anlamlı kısa poz; sebep görünür kalır. | Sürekli şaşırma, idling veya mimik döngüsü yok. | Beklenmedik kural sonucu ortaya çıktıktan sonra ölçülü tepki. | O: PM30 belgeye tepki (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `PROP_SEMANTIC` | Kart, düdük veya VAR jesti gerçekten anlatılır. | Mevcut rehber → gerekli prop/jest; olayla ilişki açık. | Asset var diye kullanma; düdüğü VAR karar beep’i yapma. | Sarı kart yalnız uyarı/yaptırım anlatımında çıkarılır. | P; kullanıcı brief’i zorunlu sınır |

## Gerçek fotoğraf / medya materyali — 10 pattern

Medya videonun tamamı değildir; sahne içindeki materyaldir. İlgili gerçek kaynak doğrulanmalı ve hak/provenance kaydı tutulmalı. Aşağıdaki reçeteler bir fotoğrafın belirli kişiye veya olaya ait olduğuna kanıt oluşturmaz.

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `FRAME_ENTER` | Gerçek kanıtın sınırı korunmalıdır. | Mevcut dünya → fotoğraf çerçevesi; bağlandığı konu kalır. | Tam ekran slayt ve rastgele tilt yapma. | Hakemin anlattığı oyuncu fotoğrafı sahadaki ilgili alana girer. | P |
| `CUTOUT_ENTER` | Gerçek öznenin ilişkide fiziksel yeri gerekir. | Doğrulanmış subject → ilgili saha/rol konumu; kimlik korunur. | Kenar kalitesi düşük cutout veya gereksiz anonimleştirme yok. | Gerçek oyuncu cutout’u, rol anlatımı için bir pozisyona yerleşir. | P |
| `FOCAL_CROP` | Kanıttaki belirli ayrıntı gerekir. | Tam medya → anlamlı ayrıntı; kaynak bağlamı kaybolmaz. | Yanıltıcı crop veya varsayılan slow zoom yok. | Belgedeki ilgili sözleşme satırını okunabilir crop et. | P |
| `PHOTO_AS_OBJECT` | Fotoğraf diğer nesnelerle ilişkiye girer. | Fotoğraf yüzeyi → sahne nesnesi; fiziksel sınırları korunur. | Fotoğrafı dekoratif arka plan duvarı yapma. | Oyuncu fotoğrafı kulüp/sözleşme ilişkisine bağlanır. | O: PM31 (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `PHOTO_TO_CONTEXT` | Fotoğraf tanıtıldı, yeni açıklama öne geçmeli. | Primary medya → sakin küçük context; tanınabilirlik korunur. | Posta pulu kadar küçültüp okunmaz kalıntı bırakma. | Fotoğraf kenarda kalırken ilgili taktik alan açılır. | P; PM03 poster-context yalnız yüzey analojisi |
| `EVIDENCE_PIN` | Kanıt sabit referans olarak kalmalı. | Giren medya → stabil anchor; sonraki ilişki ona dayanır. | Gereksiz raptiye ikonu veya “kanıt” damgası ekleme. | Karar belgesi bir kural karşılaştırması boyunca sabit kalır. | P |
| `MASK_REVEAL` | Bir nesne/yüzey mevcut medyayı açığa çıkarır. | Anlamlı sınır → açılan kanıt; reveal kaynağı görünür. | Default blur-in/crossfade yerine anlamsız mask oyunu da yapma. | Mevcut monitör ekranı incelenen görüntüyü açar. | O: PM06, PM11 yalnız shape aperture analojisi |
| `EDGE_CROP` | Giriş yönü veya çalışma alanı açık olmalıdır. | Kanvas kenarı → kontrollü medya yerleşimi; konu bağlantısı sürer. | Yüzü veya kanıtı sebepsiz kesme; sosyal UI alanına taşıma. | Belge kenardan gelir ve okunacak bölüm safe zone’da oturur. | P |
| `FOREGROUND_LAYER` | Derinlik, hangi materyalin önde olduğunu açıklamalı. | Mevcut yüzeyler → okunur ön/arka sıra; bağlam korunur. | Dekoratif parallax veya sürekli floating yok. | İncelenen belge, ilgili kulüp görselinin önüne gelir. | O: PM03 poster katmanları; gerçek medya uygulaması P |
| `MEDIA_HANDOFF` | Bir kanıt diğer kanıtı veya açıklamayı tetikler. | Kaynak medya/ayrıntı → yeni materyal; bağlantı görünür kalır. | Fotoğraf→belge→fotoğraf montajı kurma. | Oyuncu fotoğrafındaki kimlik, sözleşme belgesindeki ilgili tarafa bağlanır. | O: PM31 fotoğraf aktarımı (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |

## Diagram / futbol nesneleri — 9 pattern

Diagram ilişkiyi anlatır. Oyuncu, top, kulüp, sözleşme, hakem, para, kural ve rota gerçek semantik nesnelerdir. Genel SaaS node/edge dili, gerçek nesneler yerine otomatik varsayılan değildir.

| Pattern | Semantik tetik | Kaynak → hedef / miras | Sınır | Bay örneği | Kanıt |
|---|---|---|---|---|---|
| `NODE_ACTIVATE` | Belirli nesne o an işlemde. | Context nesne → tek aktif nesne; konumu/kimliği korunur. | Tüm node’ları eşzamanlı parlatma. | Pası veren oyuncu, pas anında kısa süre aktive olur. | P |
| `EDGE_DRAW` | İki tanımlı nesne arasındaki ilişki oluşur. | Kaynak anchor → hedef anchor; çizgi ilişki tamamlandıkça oluşur. | Kaynaksız connector veya birbirine değmeyen uç yok. | Kulüp ile oyuncu arasındaki sözleşme bağı çizilir. | O: PM04 çizgisel ilişki; doğrudan futbol uygulaması P |
| `AREA_REVEAL` | Alanın görevi veya sınırı anlatılır. | Mevcut saha → ilgili bölge; saha çizgileri context kalır. | Alan doldurmak için ilgisiz blok gösterme. | Altı numaranın koruduğu merkez bölgesi kontrollü açılır. | P / onaylı saha dünyası |
| `FLOW_MOVE` | Bir süreçte yönlü aktarım vardır. | Kaynak nesne/veri → yol → hedef; yön anlaşılır. | Sonsuz dolaşan dot veya dekoratif trafik yok. | Kamera verisinin SAOT analizine katkısı tek yönlü okunur. | P; PM07 hareket/iz analojisi |
| `VALUE_TRANSFER` | Bir değer gerçekten el değiştirir. | Sahip/kaynak → alıcı; önceki ve sonraki sahiplik tutarlıdır. | Kaynak azalmazken aynı değer çoğalıyormuş gibi gösterme. | Anlatılan transfer bedeli kulüpler arasında aktarılır. | O: PM18 token kapasitesi (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `LINE_ANCHOR` | Çizgi ölçüm/referans görevi alır. | Doğrulanmış anchor → ölçüm çizgisi; anchor hareketi ile çizgi tutarlı. | Rastgele konumdan ofsayt çizgisi türetme. | İlgili oyuncu referansına bağlı çizgi ölçümü gösterir. | O: PM14 sabit nokta (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `TARGET_PREVIEW` | İzleyici hareketin nereye gittiğini bilmeli. | Sakin hedef → kaynağın hareketi → bağlanmış sonuç; hedef sabit okunur. | Hedef ve taşıyıcıyı eşit güçte oynatma. | Analiz taşınmadan önce VAR monitörünün kabul alanı anlaşılır olur. | O: PM15 sahiplik yuvası (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `SOURCE_TO_TARGET` | Bir sonuç başka noktaya iletilir. | Tanınan kaynak → açık hedef; yol kimlik sürekliliği taşır. | Işınlanma, kaynaksız ok veya sahne sıfırlama yok. | SAOT çıktısı VAR monitörüne fiziksel olarak gider. | O: PM24 girdi rotası (ek bağımsız örnek; kaynak kaydındaki sınırlar geçerli) |
| `STATE_BEFORE_AFTER` | Aynı ilişki değişim öncesi/sonrası kıyaslanır. | Aynı nesneler → değişmiş durum; ortak konum/ölçek okunur. | İki ayrı slayt kurup izleyicinin tekrar eşlemesini isteme. | Yeni kural aynı oyuncu-kulüp bağlantısını nasıl değiştirdiğiyle gösterilir. | O: PM03 sınır/serbestlik; PM12 engel/kalkmış engel |

## Kaynak anahtarı ve aktarım sınırı

| ID | Creator / kaynak | Burada kullanılan sınırlı ders |
|---|---|---|
| PM01 | [kirill sh](https://prompt-motion.com/shneural-2abdfa) | Temas → tepki → mevcut yüzeyin genişlemesi. Dosya iki karşılaştırmalı reel içerir. |
| PM02 | [Gizem Akdag](https://prompt-motion.com/gizakdag-cf4ae6) | Yoğunluk sonrası anlamlı sakinlik; collage/RGB overload Bay için karşı örnek. |
| PM03 | [Pankaj Kumar](https://prompt-motion.com/pankajkumar-dev-0bee87) | Görünür kısıt, ayrık çıkış/giriş, eski yüzeyin context kalması. |
| PM04 | [Gadgetify](https://prompt-motion.com/gdgtify-287ddf) | Okunan sözün işlev alması ve sonucun önceki yapı üzerine kurulması. |
| PM05 | [fionn](https://prompt-motion.com/fionntobin-97b7af) | Aynı birimlerin düzlem/hacim değişiminde kimliğini koruması. |
| PM06 | [Itsuki Abe](https://prompt-motion.com/itsuki-dev-10942d) | Sabit anchor çevresinde değişim; tünel/particle bölümleri alınmaz. |
| PM07 | [ultima](https://prompt-motion.com/ultimaxbt-bbebf5) | Tanınan taşıyıcı, hareketiyle oluşan iz ve ayrık text/diagram zamanı. |
| PM08 | [Lukáš Eršil](https://prompt-motion.com/lukasersil-0ed38e) | Aynı konumda düz/hacimli karşılaştırma; parlak efekt montajı alınmaz. |
| PM09 | [RoundtableSpace](https://prompt-motion.com/roundtablespace-d3a1be) | Ortak başlangıç/hedefle easing karşılaştırması. Yeniden paylaşım/asset tekrar ihtimali kayıtlı. |
| PM10 | [Heather Cooper](https://prompt-motion.com/hbcoop-de365c) | Hareket eden uçtan çizim, retained referans ve nesnenin metinsel rolü. |
| PM11 | [Samarth H K](https://prompt-motion.com/shinskinakamoto-20190b) | Ortak merkez, anlamsal sürekliliği tek başına kanıtlamaz. |
| PM12 | [Kent](https://prompt-motion.com/kantamk-61f410) | Görünür kısıt, release ve state’e bağlı sayaç. Neon/tekrar/particle alınmaz. |

**Sayım:** Brief’teki 57 pattern + `SCALE_HIERARCHY` = **58**. Dış referans gözlemi bulunmayan pattern’lar P olarak açık bırakılmıştır; varmış gibi kaynak atanmamıştır. Üretim kanıtı, seçilen pattern’in Bay state planında ve kritik geçişinde ayrıca doğrulanmasıdır.
