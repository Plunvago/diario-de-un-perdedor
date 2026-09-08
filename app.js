/* El hombre que aprendió a ser mirado
   Scroll continuo con GSAP: el contenido se revela a medida que se baja.
   Respeta prefers-reduced-motion y funciona aunque falle el CDN/vendor. */
(function () {
  "use strict";

  var root = document.documentElement;
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasGSAP = !!(gsap && ScrollTrigger);

  function showAll() {
    root.classList.remove("js");
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.style.opacity = "1"; });
  }

  /* Ancla activa en la cabecera (funciona en todos los casos) */
  function markNav() {
    var links = [].slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var t = document.querySelector(a.getAttribute("href"));
      if (t) map[t.id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
  markNav();

  /* Navegación por ancla: desplazamiento propio (no el "smooth" nativo del
     navegador), para que ScrollTrigger se entere de cada paso y revele el
     contenido en destino en vez de dejarlo en opacidad 0. */
  function wireAnchors() {
    var headEl = document.querySelector(".site-head");
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = (headEl ? headEl.offsetHeight : 60) + 8;
        var y = target.getBoundingClientRect().top + window.scrollY - offset;
        y = Math.max(0, y);
        if (REDUCED || !hasGSAP) { window.scrollTo(0, y); return; }
        var startY = window.scrollY;
        var diff = y - startY;
        var startTime = null;
        var duration = Math.min(1400, Math.max(500, Math.abs(diff) * 0.6));
        function step(now) {
          if (startTime === null) startTime = now;
          var t = Math.min(1, (now - startTime) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          window.scrollTo(0, startY + diff * eased);
          ScrollTrigger.update();
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    });
  }
  wireAnchors();

  /* Firma de Jorge Riveros. El SVG (assets/firma.svg) son formas rellenas
     (contorno de potrace), no trazos de pluma, así que "dibujar" un stroke no
     reproduce la escritura. Se revela con una MÁSCARA CSS: un degradado de
     borde suave que barre de izquierda a derecha (el sentido natural de la
     escritura), animado por GSAP variando --r de 0 a 1 en ~2,2 s. Sin GSAP o
     con movimiento reducido, aparece ya escrita. */
  function revealMask(holder) {
    var p = parseFloat(getComputedStyle(holder).getPropertyValue("--r")) || 0;
    var lead = p * 128 - 16;            // % de avance del frente de escritura
    var grad = "linear-gradient(90deg, #000 " + (lead - 14) + "%, transparent " + lead + "%)";
    holder.style.webkitMaskImage = grad;
    holder.style.maskImage = grad;
  }
  function loadSignature() {
    var holder = document.querySelector("[data-signature]");
    if (!holder) return;
    fetch("assets/firma.svg")
      .then(function (res) { if (!res.ok) throw new Error("firma.svg " + res.status); return res.text(); })
      .then(function (svgText) {
        holder.innerHTML = svgText;
        var svg = holder.querySelector("svg");
        if (!svg) return;
        svg.removeAttribute("width");
        svg.removeAttribute("height");

        if (REDUCED || !hasGSAP) return;   // firma ya escrita, sin barrido

        holder.style.setProperty("--r", "0");
        revealMask(holder);                 // oculta antes del primer pintado
        gsap.fromTo(holder, { "--r": 0 }, {
          "--r": 1, duration: 2.2, ease: "power1.inOut", delay: 0.5,
          onUpdate: function () { revealMask(holder); },
          onComplete: function () {         // limpia la máscara al terminar
            holder.style.webkitMaskImage = "";
            holder.style.maskImage = "";
          }
        });
      })
      .catch(function () {
        var img = document.createElement("img");
        img.src = "assets/firma.svg";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        holder.appendChild(img);
      });
  }
  loadSignature();

  /* Red de seguridad: cualquier bloque que ya esté a la vista pero siga en
     opacidad 0 (llegadas por ancla, atrás/adelante del navegador, etc.) se
     muestra igual. */
  function sweepReveals() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (getComputedStyle(el).opacity !== "0") return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        if (hasGSAP && gsap) gsap.to(el, { opacity: 1, y: 0, duration: 0.5 });
        else el.style.opacity = "1";
      }
    });
  }
  window.addEventListener("scroll", function () {
    clearTimeout(window.__sweepT);
    window.__sweepT = setTimeout(sweepReveals, 220);
  }, { passive: true });

  if (REDUCED || !hasGSAP) {
    showAll();
    window.__ready = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Reveal general: fundido + desplazamiento visible, escalonado por grupos */
  gsap.set("[data-reveal]", { opacity: 0, y: 52 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 1.25, ease: "power3.out", stagger: 0.12, overwrite: true
      });
    }
  });

  /* Fondos de fotografía (Autor / En papel): parallax muy sutil */
  gsap.utils.toArray(".band__bg img").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6, scale: 1.06 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: img.closest(".band"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* Escenas duotono (cada Libro): la imagen respira con el scroll,
     el bloque de texto sube un poco más despacio que la imagen.
     El hero se trata aparte (Ken Burns propio), sin escala ligada al scroll. */
  gsap.utils.toArray(".duo").forEach(function (media) {
    var img = media.querySelector(".duo__img");
    var isHero = media.classList.contains("hero__media");
    if (isHero) {
      /* Parallax de scroll del hero: desplaza la imagen verticalmente. En móvil
         eso arriesga cortar la cabeza, así que solo en pantallas amplias. */
      if (window.matchMedia("(min-width: 781px)").matches) {
        gsap.fromTo(img, { yPercent: -4 }, {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: media, start: "top top", end: "bottom top", scrub: true }
        });
      }
    } else {
      gsap.fromTo(img, { yPercent: -10, scale: 1.06 }, {
        yPercent: 10, scale: 1.16, ease: "none",
        scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
    var stack = media.parentElement.querySelector(".hero__stack, .scene__stack");
    if (stack) {
      gsap.to(stack, {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  });

  /* Hero: Ken Burns continuo y visible (1.0 -> 1.08), después de la entrada.
     Origen arriba: el zoom crece hacia abajo y la cabeza nunca se recorta. */
  gsap.fromTo(".hero__media .duo__img", { scale: 1.0 }, {
    scale: 1.08, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1,
    transformOrigin: "50% 0%",
    delay: 2.1, immediateRender: false
  });

  /* Entrada del hero al cargar */
  gsap.set(".hero [data-reveal]", { opacity: 1, y: 0 });
  var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero__media", { opacity: 0, duration: 1.3 })
    .from(".hero__media .duo__img", { scale: 1.16, transformOrigin: "50% 0%", duration: 1.6, ease: "power2.out" }, "<")
    .from(".hero__title",  { opacity: 0, y: 26, duration: 0.9 }, "-=0.75")
    .from(".hero__sub",    { opacity: 0, y: 14, duration: 0.7 }, "-=0.55")
    .from(".hero__hook",   { opacity: 0, y: 14, duration: 0.7 }, "-=0.55");

  /* Título de cada escena: entra con un leve avance al llegar */
  gsap.utils.toArray(".scene__stack").forEach(function (stack) {
    gsap.from(stack, {
      opacity: 0, y: 22, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: stack, start: "top 85%", once: true }
    });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

  window.__ready = true;
})();
