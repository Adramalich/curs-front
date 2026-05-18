import { getBookById } from '../api.js';

export class BookDetailPage {
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
    const params = new URLSearchParams(window.location.search);

    const bookId = params.get('id');
    const categoryFromUrl =
      params.get('category') || 'Fiction';

    const authorFromUrl =
      params.get('author') || 'Unknown author';

    this.titleEl = document.getElementById('bookTitle');
    this.authorEl = document.getElementById('bookAuthor');
    this.categoryEl = document.getElementById('bookCategory');
    this.descEl = document.getElementById('bookDescription');

    this.imgWrapper = document.querySelector(
      '.book-detail__image-wrapper'
    );

    if (!bookId) {
      if (this.titleEl) {
        this.titleEl.textContent =
          'Book not specified';
      }

      return;
    }

    if (this.titleEl) {
      this.titleEl.textContent = 'Loading...';
    }

    const book = await getBookById(bookId);

    if (!book) {
      if (this.titleEl) {
        this.titleEl.textContent =
          'Book not found';
      }

      return;
    }

    book.author = decodeURIComponent(authorFromUrl);
    book.category = decodeURIComponent(categoryFromUrl);

    document.title = `${book.title} — AuspexLib`;

    this.renderBook(book);
  }

  renderBook(book) {
    if (this.titleEl) {
      this.titleEl.textContent = book.title;
    }

    if (this.authorEl) {
      this.authorEl.textContent = book.author;
    }

    if (this.categoryEl) {
      this.categoryEl.textContent = book.category;
    }

    if (this.descEl) {
      this.descEl.innerHTML = `
        <p>${book.description}</p>
      `;
    }

    this.renderBookCover(book);
  }

  renderBookCover(book) {
    if (!this.imgWrapper) return;

    const meta = this.categoryMeta[book.category] || {
      css: 'fiction',
      icon: '📖'
    };

    const stripesSVG = `
      <svg viewBox="0 0 196 264"
           preserveAspectRatio="xMidYMid slice">

        <g clip-path="url(#book-cover-clip-detail)">
          <rect width="196"
                height="264"
                rx="16">
          </rect>

          <rect x="-14.2"
                y="126"
                width="170"
                height="170"
                transform="rotate(15 -14.2 126)"
                fill="white"
                fill-opacity="0.1">
          </rect>

          <rect x="194"
                y="5.8"
                width="170"
                height="170"
                transform="rotate(15 194 5.8)"
                fill="black"
                fill-opacity="0.1">
          </rect>
        </g>

        <clipPath id="book-cover-clip-detail">
          <rect width="196"
                height="264"
                rx="16"
                fill="white">
          </rect>
        </clipPath>
      </svg>
    `;

    this.imgWrapper.innerHTML = `
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

        <span class="book-detail__cover-placeholder-category">
          ${book.category}
        </span>
      </div>
    `;
  }
}