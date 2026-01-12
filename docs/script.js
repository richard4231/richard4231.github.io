// Globale Variable für data
let sectionsData = [];

async function loadData(){
  try{
    const res = await fetch('data.json');
    sectionsData = await res.json();
    renderTabs(sectionsData);
  }catch(e){
    document.getElementById('content').innerHTML = '<p>Fehler beim Laden der Daten.</p>'
    console.error(e);
  }
}

function renderTabs(data){
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('content');

  data.forEach((section, idx) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (idx===0? ' active':'');
    // Category-Klasse hinzufügen für flexible Farben
    if(section.category){
      btn.classList.add('tab-' + section.category);
    }
    btn.textContent = section.section;
    btn.onclick = () => selectSection(idx);
    tabs.appendChild(btn);

    const sec = document.createElement('section');
    sec.className = 'section' + (idx===0? ' active':'');
    sec.id = `section-${idx}`;

    // Willkommens-Seite speziell behandeln
    if(section.isWelcome){
      const welcome = document.createElement('div');
      welcome.className = 'welcome-section';
      welcome.innerHTML = `
        <h2>Willkommen auf richard4231.github.io</h2>
        <p>Diese Seite ist eine Sammlung von <strong>interaktiven mathematischen Simulationen und Experimenten</strong>, die ich für den Einsatz im Mathematikunterricht an Schweizer Schulen entwickelt habe.</p>

        <h3>Was findest du hier?</h3>
        <ul>
          <li><strong>Simulationen:</strong> Wahrscheinlichkeitsexperimente mit Gummibärchen, Schokolinsen und anderen spielerischen Zugängen</li>
          <li><strong>3D-Visualisierungen:</strong> Interaktive 3D-Modelle zu geometrischen Konzepten (Cavalieri-Prinzip, Wurzelschnecke, kubische Zahlen)</li>
          <li><strong>Mathematische Spielereien:</strong> Erkundungen zu Pi, Sonnenblumen, Pascal-Dreieck und Sierpinski-Mustern</li>
          <li><strong>Mathbuch-Tools:</strong> Speziell entwickelte Werkzeuge für das Schweizer Mathbuch 21+</li>
        </ul>

        <h3>Technologie</h3>
        <p>Die meisten Projekte nutzen <strong>p5.js</strong> für interaktive Grafiken. Neuere Visualisierungen setzen auf <strong>WebGPU</strong> für performante 3D-Darstellungen.</p>

        <h3>Nutzung</h3>
        <p>Klicke auf einen Tab oben, um eine Kategorie auszuwählen. Klicke dann auf ein Vorschaubild, um die Simulation in einem neuen Tab zu öffnen. Alle Projekte laufen direkt im Browser – keine Installation nötig.</p>

        <p style="margin-top:2rem; color:var(--muted); font-size:0.95rem;">Entwickelt von Andreas Richard für den Mathematikunterricht | <a href="https://github.com/richard4231" target="_blank" style="color:var(--color-active)">GitHub</a></p>
      `;
      sec.appendChild(welcome);
    } else if(section.isImpressum){
      const impressum = document.createElement('div');
      impressum.className = 'welcome-section';
      impressum.innerHTML = `
        <h2>Impressum</h2>

        <h3>Angaben</h3>
        <p>
          Andreas Richard<br>
          Bern, Schweiz<br>
        </p>

        <h3>Kontakt</h3>
        <p>
          E-Mail: richard4231 (GMail)<br>
          GitHub: <a href="https://github.com/richard4231" target="_blank" style="color:var(--color-active)">github.com/richard4231</a>
        </p>

        <h3>Haftungsausschluss</h3>
        <p><strong>Haftung für Inhalte</strong><br>
        Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen. Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen</p>

        <p><strong>Haftung für Links</strong><br>
        Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr der nutzenden Person.</p>

        <h3>Urheberrecht</h3>
        <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>

        <h3>Datenschutz</h3>
        <p>Diese Website verwendet keine Cookies und sammelt keine personenbezogenen Daten. 
Es werden keine Tracking-Tools oder Analysedienste eingesetzt. Die Website wird 
über GitHub Pages gehostet; GitHub kann grundlegende Server-Logs (IP-Adressen, 
Zugriffszeiten) gemäss ihrer Datenschutzrichtlinie führen.</p>
      `;
      sec.appendChild(impressum);
    } else {
      // Normale Grid-Ansicht für andere Kategorien
      const grid = document.createElement('div');
      grid.className = 'grid';

      section.items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'card';
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.alt = item.title;
        img.src = item.img || 'images/placeholder.svg';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const h = document.createElement('h3'); h.textContent = item.title;
        const p = document.createElement('p'); p.textContent = item.url;

        meta.appendChild(h);
        meta.appendChild(p);
        link.appendChild(img);
        link.appendChild(meta);
        card.appendChild(link);
        grid.appendChild(card);
      })

      sec.appendChild(grid);
    }

    content.appendChild(sec);
  })
}

function selectSection(idx){
  document.querySelectorAll('.tab').forEach((el,i)=> el.classList.toggle('active', i===idx));
  document.querySelectorAll('.section').forEach((el,i)=> el.classList.toggle('active', i===idx));

  // Hintergrundfarbe basierend auf Kategorie des aktiven Tabs ändern
  if(sectionsData[idx] && sectionsData[idx].category){
    const category = sectionsData[idx].category;
    document.documentElement.style.setProperty('--current-bg', `var(--bg-category-${category})`);
  }

  window.scrollTo({top:0,behavior:'smooth'});
}

loadData();
