(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('event-map');
  if (!canvas) return;
  const city = [-65.2995, -24.1858];
  const demoEvents = [
    {id:-101,title:'Feria de Emprendedores - Xibi Xibi',category:'Feria',place:'Parque Lineal Xibi Xibi (Pte. Gorriti)',dateLabel:'Sábado, 16:00 a 22:00 hs · fecha a confirmar',description:'Stands de diseño jujeño, plantas ornamentales, artesanías y música en vivo a orillas del río.',longitude:-65.2970,latitude:-24.1915,image:'assets/feria-xibi-xibi.webp',isDemo:true},
    {id:-102,title:'Paseo de las Luces & Salón de la Bandera',category:'Cultura',place:'Plaza Belgrano - Casa de Gobierno',dateLabel:'Viernes a domingo, 19:30 hs · fecha a confirmar',description:'Visita histórica a las esculturas de Lola Mora y a la Bandera Nacional donada por el Gral. Belgrano.',longitude:-65.3035,latitude:-24.1856,image:'assets/paseo-de-las-luces.webp',isDemo:true},
    {id:-103,title:'Jujuy Tech & Startups Meetup',category:'Networking',place:'Club de Emprendedores (Parque San Martín)',dateLabel:'Miércoles, 18:30 hs · fecha a confirmar',description:'Charlas de programación, inteligencia artificial, startups e inversión con networking libre.',longitude:-65.31433895153002,latitude:-24.18383396143092,image:'assets/jujuy-startups.webp',isDemo:true},
    {id:-104,title:'Taller de Marketing Digital e IA',category:'Capacitación',place:'CPV Barrio Chijra',dateLabel:'Lunes, 16:00 hs · fecha a confirmar',description:'Herramientas gratuitas para comerciantes locales: creación de contenido y automatización.',longitude:-65.29683966865461,latitude:-24.175888930962845,image:'assets/marketing-digital-ia.webp',isDemo:true},
    {id:-105,title:'Gala Sinfónica en Teatro Mitre',category:'Cultura',place:'Teatro Mitre (Alvear 1009)',dateLabel:'Sábado, 21:00 hs · fecha a confirmar',description:'Concierto especial de obras clásicas y música folclórica andina sinfónica.',longitude:-65.30730979878935,latitude:-24.18417125038207,image:'assets/gala-sinfonica.webp',isDemo:true},
    {id:-106,title:'Patio Gastronómico de la Estación',category:'Feria',place:'Vieja Estación (CC Manuel Belgrano)',dateLabel:'Jueves a domingo, 20:00 hs · fecha a confirmar',description:'Foodtrucks regionales, humitas, tamales, y espectáculos.',longitude:-65.29865498018445,latitude:-24.18321215473975,image:'assets/patio-gastronomico.webp',isDemo:true}
  ];
  // Coordenadas que incluye el mapa proporcionado, solo para previsualización.
  // Si la API tiene coordenadas, se utilizan las persistidas en Supabase.
  const referenceGeo = {
    'composicion a traves de la metafora':[-65.30011546061345,-24.18646222113594],
    'taller de coplas elsa tapia':[-65.31144184570724,-24.185562489009982],
    'encuentro de jujenos autores':[-65.31140748405296,-24.185704121229303],
    'grafismo carne y huesos':[-65.300255796675,-24.186574638370086],
    'del artista al publico':[-65.30018069482195,-24.186743464306094]
  };
  const palette = {Feria:'#10b981',Cultura:'#f59e0b',Networking:'#06b6d4','Capacitación':'#a855f7',
    'Arte y formación':'#ef4444','Arte y creatividad':'#f97316','Dibujo y artes visuales':'#0d9488',
    'Literatura y tradición':'#2563eb','Literatura y encuentros':'#ec4899'};
  let map=null,mapReady=false,allEvents=[],displayed=[],selected=null,markers=[],selectedPopup=null;
  let filter='Todas',dark=true,threeD=true,orbiting=false,orbitFrame=null;
  const text=(value)=>String(value??'');
  const clean=s=>text(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,' ').trim().toLowerCase();
  const colorOf=e=>palette[e.category]||(clean(e.category).includes('literatura')?'#ec4899':'#0d9488');
  const timeLabel=new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Jujuy',weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false});
  const formatDate=e=>e.dateLabel||(e.startAt&&!Number.isNaN(new Date(e.startAt).getTime())?timeLabel.format(new Date(e.startAt))+' hs':'Fecha sin confirmar');
  const putStatus=value=>{const el=$('map-status');if(el)el.textContent=value;};
  const knownPosition=e=>{
    const lat=Number(e.latitude),lon=Number(e.longitude);
    if(e.latitude!=null&&e.longitude!=null&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>-25.6&&lat<-22&&lon>-67&&lon<-64)return [lon,lat];
    return referenceGeo[clean(e.title)]||null;
  };
  const categoryOf=e=>{
    if(e.isDemo)return e.category;
    const cat=clean(e.category);
    return cat.includes('formacion')||cat.includes('taller')||cat.includes('dibujo')||cat.includes('creatividad')?'Capacitación':'Cultura';
  };
  const canAttend=e=>!e.isDemo&&!!e.startAt&&Number.isInteger(Number(e.id))&&Number(e.id)>0;
  const searchUrl=e=>'https://www.openstreetmap.org/search?query='+encodeURIComponent(e.place+', Jujuy, Argentina');
  function normPublic(e){
    return {...e,isDemo:false,latitude:e.latitude??null,longitude:e.longitude??null,category:e.category||'Cultura'};
  }
  function filtered(){return allEvents.filter(e=>filter==='Todas'||categoryOf(e)===filter);}
  function pinNode(e){
    const button=document.createElement('button');button.type='button';button.className='jt-map-pin';
    button.style.setProperty('--jt-pin',colorOf(e));button.setAttribute('aria-label','Ver '+e.title);
    const point=document.createElement('span');point.className='jt-map-pin-dot';button.append(point);
    button.addEventListener('click',()=>select(e.id));return button;
  }
  function popupNode(e){
    const panel=document.createElement('div');panel.className='jt-map-popup';
    if(e.image){const img=document.createElement('img');img.src=e.image;img.alt='Imagen de '+e.title;img.loading='lazy';panel.append(img);}
    const label=document.createElement('div');label.className='jt-map-category';label.style.color=colorOf(e);
    label.textContent=e.category+(e.isDemo?' · EJEMPLO':'');panel.append(label);
    const heading=document.createElement('h5');heading.className='jt-map-popup-title';heading.textContent=e.title;panel.append(heading);
    for(const content of ['📍 '+e.place,'🕒 '+formatDate(e),e.description||'']){
      const p=document.createElement('p');p.textContent=content;panel.append(p);
    }
    if(canAttend(e)){
      const b=document.createElement('button');b.type='button';b.className='jt-map-popup-button';
      b.textContent='✓ Asistir / Calendario / Email';
      b.addEventListener('click',()=>window.openAttendanceModal?.(Number(e.id)));
      panel.append(b);
    }else{
      const note=document.createElement('p');note.style.color='#fcd34d';
      note.textContent='Evento demostrativo sin fecha confirmada. No admite inscripción ni recordatorios.';
      panel.append(note);
    }
    const a=document.createElement('a');a.href=searchUrl(e);a.target='_blank';a.rel='noopener noreferrer';
    a.textContent='Consultar dirección ↗';a.style.cssText='display:block;margin-top:9px;text-decoration:underline;color:#6ee7b7;';panel.append(a);
    return panel;
  }
  function clearMarkers(){for(const m of markers)m.remove();markers=[];selectedPopup?.remove();selectedPopup=null;}
  function updatePins(){
    if(!mapReady||!map)return;
    clearMarkers();
    for(const ev of displayed){
      const coords=knownPosition(ev);if(!coords)continue;
      const marker=new maplibregl.Marker({element:pinNode(ev),anchor:'center'}).setLngLat(coords).addTo(map);
      markers.push(marker);
    }
    if(selected){const ev=displayed.find(x=>String(x.id)===String(selected));if(ev)focusEvent(ev,false);}
  }
  function renderSidebar(){
    const list=$('map-events-list');if(!list)return;list.replaceChildren();
    if(!displayed.length){const p=document.createElement('p');p.className='text-xs text-slate-300 p-3';p.textContent='No hay eventos para esta categoría.';list.append(p);return;}
    for(const e of displayed){
      const b=document.createElement('button');b.type='button';b.className='jt-map-card';
      b.setAttribute('data-event-map-id',String(e.id));b.setAttribute('aria-pressed',String(selected===e.id));
      if(e.image){const img=document.createElement('img');img.src=e.image;img.className='jt-map-image';img.alt='Imagen ilustrativa de '+e.title;img.loading='lazy';b.append(img);}
      const content=document.createElement('div');content.className='jt-map-card-content';
      const category=document.createElement('span');category.className='jt-map-category';category.style.color=colorOf(e);category.textContent=e.category;content.append(category);
      const title=document.createElement('strong');title.textContent=e.title;content.append(title);
      const where=document.createElement('small');where.textContent='📍 '+e.place;content.append(where);
      const when=document.createElement('small');when.textContent='🕒 '+formatDate(e);content.append(when);
      if(e.isDemo){const tag=document.createElement('span');tag.className='jt-map-demo';tag.textContent='SOLO DEMOSTRACIÓN';content.append(tag);}
      b.append(content);b.addEventListener('click',()=>select(e.id));list.append(b);
    }
  }
  function syncSidebarSelected(){
    document.querySelectorAll('[data-event-map-id]').forEach(el=>{
      const on=el.getAttribute('data-event-map-id')===String(selected);
      el.setAttribute('aria-pressed',String(on));
      if(on)el.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  }
  function focusEvent(e,animate=true){
    if(!map||!mapReady)return;
    const coords=knownPosition(e);
    if(!coords){putStatus('Este evento no tiene coordenadas disponibles. Consultá la dirección en OpenStreetMap.');return;}
    selectedPopup?.remove();
    selectedPopup=new maplibregl.Popup({offset:23,maxWidth:'300px'}).setLngLat(coords).setDOMContent(popupNode(e)).addTo(map);
    if(animate)map.flyTo({center:coords,zoom:16.8,pitch:threeD?62:0,bearing:threeD?-25:0,speed:1.2,curve:1.4,essential:true});
    putStatus((e.isDemo?'⚠️ Ejemplo · ':'📍 ')+e.title+' · '+e.place);
  }
  function select(id){
    let e=displayed.find(x=>String(x.id)===String(id));
    if(!e){const other=allEvents.find(x=>String(x.id)===String(id));if(!other)return;
      filter='Todas';renderFilter();displayed=filtered();renderSidebar();updatePins();e=other;}
    selected=e.id;syncSidebarSelected();
    if(!mapReady){initMap();return;}
    focusEvent(e,true);
  }
  function renderFilter(){document.querySelectorAll('.jt-map-filter').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.filter===filter)));}
  function setFilter(value){filter=value;selected=null;displayed=filtered();renderFilter();renderSidebar();updatePins();if(displayed.length&&mapReady)putStatus(displayed.length+' eventos en '+(filter==='Todas'?'todas las categorías':filter)+'. Elegí uno para ver su lugar.');}
  function refresh(items){
    const real=Array.isArray(items)?items.map(normPublic):[];
    allEvents=[...real,...demoEvents];
    displayed=filtered();renderSidebar();renderFilter();
    if(mapReady)updatePins();
  }
  function addBuildings(){
    if(!map||!mapReady||map.getLayer('jt-3d-buildings'))return;
    try{
      const style=map.getStyle();const source=Object.entries(style.sources||{}).find(([,s])=>s.type==='vector');
      const label=(style.layers||[]).find(layer=>layer.type==='symbol'&&layer.layout?.['text-field']);
      if(!source)return;
      map.addLayer({id:'jt-3d-buildings',source:source[0],'source-layer':'building',type:'fill-extrusion',minzoom:13.5,
        paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],10],0,'#1e293b',15,'#334155',30,'#0284c7'],
        'fill-extrusion-height':['interpolate',['linear'],['zoom'],13.5,0,14.5,['coalesce',['get','render_height'],12]],
        'fill-extrusion-base':['interpolate',['linear'],['zoom'],13.5,0,14.5,['coalesce',['get','render_min_height'],0]],
        'fill-extrusion-opacity':.8}},label?.id);
    }catch(_){/* estilos sin edificio 3D conservan la cámara inclinada */}
  }
  function showFallback(message){const el=$('map-fallback');el?.classList.remove('hidden');const p=$('map-fallback-info');if(p)p.textContent=message;putStatus(message);}
  function initMap(){
    if(map)return;
    if(!window.maplibregl||!maplibregl.supported()){showFallback('MapLibre no está disponible. Revisá conexión a Internet o soporte WebGL.');return;}
    try{
      map=new maplibregl.Map({container:canvas,style:'https://tiles.openfreemap.org/styles/dark',center:city,zoom:15.3,pitch:58,bearing:-17.6,antialias:true});
      map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'bottom-right');
      map.on('style.load',()=>{mapReady=true;addBuildings();updatePins();putStatus('Mapa 3D listo. Elegí un evento del panel.');});
      map.on('error',e=>{if(/fetch|network|Failed to|style/i.test(String(e?.error?.message||'')))putStatus('No se pudieron cargar algunos recursos del mapa. Verificá Internet.');});
      map.on('mousedown',stopOrbit);map.on('touchstart',stopOrbit);
    }catch(_){showFallback('No fue posible iniciar el mapa 3D en este navegador.');}
  }
  function stopOrbit(){orbiting=false;if(orbitFrame!==null)cancelAnimationFrame(orbitFrame);orbitFrame=null;$('map-orbit-toggle')?.setAttribute('aria-pressed','false');}
  function orbit(){if(!orbiting||!map)return;map.setBearing((map.getBearing()+.21)%360);orbitFrame=requestAnimationFrame(orbit);}
  function toggleOrbit(){if(orbiting){stopOrbit();return;}initMap();if(!map)return;orbiting=true;$('map-orbit-toggle')?.setAttribute('aria-pressed','true');orbit();}
  function resetMap(){stopOrbit();initMap();selected=null;syncSidebarSelected();selectedPopup?.remove();map?.flyTo({center:city,zoom:15.3,pitch:threeD?58:0,bearing:threeD?-17.6:0,speed:1.1});putStatus('Mapa centrado en San Salvador de Jujuy.');}
  $('map-orbit-toggle')?.addEventListener('click',toggleOrbit);
  $('map-pitch-toggle')?.addEventListener('click',()=>{threeD=!threeD;initMap();map?.easeTo({pitch:threeD?58:0,bearing:threeD?-17.6:0,duration:850});$('map-pitch-toggle').textContent=threeD?'🧭 Inclinación 3D (On)':'🏙️ Vista 2D cenital';});
  $('map-theme-toggle')?.addEventListener('click',()=>{dark=!dark;initMap();if(map){mapReady=false;map.setStyle('https://tiles.openfreemap.org/styles/'+(dark?'dark':'liberty'));}$('map-theme-toggle').textContent=dark?'☀️ Modo Día / Calles':'🌙 Modo Futurista';});
  $('map-sidebar-reset')?.addEventListener('click',resetMap);
  $('jt-map-filters')?.addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn)setFilter(btn.dataset.filter);});
  window.jujuyMapSelect=e=>select(e.id);
  window.jujuyMapRefresh=refresh;
  refresh((typeof events!=='undefined'&&Array.isArray(events))?events:[]);
  initMap();
  window.addEventListener('resize',()=>map?.resize());
})();
