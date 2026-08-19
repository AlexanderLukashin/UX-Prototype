(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const panelIds=['modelsPanel','addModelsPanel','structurePanel','positioningPanel','captureEditor','remarkCreate','remarkDetail','projectPopover','appPopover','localModelsSheet','minimap'];
  const projects={
    north:{name:'ЖК Северный квартал',meta:'Секция А · строительный контроль'},
    nevskiy:{name:'БЦ Невский 42',meta:'Реконструкция · инженерные системы'}
  };

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

  function openModels(){
    hidePanels('modelsPanel');
    $('#modelsPanel')?.classList.remove('hidden');
  }

  function openProjectPopover(){
    hidePanels('projectPopover');
    $('#projectPopover')?.classList.remove('hidden');
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

  function toggleMinimap(){
    const map=$('#minimap');
    if(!map)return;
    const willOpen=map.classList.contains('hidden');
    if(willOpen)hidePanels('minimap');
    map.classList.toggle('hidden',!willOpen);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#projectButton')){
      consume(e);openProjectPopover();return;
    }
    if(e.target.closest('#changeProjectButton')){
      consume(e);openProjectChooser();return;
    }
    const project=e.target.closest('[data-core-project]');
    if(project){
      consume(e);switchProject(project.dataset.coreProject);return;
    }
    if(e.target.closest('[data-core-project-cancel]')){
      consume(e);$('#modalBackdrop')?.classList.add('hidden');return;
    }

    if(e.target.closest('[data-tool="models"]')){
      consume(e);openModels();return;
    }
    const modelMain=e.target.closest('#modelsPanel .model-main');
    if(modelMain&&!e.target.closest('[data-model-vis]')){
      consume(e);modelMain.closest('.model-row')?.classList.toggle('expanded');return;
    }

    if(e.target.closest('#minimapButton')){
      consume(e);toggleMinimap();return;
    }
    if(e.target.closest('[data-close="minimap"]')){
      consume(e);$('#minimap')?.classList.add('hidden');return;
    }
  },true);
})();
