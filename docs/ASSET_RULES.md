# Asset ve bilgi kuralları

## Önce gerçek materyal

Görsel arama ve tasarım sırası:

1. Gerçek video.
2. Gerçek fotoğraf.
3. Tarihi/arşiv materyali.
4. Gerçek belge, gazete, reklam veya harita.
5. Kodla üretilen açıklayıcı grafik ve motion.
6. Gerekçesi varsa Higgsfield.

Sıralama, bulunan ilk stok görüntüyü kullanmak demek değildir. Materyal anlatılan yer, kişi, nesne, dönem veya iddiayla ilişkili olmalıdır. Gerçek Ayasofya anlatılırken gerçek Ayasofya materyali aranır. Dönem, konum veya kişi belirsizse asset kaydında belirtilir; şüpheli görsel tarihsel kanıt gibi sunulmaz.

Higgsfield ancak gerçek materyal bulunamadığında, açıkça ayrıştırılan tarihsel canlandırmada, soyut kavramda veya anlamlı bir görsel geçişte değerlendirilir. `origin: "ai_generated"` materyal hiçbir zaman `real` olarak işaretlenmez; canlandırma gerektiğinde izleyiciye uygun şekilde belirtilir. Kodla oluşturulan açıklayıcı grafikler `motion_graphic` kökeniyle ayrı tutulur. AI asset kaydı Higgsfield sağlayıcısını, izin verilen kullanım nedenini ve somut gerekçeyi taşımalıdır. Bulunamayan gerçek görüntünün yerine sessizce sahte kanıt konulmaz. Bootstrap sırasında bu seçenek kullanılmaz.

## İki ayrı kaynak

| Kayıt | Yanıtladığı soru | Örnek |
| --- | --- | --- |
| Research source | “Bu bilgi neden doğru?” | Tarih veya istatistiği destekleyen kurum kaydı |
| Asset source | “Ekrandaki materyal nereden geldi; nasıl kullanılabilir?” | Fotoğrafın arşiv sayfası, hak sahibi ve lisans bilgisi |

Aynı URL bazen iki rolü taşıyabilir; roller yine ayrı kaydedilir. Google görsel arama sonucu veya bir sosyal medya repost'u tek başına güvenilir provenance/lisans kaydı değildir. Kaynak sayfası ve varsa orijinal arşiv kaydı saklanır. Kamuya açık erişim, otomatik kullanım hakkı anlamına gelmez.

## Asset planı

Her plan kaydı şu bilgileri taşıyabilecek şekilde hazırlanır:

- `asset_id`, açıklama, tür ve bağlı olduğu sahne/sahneler.
- `origin`: `real`, `motion_graphic` veya `ai_generated`; AI ise neden gerekli olduğu.
- Kaynak URL'si, başlığı, attribution ve lisans notları.
- Yerel filepath, çözünürlük, edinme/kontrol durumu.
- Crop/treatment gereksinimleri; belge veya görüntüde görünür kalması gereken kritik alanlar.

Dosya adı kaynağın yerine geçmez. Edinilen dosya ilgili `assets/archive`, `images`, `video`, `documents`, `maps`, `graphics` veya `generated` dizinine konur. Asset kimliği dosya adı değişse de bağlantıları korumalıdır. Yeterli çözünürlük, 9:16 kırpma, okunabilirlik ve kullanım notları render öncesinde kontrol edilir. `schemas/asset-plan.schema.json` veri biçimini belirler. v0.1 bu modelin iskeletini sağlar; otomatik materyal toplama veya lisans doğrulama yapmaz.

## Asset + bilgi katmanı

Kritik bilginin mümkün olduğunca söylendiği anda görselleşmesi hedeflenir. Gerçek görüntüye sayı, tarih, ölçüm çizgisi, harita, grafik veya kısa açıklama eklenebilir. Overlay zamanını kayıt/kelime zamanları belirler; kaynak metnin tahmini okuma hızı belirlemez.

Grafikte ölçek, birim ve karşılaştırma anlamı korunur. Yaklaşık değer kesin değer gibi gösterilmez. Kaynak belgedeki yazı, sayı veya görüntü anlamı bozacak şekilde kırpılmaz. Grafik anlatımı açıklamıyorsa yalnızca hareket eklemek için kullanılmaz.

## Devamlı sekans ve motion

Tek bir arşiv materyali birkaç anlatım anını taşıyabilir: bütün sayfa → anlamlı crop → ilgili satırı vurgula → annotation → tarih. Her cümle için yeni shot üretmek zorunlu değildir.

Varsayılan olarak sürekli parallax, anlamsız zoom, particles, glow, her sözcükte pop, rastgele transition, aşırı hızlı kesme veya tekrar eden Ken Burns kullanılmaz. Hareket izleyicinin bakması gereken yere ve bilginin ortaya çıkma sırasına hizmet eder. Farklı kaynakların estetiğini tutarlı kılmak için treatment düşünülebilir; kaynak kimliği veya gerçekliği gizlenmez.

## Revizyon öncesi kısa kontrol

- Asset anlatılan şeyi doğru temsil ediyor mu?
- Research ve asset kaynakları ayrı ve geri bulunabilir mi?
- Gerçek/generated ayrımı doğru mu; canlandırma gereği açık mı?
- Kritik bilgi doğru sözcük veya anlatım aralığında görünür mü?
- Crop, overlay ve hareket bilgiye hizmet ediyor mu?
- Lisans/attribution notu ve yerel dosya kaydı tamam mı?

Eksik alanlar görünür şekilde `planned`, `missing` veya inceleme bekleyen durum olarak kalmalıdır. Boş kaydı doldurmak için uydurma URL, lisans, attribution veya hazır içerik yazılmaz.
