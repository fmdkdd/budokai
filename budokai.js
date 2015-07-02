// Tournament helper
// 1. Ask for number of participants
// 2. Show the form of the tournament with numbers
// 3. Can assign names to numbers
// 4. Can shuffle participants
// 5. Gives list of matches to play
// 6. Can change winner of match at will

// TODO: static views for posterity
// TODO: different options (in number of matches) where it makes sense
// TODO: losers bracket as an option

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Utils

'use strict';

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var save = function save(k, v) {
  return localStorage.setItem(k, v);
};
var retrieve = function retrieve(k) {
  return localStorage.getItem(k);
};
var genid = (function () {
  var i = 0;return function () {
    return ++i;
  };
})();

var encode = function encode(s) {
  return btoa(encodeURI(s));
};
var decode = function decode(s) {
  return decodeURI(atob(s));
};

function fromTemplate(selector) {
  var $template = document.querySelector(selector);
  var $fragment = document.importNode($template.content, true);
  return $fragment;
}

function debounce(func) {
  var wait = arguments[1] === undefined ? 0 : arguments[1];

  var timeout = undefined;
  return function () {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      return func.apply(_this, args);
    }, wait);
  };
}

var m2f = Function.prototype.bind.bind(Function.prototype.call);
var forEach = m2f(Array.prototype.forEach);
var map = m2f(Array.prototype.map);
var filter = m2f(Array.prototype.filter);

function initArray(length, initFunction) {
  var a = new Array(length);
  while (length-- > 0) a[length] = initFunction(length);
  return a;
}

// range(start, end) return [start, ..., end].
// range(end) return [1, ..., end].
function range(start, end) {
  if (end == null) {
    end = start;
    start = 1;
  }
  if (end < start) return [];else return range(start, end - 1).concat(end);
}

function shuffle(array) {
  var r = function r() {
    return Math.floor(Math.random() * array.length);
  };

  var shuffled = [];
  for (var i = 0; i < array.length; i++) {
    var j = r();
    while (shuffled[j]) j = (j + 1) % array.length;
    shuffled[j] = array[i];
  }

  return shuffled;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function events(players, eventType) {
  var n = players.length;

  if (eventType === 'league') return [leagueFair(players)];

  if (n === 3) {
    return [shuffle(league(players))];
  } else if (n === 4 || n === 8) return [tourney(players)];else if (n === 5) {
    var _split = split(players, [3, 2]);

    var _split2 = _slicedToArray(_split, 2);

    var g1 = _split2[0];
    var g2 = _split2[1];

    var l = shuffle(league(g1));
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  } else if (n === 6) {
    var _split3 = split(players, [3, 3]);

    var _split32 = _slicedToArray(_split3, 2);

    var g1 = _split32[0];
    var g2 = _split32[1];

    var l1 = shuffle(league(g1));
    var l2 = shuffle(league(g2));
    var w1 = best(2, l1);
    var w2 = best(2, l2);
    return [l1, l2, tourney(mix([w1, w2]))];
  } else if (n === 7) {
    return [tourney(players.concat(last(players)))];
  } else if (n === 9) {
    var _split4 = split(players, [3, 6]);

    var _split42 = _slicedToArray(_split4, 2);

    var g1 = _split42[0];
    var g2 = _split42[1];

    var l = shuffle(league(g1));
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  } else if (n === 10) {
    var _split5 = split(players, [4, 6]);

    var _split52 = _slicedToArray(_split5, 2);

    var g1 = _split52[0];
    var g2 = _split52[1];

    var l = leagueFair(g1);
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  } else return [tourney(players)];
}

var match = Object.defineProperties({
  'new': function _new(p1, p2) {
    var m = {
      __proto__: this,
      p1: p1, p2: p2
    };

    // Match is a bye
    if (p1 === p2) m.winner = p1;

    return m;
  }

}, {
  winner: {
    get: function get() {
      var _this2 = this;

      return function () {
        return _this2.win;
      };
    },
    set: function set(p) {
      if (p === 'p1') this.win = this.p1;else if (p === 'p2') this.win = this.p2;else if (p === this.p1 || p === this.p2 || p == null) this.win = p;else throw 'Winner should be p1, p2 or null';
    },
    configurable: true,
    enumerable: true
  },
  loser: {
    get: function get() {
      var _this3 = this;

      return function () {
        if (_this3.win == null) return undefined;else return _this3.win === _this3.p1 ? _this3.p2 : _this3.p1;
      };
    },
    configurable: true,
    enumerable: true
  }
});

// Return the name of a player
function name(_x3) {
  var _again = true;

  _function: while (_again) {
    var player = _x3;
    _again = false;

    if (player == null) return player;
    if (typeof player === 'function') {
      _x3 = player();
      _again = true;
      continue _function;
    }
    if (typeof player === 'object') {
      _x3 = player.name;
      _again = true;
      continue _function;
    }
    return player;
  }
}

// Return the list of winners from a list of matches.
function winners(matches) {
  return matches.map(function (m) {
    return m.winner;
  });
}

function losers(matches) {
  return matches.map(function (m) {
    return m.loser;
  });
}

// Return the list of the n best players, depending on a scoring
// function for each match.  The scoring function takes a player and
// match, and returns the player's score as a number.
function best(n, matches, scoring) {
  return range(0, n - 1).map(function (i) {
    return bestNth(i);
  });

  // XXX: sorting and computing the scores each time is far from
  // optimal, but we are dealing with very small numbers here.
  function bestNth(n) {
    return function () {
      // Convert to array for sorting
      var scores_array = [];
      scores(matches, scoring).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k = _ref2[0];
        var v = _ref2[1];
        scores_array.push([k, v]);
      });
      scores_array.sort(function (_ref3, _ref4) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var k1 = _ref32[0];
        var v1 = _ref32[1];

        var _ref42 = _slicedToArray(_ref4, 2);

        var k2 = _ref42[0];
        var v2 = _ref42[1];
        return v2 - v1;
      });

      var best = scores_array[n];
      if (best[1] === 0) return undefined;else return best[0];
    };
  }
}

// Return a Map of (sorted) scores for the given matches and a scoring
// function.  The scoring function takes a player and match, and
// returns the player's score as a number.
function scores(matches, scoring) {
  if (scoring == null) scoring = defaultScoring;

  var scores = new Map(); // Map supports function keys

  matches.forEach(function (m) {
    [m.p1, m.p2].forEach(function (p) {
      var s = scores.get(p) || 0;
      scores.set(p, s + scoring(p, m));
    });
  });

  var sorted_scores = [].concat(_toConsumableArray(scores));
  sorted_scores.sort(function (_ref5, _ref6) {
    var _ref52 = _slicedToArray(_ref5, 2);

    var k1 = _ref52[0];
    var v1 = _ref52[1];

    var _ref62 = _slicedToArray(_ref6, 2);

    var k2 = _ref62[0];
    var v2 = _ref62[1];
    return v2 - v1;
  });

  return sorted_scores;
}

function defaultScoring(player, match) {
  if (player === match.winner()) return 1;else return 0;
}

// Return the list of matches between players, where each player gets
// to meet all the other players once.
function league(players) {
  if (players.length === 2) return [match['new'](players[0], players[1])];

  var p1 = players[0];
  var rest = players.slice(1);

  var matches = rest.map(function (p2) {
    return match['new'](p1, p2);
  });
  return matches.concat(league(rest));
}

function isLeague(event) {
  // If it contains matches at first level, it's a league
  return !!event[0].p1;
}

// Return the list of matches of a league between the players, with a fair
// distribution of matches (round-robin).  Below 5 players, it's impossible to
// avoid playing two matches in a row.  Above, this seems to work.
function leagueFair(players) {
  var n = players.length;
  var m = n * (n - 1) / 2; // number of matches
  var matchups = initArray(n, function () {
    return [];
  }); // Whether two players already met, and
  // which played home.
  var haveMet = function haveMet(p1, p2) {
    return matchups[p1][p2] != null;
  };
  var numMatches = function numMatches(p) {
    return matchups[p].filter(function (m) {
      return m != null;
    }).length;
  };
  var homeMatches = function homeMatches(p) {
    return matchups[p].filter(function (m) {
      return m === 1;
    }).length;
  };
  var bins = initArray(n, function () {
    return [];
  }); // Sort players by number of matches
  // played
  var matches = []; // The list of matches to return

  bins[0] = range(0, n - 1);

  var p1, p2;
  while (m > 0) {
    p1 = first();
    p2 = first(function (p) {
      return !haveMet(p1, p);
    });
    // Give a chance for the other player to play home.
    // XXX: this does *not* ensure a fair distribution of home/away matches for
    // each player.  Does not work for N=5 at least, where a fair distribution
    // exists.
    if (homeMatches(p1) > homeMatches(p2)) {
      ;
      var _ref7 = [p2, p1];
      p1 = _ref7[0];
      p2 = _ref7[1];
    }matches.push(match['new'](players[p1], players[p2]));
    matchups[p1][p2] = 1;
    matchups[p2][p1] = -1;
    bins[numMatches(p1)].push(p1);
    bins[numMatches(p2)].push(p2);
    --m;
  }

  return matches;

  // Remove and return the first element in bins that matches the predicate,
  // going through the bins in increasing order of number of matches played.
  function first(pred) {
    pred = pred || function () {
      return true;
    };
    for (var bi = 0; bi < bins.length; ++bi) {
      var b = bins[bi];
      for (var i = 0; i < b.length; ++i) {
        if (pred(b[i])) {
          return b.splice(i, 1)[0];
        }
      }
    }
    return undefined;
  }
}

// Return a list of levels, where each level is a list of matches
// between players in the tourney.  Finale is the last level.
function tourney(players) {
  if (players.length === 2) return [[match['new'](players[0], players[1])]];

  var n = Math.pow(2, Math.floor(Math.log(players.length) / Math.LN2));
  var m = players.length - n;
  if (m > 0) {
    var _split6 = split(players, [m * 2]);

    var _split62 = _slicedToArray(_split6, 2);

    var now = _split62[0];
    var up = _split62[1];

    var elim = pairs(now);
    var byes = up.map(function (p) {
      return match['new'](p, p);
    });
    var matches = elim.concat(byes);
    return [matches].concat(tourney(winners(matches)));
  } else {
    var matches = pairs(players);
    return [matches].concat(tourney(winners(matches)));
  }
}

function losersBracket(tourney, prevWinners) {
  if (prevWinners == null) prevWinners = [];
  if (tourney.length === 0) return [];
  console.log(prevWinners.concat(losers(tourney[0])).length);

  var matches = pairs(prevWinners.concat(losers(tourney[0])));
  return [matches].concat(losersBracket(tourney.slice(1), winners(matches)));
}

function tourneyDoubleElimination(players) {
  var t = tourney(players);
  var l = losersBracket(t);
  var finale = pairs(winners(last(t).concat(last(l))));
  return [t, l, finale];
}

// Return a list of matches between players, where each player is
// matched with its neighbor, as in the first level of a tourney.
function pairs(players) {
  if (players.length % 2 === 1) throw 'Can\'t pair odd number of players';

  var matches = [];
  for (var i = 0; i < players.length; i += 2) {
    var m = match['new'](players[i], players[i + 1]);
    matches.push(m);
  }
  return matches;
}

// Return the list of players split into groups of lengths specified
// by `groups`.
function split(players, groups) {
  if (groups.length === 0) return [players];

  var hd = players.slice(0, groups[0]);
  var tl = players.slice(groups[0]);
  var g = groups.slice(1);
  return [hd].concat(split(tl, g));
}

// Mix players out of elimination rounds as to not meet again in the
// first level of a tourney.  [[1,2],[3,4],...] yields [1,3,2,4,...].
function mix(groups) {
  if (groups[0].length === 0) return groups[1];
  if (groups[1].length === 0) return groups[0];

  var heads = groups.map(function (g) {
    return g[0];
  });
  var tails = groups.map(function (g) {
    return g.slice(1);
  });

  return heads.concat(mix(tails));
}

function last(matches) {
  return matches[matches.length - 1];
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// View

var domToModel = new WeakMap();

var render = {
  events: function events(es) {
    var $f = document.createDocumentFragment();
    es.forEach(function (e) {
      $f.appendChild(render.event(e));
    });
    return $f;
  },

  event: function event(e) {
    if (isLeague(e)) return render.league(e);else return render.tourney(e);
  },

  league: function league(l) {
    var $fragment = fromTemplate('#template-league');
    var $l = $fragment.querySelector('.league');

    var $matches = $l.querySelector('.league-matches');
    l.forEach(function (m) {
      $matches.appendChild(render.match(m));
    });

    var $scores = $l.querySelector('.league-scores tbody');
    scores(l).forEach(function (_ref8) {
      var _ref82 = _slicedToArray(_ref8, 2);

      var k = _ref82[0];
      var v = _ref82[1];

      var $fragment = fromTemplate('#template-league-scores-row');
      var $name = $fragment.children[0].children[0];
      var $score = $fragment.children[0].children[1];
      $name.textContent = name(k);
      $score.textContent = v;

      document.addEventListener('name-changed', function (event) {
        if (event.detail.player === k) $name.textContent = name(k);
      });

      $scores.appendChild($fragment);
    });

    document.addEventListener('winner-changed', function (event) {
      scores(l).forEach(function (_ref9, i) {
        var _ref92 = _slicedToArray(_ref9, 2);

        var k = _ref92[0];
        var v = _ref92[1];

        var $row = $scores.children[i];
        $row.children[0].textContent = name(k);
        $row.children[1].textContent = v;
      });
    });

    return $l;
  },

  tourney: function tourney(t) {
    var $fragment = fromTemplate('#template-tourney');
    var $t = $fragment.querySelector('.tourney');

    var $matches = $t.querySelector('.tourney-matches');
    var $winnerLevel = $matches.children[0];
    t.forEach(function (l) {
      $matches.insertBefore(render.level(l), $winnerLevel);
    });

    var $winner = $winnerLevel.querySelector('.winner');
    var finale = last(t)[0];
    var winner = finale.winner;
    $winner.textContent = name(winner);

    document.addEventListener('name-changed', function (event) {
      if (event.detail.player === winner) $winner.textContent = name(winner);
    });

    document.addEventListener('winner-changed', function (event) {
      if (event.detail.match === finale) $winner.textContent = name(winner);
    });

    return $t;
  },

  level: function level(l) {
    var $fragment = fromTemplate('#template-tourney-level');
    var $l = $fragment.children[0];
    l.forEach(function (m) {
      $l.appendChild(render.match(m));
    });

    return $l;
  },

  match: function match(m) {
    var $fragment = fromTemplate('#template-match');
    var $m = $fragment.querySelector('.match');

    domToModel.set($m, m);

    if (m.p1 === m.p2) $m.classList.add('bye');[m.p1, m.p2].forEach(function (p, i) {
      var player = i + 1;
      var $button = $m.querySelector('#radio-' + player);
      $button.id = 'radio-' + genid();

      domToModel.set($button.parentNode, p);

      if (name(m.p1) == null || name(m.p2) == null) $button.setAttribute('disabled', true);

      var $label = $m.querySelector('.player' + player + ' label');
      $label.textContent = name(p);
      $label.setAttribute('for', $button.id);

      document.addEventListener('winner-changed', function (event) {
        if (event.detail.match === m) {
          var winner = event.detail.winner;
          $button.checked = winner === p;
        } else {
          $label.textContent = name(p);

          if (name(m.p1) == null || name(m.p2) == null) $button.setAttribute('disabled', true);else $button.removeAttribute('disabled');
        }
      });

      document.addEventListener('name-changed', function (event) {
        if (event.detail.player === p) $label.textContent = name(p);
      });

      var $char = $m.querySelector('.player' + player + ' .char');
      $char.value = retrieve(name(p));

      document.addEventListener('char-changed', function (event) {
        var charProp = 'p' + player + '_char';
        if (event.detail.player === p) {
          if (event.detail.match === m) m[charProp] = event.detail.char;else if (!m[charProp]) $char.value = event.detail.char;
        }
      });

      document.addEventListener('shuffle-players', function (event) {
        $label.textContent = name(p);
        $char.value = retrieve(name(p));
      });
    });

    return $m;
  },

  saveLink: function saveLink(events) {
    var $div = document.querySelector('.budokai-data');

    var link = encode(serialize.all(events));
    var url = 'mailto:?subject=[Budokai] Save me&body=' + link;

    var $p = $div.querySelector('.data');
    $p.textContent = link;

    var $a = $div.querySelector('a');
    $a.setAttribute('href', encodeURI(url));
  },

  refreshPlayerList: function refreshPlayerList(n) {
    var $players = document.querySelector('#player-list');

    range(n).forEach(function (i) {
      var $node = $players.childNodes[i - 1];
      if ($node == null) {
        var $fragment = fromTemplate('#template-player-name');
        var $div = $fragment.querySelector('.name-container');
        $div.id = 'player-' + i;

        var $name = $div.querySelector('.name');
        $name.value = retrieve($div.id) || 'P' + i;

        var $lock = $div.querySelector('.lock');
        $lock.id = 'lock-' + i;

        var $label = $div.querySelector('label');
        $label.setAttribute('for', $lock.id);

        $players.appendChild($div);
      } else {
        $node.classList.remove('off');
      }
    });

    range(n + 1, $players.childNodes.length).forEach(function (i) {
      var $node = $players.childNodes[i - 1];
      $node.classList.add('off');
    });
  },

  refreshEvents: function refreshEvents(eventType) {
    var $players = filter(document.querySelectorAll('#player-list .name'), function ($p) {
      return !$p.parentNode.classList.contains('off');
    });
    var players = [];
    forEach($players, function ($p) {
      var p = { name: function name() {
          return $p.value;
        } };
      players.push(p);
      domToModel.set($p, p);
    });

    var evs = events(players, eventType);

    var $list = document.querySelector('#match-list');
    $list.innerHTML = '';
    $list.appendChild(render.events(evs));
    domToModel.set(document, evs);
  }
};

var serialize = {
  all: function all(events) {
    var ev = [];

    events.forEach(function (e) {
      if (isLeague(e)) ev.push(serialize.league(e));else ev.push(serialize.tourney(e));
    });

    var m = {
      version: 1,
      date: new Date().toISOString().split('T')[0],
      events: ev
    };

    return JSON.stringify(m);
  },

  league: function league(l) {
    return l.map(function (m) {
      return serialize.match(m);
    });
  },

  tourney: function tourney(t) {
    var matches = [];
    t.forEach(function (bracket) {
      return bracket.forEach(function (m) {
        if (m.p1 !== m.p2) matches.push(serialize.match(m));
      });
    });
    return matches;
  },

  match: function match(m) {
    var winner;
    if (m.p1 === m.winner()) winner = 'p1';else if (m.winner() === m.p2) winner = 'p2';

    return {
      p1: { name: name(m.p1),
        char: m.p1_char },
      p2: { name: name(m.p2),
        char: m.p2_char },
      winner: winner
    };
  }
};

function dispatch(eventName) {
  var detail = arguments[1] === undefined ? null : arguments[1];

  document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
}

document.addEventListener('DOMContentLoaded', function () {
  var $n = document.querySelector('#n-players');
  var $nOutput = document.querySelector('#n-players-output');
  var $isTourney = document.querySelector('#event-type-tourney');
  var $isLeague = document.querySelector('#event-type-league');
  var $players = document.querySelector('#player-list');
  var $list = document.querySelector('#match-list');
  var $shuffle = document.querySelector('#shuffle-players');

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Custom events

  function playersChanged() {
    var n = parseInt($n.value, 10);
    dispatch('n-players-changed', n);
  }

  function eventTypeChanged() {
    var eventType = $isTourney.checked ? 'tourney' : 'league';
    dispatch('event-type-changed', eventType);
  }

  function nameChanged(playerId, player, name) {
    dispatch('name-changed', { playerId: playerId, player: player, name: name });
  }

  function shufflePlayers() {
    dispatch('shuffle-players');
  }

  function lockPlayer($name) {
    dispatch('lock-player', $name);
  }

  function winnerChanged(match, winner, $match) {
    dispatch('winner-changed', { match: match, winner: winner, $match: $match });
  }

  function charChanged(match, player, char) {
    dispatch('char-changed', { match: match, player: player, char: char });
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM events -> custom events

  $n.addEventListener('input', debounce(playersChanged, 30));
  $isTourney.addEventListener('change', debounce(eventTypeChanged, 30));
  $isLeague.addEventListener('change', debounce(eventTypeChanged, 30));

  $players.addEventListener('input', debounce(function (event) {
    if (event.target.classList.contains('name')) {
      var playerId = event.target.parentNode.id;
      var player = domToModel.get(event.target);
      var _name = event.target.value;
      nameChanged(playerId, player, _name);
    }
  }, 100));

  $shuffle.addEventListener('click', debounce(shufflePlayers, 30));

  $players.addEventListener('click', debounce(function (event) {
    if (event.target.classList.contains('lock')) {
      var $name = event.target.parentNode.querySelector('.name');
      lockPlayer($name);
    }
  }, 30));

  $list.addEventListener('change', debounce(function (event) {
    if (event.target.classList.contains('winner-select')) {
      var $player = event.target.parentNode;
      var $match = $player.parentNode.parentNode;
      var winner = domToModel.get($player);
      var _match = domToModel.get($match);
      winnerChanged(_match, winner, $match);
    }
  }, 30));

  $list.addEventListener('input', debounce(function (event) {
    if (event.target.classList.contains('char')) {
      var $player = event.target.parentNode;
      var $match = $player.parentNode.parentNode;
      var player = domToModel.get($player);
      var _match2 = domToModel.get($match);
      var char = event.target.value;
      charChanged(_match2, player, char);
    }
  }, 100));

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Handling custom events

  document.addEventListener('n-players-changed', function (event) {
    $nOutput.value = event.detail;
    render.refreshPlayerList(event.detail);
    render.refreshEvents($isTourney.checked ? 'tourney' : 'league');

    render.saveLink(domToModel.get(document));
  });

  document.addEventListener('event-type-changed', function (event) {
    render.refreshEvents(event.detail);

    render.saveLink(domToModel.get(document));
  });

  document.addEventListener('name-changed', function (event) {
    save(event.detail.playerId, event.detail.name);

    render.saveLink(domToModel.get(document));
  });

  document.addEventListener('shuffle-players', function () {
    var $unlockedNames = filter($players.querySelectorAll('input.name'), function ($p) {
      return !$p.parentNode.classList.contains('off') && !$p.classList.contains('locked');
    });
    var names = map($unlockedNames, function ($i) {
      return $i.value;
    });
    names = shuffle(names);
    forEach($unlockedNames, function ($n, i) {
      $n.value = names[i];
    });
  });

  document.addEventListener('lock-player', function (event) {
    var $name = event.detail;
    $name.classList.toggle('locked');
    $name.disabled = !$name.disabled;
  });

  document.addEventListener('winner-changed', function (event) {
    var _event$detail = event.detail;
    var match = _event$detail.match;
    var $match = _event$detail.$match;
    var winner = _event$detail.winner;

    match.winner = winner;

    match.p1_char = $match.querySelector('.player1 .char').value;
    match.p2_char = $match.querySelector('.player2 .char').value;

    render.saveLink(domToModel.get(document));
  });

  document.addEventListener('char-changed', function (event) {
    var _event$detail2 = event.detail;
    var player = _event$detail2.player;
    var char = _event$detail2.char;

    save(name(player), char);

    render.saveLink(domToModel.get(document));
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Build the page with default values

  playersChanged();
  eventTypeChanged();
});

//# sourceMappingURL=budokai.js.map