// One continuous football studio. All marks have a pitch, territory, player or ball role.
export const palette={ink:'#102820',paper:'#F4F1DA',field:'#144C37',line:'#B5D3AE',left:'#FFC368',right:'#88DDD0',leftInk:'#FFC368',rightInk:'#88DDD0',muted:'#96B6A3'};
export function studioWorld(){
  let blades='';let seed=73;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<900;i++){const x=Math.round(rnd()*1080),y=370+Math.round(rnd()*1550);blades+=`<path d="M${x},${y}l${(rnd()-.5)*2},-${2+rnd()*3}"/>`}
  return `<defs>
    <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#092C22"/><stop offset=".38" stop-color="#174E36"/><stop offset=".67" stop-color="#285E40"/><stop offset="1" stop-color="#0D382B"/></linearGradient>
    <radialGradient id="turfLight"><stop stop-color="#91B575" stop-opacity=".18"/><stop offset="1" stop-color="#91B575" stop-opacity="0"/></radialGradient>
    <linearGradient id="turfFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="white" stop-opacity="0"/><stop offset=".13" stop-color="white"/><stop offset=".85" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
    <mask id="groundMask"><rect y="340" width="1080" height="1580" fill="url(#turfFade)"/></mask>
    <linearGradient id="discSkin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="white" stop-opacity=".19"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#studio)"/>
  <ellipse cx="540" cy="1050" rx="730" ry="1020" fill="url(#turfLight)"/>
  <g mask="url(#groundMask)">
    <g fill="#BDDB98" opacity=".028"><path d="M50,340H210L110,1920H-115Z M385,340H540L540,1920H320Z M710,340H870L970,1920H750Z"/></g>
    <g stroke="#E3EAC6" stroke-width="1" opacity=".033">${blades}</g>
    <g fill="none" stroke="#B3CEA0" stroke-width="3" opacity=".115"><path d="M125,990L20,1810M955,990L1060,1810M20,1775H1060"/><ellipse cx="540" cy="1580" rx="422" ry="165"/><path d="M540,1745V1880"/></g>
  </g>
  <ellipse cx="542" cy="1658" rx="170" ry="20" fill="#001B15" opacity=".24"/>
  <g fill="none" stroke="#B5D3AE" stroke-width="3" opacity=".37"><path d="M125,920V430H955V920M432,430V405H648V430M333,430V518H747V430"/><path d="M125,705H955"/><ellipse cx="540" cy="705" rx="97" ry="61"/></g>
  <g fill="none" stroke="#D8E7BD" stroke-width="1.5" opacity=".15"><path d="M460,406V430M487,406V430M514,406V430M541,406V430M568,406V430M595,406V430M622,406V430M433,417H647"/></g>`;
}
export function roleTerritories({zone6,zone8,focus,late=false,caveat=false}){
  const a6=caveat?.035:.045+zone6*.18,a8=caveat?.035:.045+zone8*.20;
  const y=late?790:751;
  return `<g><path d="M275,${y-62}Q410,${y-83} 616,${y-55}L625,${y+57}Q416,${y+83} 282,${y+61}Z" fill="${palette.left}" opacity="${a6}"/>
  <path d="M625,510Q717,483 826,515L848,696Q744,746 637,701Z" fill="${palette.right}" opacity="${a8}"/>
  <path d="M300,${y+61}Q450,${y+78} 600,${y+59}" fill="none" stroke="${palette.left}" stroke-width="3" stroke-dasharray="15 10" opacity="${focus==='six'?.42:.09}"/>
  <path d="M638,686L637,543Q710,510 805,535" fill="none" stroke="${palette.right}" stroke-width="3" stroke-dasharray="15 10" opacity="${focus==='eight'?.4:.08}"/></g>`;
}
export function playerMarker(p,value,color,alpha,type){
  const label=type(value,{x:p.x,y:p.y+17,size:49,font:'Label',fill:palette.ink,anchor:'middle',maxWidth:60});
  return `<g opacity="${alpha}"><ellipse cx="${p.x}" cy="${p.y+16}" rx="44" ry="32" fill="#042219" opacity=".35"/><circle cx="${p.x}" cy="${p.y}" r="43" fill="${color}" stroke="#0D382B" stroke-width="5"/><circle cx="${p.x}" cy="${p.y}" r="38" fill="url(#discSkin)" stroke="#F5F2D4" stroke-width="1.5" stroke-opacity=".45"/>${label.svg}</g>`;
}
export function supportMarker(p,{opponent=false,active=false,alpha=1}={}){
  return `<g opacity="${alpha}"><ellipse cx="${p.x}" cy="${p.y+9}" rx="28" ry="22" fill="#001C16" opacity=".25"/><circle cx="${p.x}" cy="${p.y}" r="25" fill="${opponent?'#183E31':active?'#F4F1DA':'#A2BDA8'}" stroke="${opponent?'#DBE3C7':'#153E2E'}" stroke-width="${opponent?4:3}"/><path d="M${p.x-11},${p.y-10}Q${p.x},${p.y-19} ${p.x+11},${p.y-10}" fill="none" stroke="#F4F1DA" stroke-width="2" opacity=".45"/></g>`;
}
export function ballAsset(p){return `<g transform="translate(${p.x} ${p.y})"><ellipse cy="12" rx="18" ry="9" fill="#09251C" opacity=".35"/><circle r="17" fill="#F7F3DF" stroke="#0B281F" stroke-width="2.5"/><path d="M0,-7L7,-2L4,6L-5,6L-7,-2Z M-15,-7L-11,-11L-7,-7L-9,-2Z M10,-10L15,-5L11,0L7,-3Z M-10,11L-5,7L0,11L-1,16Z M6,10L12,7L14,10L9,14Z" fill="#102820"/><path d="M0,-7L0,-15M7,-2L12,-4M4,6L8,11M-5,6L-8,10M-7,-2L-12,-5" fill="none" stroke="#102820" stroke-width="1"/></g>`}
export function passCorridor(a,b,opacity=.085){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;return `<path d="M${a.x+nx*17},${a.y+ny*17}L${b.x+nx*28},${b.y+ny*28}L${b.x-nx*28},${b.y-ny*28}L${a.x-nx*17},${a.y-ny*17}Z" fill="${palette.paper}" opacity="${opacity}"/>`}
