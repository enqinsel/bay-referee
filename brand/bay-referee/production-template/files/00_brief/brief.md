# BAY REFEREE — Bölüm brief’i

Durum: SCAFFOLD — konu veya içerik üretilmedi.

## Konu

## İzleyicinin sorusu

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
kaynak adı, URL veya bibliyografya konmaz. Araştırma kaynakları iç dosyalarda
korunur.

Teslim ancak bütün zorunlu dosyalar üretildikten ve `08_delivery/qa-report.json`
gerçek dosyalardan PASS verdikten sonra READY olabilir. Özellikle
`DUB_DURATION_GATE`, zaman çizgisi, ses politikası, semantik senkron ve dosya
bütünlüğü kapıları PASS olmalıdır; boş şablon başarı kanıtı sayılmaz.

## Zamanlama ve motion

Final voice → Whisper → semantic beats → visual states → motion plan.
Motion plan konuya göre kurulacak; eski bölümün sahne yerleşimi kopyalanmayacak.

## Açık konular

