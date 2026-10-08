(() => {
  const landing = document.getElementById('landing');
  const dashboard = document.getElementById('dashboard');
  const values = { energy: 82, focus: 91, mood: 76, sleep: 88, workload: 62 };
  const initialMetrics = { energy: 82, focus: 91, mood: 76, sleep: 88 };
  const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
  const average = (items) => Math.round(items.reduce((sum, item) => sum + item, 0) / items.length);

  function productivity() {
    return clamp(values.energy * .24 + values.focus * .32 + values.mood * .12 + values.sleep * .20 + (100 - Math.abs(values.workload - 60)) * .12);
  }
  function stress() {
    return clamp((100 - values.mood) * .28 + values.workload * .40 + (100 - values.sleep) * .18 + (100 - values.energy) * .14);
  }
  function updateMetrics() {
    ['energy', 'focus', 'mood', 'sleep'].forEach(key => {
      const card = document.querySelector(`[data-metric="${key}"]`);
      const input = document.querySelector(`[data-control="${key}"]`);
      card.querySelector('.metric-value strong').textContent = values[key];
      card.querySelector('.meter span').style.setProperty('--value', `${values[key]}%`);
      input.value = values[key];
      input.style.setProperty('--fill', `${values[key]}%`);
      input.parentElement.querySelector('output').value = `${values[key]}%`;
    });
    const output = productivity();
    const stressIndex = stress();
    document.querySelector('[data-metric="productivity"] .metric-value strong').textContent = output;
    document.querySelector('[data-metric="productivity"] .meter span').style.setProperty('--value', `${output}%`);
    document.getElementById('productivity-value').innerHTML = `${output}<small>%</small>`;
    document.getElementById('stress-value').innerHTML = `${stressIndex}<small>%</small>`;
    document.getElementById('productivity-bar').style.setProperty('--bar', `${output}%`);
    document.getElementById('stress-bar').style.setProperty('--bar', `${stressIndex}%`);
    updateForecast(output, stressIndex);
  }
  function updateForecast(output, stressIndex) {
    const levels = [clamp(output + 7), clamp(output - 5), clamp(output - 30 - stressIndex * .12), clamp(values.mood + 5), clamp(values.sleep + 1)];
    document.querySelectorAll('.forecast-row').forEach((row, index) => {
      row.querySelector('.forecast-track i').style.setProperty('--bar', `${levels[index]}%`);
      row.querySelector('b').textContent = levels[index];
    });
  }

  document.getElementById('initialize').addEventListener('click', () => {
    landing.classList.add('leaving');
    landing.style.transition = 'opacity .5s, transform .5s';
    landing.style.opacity = '0';
    landing.style.transform = 'scale(.985)';
    window.setTimeout(() => {
      landing.hidden = true;
      dashboard.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 480);
  });

  document.querySelectorAll('input[data-control]').forEach(input => {
    input.style.setProperty('--fill', `${input.value}%`);
    input.addEventListener('input', () => {
      values[input.dataset.control] = Number(input.value);
      input.style.setProperty('--fill', `${input.value}%`);
      input.parentElement.querySelector('output').value = `${input.value}%`;
      updateMetrics();
    });
  });

  const overlay = document.getElementById('simulation-overlay');
  const step = document.getElementById('sim-step');
  const progress = document.getElementById('loading-progress');
  const percent = document.getElementById('loading-percent');
  const closeSimulation = document.getElementById('close-simulation');
  let simulationTimers = [];
  document.getElementById('start-simulation').addEventListener('click', () => {
    simulationTimers.forEach(clearTimeout);
    simulationTimers = [];
    overlay.hidden = false;
    closeSimulation.hidden = true;
    document.body.style.overflow = 'hidden';
    const sequence = [
      ['INITIALIZING...', 18],
      ['CALIBRATING DIGITAL TWIN...', 43],
      ['ANALYZING PATTERNS...', 71],
      ['GENERATING FUTURE MODEL...', 94],
      ['SIMULATION COMPLETE', 100]
    ];
    sequence.forEach(([message, amount], index) => {
      simulationTimers.push(window.setTimeout(() => {
        step.textContent = message;
        progress.style.width = `${amount}%`;
        percent.textContent = `${String(amount).padStart(2, '0')}%`;
        if (index === sequence.length - 1) closeSimulation.hidden = false;
      }, index * 950));
    });
  });
  function hideSimulation() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }
  closeSimulation.addEventListener('click', hideSimulation);
  overlay.addEventListener('click', event => { if (event.target === overlay && !closeSimulation.hidden) hideSimulation(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden && !closeSimulation.hidden) hideSimulation(); });

  const scenarios = {
    sleep: { label: 'SLEEP 2 HOURS MORE', productivity: () => clamp(productivity() + (100 - values.sleep) * .24 + 5), stress: () => clamp(stress() - 12), note: 'More recovery raises tomorrow’s energy reserve.' },
    workload: { label: 'INCREASE WORKLOAD', productivity: () => clamp(productivity() + 5 - Math.max(0, values.workload - 65) * .16), stress: () => clamp(stress() + 18), note: 'Output can rise, but the added load increases strain.' },
    deep: { label: 'DEEP WORK SESSION', productivity: () => clamp(productivity() + (100 - values.focus) * .18 + 7), stress: () => clamp(stress() - 5 + values.workload * .05), note: 'A protected focus block improves quality and throughput.' }
  };
  document.querySelectorAll('.whatif-button').forEach(button => button.addEventListener('click', () => {
    const scenario = scenarios[button.dataset.scenario];
    document.querySelectorAll('.whatif-button').forEach(item => item.classList.toggle('selected', item === button));
    document.querySelector('.scenario-placeholder').hidden = true;
    document.querySelector('.result-stats').hidden = false;
    document.getElementById('scenario-productivity').textContent = `${scenario.productivity()}%`;
    document.getElementById('scenario-stress').textContent = `${scenario.stress()}%`;
    document.getElementById('scenario-note').textContent = `${scenario.label}: ${scenario.note}`;
  }));

  const menuButton = document.getElementById('menu-toggle');
  const nav = document.querySelector('.main-nav');
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
  updateMetrics();
})();
