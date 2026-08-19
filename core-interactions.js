(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const icon=id=>`<svg><use href="#${id}"/></svg>`;
  const panelIds=['modelsPanel','addModelsPanel','structurePanel','positioningPanel','captureEditor','remarkCreate','remarkDetail','projectPopover','appPopover','localModelsSheet','minimap'];
  const projects={
    north:{name:'ЖК Северный квартал',meta:'Секция А · строительный контроль'},
    nevskiy:{name:'БЦ Невский 42',meta:'Реконструкция · инженерные системы'}
  };

  let fallbackPositioning=false;
  let fallbackPositioningStep=0;
  let fallbackPositioningMethod=null;
  let fallbackRuler=false;
  let fallbackRulerPoints=[];

  const hidePanels=except=>panelIds.forEach(id=>{if(id!==except)$('#'+id)?.classList.add('hidden');});
  const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
  const toast=text=>{
    const box=$('#toast'),label=$('#toastText');
    if(!box||!label)return;
    label.textContent=text;
    box.classList.remove('hidden');
    clearTimeout(window.__coreToast);
    window.__coreToast=setTimeout(()=>box.classList.add('hidden'),1800);
  };
  const isOpen=id=>!$('#'+id)?.classList.contains('hidden');

  function togglePanel(id){
    const panel=$('#'+id);
    if(!panel)return;
    const willOpen=panel.classList.contains('hidden');
    if(willOpen)hidePanels(id);
    panel.classList.toggle('hidden',!willOpen);
  }

  function toggleProjectPopover(){ togglePanel('projectPopover'); }
  function toggleAppPopover(){ togglePanel('appPopover'); }
  function toggleModels(){
    const panel=$('#modelsPanel');
    if(!panel)return;
    const willOpen=panel.classList.contains('hidden');
    if(willOpen)hidePanels('modelsPanel');
    panel.classList.toggle('hidden',!willOpen);
  }

  function openProjectChooser(){
    const backdrop=$('#modalBackdrop'),modal=$('#modal');
    if(!backdrop||!modal)return;
    $('#projectPopover')?.classList.add('hidden');
    modal.innerHTML=`<h2>Сменить проект</h2><p>Текущая сцена и scene-scoped state будут закрыты.</p><div class="project-choice"><button data-core-project="north"><span class="project-dot"></span><span><strong>${projects.north.name}</strong><small>${projects.north.meta}</small></span></button><button data-core-project="nevskiy"><span class="project-dot"></span><span><strong>${projects.nevskiy.name}</strong><small>${projects.nevskiy.meta}</small></span></button></div><div class="modal-actions"><button class="secondary-pill" data-core-project-cancel>Отмена</button></div>`;
    backdrop.classList.remove('hidden');
  }

  function resetSceneForProject(){
    $('[data-selection-action="clear"]')?.click();
    if(!$('#showAll')?.classList.contains('hidden'))$('#showAll')?.click();
    let guard=0;
    while(guard++<40){
      const remove=$('#modelList [data-model-action="remove"]');
      if(!remove)break;
      remove.click();
    }
    $('.workspace-tab[data-workspace="scene"]')?.click();
    $('#modeSwitch [data-mode="bim"]')?.click();
    $$('.camera-mode button').forEach((button,i)=>button.classList.toggle('active',i===0));
  }

  function switchProject(key){
    const project=projects[key];
    if(!project)return;
    const previous=$('#projectName')?.textContent?.trim();
    $('#modalBackdrop')?.classList.add('hidden');
    hidePanels();
    if(previous===project.name){toast('Проект уже открыт');return;}

    resetSceneForProject();
    if($('#projectName'))$('#projectName').textContent=project.name;
    if($('#projectPopoverName'))$('#projectPopoverName').textContent=project.name;
    const popoverMeta=$('#projectPopover p');
    if(popoverMeta)popoverMeta.textContent=project.meta;
    const addLabel=$('#addModelsPanel .panel-title small');
    if(addLabel)addLabel.textContent=project.name.toUpperCase();
    const remarksLabel=$('#remarksList .remarks-head small');
    if(remarksLabel)remarksLabel.textContent=project.name.toUpperCase();
    toast('Проект открыт · сцена сброшена');
  }

  const fallbackMethods=[
    ['hand','По точке','Совместить BIM с выбранной реальной точкой','i-target'],
    ['two','По двум точкам','Задать положение и направление сцены','i-ruler'],
    ['adjustment','Ручная корректировка','Переместить и повернуть всю сцену','i-edit'],
    ['marker','Сканировать маркер','Выровнять сцену по QR/Aruco marker','i-pin']
  ];

  function renderFallbackPositioning(){
    const panel=$('#positioningPanel'),title=$('#positioningTitle'),body=$('#positioningBody'),footer=$('#positioningFooter');
    if(!panel||!title||!body||!footer)return;
    if(!fallbackPositioningStep){
      title.textContent='Выберите способ';
      body.innerHTML=`<div class="method-grid">${fallbackMethods.map(([id,name,desc,ico])=>`<button class="method-card" data-core-position-method="${id}"><span>${icon(ico)}</span><span><strong>${name}</strong><small>${desc}</small></span></button>`).join('')}</div>`;
      footer.innerHTML='';
      return;
    }
    const method=fallbackMethods.find(x=>x[0]===fallbackPositioningMethod)||fallbackMethods[0];
    const max=fallbackPositioningMethod==='two'?3:2;
    const labels=fallbackPositioningMethod==='marker'
      ?[['Наведите камеру на маркер','Маркер должен полностью попадать в область сканирования.'],['Проверьте совмещение','Подтвердите положение сцены.']]
      :fallbackPositioningMethod==='adjustment'
        ?[['Переместите сцену','Используйте viewport как область ручной корректировки.'],['Проверьте результат','Подтвердите новое положение сцены.']]
        :fallbackPositioningMethod==='two'
          ?[['Укажите первую точку','Выберите первую опорную точку.'],['Укажите вторую точку','Выберите вторую опорную точку.'],['Проверьте совмещение','Подтвердите результат.']]
          :[['Совместите сцену','Укажите опорную точку в viewport.'],['Проверьте результат','Подтвердите положение сцены.']];
    const step=labels[Math.min(fallbackPositioningStep-1,labels.length-1)];
    title.textContent=method[1];
    body.innerHTML=`<div class="workflow-instruction"><span class="step-num">${fallbackPositioningStep}</span><div><strong>${step[0]}</strong><p>${step[1]}</p></div></div>`;
    footer.innerHTML=`<button class="secondary-pill" data-core-position-cancel>Отмена</button><button class="primary-pill" data-core-position-next>${fallbackPositioningStep>=max?'Готово':'Далее'}</button>`;
    footer.dataset.coreSteps=String(max);
  }

  function openFallbackPositioning(){
    fallbackPositioning=true;
    fallbackPositioningStep=0;
    fallbackPositioningMethod=null;
    hidePanels('positioningPanel');
    $('#positioningPanel')?.classList.remove('hidden');
    $('#selectionCard')?.classList.add('hidden');
    renderFallbackPositioning();
  }
  function closeFallbackPositioning(message='Позиционирование отменено'){
    fallbackPositioning=false;
    $('#positioningPanel')?.classList.add('hidden');
    toast(message);
  }

  function resetFallbackRuler(){
    fallbackRulerPoints=[];
    const layer=$('#rulerLayer');
    if(!layer)return;
    layer.classList.add('core-live-ruler');
    const points=$$('.ruler-point',layer);
    points.forEach(p=>{p.style.opacity='0';p.style.left='0';p.style.top='0';});
    const line=$('.ruler-line',layer); if(line){line.style.opacity='0';line.style.width='0';}
    const distance=$('.ruler-distance',layer); if(distance){distance.textContent='Укажите 2 точки';distance.style.left='50%';distance.style.top='50%';}
  }
  function updateFallbackRuler(){
    const layer=$('#rulerLayer');
    if(!layer)return;
    const points=$$('.ruler-point',layer);
    fallbackRulerPoints.forEach((p,i)=>{
      if(!points[i])return;
      points[i].style.opacity='1';
      points[i].style.left=(p[0]-9)+'px';
      points[i].style.top=(p[1]-9)+'px';
    });
    const line=$('.ruler-line',layer),distance=$('.ruler-distance',layer);
    if(fallbackRulerPoints.length<2){if(distance)distance.textContent='Укажите вторую точку';return;}
    const [a,b]=fallbackRulerPoints,dx=b[0]-a[0],dy=b[1]-a[1],pixels=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;
    if(line){line.style.opacity='1';line.style.left=a[0]+'px';line.style.top=a[1]+'px';line.style.width=pixels+'px';line.style.transform=`rotate(${angle}deg)`;}
    if(distance){distance.textContent=(pixels/90).toFixed(2).replace('.',',')+' м';distance.style.left=((a[0]+b[0])/2-30)+'px';distance.style.top=((a[1]+b[1])/2-42)+'px';}
  }
  function openFallbackRuler(){
    fallbackRuler=true;
    $('#rulerLayer')?.classList.remove('hidden');
    $('#rulerStrip')?.classList.remove('hidden');
    $('#sceneTools')?.classList.add('hidden');
    resetFallbackRuler();
  }
  function closeFallbackRuler(){
    fallbackRuler=false;
    $('#rulerLayer')?.classList.add('hidden');
    $('#rulerStrip')?.classList.add('hidden');
    $('#sceneTools')?.classList.remove('hidden');
  }

  function openFallbackCapture(){
    hidePanels('captureEditor');
    $('#captureEditor')?.classList.remove('hidden');
    $('#sceneTools')?.classList.add('hidden');
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#projectButton')){consume(e);toggleProjectPopover();return;}
    if(e.target.closest('#appButton')){consume(e);toggleAppPopover();return;}
    if(e.target.closest('[data-tool="models"]')){consume(e);toggleModels();return;}
    if(e.target.closest('[data-close="models"]')){consume(e);$('#modelsPanel')?.classList.add('hidden');return;}

    if(e.target.closest('#changeProjectButton')){consume(e);openProjectChooser();return;}
    const project=e.target.closest('[data-core-project]');
    if(project){consume(e);switchProject(project.dataset.coreProject);return;}
    if(e.target.closest('[data-core-project-cancel]')){consume(e);$('#modalBackdrop')?.classList.add('hidden');return;}

    if(e.target.closest('#minimapButton')){consume(e);togglePanel('minimap');return;}
    if(e.target.closest('[data-close="minimap"]')){consume(e);$('#minimap')?.classList.add('hidden');return;}

    if(e.target.closest('[data-tool="positioning"]')){
      setTimeout(()=>{if(!isOpen('positioningPanel'))openFallbackPositioning();},0);
      return;
    }
    if(e.target.closest('[data-tool="ruler"]')){
      setTimeout(()=>{if($('#rulerStrip')?.classList.contains('hidden'))openFallbackRuler();},0);
      return;
    }
    if(e.target.closest('[data-tool="capture"]')){
      setTimeout(()=>{if(!isOpen('captureEditor'))openFallbackCapture();},0);
      return;
    }

    const method=e.target.closest('[data-core-position-method]');
    if(method){consume(e);fallbackPositioningMethod=method.dataset.corePositionMethod;fallbackPositioningStep=1;renderFallbackPositioning();return;}
    if(e.target.closest('[data-core-position-next]')){
      consume(e);
      const max=+($('#positioningFooter')?.dataset.coreSteps||2);
      if(fallbackPositioningStep>=max){closeFallbackPositioning('Позиционирование сцены завершено');return;}
      fallbackPositioningStep++;renderFallbackPositioning();return;
    }
    if(e.target.closest('[data-core-position-cancel]')){consume(e);closeFallbackPositioning();return;}

    if(fallbackRuler&&e.target.closest('#clearRuler')){consume(e);resetFallbackRuler();toast('Точки измерения сброшены');return;}
    if(fallbackRuler&&e.target.closest('#doneRuler')){consume(e);closeFallbackRuler();toast('Измерение завершено');return;}
  },true);

  $('#viewport')?.addEventListener('click',e=>{
    if(!fallbackRuler||e.target.closest('button')||fallbackRulerPoints.length>=2)return;
    const rect=e.currentTarget.getBoundingClientRect();
    fallbackRulerPoints.push([e.clientX-rect.left,e.clientY-rect.top]);
    updateFallbackRuler();
  },true);
})();
