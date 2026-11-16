// Rock Paper Scissors — score and round history are kept in localStorage.
(function () {
  'use strict';

  const STORAGE_KEY = 'rps.state.v1';
  const HISTORY_LIMIT = 10;
  const CHOICES = ['rock', 'paper', 'scissors'];
  const EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' };
  const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  const RESULT_TEXT = { win: 'You win!', lose: 'You lose', tie: "It's a tie" };

  const el = {
    playerScore: document.getElementById('playerScore'),
    computerScore: document.getElementById('computerScore'),
    tieScore: document.getElementById('tieScore'),
    playerDisplay: document.getElementById('playerDisplay'),
    computerDisplay: document.getElementById('computerDisplay'),
    result: document.getElementById('resultDisplay'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
  };

  const emptyState = () => ({ player: 0, computer: 0, ties: 0, round: 0, history: [] });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return s && Array.isArray(s.history) ? s : emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable: the game still works for this session */
    }
  }

  let state = load();

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const label = (choice) => `${EMOJI[choice]} ${capitalize(choice)}`;

  function getResult(player, computer) {
    if (player === computer) return 'tie';
    return BEATS[player] === computer ? 'win' : 'lose';
  }

  function play(playerChoice) {
    const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const result = getResult(playerChoice, computerChoice);

    if (result === 'win') state.player++;
    else if (result === 'lose') state.computer++;
    else state.ties++;

    state.round++;
    state.history.unshift({ round: state.round, player: playerChoice, computer: computerChoice, result });
    state.history = state.history.slice(0, HISTORY_LIMIT);
    save();

    el.playerDisplay.textContent = label(playerChoice);
    el.computerDisplay.textContent = label(computerChoice);
    showResult(result);
    renderScore();
    renderHistory();
  }

  function showResult(result) {
    el.result.textContent = RESULT_TEXT[result];
    el.result.className = 'result is-' + result;
    // restart the pop animation
    void el.result.offsetWidth;
    el.result.classList.add('pop');
  }

  function renderScore() {
    el.playerScore.textContent = state.player;
    el.computerScore.textContent = state.computer;
    el.tieScore.textContent = state.ties;
  }

  function renderHistory() {
    el.historyList.innerHTML = '';
    el.historyList.start = state.round;
    state.history.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'history-item is-' + h.result;
      li.innerHTML = `
        <span class="h-round">#${h.round}</span>
        <span class="h-moves">${label(h.player)} <span class="vs">vs</span> ${label(h.computer)}</span>
        <span class="h-result">${RESULT_TEXT[h.result]}</span>`;
      el.historyList.appendChild(li);
    });
    el.historyEmpty.hidden = state.history.length > 0;
  }

  function reset() {
    state = emptyState();
    save();
    el.playerDisplay.textContent = '—';
    el.computerDisplay.textContent = '—';
    el.result.textContent = 'Make your move';
    el.result.className = 'result';
    renderScore();
    renderHistory();
  }

  document.getElementById('choices').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-choice]');
    if (btn) play(btn.dataset.choice);
  });

  document.getElementById('resetBtn').addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    const map = { r: 'rock', p: 'paper', s: 'scissors' };
    if (map[key]) play(map[key]);
  });

  renderScore();
  renderHistory();

  // Show the last round again after a reload
  const last = state.history[0];
  if (last) {
    el.playerDisplay.textContent = label(last.player);
    el.computerDisplay.textContent = label(last.computer);
    el.result.textContent = RESULT_TEXT[last.result];
    el.result.className = 'result is-' + last.result;
  }
})();
