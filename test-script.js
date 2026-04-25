const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

const scriptContent = fs.readFileSync('script.js', 'utf8');

dom.window.onerror = function(msg, source, lineno, colno, error) {
  console.log("JSDOM Error:", msg, error ? error.message : "no error obj");
}

const scriptEl = dom.window.document.createElement("script");
scriptEl.textContent = scriptContent;
dom.window.document.body.appendChild(scriptEl);

setTimeout(() => {
  console.log("Canvas width:", dom.window.document.getElementById('stars-canvas').width);
  console.log("Test finished.");
}, 1000);
