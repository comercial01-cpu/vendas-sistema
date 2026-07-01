
/* Visualizador profissional de imagens dos produtos
   Funciona em qualquer imagem de produto/catálogo carregada na página.
   Clique na foto para abrir maior, com zoom, arraste, setas e swipe. */
(function(){
  let imagens=[]; let idx=0; let zoom=1; let pos={x:0,y:0}; let dragging=false; let start={x:0,y:0}; let lastTap=0;
  function criar(){
    if(document.getElementById('imgViewerOverlay')) return;
    const div=document.createElement('div');
    div.id='imgViewerOverlay'; div.className='img-viewer-overlay hidden';
    div.innerHTML=`
      <div class="img-viewer-top">
        <div><div id="imgViewerTitle" class="img-viewer-title">Imagem do produto</div><div id="imgViewerSub" class="img-viewer-sub">1 de 1</div></div>
        <div class="img-viewer-actions">
          <button type="button" id="imgViewerZoomOut">−</button>
          <button type="button" id="imgViewerZoomIn">+</button>
          <button type="button" id="imgViewerReset">Ajustar</button>
          <button type="button" id="imgViewerClose">Fechar</button>
        </div>
      </div>
      <button type="button" class="img-viewer-nav img-viewer-prev" id="imgViewerPrev">‹</button>
      <div class="img-viewer-stage" id="imgViewerStage"><img id="imgViewerImg" class="img-viewer-img" alt="Imagem ampliada"></div>
      <button type="button" class="img-viewer-nav img-viewer-next" id="imgViewerNext">›</button>`;
    document.body.appendChild(div);
    imgViewerClose.onclick=fechar; imgViewerPrev.onclick=()=>trocar(-1); imgViewerNext.onclick=()=>trocar(1);
    imgViewerZoomIn.onclick=()=>setZoom(zoom+0.25); imgViewerZoomOut.onclick=()=>setZoom(zoom-0.25); imgViewerReset.onclick=resetar;
    imgViewerOverlay.addEventListener('click',e=>{ if(e.target===imgViewerOverlay) fechar(); });
    document.addEventListener('keydown',e=>{ if(imgViewerOverlay.classList.contains('hidden')) return; if(e.key==='Escape')fechar(); if(e.key==='ArrowLeft')trocar(-1); if(e.key==='ArrowRight')trocar(1); });
    imgViewerStage.addEventListener('wheel',e=>{ e.preventDefault(); setZoom(zoom+(e.deltaY<0?0.18:-0.18)); },{passive:false});
    imgViewerStage.addEventListener('pointerdown',e=>{ dragging=true; start={x:e.clientX-pos.x,y:e.clientY-pos.y}; imgViewerStage.setPointerCapture?.(e.pointerId); });
    imgViewerStage.addEventListener('pointermove',e=>{ if(!dragging) return; pos={x:e.clientX-start.x,y:e.clientY-start.y}; aplicar(); });
    imgViewerStage.addEventListener('pointerup',e=>{ dragging=false; const now=Date.now(); if(now-lastTap<300){ setZoom(zoom>1?1:2.2); } lastTap=now; });
  }
  function aplicar(){ imgViewerImg.style.transform=`translate(${pos.x}px,${pos.y}px) scale(${zoom})`; }
  function setZoom(z){ zoom=Math.max(.5,Math.min(5,z)); if(zoom<=1.01) pos={x:0,y:0}; aplicar(); }
  function resetar(){ zoom=1; pos={x:0,y:0}; aplicar(); }
  function render(){
    if(!imagens.length) return;
    const item=imagens[idx]; imgViewerImg.src=item.src; imgViewerTitle.textContent=item.title||'Imagem do produto'; imgViewerSub.textContent=`${idx+1} de ${imagens.length}`; resetar();
    imgViewerPrev.style.display=imagens.length>1?'block':'none'; imgViewerNext.style.display=imagens.length>1?'block':'none';
  }
  function abrir(lista,index=0){ criar(); imagens=(lista||[]).filter(x=>x&&x.src); idx=Math.max(0,Math.min(index,imagens.length-1)); if(!imagens.length) return; document.body.style.overflow='hidden'; imgViewerOverlay.classList.remove('hidden'); render(); }
  function fechar(){ const o=document.getElementById('imgViewerOverlay'); if(o)o.classList.add('hidden'); document.body.style.overflow=''; }
  function trocar(dir){ if(!imagens.length) return; idx=(idx+dir+imagens.length)%imagens.length; render(); }
  function imgsDoProduto(img){
    const card=img.closest('.product-card,.loja-product-card,.produto-card,.card,tr,li') || document;
    let els=[...card.querySelectorAll('img')].filter(i=>i.src && !i.src.startsWith('data:image/svg'));
    if(!els.length) els=[img];
    return els.map(i=>({src:i.currentSrc||i.src,title:i.alt||img.alt||'Imagem do produto'}));
  }
  document.addEventListener('click',function(e){
    const img=e.target.closest && e.target.closest('img');
    if(!img) return;
    const src=img.currentSrc||img.src||'';
    if(!src || src.includes('favicon') || img.closest('#imgViewerOverlay') || img.dataset.noViewer==='true') return;
    const cls=(img.className||'').toString().toLowerCase();
    const parent=(img.closest('.product-card,.loja-product-card,.produto-card,.products,.vitrine,.galeria,.gallery,.carousel,.table,.card')||{});
    if(parent || cls.includes('produto') || cls.includes('foto') || cls.includes('img')){
      e.preventDefault(); abrir(imgsDoProduto(img), Math.max(0, imgsDoProduto(img).findIndex(x=>x.src===(img.currentSrc||img.src))));
    }
  },true);
  window.abrirVisualizadorImagens=function(urls,index=0,title='Imagem do produto'){
    abrir((urls||[]).map(u=>typeof u==='string'?{src:u,title}:u),index);
  };
})();
