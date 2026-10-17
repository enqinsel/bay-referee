# Yerel transkripsiyon ve ses kaydının zamanlama otoritesi

`audio/voice_original.wav`, zamanlamanın esas alındığı kaynaktır. İnsan tarafından
okunan özgün ses kaydını koruyun; bu modül dosyayı normalize etmez, kırpmaz, dosyanın
üzerine yeniden örnekleme yapmaz veya ses parçalarını kesip birleştirmez.
`script/script_master.md`, planlanan anlatım metni ve araştırma/kurgu referansıdır.
Zaman damgası uydurmak, kayıtta söyleneni değiştirmek veya eksik konuşmayı tamamlamak
için kullanılmaz.

## Kurulum ve doğrulama

`video-engine/` klasöründen projenin sanal Python ortamını kullanın:

```sh
.venv/bin/python -m pip install -r requirements-whisper.txt
.venv/bin/python scripts/transcribe.py --help
.venv/bin/python scripts/transcribe.py --validate-install
```

Doğrulama, kurulu OpenAI Whisper ve PyTorch paketlerini içe aktarır; Python
arayüzündeki `word_timestamps` parametresini, yapılandırmadaki model adını ve
FFmpeg/ffprobe sürüm komutlarının çalıştığını kontrol eder. Model yüklemez,
indirmez veya transkript üretmez. CLI, projenin `.tools/bin` klasörünü kendi
`PATH` ortam değişkenine ekler.

## Gerçek ses kaydını transkribe etme

İnsan tarafından okunan özgün ses kaydını bölümün `audio/voice_original.wav`
konumuna koyun. Ardından `new_episode` komutunun bildirdiği bölüm yoluyla çalıştırın:

```sh
.venv/bin/python scripts/transcribe.py episodes/episode-michelin --profile smoke
# Yeni bir kayıt/take için yapılandırmadaki daha kaliteli production modelini seçin:
.venv/bin/python scripts/transcribe.py episodes/episode-example --profile production
```

Profiller, `config/engine.config.json` dosyasındaki `transcription` alanından seçilir:

```json
{
  "language": "tr",
  "models": {"smoke": "tiny", "production": "medium"},
  "defaultProfile": "smoke",
  "device": "auto",
  "modelCache": ".cache/whisper",
  "wordTimestamps": true
}
```

Model adları yapılandırmadan okunur. Türkçe için çok dilli model gerekir;
bu yüzden `tr` seçiliyken `.en` modelleri reddedilir. İlk gerçek transkripsiyonda
seçilen açık modelin ağırlıkları yapılandırılmış yerel önbelleğe indirilebilir.
Sonraki çalışmalarda bu ağırlıklar yerelden kullanılır. Ses bir transkripsiyon
servisine gönderilmez; OpenAI API anahtarı kullanılmaz. Bootstrap aşamasında
herhangi bir model indirilmeden yalnızca kurulum doğrulanır.

`auto`, macOS üzerinde CPU kullanır; MPS desteği varsayılmaz. Diğer sistemlerde
CUDA, yalnızca PyTorch kullanılabilir olduğunu bildirirse seçilir. Yapılandırmada
açıkça CUDA istendiği hâlde kullanılamıyorsa CPU'ya geçilir. CUDA üzerinde model
yükleme veya çalıştırma sırasında çalışma zamanı hatası oluşursa işlem CPU'da
yeniden denenir ve bu geçiş kaydedilir. CPU çıkarımı FP32 kullanır. Profiller,
yerel hesaplamanın kalite ve kaynak tüketimi seçimini belirler; ücretli bir servis
paketi seçmez.

## Raw ve clean çıktıları

`transcript/transcript_raw.json`, Whisper'ın özgün `text`, `language`, `segments`,
`words`, token kimlikleri, güven/olasılık değerleri ve diğer alanlarını korur.
Engine, ffprobe ile seçilen ses akışından elde edilen `duration` değerini ve
`_engine` üst verisini ekler. Ses akışında süre yoksa kapsayıcı biçimin süresi
kullanılır. Süre, sondaki sessizliği de kapsar; son sözcüğün bitişinden türetilmez.
Üst veride kaynak dosyanın SHA-256 özeti, yolu, ffprobe sonucu, model, profil,
cihaz, paket sürümü ve UTC oluşturulma zamanı tutulur.

`transcript/transcript_clean.json`, raw verinin bağımsız derin kopyasıdır.
Yalnızca metin ve sözcük etiketlerindeki boşluk karakterleri düzenlenir.
Bütün sözcükler, tereddüt sesleri, tekrarlar, segmentler, olasılık değerleri,
başlangıç ve bitiş zamanları aynı sırayla korunur. Değişiklikler
`_engine.editDecisions` içinde JSON pointer, önceki/sonraki metin, işlem,
gerekçe ve `timingChanged: false` bilgileriyle listelenir. `_engine.rawSource`,
üzerine yazılmayan raw JSON dosyasını ve özgün baytlarının SHA-256 özetini tutar.

Otomatik konuşma düzeltmesi uygulanmaz; düzenleme boşluklarla sınırlıdır.
Whisper'ın kendisi konuşmayı yanlış tanıyabilir veya bazı kısımları atlayabilir.
Storyboard hazırlamadan önce transkripti ses kaydıyla karşılaştırın; özellikle
isimleri, sayıları, tekrarları ve tereddüt seslerini gözden geçirin. Sözcük zaman
damgaları model tahminidir; kusursuz fonetik hizalama garantisi vermez.

Raw **veya** clean dosyası zaten varsa komut, çıkarıma başlamadan hata verir.
`--force` seçeneği yoktur. Farklı modelle çalışma veya yeni kayıt için kendi özgün
sesi ve kaynak bilgisi olan ayrı bir take/bölüm klasörü kullanın; eski raw/clean
çiftini koruyun. Çıktılar atomik olarak yazılır; aynı anda başka bir işlem tarafından
oluşturulan dosyanın da üzerine yazılmaz. Çıkarım sonrası zamanlama doğrulaması
başarısız olursa raw inceleme için korunur, clean üretilmez ve komut hata döndürür.
Hiçbir zaman damgası sessizce düzeltilmez.

## Sözcük zamanlaması ve doğrulama

Whisper, `task="transcribe"`, yapılandırılabilir `language="tr"` ve
`word_timestamps=True` seçenekleriyle çalışır. Segmentlerde `id`, `start`, `end`,
`text` ve `words` alanları bulunur. Her sözcük `word`, `start`, `end` ve
`probability` bilgilerini taşır. Zamanlar, değiştirilmemiş özgün kaydın
başlangıcından itibaren saniye cinsindendir. Storyboard ve görsel katmanlarda
bu zamanları kullanın; `script_master.md` sözcük sayısından süre tahmini üretmeyin.

`engine.transcription.validate_transcript(data, kind="raw" | "clean")`, hata
listesi döndürür; liste boşsa doğrulama geçmiştir. Sonlu zaman aralıklarını,
sıralamayı, kayıt süresi sınırlarını, benzersiz segment kimliklerini ve sözcük
olasılıklarını kontrol eder. Sınırlardaki zaman damgası yuvarlamaları için
0,05 saniyelik tolerans vardır. Doğrulama veriyi değiştirmez veya onarmaz.

```sh
.venv/bin/python -m unittest discover -s tests -p 'test_transcription.py' -v
```

Birim testleri, bellekte oluşturulan ve açıkça sentetik olarak işaretlenen Whisper
sonuçlarıyla taklit edilmiş çıkarım çağrıları kullanır. Dosya yazma testlerinde
geçici, test olduğu belirtilmiş baytlar kullanılır. Bunlar ses kaydı veya üretim
transkripti değildir; hiçbir bölümün içine kaydedilmez. Kurulum doğrulaması,
gerçek bir kayıtta uçtan uca konuşma tanıma kalitesinin test edildiği anlamına gelmez.

## Pickup: sorunlu kısmı yeniden kaydetmeye hazırlık

Tek pickup planı `audio/pickups/pickups.json` dosyasıdır. Clean üst verisi,
`_engine.pickupPlan` alanıyla bu dosyaya referans verir. Her talep, özgün kayıttaki
sorunlu `start` / `end` aralığını, `reason`, `suggested_line`, `replacement_audio`
ve `status` bilgilerini taşır. Yerine kullanılacak ses, `audio/pickups/` altında
ayrı bir insan seslendirmesi olarak saklanır.

İleride ses parçalarını birleştirirken bir kurgu karar listesi ve kaynak kaydı
composition zamanına eşleyen bir zaman haritası oluşturulmalıdır. Yeni kaydın süresi
farklı olabileceğinden özgün sözcük zamanları son zaman çizelgesinde doğrudan
yeniden kullanılamaz. Pickup kaydını ayrıca transkribe edin; hem özgün hem de
yerine kullanılacak kaydın kaynak bilgilerini koruyun. Bootstrap aşaması ses
birleştirme, ses onaylama veya ses değiştirme işlemi yapmaz.

## Resmî kaynaklar

- [OpenAI Whisper kaynak kodu ve yerel kurulum](https://github.com/openai/whisper)
- [Whisper transkripsiyon ve sözcük zaman damgası uygulaması](https://github.com/openai/whisper/blob/main/whisper/transcribe.py)
- [Sürümü sabitlenmiş openai-whisper paketi](https://pypi.org/project/openai-whisper/20250625/)
