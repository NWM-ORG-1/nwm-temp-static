// 정적 사이트 빌더: site.json + content.js -> dist/
const fs = require('fs');
const path = require('path');
const site = require('./site.json');
const { sections, articles, pages } = require('./content');

const OUT = path.join(__dirname, 'dist');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const val = (v, empty = '-') => esc(v || empty);
const secName = (slug) => sections.find((s) => s.slug === slug).name;
const posts = [...articles].sort((a, b) => b.date.localeCompare(a.date));

function fill(html) {
  const contact = `<ul><li>발행소: ${val(site.address)}</li><li>전화: ${val(site.phone)}</li><li>대표 이메일: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li><li>기사제보: <a href="mailto:${esc(site.reportEmail)}">${esc(site.reportEmail)}</a></li></ul>`;
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => (k === 'contact' ? contact : val(site[k])));
}

const logo = (cls = '') => `<a class="logo ${cls}" href="/" aria-label="${esc(site.name)} 홈"><img src="/logo-mark.svg" alt="" width="44" height="44"><span><b>${esc(site.name)}</b><small>${esc(site.nameEn)}</small></span></a>`;

function layout({ title, desc, active, main, aside = true }) {
  const nav = [{ slug: '', name: '전체기사', href: '/news' }, ...sections.map((s) => ({ ...s, href: `/section/${s.slug}` }))]
    .map((s) => `<li><a href="${s.href}"${active === (s.slug || 'all') ? ' class="on"' : ''}>${s.name}</a></li>`).join('');
  const full = title ? `${title} - ${site.name}` : `${site.name} | ${site.nameEn}`;
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(full)}</title><meta name="description" content="${esc(desc || `${site.name} - 인터넷신문 ${site.domain}`)}">
<meta property="og:site_name" content="${esc(site.name)}"><meta property="og:title" content="${esc(full)}"><meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/style.css"></head><body>
<div class="topbar"><div class="wrap"><span id="today"></span><span><a href="/contact">기사제보</a><a href="/about">회사소개</a></span></div></div>
<header class="masthead"><div class="wrap">${logo()}<p class="tag">확인된 사실을 전합니다</p></div></header>
<nav class="gnb"><div class="wrap"><ul>${nav}</ul></div></nav>
<div class="wrap body${aside ? '' : ' single'}"><main>${main}</main>${aside ? sidebar() : ''}</div>
${footer()}
<script>(function(){var d=new Date(),w='일월화수목금토'[d.getDay()];document.getElementById('today').textContent=d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+w+')';})();</script>
</body></html>`;
}

function sidebar() {
  const list = posts.slice(0, 5).map((a, i) => `<li><em>${i + 1}</em><a href="/news/${a.id}">${esc(a.title)}</a></li>`).join('');
  return `<aside><section class="box"><h2>최신 글</h2><ol class="rank">${list}</ol></section>
<section class="box tip"><h2>기사제보</h2><p>취재가 필요한 일을 알려 주세요. 제보자 신원은 보호됩니다.</p><a href="mailto:${esc(site.reportEmail)}">${esc(site.reportEmail)}</a></section></aside>`;
}

function footer() {
  const links = [['about', '회사소개'], ['ethics', '윤리강령'], ['privacy', '개인정보처리방침'], ['youth', '청소년보호정책'], ['noemail', '이메일무단수집거부'], ['contact', '기사제보·문의']]
    .map(([h, t]) => `<a href="/${h}"${h === 'privacy' ? ' class="b"' : ''}>${t}</a>`).join('');
  const row = (items) => `<p>${items.map(([k, v]) => `<span>${k} : ${v}</span>`).join('')}</p>`;
  return `<footer class="foot"><div class="links"><div class="wrap">${links}</div></div><div class="wrap info">${logo('mono')}<div>
${row([['명칭', esc(site.name)], ['제호', esc(site.title)], ['등록번호', val(site.regNo, '등록 신청 중')], ['등록일', val(site.regDate, '등록 신청 중')], ['발행일', val(site.pubDate)]])}
${row([['발행인', val(site.publisher)], ['편집인', val(site.editor)], ['청소년보호책임자', val(site.youthOfficer)]])}
${row([['발행소', val(site.address)], ['전화', val(site.phone)], ['이메일', esc(site.email)]].concat(site.bizNo ? [['사업자등록번호', esc(site.bizNo)]] : []))}
<p class="copy">${esc(site.name)}의 모든 콘텐츠는 저작권법의 보호를 받으며, 무단 전재·복사·배포를 금합니다.<br>Copyright © ${esc(site.name)}. All rights reserved.</p></div></div></footer>`;
}

const item = (a) => `<li><a href="/news/${a.id}"><span class="sec">${secName(a.section)}</span><strong>${esc(a.title)}</strong><p>${esc(a.summary)}</p><span class="meta">${esc(a.author)} · ${a.date}</span></a></li>`;
const listBlock = (title, list, count = true) => `<div class="list-head"><h1>${title}</h1>${count ? `<span>총 ${list.length}건</span>` : ''}</div>` +
  (list.length ? `<ul class="list">${list.map(item).join('')}</ul><div class="paging"><b>1</b></div>` : '<p class="empty">등록된 기사가 없습니다.</p>');

const files = {};
const [lead, ...rest] = posts;
files['index.html'] = layout({ active: 'home', main: `<article class="lead"><a href="/news/${lead.id}"><span class="sec">${secName(lead.section)}</span><h2>${esc(lead.title)}</h2><p>${esc(lead.summary)}</p><span class="meta">${lead.date}</span></a></article>
<div class="list-head"><h1>최신 글</h1><a href="/news">더보기</a></div><ul class="list">${rest.map(item).join('')}</ul>` });
files['news.html'] = layout({ title: '전체기사', active: 'all', main: listBlock('전체기사', posts) });
for (const s of sections) files[`section/${s.slug}.html`] = layout({ title: s.name, active: s.slug, main: listBlock(s.name, posts.filter((a) => a.section === s.slug)) });
for (const a of posts) {
  files[`news/${a.id}.html`] = layout({ title: a.title, desc: a.summary, active: a.section, main: `<article class="view">
<div class="crumb"><a href="/">홈</a> › <a href="/section/${a.section}">${secName(a.section)}</a></div>
<h1>${esc(a.title)}</h1><p class="sub">${esc(a.summary)}</p>
<div class="info"><span>${esc(a.author)}</span><span>입력 ${a.date}</span></div>
<div class="content">${a.body}</div>
<div class="byline">${esc(a.author)} <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>
<p class="copyright">저작권자 © ${esc(site.name)} 무단전재 및 재배포 금지</p></article>` });
}
for (const [slug, p] of Object.entries(pages)) files[`${slug}.html`] = layout({ title: p.title, aside: false, main: `<article class="view page"><h1>${p.title}</h1><div class="content">${fill(p.body)}</div></article>` });
files['404.html'] = layout({ title: '페이지를 찾을 수 없습니다', main: '<div class="list-head"><h1>페이지를 찾을 수 없습니다</h1></div><p class="empty">주소가 바뀌었거나 삭제된 페이지입니다. <a href="/">첫 화면으로 가기</a></p>' });
files['robots.txt'] = `User-agent: *\nAllow: /\nSitemap: https://${site.domain}/sitemap.xml\n`;
files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'news', ...posts.map((a) => `news/${a.id}`), ...sections.map((s) => `section/${s.slug}`), ...Object.keys(pages)].map((u) => `<url><loc>https://${site.domain}/${u}</loc></url>`).join('')}</urlset>\n`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'static'), OUT, { recursive: true });
for (const [f, html] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
  fs.writeFileSync(path.join(OUT, f), html);
}
console.log(`built ${Object.keys(files).length} files -> dist/`);
