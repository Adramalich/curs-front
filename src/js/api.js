// src/js/api.js — Module for working with Open Library API

const API_BASE = 'https://openlibrary.org';
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

const categories = {
  'All': 'all',
  'Fiction': 'fiction',
  'Science': 'science',
  'History': 'history',
  'Philosophy': 'philosophy',
  'Mystery': 'mystery',
  'Fantasy': 'fantasy',
  'Biography': 'biography',
  'Poetry': 'poetry'
};

function isValidText(text) {
  if (!text) return true;
  // Only Latin letters, numbers, spaces, and basic punctuation
  const validPattern = /^[a-zA-Z0-9\s.,;:!?\-'"()&—–]*$/;
  return validPattern.test(text);
}

function transformBook(item, categoryEn) {
  let author = 'Unknown author';
  let title = item.title || 'No title';

  if (!isValidText(title)) {
    console.warn('Skipping book with invalid title:', title);
    return null;
  }

  if (Array.isArray(item.author_name) && item.author_name.length > 0) {
    author = item.author_name.join(', ');
  } else if (typeof item.author_name === 'string') {
    author = item.author_name;
  }

  if (!isValidText(author)) {
    console.warn('Skipping book with invalid author:', author);
    return null;
  }

  return {
    id: item.key ? item.key.replace('/works/', '') : (item.cover_edition_key || ''),
    title: title,
    author: author,
    description: '',
    category: categoryEn
  };
}

async function fetchOnce(url, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function cachedFetch(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('From cache:', url);
    return cached.data;
  }

  console.log('API request:', url);
  const data = await fetchOnce(url);

  if (data) {
    cache.set(url, { data, timestamp: Date.now() });
  }

  return data;
}

export async function getBooksByCategory(categoryEn, maxResults = 12, startIndex = 0) {
  let url;

  if (categoryEn === 'All') {
    // Чередуем книги из разных категорий
    const allSubjects = ['fiction', 'science', 'history', 'philosophy', 'mystery', 'fantasy', 'biography', 'poetry'];
    const perSubject = Math.ceil(maxResults / allSubjects.length);
    
    const promises = allSubjects.map(subject => {
      const subjectUrl = `${API_BASE}/search.json?subject=${subject}&limit=${perSubject}&offset=${Math.floor(startIndex / allSubjects.length)}`;
      return cachedFetch(subjectUrl);
    });

    const results = await Promise.all(promises);
    
    const allBooks = [];
    results.forEach((data, index) => {
      if (data && data.docs) {
        // Определяем русское название категории по subject
        const subjectKey = allSubjects[index];
        let categoryName = 'Fiction';
        for (const [key, value] of Object.entries(categories)) {
          if (value === subjectKey) {
            categoryName = key;
            break;
          }
        }
        
        const books = data.docs
          .map(item => transformBook(item, categoryName))
          .filter(book => book !== null);
        allBooks.push(...books);
      }
    });

    // Перемешиваем и обрезаем до maxResults
    return allBooks.sort(() => Math.random() - 0.5).slice(0, maxResults);
  }

  // Обычный запрос для конкретной категории
  const subject = categories[categoryEn] || categoryEn.toLowerCase();
  url = `${API_BASE}/search.json?subject=${subject}&limit=${maxResults}&offset=${startIndex}`;

  const data = await cachedFetch(url);

  if (!data || !data.docs || data.docs.length === 0) {
    console.warn('No books found for:', categoryEn);
    return [];
  }

  return data.docs
    .map(item => transformBook(item, categoryEn))
    .filter(book => book !== null);
}

export async function getBookById(id) {
  const url = `${API_BASE}/works/${id}.json`;

  const data = await cachedFetch(url);

  if (!data) {
    console.warn('API returned empty response for book:', id);
    return null;
  }

  let description = '';

  if (typeof data.description === 'string') {
    description = data.description;
  } else if (typeof data.description === 'object' && data.description.value) {
    description = data.description.value;
  }

  if (description && description.length > 800) {
    description = description.substring(0, 800) + '...';
  }

  let author = 'Unknown author';
  if (Array.isArray(data.authors) && data.authors.length > 0) {
    author = data.authors
      .map(a => {
        if (typeof a === 'string') return a;
        if (a.name) return a.name;
        if (a.author && a.author.key) return a.author.key;
        return 'Unknown author';
      })
      .join(', ');
  } else if (data.authors && typeof data.authors === 'object' && !Array.isArray(data.authors)) {
    author = data.authors.name || 'Unknown author';
  } else if (typeof data.authors === 'string') {
    author = data.authors;
  }

  let category = 'Fiction';
  if (Array.isArray(data.subjects) && data.subjects.length > 0) {
    category = data.subjects[0];
  } else if (typeof data.subjects === 'string') {
    category = data.subjects;
  }

  return {
    id: id,
    title: data.title || 'No title',
    author: author,
    description: description,
    category: category
  };
}

export { categories };