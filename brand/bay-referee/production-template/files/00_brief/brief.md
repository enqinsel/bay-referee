# BAY REFEREE — Bölüm brief’i

Durum: SCAFFOLD — konu veya içerik üretilmedi.

## Konu

## İzleyicinin sorusu

## Kritik gerçek görüntüler

Her kritik an için kurgulanabilir çekimi ve kaynağını `07_assets/sources.md`
içinde kaydet. Kullanım izninin dayanağını ve hedef platformlardaki yayın
uygunluğunu ayrı değerlendir. Kritik görüntü eksikse bölümün durumunu
`REVIEW_NEEDED`, nedenini `MEDIA_BLOCKED` olarak kaydet. Ücretli anlatım,
üç dil dublaj ve tam render için bu görüntülerin hazır olması gerekir.

## Hook

## Kanonik Türkçe metin authority’si

01_script/script-tr.txt — kanonik metin authority’si kesinleşince doldurulur.

## Özel notlar

## Üretim kapsamı

Bir Türkçe görsel master; EN ve ES için YouTube'a yüklenecek final WAV ve MP3
dublajları. Her final dublaj t=0'dan kapanış dahil master sonuna kadar uzanır;
gerçek dosya süresi master süresinden en fazla ±0,05 saniye ayrılabilir.
Sessizlik korunabilir veya eklenebilir; otomatik kırpma, hız değiştirme ve
time-stretch yapılamaz. Anlam, cümle sırası ve bölüm boyunca biriken senkron
ayrıca dinlenerek doğrulanır; sürenin eşit olması tek başına yeterli değildir.

Doğal EN/ES anlatım kayıtları, raw Whisper ve native word-map iç kaynak olarak
saklanır. Final `captions-en/es.srt`, `youtube-dub-en/es.wav` ve ona ait
`youtube-dub-word-map-en/es.json` zaman çizgisini izler. Hizalama kanıtı
`youtube-dub-alignment-en/es.json` içinde tutulur; native zamanlar final
yüklenecek SRT authority'si diye etiketlenmez.

TR/EN/ES için aynı görsel ve yerleşimden üç adet 1080×1920 kapak; yalnız
başlık dili değişir. Her kapakta başlık, yüz ve ana nesne merkezdeki
1080×1350 güvenli alanın (y=285–1635) içinde kalır.

Her dil için `06_social/title-{tr,en,es}.txt`, `description-{tr,en,es}.txt`
ve `hashtags-{tr,en,es}.txt`; ayrıca tek çok dilli `youtube-tags.txt`.
Her dilin tek açıklaması Instagram ve YouTube'da ortak kullanılır. Güçlü
bir açılış, doğal anahtar kelimeler ve ana dilde akıcı anlatım gerekir;
anahtar kelime yığma veya yanıltıcı vaat kullanılmaz. Public açıklamaya
araştırma kaynakçası eklenmez. Lisansın gerektirdiği atıf, izin verilen açıklamada veya gönderiye bağlı kamusal kredi sayfasında verilir. Hak kaydı iç dosyalarda saklanır.

Teslim ancak bütün zorunlu dosyalar üretildikten ve `08_delivery/qa-report.json`
gerçek dosyalardan PASS verdikten sonra READY olabilir. Özellikle
`DUB_DURATION_GATE`, zaman çizgisi, ses politikası, semantik senkron ve dosya
bütünlüğü kapıları PASS olmalıdır; boş şablon başarı kanıtı sayılmaz.

## Mac mini M4 / 16 GB — zorunlu işlem güvenliği

Whisper TR → EN → ES sırayla çalışır. FFmpeg, video render, Whisper ve diğer
bellek yoğun işler aynı Mac'teki farklı Codex oturumlarında da paralel
başlatılmaz. Her ağır komutu proje kökünden ortak kilitle başlat:
`python3 scripts/heavy-job.py --label <aşama> -- <komut> <argümanlar>`.
Kilit `/private/tmp/bay-referee-heavy-<uid>.lock` üzerindeki POSIX flock'tur;
oturum veya checkout klasörüne özel değildir. Başka iş varsa yeni ağır işi
başlatma. Çalışan işin kilidini silme, kilidi aşmak için yol değiştirme veya
başka oturumun sürecini durdurma. Tek kilit altında da ağır alt işleri paralel
çalıştırma. Süreç tablosu erişimi engelliyse aynı korumalı komutu yetkili
çalıştırma kapsamıyla kullan; denetimi devre dışı bırakma.

Whisper **medium**, üç dil, **1080×1920 30 FPS**, ses kalitesi, çıktı ayarları
ve bütün QA standartları korunur. Yalnız eşzamanlı işlem sayısı sınırlandırılır.

## Zamanlama ve motion

Final voice → Whisper → semantic beats → visual states → motion plan.
Motion plan konuya göre kurulacak; eski bölümün sahne yerleşimi kopyalanmayacak.

## Açık konular

