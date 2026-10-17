# Higgsfield entegrasyonu

## Doğrulanan durum — 2026-10-06

**READY: mevcut resmi Codex Higgsfield eklentisi üzerinden hesap bağlantısı çalışıyor.**

| Kontrol | Sonuç |
| --- | --- |
| Codex eklentisi | Kurulu, sürüm `2.1.0` |
| Resmi skills | Eklenti içinde mevcut |
| Hesap erişimi | Salt okunur `list_workspaces` çağrısı başarılı; kullanıcının özel Creator workspace'i erişilebilir |
| Bağımsız `higgsfield` CLI | PATH üzerinde kurulu değil; mevcut Codex entegrasyonu için gerekli değil |
| Generation/publish | Çağrılmadı |
| Bootstrap kredi harcaması | Yok |

Auth bu doğrulama sırasında eksik değildi; kullanıcıdan giriş veya API anahtarı istenmesi gerekmedi. Başarılı workspace okuması hesap erişimini doğrular; medya üretimi yapıldığı veya gelecekte her modelin çalışacağının test edildiği anlamına gelmez. Hesap durumu zamanla değişebilir; bu tarihli kayıt canlı auth testi yerine geçmez.

Kurulu skill dosyası: `/Users/engin/.codex/plugins/cache/openai-curated-remote/app-6a3293e129088191abf0875820e839da/2.1.0/skills/higgsfield/SKILL.md`.

## Engine politikası

`config/engine.config.json` içinde `higgsfield.integration` değeri `official-codex-plugin`, `generationEnabled` değeri `false` olur. Bu bayrak bootstrap niyetini belirtir; eklentinin veya hesabın dışarıdan kullanımını kapatan bir teknik kilit değildir.

Bu fazda test amacıyla bile image/video generation yapılmaz. Auth kontrolü salt okunur hesap/workspace sorgusuyla yapılır. Yeni ücretli servis, ayrı ücretli API entegrasyonu, API anahtarı veya credential dosyası oluşturulmaz. Higgsfield ana asset kaynağı değildir; [asset kuralları](ASSET_RULES.md) uygulanır.

## İleride bağımsız CLI gerekirse

Çalışan eklentiyi çoğaltmak için yeniden kurulum yapılmadı. Yerel shell otomasyonu ayrıca istenirse resmi Codex uyumlu alternatif şudur:

```sh
npx skills add higgsfield-ai/skills
higgsfield auth login
```

İkinci komut tarayıcı üzerinden mevcut Higgsfield hesabına bağlanır; API anahtarı gerektirmez. CLI kurulu olduktan sonra sürüm ve komutlar kendi yardım çıktısıyla doğrulanır; hesap durumu için resmi komut `higgsfield account status` olur. Codex eklentisinin bağlı olması ayrı CLI oturumunun da bağlı olduğunu garanti etmez.

CLI kurulu olup hesabı bağlı değilse rapor **`Higgsfield auth required`** şeklinde verilir; gereken tek kullanıcı adımı `higgsfield auth login` ile tarayıcıda oturum açmaktır. Mevcut eklenti bağlantısı daha sonra koparsa Codex'teki Higgsfield bağlantısı resmi hesap giriş ekranından yenilenir; anahtar chat'e yazılmaz.

Resmi kurulum yönergelerindeki örnek generation kontrolü, bu projenin sıfır kredi harcaması kuralı nedeniyle bootstrap'ta çalıştırılmaz.

## Resmi kaynaklar

- [Higgsfield Skills ve hesapla giriş](https://higgsfield.ai/skills)
- [Codex destekleyen resmi skills deposu](https://github.com/higgsfield-ai/skills)
- [CLI + Skills kurulum rehberi](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli)
- [Resmi Codex plugin manifest'i](https://github.com/higgsfield-ai/skills/blob/main/.codex-plugin/plugin.json)

Kurulu Codex eklentisinin `2.1.0` sürümü ile GitHub'daki bağımsız CLI skills paketinin sürümü ayrı dağıtımlara aittir; aynı sürüm hattı olarak karşılaştırılmaz.
