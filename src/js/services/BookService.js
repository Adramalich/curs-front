export class BookService {
  static BASE_URL = "https://openlibrary.org";

  #cache = new Map();

  async searchBooks(query, page = 1) {
    const cacheKey = `${query}-${page}`;

    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `${BookService.BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error("Ошибка загрузки книг");
      }

      const data = await response.json();

      this.#cache.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Search books error:", error);
      return null;
    }
  }

  async getBookDetails(workId) {
    try {
      const response = await fetch(
        `${BookService.BASE_URL}${workId}.json`
      );

      if (!response.ok) {
        throw new Error("Ошибка загрузки информации о книге");
      }

      return await response.json();
    } catch (error) {
      console.error("Book details error:", error);
      return null;
    }
  }
}