/* ============================================================
   NONEWEAR — Ana JS dosyası
   1. Ürün kartı hover → resim geçişi (mouse X pozisyonuna göre)
   2. Ürün galerisi hover → büyüteç zoom (magnifier)
   3. Ürün galerisi tıklama → lightbox
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ÜRÜN KARTI — Mouse pozisyonuna göre resim geçişi
  ---------------------------------------------------------- */
  function initCardHover(root) {
    root = root || document;
    root.querySelectorAll('[data-hover-images]').forEach(function (stack) {
      if (stack.__nwBound) return;
      stack.__nwBound = true;

      var alts = Array.from(stack.querySelectorAll('.product-card-minimal__image--alt'));
      if (!alts.length) return;

      var primary = stack.querySelector('.product-card-minimal__image--primary');
      var card = stack.closest('.product-card-minimal');
      if (!card) return;

      var currentIdx = -1;
      var hydrated = false;

      // Alt görseller src'siz gelir; ilk hover'da data-src'den yüklenir (mobil hiç indirmez)
      function hydrate() {
        if (hydrated) return;
        hydrated = true;
        alts.forEach(function (img) {
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          }
        });
      }

      function onMove(e) {
        hydrate();
        var rect = stack.getBoundingClientRect();
        var ratio = Math.max(0, Math.min(0.9999, (e.clientX - rect.left) / rect.width));
        var idx = Math.floor(ratio * alts.length);
        if (idx === currentIdx) return;
        if (currentIdx >= 0) alts[currentIdx].classList.remove('is-visible');
        alts[idx].classList.add('is-visible');
        if (primary) primary.classList.add('is-faded');
        currentIdx = idx;
      }

      function onEnter() {
        hydrate();
        // mouseenter'da hemen ilk alt'ı göster (lazy yüklenmeden önce de çalışsın diye)
        if (currentIdx < 0) {
          alts[0].classList.add('is-visible');
          if (primary) primary.classList.add('is-faded');
          currentIdx = 0;
        }
      }

      function onLeave() {
        if (currentIdx >= 0) alts[currentIdx].classList.remove('is-visible');
        if (primary) primary.classList.remove('is-faded');
        currentIdx = -1;
      }

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ----------------------------------------------------------
     2. ÜRÜN GALERİSİ — Büyüteç (Magnifier) hover zoom
  ---------------------------------------------------------- */
  function initMagnifier(root) {
    root = root || document;

    // Tek global sonuç penceresi
    var result = document.getElementById('nw-magnifier-result');
    if (!result) {
      result = document.createElement('div');
      result.id = 'nw-magnifier-result';
      result.className = 'nw-magnifier-result';
      document.body.appendChild(result);
    }

    root.querySelectorAll('.nw-magnifier-frame').forEach(function (frame) {
      if (frame.__nwMagBound) return;
      frame.__nwMagBound = true;

      var img = frame.querySelector('img');
      if (!img) return;

      // Lens
      var lens = document.createElement('div');
      lens.className = 'nw-magnifier-lens';
      frame.appendChild(lens);

      var ZOOM = 3;

      function getFullSrc() {
        return img.dataset.full || img.currentSrc || img.src;
      }

      function onMove(e) {
        var rect = frame.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var lW = lens.offsetWidth;
        var lH = lens.offsetHeight;
        var lx = Math.max(0, Math.min(x - lW / 2, rect.width - lW));
        var ly = Math.max(0, Math.min(y - lH / 2, rect.height - lH));

        lens.style.left = lx + 'px';
        lens.style.top = ly + 'px';

        var bgX = -(lx * ZOOM);
        var bgY = -(ly * ZOOM);

        result.style.backgroundImage = 'url(' + getFullSrc() + ')';
        result.style.backgroundSize = (rect.width * ZOOM) + 'px ' + (rect.height * ZOOM) + 'px';
        result.style.backgroundPosition = bgX + 'px ' + bgY + 'px';

        // Sonuç penceresini resmin sağına yerleştir
        var rW = result.offsetWidth;
        var rH = result.offsetHeight;
        var winW = window.innerWidth;
        var winH = window.innerHeight;

        var rx = rect.right + 12;
        // Sağ taraf sığmıyorsa sola al
        if (rx + rW > winW - 8) rx = rect.left - rW - 12;
        rx = Math.max(8, rx);

        var ry = rect.top;
        if (ry + rH > winH - 8) ry = winH - rH - 8;
        ry = Math.max(8, ry);

        result.style.left = rx + 'px';
        result.style.top = ry + 'px';
      }

      function onEnter() {
        lens.style.display = 'block';
        result.style.display = 'block';
      }

      function onLeave() {
        lens.style.display = 'none';
        result.style.display = 'none';
      }

      frame.addEventListener('mousemove', onMove);
      frame.addEventListener('mouseenter', onEnter);
      frame.addEventListener('mouseleave', onLeave);
    });
  }

  /* ----------------------------------------------------------
     3. ÜRÜN GALERİSİ — Lightbox (tıkla → tam ekran)
  ---------------------------------------------------------- */
  function initLightbox(root) {
    root = root || document;

    root.querySelectorAll('.nw-gallery').forEach(function (gallery) {
      if (gallery.__nwLbBound) return;
      gallery.__nwLbBound = true;

      var lbId = gallery.dataset.lightboxId;
      if (!lbId) return;
      var lb = document.getElementById(lbId);
      if (!lb) return;

      var lbImg = lb.querySelector('.nbhd-lightbox__img');
      var closeBtn = lb.querySelector('.nbhd-lightbox__close');
      var prevBtn = lb.querySelector('.nbhd-lightbox__nav--prev');
      var nextBtn = lb.querySelector('.nbhd-lightbox__nav--next');
      var counter = lb.querySelector('.nbhd-lightbox__counter');

      // Görselleri topla
      var images = [];
      gallery.querySelectorAll('.nw-magnifier-frame img').forEach(function (img) {
        images.push({ src: img.dataset.lightboxSrc || img.currentSrc || img.src || img.dataset.full, alt: img.alt || '' });
      });

      var current = 0;
      var isOpen = false;
      var isAnimating = false;
      var preloaded = {};

      function normalize(idx) {
        return (idx + images.length) % images.length;
      }

      function preload(idx) {
        if (!images.length) return;
        var item = images[normalize(idx)];
        if (!item || !item.src || preloaded[item.src]) return;
        var img = new Image();
        img.decoding = 'async';
        img.src = item.src;
        preloaded[item.src] = img;
      }

      function warmAround(idx) {
        preload(idx);
        preload(idx + 1);
        preload(idx - 1);
      }

      function warmAll() {
        images.forEach(function (_item, idx) {
          window.setTimeout(function () {
            preload(idx);
          }, idx * 80);
        });
      }

      function updateControls() {
        if (counter) counter.textContent = (current + 1) + ' / ' + images.length;
        if (prevBtn) prevBtn.style.display = images.length < 2 ? 'none' : '';
        if (nextBtn) nextBtn.style.display = images.length < 2 ? 'none' : '';
      }

      function resetZoom() {
        zoomed = false;
        lbImg.classList.remove('is-zoomed');
        lbImg.style.transformOrigin = '';
        lbImg.style.removeProperty('--nw-lightbox-scale');
      }

      function setActiveImage(idx) {
        current = normalize(idx);
        if (!images[current]) return;
        lbImg.src = images[current].src;
        lbImg.alt = images[current].alt;
        lbImg.className = 'nbhd-lightbox__img';
        resetZoom();
        updateControls();
        warmAround(current);
      }

      function load(idx, direction) {
        if (!images.length) return;
        var next = normalize(idx);
        if (!isOpen || !lbImg.src || direction === 0 || images.length < 2) {
          setActiveImage(next);
          return;
        }
        if (isAnimating || next === current) return;

        isAnimating = true;
        resetZoom();
        preload(next);

        var outgoing = lbImg;
        var incoming = outgoing.cloneNode(false);
        incoming.className = 'nbhd-lightbox__img nbhd-lightbox__img--incoming';
        incoming.classList.add(direction > 0 ? 'is-from-next' : 'is-from-prev');
        incoming.src = images[next].src;
        incoming.alt = images[next].alt;
        outgoing.classList.add(direction > 0 ? 'is-to-prev' : 'is-to-next');
        lb.querySelector('.nbhd-lightbox__inner').appendChild(incoming);

        incoming.getBoundingClientRect();
        incoming.classList.add('is-active');
        outgoing.classList.add('is-leaving');

        lbImg = incoming;
        current = next;
        updateControls();
        warmAround(current);

        window.setTimeout(function () {
          if (outgoing.parentNode) outgoing.parentNode.removeChild(outgoing);
          incoming.classList.remove('nbhd-lightbox__img--incoming', 'is-from-next', 'is-from-prev', 'is-active');
          isAnimating = false;
        }, 210);
      }

      warmAround(0);
      if (images.length > 1) {
        window.setTimeout(warmAll, 500);
      }

      function open(idx) {
        isOpen = true;
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        load(idx, 0);
        if (closeBtn) closeBtn.focus();
      }

      function close() {
        isOpen = false;
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        resetZoom();
      }

      // Trigger tıklamaları
      gallery.querySelectorAll('.nw-lightbox-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          var idx = parseInt(trigger.dataset.idx) || 0;
          open(idx);
        });
        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(parseInt(trigger.dataset.idx) || 0); }
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', close);
      if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); load(current - 1, -1); });
      if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); load(current + 1, 1); });

      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.classList.contains('nbhd-lightbox__inner')) close();
      });

      // Lightbox'ta zoom (tıkla)
      var zoomed = false;
      lb.addEventListener('click', function (e) {
        if (!e.target.classList.contains('nbhd-lightbox__img')) return;
        e.stopPropagation();
        if (isAnimating) return;
        if (!zoomed) {
          var rect = lbImg.getBoundingClientRect();
          var ox = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
          var oy = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
          lbImg.style.transformOrigin = ox + ' ' + oy;
          lbImg.style.setProperty('--nw-lightbox-scale', '2.5');
          lbImg.classList.add('is-zoomed');
          zoomed = true;
        } else {
          resetZoom();
        }
      });

      // Touch swipe
      var touchX = 0;
      lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (zoomed) return;
        var dx = touchX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) load(current + (dx > 0 ? 1 : -1), dx > 0 ? 1 : -1);
      }, { passive: true });

      document.addEventListener('keydown', function (e) {
        if (!isOpen) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') load(current + 1, 1);
        if (e.key === 'ArrowLeft') load(current - 1, -1);
      });
    });
  }

  /* ----------------------------------------------------------
     BAŞLAT
  ---------------------------------------------------------- */
  function pushNwEvent(name, detail) {
    if (!name) return;

    var payload = Object.assign({ event: 'nonewear_' + name }, detail || {});

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'nonewear_' + name, detail || {});
    }
  }

  function initAnalytics(root) {
    root = root || document;

    root.querySelectorAll('[data-nw-analytics]').forEach(function (el) {
      if (el.__nwAnalyticsBound) return;
      el.__nwAnalyticsBound = true;

      el.addEventListener('click', function () {
        pushNwEvent(el.dataset.nwAnalytics, {
          product_id: el.dataset.nwProductId || '',
          product_title: el.dataset.nwProductTitle || '',
          context: el.dataset.nwContext || '',
          href: el.href || ''
        });
      });
    });

    var emptyGuide = root.querySelector('.template-search__empty-guide');
    if (emptyGuide && !emptyGuide.__nwEmptyTracked) {
      emptyGuide.__nwEmptyTracked = true;
      var input = document.getElementById('Search-In-Template');
      pushNwEvent('search_no_results', {
        search_term: input ? input.value : '',
        context: 'search'
      });
    }
  }

  function init(root) {
    initCardHover(root);
    initMagnifier(root);
    initLightbox(root);
    initAnalytics(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', function (e) {
    init(e.target);
  });

})();
