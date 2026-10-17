# Bootstrap doğrulaması — 6 Ekim 2026

**Status: PASS.** Son toplu test: 21:31 Europe/Istanbul (`qa/bootstrap/smoke.json`).

## Ortam ve kurulum

Başlangıçta çalışma klasörü boştu. Node/npm, sistem Python 3.14 ve Git mevcuttu; FFmpeg, ffprobe ve HyperFrames PATH'te yoktu. Resmi Higgsfield Codex eklentisi zaten kuruluydu.

| Araç | Doğrulanan sürüm/durum |
| --- | --- |
| OS / donanım | macOS 27.0.1, ARM64, Apple M4 |
| Node / npm | 26.0.0 / 11.12.1 |
| Proje Python / pip | 3.12.14 / 25.0.1; stdlib venv |
| Sistem Python | 3.14.0; değiştirilmedi |
| Git | 2.54.0 (Apple Git-157); yerel repo oluşturuldu |
| HyperFrames | 0.8.137; yardım çıktısı üzerinden doğrulanan yerel CLI |
| GSAP | 3.15.0; CDN yerine yerel dosya |
| FFmpeg / ffprobe | 4.4 / n4.4.1; proje içi `.tools/bin` |
| Chrome Headless Shell | 152.0.7977.30; HyperFrames tarafından yönetiliyor |
| OpenAI Whisper / PyTorch | 20250625 / 2.14.1; gerçek import başarılı |
| Higgsfield | Resmi Codex eklentisi 2.1.0, salt okunur workspace erişimi başarılı |

`pip check`: kırık bağımlılık yok. Npm sürümleri `package-lock.json`, bu Mac'in Python paketleri `requirements-lock-macos-arm64.txt` içinde sabitlenmiştir. Whisper model ağırlığı indirilmedi. `auto` cihaz seçimi bu Mac'te CPU'dur; `word_timestamps` parametresi kurulu gerçek API'de doğrulandı.

## Çalıştırılan kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm run smoke` | 7/7 adım PASS |
| Ortam + gerçek Whisper import/CLI | PASS; model yüklemeden |
| Unit testler | 32/32 PASS |
| Episode generator CLI + validator CLI | PASS; geçici boş bölüm ve çakışma koruması |
| JSON Schema ve semantik doğrulama | PASS; yanlış zaman, referans, provenance ve path vakaları sınandı |
| HyperFrames lint | 0 hata, 0 uyarı |
| HyperFrames strict check | Browser gerçekten çalıştı; runtime/layout hatası yok; 20/20 kontrast kontrolü |
| Snapshot | 4 PNG ve contact sheet; yerel fontla görsel kontrol |
| Yerel preview | HTTP 200; test sunucusu sonra kapatıldı |
| MP4 render + ffprobe | PASS; 120 kare, H.264, yuv420p |
| Tam MP4 decode | Hatasız |
| Maliyet sınırı | Cloud/publish ve uzak snapshot analizi reddediliyor |

HyperFrames'in kendi genel `doctor` çıktısında whisper.cpp, Kokoro, MusicGen ve çalışan Docker bulunmaması isteğe bağlı özelliklerle ilgilidir. Bu engine Python OpenAI Whisper ve doğrudan yerel Chrome/FFmpeg kullanır; bu araçlar gerekmez. Motorun `npm run doctor` kontrolü PASS'tir. Genel CLI doctor çıkış kodu tek başına sağlık kanıtı kabul edilmedi.

## Test render

`/Users/engin/Desktop/video-fabrikası/video-engine/renders/previews/engine-smoke.mp4`

1080×1920, 9:16, 30 FPS, 4.000 saniye, 120 kare. Ses yoktur; nötr tipografi, şekil ve küçük hareket içerir. Kanal stili veya final bölüm değildir. Son kaynak doğrudan yerel Arial fontlarını kullanır. Önceki bir denemede HyperFrames'in otomatik Inter indirmesi görüldü ve yerel font bildirimiyle giderildi.

Yerel kanıtlar: `qa/bootstrap/environment.json`, `doctor.json`, `smoke.json`, `tests.log`, `lint.log`, `check.log`, `snapshot.log`, `render.log`, `ffprobe.json`, `snapshots/`. Sonuçlar yeniden `npm run smoke` ile üretilebilir. Render ve QA binary/log çıktıları Git dışında tutulur.

## Kapsamın korunduğu noktalar

- Higgsfield generation çağrısı ve kredi harcaması: **NO**. Ayrı CLI kurulmadı; mevcut bağlı eklenti kullanıma hazır.
- Yeni ücretli servis veya transcription API: **NO**.
- Gerçek ses veya üretim transkripti: oluşturulmadı; model ağırlığı indirilmedi.
- Michelin bölümü/senaryosu/storyboard'u/final videosu: oluşturulmadı.
- Kanal stili ve kalıcı production skill: oluşturulmadı.
- Mevcut dosya kaybı, orijinal ses normalizasyonu, cloud publishing ve remote Git push: yapılmadı.

Engelleyici açık sorun yok. Gerçek sesle tanıma doğruluğu ilk kayıt geldiğinde değerlendirilir. Pickup splice, tam bölüm mix/mux ve storyboard compiler sonraki geliştirme kapsamıdır; bootstrap tamamlanmış bu özellikleri varmış gibi sunmaz.
