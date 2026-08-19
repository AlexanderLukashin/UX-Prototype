(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const I=id=>`<svg><use href="#${id}"/></svg>`;
  const modalBackdrop=$('#modalBackdrop');
  const modal=$('#modal');

  let keepSelection=null;
  let remarksScroll=0;
  let advancedFilters={status:'all',author:'all',section:'all'};
  let reviewCaptureRemark=null;
  let rulerPoints=[];
  let refreshQueued=false;

  const edits=new Map();
  const extraAttachments=new Map();
  const deletedAttachments=new Map();
  const elementOpacity=new Map();
  const structureHidden=new Set();

  const remarkMeta={
    'RM-2418':['А. Лукашин','ОВ'],
    'RM-2415':['М. Орлов','ОВ'],
    'RM-2408':['А. Лукашин','ВК'],
    'RM-2399':['И. Сергеев','КР'],
    'RM-2387':['А. Лукашин','ЭОМ'],
    'RM-2371':['Е. Данилова','АР'],
    'RM-2354':['А. Лукашин','ВК'],
    'RM-2329':['М. Орлов','ОВ']
  };
  const elementNames={
    duct:'Воздуховод П7-04',pipe:'Труба В1 Ø108',column:'Колонна К7-18',
    wall:'Стена АР-7-214',tray:'Лоток EOM-L7-32',damper:'Клапан КДМ-2'
  };
  const modelElements={
    Architecture_A:['wall'],
    MEP_Level07:['duct','pipe','tray','damper'],
    Structure_Core:['column']
  };

  const css=`
    .glass{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
    @media(max-width:959px){.glass{backdrop-filter:none;-webkit-backdrop-filter:none;background:rgba(245,247,250,.96)}}
    .audit-hidden{display:none!important}
    .filter-button.audit-active{background:#172B4D;color:#fff}
    .audit-material{position:relative}
    .audit-del{position:absolute;right:6px;top:6px;width:26px;height:26px;border:0;border-radius:50%;background:rgba(23,43,77,.86)!important;color:#fff;font-size:16px;display:grid!important;place-items:center!important;padding:0!important;cursor:pointer}
    .audit-marker-actions,.audit-status-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
    .audit-status-grid button{height:42px;border:0;border-radius:13px;background:#fff;cursor:pointer}
    .audit-ruler-shot{margin-left:auto}
    .audit-attachment-extra{outline:2px solid rgba(0,162,225,.35)}
    .audit-filter-grid{display:grid;gap:10px;margin-top:14px}
    .audit-filter-grid label{display:grid;gap:5px;font-size:10px;font-weight:700}
    .audit-filter-grid select{height:42px;border:1px solid rgba(14,31,46,.11);background:#fff;border-radius:13px;padding:0 10px;color:#172B4D}
    .audit-empty #building{opacity:0}
    .audit-hidden-model{display:none!important}
    .audit-structure-vis{margin-left:auto;flex:0 0 auto;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;color:#172B4D;cursor:pointer}
    .audit-structure-vis:hover{background:#fff}
    .audit-structure-vis svg{width:16px;height:16px}
    .audit-structure-hidden{opacity:.48}
    #rulerLayer.audit-live{left:0;top:0;width:100%;height:100%;transform:none}
    #rulerLayer.audit-live .ruler-point{opacity:0;left:0;top:0;bottom:auto;right:auto}
    #rulerLayer.audit-live .ruler-line{opacity:0;left:0;top:0;width:0;transform-origin:0 50%;border-top:3px dashed #fff}
    #rulerLayer.audit-live .ruler-distance{left:0;top:0;white-space:nowrap}
    .audit-mark{position:absolute;pointer-events:none;z-index:5}
    .audit-mark.pen{width:18px;height:18px;border-radius:50%;background:#ff625a;transform:translate(-50%,-50%)}
    .audit-mark.text{background:rgba(255,255,255,.94);color:#172B4D;padding:5px 8px;border-radius:8px;font-size:11px;transform:translate(-50%,-50%)}
    .audit-mark.rect{width:92px;height:58px;border:4px solid #ff625a;border-radius:8px;transform:translate(-50%,-50%)}
    .audit-mark.arrow{width:110px;height:4px;background:#ff625a;transform:translate(-10px,-2px) rotate(-18deg);transform-origin:left center;border-radius:4px}
    .audit-mark.arrow::after{content:"";position:absolute;right:-3px;top:-6px;border-left:14px solid #ff625a;border-top:8px solid transparent;border-bottom:8px solid transparent}
  `;
  const style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  function toast(text){
    const box=$('#toast'),label=$('#toastText');
    if(!box||!label)return;
    label.textContent=text;
    box.classList.remove('hidden');
    clearTimeout(window.__auditToast);
    window.__auditToast=setTimeout(()=>box.classList.add('hidden'),1800);
  }
  function openModal(html){
    if(!modalBackdrop||!modal)return;
    modal.innerHTML=html;
    modalBackdrop.classList.remove('hidden');
  }
  function closeModal(){ modalBackdrop?.classList.add('hidden'); }
  function currentRemarkId(){
    return ($('#remarkDetail .panel-title small')?.textContent||$('#reviewCard small')?.textContent||'').match(/RM-\d+/)?.[0]||null;
  }
  function setTextIfChanged(node,value){ if(node&&node.textContent!==value)node.textContent=value; }
  function scheduleRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    setTimeout(()=>{refreshQueued=false;refresh();},0);
  }

  function syncLabels(){
    const project=$('#projectName')?.textContent;
    if(!project)return;
    setTextIfChanged($('#addModelsPanel .panel-title small'),project);
    setTextIfChanged($('#remarksList .remarks-head small'),project);
  }
  function normalizedModelName(text=''){ return text.trim().replace(/\.(ifc|nwd|nwc)$/i,''); }
  function modelRows(){
    return new Map($$('#modelList .model-row').map(row=>[normalizedModelName(row.querySelector('.model-main strong')?.textContent||''),row]));
  }
  function rowVisible(row){
    if(!row)return false;
    return !((row.querySelector('[data-model-vis] use')?.getAttribute('href')||'').includes('i-eyeoff'));
  }
  function syncTree(){
    const loaded=new Set(modelRows().keys());
    $$('#modelTree .tree-model').forEach(label=>{
      const name=normalizedModelName(label.querySelector('b')?.textContent||'');
      const input=label.querySelector('input[type=checkbox]');
      if(!name||!input)return;
      const isLoaded=loaded.has(name);
      input.disabled=isLoaded;
      if(isLoaded)input.checked=false;
      label.classList.toggle('loaded',isLoaded);
      let tag=[...label.children].find(x=>x.tagName==='SMALL');
      if(isLoaded&&!tag){
        tag=document.createElement('small');
        tag.textContent='Загружено';
        label.appendChild(tag);
      }else if(!isLoaded&&tag){
        tag.remove();
      }
    });
  }
  function syncViewport(){
    const rows=modelRows();
    const hiddenByModel=new Set();
    Object.entries(modelElements).forEach(([model,ids])=>{
      if(!rowVisible(rows.get(model)))ids.forEach(id=>hiddenByModel.add(id));
    });
    $$('#hotspots [data-element]').forEach(hotspot=>{
      const hidden=hiddenByModel.has(hotspot.dataset.element)||structureHidden.has(hotspot.dataset.element);
      hotspot.classList.toggle('audit-hidden-model',hidden);
      const opacity=elementOpacity.get(hotspot.dataset.element);
      hotspot.style.opacity=opacity==null?'':String(Math.max(.22,1-opacity/110));
    });
    const mepVisible=rowVisible(rows.get('MEP_Level07'));
    if($('#arOverlayModel'))$('#arOverlayModel').style.visibility=mepVisible?'visible':'hidden';
    $('#app')?.classList.toggle('audit-empty',rows.size===0);
    const selected=$('#hotspots .hotspot.selected');
    if(selected&&selected.classList.contains('audit-hidden-model'))$('[data-selection-action="clear"]')?.click();
  }
  function emptyProject(){
    let guard=0;
    while(guard++<30){
      const remove=$('#modelList [data-model-action="remove"]');
      if(!remove)break;
      remove.click();
    }
    syncTree();
    syncViewport();
    $('#toast')?.classList.add('hidden');
    toast('Новый проект открыт · сцена пуста');
  }

  function filterDialog(){
    openModal(`<div class="panel-title"><div><small>ЗАМЕЧАНИЯ</small><strong>Фильтры</strong></div><button class="icon-btn sm" data-a-close>${I('i-x')}</button></div><div class="audit-filter-grid"><label>Статус<select id="aStatus"><option value="all">Все</option><option value="open">Открыто</option><option value="progress">В работе</option><option value="review">На проверке</option><option value="closed">Закрыто</option></select></label><label>Ответственный<select id="aAuthor"><option value="all">Все</option><option>А. Лукашин</option><option>М. Орлов</option><option>И. Сергеев</option><option>Е. Данилова</option></select></label><label>Раздел<select id="aSection"><option value="all">Все</option><option>ОВ</option><option>ВК</option><option>КР</option><option>АР</option><option>ЭОМ</option></select></label></div><div class="fix-modal-footer"><button class="secondary-pill" data-a-reset>Сбросить</button><button class="primary-pill" data-a-apply>Применить</button></div>`);
    $('#aStatus').value=advancedFilters.status;
    $('#aAuthor').value=advancedFilters.author;
    $('#aSection').value=advancedFilters.section;
  }
  function applyFilters(){
    $$('#remarksScroll .remark-item').forEach(item=>{
      const id=item.querySelector('.remark-id')?.textContent.trim()||'';
      const status=[...(item.querySelector('.status')?.classList||[])].find(x=>['open','progress','review','closed'].includes(x))||'';
      const small=item.querySelector('small')?.textContent||'';
      const section=remarkMeta[id]?.[1]||['ОВ','ВК','КР','АР','ЭОМ'].find(x=>small.includes(`· ${x}`))||'';
      const author=remarkMeta[id]?.[0]||(id?'А. Лукашин':'');
      const show=(advancedFilters.status==='all'||advancedFilters.status===status)&&
        (advancedFilters.author==='all'||advancedFilters.author===author)&&
        (advancedFilters.section==='all'||advancedFilters.section===section);
      item.classList.toggle('audit-hidden',!show);
    });
    $('.filter-button')?.classList.toggle('audit-active',Object.values(advancedFilters).some(v=>v!=='all'));
  }

  function editRemark(){
    const detail=$('#remarkDetail'),id=currentRemarkId();
    if(!detail||!id)return;
    openModal(`<div class="panel-title"><div><small>${id}</small><strong>Редактировать замечание</strong></div><button class="icon-btn sm" data-a-close>${I('i-x')}</button></div><div class="form-field"><label>Название <span class="required">*</span></label><input id="aTitle"></div><div class="form-field"><label>Описание</label><textarea id="aDesc"></textarea></div><div class="fix-modal-footer"><button class="secondary-pill" data-a-close>Отмена</button><button class="primary-pill" data-a-save data-id="${id}">Сохранить</button></div>`);
    $('#aTitle').value=detail.querySelector('h2')?.textContent||'';
    $('#aDesc').value=detail.querySelector('p')?.textContent||'';
  }
  function applyEdits(){
    const detail=$('#remarkDetail');
    if(detail&&!detail.classList.contains('hidden')){
      const id=currentRemarkId();
      const edit=id&&edits.get(id);
      if(edit){
        if(detail.querySelector('h2'))detail.querySelector('h2').textContent=edit[0];
        if(detail.querySelector('p'))detail.querySelector('p').textContent=edit[1];
      }
      const row=detail.querySelector('.attachment-row');
      if(row&&id){
        $$('.audit-attachment-extra',row).forEach(x=>x.remove());
        const deleted=deletedAttachments.get(id)||new Set();
        [...row.children].forEach((x,i)=>x.classList.toggle('audit-hidden',deleted.has(i)));
        for(let i=0;i<(extraAttachments.get(id)||0);i++)row.insertAdjacentHTML('beforeend','<div class="attachment audit-attachment-extra"><span>Материал</span></div>');
      }
    }
    $$('#remarksScroll .remark-item').forEach(item=>{
      const id=item.querySelector('.remark-id')?.textContent.trim();
      const edit=id&&edits.get(id);
      if(edit){
        const title=[...item.children].find(x=>x.tagName==='STRONG');
        if(title)title.textContent=edit[0];
      }
    });
  }

  function localSummary(){
    const cards=$$('#localModelsSheet .library-grid article');
    const mb=cards.reduce((sum,card)=>sum+(parseFloat((card.querySelector('small')?.textContent.match(/([\d,.]+)\s*МБ/)?.[1]||'0').replace(',','.'))||0),0);
    const label=$('#localModelsSheet .library-toolbar span');
    if(label)label.textContent=`${cards.length} ${cards.length===1?'файл':'файла'} · ${(mb/1000).toFixed(2).replace('.',',')} ГБ`;
  }
  function patchLocalPicker(){
    const button=$('[data-local-add]');
    if(!button)return;
    const loaded=$$('#modelList .model-main strong').some(x=>x.textContent.includes('Facade_Scan_RevC'));
    button.disabled=loaded;
    button.style.opacity=loaded?'.55':'';
    const small=button.querySelector('small');
    if(loaded&&small)small.textContent='Уже загружено в сцену';
  }

  function opacityDialog(){
    const selected=$('#hotspots .hotspot.selected');
    const id=selected?.dataset.element;
    const name=id?elementNames[id]:$('#selectionName')?.textContent.trim();
    if(!id||!name)return toast('Сначала выберите BIM-элемент');
    const value=elementOpacity.get(id)??35;
    openModal(`<h2>Прозрачность элемента</h2><p>${name}. Независимо от прозрачности BIM-сцены в AR.</p><div class="ar-slider"><span>Прозрачность</span><strong id="aOpV">${value}%</strong><input id="aOp" data-element="${id}" type="range" min="0" max="90" value="${value}"></div><div class="fix-modal-footer"><button class="primary-pill" data-a-close>Готово</button></div>`);
  }
  function markerDialog(){
    openModal(`<h2>Маркер выбран</h2><p>Выбор маркера не перемещает сцену автоматически.</p><div class="audit-marker-actions"><button class="secondary-wide" data-a-marker-focus>${I('i-focus')} Фокус</button><button class="primary-wide" data-a-marker-pos>${I('i-pin')} Позиционирование</button></div>`);
  }
  function reviewStatusDialog(){
    const id=currentRemarkId();
    if(!id)return;
    openModal(`<h2>Сменить статус</h2><p>${id}</p><div class="audit-status-grid"><button data-a-status="open">Открыто</button><button data-a-status="progress">В работе</button><button data-a-status="review">На проверке</button><button data-a-status="closed">Закрыто</button></div><div class="fix-modal-footer"><button class="secondary-pill" data-a-close>Отмена</button></div>`);
  }

  function enhanceRemarkMaterials(){
    const grid=$('#remarkCreate .material-grid');
    if(!grid)return;
    $$('.material-card',grid).forEach(card=>{
      card.classList.add('audit-material');
      if(!card.querySelector('.audit-del'))card.insertAdjacentHTML('beforeend','<button class="audit-del" aria-label="Удалить материал">×</button>');
    });
  }
  function enhanceRuler(){
    const strip=$('#rulerStrip');
    if(strip&&!strip.querySelector('[data-a-ruler-shot]'))strip.insertAdjacentHTML('beforeend',`<button class="secondary-pill audit-ruler-shot" data-a-ruler-shot>${I('i-camera')} Снимок</button>`);
  }
  function enhanceStructure(){
    $$('#structureTree [data-structure-element]').forEach(row=>{
      const id=row.dataset.structureElement;
      row.classList.toggle('audit-structure-hidden',structureHidden.has(id));
      let control=row.querySelector('[data-a-structure-vis]');
      if(!control){
        control=document.createElement('span');
        control.className='audit-structure-vis';
        control.dataset.aStructureVis=id;
        control.setAttribute('role','button');
        control.setAttribute('tabindex','0');
        control.setAttribute('aria-label','Переключить видимость элемента');
        row.appendChild(control);
      }
      control.innerHTML=I(structureHidden.has(id)?'i-eyeoff':'i-eye');
    });
  }
  function enhanceCapture(){
    const preview=$('#capturePreview');
    if(preview)preview.style.cursor='crosshair';
  }

  function resetRuler(){
    rulerPoints=[];
    const layer=$('#rulerLayer');
    if(!layer)return;
    layer.classList.add('audit-live');
    $$('.ruler-point',layer).forEach(x=>{x.style.opacity='0';x.style.left='0';x.style.top='0';});
    const line=$('.ruler-line',layer); if(line){line.style.opacity='0';line.style.width='0';}
    const distance=$('.ruler-distance',layer); if(distance){distance.textContent='Укажите 2 точки';distance.style.left='50%';distance.style.top='50%';}
  }
  function updateRuler(){
    const layer=$('#rulerLayer');
    if(!layer)return;
    layer.classList.add('audit-live');
    const points=$$('.ruler-point',layer);
    rulerPoints.forEach((p,i)=>{
      if(!points[i])return;
      points[i].style.opacity='1';
      points[i].style.left=(p[0]-9)+'px';
      points[i].style.top=(p[1]-9)+'px';
    });
    const line=$('.ruler-line',layer),distance=$('.ruler-distance',layer);
    if(rulerPoints.length<2){
      if(line)line.style.opacity='0';
      if(distance)distance.textContent='Укажите вторую точку';
      return;
    }
    const [a,b]=rulerPoints;
    const dx=b[0]-a[0],dy=b[1]-a[1],pixels=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;
    if(line){line.style.opacity='1';line.style.left=a[0]+'px';line.style.top=a[1]+'px';line.style.width=pixels+'px';line.style.transform=`rotate(${angle}deg)`;}
    if(distance){distance.textContent=(pixels/90).toFixed(2).replace('.',',')+' м';distance.style.left=((a[0]+b[0])/2-30)+'px';distance.style.top=((a[1]+b[1])/2-42)+'px';}
  }

  function refresh(){
    syncLabels();
    syncTree();
    syncViewport();
    applyEdits();
    applyFilters();
    enhanceRemarkMaterials();
    enhanceRuler();
    enhanceStructure();
    enhanceCapture();
  }

  document.addEventListener('click',e=>{
    scheduleRefresh();

    const workspace=e.target.closest('[data-workspace]');
    if(workspace){
      if(workspace.dataset.workspace==='remarks'){
        keepSelection=$('#hotspots .hotspot.selected')?.dataset.element||keepSelection;
        remarksScroll=$('#remarksScroll')?.scrollTop||remarksScroll;
      }else if(workspace.dataset.workspace==='scene'&&keepSelection){
        setTimeout(()=>$(`#hotspots [data-element="${CSS.escape(keepSelection)}"]`)?.click(),0);
      }
      return;
    }

    const positioningClose=e.target.closest('[data-workflow="positioning-cancel"]');
    if(positioningClose){
      e.preventDefault();e.stopImmediatePropagation();
      let cancel=$('#positioningFooter [data-workflow="positioning"]');
      if(!cancel){
        $('#positioningPanel [data-method]')?.click();
        cancel=$('#positioningFooter [data-workflow="positioning"]');
      }
      if(cancel)cancel.click(); else $('#positioningPanel')?.classList.add('hidden');
      return;
    }

    const adjust=e.target.closest('[data-model-action="adjust"]');
    if(adjust){
      const name=adjust.closest('.model-row')?.querySelector('.model-main strong')?.textContent||'модель';
      setTimeout(()=>{const label=$('#positioningPanel .workflow-head small');if(label)label.textContent='КОРРЕКТИРОВКА · ТОЛЬКО '+name.toUpperCase();},0);
      return;
    }
    if(e.target.closest('[data-tool="positioning"]')){
      setTimeout(()=>{const label=$('#positioningPanel .workflow-head small');if(label)label.textContent='ПОЗИЦИОНИРОВАНИЕ · ВСЯ СЦЕНА';},0);
    }
    if(e.target.closest('[data-tool="ruler"]'))setTimeout(resetRuler,0);

    if(e.target.closest('.filter-button')){e.preventDefault();e.stopImmediatePropagation();filterDialog();return;}
    if(e.target.closest('[data-edit-remark]')){e.preventDefault();e.stopImmediatePropagation();editRemark();return;}
    if(e.target.closest('[data-selection-action="opacity"]')){e.preventDefault();e.stopImmediatePropagation();opacityDialog();return;}
    if(e.target.closest('.scene-marker')){e.preventDefault();e.stopImmediatePropagation();markerDialog();return;}
    if(e.target.closest('[data-review-status]')){e.preventDefault();e.stopImmediatePropagation();reviewStatusDialog();return;}

    const remarkItem=e.target.closest('[data-remark]');
    if(remarkItem){remarksScroll=$('#remarksScroll')?.scrollTop||0;setTimeout(()=>{if($('#remarksScroll'))$('#remarksScroll').scrollTop=remarksScroll;},0);}
    if(e.target.closest('[data-show-model]'))remarksScroll=$('#remarksScroll')?.scrollTop||0;
    if(e.target.closest('#backToDetail')||e.target.closest('[data-review-detail]'))setTimeout(()=>{if($('#remarksScroll'))$('#remarksScroll').scrollTop=remarksScroll;},0);

    if(e.target.closest('[data-review-capture]')){
      e.preventDefault();e.stopImmediatePropagation();
      reviewCaptureRemark=currentRemarkId();
      $('[data-tool="capture"]')?.click();
      return;
    }

    const project=e.target.closest('[data-project]');
    if(project){
      const oldName=$('#projectName')?.textContent;
      const nextName=project.querySelector('strong')?.textContent;
      if(oldName&&nextName&&oldName!==nextName){
        keepSelection=null;
        structureHidden.clear();
        elementOpacity.clear();
        setTimeout(()=>{syncLabels();emptyProject();},0);
      }
      return;
    }

    if(e.target.closest('[data-model-vis]')||e.target.closest('[data-model-action="remove"]')||e.target.closest('#confirmAddModels')||e.target.closest('#addModelsButton'))setTimeout(refresh,0);
    if(e.target.closest('#localPickerButton'))setTimeout(patchLocalPicker,0);

    const structureVis=e.target.closest('[data-a-structure-vis]');
    if(structureVis){
      e.preventDefault();e.stopImmediatePropagation();
      const id=structureVis.dataset.aStructureVis;
      structureHidden.has(id)?structureHidden.delete(id):structureHidden.add(id);
      enhanceStructure();syncViewport();
      toast(structureHidden.has(id)?'Элемент скрыт':'Элемент показан');
      return;
    }

    const importButton=e.target.closest('#localModelsSheet .library-toolbar .primary-pill');
    if(importButton){
      e.preventDefault();e.stopImmediatePropagation();
      openModal(`<h2>Импортировать файл</h2><p>Файл попадёт только в Local models и не загрузится в открытую сцену.</p><div class="project-choice"><button data-a-import><span class="model-thumb">${I('i-box')}</span><span><strong>Architecture_AsBuilt_RevD.ifc</strong><small>286 МБ · локальный файл</small></span></button></div><div class="fix-modal-footer"><button class="secondary-pill" data-a-close>Отмена</button></div>`);
      return;
    }
    const libraryAction=e.target.closest('#localModelsSheet .library-grid article>div:last-child button');
    if(libraryAction){
      e.preventDefault();e.stopImmediatePropagation();
      const card=libraryAction.closest('article'),name=card?.querySelector('strong')?.textContent||'Файл';
      if(libraryAction.textContent.trim()==='Экспорт'){toast(name+' подготовлен к экспорту');return;}
      openModal(`<h2>Удалить локальный файл?</h2><p>${name}</p><div class="fix-modal-footer"><button class="secondary-pill" data-a-close>Отмена</button><button class="primary-pill fix-danger" data-a-delete>Удалить</button></div>`);
      modal.dataset.deleteName=name;
      return;
    }

    if(e.target.closest('[data-add-material]')){
      e.preventDefault();e.stopImmediatePropagation();
      const grid=$('#remarkCreate .material-grid');
      if(grid){
        const kind=e.target.textContent.toLowerCase().includes('фото')?'Фото':'BIM screenshot';
        grid.insertAdjacentHTML('beforeend',`<div class="material-card audit-material"><span>${kind}</span><button class="audit-del" aria-label="Удалить материал">×</button></div>`);
        toast('Материал добавлен');
      }
      return;
    }
    const materialDelete=e.target.closest('.audit-del');
    if(materialDelete){
      e.preventDefault();e.stopImmediatePropagation();
      materialDelete.closest('.material-card')?.remove();
      toast('Материал удалён');
      return;
    }
    const attachment=e.target.closest('#remarkDetail .attachment');
    if(attachment){
      e.preventDefault();e.stopImmediatePropagation();
      const id=currentRemarkId(),row=attachment.parentElement,index=[...row.children].indexOf(attachment);
      openModal(`<h2>Материал замечания</h2><p>${attachment.querySelector('span')?.textContent||'Вложение'}</p><div class="fix-modal-footer"><button class="secondary-pill" data-a-close>Закрыть</button><button class="primary-pill fix-danger" data-a-del-att data-id="${id}" data-i="${index}">Удалить</button></div>`);
      return;
    }

    if(e.target.closest('#clearRuler')){e.preventDefault();e.stopImmediatePropagation();resetRuler();toast('Точки измерения сброшены');return;}
    if(e.target.closest('[data-a-ruler-shot]')){
      e.preventDefault();e.stopImmediatePropagation();
      const distance=$('#rulerLayer .ruler-distance')?.textContent||'Измерение';
      $('[data-tool="capture"]')?.click();
      setTimeout(()=>$('#capturePreview')?.insertAdjacentHTML('beforeend',`<div class="audit-mark text" style="left:50%;top:62%">${distance}</div>`),0);
      return;
    }

    if(e.target.closest('#saveCapture')&&reviewCaptureRemark){
      const id=reviewCaptureRemark;
      reviewCaptureRemark=null;
      extraAttachments.set(id,(extraAttachments.get(id)||0)+1);
      setTimeout(()=>toast('Материал добавлен к замечанию'),0);
      return;
    }

    if(e.target.closest('[data-a-close]')){e.preventDefault();e.stopImmediatePropagation();closeModal();return;}
    if(e.target.closest('[data-a-apply]')){
      e.preventDefault();e.stopImmediatePropagation();
      advancedFilters={status:$('#aStatus').value,author:$('#aAuthor').value,section:$('#aSection').value};
      closeModal();applyFilters();toast('Фильтры применены');return;
    }
    if(e.target.closest('[data-a-reset]')){
      e.preventDefault();e.stopImmediatePropagation();
      advancedFilters={status:'all',author:'all',section:'all'};
      closeModal();applyFilters();toast('Фильтры сброшены');return;
    }
    const save=e.target.closest('[data-a-save]');
    if(save){
      e.preventDefault();e.stopImmediatePropagation();
      const title=$('#aTitle')?.value.trim();
      if(!title){toast('Название обязательно');return;}
      edits.set(save.dataset.id,[title,$('#aDesc')?.value||'']);
      closeModal();applyEdits();toast('Замечание обновлено');return;
    }
    if(e.target.closest('[data-a-import]')){
      e.preventDefault();e.stopImmediatePropagation();
      const grid=$('#localModelsSheet .library-grid');
      if(grid&&!$$('article strong',grid).some(x=>x.textContent==='Architecture_AsBuilt_RevD.ifc'))grid.insertAdjacentHTML('beforeend',`<article><div class="file-preview blue">${I('i-box')}</div><strong>Architecture_AsBuilt_RevD.ifc</strong><small>286 МБ · сейчас</small><div><button>Экспорт</button><button>Удалить</button></div></article>`);
      closeModal();localSummary();toast('Файл импортирован в Local models');return;
    }
    if(e.target.closest('[data-a-delete]')){
      e.preventDefault();e.stopImmediatePropagation();
      const name=modal.dataset.deleteName;
      $$('#localModelsSheet article').find(card=>card.querySelector('strong')?.textContent===name)?.remove();
      closeModal();localSummary();toast('Локальный файл удалён');return;
    }
    if(e.target.closest('[data-a-marker-focus]')){
      e.preventDefault();e.stopImmediatePropagation();closeModal();
      $('#focusPulse')?.classList.remove('hidden');
      setTimeout(()=>$('#focusPulse')?.classList.add('hidden'),1200);
      toast('Маркер в фокусе');return;
    }
    if(e.target.closest('[data-a-marker-pos]')){
      e.preventDefault();e.stopImmediatePropagation();closeModal();
      $('[data-tool="positioning"]')?.click();
      setTimeout(()=>$('#positioningPanel [data-method="marker"]')?.click(),0);
      return;
    }
    const reviewStatus=e.target.closest('[data-a-status]');
    if(reviewStatus){
      e.preventDefault();e.stopImmediatePropagation();
      const target=$(`#remarkDetail [data-status="${reviewStatus.dataset.aStatus}"]`);
      closeModal();target?.click();return;
    }
    const deleteAttachment=e.target.closest('[data-a-del-att]');
    if(deleteAttachment){
      e.preventDefault();e.stopImmediatePropagation();
      const set=deletedAttachments.get(deleteAttachment.dataset.id)||new Set();
      set.add(+deleteAttachment.dataset.i);
      deletedAttachments.set(deleteAttachment.dataset.id,set);
      closeModal();applyEdits();toast('Материал удалён');return;
    }
  },true);

  document.addEventListener('input',e=>{
    if(e.target.matches('#aOp')){
      const value=+e.target.value,id=e.target.dataset.element;
      elementOpacity.set(id,value);
      if($('#aOpV'))$('#aOpV').textContent=value+'%';
      syncViewport();
    }
  });
  document.addEventListener('change',scheduleRefresh,true);

  $('#viewport')?.addEventListener('click',e=>{
    if($('#rulerStrip')?.classList.contains('hidden')||e.target.closest('button'))return;
    if(rulerPoints.length>=2)return;
    const rect=$('#viewport').getBoundingClientRect();
    rulerPoints.push([e.clientX-rect.left,e.clientY-rect.top]);
    updateRuler();
  },true);

  $('#capturePreview')?.addEventListener('click',e=>{
    if($('#captureEditor')?.classList.contains('hidden'))return;
    const tool=$('#captureEditor .markup-tools button.active')?.textContent.trim()||'Перо';
    const rect=e.currentTarget.getBoundingClientRect();
    const x=((e.clientX-rect.left)/rect.width*100).toFixed(1),y=((e.clientY-rect.top)/rect.height*100).toFixed(1);
    const kind=tool==='Текст'?'text':tool==='Прямоугольник'?'rect':tool==='Стрелка'?'arrow':'pen';
    const label=kind==='text'?'Комментарий':'';
    e.currentTarget.insertAdjacentHTML('beforeend',`<div class="audit-mark ${kind}" style="left:${x}%;top:${y}%">${label}</div>`);
    toast('Разметка добавлена');
  });

  refresh();
})();
