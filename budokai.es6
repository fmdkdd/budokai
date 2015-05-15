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

function events(players, eventType) {
  var n = players.length;

  if (eventType === 'league')
    return [leagueFair(players)];

  if (n === 3) {
    return [shuffle(league(players))];
  }

  else if (n === 4 || n === 8)
    return [tourney(players)];

  else if (n === 5) {
    var [g1, g2] = split(players, [3,2]);
    var l = shuffle(league(g1));
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  }

  else if (n === 6) {
    var [g1, g2] = split(players, [3,3]);
    var l1 = shuffle(league(g1));
    var l2 = shuffle(league(g2));
    var w1 = best(2, l1);
    var w2 = best(2, l2);
    return [l1, l2, tourney(mix([w1, w2]))];
  }

  else if (n === 7) {
    return [tourney(players.concat(last(players)))];
  }

  else if (n === 9) {
    var [g1, g2] = split(players, [3,6]);
    var l = shuffle(league(g1));
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  }

  else if (n === 10) {
    var [g1, g2] = split(players, [4,6]);
    var l = leagueFair(g1);
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  }

  else
    return [tourney(players)];
}

var match = {
  new: function(p1, p2) {
    var m = {
      __proto__: this,
      p1, p2,
    };

    // Match is a bye
    if (p1 === p2)
      m.winner = p1;

    return m;
  },

  get winner() { return () => this.win },
  set winner(p) {
    if (p === 'p1') this.win = this.p1;
    else if (p === 'p2') this.win = this.p2;
    else if (p === this.p1 || p === this.p2 || p == null)
      this.win = p;
    else throw "Winner should be p1, p2 or null";
  },

  get loser() { return () => {
    if(this.win == null) return undefined;
    else return this.win === this.p1 ? this.p2 : this.p1;
  }},
};

// Return the name of a player
function name(player) {
  if (player == null) return player;
  if (typeof player === 'function') return name(player());
  if (typeof player === 'object') return name(player.name);
  return player;
}

function last_char(player) {
  if (player == null) return player;
  if (typeof player === 'function') return last_char(player());
  if (typeof player === 'object') return last_char(player.last_char);
  return player;
}

function set_last_char(player, last_char) {
  if (player == null) return;
  if (typeof player === 'function') return set_last_char(player(), last_char);
  if (typeof player === 'object') {
    save(name(player), last_char);
    player.last_char = last_char;
  }
}


// Return the list of winners from a list of matches.
function winners(matches) {
  return matches.map(m => m.winner);
}

function losers(matches) {
  return matches.map(m => m.loser);
}

// Return the list of the n best players, depending on a scoring
// function for each match.  The scoring function takes a player and
// match, and returns the player's score as a number.
function best(n, matches, scoring) {
  return range(0, n-1).map(i => bestNth(i));

  // XXX: sorting and computing the scores each time is far from
  // optimal, but we are dealing with very small numbers here.
  function bestNth(n) {
    return function() {
      // Convert to array for sorting
      var scores_array = [];
      scores(matches, scoring)
        .forEach(([k,v]) => { scores_array.push([k,v]) });
      scores_array.sort(([k1,v1], [k2,v2]) => v2 - v1);

      var best = scores_array[n];
      if (best[1] === 0) return undefined;
      else return best[0];
    }
  }
}

// Return a Map of (sorted) scores for the given matches and a scoring
// function.  The scoring function takes a player and match, and
// returns the player's score as a number.
function scores(matches, scoring) {
  if (scoring == null) scoring = defaultScoring;

  var scores = new Map();       // Map supports function keys

  matches.forEach(m => {
    [m.p1, m.p2].forEach(p => {
      var s = scores.get(p) || 0;
      scores.set(p, s + scoring(p, m));
    });
  });

  var sorted_scores = [...scores];
  sorted_scores.sort(([k1,v1],[k2,v2]) => v2 - v1);

  return sorted_scores;
}

function defaultScoring(player, match) {
  if (player === match.winner()) return 1;
  else return 0;
}

// Return the list of matches between players, where each player gets
// to meet all the other players once.
function league(players) {
  if (players.length === 2)
    return [match.new(players[0], players[1])];

  var p1 = players[0];
  var rest = players.slice(1);

  var matches = rest.map(p2 => match.new(p1, p2));
  return matches.concat(league(rest));
}

function isLeague(event) {
  // If it contains matches at first level, it's a league
  return !!event[0].p1;
}

// Return the list of matches of a league between the players, with a fair
// distribution of matches (round-robin).
function leagueFair(players) {
  var n = players.length;
  var m = n * (n - 1) / 2;               // number of matches
  var matchups = initArray(n, () => []); // Whether two players already met
  var haveMet = (p1, p2) => matchups[p1][p2] === true;
  var numMatches = p => matchups[p].filter(m => m != null).length
  var bins = initArray(n, () => []);     // Sort players by number of matches
                                         // played
  var matches = [];                      // The list of matches to return

  bins[0] = range(0, n-1);

  var p1, p2;
  while (m > 0) {
    p1 = first();
    p2 = first(p => !haveMet(p1, p))
    matches.push(match.new(players[p1], players[p2]));
    matchups[p1][p2] = matchups[p2][p1] = true;
    bins[numMatches(p1)].push(p1);
    bins[numMatches(p2)].push(p2);
    --m;
  }

  return matches;

  // Remove and return the first element in bins that matches the predicate,
  // going through the bins in increasing order of number of matches played.
  function first(pred) {
    pred = pred || (() => true);
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

function initArray(length, initFunction) {
  var a = new Array(length);
  while (length-- > 0) a[length] = initFunction(length);
  return a;
}

// Return a list of levels, where each level is a list of matches
// between players in the tourney.  Finale is the last level.
function tourney(players) {
  if (players.length === 2)
    return [[match.new(players[0], players[1])]];

  var n = Math.pow(2, Math.floor(Math.log(players.length)/Math.LN2));
  var m = players.length - n;
  if (m > 0) {
    var [now, up] = split(players, [m * 2]);
    var elim = pairs(now);
    var byes = up.map(p => match.new(p,p));
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
  return [matches].concat(losersBracket(tourney.slice(1),
                                        winners(matches)));
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
  if (players.length % 2 === 1)
    throw "Can't pair odd number of players";

  var matches = [];
  for (var i = 0; i < players.length; i += 2) {
    var m = match.new(players[i], players[i+1]);
    matches.push(m);
  }
  return matches;
}

// Return the list of players split into groups of lengths specified
// by `groups`.
function split(players, groups) {
  if (groups.length === 0)
    return [players];

  var hd = players.slice(0, groups[0]);
  var tl = players.slice(groups[0]);
  var g = groups.slice(1);
  return [hd].concat(split(tl, g));
}

// range(start, end) return [start, ..., end].
// range(end) return [1, ..., end].
function range(start, end) {
  if (end == null) {
    end = start;
    start = 1;
  }
  if (end < start) return [];
  else return range(start, end - 1).concat(end);
}

// Mix players out of elimination rounds as to not meet again in the
// first level of a tourney.  [[1,2],[3,4],...] yields [1,3,2,4,...].
function mix(groups) {
  if (groups[0].length === 0) return groups[1];
  if (groups[1].length === 0) return groups[0];

  var heads = groups.map(g => g[0]);
  var tails = groups.map(g => g.slice(1));

  return heads.concat(mix(tails));
}

function last(matches) {
  return matches[matches.length - 1];
}

function shuffle(array) {
  var r = () => Math.floor(Math.random() * array.length);

  var shuffled = [];
  for (var i = 0; i < array.length; i++) {
    var j = r();
    while (shuffled[j])
      j = (j + 1) % array.length;
    shuffled[j] = array[i];
  }

  return shuffled;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// View

var render = {
  events: function(es) {
    var $f = document.createDocumentFragment();
    es.forEach(e => { $f.appendChild(render.event(e)); });
    return $f;
  },

  event: function(e) {
    if (isLeague(e)) return render.league(e);
    else return render.tourney(e);
  },

  league: function(l) {
    var $f = document.createElement('div');
    $f.classList.add('league');

    var $header = document.createElement('h3');
    $header.textContent = 'League';
    $f.appendChild($header);

    var $div = document.createElement('div');
    $div.classList.add('league-content');

    var $matches = document.createElement('ol');
    $matches.classList.add('league-matches');
    l.forEach(m => { $matches.appendChild(render.match(m)); });
    $div.appendChild($matches);

    var $scores = document.createElement('table');
    $scores.classList.add('league-scores');
    var $scores_head = document.createElement('tr');

    var $th_player = document.createElement('th');
    $th_player.textContent = 'Player';
    $scores_head.appendChild($th_player);

    var $th_score = document.createElement('th');
    $th_score.textContent = 'Score';
    $scores_head.appendChild($th_score);

    $scores.appendChild($scores_head);

    scores(l).forEach(([k,v]) => {
      var $s = document.createElement('tr');

      var $name = document.createElement('td');
      $name.textContent = name(k);
      $s.appendChild($name);

      var $points = document.createElement('td');
      $points.textContent = v;
      $s.appendChild($points);

      $scores.appendChild($s);
    });

    $div.appendChild($scores);

    $f.appendChild($div);

    return $f;
  },

  tourney: function(t) {
    var $f = document.createElement('div');
    $f.classList.add('tourney');

    var $header = document.createElement('h3');
    $header.textContent = 'Tourney';
    $f.appendChild($header);

    var $t = document.createElement('div');
    $t.classList.add('tourney-matches');
    t.forEach(l => { $t.appendChild(render.level(l)); });
    $f.appendChild($t);

    var $winnerLevel = document.createElement('ol');
    $winnerLevel.classList.add('level');

    var $winner = document.createElement('span');
    $winner.classList.add('player-name');
    $winner.classList.add('winner');
    $winner.textContent = name(last(t)[0].winner);
    $winnerLevel.appendChild($winner);

    $t.appendChild($winnerLevel);

    return $f;
  },

  level: function(l) {
    var $f = document.createDocumentFragment();
    $f.appendChild(render.matches(l));
    return $f;
  },

  matches: function(ms) {
    var $f = document.createElement('ol');
    $f.classList.add('level');
    ms.forEach(m => { $f.appendChild(render.match(m)); });
    return $f;
  },

  match: function(m) {
    var $f = document.createElement('li');
    $f.classList.add('match');
    if (m.p1 === m.p2)
      $f.classList.add('bye');

    var $player1 = document.createElement('div');
    $player1.classList.add('player1');
    $f.appendChild($player1);

    var $p1 = render.player(m.p1, m);
    $player1.appendChild($p1);

    var $char_p1 = render.chars_list(m.p1, m.p1_char);
    $char_p1.addEventListener('change', (event) => {
      m.p1_char = event.target.value;
      set_last_char(m.p1, m.p1_char);
    });
    $p1.appendChild($char_p1);
    $p1.addEventListener('click', saveChars);

    var $player2 = document.createElement('div');
    $player2.classList.add('player2');
    $f.appendChild($player2);

    var $p2 = render.player(m.p2, m);
    $player2.appendChild($p2);

    var $char_p2 = render.chars_list(m.p2, m.p2_char);
    $char_p2.addEventListener('change', (event) => {
      m.p2_char = event.target.value;
      set_last_char(m.p2, m.p2_char);
    });
    $p2.appendChild($char_p2);
    $p2.addEventListener('click', saveChars);

    var $reset = document.createElement('button');
    $reset.classList.add('reset-match');
    $reset.textContent = 'X';
    $reset.addEventListener('click', () => {
      m.winner = null;
      m.p1_char = null;
      m.p2_char = null;
    });
    $f.appendChild($reset);

    return $f;

    function saveChars() {
      m.p1_char = $char_p1.value;
      m.p2_char = $char_p2.value;
    }
  },

  chars_list: function(p, p_char) {
    var $p = document.createElement('input');
    $p.classList.add('char');
    $p.type = 'text';
    $p.placeholder = 'Dan';
    $p.setAttribute('list', 'all-chars');
    var ch = p_char || last_char(p) || retrieve(name(p));
    if (ch != null)
      $p.value = ch;

    return $p;
  },

  player: function(p, m) {
    var $f = document.createElement('div');
    $f.classList.add('player-info');

    var $button = document.createElement('input');
    $button.id = `radio-${genid()}`;
    $button.setAttribute('type', 'radio');

    $button.addEventListener('click', () => { m.winner = p; });
    if (p === m.winner())
      $button.setAttribute('checked', true);
    if (name(m.p1) == null || name(m.p2) == null)
      $button.setAttribute('disabled', true);
    $f.appendChild($button);

    var $label = document.createElement('label');
    $label.classList.add('player-name');
    $label.textContent = name(p);
    $label.setAttribute('for', $button.id);
    $f.appendChild($label);

    return $f;
  },

  saveLink: function(events) {
    var $div = document.createElement('div');
    $div.classList.add('budokai-data');

    var link = encode(serialize.all(events));

    var $p = document.createElement('p');
    $p.classList.add('data');
    $p.textContent = link;
    $div.appendChild($p);

    var $a = document.createElement('a');
    $a.setAttribute('href',
                    encodeURI(`mailto:?subject=[Budokai] Save me&body=${link}`));
    $a.textContent = 'post';
    $div.appendChild($a);

    return $div;
  },
};

var view = {
  new: function($root, events) {
    return {
      __proto__: this,
      $root, events,
    };
  },

  refresh: function() {
    this.$root.innerHTML = '';
    this.$root.appendChild(render.events(this.events));
    this.$root.appendChild(render.saveLink(this.events));
  },
};

var serialize = {
  all(events) {
    var ev = [];

    events.forEach(e => {
      if (isLeague(e)) ev.push(serialize.league(e))
      else ev.push(serialize.tourney(e))
    });

    var m = {
      version: 1,
      date: (new Date()).toISOString().split('T')[0]
      ,events: ev
    };

    return JSON.stringify(m);
  },

  league(l) {
    return l.map(m => serialize.match(m));
  },

  tourney(t) {
    var matches = [];
    t.forEach(bracket => bracket.forEach(m => {
      if (m.p1 !== m.p2)
      matches.push(serialize.match(m));
    }));
    return matches;
  },

  match(m) {
    var winner;
    if (m.p1 === m.winner())
      winner = 'p1';
    else if (m.winner() === m.p2)
      winner = 'p2';

    return {
      p1: {name: name(m.p1),
           char: m.p1_char},
      p2: {name: name(m.p2),
           char: m.p2_char},
      winner,
    };
  },
};

var encode = s => btoa(encodeURI(s))
var decode = s => decodeURI(atob(s))

document.addEventListener('DOMContentLoaded', () => {
  var $players = document.querySelector('#player-list');
  var $list = document.querySelector('#match-list');
  var $n = document.querySelector('#n-players');
  var $isTourney = document.querySelector('#event-type-tourney');
  var $isLeague = document.querySelector('#event-type-league');

  var v = view.new($list);

  $n.addEventListener('input', refreshEvents);
  $isTourney.addEventListener('input', refreshEvents);
  $isLeague.addEventListener('change', refreshEvents);

  function refreshEvents() {
    var n = parseInt($n.value, 10);
    var eventType = $isTourney.checked ? 'tourney' : 'league';
    var players = [];

    range(n).forEach(i => {
      if ($players.childNodes[i] == null) {
        var $div = document.createElement('div');
        $div.id = `player-${i}`;
        $div.classList.add('name-container');

        var $name = document.createElement('input');
        $name.classList.add('name');
        $name.setAttribute('type', 'text');
        $name.value = retrieve($div.id) || 'P' + i;
        $div.appendChild($name);

        var $lock = document.createElement('input');
        $lock.id = `lock-${i}`;
        $lock.classList.add('lock');
        $lock.setAttribute('type', 'checkbox');
        $lock.addEventListener('click', () => {
          $name.classList.toggle('locked');
          $name.disabled = !$name.disabled;
        });
        $div.appendChild($lock);

        var $label = document.createElement('label');
        $label.setAttribute('for', $lock.id);
        $label.innerHTML =
          '<i class="fa fa-unlock"></i><i class="fa fa-lock"></i>';
        $div.appendChild($label);

        $players.appendChild($div);
      } else {
        $players.childNodes[i].classList.remove('off');
        var $name = $players.querySelector(`#player-${i} .name`);
      }
      players.push({name: () => $name.value});
    });

    range(n+1, $players.childNodes.length-1).forEach(i => {
      $players.childNodes[i].classList.add('off');
    });

    v.events = events(players, eventType);
    v.refresh();
  }

  $n.dispatchEvent(new Event('input'));

  $players.addEventListener('input', (event) => {
    if (event.target.classList.contains('name')) {
      save(event.target.parentNode.id, event.target.value);
      v.refresh();
    }
  });

  $list.addEventListener('change', event => {
    // Need the setTimeout to let the event bubble and be caught by
    // other listeners before recreating the view
    setTimeout(() => { v.refresh(); } , 0);
  });

  var $shuffle = document.querySelector('#shuffle-players');
  $shuffle.addEventListener('click', () => {
    var $names = [].filter.call(
      $players.querySelectorAll('input.name'),
      $p => !$p.parentNode.classList.contains('off')
         && !$p.classList.contains('locked'));
    var names = [].map.call($names, $i => $i.value);
    names = shuffle(names);
    [].forEach.call($names, ($n,i) => { $n.value = names[i]; });
    v.refresh();
  });
});

var save = (k,v) => localStorage.setItem(k,v);
var retrieve = k => localStorage.getItem(k);
var genid = (() => { var i = 0; return () => ++i })();
