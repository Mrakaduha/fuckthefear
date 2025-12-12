// script.js — jednoduché, bezpečné chování tlačítek
document.addEventListener('DOMContentLoaded', () => {
  // Utility: stáhne nebo otevře soubor (pokud je cross-origin, otevře v nové záložce)
  function triggerFileAction(url, suggestedFilename) {
    if (!url) return;
    try {
      // pokud url vypadá jako data: nebo je na stejné doméně, použij klik na <a download>
      const a = document.createElement('a');
      a.href = url;
      if (suggestedFilename) a.download = suggestedFilename;
      // pokud je url cross-origin a má query, prohlížeče některé blokují download; otevřeme v nové záložce
      const sameOrigin = new URL(url, location.href).origin === location.origin;
      if (!sameOrigin) {
        window.open(url, '_blank', 'noopener');
        return;
      }
      // kliknutí spustí download nebo otevření
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      // fallback: otevřít v nové záložce
      window.open(url, '_blank', 'noopener');
    }
  }

  // Zpracování kliků na elementy s data-file nebo s hrefem
  function handleActionElement(el) {
    // if element explicitly uses data-action
    const action = el.dataset.action || null; // future extensibility
    const file = el.dataset.file || el.getAttribute('href') || null;
    // Optional: suggested filename
    const filename = el.dataset.filename || null;

    // Default behaviors
    if (el.matches('a') && el.hasAttribute('href') && !file) {
      // standardní odkaz: ponech výchozí chování (otevře/cil)
      return;
    }

    // If element has data-file or href that points to a file: download or open
    if (file) {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        // small UX: add busy class briefly
        el.classList.add('is-busy');
        setTimeout(() => el.classList.remove('is-busy'), 600);
        triggerFileAction(file, filename);
      });
      return;
    }

    // Fallback: if element has id openDownload (legacy) try to download / open / show modal
    if (el.id === 'openDownload') {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        // try to find a default path; change if your PDF is elsewhere
        const fallback = '/assets/Breath.pdf';
        el.classList.add('is-busy');
        setTimeout(() => el.classList.remove('is-busy'), 600);
        triggerFileAction(fallback, 'assets/Breath.pdf');
      });
    }
  }

  // Attach handlers for any elements with data-file or id=openDownload
  const els = Array.from(document.querySelectorAll('[data-file], #openDownload'));
  els.forEach(el => handleActionElement(el));

  // Optional: keyboard accessibility for 'Enter' on non-button anchors
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const focused = document.activeElement;
      if (focused && focused.dataset && focused.dataset.file) {
        focused.click();
      }
    }

  // email-form mailto handler
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('email-form-mailto');
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const input = form.querySelector('#email-input');
      const email = (input && input.value || '').trim();
      // jednoduchá validace
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        input.focus();
        input.style.outline = '2px solid rgba(200,0,0,0.15)';
        setTimeout(() => input.style.outline = '', 900);
        return;
      }
      // uprav recipient na svou adresu
      const recipient = 'jiri@fuckthefear.net';
      const subject = encodeURIComponent('Subscribe — gap techniques');
      const body = encodeURIComponent('Please add this address to the gap techniques list: ' + email);
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      // zobrazit drobnou vizuální odpověď (místo potvrzení serverem)
      form.querySelector('.email-hint').textContent = 'Your email client should open — please send the message to subscribe.';
    });
  });

