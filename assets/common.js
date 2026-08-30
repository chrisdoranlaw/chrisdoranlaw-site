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
    "sameAs": [
      "https://www.google.com/search?kgmid=/g/11yzv04xvc",
      "https://www.avvo.com/attorneys/47282-in-christopher-doran-4712962.html",
      "https://www.facebook.com/chrisdoranlaw",
      "https://www.linkedin.com/in/cldoran",
      "https://lawyers.findlaw.com/indiana/north-vernon/4943676_1/",
      "https://inbar.reliaguide.com/lawyer/47265-IN-Christopher-Doran-228730"
    ],
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

  // article.post is shared CSS for blog posts AND practice-area/other-service
  // pages, so BlogPosting schema and related-posts must be gated on actually
  // being under /blog/ — not just the presence of that class.
  var postArticle = document.querySelector('article.post');
  var isBlogPost = postArticle && /^\/blog\//.test(location.pathname);
  if (isBlogPost) {
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

    // FAQPage schema: detects either of two hand-written conventions —
    // (a) <p><strong>Question?</strong> answer text</p>, used for FAQ blocks
    //     embedded partway through a post, or
    // (b) a whole post written as question headings (3+ <h2> ending in "?"),
    //     with the answer being the paragraph(s) until the next heading.
    // Only pattern (a) OR (b) fires per page, never both, to avoid duplicates.
    var faqItems = [];
    postArticle.querySelectorAll('p').forEach(function (p) {
      var strong = p.querySelector('strong');
      if (strong && p.firstElementChild === strong && /\?\s*$/.test(strong.textContent.trim())) {
        var question = strong.textContent.trim();
        var answer = p.textContent.slice(p.textContent.indexOf(question) + question.length).trim();
        if (answer) faqItems.push({ q: question, a: answer });
      }
    });
    // Pattern (b) is gated on the post itself explicitly saying "FAQ" in its
    // title — question-phrased subheadings are a common rhetorical device in
    // ordinary how-to posts (e.g. "Ready to Take the Next Step?" as a closing
    // CTA), and tagging those as genuine FAQ content risks Google penalizing
    // non-genuine FAQ markup. Requiring an explicit FAQ signal avoids that.
    if (!faqItems.length && /\bFAQs?\b|Frequently Asked Questions/i.test(headlineEl ? headlineEl.textContent : document.title)) {
      var qHeadings = Array.prototype.filter.call(postArticle.querySelectorAll('h2'), function (h) {
        return /\?\s*$/.test(h.textContent.trim());
      });
      if (qHeadings.length >= 3) {
        qHeadings.forEach(function (h) {
          var question = h.textContent.trim();
          var answerParts = [];
          var node = h.nextElementSibling;
          while (node && node.tagName !== 'H2') {
            if (node.tagName === 'P') answerParts.push(node.textContent.trim());
            node = node.nextElementSibling;
          }
          var answer = answerParts.join(' ').trim();
          if (answer) faqItems.push({ q: question, a: answer });
        });
      }
    }
    if (faqItems.length) {
      var faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(function (item) {
          return { "@type": "Question", "name": item.q, "acceptedAnswer": { "@type": "Answer", "text": item.a } };
        })
      };
      var faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.text = JSON.stringify(faqLd);
      document.head.appendChild(faqScript);
    }

    // Related posts: same category, pulled from the same JSON the blog
    // index uses, so there's one source of truth for post/category data.
    var slugMatch = location.pathname.match(/\/blog\/([^/]+)\//);
    var currentSlug = slugMatch ? slugMatch[1] : null;
    if (currentSlug) {
      fetch(siteRoot + 'assets/posts.json').then(function (r) { return r.json(); }).then(function (data) {
        var current = data.posts.find(function (p) { return p[1] === currentSlug; });
        if (!current) return;
        var sameCategory = data.posts.filter(function (p) { return p[2] === current[2] && p[1] !== currentSlug; });
        if (!sameCategory.length) return;
        for (var i = sameCategory.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = sameCategory[i]; sameCategory[i] = sameCategory[j]; sameCategory[j] = tmp;
        }
        var picks = sameCategory.slice(0, 3);

        var section = document.createElement('div');
        section.className = 'related-posts';
        var heading = document.createElement('h2');
        heading.textContent = 'Related Posts';
        section.appendChild(heading);
        var ul = document.createElement('ul');
        ul.className = 'blog-list';
        picks.forEach(function (p) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.textContent = p[0];
          a.href = siteRoot + 'blog/' + p[1] + '/index.html';
          li.appendChild(a);
          ul.appendChild(li);
        });
        section.appendChild(ul);

        var ctaBand = postArticle.querySelector('.cta-band');
        if (ctaBand) {
          ctaBand.parentNode.insertBefore(section, ctaBand.nextSibling);
        } else {
          postArticle.appendChild(section);
        }
      }).catch(function () { /* related posts are a nice-to-have; fail silently */ });
    }
  }

  // "From the Blog": cross-links practice-area and other-service pages to
  // relevant posts. Practice areas map straight to a posts.json category;
  // other-service pages don't have a clean 1:1 category, so those get a
  // short hand-picked list of slugs instead.
  if (postArticle && !isBlogPost) {
    var practiceAreaCategories = { 'criminal-defense': 1, 'family-law': 2, 'estate-planning': 3, 'small-claims-and-evictions': 4 };
    var otherServicePicks = {
      'domestic-relations-mediator': [
        'the-secret-to-a-faster-divorce-how-staying-friendly-saves-you-time-and',
        'mediator-attorney-or-private-judge-jennings-county-custody-cases',
        'divorce-vs-legal-separation-which-is-better-for-your-jennings-co-family',
        'how-to-file-for-divorce-in-jennings-county'
      ],
      'guardian-ad-litem-gal-a-voice-for-the-children': [
        'indiana-chins-cases-explained-a-parents-guide-to-what-happens-next',
        'the-permanency-project-getting-our-kids-home-sooner',
        'do-grandparents-have-a-legal-seat-at-the-table-grandparent-visitation',
        'my-child-was-arrested-in-jennings-county-a-step-by-step-guide-for-stressed'
      ],
      'private-judge-privacy-and-efficiency': [
        'what-exactly-is-a-judge-pro-tem',
        'back-on-the-bench-what-it-means-to-serve-as-a-senior-judge-in-indiana',
        'mediator-attorney-or-private-judge-jennings-county-custody-cases',
        'back-on-the-bench-an-important-update-from-chris-doran-law-llc'
      ]
    };

    var paMatch = location.pathname.match(/\/practice-areas\/([^/]+)\//);
    var osMatch = location.pathname.match(/\/other-services\/([^/]+)\//);
    var category = paMatch ? practiceAreaCategories[paMatch[1]] : undefined;
    var pickSlugs = osMatch ? otherServicePicks[osMatch[1]] : undefined;

    if (category !== undefined || pickSlugs) {
      fetch(siteRoot + 'assets/posts.json').then(function (r) { return r.json(); }).then(function (data) {
        var picks;
        if (pickSlugs) {
          picks = pickSlugs
            .map(function (slug) { return data.posts.find(function (p) { return p[1] === slug; }); })
            .filter(Boolean);
        } else {
          var inCategory = data.posts.filter(function (p) { return p[2] === category; });
          for (var i = inCategory.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = inCategory[i]; inCategory[i] = inCategory[j]; inCategory[j] = tmp;
          }
          picks = inCategory.slice(0, 6);
        }
        if (!picks.length) return;

        var section = document.createElement('div');
        section.className = 'related-posts';
        var heading = document.createElement('h2');
        heading.textContent = 'From the Blog';
        section.appendChild(heading);
        var ul = document.createElement('ul');
        ul.className = 'blog-list';
        picks.forEach(function (p) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.textContent = p[0];
          a.href = siteRoot + 'blog/' + p[1] + '/index.html';
          li.appendChild(a);
          ul.appendChild(li);
        });
        section.appendChild(ul);

        var ctaBand = postArticle.querySelector('.cta-band');
        if (ctaBand) {
          ctaBand.parentNode.insertBefore(section, ctaBand.nextSibling);
        } else {
          postArticle.appendChild(section);
        }
      }).catch(function () { /* nice-to-have; fail silently */ });
    }
  }

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.text = JSON.stringify(attorneyLd);
  document.head.appendChild(ld);

  // Breadcrumbs: only on true leaf pages one level under blog/practice-areas/
  // other-services (e.g. /blog/<slug>/), derived purely from the URL shape —
  // section index pages (e.g. /blog/) don't need "Home > Blog > Blog".
  var sectionLabels = { blog: 'Blog', 'practice-areas': 'Practice Areas', 'other-services': 'Other Services' };
  var pathSegments = location.pathname.split('/').filter(Boolean);
  if (pathSegments[pathSegments.length - 1] === 'index.html') pathSegments.pop();
  if (pathSegments.length === 2 && sectionLabels[pathSegments[0]]) {
    var sectionSlug = pathSegments[0];
    var pageH1 = document.querySelector('h1.page-title');
    var leafName = pageH1 ? pageH1.textContent.trim() : document.title;
    var crumbs = [
      { name: 'Home', url: siteRoot + 'index.html' },
      { name: sectionLabels[sectionSlug], url: siteRoot + sectionSlug + '/index.html' },
      { name: leafName, url: null }
    ];

    var nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');
    crumbs.forEach(function (c, i) {
      if (i > 0) nav.appendChild(document.createTextNode(' / '));
      if (c.url) {
        var a = document.createElement('a');
        a.href = c.url;
        a.textContent = c.name;
        nav.appendChild(a);
      } else {
        var span = document.createElement('span');
        span.textContent = c.name;
        span.setAttribute('aria-current', 'page');
        nav.appendChild(span);
      }
    });
    var mainEl = document.querySelector('main');
    if (mainEl) mainEl.insertBefore(nav, mainEl.firstChild);

    var breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": crumbs.map(function (c, i) {
        var item = { "@type": "ListItem", "position": i + 1, "name": c.name };
        if (c.url) item.item = c.url;
        return item;
      })
    };
    var breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbLd);
    document.head.appendChild(breadcrumbScript);
  }

  // Skip-to-content link for keyboard/screen-reader users, hidden until focused.
  var mainForSkip = document.querySelector('main');
  if (mainForSkip) {
    if (!mainForSkip.id) mainForSkip.id = 'main-content';
    var skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#' + mainForSkip.id;
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Favicon and Open Graph tags are set statically in every page's <head>
  // (so crawlers/link-preview bots that don't execute JS still see them) —
  // nothing to inject here.

  var bar = document.createElement('div');
  bar.className = 'call-bar';
  bar.innerHTML = '<a href="tel:+18129790107">📞 Call (812) 979-0107 — by appointment only</a>';
  document.body.appendChild(bar);

  // GA4 conversion tracking: the two clearest lead-generation actions on the
  // site are booking a call and calling directly. Delegated on document.body
  // (rather than per-link) so it covers every instance of these links,
  // including the ones injected dynamically above and in the footer below.
  var trackClick = function (eventName, label) {
    if (typeof gtag === 'function') gtag('event', eventName, { link_text: label });
  };
  document.body.addEventListener('click', function (e) {
    var scheduleLink = e.target.closest('a[href*="scheduler.zoom.us"]');
    if (scheduleLink) { trackClick('schedule_click', scheduleLink.textContent.trim()); return; }
    var telLink = e.target.closest('a[href^="tel:"]');
    if (telLink) { trackClick('phone_click', telLink.getAttribute('href')); return; }
  });
  // Mailing-list signup: the form is a cross-origin SuiteDash iframe, so it
  // can't be observed directly. This listens for a postMessage from
  // SuiteDash in case they emit one on submit; unverified — check GA4's
  // DebugView against a real signup before relying on this event.
  window.addEventListener('message', function (e) {
    if (typeof e.origin === 'string' && e.origin.indexOf('suitedash.com') !== -1) {
      trackClick('mailing_list_signup', 'suitedash postMessage');
    }
  });

  // Footer quick links (Mailing List, Client Portal) — injected site-wide so
  // these two pages are reachable from every page, not just the homepage.
  var footerInner = document.querySelector('footer.site-footer .inner');
  if (footerInner) {
    // Indiana Rule of Professional Conduct 7.2(c) requires attorney
    // advertising to include the responsible lawyer/firm's name and office
    // address. The firm name is already in the header on every page, but
    // several page templates omit the address from the footer — fill it in
    // wherever it's missing rather than relying on every template to have it.
    if (!footerInner.querySelector('.addr')) {
      var addr = document.createElement('div');
      addr.className = 'addr';
      addr.innerHTML = 'MEETINGS BY APPOINTMENT ONLY<br>' +
        'P.O. Box 398, 23 E Brown St, Vernon, IN 47282<br>' +
        'E-mail: <a href="mailto:chris@chrisdoranlaw.com">chris@chrisdoranlaw.com</a> &nbsp;&middot;&nbsp; Telephone: 812-979-0107';
      footerInner.insertBefore(addr, footerInner.firstChild);
    }

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
