// Shared across every page: local-business structured data + sticky mobile call bar.
// Asset paths below are derived from this script's own URL, so the site works
// whether it's served from the domain root or a sub-path (e.g. GitHub's
// temporary username.github.io/repo-name/ URL before the custom domain is live).
(function () {
  var scriptSrc = document.currentScript ? document.currentScript.src : '';
  var assetsBase = scriptSrc.replace(/common\.js(\?.*)?$/, '');
  var siteRoot = assetsBase.replace(/assets\/$/, '');

  var attorneyLd = {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "name": "Christopher L. Doran",
    "alternateName": "Chris Doran Law LLC",
    "description": "Personalized criminal defense, family law, estate planning, and small claims/eviction representation in North Vernon and Jennings County, Indiana. Meetings by appointment only; walk-ins are not accepted.",
    "url": "https://www.chrisdoranlaw.com/",
    "telephone": "+1-812-979-0107",
    "faxNumber": "+1-812-979-0107",
    "email": "chris@chrisdoranlaw.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "23 E Brown St",
      "addressLocality": "Vernon",
      "addressRegion": "IN",
      "postalCode": "47282",
      "addressCountry": "US"
    },
    "areaServed": ["North Vernon, IN", "Vernon, IN", "Butlerville, IN", "Scipio, IN", "Hayden, IN", "Commiskey, IN", "Jennings County, IN"],
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"], "opens": "08:00", "closes": "16:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Friday"], "opens": "08:00", "closes": "12:00" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Practice Areas",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Criminal Defense" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Family Law" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Estate Planning" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Small Claims and Evictions" } }
      ]
    }
  };
  // Review/AggregateRating schema: only emitted on the page that actually
  // displays the testimonials, so the markup always matches visible content.
  var testimonialCards = document.querySelectorAll('.testimonial-grid .testimonial-card');
  if (testimonialCards.length) {
    var reviews = [];
    testimonialCards.forEach(function (card) {
      var body = card.querySelector('p');
      var authorEl = card.querySelector('strong');
      if (!body || !authorEl) return;
      var author = authorEl.textContent.replace(/^[\s—-]+/, '').trim();
      reviews.push({
        "@type": "Review",
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "author": { "@type": "Person", "name": author },
        "reviewBody": body.textContent.replace(/^[“"]|[”"]$/g, '').trim()
      });
    });
    attorneyLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "bestRating": "5",
      "reviewCount": String(reviews.length)
    };
    attorneyLd.review = reviews;
  }

  // BlogPosting schema: only on pages with the blog post article markup.
  var postArticle = document.querySelector('article.post');
  if (postArticle) {
    var headlineEl = postArticle.querySelector('h1.page-title');
    var metaEl = postArticle.querySelector('.meta');
    var updateEl = postArticle.querySelector('.update-note');
    var firstImg = postArticle.querySelector('figure img');
    var descEl = document.querySelector('meta[name="description"]');
    var canonicalEl = document.querySelector('link[rel="canonical"]');

    var toIso = function (mdY) {
      var m = mdY && mdY.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!m) return null;
      return m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
    };
    var datePublished = toIso(metaEl && metaEl.textContent);
    var dateModified = (updateEl && toIso(updateEl.textContent.replace(/^.*Updated/, ''))) || datePublished;

    var blogLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": headlineEl ? headlineEl.textContent.trim() : document.title,
      "description": descEl ? descEl.getAttribute('content') : undefined,
      "url": canonicalEl ? canonicalEl.getAttribute('href') : location.href,
      "image": firstImg ? firstImg.src : undefined,
      "datePublished": datePublished || undefined,
      "dateModified": dateModified || undefined,
      "author": { "@type": "Person", "name": "Christopher L. Doran" },
      "publisher": {
        "@type": "Organization",
        "name": "Chris Doran Law LLC",
        "logo": { "@type": "ImageObject", "url": assetsBase + 'images/logo-badge.png' }
      }
    };
    var blogScript = document.createElement('script');
    blogScript.type = 'application/ld+json';
    blogScript.text = JSON.stringify(blogLd);
    document.head.appendChild(blogScript);
  }

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.text = JSON.stringify(attorneyLd);
  document.head.appendChild(ld);

  // Favicon and Open Graph tags are set statically in every page's <head>
  // (so crawlers/link-preview bots that don't execute JS still see them) —
  // nothing to inject here.

  var bar = document.createElement('div');
  bar.className = 'call-bar';
  bar.innerHTML = '<a href="tel:+18129790107">📞 Call (812) 979-0107 — by appointment only</a>';
  document.body.appendChild(bar);

  // Footer quick links (Mailing List, Client Portal) — injected site-wide so
  // these two pages are reachable from every page, not just the homepage.
  var footerInner = document.querySelector('footer.site-footer .inner');
  if (footerInner) {
    var links = document.createElement('div');
    links.className = 'footer-links';
    links.innerHTML = '<a href="' + siteRoot + 'home/mailing-list/index.html">Join Our Mailing List</a>' +
      ' &nbsp;&middot;&nbsp; <a href="https://connect.chrisdoranlaw.com" target="_blank" rel="noopener">Existing Clients: Login to Portal</a>';
    var disclaimer = footerInner.querySelector('.disclaimer');
    if (disclaimer) {
      footerInner.insertBefore(links, disclaimer);
    } else {
      footerInner.appendChild(links);
    }
  }
})();
