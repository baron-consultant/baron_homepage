import { inquiryCopy as copy } from "./inquiry-copy.js";

// Design preview only: all rows below are fictional fixtures.
// No API requests, authentication checks, uploads, storage, or submission are performed.
const SERVICES = { egbim: 'EG-BIM', gaia: 'GAIA', tova: 'TOVA' };
const CATEGORY_LABELS = copy.categories;
const STATUS_LABELS = copy.statuses;
const NOTICE_TITLES = copy.notices;
const SERVICE_QUESTIONS = copy.questions;
function message(key, values = {}) {
  return copy[key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

// Replace this fixture factory with developer-supplied data when integrating the board.
function createPreviewRows(service) {
  const notices = NOTICE_TITLES.map((title, index) => ({
    id: `${service}-notice-${index}`, number: copy.noticeNumber, category: 'notice', company: copy.company, team: copy.support, author: copy.admin,
    title: `${SERVICES[service]} ${title}`, date: `2026-10-${String(25 - index).padStart(2, '0')}`, status: '', comments: index === 2 ? 1 : 0, mine: false,
    content: message('noticeContent', {service: SERVICES[service]})
  }));
  const questions = Array.from({ length: 15 }, (_, index) => ({
    id: `${service}-question-${index}`, number: 15 - index, category: ['error', 'improvement', 'general'][index % 3],
    company: copy.placeholderCompany, team: copy.departments[index % 3], author: `${copy.userPrefix}${String(index + 1).padStart(2, '0')}`,
    title: SERVICE_QUESTIONS[service][index % 5], date: `2026-10-${String(25 - index).padStart(2, '0')}`,
    status: ['done', 'new', 'review', 'patch', 'done'][index % 5], comments: index % 3 ? 0 : 1, mine: index % 4 === 0,
    content: message('questionContent', {service: SERVICES[service]})
  }));
  return [...notices, ...questions];
}

const pageSize = 10;
let service = Object.hasOwn(SERVICES, location.hash.slice(1)) ? location.hash.slice(1) : 'egbim';
let currentPage = 1;
let query = '';
const searchForm = document.querySelector('#inquiry-search');
const rowsElement = document.querySelector('#inquiry-rows');
const pagination = document.querySelector('#inquiry-pagination');
const tabs = [...document.querySelectorAll('.inquiry-tabs [role="tab"]')];
const detail = document.querySelector('#inquiry-detail');
const compose = document.querySelector('#inquiry-compose');
const composeForm = document.querySelector('#inquiry-compose-form');
let dialogOpener;
let previousPrevent;

function textCell(text, className = '') {
  const cell = document.createElement('td');
  cell.textContent = text;
  cell.className = className;
  return cell;
}

function renderRows() {
  const category = searchForm.elements.category.value;
  const mineOnly = searchForm.elements.mine.checked;
  const filtered = createPreviewRows(service).filter(row =>
    (category === 'all' || row.category === category)
    && (!mineOnly || row.mine)
    && `${row.title} ${row.content}`.toLocaleLowerCase().includes(query)
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, pages);
  rowsElement.replaceChildren();
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  for (const row of visible) {
    const tr = document.createElement('tr');
    if (row.category === 'notice') tr.className = 'inquiry-notice';
    tr.append(textCell(row.number), textCell(CATEGORY_LABELS[row.category]), textCell(row.company), textCell(row.team), textCell(row.author));
    const subject = textCell('', 'inquiry-subject');
    const button = document.createElement('button');
    button.type = 'button';
    const title = document.createElement('span');
    title.textContent = row.title;
    button.append(title);
    if (row.comments) {
      const comments = document.createElement('span');
      comments.className = 'inquiry-comments';
      comments.setAttribute('aria-label', message('replies', {count: row.comments}));
      comments.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2c-5 0-9 3-9 7 0 2 1 4 3 5l-1 4 5-2h2c5 0 9-3 9-7s-4-7-9-7Z"/></svg>';
      comments.append(String(row.comments));
      button.append(comments);
    }
    button.addEventListener('click', () => {
      document.querySelector('#inquiry-detail-title').textContent = row.title;
      document.querySelector('#inquiry-detail-meta').textContent = `${SERVICES[service]} · ${CATEGORY_LABELS[row.category]} · ${row.author} · ${row.date}`;
      document.querySelector('#inquiry-detail-body').textContent = row.content;
      openDialog(detail, button);
    });
    subject.append(button);
    const status = textCell('');
    if (row.status) {
      const badge = document.createElement('span');
      badge.className = `inquiry-status inquiry-status--${row.status}`;
      badge.textContent = STATUS_LABELS[row.status];
      status.append(badge);
    }
    tr.append(subject, textCell(row.date), status);
    rowsElement.append(tr);
  }
  if (!visible.length) {
    const tr = document.createElement('tr');
    const cell = textCell(copy.empty, 'inquiry-empty');
    cell.colSpan = 8;
    tr.append(cell);
    rowsElement.append(tr);
  }
  pagination.replaceChildren();
  function pageButton(label, target, disabled = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.disabled = disabled;
    button.setAttribute('aria-label', label === '‹' ? copy.previous : label === '›' ? copy.next : message('page', {page: target}));
    if (String(target) === label && target === currentPage) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      currentPage = target;
      renderRows();
      pagination.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
    });
    pagination.append(button);
  }
  pageButton('‹', currentPage - 1, currentPage === 1);
  for (let page = 1; page <= pages; page++) pageButton(String(page), page);
  pageButton('›', currentPage + 1, currentPage === pages);
  document.querySelector('#inquiry-results').textContent = message('results', {service: SERVICES[service], count: filtered.length, page: currentPage, pages});
  window.ScrollTrigger?.refresh();
}

function selectService(next) {
  service = next;
  currentPage = 1;
  query = '';
  searchForm.reset();
  tabs.forEach(tab => {
    const active = tab.dataset.service === service;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#inquiry-panel').setAttribute('aria-labelledby', `tab-${service}`);
  document.querySelectorAll('[data-service-name]').forEach(el => { el.textContent = SERVICES[service]; });
  updateLanguageLinks();
  renderRows();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    selectService(tab.dataset.service);
    history.replaceState(null, '', `#${service}`);
  });
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
});
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (Object.hasOwn(SERVICES, next)) selectService(next);
});
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  query = searchForm.elements.keyword.value.trim().toLocaleLowerCase();
  currentPage = 1;
  renderRows();
});
searchForm.addEventListener('change', event => {
  if (!['category', 'mine'].includes(event.target.name)) return;
  currentPage = 1;
  renderRows();
});

function openDialog(dialog, opener) {
  dialogOpener = opener;
  if (!document.documentElement.classList.contains('inquiry-modal-open')) {
    previousPrevent = document.documentElement.getAttribute('data-lenis-prevent');
  }
  document.documentElement.setAttribute('data-lenis-prevent', '');
  document.documentElement.classList.add('inquiry-modal-open');
  dialog.showModal();
}
for (const dialog of [detail, compose]) {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (document.querySelector('.inquiry-dialog[open]')) return;
    document.documentElement.classList.remove('inquiry-modal-open');
    if (previousPrevent === null) document.documentElement.removeAttribute('data-lenis-prevent');
    else document.documentElement.setAttribute('data-lenis-prevent', previousPrevent);
    dialogOpener?.focus({ preventScroll: true });
  });
}
document.querySelector('#inquiry-write').addEventListener('click', event => {
  composeForm.reset();
  document.querySelector('#inquiry-compose-service').value = service;
  document.querySelector('#inquiry-compose-feedback').textContent = '';
  openDialog(compose, event.currentTarget);
});
composeForm.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#inquiry-compose-feedback').textContent = copy.submitPreview;
});
selectService(service);
// Run after the shared header's jQuery-ready title initialization.
window.jQuery(() => { document.title = copy.title; });

// Keep the current product selected when switching the inquiry page language.
function updateLanguageLinks() {
  const links = [...document.querySelectorAll('#header .language a')];
  const routes = document.querySelector('.inquiry-page').dataset;
  for (const link of links) {
    const language = link.textContent.trim();
    const route = language === 'KR' ? routes.inquiryKo : language === 'EN' ? routes.inquiryEn : '';
    if (route) link.setAttribute('href', route + '#' + service);
  }
  return links.length >= 2;
}
// Shared headers may be included asynchronously.
if (!updateLanguageLinks()) {
  const header = document.querySelector('#header');
  const observer = new MutationObserver(() => {
    if (updateLanguageLinks()) observer.disconnect();
  });
  observer.observe(header, {childList: true, subtree: true});
}
