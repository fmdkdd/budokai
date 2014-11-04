// Tournament helper
// 1. Ask for number of participants
// 2. Show the form of the tournament with numbers
// 3. Can assign names to numbers
// 4. Can shuffle participants
// 5. Gives list of matches to play
// 6. Can change winner of match at will

// TODO: static views for posterity

function events(players) {
  var n = players.length;

  if (n === 3) {
    return [league(players)];
  }

  else if (n === 4 || n === 8)
    return [tourney(players)];

  else if (n === 5) {
    var [g1, g2] = split(players, [3,2]);
    var l = league(g1);
    var w = best(2, l);
    return [l, tourney([w[0]].concat(g2).concat(w[1]))];
  }

  else if (n === 6) {
    var [g1, g2] = split(players, [3,3]);
    var l1 = league(g1);
    var l2 = league(g2);
    var w1 = best(2, l1);
    var w2 = best(2, l2);
    return [l1, l2, tourney([w1[0], w2[0], w1[1], w2[1]])];
  }

  else if (n === 7) {
    var [g1, g2] = split(players, [6,1]);
    var l = pairs(g1);
    var w = winners(l);
    return [l, tourney(w.concat(g2))];
  }

  else if (n === 9) {
    var [g1, g2] = split(players, [3,6]);
    var l = league(g1);
    var w = best(2, l);
    return [l, tourney([w[0]].concat(g2).concat(w[1]))];
  }

  else
    throw "Don't know how to organize such an event";
}

var match = {
  new: function(p1, p2) {
    return {
      __proto__: this,
      p1, p2,
    };
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
  if (typeof player === 'function') return name(player());
  else return player;
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
  return range(n-1, 0).map(i => bestNth(i));

  // XXX: sorting and computing the scores each time is far from
  // optimal, but we are dealing with very small numbers here.
  function bestNth(n) {
    return function() {
      // Convert to array for sorting
      var scores_array = [];
      scores(matches, scoring)
        .forEach((v,k) => { scores_array.push([k,v]) });
      scores_array.sort(([k1,v1], [k2,v2]) => v2 - v1);

      var best_player = scores_array[n][0];
      return best_player;
    }
  }
}

// Return a Map of (unsorted) scores for the given matches and a
// scoring function.  The scoring function takes a player and
// match, and returns the player's score as a number.
function scores(matches, scoring) {
  if (scoring == null) scoring = defaultScoring;

  var scores = new Map();       // Map supports function keys

  matches.forEach(m => {
    [m.p1, m.p2].forEach(p => {
      var s = scores.get(p) || 0;
      scores.set(p, s + scoring(p, m));
    });
  });

  return scores;
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

// Return a list of levels, where each level is a list of matches
// between players in the tourney.  Finale is the last level.
function tourney(players) {
  if (players.length === 2)
    return [[match.new(players[0], players[1])]];
  if (players.length % 2 === 1)
    throw "Tourney with odd number of players";

  var matches = pairs(players);
  return [matches].concat(tourney(winners(matches)));
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

// Return [start, ..., end], where start defaults to 1
function range(end, start) {
  if (start == null) start = 1;
  if (end < start) return [];
  else return range(end - 1, start).concat(end);
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
  players_list : ["Abel", "Adon", "Akuma", "Balrog", "Blanka", "C Viper", "Cammy", "Chun Li", 
      "Cody", "Dan", "Decapre", "Dee Jay", "Dhalsim", "Dudley", "E Honda", "El Fuerte", "Elena", 
      "Evil Ryu", "Fei Long", "Gen", "Gouken", "Guile", "Guy", "Hakan", "Hugo", "Ibuki", "Juri", "Ken", 
      "M Bison", "Makoto", "Oni", "Poison", "Rolento", "Rose", "Rufus", "Ryu", "Sagat", "Sakura", "Seth", 
      "T Hawk", "Vega", "Yang", "Yun", "Zangief"],

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
    var $f = document.createDocumentFragment();

    var $matches = document.createElement('ol');
    l.forEach(m => { $matches.appendChild(render.match(m)); });
    $f.appendChild($matches);

    var $scores = document.createElement('table');
    scores(l).forEach((v,k) => {
      var $s = document.createElement('tr');

      var $name = document.createElement('td');
      $name.textContent = name(k);
      $s.appendChild($name);

      var $points = document.createElement('td');
      $points.textContent = v;
      $s.appendChild($points);

      $scores.appendChild($s);
    });

    $f.appendChild($scores);

    return $f;
  },

  tourney: function(t) {
    var $f = document.createElement('div');

    var $header = document.createElement('h2');
    $header.textContent = 'Tourney';
    $f.appendChild($header);

    var $t = document.createElement('ol');
    t.forEach(l => { $t.appendChild(render.level(l)); });
    $f.appendChild($t);

    return $f;
  },

  level: function(l) {

    var $f = document.createElement('li');
    $f.appendChild(render.matches(l));
    return $f;
  },

  matches: function(ms) {
    var $f = document.createElement('ol');
    ms.forEach(m => { $f.appendChild(render.match(m)); });
    return $f;
  },

  match: function(m) {
    var $f = document.createElement('li');

    var $p1 = render.player(m.p1, m);
    $f.appendChild($p1);

    var $ch1 = document.createElement('select');
    this.populate_sf4_list($ch1);
    $f.appendChild($ch1);

    var $p2 = render.player(m.p2, m);
    $f.appendChild($p2);

    var $ch2 = document.createElement('select');
    this.populate_sf4_list($ch2);
    $f.appendChild($ch2);

    var $reset = document.createElement('button');
    $reset.textContent = 'X';
    $reset.addEventListener('click', () => { m.winner = null; });
    $f.appendChild($reset);

    return $f;
  },

  populate_sf4_list: function(p) {
    $lng = this.players_list.length;
    for (var i = 0; i < $lng; i++) {
      var $option = document.createElement("option");
      $option.text = this.players_list[i];
      p.options.add($option);
    };
    
  },

  player: function(p, m) {
    var $f = document.createDocumentFragment();

    var $button = document.createElement('input');
    $button.setAttribute('type', 'radio');

    $button.addEventListener('click', () => { m.winner = p; });
    if (p === m.winner())
      $button.setAttribute('checked', true);
    if (name(m.p1) == null || name(m.p2) == null)
      $button.setAttribute('disabled', true);
    $f.appendChild($button);

    var $label = document.createElement('label');
    $label.textContent = name(p) || 'tbd';
    $f.appendChild($label);

    return $f;
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
  },
};

document.addEventListener('DOMContentLoaded', () => {
  var $players = document.querySelector('#player-list');
  var $list = document.querySelector('#match-list');
  var $n = document.querySelector('#n-players');

  var v = view.new($list);

  $n.addEventListener('input', () => {
    var n = parseInt($n.value, 10);
    var $f = document.createDocumentFragment();
    var players = [];

    range(n).forEach(i => {
      var $name = document.createElement('input');
      $name.setAttribute('type', 'text');
      $name.value = 'P' + i;
      $f.appendChild($name);
      players.push(() => $name.value);
    });

    $players.innerHTML = '';
    $players.appendChild($f);

    v.events = events(players);
    v.refresh();
  });

  $players.addEventListener('input', () => { v.refresh(); });

  $list.addEventListener('click', () => {
    v.refresh();
  });

  var $shuffle = document.querySelector('#shuffle-players');
  $shuffle.addEventListener('click', () => {
    var $names = $players.querySelectorAll('input');
    var names = [].map.call($names, $i => $i.value);
    names = shuffle(names);
    [].forEach.call($names, ($n,i) => { $n.value = names[i]; });
    v.refresh();
  });
});
