const VIDEO_BASE = 'videos/';

const VIDEO_URLS = {
  // CINEMATIC
  'Cinematic/01221.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787230742/01221.mp4',
  'Cinematic/InShot-20260202-182701060.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787230763/InShot-20260202-182701060.mp4',
  'Cinematic/lv-0-20250517081435.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787230686/lv-0-20250517081435.mp4',

  // FAN MADE
  'Fan Made/1000113885.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311336/1000113885.mp4',
  'Fan Made/0516-21.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311338/0516-21.mp4',
  'Fan Made/InShot-20260104-013201468.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311336/InShot-20260104-013201468.mp4',
  'Fan Made/lv-0-20240625141252.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311335/lv-0-20240625141252.mp4',
  'Fan Made/lv-0-20240713002647.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311337/lv-0-20240713002647.mp4',
  'Fan Made/0321.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311347/0321.mp4',

  // FMV
  'FMV/Jake-Sully.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311458/Jake-Sully.mp4',
  'FMV/InShot-20260119-184921967.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311456/InShot-20260119-184921967.mp4',

  // SHORT FORM CONTENT
  'Short Form Content/1000016872.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311588/1000016872.mp4',
  'Short Form Content/0000.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311519/0000.mp4',
  'Short Form Content/0301-copy.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311573/0301-copy.mp4',
  'Short Form Content/0613 (1).mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311792/0613_1.mp4',
  'Short Form Content/1000009718.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311600/1000009718.mp4',
  'Short Form Content/1003 (2).mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311592/1003_2.mp4',
  'Short Form Content/1129.mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311597/1129.mp4',
  'Short Form Content/New Project 13 [412454A].mp4': 'https://res.cloudinary.com/ujuoz0pu/video/upload/v1787311565/New_Project_13_412454A.mp4'
};


const THUMB_EXTENSIONS = ['png', 'jpeg', 'jfif', 'jpg', 'webp'];

const SHOWCASE_ORDER = ['cinematic', 'fanmade', 'shortform', 'fmv'];

const SHOWCASE_META = {
  cinematic: { title: 'Cinematic', anchor: 'cinematic' },
  fanmade: { title: 'Fanmade', anchor: 'fanmade' },
  fmv: { title: 'FMV', anchor: 'fmv' },
  shortform: { title: 'Short Form', anchor: 'shortform' }
};

const EDITS = {
  cinematic: [
    { category: 'Cinematic', file: '01221.mp4', thumb: '01221.jpeg' },
    { category: 'Cinematic', file: 'InShot-20260202-182701060.mp4', thumb: 'InShot-20260202-182701060.jpeg' },
    { category: 'Cinematic', file: 'lv-0-20250517081435.mp4', thumb: 'lv-0-20250517081435.jpeg' }
  ],
  fanmade: [
    { category: 'Fan Made', file: '1000113885.mp4', thumb: '1000113885.jfif' },
    { category: 'Fan Made', file: '0516-21.mp4', thumb: '0516-21.jfif' },
    { category: 'Fan Made', file: 'InShot-20260104-013201468.mp4', thumb: 'InShot-20260104-013201468.jfif' },
    { category: 'Fan Made', file: 'lv-0-20240625141252.mp4', thumb: 'lv-0-20240625141252.jfif' },
    { category: 'Fan Made', file: 'lv-0-20240713002647.mp4', thumb: 'lv-0-20240713002647.jfif' },
    { category: 'Fan Made', file: '0321.mp4', thumb: '0321.jpeg' }
  ],
  fmv: [
  { category: 'FMV', file: 'Jake-Sully.mp4', thumb: 'Jake-Sully.jpeg', square: true },
  { category: 'FMV', file: 'InShot-20260119-184921967.mp4', thumb: 'InShot-20260119-184921967.jpeg', square: true }
  ],
  shortform: [
  { category: 'Short Form Content', file: '1000016872.mp4', thumb: '1000016872.png' },
  { category: 'Short Form Content', file: '0000.mp4', thumb: '0000.png' },
  { category: 'Short Form Content', file: '0301-copy.mp4', thumb: '0301-copy.png' },
  { category: 'Short Form Content', file: '0613 (1).mp4', thumb: '0613 (1).png' },
  { category: 'Short Form Content', file: '1000009718.mp4', thumb: '1000009718.png' },
  { category: 'Short Form Content', file: '1003 (2).mp4', thumb: '1003 (2).png' },
  { category: 'Short Form Content', file: '1129.mp4', thumb: '1129.png' },
  { category: 'Short Form Content', file: 'New Project 13 [412454A].mp4', thumb: 'New Project 13 [412454A].png' }
  ],
};

function encodePortoPath(category, filename) {
  return VIDEO_BASE + [category, filename].map((part) => encodeURIComponent(part)).join('/');
}

function formatTitle(filename) {
  const base = filename.replace(/\.mp4$/i, '');
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getVideoUrl(edit) {
  const key = `${edit.category}/${edit.file}`;

  if (VIDEO_URLS[key]) {
    return VIDEO_URLS[key];
  }

  return encodePortoPath(edit.category, edit.file);
}

function getThumbUrl(edit) {
  const bust = `?v=${Date.now()}`;

  if (edit.thumb) {
    return `images/thumbnails/${encodeURIComponent(edit.category)}/${encodeURIComponent(edit.thumb)}${bust}`;
  }

  const base = edit.file.replace(/\.mp4$/i, '');
  return `images/thumbnails/${encodeURIComponent(edit.category)}/${encodeURIComponent(`${base}.png`)}${bust}`;
}

function createShowcaseCard(edit) {
  const card = document.createElement('article');
  card.className = 'edit-card r' + (edit.square ? ' edit-card--square' : '');
  card.dataset.src = getVideoUrl(edit);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Play ${formatTitle(edit.file)}`);

  const thumb = getThumbUrl(edit);

  card.innerHTML = `
    <div class="edit-card-media">
      <img class="edit-card-thumb" src="${thumb}" alt="" loading="lazy" decoding="async">
      <div class="edit-card-shade"></div>
    </div>
  `;

  return card;
}

function renderShowcases() {
  SHOWCASE_ORDER.forEach((key) => {
    const track = document.querySelector(`[data-rail="${key}"]`);
    if (!track || !EDITS[key]) return;

    track.innerHTML = '';
    EDITS[key].forEach((edit) => {
      track.appendChild(createShowcaseCard(edit));
    });
  });
}
