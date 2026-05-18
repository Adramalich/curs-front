var j=Object.defineProperty;var w=o=>{throw TypeError(o)};var T=(o,t,e)=>t in o?j(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var g=(o,t,e)=>T(o,typeof t!="symbol"?t+"":t,e),B=(o,t,e)=>t.has(o)||w("Cannot "+e);var n=(o,t,e)=>(B(o,t,"read from private field"),e?e.call(o):t.get(o)),y=(o,t,e)=>t.has(o)?w("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(o):t.set(o,e),c=(o,t,e,i)=>(B(o,t,"write to private field"),i?i.call(o,e):t.set(o,e),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();const _="https://openlibrary.org",L=new Map,N=10*60*1e3,b={All:"all",Fiction:"fiction",Science:"science",History:"history",Philosophy:"philosophy",Mystery:"mystery",Fantasy:"fantasy",Biography:"biography",Poetry:"poetry"};function C(o){return o?/^[a-zA-Z0-9\s.,;:!?\-'"()&—–]*$/.test(o):!0}function M(o,t){let e="Unknown author",i=o.title||"No title";return C(i)?(Array.isArray(o.author_name)&&o.author_name.length>0?e=o.author_name.join(", "):typeof o.author_name=="string"&&(e=o.author_name),C(e)?{id:o.key?o.key.replace("/works/",""):o.cover_edition_key||"",title:i,author:e,description:"",category:t}:(console.warn("Skipping book with invalid author:",e),null)):(console.warn("Skipping book with invalid title:",i),null)}async function U(o,t=1e4){const e=new AbortController,i=setTimeout(()=>e.abort(),t);try{const r=await fetch(o,{signal:e.signal});return r.ok?await r.json():null}catch{return null}finally{clearTimeout(i)}}async function v(o){const t=L.get(o);if(t&&Date.now()-t.timestamp<N)return console.log("From cache:",o),t.data;console.log("API request:",o);const e=await U(o);return e&&L.set(o,{data:e,timestamp:Date.now()}),e}async function m(o,t=12,e=0){let i;if(o==="All"){const a=["fiction","science","history","philosophy","mystery","fantasy","biography","poetry"],P=Math.ceil(t/a.length),S=a.map(u=>{const f=`${_}/search.json?subject=${u}&limit=${P}&offset=${Math.floor(e/a.length)}`;return v(f)}),$=await Promise.all(S),k=[];return $.forEach((u,f)=>{if(u&&u.docs){const A=a[f];let E="Fiction";for(const[p,I]of Object.entries(b))if(I===A){E=p;break}const x=u.docs.map(p=>M(p,E)).filter(p=>p!==null);k.push(...x)}}),k.sort(()=>Math.random()-.5).slice(0,t)}const r=b[o]||o.toLowerCase();i=`${_}/search.json?subject=${r}&limit=${t}&offset=${e}`;const s=await v(i);return!s||!s.docs||s.docs.length===0?(console.warn("No books found for:",o),[]):s.docs.map(a=>M(a,o)).filter(a=>a!==null)}async function F(o){const t=`${_}/works/${o}.json`,e=await v(t);if(!e)return console.warn("API returned empty response for book:",o),null;let i="";typeof e.description=="string"?i=e.description:typeof e.description=="object"&&e.description.value&&(i=e.description.value),i&&i.length>800&&(i=i.substring(0,800)+"...");let r="Unknown author";Array.isArray(e.authors)&&e.authors.length>0?r=e.authors.map(a=>typeof a=="string"?a:a.name?a.name:a.author&&a.author.key?a.author.key:"Unknown author").join(", "):e.authors&&typeof e.authors=="object"&&!Array.isArray(e.authors)?r=e.authors.name||"Unknown author":typeof e.authors=="string"&&(r=e.authors);let s="Fiction";return Array.isArray(e.subjects)&&e.subjects.length>0?s=e.subjects[0]:typeof e.subjects=="string"&&(s=e.subjects),{id:o,title:e.title||"No title",author:r,description:i,category:s}}var d,l,h;class H{constructor(){y(this,d,"all");y(this,l,[]);y(this,h,0);g(this,"PAGE_SIZE",12);g(this,"categoryMeta",{All:{css:"all",icon:"📚"},Fiction:{css:"fiction",icon:"📖"},Science:{css:"science",icon:"🔬"},History:{css:"history",icon:"📜"},Philosophy:{css:"philosophy",icon:"💭"},Mystery:{css:"mystery",icon:"🔍"},Fantasy:{css:"fantasy",icon:"🚀"},Biography:{css:"biography",icon:"👤"},Poetry:{css:"poetry",icon:"🎵"}})}async init(){var i;if(this.grid=document.querySelector(".catalog__grid"),this.countEl=document.querySelector(".catalog__count"),this.sidebarList=document.querySelector(".catalog__sidebar-list"),!this.grid)return;this.ensureLoadMoreButton(),c(this,h,0),c(this,l,[]),this.grid.innerHTML='<p style="text-align:center; padding:2rem;">Loading books from Open Library API...</p>';const t=await m(n(this,d),this.PAGE_SIZE,0);c(this,l,t),c(this,h,this.PAGE_SIZE),this.renderBooks(t),this.updateLoadMoreButton(),this.sidebarList&&this.initSidebar();const e=(i=this.sidebarList)==null?void 0:i.querySelector('.catalog__sidebar-link[data-category="All"]');e&&e.click()}initSidebar(){this.sidebarList.innerHTML="",Object.keys(b).forEach(t=>{const e=document.createElement("li");e.className="catalog__sidebar-item",e.innerHTML=`
        <a href="#"
           class="catalog__sidebar-link"
           data-category="${t}">
           ${t}
        </a>
      `,this.sidebarList.appendChild(e)}),this.highlightSidebarCategory(n(this,d)),this.sidebarList.addEventListener("click",async t=>{t.preventDefault();const e=t.target.closest(".catalog__sidebar-link");if(!e)return;c(this,d,e.dataset.category),this.highlightSidebarCategory(n(this,d));const i=document.querySelector(".catalog__title");i&&(i.textContent=n(this,d)),c(this,h,0),c(this,l,[]),this.grid.innerHTML='<p style="text-align:center; padding:2rem;">Loading...</p>';const r=await m(n(this,d),this.PAGE_SIZE,0);c(this,l,r),c(this,h,this.PAGE_SIZE),this.renderBooks(r),this.updateLoadMoreButton()})}highlightSidebarCategory(t){this.sidebarList.querySelectorAll(".catalog__sidebar-item").forEach(i=>{i.classList.remove("catalog__sidebar-item--selected")}),this.sidebarList.querySelectorAll(".catalog__sidebar-link").forEach(i=>{i.dataset.category===t&&i.parentElement.classList.add("catalog__sidebar-item--selected")})}createCoverPlaceholder(t,e="card"){const i=this.categoryMeta[t.category]||{css:"fiction"},r=`
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
    `;return e==="detail"?`
        <div class="book-detail__cover-placeholder
                    book-detail__cover-placeholder--${i.css}">

          <div class="book-detail__cover-placeholder-stripes">
            ${r}
          </div>

          <div class="book-detail__cover-placeholder-overlay"></div>

          <span class="book-detail__cover-placeholder-author">
            ${t.author}
          </span>

          <span class="book-detail__cover-placeholder-title">
            ${t.title}
          </span>
        </div>
      `:`
      <div class="catalog__card-stripes">
        ${r}
      </div>

      <div class="catalog__card-overlay"></div>

      <p class="catalog__card-author">
        ${t.author}
      </p>

      <h5 class="catalog__card-title">
        ${t.title}
      </h5>

      <span class="catalog__card-category">
        ${t.category}
      </span>
    `}renderBooks(t){if(this.grid.innerHTML="",this.countEl&&(this.countEl.textContent=`Total: ${t.length}`),t.length===0){this.grid.innerHTML='<p style="text-align:center; padding:2rem;">No books found.</p>';return}t.forEach(e=>{const i=this.categoryMeta[e.category]||{css:"fiction"},r=document.createElement("a");r.href=`/book-detail.html?id=${e.id}&category=${encodeURIComponent(e.category)}&author=${encodeURIComponent(e.author)}`,r.className=`catalog__card catalog__card--${i.css}`,r.innerHTML=this.createCoverPlaceholder(e,"card"),this.grid.appendChild(r)})}ensureLoadMoreButton(){if(document.getElementById("loadMoreBtn"))return;const t=document.createElement("button");t.id="loadMoreBtn",t.className="catalog__load-more-btn",t.textContent="Show more",t.style.display="none",t.addEventListener("click",this.loadMoreBooks.bind(this)),this.grid&&this.grid.parentNode&&this.grid.parentNode.insertBefore(t,this.grid.nextSibling)}async loadMoreBooks(){const t=document.getElementById("loadMoreBtn");if(!this.grid||!t)return;t.textContent="Loading...",t.disabled=!0;const e=await m(n(this,d),this.PAGE_SIZE,n(this,h));if(e.length===0){t.textContent="No more books",t.disabled=!0;return}c(this,l,[...n(this,l),...e]),c(this,h,n(this,h)+this.PAGE_SIZE),e.forEach(i=>{const r=this.categoryMeta[i.category]||{css:"fiction"},s=document.createElement("a");s.href=`/book-detail.html?id=${i.id}&category=${encodeURIComponent(i.category)}&author=${encodeURIComponent(i.author)}`,s.className=`catalog__card catalog__card--${r.css}`,s.innerHTML=this.createCoverPlaceholder(i,"card"),this.grid.appendChild(s)}),this.countEl&&(this.countEl.textContent=`Total: ${n(this,l).length}`),t.textContent="Show more",t.disabled=!1,e.length<this.PAGE_SIZE&&(t.textContent="No more books",t.disabled=!0)}updateLoadMoreButton(){const t=document.getElementById("loadMoreBtn");t&&(n(this,l).length===0?t.style.display="none":(t.style.display="block",t.textContent="Show more",t.disabled=!1))}}d=new WeakMap,l=new WeakMap,h=new WeakMap;class q{constructor(){g(this,"categoryMeta",{All:{css:"all",icon:"📚"},Fiction:{css:"fiction",icon:"📖"},Science:{css:"science",icon:"🔬"},History:{css:"history",icon:"📜"},Philosophy:{css:"philosophy",icon:"💭"},Mystery:{css:"mystery",icon:"🔍"},Fantasy:{css:"fantasy",icon:"🚀"},Biography:{css:"biography",icon:"👤"},Poetry:{css:"poetry",icon:"🎵"}})}async init(){const t=new URLSearchParams(window.location.search),e=t.get("id"),i=t.get("category")||"Fiction",r=t.get("author")||"Unknown author";if(this.titleEl=document.getElementById("bookTitle"),this.authorEl=document.getElementById("bookAuthor"),this.categoryEl=document.getElementById("bookCategory"),this.descEl=document.getElementById("bookDescription"),this.imgWrapper=document.querySelector(".book-detail__image-wrapper"),!e){this.titleEl&&(this.titleEl.textContent="Book not specified");return}this.titleEl&&(this.titleEl.textContent="Loading...");const s=await F(e);if(!s){this.titleEl&&(this.titleEl.textContent="Book not found");return}s.author=decodeURIComponent(r),s.category=decodeURIComponent(i),document.title=`${s.title} — AuspexLib`,this.renderBook(s)}renderBook(t){this.titleEl&&(this.titleEl.textContent=t.title),this.authorEl&&(this.authorEl.textContent=t.author),this.categoryEl&&(this.categoryEl.textContent=t.category),this.descEl&&(this.descEl.innerHTML=`
        <p>${t.description}</p>
      `),this.renderBookCover(t)}renderBookCover(t){if(!this.imgWrapper)return;const e=this.categoryMeta[t.category]||{css:"fiction"},i=`
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
    `;this.imgWrapper.innerHTML=`
      <div class="book-detail__cover-placeholder
                  book-detail__cover-placeholder--${e.css}">

        <div class="book-detail__cover-placeholder-stripes">
          ${i}
        </div>

        <div class="book-detail__cover-placeholder-overlay"></div>

        <span class="book-detail__cover-placeholder-author">
          ${t.author}
        </span>

        <span class="book-detail__cover-placeholder-title">
          ${t.title}
        </span>

        <span class="book-detail__cover-placeholder-category">
          ${t.category}
        </span>
      </div>
    `}}class G{async init(){const t=window.location.pathname;(t.includes("catalog")||t==="/"||t.includes("index.html"))&&await new H().init(),t.includes("book-detail")&&await new q().init()}}const O=new G;O.init();
