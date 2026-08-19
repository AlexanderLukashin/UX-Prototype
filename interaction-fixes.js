(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const modalBackdrop=$('#modalBackdrop'), modal=$('#modal');
  const icon=id=>`<svg><use href="#${id}"/></svg>`;
  const toast=text=>{
    const box=$('#toast'), label=$('#toastText');
    if(!box||!label)return;
    label.textContent=text; box.classList.remove('hidden');
    clearTimeout(window.__uxToast); window.__uxToast=setTimeout(()=>box.classList.add('hidden'),1800);
  };
  const openModal=html=>{ if(!modalBackdrop||!modal)return; modal.innerHTML=html; modalBackdrop.classList.remove('hidden'); };
  const closeModal=()=>modalBackdrop?.classList.add('hidden');
  const selectedElement=()=>{
    const name=$('#selectionName')?.textContent?.trim();
    const path=$('#selectionPath')?.textContent?.trim();
    const attrs={
      'Воздуховод П7-04':[['Система','П7'],['Тип','Прямоугольный воздуховод'],['Размер','800 × 400 мм'],['Отметка','+23.450'],['Материал','Оцинкованная сталь'],['Уровень','Этаж 7']],
      'Труба В1 Ø108':[['Система','В1'],['Диаметр','108 мм'],['Материал','Сталь'],['Отметка','+22.920'],['Изоляция','Каучук 19 мм']],
      'Колонна К7-18':[['Марка','К7-18'],['Материал','ЖБ'],['Сечение','600 × 600'],['Этаж','7'],['Класс бетона','B30']],
      'Стена АР-7-214':[['Тип','Перегородка 120'],['Материал','Газобетон'],['Высота','3 350 мм'],['Огнестойкость','EI 60']],
      'Лоток EOM-L7-32':[['Система','ЭОМ'],['Ширина','300 мм'],['Отметка','+24.100'],['Зона','7-А-14']],
      'Клапан КДМ-2':[['Тип','КДМ-2'],['Размер','600 × 400'],['Огнестойкость','EI 90'],['Система','П7']]
    };
    return {name,path,attrs:attrs[name]||[['Категория','BIM-элемент'],['Расположение',path||'—'],['GUID','2f7a-91c4-8b20']]};
  };
  function showAttributes(){
    const x=selectedElement();
    if(!x.name)return toast('Сначала выберите BIM-элемент');
    openModal(`<div class="panel-title"><div><small>${x.path||''}</small><strong>${x.name}</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><div class="fix-attribute-list">${x.attrs.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="fix-modal-footer"><button class="secondary-pill" data-fix-close>Закрыть</button></div>`);
  }
  function showFilters(){
    openModal(`<div class="panel-title"><div><small>ЗАМЕЧАНИЯ</small><strong>Фильтры</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><div class="fix-filter-grid"><label><span>Статус</span><select id="fixStatusFilter"><option value="all">Все статусы</option><option value="open">Открыто</option><option value="progress">В работе</option><option value="review">На проверке</option><option value="closed">Закрыто</option></select></label><label><span>Ответственный</span><select><option>Все участники</option><option>А. Лукашин</option><option>М. Орлов</option></select></label><label><span>Раздел</span><select><option>Все разделы</option><option>ОВ</option><option>ВК</option><option>КР</option><option>АР</option><option>ЭОМ</option></select></label></div><div class="fix-modal-footer"><button class="secondary-pill" data-fix-reset-filter>Сбросить</button><button class="primary-pill" data-fix-apply-filter>Применить</button></div>`);
  }
  function showSettings(){
    openModal(`<div class="panel-title"><div><small>APP LEVEL</small><strong>Настройки</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><div class="fix-settings"><label><span>Единицы измерения</span><select><option>Метрические</option><option>Имперские</option></select></label><label class="fix-switch-row"><span><strong>Подтверждать удаление</strong><small>Для моделей и локальных файлов</small></span><input type="checkbox" checked></label><label class="fix-switch-row"><span><strong>Автообновление карты</strong><small>Перегенерировать stale minimap</small></span><input type="checkbox" checked></label></div><div class="fix-modal-footer"><button class="primary-pill" data-fix-close>Готово</button></div>`);
  }
  function showAccount(){
    openModal(`<div class="panel-title"><div><small>ACCOUNT / ORGANIZATION</small><strong>Александр Лукашин</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><div class="fix-account"><div class="fix-avatar">АЛ</div><div><strong>СтройКонтроль</strong><small>Инженер строительного контроля</small></div></div><div class="project-choice"><button data-fix-org><span class="project-dot"></span><span><strong>СтройКонтроль</strong><small>Текущая организация</small></span></button></div><div class="fix-modal-footer"><button class="secondary-pill" data-fix-signout>Выйти</button><button class="primary-pill" data-fix-close>Закрыть</button></div>`);
  }
  function showRemarkEditor(){
    const detail=$('#remarkDetail');
    if(!detail)return;
    const title=detail.querySelector('h2')?.textContent||'Замечание';
    const desc=detail.querySelector('p')?.textContent||'';
    openModal(`<div class="panel-title"><div><small>РЕДАКТИРОВАНИЕ ЗАМЕЧАНИЯ</small><strong>Изменить данные</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><div class="form-field"><label>Название <span class="required">*</span></label><input id="fixRemarkTitle" value="${title.replace(/"/g,'&quot;')}"></div><div class="form-field"><label>Описание</label><textarea id="fixRemarkDesc">${desc}</textarea></div><div class="fix-modal-footer"><button class="secondary-pill" data-fix-close>Отмена</button><button class="primary-pill" data-fix-save-remark>Сохранить</button></div>`);
  }
  function setupStructureSearch(){
    const input=$('#structurePanel .search-field input');
    if(!input||input.dataset.fixed)return;
    input.dataset.fixed='1';
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      $$('#structureTree [data-structure-element]').forEach(row=>row.style.display=!q||row.textContent.toLowerCase().includes(q)?'flex':'none');
    });
  }
  const observer=new MutationObserver(()=>setupStructureSearch());
  observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  setupStructureSearch();

  document.addEventListener('click',e=>{
    const attr=e.target.closest('[data-selection-action="attributes"]');
    if(attr){e.preventDefault();e.stopImmediatePropagation();return showAttributes();}

    const positionClose=e.target.closest('[data-workflow="positioning-cancel"]');
    if(positionClose){e.preventDefault();e.stopImmediatePropagation();$('#positioningPanel')?.classList.add('hidden');$('#selectionCard')?.classList.remove('hidden');return toast('Позиционирование отменено');}

    if(e.target.closest('.filter-button')){e.preventDefault();e.stopImmediatePropagation();return showFilters();}

    const floor=e.target.closest('#minimap .floor-pills button');
    if(floor){e.preventDefault();e.stopImmediatePropagation();$$('#minimap .floor-pills button').forEach(b=>b.classList.remove('active'));floor.classList.add('active');const small=$('#minimapButton small');if(small)small.textContent='Этаж '+floor.textContent.trim();return toast('Карта: этаж '+floor.textContent.trim());}

    const importBtn=e.target.closest('#localModelsSheet .library-toolbar .primary-pill');
    if(importBtn){e.preventDefault();e.stopImmediatePropagation();return openModal(`<div class="panel-title"><div><small>LOCAL MODELS</small><strong>Импортировать файл</strong></div><button class="icon-btn sm" data-fix-close>${icon('i-x')}</button></div><p>В web-прототипе выбирается демонстрационный локальный файл. Импорт не добавляет модель в текущую сцену автоматически.</p><div class="project-choice"><button data-fix-import><span class="model-thumb">${icon('i-box')}</span><span><strong>Architecture_AsBuilt_RevD.ifc</strong><small>286 МБ · локальный файл</small></span></button></div><div class="fix-modal-footer"><button class="secondary-pill" data-fix-close>Отмена</button></div>`);}

    const libAction=e.target.closest('#localModelsSheet .library-grid article>div:last-child button');
    if(libAction){e.preventDefault();e.stopImmediatePropagation();const card=libAction.closest('article'),name=card?.querySelector('strong')?.textContent||'Файл';if(libAction.textContent.trim()==='Экспорт')return toast(name+' подготовлен к экспорту');return openModal(`<h2>Удалить локальный файл?</h2><p>${name} будет удалён только из локальной библиотеки.</p><div class="fix-modal-footer"><button class="secondary-pill" data-fix-close>Отмена</button><button class="primary-pill fix-danger" data-fix-delete-file>Удалить</button></div>`);}

    const markup=e.target.closest('#captureEditor .markup-tools button');
    if(markup){e.preventDefault();e.stopImmediatePropagation();$$('#captureEditor .markup-tools button').forEach(b=>b.classList.remove('active'));markup.classList.add('active');return toast('Инструмент разметки: '+markup.textContent.trim());}

    const edit=e.target.closest('[data-edit-remark]');
    if(edit){e.preventDefault();e.stopImmediatePropagation();return showRemarkEditor();}

    const appAction=e.target.closest('[data-app-action]');
    if(appAction&&appAction.dataset.appAction!=='local'){e.preventDefault();e.stopImmediatePropagation();$('#appPopover')?.classList.add('hidden');return appAction.dataset.appAction==='settings'?showSettings():showAccount();}

    const localFileButton=e.target.closest('[data-local-add]');
    if(localFileButton){return;}

    if(e.target.closest('[data-fix-close]')){e.preventDefault();e.stopImmediatePropagation();return closeModal();}
    if(e.target.closest('[data-fix-apply-filter]')){e.preventDefault();e.stopImmediatePropagation();closeModal();return toast('Фильтры применены');}
    if(e.target.closest('[data-fix-reset-filter]')){e.preventDefault();e.stopImmediatePropagation();const s=$('#fixStatusFilter');if(s)s.value='all';return toast('Фильтры сброшены');}
    if(e.target.closest('[data-fix-save-remark]')){e.preventDefault();e.stopImmediatePropagation();const title=$('#fixRemarkTitle')?.value.trim();if(!title)return toast('Название обязательно');const detail=$('#remarkDetail');if(detail){const h=detail.querySelector('h2'),p=detail.querySelector('p');if(h)h.textContent=title;if(p)p.textContent=$('#fixRemarkDesc')?.value||'';}closeModal();return toast('Замечание обновлено');}
    if(e.target.closest('[data-fix-import]')){e.preventDefault();e.stopImmediatePropagation();closeModal();return toast('Файл импортирован в Local models');}
    if(e.target.closest('[data-fix-delete-file]')){e.preventDefault();e.stopImmediatePropagation();closeModal();return toast('Локальный файл удалён');}
    if(e.target.closest('[data-fix-signout]')){e.preventDefault();e.stopImmediatePropagation();return toast('Выход смоделирован в прототипе');}
    if(e.target.closest('[data-fix-org]')){e.preventDefault();e.stopImmediatePropagation();return toast('Организация уже выбрана');}
  },true);
})();
