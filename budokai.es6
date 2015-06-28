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

let save = (k,v) => localStorage.setItem(k,v)
let retrieve = k => localStorage.getItem(k)
let genid = (() => { let i = 0; return () => ++i })()

let encode = s => btoa(encodeURI(s))
let decode = s => decodeURI(atob(s))

function fromTemplate(selector) {
  let $template = document.querySelector(selector)
  let $fragment = document.importNode($template.content, true)
  return $fragment
}

function debounce(func, wait = 0) {
  let timeout
  return function(...args) {
    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

let m2f = Function.prototype.bind.bind(Function.prototype.call)
let forEach = m2f(Array.prototype.forEach)
let map = m2f(Array.prototype.map)
let filter = m2f(Array.prototype.filter)

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
  if (end < start) return [];
  else return range(start, end - 1).concat(end);
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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
// distribution of matches (round-robin).  Below 5 players, it's impossible to
// avoid playing two matches in a row.  Above, this seems to work.
function leagueFair(players) {
  var n = players.length;
  var m = n * (n - 1) / 2;               // number of matches
  var matchups = initArray(n, () => []); // Whether two players already met, and
                                         // which played home.
  var haveMet = (p1, p2) => matchups[p1][p2] != null;
  var numMatches = p => matchups[p].filter(m => m != null).length
  var homeMatches = p => matchups[p].filter(m => m === 1).length
  var bins = initArray(n, () => []);     // Sort players by number of matches
                                         // played
  var matches = [];                      // The list of matches to return

  bins[0] = range(0, n-1);

  var p1, p2;
  while (m > 0) {
    p1 = first();
    p2 = first(p => !haveMet(p1, p))
    // Give a chance for the other player to play home.
    // XXX: this does *not* ensure a fair distribution of home/away matches for
    // each player.  Does not work for N=5 at least, where a fair distribution
    // exists.
    if (homeMatches(p1) > homeMatches(p2))
      [p1, p2] = [p2, p1]
    matches.push(match.new(players[p1], players[p2]));
    matchups[p1][p2] =  1;
    matchups[p2][p1] = -1;
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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// View

let domToModel = new WeakMap()

var render = {
  events(es) {
    var $f = document.createDocumentFragment();
    es.forEach(e => { $f.appendChild(render.event(e)); });
    return $f;
  },

  event(e) {
    if (isLeague(e)) return render.league(e);
    else return render.tourney(e);
  },

  league(l) {
    let $fragment = fromTemplate('#template-league')
    let $l = $fragment.querySelector('.league')

    let $matches = $l.querySelector('.league-matches')
    l.forEach(m => { $matches.appendChild(render.match(m)) })

    let $scores = $l.querySelector('.league-scores tbody')
    scores(l).forEach(([k,v]) => {
      let $fragment = fromTemplate('#template-league-scores-row')
      let $name = $fragment.children[0].children[0]
      let $score = $fragment.children[0].children[1]
      $name.textContent = name(k)
      $score.textContent = v

      document.addEventListener('name-changed', event => {
        if (event.detail.player === k)
          $name.textContent = name(k)
      })

      $scores.appendChild($fragment)
    })

    document.addEventListener('winner-changed', event => {
      scores(l).forEach(([k,v], i) => {
        let $row = $scores.children[i]
        $row.children[0].textContent = name(k)
        $row.children[1].textContent = v
      })
    })

    return $l
  },

  tourney(t) {
    let $fragment = fromTemplate('#template-tourney')
    let $t = $fragment.querySelector('.tourney')

    let $matches = $t.querySelector('.tourney-matches')
    let $winnerLevel = $matches.children[0]
    t.forEach(l => {
      $matches.insertBefore(render.level(l), $winnerLevel) })

    let $winner = $winnerLevel.querySelector('.winner')
    let finale = last(t)[0]
    let winner = finale.winner
    $winner.textContent = name(winner)

    document.addEventListener('name-changed', event => {
      if (event.detail.player === winner)
        $winner.textContent = name(winner)
    })

    document.addEventListener('winner-changed', event => {
      if (event.detail.match === finale)
        $winner.textContent = name(winner)
    })

    return $t
  },

  level(l) {
    let $fragment = fromTemplate('#template-tourney-level')
    let $l = $fragment.children[0]
    l.forEach(m => {
      $l.appendChild(render.match(m)) })

    return $l
  },

  match(m) {
    let $fragment = fromTemplate('#template-match')
    let $m = $fragment.querySelector('.match')

    domToModel.set($m, m)

    if (m.p1 === m.p2)
      $m.classList.add('bye')

    ;[m.p1, m.p2].forEach((p, i) => {
      let player = i + 1
      let $button = $m.querySelector(`#radio-${player}`)
      $button.id = `radio-${genid()}`

      domToModel.set($button.parentNode, p)

      if (name(m.p1) == null || name(m.p2) == null)
        $button.setAttribute('disabled', true)

      let $label = $m.querySelector(`.player${player} label`)
      $label.textContent = name(p)
      $label.setAttribute('for', $button.id)

      document.addEventListener('winner-changed', event => {
        if (event.detail.match === m) {
          let winner = event.detail.winner
          $button.checked = winner === p
        } else {
          $label.textContent = name(p)

          if (name(m.p1) == null || name(m.p2) == null)
            $button.setAttribute('disabled', true)
          else
            $button.removeAttribute('disabled')
        }
      })

      document.addEventListener('name-changed', event => {
        if (event.detail.player === p)
          $label.textContent = name(p)
      })

      let $char = $m.querySelector(`.player${player} .char`)
      $char.value = retrieve(name(p))

      document.addEventListener('char-changed', event => {
        let charProp = `p${player}_char`
        if (event.detail.player === p) {
          if (event.detail.match === m)
            m[charProp] = event.detail.char
            else if (!m[charProp])
              $char.value = event.detail.char
        }
      })

      document.addEventListener('shuffle-players', event => {
        $label.textContent = name(p)
        $char.value = retrieve(name(p))
      })
    })

    return $m
  },

  saveLink(events) {
    let $div = document.querySelector('.budokai-data')

    let link = encode(serialize.all(events))
    let url = `mailto:?subject=[Budokai] Save me&body=${link}`

    let $p = $div.querySelector('.data')
    $p.textContent = link

    let $a = $div.querySelector('a')
    $a.setAttribute('href', encodeURI(url))
  },

  refreshPlayerList(n) {
    let $players = document.querySelector('#player-list')

    range(n).forEach(i => {
      let $node = $players.childNodes[i-1]
      if ($node == null) {
        let $fragment = fromTemplate('#template-player-name')
        let $div = $fragment.querySelector('.name-container')
        $div.id = `player-${i}`

        let $name = $div.querySelector('.name')
        $name.value = retrieve($div.id) || 'P' + i

        let $lock = $div.querySelector('.lock')
        $lock.id = `lock-${i}`

        let $label = $div.querySelector('label')
        $label.setAttribute('for', $lock.id)

        $players.appendChild($div)
      } else {
        $node.classList.remove('off')
      }
    })

    range(n+1, $players.childNodes.length).forEach(i => {
      let $node = $players.childNodes[i-1]
      $node.classList.add('off')
    })
  },

  refreshEvents(eventType) {
    let $players = filter(document.querySelectorAll('#player-list .name'),
                      $p => !$p.parentNode.classList.contains('off'))
    let players = []
    forEach($players, $p => {
      let p = {name: () => $p.value}
      players.push(p)
      domToModel.set($p, p)
    })

    let evs = events(players, eventType)

    let $list = document.querySelector('#match-list');
    $list.innerHTML = ''
    $list.appendChild(render.events(evs))
    domToModel.set(document, evs)
  },
}

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

function dispatch(eventName, detail = null) {
  document.dispatchEvent(new CustomEvent(eventName, {detail}))
}

document.addEventListener('DOMContentLoaded', () => {
  let $n = document.querySelector('#n-players')
  let $isTourney = document.querySelector('#event-type-tourney')
  let $isLeague = document.querySelector('#event-type-league')
  let $players = document.querySelector('#player-list')
  let $list = document.querySelector('#match-list');
  let $shuffle = document.querySelector('#shuffle-players')

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Custom events

  function playersChanged() {
    let n = parseInt($n.value, 10)
    dispatch('n-players-changed', n)
  }

  function eventTypeChanged() {
    let eventType = $isTourney.checked ? 'tourney' : 'league'
    dispatch('event-type-changed', eventType)
  }

  function nameChanged(playerId, player, name) {
    dispatch('name-changed', {playerId, player, name})
  }

  function shufflePlayers() {
    dispatch('shuffle-players')
  }

  function lockPlayer($name) {
    dispatch('lock-player', $name)
  }

  function winnerChanged(match, winner, $match) {
    dispatch('winner-changed', {match, winner, $match})
  }

  function charChanged(match, player, char) {
    dispatch('char-changed', {match, player, char})
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // DOM events -> custom events

  $n.addEventListener('input', debounce(playersChanged, 30))
  $isTourney.addEventListener('change', debounce(eventTypeChanged, 30))
  $isLeague.addEventListener('change', debounce(eventTypeChanged, 30))

  $players.addEventListener('input', debounce(event => {
    if (event.target.classList.contains('name')) {
      let playerId = event.target.parentNode.id
      let player = domToModel.get(event.target)
      let name = event.target.value
      nameChanged(playerId, player, name)
    }
  }, 100))

  $shuffle.addEventListener('click', debounce(shufflePlayers, 30))

  $players.addEventListener('click', debounce(event => {
    if (event.target.classList.contains('lock')) {
      let $name = event.target.parentNode.querySelector('.name')
      lockPlayer($name)
    }
  }, 30))

  $list.addEventListener('change', debounce(event => {
    if (event.target.classList.contains('winner-select')) {
      let $player = event.target.parentNode
      let $match = $player.parentNode.parentNode
      let winner = domToModel.get($player)
      let match = domToModel.get($match)
      winnerChanged(match, winner, $match)
    }
  }, 30))

  $list.addEventListener('input', debounce(event => {
    if (event.target.classList.contains('char')) {
      let $player = event.target.parentNode
      let $match = $player.parentNode.parentNode
      let player = domToModel.get($player)
      let match = domToModel.get($match)
      let char = event.target.value
      charChanged(match, player, char)
    }
  }, 100))

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Handling custom events

  document.addEventListener('n-players-changed', event => {
    render.refreshPlayerList(event.detail)
    render.refreshEvents($isTourney.checked ? 'tourney' : 'league')

    render.saveLink(domToModel.get(document))
  })

  document.addEventListener('event-type-changed', event => {
    render.refreshEvents(event.detail)

    render.saveLink(domToModel.get(document))
  })

  document.addEventListener('name-changed', event => {
    save(event.detail.playerId, event.detail.name)

    render.saveLink(domToModel.get(document))
  })

  document.addEventListener('shuffle-players', () => {
    let $unlockedNames = filter(
      $players.querySelectorAll('input.name'),
      $p => !$p.parentNode.classList.contains('off')
        && !$p.classList.contains('locked'))
    let names = map($unlockedNames, $i => $i.value)
    names = shuffle(names)
    forEach($unlockedNames, ($n,i) => {$n.value = names[i]})
  })

  document.addEventListener('lock-player', event => {
    let $name = event.detail
    $name.classList.toggle('locked')
    $name.disabled = !$name.disabled
  })

  document.addEventListener('winner-changed', event => {
    let {match, $match, winner} = event.detail
    match.winner = winner

    match.p1_char = $match.querySelector('.player1 .char').value
    match.p2_char = $match.querySelector('.player2 .char').value

    render.saveLink(domToModel.get(document))
  })

  document.addEventListener('char-changed', event => {
    let {player, char} = event.detail
    save(name(player), char)

    render.saveLink(domToModel.get(document))
  })

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Build the page with default values

  playersChanged()
  eventTypeChanged()
})
