import { getBooksByCategory, categories } from '../api.js';

export class CatalogPage {
  #currentCategory = 'all';
  #currentBooks = [];
  #currentStartIndex = 0;

  PAGE_SIZE = 12;

  categoryMeta = {
    'All': { css: 'all', icon: '📚' },
    'Fiction': { css: 'fiction', icon: '📖' },
    'Science': { css: 'science', icon: '🔬' },
    'History': { css: 'history', icon: '📜' },
    'Philosophy': { css: 'philosophy', icon: '💭' },
    'Mystery': { css: 'mystery', icon: '🔍' },
    'Fantasy': { css: 'fantasy', icon: '🚀' },
    'Biography': { css: 'biography', icon: '👤' },
    'Poetry': { css: 'poetry', icon: '🎵' }
  };

  async init() {
    this.grid = document.querySelector('.catalog__grid');
    this.countEl = document.querySelector('.catalog__count');
    this.sidebarList = document.querySelector('.catalog__sidebar-list');

    if (!this.grid) return;

    this.ensureLoadMoreButton();

    this.#currentStartIndex = 0;
    this.#currentBooks = [];

    this.grid.innerHTML =
      '<p style="text-align:center; padding:2rem;">Loading books from Open Library API...</p>';

    const books = await getBooksByCategory(
      this.#currentCategory,
      this.PAGE_SIZE,
      0
    );

    this.#currentBooks = books;
    this.#currentStartIndex = this.PAGE_SIZE;

    this.renderBooks(books);
    this.updateLoadMoreButton();

    if (this.sidebarList) {
      this.initSidebar();
    }

    const allLink = this.sidebarList?.querySelector(
      '.catalog__sidebar-link[data-category="All"]'
    );

    if (allLink) {
      allLink.click();
    }
  }

  initSidebar() {
    this.sidebarList.innerHTML = '';

    Object.keys(categories).forEach(catName => {
      const li = document.createElement('li');

      li.className = 'catalog__sidebar-item';

      li.innerHTML = `
        <a href="#"
           class="catalog__sidebar-link"
           data-category="${catName}">
           ${catName}
        </a>
      `;

      this.sidebarList.appendChild(li);
    });

    this.highlightSidebarCategory(this.#currentCategory);

    this.sidebarList.addEventListener('click', async (e) => {
      e.preventDefault();

      const link = e.target.closest('.catalog__sidebar-link');

      if (!link) return;

      this.#currentCategory = link.dataset.category;

      this.highlightSidebarCategory(this.#currentCategory);

      const titleEl = document.querySelector('.catalog__title');

      if (titleEl) {
        titleEl.textContent = this.#currentCategory;
      }

      this.#currentStartIndex = 0;
      this.#currentBooks = [];

      this.grid.innerHTML =
        '<p style="text-align:center; padding:2rem;">Loading...</p>';

      const books = await getBooksByCategory(
        this.#currentCategory,
        this.PAGE_SIZE,
        0
      );

      this.#currentBooks = books;
      this.#currentStartIndex = this.PAGE_SIZE;

      this.renderBooks(books);
      this.updateLoadMoreButton();
    });
  }

  highlightSidebarCategory(category) {
    this.sidebarList
      .querySelectorAll('.catalog__sidebar-item')
      .forEach(item => {
        item.classList.remove(
          'catalog__sidebar-item--selected'
        );
      });

    const links = this.sidebarList.querySelectorAll(
      '.catalog__sidebar-link'
    );

    links.forEach(link => {
      if (link.dataset.category === category) {
        link.parentElement.classList.add(
          'catalog__sidebar-item--selected'
        );
      }
    });
  }

  createCoverPlaceholder(book, size = 'card') {
    const meta = this.categoryMeta[book.category] || {
      css: 'fiction',
      icon: '📖'
    };

    const stripesSVG = `
      <svg viewBox="0 0 196 264" preserveAspectRatio="xMidYMid slice">
        <g clip-path="url(#book-cover-clip)">
          <rect width="196" height="264" rx="16" fill="currentColor"></rect>
          <rect x="-14.2" y="126" width="170" height="170"
            transform="rotate(15 -14.2 126)"
            fill="white"
            fill-opacity="0.1">
          </rect>

          <rect x="194" y="5.8" width="170" height="170"
            transform="rotate(15 194 5.8)"
            fill="black"
            fill-opacity="0.1">
          </rect>
        </g>

        <clipPath id="book-cover-clip">
          <rect width="196" height="264" rx="16" fill="white"></rect>
        </clipPath>
      </svg>
    `;

    if (size === 'detail') {
      return `
        <div class="book-detail__cover-placeholder
                    book-detail__cover-placeholder--${meta.css}">

          <div class="book-detail__cover-placeholder-stripes">
            ${stripesSVG}
          </div>

          <div class="book-detail__cover-placeholder-overlay"></div>

          <span class="book-detail__cover-placeholder-author">
            ${book.author}
          </span>

          <span class="book-detail__cover-placeholder-title">
            ${book.title}
          </span>
        </div>
      `;
    }

    return `
      <div class="catalog__card-stripes">
        ${stripesSVG}
      </div>

      <div class="catalog__card-overlay"></div>

      <p class="catalog__card-author">
        ${book.author}
      </p>

      <h5 class="catalog__card-title">
        ${book.title}
      </h5>

      <span class="catalog__card-category">
        ${book.category}
      </span>
    `;
  }

  renderBooks(books) {
    this.grid.innerHTML = '';

    if (this.countEl) {
      this.countEl.textContent = `Total: ${books.length}`;
    }

    if (books.length === 0) {
      this.grid.innerHTML =
        '<p style="text-align:center; padding:2rem;">No books found.</p>';

      return;
    }

    books.forEach(book => {
      const meta = this.categoryMeta[book.category] || {
        css: 'fiction',
        icon: '📖'
      };

      const card = document.createElement('a');

      card.href =
        `/book-detail.html?id=${book.id}` +
        `&category=${encodeURIComponent(book.category)}` +
        `&author=${encodeURIComponent(book.author)}`;

      card.className =
        `catalog__card catalog__card--${meta.css}`;

      card.innerHTML =
        this.createCoverPlaceholder(book, 'card');

      this.grid.appendChild(card);
    });
  }

  ensureLoadMoreButton() {
    if (document.getElementById('loadMoreBtn')) return;

    const btn = document.createElement('button');

    btn.id = 'loadMoreBtn';
    btn.className = 'catalog__load-more-btn';
    btn.textContent = 'Show more';

    btn.style.display = 'none';

    btn.addEventListener(
      'click',
      this.loadMoreBooks.bind(this)
    );

    if (this.grid && this.grid.parentNode) {
      this.grid.parentNode.insertBefore(
        btn,
        this.grid.nextSibling
      );
    }
  }

  async loadMoreBooks() {
    const btn = document.getElementById('loadMoreBtn');

    if (!this.grid || !btn) return;

    btn.textContent = 'Loading...';
    btn.disabled = true;

    const newBooks = await getBooksByCategory(
      this.#currentCategory,
      this.PAGE_SIZE,
      this.#currentStartIndex
    );

    if (newBooks.length === 0) {
      btn.textContent = 'No more books';
      btn.disabled = true;

      return;
    }

    this.#currentBooks = [
      ...this.#currentBooks,
      ...newBooks
    ];

    this.#currentStartIndex += this.PAGE_SIZE;

    newBooks.forEach(book => {
      const meta = this.categoryMeta[book.category] || {
        css: 'fiction',
        icon: '📖'
      };

      const card = document.createElement('a');

      card.href =
        `/book-detail.html?id=${book.id}` +
        `&category=${encodeURIComponent(book.category)}` +
        `&author=${encodeURIComponent(book.author)}`;

      card.className =
        `catalog__card catalog__card--${meta.css}`;

      card.innerHTML =
        this.createCoverPlaceholder(book, 'card');

      this.grid.appendChild(card);
    });

    if (this.countEl) {
      this.countEl.textContent =
        `Total: ${this.#currentBooks.length}`;
    }

    btn.textContent = 'Show more';
    btn.disabled = false;

    if (newBooks.length < this.PAGE_SIZE) {
      btn.textContent = 'No more books';
      btn.disabled = true;
    }
  }

  updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');

    if (!btn) return;

    if (this.#currentBooks.length === 0) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'block';
      btn.textContent = 'Show more';
      btn.disabled = false;
    }
  }
}