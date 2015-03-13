var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

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

function events(players) {
  var n = players.length;

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

    var l = shuffle(league(g1));
    var w = best(2, l);
    return [l, tourney(mix([w, g2]))];
  } else return [tourney(players)];
}

var match = {
  new: function (p1, p2) {
    var m = {
      __proto__: this,
      p1: p1, p2: p2 };

    // Match is a bye
    if (p1 === p2) m.winner = p1;

    return m;
  },

  get winner() {
    var _this = this;

    return function () {
      return _this.win;
    };
  },
  set winner(p) {
    if (p === "p1") this.win = this.p1;else if (p === "p2") this.win = this.p2;else if (p === this.p1 || p === this.p2 || p == null) this.win = p;else throw "Winner should be p1, p2 or null";
  },

  get loser() {
    var _this = this;

    return function () {
      if (_this.win == null) return undefined;else return _this.win === _this.p1 ? _this.p2 : _this.p1;
    };
  } };

// Return the name of a player
function name(player) {
  if (player == null) return player;
  if (typeof player === "function") return name(player());
  if (typeof player === "object") return name(player.name);
  return player;
}

function last_char(player) {
  if (player == null) return player;
  if (typeof player === "function") return last_char(player());
  if (typeof player === "object") return last_char(player.last_char);
  return player;
}

function set_last_char(player, last_char) {
  if (player == null) return;
  if (typeof player === "function") return set_last_char(player(), last_char);
  if (typeof player === "object") {
    save(name(player), last_char);
    player.last_char = last_char;
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
  return range(n - 1, 0).map(function (i) {
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
      scores_array.sort(function (_ref, _ref3) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k1 = _ref2[0];
        var v1 = _ref2[1];

        var _ref32 = _slicedToArray(_ref3, 2);

        var k2 = _ref32[0];
        var v2 = _ref32[1];
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
  sorted_scores.sort(function (_ref, _ref3) {
    var _ref2 = _slicedToArray(_ref, 2);

    var k1 = _ref2[0];
    var v1 = _ref2[1];

    var _ref32 = _slicedToArray(_ref3, 2);

    var k2 = _ref32[0];
    var v2 = _ref32[1];
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
  if (players.length === 2) return [match.new(players[0], players[1])];

  var p1 = players[0];
  var rest = players.slice(1);

  var matches = rest.map(function (p2) {
    return match.new(p1, p2);
  });
  return matches.concat(league(rest));
}

function isLeague(event) {
  // If it contains matches at first level, it's a league
  return !!event[0].p1;
}

// Return a list of levels, where each level is a list of matches
// between players in the tourney.  Finale is the last level.
function tourney(players) {
  if (players.length === 2) return [[match.new(players[0], players[1])]];

  var n = Math.pow(2, Math.floor(Math.log(players.length) / Math.LN2));
  var m = players.length - n;
  if (m > 0) {
    var _split = split(players, [m * 2]);

    var _split2 = _slicedToArray(_split, 2);

    var now = _split2[0];
    var up = _split2[1];

    var elim = pairs(now);
    var byes = up.map(function (p) {
      return match.new(p, p);
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
  if (players.length % 2 === 1) throw "Can't pair odd number of players";

  var matches = [];
  for (var i = 0; i < players.length; i += 2) {
    var m = match.new(players[i], players[i + 1]);
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

// Return [start, ..., end], where start defaults to 1
function range(end, start) {
  if (start == null) start = 1;
  if (end < start) return [];else return range(end - 1, start).concat(end);
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

function shuffle(array) {
  var r = function () {
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// View

var render = {
  events: function (es) {
    var $f = document.createDocumentFragment();
    es.forEach(function (e) {
      $f.appendChild(render.event(e));
    });
    return $f;
  },

  event: function (e) {
    if (isLeague(e)) return render.league(e);else return render.tourney(e);
  },

  league: function (l) {
    var $f = document.createElement("div");
    $f.classList.add("league");

    var $header = document.createElement("h3");
    $header.textContent = "League";
    $f.appendChild($header);

    var $div = document.createElement("div");
    $div.classList.add("league-content");

    var $matches = document.createElement("ol");
    $matches.classList.add("league-matches");
    l.forEach(function (m) {
      $matches.appendChild(render.match(m));
    });
    $div.appendChild($matches);

    var $scores = document.createElement("table");
    $scores.classList.add("league-scores");
    var $scores_head = document.createElement("tr");

    var $th_player = document.createElement("th");
    $th_player.textContent = "Player";
    $scores_head.appendChild($th_player);

    var $th_score = document.createElement("th");
    $th_score.textContent = "Score";
    $scores_head.appendChild($th_score);

    $scores.appendChild($scores_head);

    scores(l).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var k = _ref2[0];
      var v = _ref2[1];

      var $s = document.createElement("tr");

      var $name = document.createElement("td");
      $name.textContent = name(k);
      $s.appendChild($name);

      var $points = document.createElement("td");
      $points.textContent = v;
      $s.appendChild($points);

      $scores.appendChild($s);
    });

    $div.appendChild($scores);

    $f.appendChild($div);

    return $f;
  },

  tourney: function (t) {
    var $f = document.createElement("div");
    $f.classList.add("tourney");

    var $header = document.createElement("h3");
    $header.textContent = "Tourney";
    $f.appendChild($header);

    var $t = document.createElement("div");
    $t.classList.add("tourney-matches");
    t.forEach(function (l) {
      $t.appendChild(render.level(l));
    });
    $f.appendChild($t);

    var $winnerLevel = document.createElement("ol");
    $winnerLevel.classList.add("level");

    var $winner = document.createElement("span");
    $winner.classList.add("player-name");
    $winner.classList.add("winner");
    $winner.textContent = name(last(t)[0].winner);
    $winnerLevel.appendChild($winner);

    $t.appendChild($winnerLevel);

    return $f;
  },

  level: function (l) {
    var $f = document.createDocumentFragment();
    $f.appendChild(render.matches(l));
    return $f;
  },

  matches: function (ms) {
    var $f = document.createElement("ol");
    $f.classList.add("level");
    ms.forEach(function (m) {
      $f.appendChild(render.match(m));
    });
    return $f;
  },

  match: function (m) {
    var $f = document.createElement("li");
    $f.classList.add("match");
    if (m.p1 === m.p2) $f.classList.add("bye");

    var $player1 = document.createElement("div");
    $player1.classList.add("player1");
    $f.appendChild($player1);

    var $p1 = render.player(m.p1, m);
    $player1.appendChild($p1);

    var $char_p1 = render.chars_list(m.p1, m.p1_char);
    $char_p1.addEventListener("change", function (event) {
      m.p1_char = event.target.value;
      set_last_char(m.p1, m.p1_char);
    });
    $p1.appendChild($char_p1);
    $p1.addEventListener("click", saveChars);

    var $player2 = document.createElement("div");
    $player2.classList.add("player2");
    $f.appendChild($player2);

    var $p2 = render.player(m.p2, m);
    $player2.appendChild($p2);

    var $char_p2 = render.chars_list(m.p2, m.p2_char);
    $char_p2.addEventListener("change", function (event) {
      m.p2_char = event.target.value;
      set_last_char(m.p2, m.p2_char);
    });
    $p2.appendChild($char_p2);
    $p2.addEventListener("click", saveChars);

    var $reset = document.createElement("button");
    $reset.classList.add("reset-match");
    $reset.textContent = "X";
    $reset.addEventListener("click", function () {
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

  chars_list: function (p, p_char) {
    var $p = document.createElement("input");
    $p.classList.add("char");
    $p.type = "text";
    $p.placeholder = "Dan";
    $p.setAttribute("list", "all-chars");
    var ch = p_char || last_char(p) || retrieve(name(p));
    if (ch != null) $p.value = ch;

    return $p;
  },

  player: function (p, m) {
    var $f = document.createElement("div");
    $f.classList.add("player-info");

    var $button = document.createElement("input");
    $button.id = "radio-" + genid();
    $button.setAttribute("type", "radio");

    $button.addEventListener("click", function () {
      m.winner = p;
    });
    if (p === m.winner()) $button.setAttribute("checked", true);
    if (name(m.p1) == null || name(m.p2) == null) $button.setAttribute("disabled", true);
    $f.appendChild($button);

    var $label = document.createElement("label");
    $label.classList.add("player-name");
    $label.textContent = name(p);
    $label.setAttribute("for", $button.id);
    $f.appendChild($label);

    return $f;
  },

  saveLink: function (events) {
    var $div = document.createElement("div");
    $div.classList.add("budokai-data");

    var link = encode(serialize.all(events));

    var $p = document.createElement("p");
    $p.classList.add("data");
    $p.textContent = link;
    $div.appendChild($p);

    var $a = document.createElement("a");
    $a.setAttribute("href", encodeURI("mailto:?subject=[Budokai] Save me&body=" + link));
    $a.textContent = "post";
    $div.appendChild($a);

    return $div;
  } };

var view = {
  new: function ($root, events) {
    return {
      __proto__: this,
      $root: $root, events: events };
  },

  refresh: function () {
    this.$root.innerHTML = "";
    this.$root.appendChild(render.events(this.events));
    this.$root.appendChild(render.saveLink(this.events));
  } };

var serialize = {
  all: function (events) {
    var ev = [];

    events.forEach(function (e) {
      if (isLeague(e)) ev.push(serialize.league(e));else ev.push(serialize.tourney(e));
    });

    var m = {
      version: 1,
      date: new Date().toISOString().split("T")[0],
      events: ev
    };

    return JSON.stringify(m);
  },

  league: function (l) {
    return l.map(function (m) {
      return serialize.match(m);
    });
  },

  tourney: function (t) {
    var matches = [];
    t.forEach(function (bracket) {
      return bracket.forEach(function (m) {
        if (m.p1 !== m.p2) matches.push(serialize.match(m));
      });
    });
    return matches;
  },

  match: function (m) {
    var winner;
    if (m.p1 === m.winner()) winner = "p1";else if (m.winner() === m.p2) winner = "p2";

    return {
      p1: { name: name(m.p1),
        char: m.p1_char },
      p2: { name: name(m.p2),
        char: m.p2_char },
      winner: winner };
  } };

var encode = function (s) {
  return btoa(encodeURI(s));
};
var decode = function (s) {
  return decodeURI(atob(s));
};

document.addEventListener("DOMContentLoaded", function () {
  var $players = document.querySelector("#player-list");
  var $list = document.querySelector("#match-list");
  var $n = document.querySelector("#n-players");

  var v = view.new($list);

  $n.addEventListener("input", function () {
    var n = parseInt($n.value, 10);
    var players = [];

    range(n).forEach(function (i) {
      if ($players.childNodes[i] == null) {
        var $div = document.createElement("div");
        $div.id = "player-" + i;
        $div.classList.add("name-container");

        var $name = document.createElement("input");
        $name.classList.add("name");
        $name.setAttribute("type", "text");
        $name.value = retrieve($div.id) || "P" + i;
        $div.appendChild($name);

        var $lock = document.createElement("input");
        $lock.id = "lock-" + i;
        $lock.classList.add("lock");
        $lock.setAttribute("type", "checkbox");
        $lock.addEventListener("click", function () {
          $name.classList.toggle("locked");
          $name.disabled = !$name.disabled;
        });
        $div.appendChild($lock);

        var $label = document.createElement("label");
        $label.setAttribute("for", $lock.id);
        $label.innerHTML = "<i class=\"fa fa-unlock\"></i><i class=\"fa fa-lock\"></i>";
        $div.appendChild($label);

        $players.appendChild($div);
      } else {
        $players.childNodes[i].classList.remove("off");
        var $name = $players.querySelector("#player-" + i + " .name");
      }
      players.push({ name: function () {
          return $name.value;
        } });
    });

    range($players.childNodes.length - 1, n + 1).forEach(function (i) {
      $players.childNodes[i].classList.add("off");
    });

    v.events = events(players);
    v.refresh();
  });

  $n.dispatchEvent(new Event("input"));

  $players.addEventListener("input", function (event) {
    if (event.target.classList.contains("name")) {
      save(event.target.parentNode.id, event.target.value);
      v.refresh();
    }
  });

  $list.addEventListener("change", function (event) {
    // Need the setTimeout to let the event bubble and be caught by
    // other listeners before recreating the view
    setTimeout(function () {
      v.refresh();
    }, 0);
  });

  var $shuffle = document.querySelector("#shuffle-players");
  $shuffle.addEventListener("click", function () {
    var $names = [].filter.call($players.querySelectorAll("input.name"), function ($p) {
      return !$p.parentNode.classList.contains("off") && !$p.classList.contains("locked");
    });
    var names = [].map.call($names, function ($i) {
      return $i.value;
    });
    names = shuffle(names);
    [].forEach.call($names, function ($n, i) {
      $n.value = names[i];
    });
    v.refresh();
  });
});

var save = function (k, v) {
  return localStorage.setItem(k, v);
};
var retrieve = function (k) {
  return localStorage.getItem(k);
};
var genid = (function () {
  var i = 0;return function () {
    return ++i;
  };
})();

//# sourceMappingURL=data:application/json;base64,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QUcsVUFBQSxDQUFDO1NBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FBQSxDQUFDO0FBQzVDLElBQUksS0FBSyxHQUFHLENBQUMsWUFBTTtBQUFFLE1BQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxBQUFDLE9BQU87V0FBTSxFQUFFLENBQUM7R0FBQSxDQUFBO0NBQUUsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoiYnVkb2thaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRvdXJuYW1lbnQgaGVscGVyXG4vLyAxLiBBc2sgZm9yIG51bWJlciBvZiBwYXJ0aWNpcGFudHNcbi8vIDIuIFNob3cgdGhlIGZvcm0gb2YgdGhlIHRvdXJuYW1lbnQgd2l0aCBudW1iZXJzXG4vLyAzLiBDYW4gYXNzaWduIG5hbWVzIHRvIG51bWJlcnNcbi8vIDQuIENhbiBzaHVmZmxlIHBhcnRpY2lwYW50c1xuLy8gNS4gR2l2ZXMgbGlzdCBvZiBtYXRjaGVzIHRvIHBsYXlcbi8vIDYuIENhbiBjaGFuZ2Ugd2lubmVyIG9mIG1hdGNoIGF0IHdpbGxcblxuLy8gVE9ETzogc3RhdGljIHZpZXdzIGZvciBwb3N0ZXJpdHlcbi8vIFRPRE86IGRpZmZlcmVudCBvcHRpb25zIChpbiBudW1iZXIgb2YgbWF0Y2hlcykgd2hlcmUgaXQgbWFrZXMgc2Vuc2Vcbi8vIFRPRE86IGxvc2VycyBicmFja2V0IGFzIGFuIG9wdGlvblxuXG5mdW5jdGlvbiBldmVudHMocGxheWVycykge1xuICB2YXIgbiA9IHBsYXllcnMubGVuZ3RoO1xuXG4gIGlmIChuID09PSAzKSB7XG4gICAgcmV0dXJuIFtzaHVmZmxlKGxlYWd1ZShwbGF5ZXJzKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gNCB8fCBuID09PSA4KVxuICAgIHJldHVybiBbdG91cm5leShwbGF5ZXJzKV07XG5cbiAgZWxzZSBpZiAobiA9PT0gNSkge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFszLDJdKTtcbiAgICB2YXIgbCA9IHNodWZmbGUobGVhZ3VlKGcxKSk7XG4gICAgdmFyIHcgPSBiZXN0KDIsIGwpO1xuICAgIHJldHVybiBbbCwgdG91cm5leShtaXgoW3csIGcyXSkpXTtcbiAgfVxuXG4gIGVsc2UgaWYgKG4gPT09IDYpIHtcbiAgICB2YXIgW2cxLCBnMl0gPSBzcGxpdChwbGF5ZXJzLCBbMywzXSk7XG4gICAgdmFyIGwxID0gc2h1ZmZsZShsZWFndWUoZzEpKTtcbiAgICB2YXIgbDIgPSBzaHVmZmxlKGxlYWd1ZShnMikpO1xuICAgIHZhciB3MSA9IGJlc3QoMiwgbDEpO1xuICAgIHZhciB3MiA9IGJlc3QoMiwgbDIpO1xuICAgIHJldHVybiBbbDEsIGwyLCB0b3VybmV5KG1peChbdzEsIHcyXSkpXTtcbiAgfVxuXG4gIGVsc2UgaWYgKG4gPT09IDcpIHtcbiAgICByZXR1cm4gW3RvdXJuZXkocGxheWVycy5jb25jYXQobGFzdChwbGF5ZXJzKSkpXTtcbiAgfVxuXG4gIGVsc2UgaWYgKG4gPT09IDkpIHtcbiAgICB2YXIgW2cxLCBnMl0gPSBzcGxpdChwbGF5ZXJzLCBbMyw2XSk7XG4gICAgdmFyIGwgPSBzaHVmZmxlKGxlYWd1ZShnMSkpO1xuICAgIHZhciB3ID0gYmVzdCgyLCBsKTtcbiAgICByZXR1cm4gW2wsIHRvdXJuZXkobWl4KFt3LCBnMl0pKV07XG4gIH1cblxuICBlbHNlIGlmIChuID09PSAxMCkge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFs0LDZdKTtcbiAgICB2YXIgbCA9IHNodWZmbGUobGVhZ3VlKGcxKSk7XG4gICAgdmFyIHcgPSBiZXN0KDIsIGwpO1xuICAgIHJldHVybiBbbCwgdG91cm5leShtaXgoW3csIGcyXSkpXTtcbiAgfVxuXG4gIGVsc2VcbiAgICByZXR1cm4gW3RvdXJuZXkocGxheWVycyldO1xufVxuXG52YXIgbWF0Y2ggPSB7XG4gIG5ldzogZnVuY3Rpb24ocDEsIHAyKSB7XG4gICAgdmFyIG0gPSB7XG4gICAgICBfX3Byb3RvX186IHRoaXMsXG4gICAgICBwMSwgcDIsXG4gICAgfTtcblxuICAgIC8vIE1hdGNoIGlzIGEgYnllXG4gICAgaWYgKHAxID09PSBwMilcbiAgICAgIG0ud2lubmVyID0gcDE7XG5cbiAgICByZXR1cm4gbTtcbiAgfSxcblxuICBnZXQgd2lubmVyKCkgeyByZXR1cm4gKCkgPT4gdGhpcy53aW4gfSxcbiAgc2V0IHdpbm5lcihwKSB7XG4gICAgaWYgKHAgPT09ICdwMScpIHRoaXMud2luID0gdGhpcy5wMTtcbiAgICBlbHNlIGlmIChwID09PSAncDInKSB0aGlzLndpbiA9IHRoaXMucDI7XG4gICAgZWxzZSBpZiAocCA9PT0gdGhpcy5wMSB8fCBwID09PSB0aGlzLnAyIHx8IHAgPT0gbnVsbClcbiAgICAgIHRoaXMud2luID0gcDtcbiAgICBlbHNlIHRocm93IFwiV2lubmVyIHNob3VsZCBiZSBwMSwgcDIgb3IgbnVsbFwiO1xuICB9LFxuXG4gIGdldCBsb3NlcigpIHsgcmV0dXJuICgpID0+IHtcbiAgICBpZih0aGlzLndpbiA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGVsc2UgcmV0dXJuIHRoaXMud2luID09PSB0aGlzLnAxID8gdGhpcy5wMiA6IHRoaXMucDE7XG4gIH19LFxufTtcblxuLy8gUmV0dXJuIHRoZSBuYW1lIG9mIGEgcGxheWVyXG5mdW5jdGlvbiBuYW1lKHBsYXllcikge1xuICBpZiAocGxheWVyID09IG51bGwpIHJldHVybiBwbGF5ZXI7XG4gIGlmICh0eXBlb2YgcGxheWVyID09PSAnZnVuY3Rpb24nKSByZXR1cm4gbmFtZShwbGF5ZXIoKSk7XG4gIGlmICh0eXBlb2YgcGxheWVyID09PSAnb2JqZWN0JykgcmV0dXJuIG5hbWUocGxheWVyLm5hbWUpO1xuICByZXR1cm4gcGxheWVyO1xufVxuXG5mdW5jdGlvbiBsYXN0X2NoYXIocGxheWVyKSB7XG4gIGlmIChwbGF5ZXIgPT0gbnVsbCkgcmV0dXJuIHBsYXllcjtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdmdW5jdGlvbicpIHJldHVybiBsYXN0X2NoYXIocGxheWVyKCkpO1xuICBpZiAodHlwZW9mIHBsYXllciA9PT0gJ29iamVjdCcpIHJldHVybiBsYXN0X2NoYXIocGxheWVyLmxhc3RfY2hhcik7XG4gIHJldHVybiBwbGF5ZXI7XG59XG5cbmZ1bmN0aW9uIHNldF9sYXN0X2NoYXIocGxheWVyLCBsYXN0X2NoYXIpIHtcbiAgaWYgKHBsYXllciA9PSBudWxsKSByZXR1cm47XG4gIGlmICh0eXBlb2YgcGxheWVyID09PSAnZnVuY3Rpb24nKSByZXR1cm4gc2V0X2xhc3RfY2hhcihwbGF5ZXIoKSwgbGFzdF9jaGFyKTtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdvYmplY3QnKSB7XG4gICAgc2F2ZShuYW1lKHBsYXllciksIGxhc3RfY2hhcik7XG4gICAgcGxheWVyLmxhc3RfY2hhciA9IGxhc3RfY2hhcjtcbiAgfVxufVxuXG5cbi8vIFJldHVybiB0aGUgbGlzdCBvZiB3aW5uZXJzIGZyb20gYSBsaXN0IG9mIG1hdGNoZXMuXG5mdW5jdGlvbiB3aW5uZXJzKG1hdGNoZXMpIHtcbiAgcmV0dXJuIG1hdGNoZXMubWFwKG0gPT4gbS53aW5uZXIpO1xufVxuXG5mdW5jdGlvbiBsb3NlcnMobWF0Y2hlcykge1xuICByZXR1cm4gbWF0Y2hlcy5tYXAobSA9PiBtLmxvc2VyKTtcbn1cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIHRoZSBuIGJlc3QgcGxheWVycywgZGVwZW5kaW5nIG9uIGEgc2NvcmluZ1xuLy8gZnVuY3Rpb24gZm9yIGVhY2ggbWF0Y2guICBUaGUgc2NvcmluZyBmdW5jdGlvbiB0YWtlcyBhIHBsYXllciBhbmRcbi8vIG1hdGNoLCBhbmQgcmV0dXJucyB0aGUgcGxheWVyJ3Mgc2NvcmUgYXMgYSBudW1iZXIuXG5mdW5jdGlvbiBiZXN0KG4sIG1hdGNoZXMsIHNjb3JpbmcpIHtcbiAgcmV0dXJuIHJhbmdlKG4tMSwgMCkubWFwKGkgPT4gYmVzdE50aChpKSk7XG5cbiAgLy8gWFhYOiBzb3J0aW5nIGFuZCBjb21wdXRpbmcgdGhlIHNjb3JlcyBlYWNoIHRpbWUgaXMgZmFyIGZyb21cbiAgLy8gb3B0aW1hbCwgYnV0IHdlIGFyZSBkZWFsaW5nIHdpdGggdmVyeSBzbWFsbCBudW1iZXJzIGhlcmUuXG4gIGZ1bmN0aW9uIGJlc3ROdGgobikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIENvbnZlcnQgdG8gYXJyYXkgZm9yIHNvcnRpbmdcbiAgICAgIHZhciBzY29yZXNfYXJyYXkgPSBbXTtcbiAgICAgIHNjb3JlcyhtYXRjaGVzLCBzY29yaW5nKVxuICAgICAgICAuZm9yRWFjaCgoW2ssdl0pID0+IHsgc2NvcmVzX2FycmF5LnB1c2goW2ssdl0pIH0pO1xuICAgICAgc2NvcmVzX2FycmF5LnNvcnQoKFtrMSx2MV0sIFtrMix2Ml0pID0+IHYyIC0gdjEpO1xuXG4gICAgICB2YXIgYmVzdCA9IHNjb3Jlc19hcnJheVtuXTtcbiAgICAgIGlmIChiZXN0WzFdID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgZWxzZSByZXR1cm4gYmVzdFswXTtcbiAgICB9XG4gIH1cbn1cblxuLy8gUmV0dXJuIGEgTWFwIG9mIChzb3J0ZWQpIHNjb3JlcyBmb3IgdGhlIGdpdmVuIG1hdGNoZXMgYW5kIGEgc2NvcmluZ1xuLy8gZnVuY3Rpb24uICBUaGUgc2NvcmluZyBmdW5jdGlvbiB0YWtlcyBhIHBsYXllciBhbmQgbWF0Y2gsIGFuZFxuLy8gcmV0dXJucyB0aGUgcGxheWVyJ3Mgc2NvcmUgYXMgYSBudW1iZXIuXG5mdW5jdGlvbiBzY29yZXMobWF0Y2hlcywgc2NvcmluZykge1xuICBpZiAoc2NvcmluZyA9PSBudWxsKSBzY29yaW5nID0gZGVmYXVsdFNjb3Jpbmc7XG5cbiAgdmFyIHNjb3JlcyA9IG5ldyBNYXAoKTsgICAgICAgLy8gTWFwIHN1cHBvcnRzIGZ1bmN0aW9uIGtleXNcblxuICBtYXRjaGVzLmZvckVhY2gobSA9PiB7XG4gICAgW20ucDEsIG0ucDJdLmZvckVhY2gocCA9PiB7XG4gICAgICB2YXIgcyA9IHNjb3Jlcy5nZXQocCkgfHwgMDtcbiAgICAgIHNjb3Jlcy5zZXQocCwgcyArIHNjb3JpbmcocCwgbSkpO1xuICAgIH0pO1xuICB9KTtcblxuICB2YXIgc29ydGVkX3Njb3JlcyA9IFsuLi5zY29yZXNdO1xuICBzb3J0ZWRfc2NvcmVzLnNvcnQoKFtrMSx2MV0sW2syLHYyXSkgPT4gdjIgLSB2MSk7XG5cbiAgcmV0dXJuIHNvcnRlZF9zY29yZXM7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRTY29yaW5nKHBsYXllciwgbWF0Y2gpIHtcbiAgaWYgKHBsYXllciA9PT0gbWF0Y2gud2lubmVyKCkpIHJldHVybiAxO1xuICBlbHNlIHJldHVybiAwO1xufVxuXG4vLyBSZXR1cm4gdGhlIGxpc3Qgb2YgbWF0Y2hlcyBiZXR3ZWVuIHBsYXllcnMsIHdoZXJlIGVhY2ggcGxheWVyIGdldHNcbi8vIHRvIG1lZXQgYWxsIHRoZSBvdGhlciBwbGF5ZXJzIG9uY2UuXG5mdW5jdGlvbiBsZWFndWUocGxheWVycykge1xuICBpZiAocGxheWVycy5sZW5ndGggPT09IDIpXG4gICAgcmV0dXJuIFttYXRjaC5uZXcocGxheWVyc1swXSwgcGxheWVyc1sxXSldO1xuXG4gIHZhciBwMSA9IHBsYXllcnNbMF07XG4gIHZhciByZXN0ID0gcGxheWVycy5zbGljZSgxKTtcblxuICB2YXIgbWF0Y2hlcyA9IHJlc3QubWFwKHAyID0+IG1hdGNoLm5ldyhwMSwgcDIpKTtcbiAgcmV0dXJuIG1hdGNoZXMuY29uY2F0KGxlYWd1ZShyZXN0KSk7XG59XG5cbmZ1bmN0aW9uIGlzTGVhZ3VlKGV2ZW50KSB7XG4gIC8vIElmIGl0IGNvbnRhaW5zIG1hdGNoZXMgYXQgZmlyc3QgbGV2ZWwsIGl0J3MgYSBsZWFndWVcbiAgcmV0dXJuICEhZXZlbnRbMF0ucDE7XG59XG5cbi8vIFJldHVybiBhIGxpc3Qgb2YgbGV2ZWxzLCB3aGVyZSBlYWNoIGxldmVsIGlzIGEgbGlzdCBvZiBtYXRjaGVzXG4vLyBiZXR3ZWVuIHBsYXllcnMgaW4gdGhlIHRvdXJuZXkuICBGaW5hbGUgaXMgdGhlIGxhc3QgbGV2ZWwuXG5mdW5jdGlvbiB0b3VybmV5KHBsYXllcnMpIHtcbiAgaWYgKHBsYXllcnMubGVuZ3RoID09PSAyKVxuICAgIHJldHVybiBbW21hdGNoLm5ldyhwbGF5ZXJzWzBdLCBwbGF5ZXJzWzFdKV1dO1xuXG4gIHZhciBuID0gTWF0aC5wb3coMiwgTWF0aC5mbG9vcihNYXRoLmxvZyhwbGF5ZXJzLmxlbmd0aCkvTWF0aC5MTjIpKTtcbiAgdmFyIG0gPSBwbGF5ZXJzLmxlbmd0aCAtIG47XG4gIGlmIChtID4gMCkge1xuICAgIHZhciBbbm93LCB1cF0gPSBzcGxpdChwbGF5ZXJzLCBbbSAqIDJdKTtcbiAgICB2YXIgZWxpbSA9IHBhaXJzKG5vdyk7XG4gICAgdmFyIGJ5ZXMgPSB1cC5tYXAocCA9PiBtYXRjaC5uZXcocCxwKSk7XG4gICAgdmFyIG1hdGNoZXMgPSBlbGltLmNvbmNhdChieWVzKTtcbiAgICByZXR1cm4gW21hdGNoZXNdLmNvbmNhdCh0b3VybmV5KHdpbm5lcnMobWF0Y2hlcykpKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbWF0Y2hlcyA9IHBhaXJzKHBsYXllcnMpO1xuICAgIHJldHVybiBbbWF0Y2hlc10uY29uY2F0KHRvdXJuZXkod2lubmVycyhtYXRjaGVzKSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvc2Vyc0JyYWNrZXQodG91cm5leSwgcHJldldpbm5lcnMpIHtcbiAgaWYgKHByZXZXaW5uZXJzID09IG51bGwpIHByZXZXaW5uZXJzID0gW107XG4gIGlmICh0b3VybmV5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuICBjb25zb2xlLmxvZyhwcmV2V2lubmVycy5jb25jYXQobG9zZXJzKHRvdXJuZXlbMF0pKS5sZW5ndGgpO1xuXG4gIHZhciBtYXRjaGVzID0gcGFpcnMocHJldldpbm5lcnMuY29uY2F0KGxvc2Vycyh0b3VybmV5WzBdKSkpO1xuICByZXR1cm4gW21hdGNoZXNdLmNvbmNhdChsb3NlcnNCcmFja2V0KHRvdXJuZXkuc2xpY2UoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lubmVycyhtYXRjaGVzKSkpO1xufVxuXG5mdW5jdGlvbiB0b3VybmV5RG91YmxlRWxpbWluYXRpb24ocGxheWVycykge1xuICB2YXIgdCA9IHRvdXJuZXkocGxheWVycyk7XG4gIHZhciBsID0gbG9zZXJzQnJhY2tldCh0KTtcbiAgdmFyIGZpbmFsZSA9IHBhaXJzKHdpbm5lcnMobGFzdCh0KS5jb25jYXQobGFzdChsKSkpKTtcbiAgcmV0dXJuIFt0LCBsLCBmaW5hbGVdO1xufVxuXG4vLyBSZXR1cm4gYSBsaXN0IG9mIG1hdGNoZXMgYmV0d2VlbiBwbGF5ZXJzLCB3aGVyZSBlYWNoIHBsYXllciBpc1xuLy8gbWF0Y2hlZCB3aXRoIGl0cyBuZWlnaGJvciwgYXMgaW4gdGhlIGZpcnN0IGxldmVsIG9mIGEgdG91cm5leS5cbmZ1bmN0aW9uIHBhaXJzKHBsYXllcnMpIHtcbiAgaWYgKHBsYXllcnMubGVuZ3RoICUgMiA9PT0gMSlcbiAgICB0aHJvdyBcIkNhbid0IHBhaXIgb2RkIG51bWJlciBvZiBwbGF5ZXJzXCI7XG5cbiAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgdmFyIG0gPSBtYXRjaC5uZXcocGxheWVyc1tpXSwgcGxheWVyc1tpKzFdKTtcbiAgICBtYXRjaGVzLnB1c2gobSk7XG4gIH1cbiAgcmV0dXJuIG1hdGNoZXM7XG59XG5cbi8vIFJldHVybiB0aGUgbGlzdCBvZiBwbGF5ZXJzIHNwbGl0IGludG8gZ3JvdXBzIG9mIGxlbmd0aHMgc3BlY2lmaWVkXG4vLyBieSBgZ3JvdXBzYC5cbmZ1bmN0aW9uIHNwbGl0KHBsYXllcnMsIGdyb3Vwcykge1xuICBpZiAoZ3JvdXBzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gW3BsYXllcnNdO1xuXG4gIHZhciBoZCA9IHBsYXllcnMuc2xpY2UoMCwgZ3JvdXBzWzBdKTtcbiAgdmFyIHRsID0gcGxheWVycy5zbGljZShncm91cHNbMF0pO1xuICB2YXIgZyA9IGdyb3Vwcy5zbGljZSgxKTtcbiAgcmV0dXJuIFtoZF0uY29uY2F0KHNwbGl0KHRsLCBnKSk7XG59XG5cbi8vIFJldHVybiBbc3RhcnQsIC4uLiwgZW5kXSwgd2hlcmUgc3RhcnQgZGVmYXVsdHMgdG8gMVxuZnVuY3Rpb24gcmFuZ2UoZW5kLCBzdGFydCkge1xuICBpZiAoc3RhcnQgPT0gbnVsbCkgc3RhcnQgPSAxO1xuICBpZiAoZW5kIDwgc3RhcnQpIHJldHVybiBbXTtcbiAgZWxzZSByZXR1cm4gcmFuZ2UoZW5kIC0gMSwgc3RhcnQpLmNvbmNhdChlbmQpO1xufVxuXG4vLyBNaXggcGxheWVycyBvdXQgb2YgZWxpbWluYXRpb24gcm91bmRzIGFzIHRvIG5vdCBtZWV0IGFnYWluIGluIHRoZVxuLy8gZmlyc3QgbGV2ZWwgb2YgYSB0b3VybmV5LiAgW1sxLDJdLFszLDRdLC4uLl0geWllbGRzIFsxLDMsMiw0LC4uLl0uXG5mdW5jdGlvbiBtaXgoZ3JvdXBzKSB7XG4gIGlmIChncm91cHNbMF0ubGVuZ3RoID09PSAwKSByZXR1cm4gZ3JvdXBzWzFdO1xuICBpZiAoZ3JvdXBzWzFdLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGdyb3Vwc1swXTtcblxuICB2YXIgaGVhZHMgPSBncm91cHMubWFwKGcgPT4gZ1swXSk7XG4gIHZhciB0YWlscyA9IGdyb3Vwcy5tYXAoZyA9PiBnLnNsaWNlKDEpKTtcblxuICByZXR1cm4gaGVhZHMuY29uY2F0KG1peCh0YWlscykpO1xufVxuXG5mdW5jdGlvbiBsYXN0KG1hdGNoZXMpIHtcbiAgcmV0dXJuIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGggLSAxXTtcbn1cblxuZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xuICB2YXIgciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFycmF5Lmxlbmd0aCk7XG5cbiAgdmFyIHNodWZmbGVkID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaiA9IHIoKTtcbiAgICB3aGlsZSAoc2h1ZmZsZWRbal0pXG4gICAgICBqID0gKGogKyAxKSAlIGFycmF5Lmxlbmd0aDtcbiAgICBzaHVmZmxlZFtqXSA9IGFycmF5W2ldO1xuICB9XG5cbiAgcmV0dXJuIHNodWZmbGVkO1xufVxuXG4vL35+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5cbi8vIFZpZXdcblxudmFyIHJlbmRlciA9IHtcbiAgZXZlbnRzOiBmdW5jdGlvbihlcykge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBlcy5mb3JFYWNoKGUgPT4geyAkZi5hcHBlbmRDaGlsZChyZW5kZXIuZXZlbnQoZSkpOyB9KTtcbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgZXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoaXNMZWFndWUoZSkpIHJldHVybiByZW5kZXIubGVhZ3VlKGUpO1xuICAgIGVsc2UgcmV0dXJuIHJlbmRlci50b3VybmV5KGUpO1xuICB9LFxuXG4gIGxlYWd1ZTogZnVuY3Rpb24obCkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZScpO1xuXG4gICAgdmFyICRoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgICRoZWFkZXIudGV4dENvbnRlbnQgPSAnTGVhZ3VlJztcbiAgICAkZi5hcHBlbmRDaGlsZCgkaGVhZGVyKTtcblxuICAgIHZhciAkZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJGRpdi5jbGFzc0xpc3QuYWRkKCdsZWFndWUtY29udGVudCcpO1xuXG4gICAgdmFyICRtYXRjaGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAkbWF0Y2hlcy5jbGFzc0xpc3QuYWRkKCdsZWFndWUtbWF0Y2hlcycpO1xuICAgIGwuZm9yRWFjaChtID0+IHsgJG1hdGNoZXMuYXBwZW5kQ2hpbGQocmVuZGVyLm1hdGNoKG0pKTsgfSk7XG4gICAgJGRpdi5hcHBlbmRDaGlsZCgkbWF0Y2hlcyk7XG5cbiAgICB2YXIgJHNjb3JlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgJHNjb3Jlcy5jbGFzc0xpc3QuYWRkKCdsZWFndWUtc2NvcmVzJyk7XG4gICAgdmFyICRzY29yZXNfaGVhZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgICB2YXIgJHRoX3BsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgJHRoX3BsYXllci50ZXh0Q29udGVudCA9ICdQbGF5ZXInO1xuICAgICRzY29yZXNfaGVhZC5hcHBlbmRDaGlsZCgkdGhfcGxheWVyKTtcblxuICAgIHZhciAkdGhfc2NvcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgICR0aF9zY29yZS50ZXh0Q29udGVudCA9ICdTY29yZSc7XG4gICAgJHNjb3Jlc19oZWFkLmFwcGVuZENoaWxkKCR0aF9zY29yZSk7XG5cbiAgICAkc2NvcmVzLmFwcGVuZENoaWxkKCRzY29yZXNfaGVhZCk7XG5cbiAgICBzY29yZXMobCkuZm9yRWFjaCgoW2ssdl0pID0+IHtcbiAgICAgIHZhciAkcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgICAgIHZhciAkbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAkbmFtZS50ZXh0Q29udGVudCA9IG5hbWUoayk7XG4gICAgICAkcy5hcHBlbmRDaGlsZCgkbmFtZSk7XG5cbiAgICAgIHZhciAkcG9pbnRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICRwb2ludHMudGV4dENvbnRlbnQgPSB2O1xuICAgICAgJHMuYXBwZW5kQ2hpbGQoJHBvaW50cyk7XG5cbiAgICAgICRzY29yZXMuYXBwZW5kQ2hpbGQoJHMpO1xuICAgIH0pO1xuXG4gICAgJGRpdi5hcHBlbmRDaGlsZCgkc2NvcmVzKTtcblxuICAgICRmLmFwcGVuZENoaWxkKCRkaXYpO1xuXG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIHRvdXJuZXk6IGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgJGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkZi5jbGFzc0xpc3QuYWRkKCd0b3VybmV5Jyk7XG5cbiAgICB2YXIgJGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgJGhlYWRlci50ZXh0Q29udGVudCA9ICdUb3VybmV5JztcbiAgICAkZi5hcHBlbmRDaGlsZCgkaGVhZGVyKTtcblxuICAgIHZhciAkdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICR0LmNsYXNzTGlzdC5hZGQoJ3RvdXJuZXktbWF0Y2hlcycpO1xuICAgIHQuZm9yRWFjaChsID0+IHsgJHQuYXBwZW5kQ2hpbGQocmVuZGVyLmxldmVsKGwpKTsgfSk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJHQpO1xuXG4gICAgdmFyICR3aW5uZXJMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29sJyk7XG4gICAgJHdpbm5lckxldmVsLmNsYXNzTGlzdC5hZGQoJ2xldmVsJyk7XG5cbiAgICB2YXIgJHdpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAkd2lubmVyLmNsYXNzTGlzdC5hZGQoJ3BsYXllci1uYW1lJyk7XG4gICAgJHdpbm5lci5jbGFzc0xpc3QuYWRkKCd3aW5uZXInKTtcbiAgICAkd2lubmVyLnRleHRDb250ZW50ID0gbmFtZShsYXN0KHQpWzBdLndpbm5lcik7XG4gICAgJHdpbm5lckxldmVsLmFwcGVuZENoaWxkKCR3aW5uZXIpO1xuXG4gICAgJHQuYXBwZW5kQ2hpbGQoJHdpbm5lckxldmVsKTtcblxuICAgIHJldHVybiAkZjtcbiAgfSxcblxuICBsZXZlbDogZnVuY3Rpb24obCkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAkZi5hcHBlbmRDaGlsZChyZW5kZXIubWF0Y2hlcyhsKSk7XG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIG1hdGNoZXM6IGZ1bmN0aW9uKG1zKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAkZi5jbGFzc0xpc3QuYWRkKCdsZXZlbCcpO1xuICAgIG1zLmZvckVhY2gobSA9PiB7ICRmLmFwcGVuZENoaWxkKHJlbmRlci5tYXRjaChtKSk7IH0pO1xuICAgIHJldHVybiAkZjtcbiAgfSxcblxuICBtYXRjaDogZnVuY3Rpb24obSkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgJGYuY2xhc3NMaXN0LmFkZCgnbWF0Y2gnKTtcbiAgICBpZiAobS5wMSA9PT0gbS5wMilcbiAgICAgICRmLmNsYXNzTGlzdC5hZGQoJ2J5ZScpO1xuXG4gICAgdmFyICRwbGF5ZXIxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJHBsYXllcjEuY2xhc3NMaXN0LmFkZCgncGxheWVyMScpO1xuICAgICRmLmFwcGVuZENoaWxkKCRwbGF5ZXIxKTtcblxuICAgIHZhciAkcDEgPSByZW5kZXIucGxheWVyKG0ucDEsIG0pO1xuICAgICRwbGF5ZXIxLmFwcGVuZENoaWxkKCRwMSk7XG5cbiAgICB2YXIgJGNoYXJfcDEgPSByZW5kZXIuY2hhcnNfbGlzdChtLnAxLCBtLnAxX2NoYXIpO1xuICAgICRjaGFyX3AxLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgbS5wMV9jaGFyID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgc2V0X2xhc3RfY2hhcihtLnAxLCBtLnAxX2NoYXIpO1xuICAgIH0pO1xuICAgICRwMS5hcHBlbmRDaGlsZCgkY2hhcl9wMSk7XG4gICAgJHAxLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUNoYXJzKTtcblxuICAgIHZhciAkcGxheWVyMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRwbGF5ZXIyLmNsYXNzTGlzdC5hZGQoJ3BsYXllcjInKTtcbiAgICAkZi5hcHBlbmRDaGlsZCgkcGxheWVyMik7XG5cbiAgICB2YXIgJHAyID0gcmVuZGVyLnBsYXllcihtLnAyLCBtKTtcbiAgICAkcGxheWVyMi5hcHBlbmRDaGlsZCgkcDIpO1xuXG4gICAgdmFyICRjaGFyX3AyID0gcmVuZGVyLmNoYXJzX2xpc3QobS5wMiwgbS5wMl9jaGFyKTtcbiAgICAkY2hhcl9wMi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIG0ucDJfY2hhciA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHNldF9sYXN0X2NoYXIobS5wMiwgbS5wMl9jaGFyKTtcbiAgICB9KTtcbiAgICAkcDIuYXBwZW5kQ2hpbGQoJGNoYXJfcDIpO1xuICAgICRwMi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVDaGFycyk7XG5cbiAgICB2YXIgJHJlc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgJHJlc2V0LmNsYXNzTGlzdC5hZGQoJ3Jlc2V0LW1hdGNoJyk7XG4gICAgJHJlc2V0LnRleHRDb250ZW50ID0gJ1gnO1xuICAgICRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIG0ud2lubmVyID0gbnVsbDtcbiAgICAgIG0ucDFfY2hhciA9IG51bGw7XG4gICAgICBtLnAyX2NoYXIgPSBudWxsO1xuICAgIH0pO1xuICAgICRmLmFwcGVuZENoaWxkKCRyZXNldCk7XG5cbiAgICByZXR1cm4gJGY7XG5cbiAgICBmdW5jdGlvbiBzYXZlQ2hhcnMoKSB7XG4gICAgICBtLnAxX2NoYXIgPSAkY2hhcl9wMS52YWx1ZTtcbiAgICAgIG0ucDJfY2hhciA9ICRjaGFyX3AyLnZhbHVlO1xuICAgIH1cbiAgfSxcblxuICBjaGFyc19saXN0OiBmdW5jdGlvbihwLCBwX2NoYXIpIHtcbiAgICB2YXIgJHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICRwLmNsYXNzTGlzdC5hZGQoJ2NoYXInKTtcbiAgICAkcC50eXBlID0gJ3RleHQnO1xuICAgICRwLnBsYWNlaG9sZGVyID0gJ0Rhbic7XG4gICAgJHAuc2V0QXR0cmlidXRlKCdsaXN0JywgJ2FsbC1jaGFycycpO1xuICAgIHZhciBjaCA9IHBfY2hhciB8fCBsYXN0X2NoYXIocCkgfHwgcmV0cmlldmUobmFtZShwKSk7XG4gICAgaWYgKGNoICE9IG51bGwpXG4gICAgICAkcC52YWx1ZSA9IGNoO1xuXG4gICAgcmV0dXJuICRwO1xuICB9LFxuXG4gIHBsYXllcjogZnVuY3Rpb24ocCwgbSkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ3BsYXllci1pbmZvJyk7XG5cbiAgICB2YXIgJGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgJGJ1dHRvbi5pZCA9IGByYWRpby0ke2dlbmlkKCl9YDtcbiAgICAkYnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdyYWRpbycpO1xuXG4gICAgJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHsgbS53aW5uZXIgPSBwOyB9KTtcbiAgICBpZiAocCA9PT0gbS53aW5uZXIoKSlcbiAgICAgICRidXR0b24uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgdHJ1ZSk7XG4gICAgaWYgKG5hbWUobS5wMSkgPT0gbnVsbCB8fCBuYW1lKG0ucDIpID09IG51bGwpXG4gICAgICAkYnV0dG9uLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAkZi5hcHBlbmRDaGlsZCgkYnV0dG9uKTtcblxuICAgIHZhciAkbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICRsYWJlbC5jbGFzc0xpc3QuYWRkKCdwbGF5ZXItbmFtZScpO1xuICAgICRsYWJlbC50ZXh0Q29udGVudCA9IG5hbWUocCk7XG4gICAgJGxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJGJ1dHRvbi5pZCk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJGxhYmVsKTtcblxuICAgIHJldHVybiAkZjtcbiAgfSxcblxuICBzYXZlTGluazogZnVuY3Rpb24oZXZlbnRzKSB7XG4gICAgdmFyICRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkZGl2LmNsYXNzTGlzdC5hZGQoJ2J1ZG9rYWktZGF0YScpO1xuXG4gICAgdmFyIGxpbmsgPSBlbmNvZGUoc2VyaWFsaXplLmFsbChldmVudHMpKTtcblxuICAgIHZhciAkcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAkcC5jbGFzc0xpc3QuYWRkKCdkYXRhJyk7XG4gICAgJHAudGV4dENvbnRlbnQgPSBsaW5rO1xuICAgICRkaXYuYXBwZW5kQ2hpbGQoJHApO1xuXG4gICAgdmFyICRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICRhLnNldEF0dHJpYnV0ZSgnaHJlZicsIGVuY29kZVVSSShgbWFpbHRvOj9zdWJqZWN0PVtCdWRva2FpXSBTYXZlIG1lJmJvZHk9JHtsaW5rfWApKTtcbiAgICAkYS50ZXh0Q29udGVudCA9ICdwb3N0JztcbiAgICAkZGl2LmFwcGVuZENoaWxkKCRhKTtcblxuICAgIHJldHVybiAkZGl2O1xuICB9LFxufTtcblxudmFyIHZpZXcgPSB7XG4gIG5ldzogZnVuY3Rpb24oJHJvb3QsIGV2ZW50cykge1xuICAgIHJldHVybiB7XG4gICAgICBfX3Byb3RvX186IHRoaXMsXG4gICAgICAkcm9vdCwgZXZlbnRzLFxuICAgIH07XG4gIH0sXG5cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kcm9vdC5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLiRyb290LmFwcGVuZENoaWxkKHJlbmRlci5ldmVudHModGhpcy5ldmVudHMpKTtcbiAgICB0aGlzLiRyb290LmFwcGVuZENoaWxkKHJlbmRlci5zYXZlTGluayh0aGlzLmV2ZW50cykpO1xuICB9LFxufTtcblxudmFyIHNlcmlhbGl6ZSA9IHtcbiAgYWxsKGV2ZW50cykge1xuICAgIHZhciBldiA9IFtdO1xuXG4gICAgZXZlbnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBpZiAoaXNMZWFndWUoZSkpIGV2LnB1c2goc2VyaWFsaXplLmxlYWd1ZShlKSlcbiAgICAgIGVsc2UgZXYucHVzaChzZXJpYWxpemUudG91cm5leShlKSlcbiAgICB9KTtcblxuICAgIHZhciBtID0ge1xuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGRhdGU6IChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF1cbiAgICAgICxldmVudHM6IGV2XG4gICAgfTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtKTtcbiAgfSxcblxuICBsZWFndWUobCkge1xuICAgIHJldHVybiBsLm1hcChtID0+IHNlcmlhbGl6ZS5tYXRjaChtKSk7XG4gIH0sXG5cbiAgdG91cm5leSh0KSB7XG4gICAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgICB0LmZvckVhY2goYnJhY2tldCA9PiBicmFja2V0LmZvckVhY2gobSA9PiB7XG4gICAgICBpZiAobS5wMSAhPT0gbS5wMilcbiAgICAgIG1hdGNoZXMucHVzaChzZXJpYWxpemUubWF0Y2gobSkpO1xuICAgIH0pKTtcbiAgICByZXR1cm4gbWF0Y2hlcztcbiAgfSxcblxuICBtYXRjaChtKSB7XG4gICAgdmFyIHdpbm5lcjtcbiAgICBpZiAobS5wMSA9PT0gbS53aW5uZXIoKSlcbiAgICAgIHdpbm5lciA9ICdwMSc7XG4gICAgZWxzZSBpZiAobS53aW5uZXIoKSA9PT0gbS5wMilcbiAgICAgIHdpbm5lciA9ICdwMic7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcDE6IHtuYW1lOiBuYW1lKG0ucDEpLFxuICAgICAgICAgICBjaGFyOiBtLnAxX2NoYXJ9LFxuICAgICAgcDI6IHtuYW1lOiBuYW1lKG0ucDIpLFxuICAgICAgICAgICBjaGFyOiBtLnAyX2NoYXJ9LFxuICAgICAgd2lubmVyLFxuICAgIH07XG4gIH0sXG59O1xuXG52YXIgZW5jb2RlID0gcyA9PiBidG9hKGVuY29kZVVSSShzKSlcbnZhciBkZWNvZGUgPSBzID0+IGRlY29kZVVSSShhdG9iKHMpKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICB2YXIgJHBsYXllcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGxheWVyLWxpc3QnKTtcbiAgdmFyICRsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21hdGNoLWxpc3QnKTtcbiAgdmFyICRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI24tcGxheWVycycpO1xuXG4gIHZhciB2ID0gdmlldy5uZXcoJGxpc3QpO1xuXG4gICRuLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIHZhciBuID0gcGFyc2VJbnQoJG4udmFsdWUsIDEwKTtcbiAgICB2YXIgcGxheWVycyA9IFtdO1xuXG4gICAgcmFuZ2UobikuZm9yRWFjaChpID0+IHtcbiAgICAgIGlmICgkcGxheWVycy5jaGlsZE5vZGVzW2ldID09IG51bGwpIHtcbiAgICAgICAgdmFyICRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgJGRpdi5pZCA9IGBwbGF5ZXItJHtpfWA7XG4gICAgICAgICRkaXYuY2xhc3NMaXN0LmFkZCgnbmFtZS1jb250YWluZXInKTtcblxuICAgICAgICB2YXIgJG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAkbmFtZS5jbGFzc0xpc3QuYWRkKCduYW1lJyk7XG4gICAgICAgICRuYW1lLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0Jyk7XG4gICAgICAgICRuYW1lLnZhbHVlID0gcmV0cmlldmUoJGRpdi5pZCkgfHwgJ1AnICsgaTtcbiAgICAgICAgJGRpdi5hcHBlbmRDaGlsZCgkbmFtZSk7XG5cbiAgICAgICAgdmFyICRsb2NrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgJGxvY2suaWQgPSBgbG9jay0ke2l9YDtcbiAgICAgICAgJGxvY2suY2xhc3NMaXN0LmFkZCgnbG9jaycpO1xuICAgICAgICAkbG9jay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnY2hlY2tib3gnKTtcbiAgICAgICAgJGxvY2suYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgJG5hbWUuY2xhc3NMaXN0LnRvZ2dsZSgnbG9ja2VkJyk7XG4gICAgICAgICAgJG5hbWUuZGlzYWJsZWQgPSAhJG5hbWUuZGlzYWJsZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICAkZGl2LmFwcGVuZENoaWxkKCRsb2NrKTtcblxuICAgICAgICB2YXIgJGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgJGxhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJGxvY2suaWQpO1xuICAgICAgICAkbGFiZWwuaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEgZmEtdW5sb2NrXCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtbG9ja1wiPjwvaT4nO1xuICAgICAgICAkZGl2LmFwcGVuZENoaWxkKCRsYWJlbCk7XG5cbiAgICAgICAgJHBsYXllcnMuYXBwZW5kQ2hpbGQoJGRpdik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkcGxheWVycy5jaGlsZE5vZGVzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ29mZicpO1xuICAgICAgICB2YXIgJG5hbWUgPSAkcGxheWVycy5xdWVyeVNlbGVjdG9yKGAjcGxheWVyLSR7aX0gLm5hbWVgKTtcbiAgICAgIH1cbiAgICAgIHBsYXllcnMucHVzaCh7bmFtZTogKCkgPT4gJG5hbWUudmFsdWV9KTtcbiAgICB9KTtcblxuICAgIHJhbmdlKCRwbGF5ZXJzLmNoaWxkTm9kZXMubGVuZ3RoLTEsIG4rMSkuZm9yRWFjaChpID0+IHtcbiAgICAgICRwbGF5ZXJzLmNoaWxkTm9kZXNbaV0uY2xhc3NMaXN0LmFkZCgnb2ZmJyk7XG4gICAgfSk7XG5cbiAgICB2LmV2ZW50cyA9IGV2ZW50cyhwbGF5ZXJzKTtcbiAgICB2LnJlZnJlc2goKTtcbiAgfSk7XG5cbiAgJG4uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JykpO1xuXG4gICRwbGF5ZXJzLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ25hbWUnKSkge1xuICAgICAgc2F2ZShldmVudC50YXJnZXQucGFyZW50Tm9kZS5pZCwgZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgIHYucmVmcmVzaCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJGxpc3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4ge1xuICAgIC8vIE5lZWQgdGhlIHNldFRpbWVvdXQgdG8gbGV0IHRoZSBldmVudCBidWJibGUgYW5kIGJlIGNhdWdodCBieVxuICAgIC8vIG90aGVyIGxpc3RlbmVycyBiZWZvcmUgcmVjcmVhdGluZyB0aGUgdmlld1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyB2LnJlZnJlc2goKTsgfSAsIDApO1xuICB9KTtcblxuICB2YXIgJHNodWZmbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2h1ZmZsZS1wbGF5ZXJzJyk7XG4gICRzaHVmZmxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHZhciAkbmFtZXMgPSBbXS5maWx0ZXIuY2FsbChcbiAgICAgICRwbGF5ZXJzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Lm5hbWUnKSxcbiAgICAgICRwID0+ICEkcC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnb2ZmJylcbiAgICAgICAgICYmICEkcC5jbGFzc0xpc3QuY29udGFpbnMoJ2xvY2tlZCcpKTtcbiAgICB2YXIgbmFtZXMgPSBbXS5tYXAuY2FsbCgkbmFtZXMsICRpID0+ICRpLnZhbHVlKTtcbiAgICBuYW1lcyA9IHNodWZmbGUobmFtZXMpO1xuICAgIFtdLmZvckVhY2guY2FsbCgkbmFtZXMsICgkbixpKSA9PiB7ICRuLnZhbHVlID0gbmFtZXNbaV07IH0pO1xuICAgIHYucmVmcmVzaCgpO1xuICB9KTtcbn0pO1xuXG52YXIgc2F2ZSA9IChrLHYpID0+IGxvY2FsU3RvcmFnZS5zZXRJdGVtKGssdik7XG52YXIgcmV0cmlldmUgPSBrID0+IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGspO1xudmFyIGdlbmlkID0gKCgpID0+IHsgdmFyIGkgPSAwOyByZXR1cm4gKCkgPT4gKytpIH0pKCk7XG4iXX0=