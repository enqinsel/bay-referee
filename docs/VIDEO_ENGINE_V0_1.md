# Video Engine v0.1

Bu proje, bilgi ve hikâye odaklı kısa videolar için tekrar kullanılabilir yerel üretim altyapısıdır. Bir konudan otomatik olarak tamamlanmış video üreten bir sistem değildir. Araştırma, insan seslendirmesi, editoryal kararlar ve gerçek materyal üzerine kurulur.

## Bu fazın kapsamı

- Hedef format: 1080 × 1920, 9:16, başlangıçta 30 FPS; bölüm hedefi 45–90 saniye.
- Çıktı hedefleri: Instagram Reels, TikTok ve YouTube Shorts.
- Bootstrap çıktısı: nötr bir teknik composition, birkaç saniyelik yerel test render'ı, kurulum doğrulaması ve yeniden kullanılabilir bölüm yapısı.
- Bu fazda final bölüm, Michelin storyboard'u, yapay production transkripti veya kanal stili üretilmez. Teknik test render'ı kanal benchmark'ı sayılmaz.

## Üretim sırası

Konu → araştırma ve metin → insan tarafından gerçek seslendirme → yerel OpenAI Whisper → kelime zamanları → izlenebilir transcript düzenleme → storyboard → asset planı → gerçek materyaller ve açıklayıcı grafikler → gerektiğinde Higgsfield → HyperFrames composition → FFmpeg/ses → render → QA → sahne bazlı revizyon.

Gerçek kayıt zamanlamanın otoritesidir. `script_master.md` okunması planlanan metindir; kayıttaki duraklama, tekrar, sapma ve sözcük sürelerinin yerini alamaz. Ham transkript korunur. Temiz sürümdeki değişiklikler ham kelimelere geri izlenebilmelidir.

## Maliyet ve yerellik

- Render, transcription, medya inceleme ve yardımcı işlemler mümkün olduğunca yerel ve açık kaynak araçlarla yapılır.
- Yeni ücretli servis/API eklenmez. OpenAI transcription API, AssemblyAI, ElevenLabs ve ücretli stock API kullanılmaz.
- Mevcut Higgsfield hesabı yalnızca gerekçeli sahneler için ileride kullanılabilir. Bootstrap sırasında görsel/video üretimi yapılmaz ve kredi harcanmaz.
- Cloud render, publish ve Git remote push bu fazın parçası değildir.
- Orijinal ses üzerinde destructive normalization uygulanmaz; model cache, credentials, raw media ve render çıktıları Git'e girmez.

## Editoryal öncelik

Görsel seçimi sırası: gerçek video → gerçek fotoğraf → tarihi/arşiv materyali → belge, gazete, reklam ve harita → kodla oluşturulan açıklayıcı grafik → gerekliyse Higgsfield.

Gerçek bir yer, kişi, nesne veya tarihsel materyal anlatılırken bulunabilir gerçek görüntü esas alınır. Ayasofya anlatımı için uydurma Ayasofya görüntüsü üretilmez. Higgsfield ancak gerçek materyal bulunamadığında, açıkça belirtilen bir canlandırma gerektiğinde, soyut kavram için veya anlamlı bir görsel geçiş için değerlendirilir. Bölümün büyük çoğunluğu gerçek materyal ve açıklayıcı grafiklerden oluşmalıdır.

Bilgi kaynağı ile görselin kaynağı farklı kayıtlardır: bir iddiayı doğrulayan araştırma bağlantısı, kullanılan fotoğrafın lisansını veya kökenini kanıtlamaz. Ayrıntılar için [asset kuralları](ASSET_RULES.md).

## Kritik bilgi söylendiği anda görünmeli

Görsel tasarım yalnızca B-roll seçimi değildir. Kritik sayı, tarih, ölçü, karşılaştırma veya neden-sonuç mümkün olduğunca anlatıldığı anda görünür hale getirilir. Eşleme gerçek kelime zamanlarına dayanır; her kelimeyi altyazıda canlandırmak zorunlu değildir.

| Anlatım örneği | Görsel açıklama |
| --- | --- |
| “1900 yılında Fransa'da 3.000'den az otomobil vardı.” | Doğrulanmış dönem görüntüsü + `< 3.000` + `FRANSA • 1900` |
| “Satışlar yüzde 38 arttı.” | `+38%` ve gerekirse ölçeği doğru grafik |
| “Kubbe yaklaşık 55 metre yüksekte.” | Gerçek görüntü + ölçüm çizgisi + `≈ 55 m` |

Bu tablo tasarım örneğidir; içerdiği iddialar hazır araştırma veya onaylanmış bölüm verisi değildir. Gerçek bölümde her iddia ayrıca doğrulanır.

## Sahne ve hareket kararları

Bir cümle otomatik olarak bir shot değildir. Tek bir kompozisyon birkaç anlatım anını taşıyabilir: tarihi reklamı göster → logoyu vurgula → sözcüğü kırp → açıklama ekle → tarihi göster. Böyle bir devamlı sekans, birbirinden kopuk görüntülerden daha anlaşılır olabilir.

Hareket bilgiye hizmet eder. Varsayılan davranışlar şunlar değildir: her cümlede yeni AI shot, anlamsız cinematic zoom, sürekli parallax, particles, her kelimeye pop, aşırı glow, rastgele transition, gereksiz hızlı kesmeler, tekrar eden Ken Burns, ilgisiz stock B-roll veya tutarsız AI estetikleri. Sabit kalmak anlamı güçlendiriyorsa görüntü sabit kalabilir.

## Stil ve gelecekteki kalıcı skill

`config/engine.config.json` içindeki `style.status` değeri `unapproved`, `channelPreset` değeri `null` kalır. Teknik testin fontu, rengi veya hareketi kanal standardı değildir.

Font, renk paleti, caption stili, transition dili, easing, müzik karakteri, sahne süresi, köşe/border, arka plan ve outro ilk benchmark üzerinde birlikte belirlenecek. Kullanıcı ilk videoya **“TAMAM BUDUR”** demeden kalıcı kanal production skill'i oluşturulmaz.

Gelecekteki skill, onaylanmış editorial/story, visual/motion, typography/color, caption/archive, Higgsfield, sound, scene pattern, research/fact-check ve QA kurallarını ayrı referanslarda tutabilir. v0.1 bu skill'i veya onun yerine geçen onaylanmamış bir style preset'i oluşturmaz.

## Revizyon ve v0.1 sınırları

Sahne kimlikleri, ses aralıkları ve asset kimlikleri revizyonları dar bir alana yöneltmek için korunur. Pickup kaydı problemli aralığı, nedeni, yeniden okunacak satırı ve replacement audio referansını taşıyabilir. İleride uygulanacak splice/EDL işlemi orijinal ses zamanını yeni kurgu zamanına eşlemelidir.

v0.1'de storyboard ve asset/source verileri doğrulanabilir bir iskelettir; otomatik araştırma, asset bulma/lisans doğrulama, transcript'ten eksiksiz storyboard oluşturma, storyboard compiler, pickup audio splice veya otomatik sahne revizyon motoru tamamlanmış değildir. Bu aşamaların veri modeli bulunması, işlemlerin uygulanmış olduğu anlamına gelmez.

Kapanış doğrulaması: ortam/dependency kontrolü, HyperFrames lint/check/snapshot/render, MP4 ffprobe incelemesi, yerel Whisper import/CLI, bölüm oluşturma ve veri doğrulama testleri. Gerçek kullanıcı sesi gelmeden ses kalitesi veya transcript doğruluğu onaylanmış sayılmaz. Çalıştırılan kontroller ve gerçek sonuçları README/QA çıktılarında izlenir.
