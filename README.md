# Dokun — bir Candemsoft ürünü

Telefonu yaklaştır, link açılsın. Google yorum, Instagram takip, WhatsApp, dijital kartvizit için NFC etiket ve kartlar.

- **Canlı site:** https://ademcaniyik.github.io/candemnfc/
- **Etiket yazma aracı:** https://ademcaniyik.github.io/candemnfc/yaz.html (Android Chrome, Web NFC)
- **Ar-Ge notu (hangi çip, nereden alınır, nasıl kodlanır):** [docs/ARGE.md](docs/ARGE.md)

Saf statik site (HTML/CSS/JS), derleme yok. `main` dalına push edilince GitHub Pages yayınlar.

```bash
python3 -m http.server 8080   # yerelde: http://localhost:8080
```

> Web NFC yalnızca HTTPS (ya da localhost) üzerinde ve Android Chrome'da çalışır.
