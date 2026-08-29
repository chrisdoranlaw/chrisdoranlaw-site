// Shared across every page: local-business structured data + sticky mobile call bar.
// Asset paths below are derived from this script's own URL, so the site works
// whether it's served from the domain root or a sub-path (e.g. GitHub's
// temporary username.github.io/repo-name/ URL before the custom domain is live).
(function () {
  var scriptSrc = document.currentScript ? document.currentScript.src : '';
  var assetsBase = scriptSrc.replace(/common\.js(\?.*)?$/, '');

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.text = JSON.stringify({
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
  });
  document.head.appendChild(ld);

  var iconLinks = [
    ['icon', assetsBase + 'favicon-32.png', 'image/png'],
    ['icon', assetsBase + 'favicon-192.png', 'image/png', '192x192'],
    ['apple-touch-icon', assetsBase + 'favicon-192.png']
  ];
  iconLinks.forEach(function (spec) {
    var link = document.createElement('link');
    link.rel = spec[0];
    link.href = spec[1];
    if (spec[2]) link.type = spec[2];
    if (spec[3]) link.sizes = spec[3];
    document.head.appendChild(link);
  });

  if (!document.querySelector('meta[property="og:image"]')) {
    var metas = [
      ['property', 'og:type', 'website'],
      ['property', 'og:image', assetsBase + 'og-image.png'],
      ['property', 'og:site_name', 'Chris Doran Law LLC'],
      ['name', 'twitter:card', 'summary_large_image']
    ];
    metas.forEach(function (spec) {
      var m = document.createElement('meta');
      m.setAttribute(spec[0], spec[1]);
      m.setAttribute('content', spec[2]);
      document.head.appendChild(m);
    });
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      var t = document.createElement('meta');
      t.setAttribute('property', 'og:title');
      t.setAttribute('content', document.title);
      document.head.appendChild(t);
    }
  }

  var bar = document.createElement('div');
  bar.className = 'call-bar';
  bar.innerHTML = '<a href="tel:+18129790107">📞 Call (812) 979-0107 — by appointment only</a>';
  document.body.appendChild(bar);
})();
