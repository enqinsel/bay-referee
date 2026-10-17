# Reference-derived Editorial Motion Kit v1

10 Ekim 2026. RAT10N ana golden motion reference; Google Maps explanatory design-system reference. Bu fazın sonucu uygulanabilir araçlar ve zaman damgalı bir referans analizi. Michelin V5 veya kanal kimliği üretilmedi.

**Ana bulgu:** Hareketli his, kameranın sürekli gezinmesinden çok aynı görsel dünyada nesnelerin kurulması, ilişkilerinin ve rollerinin değişmesinden geliyor. Tutarlılık ise her sahnede aynı layout’u kullanmaktan değil, nesne/çizgi/metin sorumluluklarının tutarlı kalmasından doğuyor.

## İnceleme kapsamı ve kanıt

| | RAT10N | Google Maps |
|---|---:|---:|
| Video süresi | 127,200 s | 80,066667 s |
| Container süresi; ses kuyruğu dahil | 127,289 s | 80,198866 s |
| Görüntü | 720×1280, H.264 High, 30 FPS | 720×1280, H.264 High, 30 FPS |
| Native kare sayısı | 3816 | 2402 |
| Tam süreyi kapsayan sıralı örnekler | 510 | 322 |
| Kritik geçişlerde çıkarılan ardışık 30 FPS kareler | 177 / 6 pencere | 87 / 5 pencere |
| Ayrıca tek tek tam boy incelenen kritik kareler | 87 | 87 |
| Hold değerlendirmesi için ek tekil inceleme | 12 | 11 |
| Yapılandırılmış görsel durum | 114 | 70 |

İki incoming dosyası değişmeden `references/raw/` altına kopyalandı; SHA-256 eşliği doğrulandı. Her sample orijinal frame numarası, PTS ve hash taşır. 30 FPS kaynak 0,25 s’ye tam oturmadığından tam sekans cadence’i 7/8 native kare, yani 0,233333/0,266667 s’dir; son gerçek kare de dahil edildi. Kesme adayları bütün native ardışık kare çiftlerinin farklarıyla çıkarıldı, semantik yorum görsel incelemeyle yapıldı. Pixel farkı, tek başına cut veya anlamlı değişim sayılmadı.

Tam süre taraması zaman sıralı yoğun sayfalarda yapıldı; ayrıca kritik 174 kare ayrı görüntüler olarak sırayla incelendi. Dolayısıyla yalnız birkaç screenshot/contact sheet yorumu değildir. **Tüm 6218 native karenin tek tek izlendiği veya seslerin dinlendiği iddia edilmez.** Ses metadata’sı vardır; anlatım etkinliği ve SFX unknown bırakılmıştır. Kritik native pencerelerde kare kesinliği, diğer yerlerde en fazla 8/30 s örnekleme aralığı ve editorial boundary belirsizliği kaydedilmiştir.

- [RAT10N tam analiz](../references/analysis/rat10n/analysis.md), [world → state kayıtları](../references/analysis/rat10n/states.json), [kapsam günlüğü](../references/analysis/rat10n/coverage-ledger.json)
- [Google Maps tam analiz](../references/analysis/google-maps/analysis.md), [world → state kayıtları](../references/analysis/google-maps/states.json), [bileşen grameri](../references/analysis/google-maps/grammar.json), [kapsam günlüğü](../references/analysis/google-maps/review-coverage.json)
- [Kare kare inceleme paneli](../qa/reference-kit-v1/review/index.html): ham video, sıralı kareler, kritik native seriler, zamanlı olaylar, hold notları, araç galerisi ve özgün hareket deneyi.

## RAT10N’den aktarılacak üretim mantığı

| Gerçek pencere | Gözlem | Kit kararı |
|---|---|---|
| 0–5 s | Yol fotoğrafı bağlamı tutuyor; araç/kol/mekanizma kesimleri farklı görevlerle ekleniyor. Beyaz sınır ve ayrılmış vurgu, fotoğrafik nesneyi grafik alanın parçası yapıyor. | Önce asset’in rolünü belirle. Bağlam fotoğrafı ile cutout’u ayır. Outline/frame, yalnız ayrıştırma ihtiyacı varsa seçilsin. |
| 8–15 s | Fotoğraf + devir göstergesi üstte kalırken tekerlek, bar ve sayı ilişkisi kuruluyor. | Farklı medyaları aynı açıklayıcı soruya bağla; ayrı dekorlar olarak hareket ettirme. |
| 15–24 s | Şanzıman bağlam nesnesine dönüşüyor; dişliler, oklar ve oran grafiği açıklamayı üstleniyor. | Kalıcı nesnenin primary’den context’e geçmesi ayrı state’tir; her cümlede dünyayı temizleme. |
| 38,300–39,066667 s | Giriş dişlisi merkezi yaklaşık sabit; çıkış dişlisi yaklaşık 83 px sağa, ara dişli yaklaşık 222 px yukarı gider. Manuel ölçüm belirsizliği sırasıyla yaklaşık 4/12 px. | Baskın eylem bağımsız nesne/ilişki hareketidir. Tek global pan/zoom bunu açıklamaz. Kamera kotası çıkarılamaz. |
| 75,100–75,566667 s | Bölüm örtüsü ilerlerken yeni mekanizma gelir; önceki caption kısa süre taşınır ve temizlenir. | Örtü, nesne girişi, bölüm bilgisi ve caption ayrı sorumluluk/sahip taşır. Kaynak renk, diagonal veya birebir zamanlama kopyalanmaz. |
| 90,966667–91,333333 s | Seçici vurgusu yaklaşık 61 px aşağı kayarken fotoğraf/chip bağlamı kalır. | Yerel seçim değişimini yerel hareketle açıkla; bütünü yeniden kurma. |

Ana repertuvar: fotoğraf/cutout + custom diagram + bağımsız rotate/enter/exit/replace + bar/sayı/ok + section geçişi. Dişli dönüşü dekor değil mekanik ilişki, gösterge hareketi veri, nesnenin küçülmesi rol değişimi taşır. Öte yandan grain, idle float, sınır parıltısı ve genel progress rayı yeni bilgi sayılmaz. Gerçek çekim/fotoğraf/generated kökeni kesin değilse kesinlik uydurulmadı. İncelenen görsel ile dış etiket çelişebiliyorsa bu referans da eleştirilir; kalite referansı hatasızlık garantisi değildir.

## Google Maps’ten aktarılacak tasarım grameri

Bu video baştan sona tek kesintisiz dünya değildir. On world instance, dokuz aile içinde tutarlı bir çizim dili kullanır; açılış haritası daha sonra geri döner. Tek araç paneli ile kalabalık paneli aynı dünya ailesidir ama native geçişte aynı fiziksel instance’ın çoğalması değildir.

Telefonun dış silüeti iç ayrıntıdan güçlüdür. Yol çevresi şeritlerden güçlüdür. Araç/telefon/bina az sayıda tanınır primitive kullanır. Label sahibi nesneye yakın durur; badge sonuç/durum, pill bölüm/kimlik taşır. Şekillerin ortak stroke, köşe, derinlik ve scale ilişkisi olması; aynı koordinatları paylaşmaları anlamına gelmez. Bu yüzden kit font/hex/layout değil **rolleri** tanımlar.

En açık sequence 44–62 s ağıdır: düğümler → kenarlar → mesafe maliyetleri → süre maliyetleri → tercih edilen yol → maliyet artışı → yeni yol. **n1549→1550, 51,633333→51,666667 s:** KM etiketleri DK’ye tek karede değişirken topoloji korunur. **n1832→1833, 61,066667→61,100 s:** tıkalı kenarın ve seçilen yolun rolü değişir; yeni toplam rozeti sonra gelir. Tween zorunluluğu yoktur; küçük yeterli değişkeni değiştirmek yeterlidir.

GPS düzeltmesinde n1075→1081 konum noktası yaklaşık 123 px/0,20 s hareket eder. Sabit bina patch’inin 15 ardışık farkının MAE’si 0’dır. Bu pencere nesne hareketini doğrular; bütün videoya “%X kamera” sonucu genellenmez. Ölçüm JPEG/RGB tabanlıdır, kaynak vector koordinatı veya fiziksel hız değildir.

## Çalışır kit

| Parça | Teslim |
|---|---|
| Tasarım rolleri ve token’lar | `engine/design-system/tokens/v1.json`, `index.mjs`; spacing/stroke/radius/type/caption/micro/annotation/depth/shadow/outline/safe-role/duration/easing; bölüm vurgusu açık parametre |
| Kalıcı nesne ve hareket | `engine/motion/editorial-state.mjs`; mutlak zamanda pose, sahiplik çakışma denetimi, state seçimi, nesne farkı |
| Anlamlı durum ve yoğunluk | `engine/qa/visual-state-density.mjs`, `scripts/visual-state-qa.mjs`; soft hold incelemesi; dekoratif kıpırtılar hariç |
| Asset işlemleri | `engine/assets/treatments/index.mjs`; istenen 20 araç, gerçek PNG işleme, manifest ve ham/türev ayrımı |
| Yerel arka plan kaldırma | Küçük U2NetP ONNX, CPU; ana Python/npm değişmeden izole runtime; renk anahtarı ve açık maske ayrı modlar |
| Tekrar kullanım | Input/parametre/maske/model/runtime/implementasyon hash’li cache; bozuk türev reddi ve açık onarım |
| Çalışır örnekler | 20 sentetik işlem + gerçek portrede segmentasyon; bağımsız 12 s nesne/ilişki/rol deneyi, iki özgün vurgu rengi |
| Entegrasyon rehberi | [Design-system README](../engine/design-system/README.md), [treatment API ve sınırlar](../engine/assets/treatments/README.md) |

Kit, tüm araçların aynı sahnede kullanılmasını istemez. Sabit fotoğraf+caption kartı, zorunlu telefon/rozet dizilimi veya aynı sahne sırası oluşturmaz. İhtiyaç gerçek asset → işleme → custom graphic → programatik ilişki şeklinde çözülür. Generated media ve ses sahne ihtiyacına bağlı seçeneklerdir; bu fazda yeni generated medya veya ücretli servis kullanılmadı.

## Yoğunluk teşhisi

RAT10N girdisi 141 anlamlı olay; Google Maps 75 olay içeriyor. Bunlar storyboard state sayısıyla aynı metrik değildir: kritik sürekli eylem pencereleri ayrıca kaydedilir, yerleşmiş poz yeni bilgi diye sayılmaz. İlk sonuç RAT10N’de 5, Google Maps’te 12 `LONG_VISUAL_HOLD_REVIEW`; her ikisinde `hard_failure:false`. Bunlar “kötü sahne” sayısı değildir. Ağın okunması veya sonuçların anlaşılması için bilinçli hold, hareket doldurmaktan daha doğru olabilir.

Anlatım dinlenmediği için `narration_active:null`; referans üzerinden üretici niyeti iddia edilmez. Saha üretiminde gerçek ses/okunurluk incelenip ilgili hold’a cevap yazılır. Pixel hareketi, caption karaoke veya her kare artan dekoratif sayı yeni anlamlı durum olarak kaydedilmemelidir. Teşhis, analist kayıtlarının doğruluğunu kendi başına görsel olarak kanıtlamaz.

## Kalite sınırları ve koruma

Yerel modelin gerçekten çalışması başarılı cutout demek değildir. Gerçek portrede koyu halo ve ceket kaybı, sentetik örnekte de istenmeyen alan tutulması görüldü. Her iki ML galeri örneği `REVIEW_REQUIRED`; production-approved değildir. Gerekirse açık maske düzeltmesi kullanılır. Bu sınır galeride gizlenmedi.

U-2-Net/rembg kod lisansları ve indirilen modelin hash/kaynağı ayrı kaydedildi. İncelenen kaynaklarda ağırlık dosyasına özel ayrı lisans beyanı bulunmadığı için kod lisansından ticari ağırlık izni varsayılmadı. Model özel yerel araç cache’inde; episode/export içine eklenmiyor. Fotoğraflar inference için dışarı gönderilmiyor.

Orijinal medya ve önceki Michelin/engine dosyaları `qa/reference-kit-v1/preservation-baseline.json` ile karşılaştırılır. Son kontrol ve test sonuçları `qa/reference-kit-v1/validation.json` içinde. Bu eklemeler mevcut bölüm onaylarını veya render’ları değiştirmez.

## Yeniden çalıştırma

Proje kökünde:

```sh
node --test tests/test_editorial_state.mjs tests/test_visual_state_density.mjs tests/asset-treatments.test.mjs
node scripts/visual-state-qa.mjs references/analysis/rat10n/density-input.json qa/reference-kit-v1/rat10n-density.json
node scripts/visual-state-qa.mjs references/analysis/google-maps/density-input.json qa/reference-kit-v1/google-maps-density.json
node scripts/reference-kit-review.mjs
node scripts/serve-reference-kit.mjs
```

İnceleme: `http://127.0.0.1:8773/qa/reference-kit-v1/review/`. Sunucu yalnız loopback, salt okunur ve kit/reference yollarıyla sınırlıdır. Tüm medya yereldir.
