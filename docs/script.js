async function loadData(){
  try{
    const res = await fetch('data.json');
    const data = await res.json();
    renderTabs(data);
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
    btn.textContent = section.section;
    btn.onclick = () => selectSection(idx);
    tabs.appendChild(btn);

    const sec = document.createElement('section');
    sec.className = 'section' + (idx===0? ' active':'');
    sec.id = `section-${idx}`;

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
    content.appendChild(sec);
  })
}

function selectSection(idx){
  document.querySelectorAll('.tab').forEach((el,i)=> el.classList.toggle('active', i===idx));
  document.querySelectorAll('.section').forEach((el,i)=> el.classList.toggle('active', i===idx));
  window.scrollTo({top:0,behavior:'smooth'});
}

loadData();
