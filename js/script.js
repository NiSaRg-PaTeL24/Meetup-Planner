const COLORS=['#e11d48','#2563eb','#16a34a','#d97706','#9333ea','#0891b2','#db2777','#65a30d'];
const map=L.map('map').setView([43.8,-79.5],10);
const TILES=[
 ['https://tile.openstreetmap.org/{z}/{x}/{y}.png',{}],
 ['https://tile.openstreetmap.de/{z}/{x}/{y}.png',{}],
 ['https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{subdomains:'abcd'}]
];
let ti=0,errs=0,tl;
function useTiles(){
  if(tl)map.removeLayer(tl);
  errs=0;
  tl=L.tileLayer(TILES[ti][0],Object.assign({maxZoom:19,attribution:'© OpenStreetMap contributors'},TILES[ti][1])).addTo(map);
  tl.on('tileerror',()=>{if(++errs>=4&&ti<TILES.length-1){ti++;useTiles();}});
}
useTiles();
async function getJSON(urls){
  let err;
  for(const u of urls){
    try{const r=await fetch(u);if(!r.ok)throw new Error(r.status);return await r.json();}
    catch(e){err=e;}
  }
  throw err||new Error('failed');
}
const route=(a,b)=>{
  const p=`${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
  return getJSON([
    'https://routing.openstreetmap.de/routed-car/route/v1/driving/'+p,
    'https://router.project-osrm.org/route/v1/driving/'+p
  ]);
};

let friends=[], dest=null, routeLayers=[];
const $=id=>document.getElementById(id);
const mode=()=>document.querySelector('input[name=m]:checked').value;
const icon=c=>L.divIcon({className:'',html:`<div style="width:16px;height:16px;border-radius:50%;background:${c};border:2px solid #fff;box-shadow:0 0 3px #000"></div>`,iconSize:[16,16],iconAnchor:[8,8]});
const destIcon=L.divIcon({className:'',html:'<div style="font-size:28px;line-height:28px">📍</div>',iconSize:[28,28],iconAnchor:[14,28]});

function place(latlng){
  if(mode()==='dest'){
    if(dest) map.removeLayer(dest.marker);
    dest={latlng,marker:L.marker(latlng,{icon:destIcon}).addTo(map)};
  }else{
    const i=friends.length, c=COLORS[i%COLORS.length];
    const name=prompt('Friend name?','Friend '+(i+1))||'Friend '+(i+1);
    friends.push({name,color:c,latlng,time:null,marker:L.marker(latlng,{icon:icon(c)}).addTo(map).bindTooltip(name)});
  }
  render();
}
map.on('click',e=>place(e.latlng));

function render(){
  $('list').innerHTML=friends.map((f,i)=>
    `<div class="item"><div class="dot" style="background:${f.color}"></div>${f.name}
     <span class="t">${f.time??''}</span><button class="x" onclick="rm(${i})">✕</button></div>`).join('')
    +(dest?'<div class="item">📍 Destination set</div>':'');
}
window.rm=i=>{map.removeLayer(friends[i].marker);friends.splice(i,1);clearRoutes();render();};
function clearRoutes(){routeLayers.forEach(l=>map.removeLayer(l));routeLayers=[];$('sum').textContent='';}

$('go').onclick=async()=>{
  const q=$('q').value.trim(); if(!q)return;
  try{
    const e=encodeURIComponent(q);
    let ll;
    try{
      const d=(await getJSON(['https://photon.komoot.io/api/?limit=1&q='+e])).features;
      if(d.length) ll=L.latLng(d[0].geometry.coordinates[1],d[0].geometry.coordinates[0]);
    }catch{
      const d=await getJSON(['https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+e]);
      if(d.length) ll=L.latLng(+d[0].lat,+d[0].lon);
    }
    if(!ll) return alert('Not found. Try a fuller address, or just click the map.');
    map.setView(ll,13); place(ll); $('q').value='';
  }catch(err){alert('Search is blocked or offline ('+err.message+'). You can still click the map to place pins.');}
};
$('q').onkeydown=e=>{if(e.key==='Enter')$('go').click();};

$('calc').onclick=async()=>{
  if(!dest) return alert('Set a destination first.');
  if(friends.length<1) return alert('Add at least one friend.');
  clearRoutes(); $('sum').textContent='Calculating…';
  const d=dest.latlng;
  await Promise.all(friends.map(async f=>{
    try{
      const j=await route(f.latlng,d);
      const rt=j.routes[0];
      f.time=fmt(rt.duration); f.km=(rt.distance/1000).toFixed(1); f.sec=rt.duration;
      routeLayers.push(L.geoJSON(rt.geometry,{style:{color:f.color,weight:5,opacity:.8}}).addTo(map));
    }catch{f.time='error';f.sec=null;}
  }));
  const ok=friends.filter(f=>f.sec!=null);
  if(ok.length){
    const max=Math.max(...ok.map(f=>f.sec)), avg=ok.reduce((a,f)=>a+f.sec,0)/ok.length;
    const last=ok.find(f=>f.sec===max);
    $('sum').innerHTML=`Longest: ${last.name} (${fmt(max)})<br>Average: ${fmt(avg)}`;
    map.fitBounds(L.featureGroup([...routeLayers]).getBounds().pad(.1));
  }else $('sum').textContent='Could not get routes.';
  render();
};
function fmt(s){const m=Math.round(s/60);return m>=60?Math.floor(m/60)+'h '+m%60+'m':m+' min';}

$('clear').onclick=()=>{friends.forEach(f=>map.removeLayer(f.marker));if(dest)map.removeLayer(dest.marker);friends=[];dest=null;clearRoutes();render();};