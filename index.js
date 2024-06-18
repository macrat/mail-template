(() => {
  const originalHash = new URLSearchParams(location.hash.slice(1));
  if (originalHash.has('to') || originalHash.has('cc') || originalHash.has('bcc') || originalHash.has('subject') || originalHash.has('body')) {
    const to = originalHash.get('to') || '';
    const cc = originalHash.get('cc') || '';
    const bcc = originalHash.get('bcc') || '';
    const subject = originalHash.get('subject') || '';
    const body = originalHash.get('body') || '';
    localStorage.setItem('mail-template', JSON.stringify({subject, to, cc, bcc, body}));
  }

  const saved = localStorage.getItem('mail-template');
  if (saved) {
    const {to, cc, bcc, subject, body} = JSON.parse(saved);
    toInput.value = to;
    ccInput.value = cc;
    bccInput.value = bcc;
    subjectInput.value = subject;
    bodyInput.value = body;
  }

  let mailtoURL = 'mailto:';
  const updateQR = () => {
    QRCode.toDataURL(mailtoURL, {
      type: 'image/jpeg',
      quality: 0.8,
      width: 512,
      height: 512,
    }, (err, url) => {
      if (err) {
        shareArea.classList.add('invalid-qr');
        mailtoQR.src ='';
      } else {
        shareArea.classList.remove('invalid-qr');
        mailtoQR.src = url;
      }
    });
  };
  let qrTimer = null;
  const updateMailto = () => {
    const to = encodeURIComponent(toInput.value).replace(/%40/g, '@');
    const params = new URLSearchParams();
    if (ccInput.value) params.set('cc', ccInput.value);
    if (bccInput.value) params.set('bcc', bccInput.value);
    if (subjectInput.value) params.set('subject', subjectInput.value);
    if (bodyInput.value) params.set('body', bodyInput.value);

    if (params.toString()) {
      mailtoURL = `mailto:${to}?${params.toString()}`;
    } else {
      mailtoURL = `mailto:${to}`;
    }
    mailtoLink.textContent = mailtoURL;

    clearTimeout(qrTimer);
    qrTimer = setTimeout(updateQR, 100);
  };

  const updatePageHash = () => {
    const params = new URLSearchParams();
    if (toInput.value) params.set('to', toInput.value);
    if (ccInput.value) params.set('cc', ccInput.value);
    if (bccInput.value) params.set('bcc', bccInput.value);
    if (subjectInput.value) params.set('subject', subjectInput.value);
    if (bodyInput.value) params.set('body', bodyInput.value);
    history.replaceState(null, '', '#' + params.toString());

    saveLink.textContent = location.href;
  };

  const onChangeAnything = () => {
    localStorage.setItem('mail-template', JSON.stringify({
      to: toInput.value,
      cc: ccInput.value,
      bcc: bccInput.value,
      subject: subjectInput.value,
      body: bodyInput.value,
    }));

    updatePageHash();
    updateMailto();
  };
  onChangeAnything();
  updateQR();

  subjectInput.addEventListener('input', () => {
    onChangeAnything();
    if (subjectInput.value) {
      document.title = `${subjectInput.value} - メールテンプレート`;
    } else {
      document.title = 'メールテンプレート';
    }
  });
  toInput.addEventListener('input', onChangeAnything);
  ccInput.addEventListener('input', onChangeAnything);
  bccInput.addEventListener('input', onChangeAnything);
  bodyInput.addEventListener('input', onChangeAnything);

  clear.addEventListener('click', () => {
    if (!confirm('入力した内容をすべて削除します。よろしいですか？')) return;

    subjectInput.value = '';
    toInput.value = '';
    ccInput.value = '';
    bccInput.value = '';
    bodyInput.value = '';
    document.title = 'メールテンプレート';
    onChangeAnything();
  });

  openMailer.addEventListener('click', () => {
    window.open(mailtoURL);
  });
})();
