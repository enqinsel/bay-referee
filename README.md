# Video Engine v0.1

17 Ekim 2026 — **BAY REFEREE Portable Repository V1**: güncel production authority, [maintained kanal skill’i](brand/bay-referee/channel-skill/bay-referee/SKILL.md) ve [ikinci makine kurulum rehberidir](docs/SECOND-MACHINE-SETUP.md). Yeni bir Mac’te `node scripts/setup-bay-referee.mjs` ile başlayın; `npm run smoke:portable` kaynakları medya üretmeden doğrular. Yeni bölümler `videolar/<slug>/` altında oluşur; bu çıktı klasörü Git ile senkronlanmaz.

[Portable repo inceleme paketi](docs/portable-repository-v1/final-report.md), [seçilmiş kaynak manifesti](docs/portable-repo-manifest.md) ve [çıktı aktarım politikası](docs/OUTPUT-SYNC-POLICY.md) kaynak, arşiv ve özel dosyaları ayırır. Aşağıdaki tarihli kayıtlar eski deneylerin değişmeden korunan geçmişidir; bu kayıtların bazı dosyaları yalnız ev bilgisayarındaki arşivde bulunur ve yeni portable kurulumun bağımlılığı değildir.

10 Ekim 2026 güncel teslim: **[Football Comparison Format V2](formats/football-comparison-v2/README.md)**. İnsan tarafından yönü onaylanan V1’in aynı 45,23 saniyelik anlatımı ve özgün rehberi, kesintisiz yeşil saha dünyası, geçirgen rol bölgeleri ve daha okunur futbol nesneleriyle yeniden üretildi. [V2 inceleme ekranı](http://127.0.0.1:8778/formats/football-comparison-v2/review/) ve [revizyon raporu](formats/football-comparison-v2/report.md). Ses geçici rehber kaydı; sabit yerleşim ve maskotun fiziksel etkileşimi hâlâ yaratıcı sınır. [V1](formats/football-comparison-v1/README.md) ve 486 dosyası değişmeden korundu. Kalıcı kanal skill’i veya görsel kimlik kilidi oluşturulmadı.

Michelin/Bosman serbest belgesel yaklaşımı önceki üretim ve araştırma geçmişi olarak korunur. Aşağıdaki eski sürüm notları, o tarihlerdeki kapsamı anlatır.

8 Ekim 2026 capability update: [art-direction study](research/art-direction/ART_DIRECTION_STUDY.md), [28 professional patterns](research/art-direction/PROFESSIONAL_PATTERNS.md), [17 technique contracts + 9 relational layouts](engine/design/README.md) ve [on-demand SFX workflow](engine/audio/ON_DEMAND.md). Ayrı audition/approved-shortlist yeni üretimin zorunlu adımı değildir; `SFX=NONE` geçerlidir. Eski review ekranları ve V1–V004 çıktıları korunur. Bu çalışma tam V4 veya kanal stili onayı değildir.

Gerçek insan seslendirmesini zaman otoritesi kabul eden, bilgi/hikâye odaklı dikey videolar için yerel üretim altyapısı. Varsayılan çıktı 1080×1920 / 30 FPS, hedef bölüm süresi 45–90 saniyedir. Michelin benchmark sürümleri insan review önizlemeleridir; kalıcı kanal stili değildir.

7 Ekim 2026 Michelin V3: **PARTIAL — video hazır, SFX işitsel review bekliyor**. Final polish + engine hardening: ayrı `composition-v003/`; proje platform safe zone, text responsibility, daha küçük yıllar, sabit kamera, sade Beat08 ve beş gerçek SFX olayı. 44 test, 40 pre-render kontrolü, 20 gerçek MP4 kare karşılaştırması ve 61 crop korelasyonu PASS. Son teslim durumu ve ölçümler [V3 handoff](episodes/episode-michelin/qa/v003-handoff.json), [editorial review](episodes/episode-michelin/qa/v003-editorial-review.md) ve [V2/V3 karşılaştırma](episodes/episode-michelin/qa/v002-v003-comparison.md) içinde. [V3 video](episodes/episode-michelin/renders/previews/michelin-v003.mp4), [contact sheet](episodes/episode-michelin/qa/v003-contact-sheet.jpg), [safe-zone sheet](episodes/episode-michelin/qa/v003-safe-zone-contact-sheet.jpg).

```sh
node scripts/michelin-v003-qa.mjs
node scripts/render-michelin-v003.mjs
node scripts/michelin-v003-qa.mjs --render-frames
```

İlk komut bütün 30 fps frame zamanlarında gerçek HyperFrames seek ile aktif sahne/nesne, glyph sınırı, caption içeriği ve kamera geometrisini denetler. İkinci komut beş SFX'i özgün narration örneklerine unity gain ile ekler ve H.264/AAC çıktısını üretir. Üçüncü komut gerçek MP4 karelerini ve sabit crop korelasyonunu kontrol eder. Kaynak değişirse pre-render QA tekrarlanmalıdır. V1/V2'nin 165 korunan dosyası hash ile doğrulanır.

Generic araçlar: [platform profilleri](config/platform-safe-zones.json), [kamera](engine/motion/README.md), [caption](engine/captions/README.md), [SFX mix](engine/audio/README.md), [motion araştırması](research/motion-references/motion-reference-notes.md). HyperFrames tek renderer'dır.

Özel SFX kütüphanesi 40 gerçek dosya/11 kategori içerir. [Yerel dinleme ekranı](http://127.0.0.1:8769/sfx-review/) yalnız localhost'ta sunulur; sunucu kapalıysa engine kökünde `python3 -m http.server 8769 --bind 127.0.0.1` ile açılabilir. Dosyalar metadata/sinyal kontrolünden geçti; işitsel kalite onayı bekler. Kaynak WAV'lar Git'e, public host'a veya dağıtılacak source paketine eklenmez. [Kaynak ve lisans notları](research/sfx-library-notes.md).

Aşağıdaki V2/V1 kayıtları sürüm geçmişidir. V4, kanal skill'i ve kalıcı stil token'ı oluşturulmadı.

6 Ekim 2026 Michelin V2: **READY_FOR_HUMAN_REVIEW**. İnsan V1 review’ına göre hazırlanan ayrı `composition-v002/`; tam ekran medya, üç yeni açık haklı dönem asseti, yerel Archivo, daha güçlü yollar ve opening/final callback. 39 test, 33/33 pre-render kontrolü, 17/17 gerçek MP4 kare karşılaştırması, ffprobe/ses/decode PASS. V1’in 72 korunan dosyası değişmedi. [V2 video](episodes/episode-michelin/renders/previews/michelin-v002.mp4), [V2 contact sheet](episodes/episode-michelin/qa/v002-contact-sheet.jpg), [editorial review](episodes/episode-michelin/qa/v002-editorial-review.md), [V1/V2 karşılaştırma](episodes/episode-michelin/qa/v001-v002-comparison.md), [V2 handoff](episodes/episode-michelin/qa/v002-handoff.json).

Michelin V2 komutları:

```sh
node scripts/michelin-v002-qa.mjs
node scripts/render-michelin-v002.mjs
node scripts/michelin-v002-qa.mjs --render-frames
```

V2 benchmark iterasyonu olarak korunur; kalıcı kanal stili değildir. Aşağıdaki V1 kaydı sürüm geçmişidir.

6 Ekim 2026 Michelin V1: **READY_FOR_HUMAN_REVIEW**, 39 test ve 22/22 pre-render kontrolü PASS. [Video](episodes/episode-michelin/renders/previews/michelin-v001.mp4), [V1 review](episodes/episode-michelin/qa/v001-review.md), [contact sheet](episodes/episode-michelin/qa/v001-contact-sheet.jpg).

Michelin V1 komutları:

```sh
node scripts/michelin-v001-qa.mjs
node scripts/render-michelin-v001.mjs
node scripts/michelin-v001-qa.mjs --render-frames
```

İlk komut yerel lint/runtime/snapshot kontrollerini çalıştırır; ikinci komut **v001 preview dosyasını yeniden üretir** ve mux/decode doğrular; üçüncü komut MP4 karelerinden contact sheet oluşturur. Kompozisyon kaynakları QA’dan sonra değişirse render yeniden QA ister. Bu komutlar V2 oluşturmaz. Kaynak ses ve raw transcript korunur.

Aşağıdaki bootstrap bölümleri ilk kurulumun tarihsel kapsamını ve teknik smoke örneğini anlatır. İlk bootstrap: 32 test, 7/7 kontrol; [BOOTSTRAP_VERIFICATION.md](docs/BOOTSTRAP_VERIFICATION.md).

## Kurulum

Bu bilgisayarda proje: `/Users/engin/Desktop/video-fabrikası/video-engine`.

```sh
cd '/Users/engin/Desktop/video-fabrikası/video-engine'
npm ci
```

Node ≥22 gerekir. `npm ci`, kilitlenmiş HyperFrames, GSAP ve platforma uygun FFmpeg/ffprobe binary paketlerini kurar; `postinstall` proje içi `.tools/bin` bağlantılarını ve testin yerel GSAP dosyasını hazırlar. Sistem PATH'ini veya global npm paketlerini değiştirmez. Paket indirmek ücretsizdir ve ilk kurulumda internet gerektirir.

Whisper için test edilen Python 3.12 ile sanal ortam kurulur. **Mevcut kurulumda `.venv` hazırdır; yeniden yaratmanız gerekmez.** Bu Mac'teki tekrar kurulum komutları:

```sh
'/Users/engin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3' -m venv .venv
.venv/bin/python -m pip install -r requirements-whisper.txt
npm run hf -- browser ensure
npm run doctor -- --report
```

Başka bilgisayarda ilk satırda kendi Python 3.12 yolunuzu kullanın; örneğin `python3.12 -m venv .venv`. Sistem Python 3.14 kurulumunu değiştirmeyin. `requirements-whisper.txt` OpenAI Whisper sürümünü sabitler; `requirements-lock-macos-arm64.txt` bu makinede doğrulanan tüm Python paketlerini kaydeder. İkinci dosya platforma özeldir.

`browser ensure`, HyperFrames'in yönettiği Chrome Headless Shell'i ücretsiz indirir. Browser cache ve HyperFrames font cache kullanıcı dizininde, `.venv`, npm/pip/model cache ve araç bağlantıları proje içinde tutulur. Bunlar kaynak kontrolüne girmez. Komutlar localhost üzerinde tarayıcı çalıştırır; Codex sandbox localhost'u engellerse ilgili yerel komutun sandbox dışı çalıştırılması gerekir.

## Hızlı komutlar

Komutları proje kökünde çalıştırın:

| İş | Komut |
| --- | --- |
| Araç/import kontrolü | `npm run doctor -- --report` |
| Boş bölüm aç | `npm run new_episode -- michelin` |
| Bölüm planını doğrula | `npm run validate_episode -- episodes/episode-michelin --json` |
| Whisper kurulumunu modelsiz doğrula | `npm run transcribe -- --validate-install` |
| Gerçek kaydı küçük modelle yazıya çevir | `npm run transcribe -- episodes/episode-michelin --profile smoke` |
| Daha kaliteli model profili | `npm run transcribe -- episodes/episode-michelin --profile production` |
| Teknik test önizlemesi | `npm run preview` |
| Statik kontrol | `npm run lint` |
| Runtime/layout/kontrast kontrolü | `npm run check` |
| PNG örnekleri | `npm run snapshot` |
| Teknik MP4 render | `npm run render` |
| Teknik MP4 metadata kontrolü | `npm run probe` |
| Veri modeli/CLI unit testleri | `npm test` |
| Bütün bootstrap kontrolleri | `npm run smoke` |

`new_episode` örneği bu bootstrap sırasında Michelin için çalıştırılmadı. Komut çağrıldığında `episodes/episode-michelin/` oluşturur; aynı slug tekrar çağrılırsa mevcut bölümü koruyarak hata verir. Türkçe başlıklar deterministik ASCII slug'a dönüşür. Numara/saat/rastgele ID kullanılmaz.

## Ses ve transcription

Yeni bölümü açtıktan sonra insan ses kaydını `episodes/episode-michelin/audio/voice_original.wav` konumuna koyun. Placeholder ses veya üretim transkripti yoktur. `script_master.md` sadece okunacak metindir; kelime zamanları kayıttan çıkartılır.

`config/engine.config.json` ayarları:

- Dil: `tr`; kelime zamanları zorunlu.
- `smoke`: `tiny`; `production`: `medium`. Model adları değiştirilebilir.
- `device: auto`: bu Mac'te güvenli CPU yolu; desteklenen CUDA algılanır, hatasında CPU fallback vardır. MPS varsayılmaz.
- Model cache: `.cache/whisper`. İlk gerçek transcription seçilen modelin ağırlıklarını indirebilir; ses bir API'ye yüklenmez.

Bootstrap **model indirmez veya gerçek tanıma testi yaptığını iddia etmez**. Kurulum doğrulaması gerçek Whisper/PyTorch import'larını ve `word_timestamps` imzasını kontrol eder. Testler etiketli sentetik verileri yalnızca geçici klasör/bellekte kullanır.

Transcription `transcript_raw.json` ve `transcript_clean.json` üretir. Raw native Whisper alanlarını saklar; clean sadece whitespace normalizasyonu yapar. Kaynak SHA256, edit decisions, segment ve word timing korunur. Mevcut raw/clean üzerine yazılmaz. Yeni kayıt/model denemesi ayrı bir episode/take dizininde yapılmalıdır; mevcut kayıt ve transcriptleri silmeyin. Ayrıntılar: [TRANSCRIPTION.md](docs/TRANSCRIPTION.md).

## Preview ve render

`npm run preview` terminalde yerel stüdyoyu başlatır ve URL'sini yazdırır (varsayılan `http://localhost:3002`). Tarayıcıda açın; `Ctrl+C` ile durdurun. Bu komut yalnızca `engine/composition/smoke/` teknik örneğini açar.

`npm run render` aşağıdaki teknik test çıktısını yeniden üretir:

```text
/Users/engin/Desktop/video-fabrikası/video-engine/renders/previews/engine-smoke.mp4
```

Bu sabit teknik test dosyası tekrar render'da yenilenir. Bölüm render'ları ileride her bölümün `renders/previews/` ve `renders/final/` klasörlerinde, sürümlenmiş adlarla tutulmalıdır. Gerçek bölüm composition'ı yazıldığında yerel CLI arayüzü:

```sh
npm run hf -- preview episodes/episode-michelin/composition --no-open --foreground
npm run hf -- check episodes/episode-michelin/composition --strict
npm run hf -- render episodes/episode-michelin/composition --fps 30 --output episodes/episode-michelin/renders/previews/v001.mp4
```

Bu son üç komut gelecekte gerçek composition hazır olduktan sonra kullanılabilir; boş şablon render edilemez. Kullanım otoritesi kurulu sürümdür: `npm run hf -- --help` veya `npm run hf -- render --help`. Bootstrap'ta doğrudan `npx --no-install hyperframes --help` çıktıları da `qa/bootstrap/` altında kaydedildi. `hf` sarmalayıcısı yalnızca yerel komutları sunar; telemetry, otomatik update/skill kurulumu kapalıdır. Snapshot'ın isteğe bağlı Gemini analizi `--describe false` ile kapatılır; ortamda API anahtarı olsa bile engine bu yolu kullanmaz. Hosted/publish/cloud kullanılmaz.

`npm run probe` özellikle **4 saniyelik teknik örneğin** 1080×1920, 30 FPS ve 120 kare olduğunu kontrol eder; genel bölüm QA aracı değildir. `npm run smoke` logları ve sonuçları `qa/bootstrap/` altına yazar. MP4'ten çıkarılmış örnek kare ayrıca görsel olarak kontrol edildi. Test, yerel GSAP ve bu Mac'teki Arial fontlarını kullanır; render sırasında CDN/font servisi gerekmez. Başka platformda aynı görünüm için yerel/lisanslı font sağlanmalıdır. İlk test nötrdür; font/renk/motion kanal standardı değildir.

## Dosyalar ve editoryal kontrat

```text
config/                video, model, maliyet ve onaysız stil ayarları
engine/transcription/  yerel Whisper + raw/clean provenance
engine/storyboard/     kayıt zamanına bağlı sahne veri modeli
engine/assets/         gerçek/generated + kaynak/lisans takibi
engine/composition/    HyperFrames teknik test composition'ı
engine/audio/          pickup veri modeli; splice ileride
engine/qa/             schema ve dosyalar arası doğrulama
episodes/_template/    boş, doğrulanabilir episode başlangıcı
schemas/               storyboard, asset, research, pickup JSON Schema
tests/                 geçici verilerle sözleşme testleri
qa/bootstrap/          yerel doğrulama kanıtları (Git dışında)
```

`validate_episode` varsayılan modda boş planı kabul eder; gerçek ses/transcript eksikliğini açıkça bildirir. `--production` ayrıca gerçek kayıt/transcript, hazır asset ve plan statüsü, dosya/hash/zaman bağlantıları ve açık pickup kontrolü yapar. Bu kontrol fact-check veya hukuki lisans onayı değildir. JSON Schema'ların kullanılan küçük alt kümesi stdlib ile doğrulanır; yeni schema keyword'leri sessizce yok sayılmaz.

Üretim ilkeleri: [VIDEO_ENGINE_V0_1.md](docs/VIDEO_ENGINE_V0_1.md), teknik sınırlar: [ARCHITECTURE.md](docs/ARCHITECTURE.md), gerçek materyal ve bilgi katmanı: [ASSET_RULES.md](docs/ASSET_RULES.md).

Higgsfield mevcut resmi Codex eklentisi üzerinden **READY** olarak doğrulandı; yerel ayrı CLI yoktur ve gerekmez. Bootstrap generation çağırmadı, kredi kullanmadı. Hesap durumu ve resmi isteğe bağlı CLI yolu: [HIGGSFIELD.md](docs/HIGGSFIELD.md). Yeni ücretli servis/API yoktur.

Pickup splice, otomatik storyboard→composition compiler, otomatik asset toplama ve tam bölüm ses mix/mux teslimi sonraki aşamalardır. Kullanıcı ilk benchmark için “TAMAM BUDUR” demeden kanal stili veya kalıcı kanal skill'i oluşturulmaz. Git'e medya, render, cache ve credentials alınmaz; remote push yapılmaz.
