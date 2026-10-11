const $ = id => document.getElementById(id);
const el = (tag, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
};

function aplicarTema(t) {
  if (!t) return;
  const root = document.documentElement;
  const map = {
    colorAcento: '--color-acento',
    colorTexto: '--color-texto',
    colorTextoSuave: '--color-texto-suave',
    colorFondo: '--color-fondo',
    colorFondoSuave: '--color-fondo-suave',
    colorBorde: '--color-borde',
    fuente: '--fuente',
    anchoMaximo: '--ancho-maximo',
    radioBorde: '--radio-borde'
  };
  Object.entries(map).forEach(([k, v]) => {
    if (t[k]) root.style.setProperty(v, t[k]);
  });
}

function renderNav(nav, ev, paginaActual) {
  const brand = $('nav-brand');
  if (brand) brand.textContent = ev.tituloCorto || ev.titulo;

  const links = $('nav-links');
  if (!links) return;
  links.innerHTML = '';
  nav.forEach(item => {
    const li = el('li');
    const a = el('a');
    a.href = item.archivo;
    a.textContent = item.etiqueta;
    if (item.archivo === paginaActual) a.classList.add('active');
    li.appendChild(a);
    links.appendChild(li);
  });
}

function renderFooter(f) {
  if (!f) return;
  const txt = $('footer-texto');
  if (txt) txt.textContent = f.texto || '';
  const cont = $('footer-enlaces');
  if (!cont) return;
  (f.enlaces || []).forEach(e => {
    const a = el('a');
    a.href = e.url;
    a.textContent = e.etiqueta;
    cont.appendChild(a);
  });
}

function renderEvento(ev) {
  document.title = ev.titulo + ' · Evento';
  const h1 = $('evento-titulo');
  if (h1) h1.textContent = ev.titulo;
  const meta = $('evento-meta');
  if (meta) {
    meta.innerHTML = '';
    [ev.fechas, ev.lugar].filter(Boolean).forEach(txt => {
      const s = el('span');
      s.textContent = txt;
      meta.appendChild(s);
    });
  }
  const desc = $('evento-desc');
  if (desc) desc.textContent = ev.descripcion || '';
}

function renderAgenda(agenda) {
  const daysBar = $('days');
  const cont = $('agenda-container');
  if (!daysBar || !cont) return;

  agenda.forEach((dia, i) => {
    const btn = el('button', i === 0 ? 'active' : '');
    btn.textContent = dia.etiqueta;
    btn.addEventListener('click', () => {
      daysBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      cont.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
      btn.classList.add('active');
      $('day-' + dia.id).classList.add('active');
    });
    daysBar.appendChild(btn);

    const dayDiv = el('div', 'day' + (i === 0 ? ' active' : ''));
    dayDiv.id = 'day-' + dia.id;

    dia.bloques.forEach(bloque => {
      const slot = el('div', 'slot');
      if (bloque.tipo) slot.dataset.tipo = bloque.tipo;

      const time = el('time');
      time.textContent = bloque.hora;
      slot.appendChild(time);

      const body = el('div', 'slot-body');
      if (bloque.items.length > 1) body.classList.add('split');

      bloque.items.forEach(item => {
        const div = el('div', 'item');
        const h3 = el('h3');
        h3.textContent = item.titulo;
        div.appendChild(h3);

        const meta = [item.ponente, item.lugar].filter(Boolean).join(' · ');
        if (meta) {
          const p = el('p');
          p.textContent = meta;
          div.appendChild(p);
        }
        if (item.nota) {
          const n = el('p', 'nota');
          n.textContent = item.nota;
          div.appendChild(n);
        }
        body.appendChild(div);
      });

      slot.appendChild(body);
      dayDiv.appendChild(slot);
    });

    cont.appendChild(dayDiv);
  });
}

function renderPonentes(lista) {
  const cont = $('ponentes-container');
  if (!cont) return;
  lista.forEach(p => {
    const div = el('div', 'speaker');
    const h3 = el('h3');
    h3.textContent = p.nombre;
    div.appendChild(h3);

    const c = el('span', 'country');
    c.textContent = p.pais;
    div.appendChild(c);

    if (p.bio) {
      const bio = el('p');
      bio.textContent = p.bio;
      div.appendChild(bio);
    }
    cont.appendChild(div);
  });
}

function renderInscripciones(insc) {
  if (!insc) return;
  const desc = $('insc-desc');
  if (desc) desc.textContent = insc.descripcion || '';

  const cont = $('insc-items');
  if (cont) {
    (insc.items || []).forEach(item => {
      const div = el('div', 'insc-item');
      const h3 = el('h3');
      h3.textContent = item.titulo;
      div.appendChild(h3);
      if (item.detalle) {
        const p = el('p');
        p.textContent = item.detalle;
        div.appendChild(p);
      }
      cont.appendChild(div);
    });
  }

  const btn = $('insc-boton');
  if (btn && insc.botonTexto && insc.botonUrl) {
    btn.textContent = insc.botonTexto;
    btn.href = insc.botonUrl;
    if (insc.botonUrl.startsWith('http')) {
      btn.target = '_blank';
      btn.rel = 'noopener';
    }
  }
}

function renderMapa(m) {
  if (!m) return;
  const desc = $('mapa-desc');
  if (desc) desc.textContent = m.descripcion || '';

  const cont = $('mapa-embed');
  if (cont && m.embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = m.embedUrl;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    cont.appendChild(iframe);
  }

  const addr = $('mapa-address');
  if (addr) {
    addr.innerHTML = '';
    if (m.direccion) addr.textContent = m.direccion + ' ';
    if (m.enlaceExterno) {
      const a = el('a');
      a.href = m.enlaceExterno;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Abrir en Google Maps →';
      addr.appendChild(a);
    }
  }
}

// ---- Carga ----
fetch('datos.json?v=' + Date.now())
  .then(r => r.json())
  .then(data => {
    aplicarTema(data.tema);
    const pagina = document.body.dataset.page || '';
    renderNav(data.navegacion || [], data.evento, pagina);
    renderFooter(data.footer);

    if (pagina === 'evento')        renderEvento(data.evento);
    if (pagina === 'agenda')        renderAgenda(data.agenda || []);
    if (pagina === 'ponentes')      renderPonentes(data.ponentes || []);
    if (pagina === 'inscripciones') renderInscripciones(data.inscripciones);
    if (pagina === 'mapa')          renderMapa(data.mapa);
  })
  .catch(err => {
    document.body.insertAdjacentHTML('afterbegin',
      '<p style="padding:1rem;background:#fee2e2;color:#991b1b;font-family:sans-serif;">No se pudo cargar <code>datos.json</code>. Ábrelo desde GitHub Pages o un servidor local (no con doble clic).</p>');
    console.error(err);
  });
