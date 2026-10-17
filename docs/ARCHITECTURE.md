# Mimari

Engine, dosyalar üzerinden ilerleyen yerel bir pipeline'dır. Merkezi ayarlar `config/engine.config.json`, JavaScript bağımlılıkları `package.json` ve kilit dosyası, yerel Python ortamı ise Whisper katmanı içindir. Gereksiz web framework'ü veya cloud orkestrasyonu yoktur.

## Katmanlar ve sınırlar

| Alan | Girdi → çıktı | v0.1 sorumluluğu |
| --- | --- | --- |
| `brief/`, `research/`, `script/` | Konu → kaynaklar ve okunacak metin | İnsan tarafından hazırlanacak içerik için bölüm iskeleti |
| `audio/` | Gerçek ses kaydı → değişmeden saklanan kayıt | `voice_original.wav`; pickup kayıtları ayrı dizinde |
| `engine/transcription/` | Gerçek ses → raw ve clean JSON | Yerel OpenAI Whisper, segment ve kelime zamanları, izlenebilir düzenleme modeli |
| `engine/storyboard/` | Zamanlı anlatım + editoryal kararlar → sahne kayıtları | Storyboard veri modeli ve doğrulama; otomatik storyboard compiler yok |
| `engine/assets/` | Asset planı → yerel dosya ve provenance | Gerçek/generated ayrımı ve kaynak takibi; otomatik indirme/lisans onayı yok |
| `engine/composition/` | HTML/CSS/JS + yerel materyal → HyperFrames composition | Teknik test kompozisyonu; gelecekte sahne bazlı yazım |
| `engine/audio/` | Orijinal kayıt, müzik, SFX, pickup → ileride mix/EDL | Ses işleme için ayrılmış sınır; otomatik splice ve destructive normalization yok |
| `engine/qa/`, `qa/` | Composition/render/veri → doğrulama bulguları | Teknik kontroller; editoryal ve lisans onayının yerini almaz |

## Bölüm kontratı

`episodes/_template/` yeni bölümlerin başlangıcıdır. `python3 scripts/new_episode.py michelin` komutu deterministik olarak `episodes/episode-michelin/` oluşturur; var olan hedefi ezmez. Araştırma ve storyboard şablonları boş başlar. Orijinal ses ve raw/clean transcript dosyaları gerçek kayıt işlenene kadar oluşturulmaz. Test verisi gerçek bölüm verisi gibi sunulmaz. Kurulum ve komutların tamamı için [README](../README.md).

Bir bölümün temel sınırları:

- `research/sources.json`: iddiaları destekleyen araştırma kaynakları.
- `script/script_master.md`: okunması planlanan metin; zaman otoritesi değildir.
- `audio/voice_original.wav`: kayıt zamanının otoritesi. `audio/pickups/`: sonradan okunan ayrı parçalar ve `pickups.json` planı.
- `transcript/transcript_raw.json`: Whisper çıktısı ve kelime zamanları; clean üretimi bu dosyanın üzerine yazmaz.
- `transcript/transcript_clean.json`: normalize edilmiş düzenleme görünümü; zaman ve raw bağlantısı korunur.
- `storyboard/storyboard.json`: `scene_id`, başlangıç/bitiş, anlatım, classification, görsel strateji, asset ve grafik referansları.
- `storyboard/asset_plan.json`: asset kimliği, gerçek/generated ayrımı, kaynak, lisans notu, yerel dosya, çözünürlük, durum ve crop/treatment gereksinimleri.
- `composition/`: sahnelerin somut HTML/CSS/JS uygulaması. `renders/previews/` ve `renders/final/`: türetilmiş çıktılar.
- `qa/`: bölüm kontrollerinin çıktıları ve izlenebilir revizyon kayıtları.

Kimlikler veri bağlantılarını korur: sahne bir `asset_id` referanslar; bir asset bir veya birkaç sahnede kullanılabilir. Storyboard zamanları kayıt/transkript ile karşılaştırılır. Veri kontratları `schemas/storyboard.schema.json`, `asset-plan.schema.json`, `research-sources.schema.json` ve `pickups.schema.json` dosyalarındadır. Araştırma kökünde `source_kind: "research"`, asset kaynağında `source.kind: "asset"` bulunur. Asset kökeni `real`, `motion_graphic` veya `ai_generated` olarak ayrılır.

`python3 scripts/validate_episode.py episodes/episode-michelin` boş plan iskeletini doğrulayabilir. `--production` gerçek ses ve transkriptleri, kayıt zamanına referansları ve hazır/kaynaklı assetleri de arar. Çözülmemiş pickup üretim doğrulamasını durdurur. Şema kontrolü ve dosyalar arası kurallar, içeriğin doğru, lisanslı veya görsel olarak başarılı olduğunu kanıtlamaz.

Michelin planning fazında geriye uyumlu opsiyonel alanlar eklendi: `audio_duration`,
`master_narration_reference`, `critical_sync_points`, `motion_plan`, `text_overlays`;
assetlerde `selection_status`, `rights_status`, `sha256` ve kaynak ayrıntıları;
research kaynaklarında `claim_ids`. Sync kayıtları gerçek raw segment/word indekslerini,
yazımını ve başlangıç/bitişini doğrular. Seçili asset referansları hazır yerel dosya ve
hak beyanı gerektirir; adaylar envanterde kalabilir fakat sahne girdisi olamaz.
`--production` veri doğrulamasıdır; composition veya render varlığını kontrol etmez.

## Ses ve zaman

TODO — anlatım kaynağı: İleride insan kaydı ve sentetik/klonlanmış anlatım desteklenebilir. Kaynağı ne olursa olsun son anlatım ses dosyası zamanlama otoritesidir; script'ten süre veya kelime girişleri varsayılmaz. Gerekirse üretilen son anlatım da alignment/transcription aşamasından geçirilir. Bu not mevcut pipeline'ı değiştirmez ve herhangi bir sentetik ses sağlayıcısı/API entegrasyonu eklemez.

Whisper modeli config'teki `transcription.models` ve profil üzerinden seçilir. `smoke` küçük model, `production` daha kaliteli model tercihidir; makineye model zorla yüklemek veya üretim kalitesini garanti etmek değildir. Dil `tr`, kelime zamanları açık, model cache yereldir. Cihaz seçimi kullanılabilirliği kontrol etmeli ve güvenli CPU yolunu korumalıdır; MPS/CUDA sırf platform adına bakılarak varsayılmaz.

Uygulama `engine/transcription/local_whisper.py`, giriş komutu `scripts/transcribe.py` içindedir. Örnek: `.venv/bin/python scripts/transcribe.py episodes/episode-michelin --profile smoke`. `--validate-install` bölüm veya ses istemeden import/araç kontrolü yapar ve model yüklemez.

Raw kayıt tekrarı, yanlış başlangıcı veya “şey/ıı” gibi ifadeleri içerebilir. Engine bunları sessizce silmez; model yine hata veya eksik tanıma yapabileceğinden insan kontrolü gerekir. Raw JSON Whisper anahtarlarını korur; `_engine` provenance ve ffprobe süresi eklenir. Clean görünüm yalnızca boşlukları normalize eder; kelime sayısı ve zamanları korunur. `_engine.editDecisions` JSON pointer ve önce/sonra değerlerini, SHA256 kayıtları ses/raw bağlantısını izler. Raw veya clean zaten varsa transcription yeniden yazmayı reddeder.

Gelecekteki anlamlı kesme/düzeltmeler ayrıca edit decision olarak tutulmalıdır. Script cümlelerini ses aralığına zorlamak veya ses olmadan kelime zamanı uydurmak yasaktır. Ayrıntılar için [transcription kontratı](TRANSCRIPTION.md).

Pickup kaydı en az problemli zaman aralığı, neden, önerilen yeniden okuma ve replacement audio referansı taşımalıdır. Gelecekte splice uygulanırsa kayıt zamanı ile çıktı zamanı ayrı tutulur; bir EDL eşlemesi downstream kelime/sahne zamanlarını günceller. v0.1 replacement kaydını temsil etmeye hazırlanır; ses kesip birleştiren veya bütün timeline'ı yeniden hesaplayan bir sistem olduğunu iddia etmez.

## Composition ve render

HyperFrames, HTML composition'ını zaman üzerinde seek ederek yerelde render eder; FFmpeg kodlama ve gelecekteki ses/mux işlerini taşır. Teknik test 1080 × 1920 ve 30 FPS'tir. Render girdileri yerel dosyalara dayanmalıdır. GSAP kullanıldığında animasyon paused ve seek edilebilir olmalı; wall-clock, rastgelelik ve dış ağ yanıtı frame sonucunu belirlememelidir.

Geliştirme döngüsü: composition'ı yaz → lint → browser/runtime/layout kontrolü → snapshot'ı gözle incele → yerel render → ffprobe metadata. CLI seçenekleri kurulu sürümün `npx hyperframes --help` ve alt komut yardımından alınır. `publish`, cloud rendering ve yerleşik ücretli servis yolları kullanılmaz. [Resmi HyperFrames CLI referansı](https://github.com/heygen-com/hyperframes/blob/main/docs/packages/cli.mdx).

İleride sahne revizyonu `scene_id` üzerinden ilgili composition ve assetleri hedefleyebilir. v0.1 bütün storyboard'u derleyen veya yalnızca etkilenen sahneleri otomatik yeniden render eden bir compiler/cache katmanı içermez.

## Harici entegrasyon ve güvenlik sınırı

Higgsfield mevcut resmi Codex eklentisiyle kullanılabilir; config'te `generationEnabled: false` bootstrap politikasını kaydeder. Bu bayrak Higgsfield hesabının dışarıdan kullanımını engelleyen bir hesap kilidi değildir. Engine bootstrap hiçbir generation çağrısı yapmaz. Ayrıntılar: [Higgsfield durumu](HIGGSFIELD.md).

Secrets ve credentials proje dosyalarına taşınmaz. Büyük medya, render, venv, geçici dosyalar ve model cache Git dışında kalır. Orijinal kayıttan ve ham transkriptten türeyen çıktılar ayrı dosyalardır. Yeni render veya transcription işlemlerinde mevcut çıktıların korunması ve açık hata raporu, sessiz veri kaybından önce gelir.

## QA'nın kapsamı

Ortam ve import kontrolleri kurulumun kullanılabilirliğini; örnek MP4 teknik render yolunu; şema ve bölüm oluşturma testleri dosya kontratını doğrular. Gerçek sesle tanıma doğruluğu, tam bölüm ses dengesi, lisans uygunluğu, fact-check, anlatım-görsel uyumu ve kanal stili ilk gerçek benchmark sırasında ayrıca değerlendirilmelidir.
