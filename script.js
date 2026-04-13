document.addEventListener('DOMContentLoaded', function() {

  // === HERO CANVAS PARTICLE GRID ===
  (function() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var mouse = { x: -9999, y: -9999 };
    var particles = [];
    var W, H;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', function() { resize(); initParticles(); });

    canvas.parentElement.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', function() {
      mouse.x = -9999; mouse.y = -9999;
    });

    function initParticles() {
      particles = [];
      var cols = Math.floor(W / 80);
      var rows = Math.floor(H / 80);
      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          particles.push({
            ox: (c / cols) * W,
            oy: (r / rows) * H,
            x: (c / cols) * W,
            y: (r / rows) * H,
            size: Math.random() * 1.2 + 0.4,
            opacity: Math.random() * 0.35 + 0.08,
            vx: 0, vy: 0
          });
        }
      }
    }
    initParticles();

    var raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw connecting lines between nearby dots
      ctx.lineWidth = 0.4;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 90) {
            ctx.strokeStyle = 'rgba(0,255,42,' + (0.04 * (1 - dist/90)) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots + mouse repulsion
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        var mdist = Math.sqrt(mdx*mdx + mdy*mdy);
        var repel = 120;
        if (mdist < repel) {
          var force = (repel - mdist) / repel;
          p.vx += (mdx / mdist) * force * 1.8;
          p.vy += (mdy / mdist) * force * 1.8;
        }
        // Spring back to origin
        p.vx += (p.ox - p.x) * 0.04;
        p.vy += (p.oy - p.y) * 0.04;
        p.vx *= 0.78;
        p.vy *= 0.78;
        p.x += p.vx;
        p.y += p.vy;

        // Slight mouse-proximity glow
        var glow = mdist < repel ? 0.1 + (1 - mdist/repel) * 0.5 : p.opacity;
        var green = mdist < repel ? 1 : 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        if (green > 0) {
          ctx.fillStyle = 'rgba(0,255,42,' + glow + ')';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,' + glow + ')';
        }
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
  })();

  // === TYPING ANIMATION ===
  var typingTarget = document.getElementById('typingTarget');
  var typingCursor = document.getElementById('typingCursor');
  var fullText = 'how Ireland commutes';
  var typingStarted = false;

  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    var i = 0;
    var speed = 60;
    function type() {
      if (i < fullText.length) {
        typingTarget.textContent += fullText.charAt(i);
        i++;
        setTimeout(type, speed + Math.random() * 30);
      } else {
        // Cursor stays blinking after done — looks live
        setTimeout(function() {
          if (typingCursor) typingCursor.style.display = 'none';
        }, 3000);
      }
    }
    setTimeout(type, 750); // start after "Redesigning" fades in
  }
  // Start typing after page load delay
  setTimeout(startTyping, 600);

  // === NAV SMOOTH SCROLL ===
  var navTargets = {
    'Case Study': 'section-hero',
    'Resume': 'section-research',
    'Education': 'section-persona',
    'Experience': 'section-design',
    'Contact': 'section-conclusion'
  };
  var navLinks = document.querySelectorAll('.hero-nav-links a');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var text = this.textContent.trim();
      var targetId = navTargets[text];
      if (targetId) {
        var target = document.querySelector('[data-testid="' + targetId + '"]');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === PHONE FLOAT ANIMATION ===
  var phones = document.querySelectorAll('.anim-phone');
  setTimeout(function() {
    phones.forEach(function(phone) { phone.classList.add('animated'); });
  }, 1800);

  // === SCROLL PROGRESS BAR ===
  var progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  // === METRIC COUNT-UP ANIMATION ===
  function animateValue(el, target, suffix, duration) {
    var isFloat = target % 1 !== 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * target;
      el.textContent = isFloat ? current.toFixed(1) + suffix : Math.round(current).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var metricAnimDone = false;
  function triggerMetrics() {
    if (metricAnimDone) return;
    metricAnimDone = true;
    var configs = [
      { selector: '[data-testid="metrics-row"] .metric-item:nth-child(1) .metric-value', val: 3.0, suffix: '/5' },
      { selector: '[data-testid="metrics-row"] .metric-item:nth-child(2) .metric-value', val: 1, suffix: 'M+' },
      { selector: '[data-testid="metrics-row"] .metric-item:nth-child(3) .metric-value', val: 6.4, suffix: 'k' },
    ];
    configs.forEach(function(c, i) {
      var el = document.querySelector(c.selector);
      if (el) setTimeout(function() { animateValue(el, c.val, c.suffix, 1200); }, i * 150);
    });
  }

  // === HIFI STRIP DRAG SCROLL ===
  var strip = document.getElementById('hifiStrip');
  if (strip) {
    var stripWrap = strip.parentElement;
    var isDown = false;
    var startX, scrollLeft;
    stripWrap.addEventListener('mousedown', function(e) {
      isDown = true;
      stripWrap.classList.add('dragging');
      startX = e.pageX - stripWrap.offsetLeft;
      scrollLeft = stripWrap.scrollLeft;
    });
    stripWrap.addEventListener('mouseleave', function() { isDown = false; });
    stripWrap.addEventListener('mouseup', function() { isDown = false; });
    stripWrap.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - stripWrap.offsetLeft;
      stripWrap.scrollLeft = scrollLeft - (x - startX);
    });
  }

  // === SCROLL REVEAL ===
  var revealSelectors = [
    '.section-label', '.research-heading', '.metric-item', '.research-description',
    '.research-chart', '.persona-heading', '.persona-subtitle',
    '.persona-card', '.goals-heading', '.goal-item', '.lofi-title', '.lofi-desc',
    '.lofi-flow-item', '.hifi-heading', '.hifi-intro-grid', '.hifi-caption-line',
    '.comparison-heading', '.comparison-tagline', '.comparison-group-label',
    '.comparison-pair', '.quote-banner', '.conclusion-label', '.conclusion-heading',
    '.conclusion-intro', '.lesson-card', '.green-banner'
  ];

  var revealElements = document.querySelectorAll(revealSelectors.join(','));
  revealElements.forEach(function(el) {
    if (!el.closest('.hero-section')) el.classList.add('reveal');
  });

  // Directional reveals
  document.querySelectorAll('.comp-before').forEach(function(el) {
    el.classList.remove('reveal'); el.classList.add('reveal-left');
  });
  document.querySelectorAll('.comp-after').forEach(function(el) {
    el.classList.remove('reveal'); el.classList.add('reveal-right');
  });

  // Stagger groups — issue cards handled separately via slideUpCard animation
  [
    { parent: '.metrics-row', children: '.metric-item' },
    { parent: '.lofi-flow', children: '.lofi-flow-item' },
    { parent: '.lesson-grid', children: '.lesson-card' },
    { parent: '.goals-grid', children: '.goal-item' }
  ].forEach(function(group) {
    var parent = document.querySelector(group.parent);
    if (parent) {
      parent.querySelectorAll(group.children).forEach(function(child, i) {
        child.classList.add('reveal-delay-' + Math.min(i + 1, 6));
      });
    }
  });

  // Comparison pair stagger
  document.querySelectorAll('.comparison-group').forEach(function(group, gi) {
    group.querySelectorAll('.comparison-pair').forEach(function(pair, pi) {
      var delay = gi * 0.1 + pi * 0.12;
      var before = pair.querySelector('.comp-before');
      var after = pair.querySelector('.comp-after');
      var connector = pair.querySelector('.comp-connector');
      if (before) before.style.transitionDelay = delay + 's';
      if (connector) { connector.classList.add('reveal'); connector.style.transitionDelay = (delay + 0.1) + 's'; }
      if (after) after.style.transitionDelay = (delay + 0.08) + 's';
    });
  });

  // Intersection Observer
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('[data-testid="metrics-row"]')) triggerMetrics();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(el) {
    observer.observe(el);
  });

  // Issue cards — dedicated slide-up observer (no .reveal class needed)
  var issueObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        issueObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.issue-card').forEach(function(el) {
    issueObserver.observe(el);
  });

  // HiFi strip phones reveal on scroll
  var stripObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hifi-strip-phone').forEach(function(phone) {
          phone.classList.add('visible');
        });
        stripObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  var stripEl = document.getElementById('hifiStrip');
  if (stripEl) stripObserver.observe(stripEl);

  // Connector hover
  document.querySelectorAll('.comparison-pair').forEach(function(pair) {
    pair.addEventListener('mouseenter', function() {
      var icon = pair.querySelector('.comp-connector-icon');
      if (icon) icon.style.transform = 'scale(1.18)';
    });
    pair.addEventListener('mouseleave', function() {
      var icon = pair.querySelector('.comp-connector-icon');
      if (icon) icon.style.transform = '';
    });
  });

});
