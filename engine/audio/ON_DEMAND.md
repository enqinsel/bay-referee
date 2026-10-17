# Scene-driven, on-demand SFX

8 Ekim 2026 itibarıyla yeni üretim yolu budur. SFX Studio, ayrı audition, 15 aday veya önceden onaylanmış ses seti **zorunlu üretim adımı değildir**. Eski V3/V004 kaynakları, audition ve review UI'ları tarihî karşılaştırma için korunur; yeni build bunlara bağımlı değildir.

## Karar akışı

1. Görsel olayı yaz: kâğıt yer değiştiriyor, araç hareket ediyor, rating ilişkisi değişiyor, yalnız editorial cut oluyor.
2. Ses niyetini tanımla: malzeme teması, hafif fiziksel hareket, kısa bilgi aksanı veya **NONE**. Ses olaydan gelmeli; mevcut sevilen dosyaya sahnede yer arama.
3. Önce mevcut proje/cache manifest'ini gerçek `asset_id`, source ID, kategori ve etiketlerle ara. Eski `audition_id` 01–15 sadece bir sunum sırasıdır.
4. Aday gerçekten uygun değilse yalnız o ihtiyaç için lisansı uygun Mixkit/Pixabay veya kullanıcı yetkiliyse Envato kaynağını incele. Generation, ücretli satın alma veya subscription bypass bu akışın parçası değildir.
5. Kaynağı, orijinal başlığı, yaratıcısı açıklanmamışsa bunu, source/license URL'sini, indirme tarihini, özgün yolu, SHA-256 ve yapılan trim/mix işlemini kaydet. Kaynak dosyayı değiştirme.
6. Narration'ı önde tutarak mix yap; gerekiyorsa voice+SFX'e ortak headroom gain uygula. Orijinal WAV/timing otoritesi korunur.
7. Bitmiş prototype içinde final AAC decode, clipping, peak/true peak ve ilgili RMS ölçümlerini kaydet. İnsan sesi bitmiş görüntü içinde değerlendirir.

Bu sıralama minimum cue sayısı üretmez. `SFX=NONE`, boş bed ve sadece özgün voice excerpt tamamen geçerlidir. Müzik de ayrıca gerekçe ister.

## Cue planı

Ses niyeti üç ayrı kategoriden gelebilir: **literal**, görünür kâğıt veya nesne temasını taşır; **editorial**, authored yıldız, tarih veya rota ilişkisinin gelişini/sonucunu belirtir; **ambient**, sahnenin dünyasına süreklilik verir. Editorial cue için gerçek fiziksel kaynak görünmesi gerekmez. Her kategori isteğe bağlıdır; NONE ve sessizlik geçerlidir. Bir ikonun hareket etmesi motor sesi gerektirmez.

Yaklaşık local narration RMS −10…−18 dB yalnız başlangıç rehberidir. Her cue kendi `margin_db` kararıyla mix edilir; algoritma bu aralığı estetik hard gate yapmaz. Ölçülebilir duyulur enerji, dinleyerek anlaşılabilirlik veya tını onayının yerine geçmez.

```json
{
  "event_id": "guide-paper-edge",
  "visual_event": "Guide edge hands off to a related archive material",
  "time": 1.76,
  "sound_intent": "restrained paper contact",
  "decision": "NONE",
  "asset_id": null,
  "reason": "The editorial cut already provides the accent; no physical paper movement is shown",
  "provenance_record": null,
  "auditory_review": "not_heard_by_model; finished prototype reviewed by human"
}
```

Ses seçilirse `decision: USE` ve gerçek `asset_id`/provenance kaydı gerekir. Metadata veya RMS ölçümü sesin zarif, gerçekçi ya da rahatsız etmeyen nitelikte duyulduğunu ispatlamaz. Model sesi duymadıysa açıkça söyler; bu durum ayrı audition UI açma zorunluluğu doğurmaz.

## Mevcut teknik araçlar

- `mix-sfx.mjs`: V3'ün katı −32 dBFS / ≥18 dB güvenlik denemesini yeniden üretir. Eski davranışı değiştirme; yeni evrensel mix standardı değildir.
- `preflight-mix.mjs`: native narration excerpt, effect preparation, local relative RMS, common headroom ve final ölçüm fonksiyonları sağlar. `mixRelative` boş cue listesini kabul eder. Eski audition normalization fonksiyonu isteğe bağlıdır; yeni akış çağırmak zorunda değildir.
- `mixRelative` varsayılanını korur ve cue bazında pozitif `margin_db` alır. Eski 10–18 dB API sınırı kaldırıldı; narration altı göreli seviye, son clipping/true-peak kontrolü ve dinleme değerlendirmesi ayrı görevlerdir.
- Yeni bölüm script'i scene cue planını okur; `sfx-shortlist-v1.json`, `audition-timeline.json`, 40/15 adet koşulu veya audition render'ına bağımlı olmaz.

## Saklama ve haklar

Mevcut 40 kaynak manifest ve hash'leriyle cache olarak kullanılabilir; hepsinin uygun veya işitilerek onaylı olduğu varsayılmaz. Eski audition dosyaları silinmez, yeni zorunlu giriş kapısı olmaz. Ses kaynağının standalone yeniden dağıtım yasağı, bitmiş esere eklenebilmesinden farklıdır: kaynak WAV'lar private kalır. Yeni SFX yalnız bir sahne ihtiyacını karşılamak için edinilir; kütüphane sayısı büyütmek hedef değildir.
