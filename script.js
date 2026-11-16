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
    announce: document.getElementById('announce'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
  };

  const emptyState = () => ({ player: 0, computer: 0, ties: 0, round: 0, history: [] });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!s || typeof s !== 'object' || !Array.isArray(s.history)) return emptyState();
      const count = (n) => (Number.isInteger(n) && n >= 0 ? n : 0);
      // Keep only well-formed rounds; anything else in storage is ignored.
      const history = s.history
        .filter((h) => h && CHOICES.includes(h.player) && CHOICES.includes(h.computer) && Object.hasOwn(RESULT_TEXT, h.result) && Number.isInteger(h.round))
        .slice(0, HISTORY_LIMIT);
      return { player: count(s.player), computer: count(s.computer), ties: count(s.ties), round: count(s.round), history };
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
    el.announce.textContent = `Round ${state.round}: you chose ${playerChoice}, computer chose ${computerChoice}. ${RESULT_TEXT[result]}`;
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

  function span(className, text) {
    const s = document.createElement('span');
    s.className = className;
    s.textContent = text;
    return s;
  }

  function renderHistory() {
    el.historyList.innerHTML = '';
    el.historyList.start = state.round;
    state.history.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'history-item is-' + h.result;
      const moves = span('h-moves', label(h.player) + ' ');
      moves.append(span('vs', 'vs'), ' ' + label(h.computer));
      li.append(span('h-round', '#' + h.round), moves, span('h-result', RESULT_TEXT[h.result]));
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
    el.announce.textContent = 'Game reset.';
    renderScore();
    renderHistory();
  }

  document.getElementById('choices').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-choice]');
    if (btn) play(btn.dataset.choice);
  });

  document.getElementById('resetBtn').addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
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
