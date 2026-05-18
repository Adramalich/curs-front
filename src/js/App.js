import { CatalogPage } from "./pages/CatalogPage.js";
import { BookDetailPage } from "./pages/BookDetailPage.js";

export class App {
  async init() {
    const path = window.location.pathname;

    if (
      path.includes('catalog') ||
      path === '/' ||
      path.includes('index.html')
    ) {
      const catalogPage = new CatalogPage();

      await catalogPage.init();
    }

    if (path.includes('book-detail')) {
      const detailPage = new BookDetailPage();

      await detailPage.init();
    }
  }
}