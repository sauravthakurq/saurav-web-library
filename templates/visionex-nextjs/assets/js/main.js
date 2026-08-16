document.addEventListener('DOMContentLoaded', function () {
  // Mobile hamburger menu
  var hamburger = document.querySelector('.hamburger');
  var navMain = document.querySelector('.nav-main');
  if (hamburger && navMain) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navMain.classList.toggle('open');
    });
  }

  // Nav dropdown (mobile tap toggle)
  document.querySelectorAll('.nav-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 960) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (el) {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // Feature tabs
  document.querySelectorAll('.feature-tab-list').forEach(function (list) {
    var tabs = list.querySelectorAll('.feature-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var group = tab.closest('[data-tab-group]');
        var target = tab.getAttribute('data-target');
        if (group && target) {
          group.querySelectorAll('.feature-tab-image img').forEach(function (img) {
            img.style.display = img.getAttribute('data-tab') === target ? 'block' : 'none';
          });
        }
      });
    });
  });

  // Step pills
  document.querySelectorAll('.steps-pills').forEach(function (list) {
    var pills = list.querySelectorAll('.step-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var group = pill.closest('[data-step-group]');
        var target = pill.getAttribute('data-target');
        if (group && target) {
          group.querySelectorAll('.steps-content [data-step]').forEach(function (el) {
            el.style.display = el.getAttribute('data-step') === target ? '' : 'none';
          });
        }
      });
    });
  });

  // Pricing monthly/yearly toggle
  document.querySelectorAll('.toggle-switch').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var yearly = toggle.classList.toggle('yearly');
      var wrap = toggle.closest('.pricing-toggle-wrap') || document;
      wrap.querySelectorAll('.pricing-toggle span').forEach(function (label) {
        label.classList.toggle('active',
          (yearly && label.dataset.period === 'yearly') || (!yearly && label.dataset.period === 'monthly'));
      });
      wrap.querySelectorAll('.price').forEach(function (price) {
        price.classList.toggle('show-yearly', yearly);
      });
    });
  });

  // Scroll reveal via IntersectionObserver
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 200px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
    // Safety net: ensure nothing stays hidden if it never intersects (e.g. very tall pages,
    // programmatic full-page screenshots, or reduced-motion environments).
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }, 1500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
});
