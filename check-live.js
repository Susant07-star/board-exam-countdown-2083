fetch('https://exam-countdown-2083.netlify.app/')
  .then(r=>r.text())
  .then(t => {
    const idx = t.indexOf('id="widget-hover-controls"');
    console.log(t.substring(idx - 100, idx + 800));
  });
