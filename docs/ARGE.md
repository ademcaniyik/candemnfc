# Dokun — Ar-Ge notu (2026-10-04)

Dokun, Candemsoft'un NFC etiket/kart ürünüdür. Bu not nfcdukkan.com mağazasının incelenmesinden ve NFC kodlama araştırmasından çıkan sonuçları özetler.

## 1. nfcdukkan.com/store ne satıyor?

~29 ürün, hepsi **hazır programlanmış** (satıcı müşterinin linkini yazıp gönderiyor):

| Grup | Örnekler | Fiyat (KDV dahil) |
|---|---|---|
| Etiket (sticker) | Programlanmış NTAG213 (2,5 cm), Instagram Takipçi Etiketi (4 cm), Google Yorum Etiketi | 300 TL |
| Kart | Google/Instagram/Facebook/TikTok/LinkedIn/WhatsApp/YouTube/Tripadvisor/Taksi kartları | 360 TL |
| Standlı kart / pleksi | Google/Instagram yorum standları (8x5, A5, A6, 7x7) | 420–600 TL |
| Yaka kartı | Instagram yaka kartı 420 TL; Dijital/Realty World/Coldwell Banker/Fuar yaka kartı | 420–2.400 TL |
| Dijital kartvizit | 5x8 cm NFC+QR kart + web profil paneli | 2.400 TL |
| Menü | NFC+QR kazıma pleksi 5x5 | 84 TL |

Gözlemler:
- Mağazadaki **tek çip bilgisi NTAG213** (13,56 MHz, ISO14443A, 144 bayt kullanılabilir, 100.000+ yazma, 10+ yıl saklama). Diğerlerinde çip yazmıyor; aynı sınıf olduğu varsayılabilir.
- Ürün farkı donanımda değil **link + baskı + ambalajda**. Değer katan kısım: hazır kullanım ve (kartvizitte) güncellenebilir profil sayfası.
- Müşteri özelleştirmesi: opsiyonel yönlendirme linki, logo yükleme (PNG/JPG, 5 MB), QR yedek.
- Dijital kartvizit paketinde abonelik/yenileme ücreti sayfada belirtilmiyor (rakip analizi için sorulmalı).

## 2. Hangi üründen almalıyız?

**Geliştirme için nfcdukkan'dan almaya gerek yok.** Orada her şey kullanıma hazır ve tek adet 300–360 TL; bizim ihtiyacımız **boş (yazılabilir) NTAG213** etiket/kart.

Önerilen alım (Trendyol/Hepsiburada/İdefix, "NTAG213 NFC etiket"):

| Ne | Adet | Yaklaşık maliyet (yalnızca ilk iki satırda fiyat araştırıldı, kalanlar tahmindir) | Neden |
|---|---|---|---|
| NTAG213 25 mm beyaz sticker | 50–100 | ~13 TL/adet (100'lük ≈ 1.300 TL; 10'luk ≈ 490 TL gözüküyor, toplu alınca düşer) | Ana ürün, prototip, test |
| NTAG213 PVC kart (CR80, boş beyaz) | 10–20 | ~15–25 TL/adet | Kart/kartvizit formu |
| NTAG215/216 sticker | 3–5 | düşük | Karşılaştırma testi (gerekmeyebilir) |
| Metal üstü (anti-metal) NTAG213 | 3–5 | ~25–40 TL | Metal yüzeyli POS/stand kullanımı |
| NTAG 424 DNA | 3–5 | ~40–80 TL | **Faz 2**: klonlanamaz, imzalı dinamik URL (SUN) |

Rakibi birebir görmek istersek **tek bir** "Google NFC Yorum Kartı" (360 TL) ya da "Dijital Kartvizit" (2.400 TL) alıp ambalaj, baskı, panel deneyimini inceleyebiliriz — ama ürün geliştirmek için şart değil.

**Marj:** boş etiket ≈ 13 TL, mağaza satış fiyatı 300 TL. Maliyetin asıl kalemi baskı, ambalaj, kargo ve (kartvizitte) yazılım/destek.

## 3. NFC kodlaması için ne yapılması gerekiyor?

1. **Çip:** NTAG213 yeter. Link için ~130 karakter sığar. NTAG215 (504 B) ve 216 (888 B) yalnızca çoklu kayıt / gömülü vCard için.
2. **Biçim:** NDEF, tek bir **URI kaydı** (`https://…`). iPhone ve Android bunu otomatik açar; uygulama gerekmez. iPhone XS ve üstü etiketi arka planda okur.
3. **Yazma araçları:**
   - Android + Chrome: **Web NFC** (`NDEFReader.write`) — bu repodaki `yaz.html` bunu kullanır. HTTPS şart.
   - iPhone: tarayıcıdan yazılamaz; *NFC Tools* / *NXP TagWriter* ya da kendi Core NFC uygulamamız.
   - Toplu üretim: USB okuyucu-yazıcı (ACR122U gibi) + `nfcpy`/`libnfc` ile script.
4. **Kısa yönlendirme linki:** çipe doğrudan hedefi değil `dokun.xx/abc123` yaz. Böylece:
   - URL kısa kalır (144 bayta sığar),
   - hedef sonradan değişir (müşteri Instagram adını değiştirir, menü güncellenir),
   - tıklama/dokunma istatistiği toplanır.
5. **Kilitleme:** yazdıktan sonra etiketi salt okunur yap (NDEF lock bits) ya da NTAG parola koruması kullan. Kilitlemezsek herhangi biri telefonuyla üzerine yazıp müşteriyi başka siteye yönlendirebilir. Kilit **geri alınamaz** — önce test et.
6. **QR yedek:** aynı kısa linkin QR kodunu da baskıya ekle (NFC'siz telefonlar için).
7. **Fiziksel:** metal yüzeye doğrudan yapıştırma (anti-metal etiket kullan); okuma mesafesi 1–5 cm.
8. **Güvenlik (Faz 2):** NTAG 424 DNA ile her dokunuşta değişen imzalı URL; klon/kopya etiketi sunucuda doğrulanır.

## 4. Marka: Dokun

- **Dokun** = "touch". Kısa, Türkçe, söylemesi kolay, ürünün tek eylemini anlatıyor.
- Alt marka: "Dokun — bir Candemsoft ürünüdür".
- Alan adı (2026-10-04 whois): `dokun.tr`, `dokun.com.tr`, `dokun.me`, `degdir.com` **müsait görünüyor**; `dokun.app`, `dokun.link`, `dokun.co` dolu. `candemsoft.com` zaten bizde (DNS Turkticaret) → `dokun.candemsoft.com` alt alan adı en hızlı yol.
- Not: marka tescil/benzerlik taraması (TÜRKPATENT) yapılmadı.

## 5. Yol haritası

- [x] Taslak landing + etiket yazma aracı (GitHub Pages)
- [ ] 100'lük boş NTAG213 + 10 PVC kart sipariş et, `yaz.html` ile gerçek cihazda test (Android + iPhone okuma)
- [ ] Kısa link / yönlendirme servisi (Cloudflare Workers ya da küçük Node servisi) + tıklama sayacı
- [ ] Alan adı al, `dokun.*` bağla
- [ ] Müşteri paneli: link değiştirme (Google Place ID, Instagram, menü)
- [ ] Pilot: 3–5 yerel işletmeye (kafe, kuaför, taksi) ücretsiz deneme
- [ ] Baskı/ambalaj tedarikçisi, fiyat listesi, sipariş formu
- [ ] Faz 2: NTAG 424 DNA, dijital kartvizit profili

## Kaynaklar
- [NFC Dükkan mağaza](https://www.nfcdukkan.com/store), [NTAG213 ürün sayfası](https://www.nfcdukkan.com/store/product/programlanmis-nfc-etiket-ntag-213), [Dijital Kartvizit](https://www.nfcdukkan.com/store/product/dijital-kartvizit)
- [NTAG213/215/216 karşılaştırması (Proudtek)](https://proudtek.com/compare/ntag213-vs-ntag215-vs-ntag216/), [rfidmfg](https://www.rfidmfg.com/guides/ntag213-vs-215-vs-216/)
- Türkiye fiyatları: [İdefix 100'lük NTAG213](https://www.idefix.com/vk-nfc-etiket-ntag213-100-adet-p-5065110), [Trendyol 10'luk NTAG213](https://www.trendyol.com/genel-markalar/ntag213-nfc-etiket-10-adet-p-250245057)
- [Web NFC (Chrome)](https://developer.chrome.com/docs/capabilities/nfc)
