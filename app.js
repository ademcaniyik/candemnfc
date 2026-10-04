(function () {
  'use strict';

  var CAPACITY = 144; // NTAG213 kullanıcı belleği (bayt)

  // NDEF URI Record Type: ön ek kısaltmaları (NFC Forum URI RTD). En uzun eşleşme önce denenir.
  var PREFIXES = [
    ['https://www.', 0x02],
    ['http://www.', 0x01],
    ['https://', 0x04],
    ['http://', 0x03],
    ['tel:', 0x05],
    ['mailto:', 0x06]
  ];

  var $ = function (id) { return document.getElementById(id); };
  var typeEl = $('type'), mainEl = $('main'), extraEl = $('extra');
  var statusEl = $('status');

  var TYPES = {
    url:       { label: 'Link',                help: 'Kısa olsun: NTAG213\'te yaklaşık 130 karakter sığar.', ph: 'https://ornek.com' },
    google:    { label: 'Google Place ID',     help: 'Google\'ın Place ID Finder aracından bulduğun kimlik (ChIJ… ile başlar).', ph: 'ChIJ…' },
    instagram: { label: 'Kullanıcı adı',       help: '@ olmadan yazabilirsin.', ph: 'candemsoft' },
    whatsapp:  { label: 'Telefon (ülke kodlu)', help: 'Örn. 905551234567 — başında + ya da 0 olmadan.', ph: '905551234567' },
    tel:       { label: 'Telefon',             help: 'Etikete dokunan kişinin telefonu arama ekranı açılır.', ph: '+905551234567' }
  };

  function clean(s) { return (s || '').trim(); }

  // Girdiyi nihai URI'ye çevirir; geçersizse null döner.
  function buildUri() {
    var t = typeEl.value, v = clean(mainEl.value);
    if (!v) return null;
    switch (t) {
      case 'url':
        if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
        return v;
      case 'google':
        return 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(v);
      case 'instagram':
        return 'https://instagram.com/' + encodeURIComponent(v.replace(/^@/, ''));
      case 'whatsapp':
        var digits = v.replace(/[^\d]/g, '');
        if (!digits) return null;
        var msg = clean(extraEl.value);
        return 'https://wa.me/' + digits + (msg ? '?text=' + encodeURIComponent(msg) : '');
      case 'tel':
        return 'tel:' + v.replace(/[^\d+]/g, '');
    }
    return null;
  }

  // Tek kayıtlı kısa NDEF mesajının çipte kaplayacağı bayt sayısı:
  // TLV başlığı (2) + kayıt başlığı (3) + tip 'U' (1) + ön ek kodu (1) + gövde + sonlandırıcı TLV (1)
  function ndefSize(uri) {
    var rest = uri;
    for (var i = 0; i < PREFIXES.length; i++) {
      if (uri.indexOf(PREFIXES[i][0]) === 0) { rest = uri.slice(PREFIXES[i][0].length); break; }
    }
    var body = new TextEncoder().encode(rest).length;
    var payload = 1 + body;
    var header = payload < 256 ? 3 : 6; // kısa kayıt: flags + type len + payload len(1)
    return 2 + header + 1 + payload + 1;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'status show' + (kind ? ' ' + kind : '');
  }

  function refresh() {
    var t = TYPES[typeEl.value];
    $('main-label').textContent = t.label;
    $('main-help').textContent = t.help;
    mainEl.placeholder = t.ph;
    var isWa = typeEl.value === 'whatsapp';
    $('f-extra').hidden = !isWa;

    var uri = buildUri();
    $('preview').textContent = uri || '—';
    var size = uri ? ndefSize(uri) : 0;
    var pct = Math.min(100, Math.round(size / CAPACITY * 100));
    $('meter-bar').style.width = pct + '%';
    var meter = $('meter');
    meter.className = 'meter' + (size > CAPACITY ? ' over' : size > CAPACITY * 0.85 ? ' warn' : '');
    $('meter-text').textContent = size + ' / ' + CAPACITY + ' bayt' + (size > CAPACITY ? ' — çok uzun, kısalt' : '');
    $('write').disabled = !uri || size > CAPACITY || !('NDEFReader' in window);
  }

  var supported = 'NDEFReader' in window;
  if (!supported) {
    $('unsupported').classList.add('show');
    $('read').disabled = true;
  }

  [typeEl, mainEl, extraEl].forEach(function (el) { el.addEventListener('input', refresh); });
  refresh();

  function explain(err) {
    var n = err && err.name;
    if (n === 'NotAllowedError') return 'İzin verilmedi. Chrome\'da NFC iznini ver ve telefonda NFC\'nin açık olduğundan emin ol.';
    if (n === 'NotSupportedError') return 'Bu cihaz NFC\'yi desteklemiyor ya da kapalı.';
    if (n === 'NetworkError') return 'Etiketle bağlantı koptu. Etiketi telefona sabit tutup tekrar dene (etiket kilitli de olabilir).';
    if (n === 'AbortError') return 'İşlem iptal edildi.';
    return 'Hata: ' + (err && (err.message || err.name) || err);
  }

  $('write').addEventListener('click', function () {
    var uri = buildUri();
    if (!uri) return;
    var lock = $('lock').checked;
    if (lock && !window.confirm('Etiket KALICI olarak salt okunur olacak ve bir daha değiştirilemeyecek. Devam edilsin mi?')) return;

    var btn = $('write');
    btn.disabled = true;
    setStatus('Etiketi telefonun arkasına yaklaştır ve sabit tut…');
    var ndef = new NDEFReader();
    ndef.write({ records: [{ recordType: 'url', data: uri }] }, { overwrite: true })
      .then(function () {
        if (!lock) return null;
        if (typeof ndef.makeReadOnly !== 'function') return 'nolock';
        return ndef.makeReadOnly().then(function () { return 'locked'; });
      })
      .then(function (r) {
        if (r === 'nolock') setStatus('Yazıldı ✓ ama bu tarayıcı kilitlemeyi desteklemiyor; etiket kilitsiz kaldı.', 'ok');
        else if (r === 'locked') setStatus('Yazıldı ve kilitlendi ✓ — artık değiştirilemez.', 'ok');
        else setStatus('Yazıldı ✓ Şimdi telefonu etikete tekrar yaklaştırıp test et.', 'ok');
      })
      .catch(function (e) { setStatus(explain(e), 'err'); })
      .then(function () { refresh(); });
  });

  $('read').addEventListener('click', function () {
    setStatus('Okumak için etiketi telefona yaklaştır…');
    var ndef = new NDEFReader();
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); setStatus('Süre doldu, etiket bulunamadı.', 'err'); }, 15000);
    ndef.addEventListener('reading', function (ev) {
      clearTimeout(timer);
      ctrl.abort();
      var dec = new TextDecoder();
      var parts = [];
      ev.message.records.forEach(function (rec) {
        if (rec.recordType === 'url' || rec.recordType === 'text') parts.push(dec.decode(rec.data));
        else parts.push('[' + rec.recordType + ']');
      });
      setStatus('Okundu ✓  ' + (parts.join('  |  ') || '(boş etiket)') + '   · seri no: ' + (ev.serialNumber || '—'), 'ok');
    });
    ndef.addEventListener('readingerror', function () {
      clearTimeout(timer);
      setStatus('Etiket okunamadı. Biçim desteklenmiyor olabilir.', 'err');
    });
    ndef.scan({ signal: ctrl.signal }).catch(function (e) { clearTimeout(timer); setStatus(explain(e), 'err'); });
  });
})();
