(function () {
  var root = document.documentElement;
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  var bar = document.querySelector(".progress span");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
    if (!bar) return;
    var height = root.scrollHeight - window.innerHeight;
    var progress = height > 0 ? window.scrollY / height : 0;
    bar.style.transform = "scaleX(" + progress + ")";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      root.style.overflow = open ? "hidden" : "";
    });
  }

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      if (!nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
      root.style.overflow = "";
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    root.style.overflow = "";
    toggle.focus();
  });

  var revealObserver = null;
  var revealLeft = new WeakSet();
  var watchReveal = function (nodes) {
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            if (el.classList.contains("is-in")) return;
            var fromAbove = revealLeft.has(el) && entry.boundingClientRect.top < window.innerHeight * 0.45;
            el.classList.toggle("from-up", fromAbove);
            void el.offsetWidth;
            el.classList.add("is-in");
          } else if (entry.intersectionRatio === 0) {
            revealLeft.add(el);
            el.classList.remove("is-in");
          }
        });
      }, { threshold: [0, 0.2] });
    }
    nodes.forEach(function (el) { revealObserver.observe(el); });
  };
  watchReveal(document.querySelectorAll(".reveal"));

  var sections = Array.prototype.map.call(links, function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var on = link.getAttribute("href") === "#" + entry.target.id;
          if (on) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (section) { current.observe(section); });
  }

  var layers = document.querySelectorAll("[data-depth]");
  if (!reduce && layers.length) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      layers.forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-depth")) || 12;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - window.innerHeight / 2;
        var shift = Math.max(-depth, Math.min(depth, -center / 28));
        el.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
      });
    };
    var requestPaint = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", requestPaint, { passive: true });
    requestPaint();
  }

  var passionGrid = document.querySelector("[data-passion-grid]");
  var passionItems = window.LIFE_GALLERY || [];
  var passionText = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
  if (passionGrid && passionItems.length) {
    passionGrid.setAttribute("data-count", String(passionItems.length));
    passionGrid.innerHTML = passionItems.map(function (item, index) {
      var wide = passionItems.length !== 2 && index === 0 ? " passion-wide" : "";
      return '<article class="passion reveal' + wide + '">' +
        '<figure><img src="' + passionText(item.src) + '" alt="' + passionText(item.alt) + '" decoding="async"></figure>' +
        '<div class="passion-caption"><h2>' + passionText(item.title) + '</h2></div>' +
        '</article>';
    }).join("");
    watchReveal(passionGrid.querySelectorAll(".reveal"));
  }

  var videoGrid = document.querySelector("[data-video-grid]");
  var videoItems = window.LIFE_VIDEOS || [];
  var filmsChapter = document.querySelector("#films");
  var filmsJump = document.querySelector('.life-jumps a[href="#films"]');
  if (videoGrid && videoItems.length) {
    if (filmsChapter) filmsChapter.hidden = false;
    if (filmsJump) filmsJump.hidden = false;
    var iconPlay = '<svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12 8 5.2z" fill="currentColor"/></svg>';
    var iconPause = '<svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h3.8v14H6.5V5zm7.2 0h3.8v14h-3.8V5z" fill="currentColor"/></svg>';
    var iconOn = '<svg class="icon-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3.2L12 5v14l-4.8-4H4V9zm9.2-.9v7.8a3.8 3.8 0 0 0 0-7.8z" fill="currentColor"/></svg>';
    var iconOff = '<svg class="icon-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3.2L12 5v14l-4.8-4H4V9zm11.2 1.1 1.4-1.4 1.4 1.4L16.6 12l1.4 1.4-1.4 1.4-1.4-1.4-1.4 1.4-1.4-1.4L14.8 12l-1.4-1.4 1.4-1.4 1.4 1.4z" fill="currentColor"/></svg>';
    videoGrid.innerHTML = videoItems.map(function (item) {
      var title = passionText(item.title);
      return '<article class="reel reveal">' +
        '<div class="player" data-player>' +
          '<video playsinline muted preload="metadata" src="' + passionText(item.src) + '" data-title="' + title + '"></video>' +
          '<button class="player-stage" type="button" aria-label="Play ' + title + '"><span class="player-mark">' + iconPlay + '</span></button>' +
          '<div class="player-line" aria-hidden="true"><span></span></div>' +
          '<div class="player-chrome">' +
            '<button class="player-btn player-toggle" type="button" aria-label="Play">' + iconPlay + iconPause + '</button>' +
            '<span class="player-time">0:00</span>' +
            '<label class="player-scrub"><span class="player-scrub-label">Seek</span><input type="range" min="0" max="1000" value="0" step="1" aria-label="Seek"></label>' +
            '<span class="player-time player-time-end">0:00</span>' +
            '<button class="player-btn player-sound" type="button" aria-label="Unmute">' + iconOn + iconOff + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="passion-caption"><h2>' + title + '</h2></div>' +
        '</article>';
    }).join("");
    watchReveal(videoGrid.querySelectorAll(".reveal"));
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var mounted = [];
    var clock = function (value) {
      if (!isFinite(value)) return "0:00";
      var seconds = Math.floor(value % 60);
      return Math.floor(value / 60) + ":" + (seconds < 10 ? "0" : "") + seconds;
    };
    videoGrid.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var stage = player.querySelector(".player-stage");
      var toggle = player.querySelector(".player-toggle");
      var sound = player.querySelector(".player-sound");
      var range = player.querySelector("input");
      var current = player.querySelector(".player-time");
      var total = player.querySelector(".player-time-end");
      var line = player.querySelector(".player-line span");
      var pinned = false;
      var api = {
        video: video,
        release: function () {
          pinned = false;
          video.pause();
        }
      };
      mounted.push(api);
      if (!finePointer) player.classList.add("is-touch");
      var paint = function () {
        var playing = !video.paused && !video.ended;
        player.classList.toggle("is-playing", playing);
        player.classList.toggle("is-muted", video.muted);
        var name = video.getAttribute("data-title") || "video";
        var action = playing ? "Pause" : "Play";
        stage.setAttribute("aria-label", action + " " + name);
        toggle.setAttribute("aria-label", action);
        sound.setAttribute("aria-label", video.muted ? "Unmute" : "Mute");
        var duration = video.duration || 0;
        var ratio = duration ? video.currentTime / duration : 0;
        if (document.activeElement !== range) range.value = String(Math.round(ratio * 1000));
        range.style.background = "linear-gradient(90deg,#fff " + (ratio * 100) + "%,rgba(255,255,255,.35) " + (ratio * 100) + "%)";
        current.textContent = clock(video.currentTime || 0);
        total.textContent = clock(duration);
        line.style.width = (ratio * 100) + "%";
      };
      var start = function () {
        mounted.forEach(function (other) {
          if (other.video !== video) other.release();
        });
        var pending = video.play();
        if (pending && pending.catch) pending.catch(function () {});
      };
      player.addEventListener("pointerenter", function () {
        if (reduce || pinned || video.ended) return;
        video.muted = true;
        start();
      });
      player.addEventListener("pointerleave", function () {
        if (pinned) return;
        video.pause();
      });
      var engage = function (event) {
        event.preventDefault();
        if (!video.paused && pinned) {
          api.release();
          return;
        }
        pinned = true;
        video.muted = false;
        if (video.ended) video.currentTime = 0;
        start();
      };
      stage.addEventListener("click", engage);
      toggle.addEventListener("click", engage);
      sound.addEventListener("click", function (event) {
        event.stopPropagation();
        video.muted = !video.muted;
        if (!video.muted) pinned = true;
        if (video.paused) start();
        paint();
      });
      range.addEventListener("pointerdown", function () { pinned = true; });
      range.addEventListener("input", function () {
        if (!isFinite(video.duration)) return;
        video.currentTime = (Number(range.value) / 1000) * video.duration;
        paint();
      });
      video.addEventListener("play", paint);
      video.addEventListener("pause", paint);
      video.addEventListener("timeupdate", paint);
      video.addEventListener("loadedmetadata", function () {
        paint();
        if (video.currentTime < 0.05 && video.duration > 0.3) {
          try { video.currentTime = 0.05; } catch (err) {}
        }
      });
      video.addEventListener("ended", function () {
        pinned = false;
        paint();
      });
      paint();
    });
    if ("IntersectionObserver" in window) {
      var videoWatch = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) return;
          var match = mounted.filter(function (item) { return item.video === entry.target; })[0];
          if (match) match.release();
        });
      }, { threshold: 0.25 });
      mounted.forEach(function (item) { videoWatch.observe(item.video); });
    }
  }

  var film = document.querySelector(".film");
  if (film) {
    var video = film.querySelector("video");
    var showFilm = function () {
      film.hidden = false;
      if (reduce) return;
      var play = function () { video.play().catch(function () {}); };
      if ("IntersectionObserver" in window) {
        var watch = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) play();
            else video.pause();
          });
        }, { threshold: 0.35 });
        watch.observe(film);
      } else {
        play();
      }
    };
    if (video.readyState >= 2) showFilm();
    video.addEventListener("loadeddata", showFilm);
    video.addEventListener("error", function () { film.hidden = true; });
  }
})();
