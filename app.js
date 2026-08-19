(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const el = id => document.getElementById(id);
  const icon = id => `<svg><use href="#${id}"/></svg>`;

  const projects = {
    north: { name: 'ЖК Северный квартал' },
    nevskiy: { name: 'БЦ Невский 42' },
  };

  const fixtures = {
    models: [
      { id: 'architecture', name: 'Architecture_A', discipline: 'АР · Корпус 1', visible: true },
      { id: 'mep', name: 'MEP_Level07', discipline: 'ОВ/ВК · Этаж 7', visible: true },
      { id: 'structure', name: 'Structure_Core', discipline: 'КР · Секция А', visible: true },
    ],
    elements: [
      { id: 'duct', name: 'Воздуховод П7-04', path: 'Корпус 1 · Этаж 7 · ОВ', x: 53, y: 55, attrs: [['Система', 'П7'], ['Тип', 'Прямоугольный воздуховод'], ['Размер', '800 × 400 мм'], ['Отметка', '+23.450']] },
      { id: 'pipe', name: 'Труба В1 Ø108', path: 'Корпус 1 · Этаж 7 · ВК', x: 63, y: 48, attrs: [['Система', 'В1'], ['Диаметр', '108 мм'], ['Материал', 'Сталь'], ['Отметка', '+22.920']] },
      { id: 'column', name: 'Колонна К7-18', path: 'Корпус 1 · Этаж 7 · КР', x: 43, y: 43, attrs: [['Марка', 'К7-18'], ['Материал', 'ЖБ'], ['Сечение', '600 × 600'], ['Этаж', '7']] },
      { id: 'wall', name: 'Стена АР-7-214', path: 'Корпус 1 · Этаж 7 · АР', x: 67, y: 61, attrs: [['Тип', 'Перегородка 120'], ['Материал', 'Газобетон'], ['Высота', '3 350 мм'], ['Огнестойкость', 'EI 60']] },
      { id: 'tray', name: 'Лоток EOM-L7-32', path: 'Корпус 1 · Этаж 7 · ЭОМ', x: 37, y: 60, attrs: [['Система', 'ЭОМ'], ['Ширина', '300 мм'], ['Отметка', '+24.100'], ['Зона', '7-А-14']] },
      { id: 'damper', name: 'Клапан КДМ-2', path: 'Корпус 1 · Этаж 7 · ОВ', x: 58, y: 38, attrs: [['Тип', 'КДМ-2'], ['Размер', '600 × 400'], ['Огнестойкость', 'EI 90'], ['Система', 'П7']] },
    ],
    remarks: [
      { id: 'RM-2418', title: 'Воздуховод смещён относительно BIM', status: 'open', statusLabel: 'Открыто', location: 'Корпус 1 · Этаж 7 · ОВ', author: 'А. Лукашин', date: '19 авг, 06:12', desc: 'Фактическая трасса П7 проходит примерно на 180 мм ниже проектной. Проверить пересечение с кабельным лотком.', element: 'duct', attachments: 3 },
      { id: 'RM-2415', title: 'Не установлен противопожарный клапан', status: 'progress', statusLabel: 'В работе', location: 'Корпус 1 · Этаж 7 · ОВ', author: 'М. Орлов', date: '18 авг, 17:34', desc: 'На пересечении стены EI60 отсутствует клапан КДМ-2. Монтажная организация уведомлена.', element: 'damper', attachments: 2 },
      { id: 'RM-2408', title: 'Гильза выполнена выше проектной отметки', status: 'review', statusLabel: 'На проверке', location: 'Корпус 1 · Этаж 7 · ВК', author: 'А. Лукашин', date: '18 авг, 10:05', desc: 'После корректировки требуется повторная проверка высотной отметки.', element: 'pipe', attachments: 3 },
      { id: 'RM-2399', title: 'Скол бетона на колонне К7-18', status: 'open', statusLabel: 'Открыто', location: 'Корпус 1 · Этаж 7 · КР', author: 'И. Сергеев', date: '17 авг, 15:22', desc: 'Локальный скол защитного слоя в зоне примыкания стены.', element: 'column', attachments: 2 },
      { id: 'RM-2387', title: 'Отсутствует маркировка кабельного лотка', status: 'progress', statusLabel: 'В работе', location: 'Корпус 1 · Этаж 7 · ЭОМ', author: 'А. Лукашин', date: '16 авг, 11:48', desc: 'Нанести маркировку согласно исполнительной схеме.', element: 'tray', attachments: 1 },
      { id: 'RM-2371', title: 'Перегородка не доведена до перекрытия', status: 'closed', statusLabel: 'Закрыто', location: 'Корпус 1 · Этаж 7 · АР', author: 'Е. Данилова', date: '15 авг, 16:10', desc: 'Устранено, фото после выполнения приложено.', element: 'wall', attachments: 3 },
      { id: 'RM-2354', title: 'Требуется теплоизоляция участка В1', status: 'open', statusLabel: 'Открыто', location: 'Корпус 1 · Этаж 7 · ВК', author: 'А. Лукашин', date: '14 авг, 09:26', desc: 'Изоляция отсутствует на участке около 1,2 м.', element: 'pipe', attachments: 2 },
      { id: 'RM-2329', title: 'Проверить высоту подвеса воздуховода', status: 'closed', statusLabel: 'Закрыто', location: 'Корпус 1 · Этаж 7 · ОВ', author: 'М. Орлов', date: '12 авг, 13:42', desc: 'Отметка подтверждена повторным измерением.', element: 'duct', attachments: 2 },
    ],
  };

  const serverTree = [
    { name: 'Корпус 1', children: [
      { name: 'Секция А', children: [
        { name: 'Этаж 7', children: [
          { name: 'АР', models: [{ id: 'arch7', name: 'Architecture_A', loaded: true }, { id: 'doors7', name: 'Doors_Level07' }] },
          { name: 'ОВ', models: [{ id: 'mep7', name: 'MEP_Level07', loaded: true }, { id: 'vent7', name: 'Ventilation_07' }, { id: 'smoke7', name: 'Smoke_Control_L7' }] },
          { name: 'ВК', models: [{ id: 'plumb7', name: 'Plumbing_Level07' }, { id: 'spr7', name: 'Sprinkler_Level07' }] },
          { name: 'ЭОМ', models: [{ id: 'eom7', name: 'Electrical_Level07' }] },
        ] },
        { name: 'Этаж 8', children: [
          { name: 'АР', models: [{ id: 'arch8', name: 'Architecture_Level08' }] },
          { name: 'ОВ', models: [{ id: 'vent8', name: 'Ventilation_08' }] },
        ] },
      ] },
      { name: 'Секция Б', children: [
        { name: 'Этаж 7', children: [{ name: 'КР', models: [{ id: 'strb7', name: 'Structure_B_Level07' }] }] },
      ] },
    ] },
    { name: 'Паркинг', children: [
      { name: 'P2', children: [{ name: 'КР', models: [{ id: 'parkingp2', name: 'Parking_P2' }] }] },
    ] },
  ];

  const positioningMethods = [
    { id: 'hand', name: 'По точке', desc: 'Совместить BIM с выбранной реальной точкой', icon: 'i-target' },
    { id: 'two', name: 'По двум точкам', desc: 'Точнее задать позицию и направление сцены', icon: 'i-ruler' },
    { id: 'adjustment', name: 'Ручная корректировка', desc: 'Переместить и повернуть всю сцену', icon: 'i-edit' },
    { id: 'marker', name: 'Сканировать маркер', desc: 'Выровнять сцену по QR/Aruco marker', icon: 'i-pin' },
  ];

  const panelIds = [
    'modelsPanel', 'addModelsPanel', 'structurePanel', 'positioningPanel', 'captureEditor',
    'remarkCreate', 'remarkDetail', 'projectPopover', 'appPopover', 'localModelsSheet', 'minimap',
  ];

  function freshState() {
    return {
      workspace: 'scene', mode: 'bim', selected: null, hidden: [], sceneOpacity: 72,
      occlusion: true, showHidden: false, flashlight: false,
      models: fixtures.models.map(model => ({ ...model })), pendingModels: new Set(),
      workflow: null, remarkStep: 1, positioningStep: 0, positioningMethod: null,
      adjustModel: null, filter: 'all', selectedRemark: 'RM-2418', review: false, project: 'north',
    };
  }

  let state = freshState();
  let toastTimer;

  function toast(text) {
    el('toastText').textContent = text;
    el('toast').classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el('toast').classList.add('hidden'), 1800);
  }

  function hideAllPanels(except) {
    panelIds.forEach(id => {
      if (id !== except) el(id)?.classList.add('hidden');
    });
  }

  function openPanel(id) {
    hideAllPanels(id);
    el(id)?.classList.remove('hidden');
  }

  function closePanel(id) {
    el(id)?.classList.add('hidden');
  }

  function togglePanel(id) {
    const panel = el(id);
    if (!panel) return;
    panel.classList.contains('hidden') ? openPanel(id) : closePanel(id);
  }

  function openModal(html) {
    el('modal').innerHTML = html;
    el('modalBackdrop').classList.remove('hidden');
  }

  function closeModal() {
    el('modalBackdrop').classList.add('hidden');
  }

  function updateMode() {
    const isAr = state.mode === 'ar';
    const spatialWorkspace = state.workspace === 'scene' || state.review;
    el('app').dataset.mode = state.mode;
    $$('#modeSwitch button').forEach(button => button.classList.toggle('active', button.dataset.mode === state.mode));
    el('arControls').classList.toggle('hidden', !isAr || !spatialWorkspace);
    el('arSelect').classList.toggle('hidden', !isAr || state.workspace === 'remarks');
    el('cameraMode').classList.toggle('hidden', isAr || state.workspace !== 'scene');
    el('opacitySlider').value = state.sceneOpacity;
    el('opacityValue').textContent = `${state.sceneOpacity}%`;
    el('arOverlayModel').style.opacity = state.sceneOpacity / 100;
    el('occlusionToggle').classList.toggle('active', state.occlusion);
    el('hiddenToggle').classList.toggle('active', state.showHidden);
    el('flashlightToggle').classList.toggle('active', state.flashlight);
    el('arScene').style.filter = isAr && state.flashlight ? 'brightness(1.22)' : 'none';
  }

  function setMode(mode) {
    if (state.mode === 'ar' && mode === 'bim') state.flashlight = false;
    state.mode = mode;
    updateMode();
  }

  function setWorkspace(workspace) {
    state.workspace = workspace;
    $$('.workspace-tab').forEach(button => button.classList.toggle('active', button.dataset.workspace === workspace));
    const isScene = workspace === 'scene';
    el('sceneTools').classList.toggle('hidden', !isScene);
    el('minimapButton').classList.toggle('hidden', !isScene);
    el('remarksList').classList.toggle('hidden', isScene);
    if (isScene) {
      state.review = false;
      el('reviewBanner').classList.add('hidden');
      el('reviewCard').classList.add('hidden');
      closePanel('remarkDetail');
      el('reviewFocusMarker')?.remove();
      renderSelection();
    } else {
      hideAllPanels();
      state.selected = null;
      renderSelection();
      renderRemarks();
      openRemark(state.selectedRemark);
    }
    updateMode();
  }

  function renderHotspots() {
    el('hotspots').innerHTML = '';
    fixtures.elements.filter(element => !state.hidden.includes(element.id)).forEach(element => {
      const button = document.createElement('button');
      button.className = `hotspot${state.selected === element.id ? ' selected' : ''}`;
      button.style.left = `${element.x}%`;
      button.style.top = `${element.y}%`;
      button.dataset.element = element.id;
      button.title = element.name;
      el('hotspots').appendChild(button);
    });
    el('hiddenCount').textContent = state.hidden.length;
    el('showAll').classList.toggle('hidden', !state.hidden.length || state.workspace !== 'scene');
  }

  function renderMarkers() {
    el('markerLayer').innerHTML = '<button class="scene-marker" style="left:48%;top:49%"><span>M7</span></button><button class="scene-marker" style="left:70%;top:42%"><span>M12</span></button>';
  }

  function selectElement(id) {
    state.selected = id;
    renderHotspots();
    renderSelection();
  }

  function renderSelection() {
    const element = fixtures.elements.find(item => item.id === state.selected);
    const show = element && state.workspace === 'scene' && !state.workflow;
    el('selectionCard').classList.toggle('hidden', !show);
    if (!element) return;
    el('selectionName').textContent = element.name;
    el('selectionPath').textContent = element.path;
  }

  function pulseFocus() {
    el('focusPulse').classList.remove('hidden');
    void el('focusPulse').offsetWidth;
    setTimeout(() => el('focusPulse').classList.add('hidden'), 1250);
    toast('Камера сфокусирована');
  }

  function renderModels() {
    el('modelCount').textContent = state.models.length;
    el('modelList').innerHTML = state.models.map(model => `
      <article class="model-row" data-model="${model.id}">
        <div class="model-main">
          <span class="model-thumb">${icon('i-box')}</span>
          <span><strong>${model.name}</strong><small>${model.discipline}</small></span>
          <button class="visibility-btn" data-model-vis="${model.id}">${icon(model.visible ? 'i-eye' : 'i-eyeoff')}</button>
        </div>
        <div class="model-actions">
          <button data-model-action="focus" data-model="${model.id}">${icon('i-focus')} Фокус</button>
          <button data-model-action="structure" data-model="${model.id}">${icon('i-tree')} Структура</button>
          <button data-model-action="adjust" data-model="${model.id}">${icon('i-edit')} Корректировать</button>
          <button class="danger" data-model-action="remove" data-model="${model.id}">${icon('i-trash')} Удалить</button>
        </div>
      </article>`).join('');
  }

  function openModels() {
    renderModels();
    openPanel('modelsPanel');
  }

  function handleModelAction(action, id) {
    const model = state.models.find(item => item.id === id);
    if (!model) return;
    if (action === 'focus') pulseFocus();
    if (action === 'structure') openStructure(model);
    if (action === 'adjust') openPositioning('adjust', model.name);
    if (action === 'remove') {
      state.models = state.models.filter(item => item.id !== id);
      renderModels();
      toast(`${model.name} удалена из сцены`);
    }
  }

  function flattenModelTree(nodes, path = []) {
    let result = [];
    nodes.forEach(node => {
      const nextPath = [...path, node.name];
      (node.models || []).forEach(model => result.push({ ...model, path: nextPath.join(' / ') }));
      if (node.children) result = result.concat(flattenModelTree(node.children, nextPath));
    });
    return result;
  }

  function modelTreeHtml(nodes, path = []) {
    return nodes.map(node => {
      const key = [...path, node.name].join('>');
      let html = `<div class="tree-node"><div class="tree-location open" data-tree-key="${key}"><span class="twisty">${icon('i-chevron')}</span>${icon('i-folder')}<span>${node.name}</span></div><div class="tree-children" data-tree-children="${key}">`;
      if (node.models) {
        html += node.models.map(model => `<label class="tree-model ${model.loaded ? 'loaded' : ''}" data-model-search="${(`${key} ${model.name}`).toLowerCase()}"><input type="checkbox" value="${model.id}" ${model.loaded ? 'disabled' : ''} ${state.pendingModels.has(model.id) ? 'checked' : ''}><span class="model-leaf">${icon('i-box')}</span><span><b>${model.name}</b><small class="search-path">${[...path, node.name].join(' / ')}</small></span>${model.loaded ? '<small>Загружено</small>' : ''}</label>`).join('');
      }
      if (node.children) html += modelTreeHtml(node.children, [...path, node.name]);
      return `${html}</div></div>`;
    }).join('');
  }

  function renderModelTree(query = '') {
    el('modelTree').innerHTML = modelTreeHtml(serverTree);
    if (query) {
      const normalized = query.toLowerCase();
      $$('.tree-model', el('modelTree')).forEach(row => {
        row.style.display = row.dataset.modelSearch.includes(normalized) ? 'flex' : 'none';
      });
    }
    updateAddButton();
  }

  function updateAddButton() {
    const count = state.pendingModels.size;
    const button = el('confirmAddModels');
    button.disabled = !count;
    button.textContent = count ? `Добавить ${count} ${count === 1 ? 'модель' : 'модели'}` : 'Добавить';
  }

  function openAddModels() {
    state.pendingModels = new Set();
    el('modelSearch').value = '';
    renderModelTree();
    openPanel('addModelsPanel');
  }

  function confirmAddModels() {
    const available = flattenModelTree(serverTree);
    const count = state.pendingModels.size;
    state.pendingModels.forEach(id => {
      const model = available.find(item => item.id === id);
      if (!model) return;
      state.models.push({ id: model.id, name: model.name, discipline: model.path.split(' / ').slice(-2).join(' · '), visible: true });
    });
    state.pendingModels.clear();
    openModels();
    toast(`${count} ${count === 1 ? 'модель добавлена' : 'модели добавлены'} в сцену`);
  }

  function openStructure(model) {
    const groups = { ОВ: ['duct', 'damper'], ВК: ['pipe'], КР: ['column'], АР: ['wall'], ЭОМ: ['tray'] };
    el('structureModelLabel').textContent = model.name;
    el('structureTree').innerHTML = Object.entries(groups).map(([group, ids]) => `<div class="tree-node"><div class="tree-location open">${icon('i-chevron')}${icon('i-folder')}<span>${group}</span></div><div class="tree-children">${ids.map(id => {
      const element = fixtures.elements.find(item => item.id === id);
      return `<button class="tree-model" data-structure-element="${id}" style="width:100%;border:0;background:transparent;text-align:left"><span class="model-leaf">${icon('i-box')}</span><span><b>${element.name}</b><small class="search-path">${element.path}</small></span></button>`;
    }).join('')}</div></div>`).join('');
    openPanel('structurePanel');
  }

  function openPositioning(method = null, model = null) {
    state.workflow = 'positioning';
    state.positioningMethod = method;
    state.positioningStep = method ? 1 : 0;
    state.adjustModel = model;
    openPanel('positioningPanel');
    renderPositioning();
    renderSelection();
  }

  function positioningSteps() {
    if (state.adjustModel) return [['Переместите модель', 'Изменение применяется только к выбранной модели.'], ['Поверните и при необходимости измените масштаб', 'Остальные модели сцены не меняются.']];
    if (state.positioningMethod === 'two') return [['Укажите первую точку', 'Совместите характерную точку BIM с объектом.'], ['Укажите вторую точку', 'Уточните направление сцены второй парой точек.'], ['Проверьте совмещение', 'Осмотрите результат перед подтверждением.']];
    if (state.positioningMethod === 'marker') return [['Наведите камеру на маркер', 'Маркер должен полностью попадать в область сканирования.'], ['Проверьте совмещение', 'Сцена выровнена по физическому marker.']];
    return [['Совместите сцену', 'Укажите опорную точку и переместите BIM до совпадения.'], ['Проверьте результат', 'Осмотрите BIM перед подтверждением.']];
  }

  function renderPositioning() {
    const title = el('positioningTitle');
    const body = el('positioningBody');
    const footer = el('positioningFooter');
    if (!state.positioningStep) {
      title.textContent = 'Выберите способ';
      body.innerHTML = `<div class="method-grid">${positioningMethods.map(method => `<button class="method-card" data-method="${method.id}"><span>${icon(method.icon)}</span><span><strong>${method.name}</strong><small>${method.desc}</small></span></button>`).join('')}</div>`;
      footer.innerHTML = '';
      return;
    }
    const method = positioningMethods.find(item => item.id === state.positioningMethod) || { name: 'Корректировка модели' };
    title.textContent = state.adjustModel ? `Корректировка · ${state.adjustModel}` : method.name;
    const steps = positioningSteps();
    const step = steps[Math.min(state.positioningStep - 1, steps.length - 1)];
    body.innerHTML = `<div class="workflow-instruction"><span class="step-num">${state.positioningStep}</span><div><strong>${step[0]}</strong><p>${step[1]}</p></div></div>`;
    footer.dataset.steps = steps.length;
    footer.innerHTML = `<button class="secondary-pill" data-workflow="positioning">Отмена</button><button class="primary-pill" data-positioning-next>${state.positioningStep >= steps.length ? 'Готово' : 'Далее'}</button>`;
  }

  function positioningNext() {
    const max = Number(el('positioningFooter').dataset.steps);
    if (state.positioningStep < max) {
      state.positioningStep += 1;
      renderPositioning();
      return;
    }
    state.workflow = null;
    closePanel('positioningPanel');
    renderSelection();
    toast(state.adjustModel ? 'Положение модели обновлено' : 'Позиционирование сцены завершено');
  }

  function cancelPositioning() {
    state.workflow = null;
    closePanel('positioningPanel');
    renderSelection();
    toast('Изменения позиционирования отменены');
  }

  function setRuler(enabled) {
    state.workflow = enabled ? 'ruler' : null;
    el('rulerLayer').classList.toggle('hidden', !enabled);
    el('rulerStrip').classList.toggle('hidden', !enabled);
    el('sceneTools').classList.toggle('hidden', enabled);
    renderSelection();
  }

  function openCapture() {
    state.workflow = 'capture';
    openPanel('captureEditor');
    el('sceneTools').classList.add('hidden');
    renderSelection();
  }

  function closeCapture() {
    state.workflow = null;
    closePanel('captureEditor');
    if (state.workspace === 'scene') el('sceneTools').classList.remove('hidden');
    renderSelection();
  }

  function openRemarkCreate() {
    state.workflow = 'remark';
    state.remarkStep = 1;
    openPanel('remarkCreate');
    renderRemarkCreate();
    renderSelection();
  }

  function renderRemarkCreate() {
    const step = state.remarkStep;
    el('remarkStepLabel').textContent = `ШАГ ${step} ИЗ 3`;
    $$('.remark-stepper span').forEach((node, index) => node.classList.toggle('active', index < step));
    const body = el('remarkCreateBody');
    const footer = el('remarkCreateFooter');
    if (step === 1) {
      const selected = fixtures.elements.find(item => item.id === state.selected);
      el('remarkCreateTitle').textContent = 'Укажите точку на элементе';
      body.innerHTML = `<div class="remark-step-content"><p>Точка будет связана с выбранным BIM-элементом <strong>${selected?.name || ''}</strong>.</p><div class="point-confirm">${icon('i-target')}<strong>Точка выбрана<br>на поверхности элемента</strong></div></div>`;
      footer.innerHTML = '<button class="secondary-pill" data-workflow="remark">Отмена</button><button class="primary-pill" data-remark-next>Далее</button>';
      return;
    }
    if (step === 2) {
      el('remarkCreateTitle').textContent = 'Проверьте материалы';
      body.innerHTML = '<div class="remark-step-content"><p>Автоматически добавлены текущий BIM-ракурс и контекст элемента.</p><div class="material-grid"><div class="material-card"><span>BIM screenshot</span></div><div class="material-card"><span>AR screenshot</span></div></div><div class="material-actions"><button data-add-material>Сделать фото</button><button data-add-material>Добавить снимок</button></div></div>';
      footer.innerHTML = '<button class="secondary-pill" data-remark-back>Назад</button><button class="primary-pill" data-remark-next>Далее</button>';
      return;
    }
    el('remarkCreateTitle').textContent = 'Опишите замечание';
    body.innerHTML = '<div class="remark-step-content"><div class="form-field"><label>Название <span class="required">*</span></label><input id="newRemarkTitle" value="Несоответствие положения воздуховода"></div><div class="form-field"><label>Описание</label><textarea id="newRemarkDesc">Фактическое положение не совпадает с BIM. Требуется проверить монтажную отметку.</textarea></div><p>2 материала · BIM-элемент и точка сохранятся автоматически.</p></div>';
    footer.innerHTML = '<button class="secondary-pill" data-remark-back>Назад</button><button class="primary-pill" data-remark-create>Создать</button>';
  }

  function createRemark() {
    const title = el('newRemarkTitle').value.trim();
    if (!title) {
      toast('Название обязательно');
      return;
    }
    const selected = fixtures.elements.find(item => item.id === state.selected);
    fixtures.remarks.unshift({ id: `RM-${2420 + fixtures.remarks.length}`, title, status: 'open', statusLabel: 'Открыто', location: selected?.path || 'Корпус 1', author: 'А. Лукашин', date: 'сейчас', desc: el('newRemarkDesc').value, element: state.selected, attachments: 2 });
    state.workflow = null;
    closePanel('remarkCreate');
    renderSelection();
    toast('Замечание создано');
  }

  function renderRemarks() {
    let remarks = fixtures.remarks;
    if (state.filter === 'open') remarks = remarks.filter(item => item.status !== 'closed');
    if (state.filter === 'mine') remarks = remarks.filter(item => item.author === 'А. Лукашин');
    el('remarksScroll').innerHTML = remarks.map(remark => `<article class="remark-item ${state.selectedRemark === remark.id ? 'selected' : ''}" data-remark="${remark.id}"><div class="remark-item-top"><span class="remark-id">${remark.id}</span><span class="status ${remark.status}">${remark.statusLabel}</span></div><strong>${remark.title}</strong><small>${remark.location} · ${remark.date}</small></article>`).join('');
    $$('.filter-pills button').forEach(button => button.classList.toggle('active', button.dataset.filter === state.filter));
  }

  function statusButtons(remark) {
    return [['open', 'Открыто'], ['progress', 'В работе'], ['review', 'На проверке'], ['closed', 'Закрыто']].map(([status, label]) => `<button data-status="${status}" class="${remark.status === status ? 'active' : ''}">${label}</button>`).join('');
  }

  function openRemark(id) {
    const remark = fixtures.remarks.find(item => item.id === id);
    if (!remark) return;
    state.selectedRemark = id;
    renderRemarks();
    if (state.review) {
      renderReview();
      return;
    }
    el('remarkDetail').innerHTML = `<div class="panel-title"><div><small>${remark.id} · ${remark.author}</small><strong>Детали</strong></div><button class="icon-btn" data-close="remarkDetail">${icon('i-x')}</button></div><div class="detail-meta"><span class="status ${remark.status}">${remark.statusLabel}</span><small>${remark.date}</small></div><h2>${remark.title}</h2><p>${remark.desc}</p><div class="detail-location">${icon('i-pin')} ${remark.location}</div><div class="attachment-row">${Array.from({ length: remark.attachments }, (_, index) => `<div class="attachment"><span>${index === 0 ? 'BIM' : index === 1 ? 'Фото' : 'AR'}</span></div>`).join('')}</div><div class="status-section"><label>Статус замечания</label><div class="status-options">${statusButtons(remark)}</div></div><div class="detail-actions"><button class="primary-wide" data-show-model>${icon('i-focus')} Показать в модели</button><button class="secondary-wide" data-edit-remark>${icon('i-edit')} Редактировать</button></div>`;
    el('remarkDetail').classList.remove('hidden');
  }

  function applyStatus(remark, status) {
    const labels = { open: 'Открыто', progress: 'В работе', review: 'На проверке', closed: 'Закрыто' };
    remark.status = status;
    remark.statusLabel = labels[status];
    renderRemarks();
    state.review ? renderReview() : openRemark(remark.id);
    toast(`Статус: ${remark.statusLabel}`);
  }

  function changeStatus(status) {
    const remark = fixtures.remarks.find(item => item.id === state.selectedRemark);
    if (!remark) return;
    if (status === 'closed' && remark.status !== 'closed') {
      openModal('<h2>Комментарий к смене статуса</h2><p>Для перехода в «Закрыто» укажите результат проверки.</p><textarea class="comment-field" id="statusComment"></textarea><div class="modal-actions"><button class="secondary-pill" data-modal-close>Отмена</button><button class="primary-pill" data-status-confirm="closed">Подтвердить</button></div>');
      return;
    }
    applyStatus(remark, status);
  }

  function enterReview() {
    state.review = true;
    closePanel('remarkDetail');
    el('reviewBanner').classList.remove('hidden');
    el('reviewCard').classList.remove('hidden');
    el('sceneTools').classList.add('hidden');
    renderReview();
    const remark = fixtures.remarks.find(item => item.id === state.selectedRemark);
    const element = fixtures.elements.find(item => item.id === remark?.element);
    if (!element) return;
    const marker = document.createElement('div');
    marker.className = 'review-focus-marker';
    marker.id = 'reviewFocusMarker';
    marker.style.left = `${element.x}%`;
    marker.style.top = `${element.y}%`;
    el('viewport').appendChild(marker);
  }

  function exitReview() {
    state.review = false;
    el('reviewBanner').classList.add('hidden');
    el('reviewCard').classList.add('hidden');
    el('reviewFocusMarker')?.remove();
    openRemark(state.selectedRemark);
    updateMode();
  }

  function renderReview() {
    const remark = fixtures.remarks.find(item => item.id === state.selectedRemark);
    if (!remark) return;
    el('reviewCard').innerHTML = `<small>${remark.id} · ${remark.location}</small><h3>${remark.title}</h3><span class="status ${remark.status}">${remark.statusLabel}</span><div class="review-actions"><button data-review-focus>${icon('i-focus')} Фокус</button><button data-review-capture>${icon('i-camera')} Материал</button><button data-review-status>${icon('i-edit')} Сменить статус</button><button data-review-detail>${icon('i-info')} Детали</button><button class="primary" data-review-scene>Перейти в Сцену</button></div>`;
  }

  function showAttributes() {
    const element = fixtures.elements.find(item => item.id === state.selected);
    if (!element) return;
    openModal(`<div class="panel-title"><div><small>${element.path}</small><strong>${element.name}</strong></div><button class="icon-btn sm" data-modal-close>${icon('i-x')}</button></div><div style="margin-top:14px;display:grid;gap:6px">${element.attrs.map(([key, value]) => `<div style="display:flex;justify-content:space-between;background:#fff;padding:11px 12px;border-radius:13px;font-size:11px"><span style="color:#7B8395">${key}</span><strong>${value}</strong></div>`).join('')}</div>`);
  }

  function showElementOpacity() {
    openModal('<h2>Прозрачность элемента</h2><p>Отдельно от прозрачности BIM-сцены в AR.</p><div class="ar-slider"><span>Прозрачность</span><strong>65%</strong><input type="range" value="65"></div><div class="modal-actions"><button class="primary-pill" data-modal-close>Готово</button></div>');
  }

  function showProjectChooser() {
    openModal('<h2>Сменить проект</h2><p>Текущая сцена и scene-scoped state будут закрыты.</p><div class="project-choice"><button data-project="north"><span class="project-dot"></span><span><strong>ЖК Северный квартал</strong><small>Секция А · строительный контроль</small></span></button><button data-project="nevskiy"><span class="project-dot"></span><span><strong>БЦ Невский 42</strong><small>Реконструкция · инженерные системы</small></span></button></div><div class="modal-actions"><button class="secondary-pill" data-modal-close>Отмена</button></div>');
  }

  function switchProject(project) {
    if (project === state.project) {
      closeModal();
      return;
    }
    state = freshState();
    state.project = project;
    el('projectName').textContent = projects[project].name;
    el('projectPopoverName').textContent = projects[project].name;
    closeModal();
    hideAllPanels();
    renderAll();
    setWorkspace('scene');
    toast('Проект открыт · сцена сброшена');
  }

  function showLocalPicker() {
    openModal(`<h2>Локальные модели</h2><p>Выберите файл для текущей сцены.</p><div class="project-choice"><button data-local-add><span class="model-thumb">${icon('i-box')}</span><span><strong>Facade_Scan_RevC.ifc</strong><small>411 МБ · локальный файл</small></span></button></div><div class="modal-actions"><button class="secondary-pill" data-modal-close>Отмена</button></div>`);
  }

  function addLocalModel() {
    const alreadyLoaded = state.models.some(model => model.id === 'local-facade');
    if (!alreadyLoaded) state.models.push({ id: 'local-facade', name: 'Facade_Scan_RevC', discipline: 'Локальная · IFC', visible: true });
    closeModal();
    openModels();
    toast(alreadyLoaded ? 'Локальная модель уже добавлена' : 'Локальная модель добавлена в сцену');
  }

  function renderAll() {
    renderHotspots();
    renderMarkers();
    renderModels();
    renderRemarks();
    updateMode();
  }

  function closeTransientPopovers(event) {
    if (!event.target.closest('#projectButton, #projectPopover')) closePanel('projectPopover');
    if (!event.target.closest('#appButton, #appPopover')) closePanel('appPopover');
  }

  function handleSelectionAction(action) {
    if (action === 'attributes') showAttributes();
    if (action === 'remark') openRemarkCreate();
    if (action === 'opacity') showElementOpacity();
    if (action === 'hide') {
      if (state.selected && !state.hidden.includes(state.selected)) state.hidden.push(state.selected);
      state.selected = null;
      renderHotspots();
      renderSelection();
      toast('Элемент скрыт из hit testing');
    }
    if (action === 'focus') pulseFocus();
    if (action === 'clear') {
      state.selected = null;
      renderHotspots();
      renderSelection();
    }
  }

  function handleDocumentClick(event) {
    closeTransientPopovers(event);

    const workspace = event.target.closest('[data-workspace]');
    if (workspace) {
      setWorkspace(workspace.dataset.workspace);
      return;
    }

    const modeButton = event.target.closest('#modeSwitch button[data-mode]');
    if (modeButton) {
      setMode(modeButton.dataset.mode);
      return;
    }

    if (event.target.closest('#projectButton')) {
      togglePanel('projectPopover');
      return;
    }
    if (event.target.closest('#appButton')) {
      togglePanel('appPopover');
      return;
    }

    const tool = event.target.closest('[data-tool]');
    if (tool) {
      if (tool.dataset.tool === 'models') openModels();
      if (tool.dataset.tool === 'positioning') openPositioning();
      if (tool.dataset.tool === 'ruler') setRuler(true);
      if (tool.dataset.tool === 'capture') openCapture();
      return;
    }

    const hotspot = event.target.closest('#hotspots [data-element]');
    if (hotspot) {
      selectElement(hotspot.dataset.element);
      return;
    }

    const selectionAction = event.target.closest('[data-selection-action]');
    if (selectionAction) {
      handleSelectionAction(selectionAction.dataset.selectionAction);
      return;
    }

    if (event.target.closest('#showAll')) {
      state.hidden = [];
      renderHotspots();
      toast('Скрытые элементы восстановлены');
      return;
    }
    if (event.target.closest('#minimapButton')) {
      togglePanel('minimap');
      return;
    }

    const close = event.target.closest('[data-close]');
    if (close) {
      const target = close.dataset.close;
      if (target === 'models') closePanel('modelsPanel');
      if (target === 'addModels') openModels();
      if (target === 'structure') openModels();
      if (target === 'capture') closeCapture();
      if (target === 'remarkDetail') closePanel('remarkDetail');
      if (target === 'localModels') closePanel('localModelsSheet');
      if (target === 'minimap') closePanel('minimap');
      return;
    }

    if (event.target.closest('#addModelsButton')) {
      openAddModels();
      return;
    }

    const modelMain = event.target.closest('.model-main');
    if (modelMain && !event.target.closest('[data-model-vis]')) {
      modelMain.parentElement.classList.toggle('expanded');
      return;
    }

    const visibility = event.target.closest('[data-model-vis]');
    if (visibility) {
      const model = state.models.find(item => item.id === visibility.dataset.modelVis);
      if (model) {
        model.visible = !model.visible;
        renderModels();
      }
      return;
    }

    const modelAction = event.target.closest('[data-model-action]');
    if (modelAction) {
      handleModelAction(modelAction.dataset.modelAction, modelAction.dataset.model);
      return;
    }

    const treeLocation = event.target.closest('[data-tree-key]');
    if (treeLocation) {
      treeLocation.classList.toggle('open');
      $(`[data-tree-children="${CSS.escape(treeLocation.dataset.treeKey)}"]`)?.classList.toggle('collapsed');
      return;
    }

    const structureElement = event.target.closest('[data-structure-element]');
    if (structureElement) {
      selectElement(structureElement.dataset.structureElement);
      closePanel('structurePanel');
      toast('BIM-элемент выбран из структуры');
      return;
    }

    const method = event.target.closest('[data-method]');
    if (method) {
      state.positioningMethod = method.dataset.method;
      state.positioningStep = 1;
      renderPositioning();
      return;
    }
    if (event.target.closest('[data-positioning-next]')) {
      positioningNext();
      return;
    }

    const workflow = event.target.closest('[data-workflow]');
    if (workflow) {
      if (workflow.dataset.workflow === 'positioning') cancelPositioning();
      else {
        state.workflow = null;
        closePanel('remarkCreate');
        renderSelection();
      }
      return;
    }

    if (event.target.closest('#doneRuler')) {
      setRuler(false);
      toast('Измерение завершено');
      return;
    }
    if (event.target.closest('#clearRuler')) {
      toast('Точки измерения сброшены');
      return;
    }
    if (event.target.closest('#saveCapture')) {
      closeCapture();
      toast('Снимок сохранён');
      return;
    }
    if (event.target.closest('#shareCapture')) {
      toast('Ссылка на снимок подготовлена');
      return;
    }

    if (event.target.closest('[data-remark-next]')) {
      state.remarkStep += 1;
      renderRemarkCreate();
      return;
    }
    if (event.target.closest('[data-remark-back]')) {
      state.remarkStep -= 1;
      renderRemarkCreate();
      return;
    }
    if (event.target.closest('[data-remark-create]')) {
      createRemark();
      return;
    }
    if (event.target.closest('[data-add-material]')) {
      toast('Дополнительный материал добавлен');
      return;
    }

    const filter = event.target.closest('[data-filter]');
    if (filter) {
      state.filter = filter.dataset.filter;
      renderRemarks();
      return;
    }
    const remark = event.target.closest('[data-remark]');
    if (remark) {
      openRemark(remark.dataset.remark);
      return;
    }
    const status = event.target.closest('[data-status]');
    if (status) {
      changeStatus(status.dataset.status);
      return;
    }

    if (event.target.closest('[data-show-model]')) {
      enterReview();
      return;
    }
    if (event.target.closest('[data-edit-remark]')) {
      toast('Редактирование доступно без смены контекста');
      return;
    }
    if (event.target.closest('#backToDetail, [data-review-detail]')) {
      exitReview();
      return;
    }
    if (event.target.closest('[data-review-focus]')) {
      pulseFocus();
      return;
    }
    if (event.target.closest('[data-review-capture]')) {
      toast('Материал добавлен к замечанию');
      return;
    }
    if (event.target.closest('[data-review-status]')) {
      const current = fixtures.remarks.find(item => item.id === state.selectedRemark);
      if (current) applyStatus(current, current.status === 'open' ? 'progress' : 'review');
      return;
    }
    if (event.target.closest('[data-review-scene]')) {
      el('reviewFocusMarker')?.remove();
      setWorkspace('scene');
      toast('Review закрыт · текущий ракурс сохранён');
      return;
    }

    if (event.target.closest('#changeProjectButton')) {
      closePanel('projectPopover');
      showProjectChooser();
      return;
    }
    const project = event.target.closest('[data-project]');
    if (project) {
      switchProject(project.dataset.project);
      return;
    }

    const appAction = event.target.closest('[data-app-action]');
    if (appAction) {
      closePanel('appPopover');
      if (appAction.dataset.appAction === 'local') openPanel('localModelsSheet');
      else toast(appAction.dataset.appAction === 'settings' ? 'Настройки приложения' : 'Профиль и организация');
      return;
    }

    if (event.target.closest('[data-modal-close]')) {
      closeModal();
      return;
    }
    const statusConfirm = event.target.closest('[data-status-confirm]');
    if (statusConfirm) {
      if (!el('statusComment').value.trim()) {
        toast('Добавьте короткий комментарий');
        return;
      }
      closeModal();
      const current = fixtures.remarks.find(item => item.id === state.selectedRemark);
      if (current) applyStatus(current, statusConfirm.dataset.status);
      return;
    }

    if (event.target.closest('#localPickerButton')) {
      showLocalPicker();
      return;
    }
    if (event.target.closest('[data-local-add]')) {
      addLocalModel();
      return;
    }
    if (event.target.closest('#confirmAddModels')) {
      confirmAddModels();
      return;
    }
    if (event.target.closest('.scene-marker')) toast('Маркер выбран · сцена не перемещена');
  }

  document.addEventListener('click', handleDocumentClick);

  el('modelTree').addEventListener('change', event => {
    if (!event.target.matches('input[type=checkbox]')) return;
    event.target.checked ? state.pendingModels.add(event.target.value) : state.pendingModels.delete(event.target.value);
    updateAddButton();
  });

  el('modelSearch').addEventListener('input', event => renderModelTree(event.target.value));
  el('opacitySlider').addEventListener('input', event => {
    state.sceneOpacity = Number(event.target.value);
    updateMode();
  });

  [['occlusionToggle', 'occlusion'], ['hiddenToggle', 'showHidden'], ['flashlightToggle', 'flashlight']].forEach(([id, key]) => {
    el(id).addEventListener('click', () => {
      state[key] = !state[key];
      updateMode();
    });
  });

  el('arSelect').addEventListener('click', () => {
    const element = fixtures.elements.find(item => !state.hidden.includes(item.id));
    if (!element) return;
    selectElement(element.id);
    toast(`Выбран: ${element.name}`);
  });

  $$('.camera-mode button').forEach(button => {
    button.addEventListener('click', () => {
      $$('.camera-mode button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    });
  });

  renderAll();
  renderSelection();
})();