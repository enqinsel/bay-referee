# Editorial Motion Kit v1 — kullanım grameri

Bu katman sahne şablonu veya kanal kimliği değildir. Bir sahnenin neyi açıkladığı, hangi nesnenin kalacağı ve hangi ilişkinin değişeceği önce yazılır; token, treatment ve motion araçları bunun ardından seçilir. Sayılar başlangıç değeridir, referans videolardan ölçülerek kopyalanmış koordinat/font/palet değildir.

## Bir sahneyi kurma sırası

1. **İddia ve kanıt:** Görsel hangi bilgiyi taşıyor? Fotoğrafın içeriği, tarihi ve gösterdiği ayrıntı iddiayla uyumlu mu? Gösterge fotoğrafındaki değer ile dışarıya eklenen etiket çelişiyorsa işlem güzel görünse bile asset uygun değildir.
2. **Visual world:** İzleyicinin aynı koordinat ilişkileri içinde öğrenmeye devam edebileceği alanı tanımla. Yeni cümle otomatik yeni dünya değildir. Aynı tür ikonun yeni panelde görünmesi de aynı nesne instance’ı değildir.
3. **State:** Önceki duruma göre `enter`, `exit`, `persistent`, `updated` nesnelerini yaz. Her nesnenin kimliği, rolü, kanıtı ve hareket sahibi olsun. Primary / secondary / tertiary hiyerarşiyi ve bir sonraki öğeye ayrılan boşluğu belirle.
4. **Asset treatment:** Ham kaydı tut, yalnız gereken crop/mask/outline/frame vb. işlemleri seç. Maskeyi hem açık hem koyu zeminde incele. Fotoğraf bağlamı kanıt taşıyorsa arka planı kaldırma. Türev boyutu değişince yerleşimi yeniden hesapla.
5. **İlişki ve zaman:** Nesne girişi, okunması, ilişkisi ve sonucu farklı sorumluluklardır. Sonuç, öncülünden sonra gelsin. Aynı ağda veri birimi değişiyorsa geometriyi yeniden kurmak gerekmez. Bir karelik anlamlı veri değişimi geçerli bir state event’tir.
6. **Metin:** Caption konuşmayı taşır; technical label nesneye, data label ölçüme, annotation ilişkiye aittir. Her caption kelimesini ayrı state sayma. Micro label tek başına zorunlu bilgiyi taşımasın. Caption alanı sahne ve platform safe-zone’larına göre yerleştirilir; her video için sabit alt kutu yoktur.
7. **Ses kararı:** Görünen olaya bağlı bir gerekçe yaz. Fiziksel/literal ses yalnız kanıtlanan eyleme; editorial vurgu ilişki/karar/bölüm değişimine bağlanır. Her nesne girişine whoosh, sürekli mekanik loop veya zorunlu müzik ekleme. Sessizlik de geçerli seçimdir. Bu iki referansın sesleri bu analizde dinlenmedi; kaynak SFX veya senkron kararları doğrulanmış kabul edilmez.
8. **İnceleme:** Tam hız, ardışık kareler, keyfi seek, okunurluk ve asset-iddia uyumu birlikte kontrol edilir. Yoğunluk uyarısı süreyi kısaltma emri değildir; bilinçli okuma zamanı mı, açıklama boşluğu mu sorusudur.

## Token API

```js
import {resolveTokens, tokensToCSS} from './engine/design-system/tokens/index.mjs';
const tokens = resolveTokens({
  width:1080,
  fontFamily:'system-ui',
  episodeAccent:'#38695e',
  colors:{paper:'#eeeee7',ink:'#242b28'}
});
const css = tokensToCSS(tokens); // :root custom properties
```

`episodeAccent` zorunludur; kanal rengi örtük biçimde seçilmez. Tipografi ailesi bölüm kararıdır, `system-ui` yalnız yerel fallback’tir. Boyutsal token’lar genişlikle ölçeklenir; katman sırası ve süreler ölçeklenmez. `safe_roles` geometrik safe-zone maskesinin yerine geçmez; mevcut platform QA maskeleri uygulanmaya devam eder. Stroke/silüet ve iç detay farklı roller taşır. Köşe yarıçapı, badge veya shadow kullanma zorunluluğu yoktur.

## Nesne hareketi API

```js
import {sampleObjectTrack, diffObjects, stateAt, validateMotionOwners}
  from './engine/motion/editorial-state.mjs';
const move = {
  object_id:'archive-cutout', owner:'cutout-wrapper',
  purpose:'Ana özneyi bağlama taşıyarak ilişki çizgisine yer aç',
  start:4.2,end:4.8,easing:'smoothstep',
  from:{x:0,scale:1},to:{x:-150,scale:.72}
};
const pose = sampleObjectTrack(move,4.5).values;
// Renderer bu değerleri mutlak konum olarak uygular; mevcut transform'a eklemez.
```

`sampleObjectTrack` renderer’dan bağımsızdır; x/y/scale/rotation/opacity veya anlamlı sayısal değişkenleri hesaplar. Opacity ile gelen **yeni nesne** anlamlıdır; zaten görünen nesnenin %2 opacity sürüklenmesi değildir. `validateMotionOwners` aynı nesnenin eşzamanlı çelişen sahiplerini bildirir. Parent kamera ve child nesne ayrı kimlik/sahip taşımalı; aynı transform’a iki animasyon yazılmaz. Keyfi seek ile yeniden hesaplama gerekir; setInterval, önceki frame’e eklenen delta veya gizli global animasyon fazı kullanma.

`stateAt` başlangıç dahil/bitiş hariç durum seçer; `diffObjects` kalıcı kimlikler üzerinden değişimi çıkarır. Bir referans component ailesinin yeniden çizilmiş instance’ına yeni ID verilir. Projedeki `engine/design/editorial.js` rota ilerlemesi ve tek SVG path üzerinden araç konumu/tanjantı gibi mevcut araçlar kullanılabilir. `engine/motion/camera.js` kamera gerektiğinde ayrı sahip olarak kalır. Kit kamera sayısı veya motion kotası getirmez.

## Meaningful visual state / soft QA

`engine/qa/visual-state-density.mjs` anlam taşıyan olaylarla çalışır. Bu, videodan otomatik anlam çıkaran bir bilgisayarlı görü modeli değildir. Analist/author kaydı gerekir:

```json
{
  "duration": 8,
  "events": [{
    "id": "route-recomputed",
    "world_id": "route-comparison",
    "object_ids": ["network", "selected-route"],
    "kind": "relationship_change",
    "start": 3.4,
    "end": 3.4,
    "description": "Yeni maliyet aynı ağ üzerinde seçilen yolu değiştirir",
    "evidence": {"basis":"authored","note":"İddia ve render planındaki seçilmiş rota değişimi"}
  }],
  "hold_annotations": [{
    "start":3.4,"end":8,"readability":"readable",
    "rationale":"İki rota ve güncel toplamın karşılaştırılması için bilinçli okuma zamanı; gerçek render’da incelendi."
  }]
}
```

Bir anlık swap için `start===end`. Gerçekten gelişen çizgi/rota/diagram hareketi için yalnız aktif süreyi ver ve `continuous:true` ekle. Etiketin ekranda kaldığı 8 saniyeyi sürekli hareket diye etiketleme. `narration_windows` verilmemişse **unknown/null**; boş dizi verilirse bilinen sessizliktir. Okunurluk bilinmiyorsa `unknown`. Gerekçe analist çıkarımıysa bunu açıkça yaz; creator intent gibi sunma.

```sh
node scripts/visual-state-qa.mjs PLAN.json QA.json
```

Her 0,25 s pencerede önceki/sonraki anlamlı olay, devam eden hareket, toplam/elapsed hold, anlatım durumu, okunurluk ve gerekçe bulunur. 2,5 s eşiği değiştirilebilir. `LONG_VISUAL_HOLD_REVIEW` **soft** uyarıdır; gerekçelendirilmiş hold da raporda kalır. `REVIEW` CLI exit 0’dır. Bozuk zaman veya bilinmeyen tür ise teknik input hatasıdır; estetik fail ile karıştırılmaz. `author_responses_required` çözülmemiş yorum sayısıdır, üretim onayı değildir.

## Araç seçme rehberi

| Sahne ihtiyacı | Başlangıç araçları | İnceleme sorusu |
|---|---|---|
| Gerçek nesneyi diyagrama katmak | focalCrop → removeBackground veya açık alphaMask → gerekirse edgeOutline | Bağlamı kaybetmek iddiayı değiştiriyor mu? Kenar doğru mu? |
| Arşiv fotoğrafını belge olarak göstermek | smartCrop/focalCrop → photoFrame veya tiltedPhoto | Fotoğrafın gerekli parçası okunuyor mu? Tilt okuma süresini uzatıyor mu? |
| Fotoğrafın bir ayrıntısını açıklamak | focusHighlight / backgroundDim / localBlur | Açık bölge gerçek kanıta mı işaret ediyor? |
| Mekanik ilişki açıklamak | custom diagram + bağımsız rotation/selector track + owning label | Hız/yön değişimi gerçekten anlatılan ilişkiyi mi temsil ediyor? |
| Karar kıyaslamak | kalıcı topoloji + atomik data/relationship swap + sonuç | Geometri değişmeden fark görülebiliyor mu? |
| Yeni bölüm | açık section event + gerekli reset + bağımsız girişler | Kavram değişti mi, yalnız cümle mi bitti? |

Gerçek asset uygun değilse özel vector/diagram çizilebilir. Generated media yalnız ihtiyacı gerekçelendirildiğinde, kaynak/provenance ve hakları kaydedilerek eklenir; tarihî belge veya gerçek çekim diye sunulmaz. Referans videolardaki asset’lerin üretim kökeni görüntüden doğrulanamaz; `possibly_generated` tahmindir, Higgsfield kullanım kanıtı değildir.

Çalışır örnek: `examples/object-lab.html`. Önceki Michelin kompozisyonlarından bağımsız, 12 saniyelik etkileşimli araç deneyi. Yeni bölüm/videosu veya tavsiye edilen sabit layout değildir.
