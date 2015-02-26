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
    $p1.addEventListener("click", function (event) {
      m.p1_char = $char_p1.value;
    });

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
    $p2.addEventListener("click", function (event) {
      m.p2_char = $char_p2.value;
    });

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
  } };

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
      save(event.target.id, event.target.value);
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

//# sourceMappingURL=data:application/json;base64,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Q0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUEsRUFBRTthQUFJLEVBQUUsQ0FBQyxLQUFLO0tBQUEsQ0FBQyxDQUFDO0FBQ2hELFNBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsTUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUMsRUFBRSxFQUFDLENBQUMsRUFBSztBQUFFLFFBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQUUsQ0FBQyxDQUFDO0FBQzVELEtBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFJLElBQUksR0FBRyxVQUFDLENBQUMsRUFBQyxDQUFDO1NBQUssWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0NBQUEsQ0FBQztBQUM5QyxJQUFJLFFBQVEsR0FBRyxVQUFBLENBQUM7U0FBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUFBLENBQUM7QUFDNUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxZQUFNO0FBQUUsTUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEFBQUMsT0FBTztXQUFNLEVBQUUsQ0FBQztHQUFBLENBQUE7Q0FBRSxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJidWRva2FpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVG91cm5hbWVudCBoZWxwZXJcbi8vIDEuIEFzayBmb3IgbnVtYmVyIG9mIHBhcnRpY2lwYW50c1xuLy8gMi4gU2hvdyB0aGUgZm9ybSBvZiB0aGUgdG91cm5hbWVudCB3aXRoIG51bWJlcnNcbi8vIDMuIENhbiBhc3NpZ24gbmFtZXMgdG8gbnVtYmVyc1xuLy8gNC4gQ2FuIHNodWZmbGUgcGFydGljaXBhbnRzXG4vLyA1LiBHaXZlcyBsaXN0IG9mIG1hdGNoZXMgdG8gcGxheVxuLy8gNi4gQ2FuIGNoYW5nZSB3aW5uZXIgb2YgbWF0Y2ggYXQgd2lsbFxuXG4vLyBUT0RPOiBzdGF0aWMgdmlld3MgZm9yIHBvc3Rlcml0eVxuLy8gVE9ETzogZGlmZmVyZW50IG9wdGlvbnMgKGluIG51bWJlciBvZiBtYXRjaGVzKSB3aGVyZSBpdCBtYWtlcyBzZW5zZVxuLy8gVE9ETzogbG9zZXJzIGJyYWNrZXQgYXMgYW4gb3B0aW9uXG5cbmZ1bmN0aW9uIGV2ZW50cyhwbGF5ZXJzKSB7XG4gIHZhciBuID0gcGxheWVycy5sZW5ndGg7XG5cbiAgaWYgKG4gPT09IDMpIHtcbiAgICByZXR1cm4gW3NodWZmbGUobGVhZ3VlKHBsYXllcnMpKV07XG4gIH1cblxuICBlbHNlIGlmIChuID09PSA0IHx8IG4gPT09IDgpXG4gICAgcmV0dXJuIFt0b3VybmV5KHBsYXllcnMpXTtcblxuICBlbHNlIGlmIChuID09PSA1KSB7XG4gICAgdmFyIFtnMSwgZzJdID0gc3BsaXQocGxheWVycywgWzMsMl0pO1xuICAgIHZhciBsID0gc2h1ZmZsZShsZWFndWUoZzEpKTtcbiAgICB2YXIgdyA9IGJlc3QoMiwgbCk7XG4gICAgcmV0dXJuIFtsLCB0b3VybmV5KG1peChbdywgZzJdKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gNikge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFszLDNdKTtcbiAgICB2YXIgbDEgPSBzaHVmZmxlKGxlYWd1ZShnMSkpO1xuICAgIHZhciBsMiA9IHNodWZmbGUobGVhZ3VlKGcyKSk7XG4gICAgdmFyIHcxID0gYmVzdCgyLCBsMSk7XG4gICAgdmFyIHcyID0gYmVzdCgyLCBsMik7XG4gICAgcmV0dXJuIFtsMSwgbDIsIHRvdXJuZXkobWl4KFt3MSwgdzJdKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gNykge1xuICAgIHJldHVybiBbdG91cm5leShwbGF5ZXJzLmNvbmNhdChsYXN0KHBsYXllcnMpKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gOSkge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFszLDZdKTtcbiAgICB2YXIgbCA9IHNodWZmbGUobGVhZ3VlKGcxKSk7XG4gICAgdmFyIHcgPSBiZXN0KDIsIGwpO1xuICAgIHJldHVybiBbbCwgdG91cm5leShtaXgoW3csIGcyXSkpXTtcbiAgfVxuXG4gIGVsc2UgaWYgKG4gPT09IDEwKSB7XG4gICAgdmFyIFtnMSwgZzJdID0gc3BsaXQocGxheWVycywgWzQsNl0pO1xuICAgIHZhciBsID0gc2h1ZmZsZShsZWFndWUoZzEpKTtcbiAgICB2YXIgdyA9IGJlc3QoMiwgbCk7XG4gICAgcmV0dXJuIFtsLCB0b3VybmV5KG1peChbdywgZzJdKSldO1xuICB9XG5cbiAgZWxzZVxuICAgIHJldHVybiBbdG91cm5leShwbGF5ZXJzKV07XG59XG5cbnZhciBtYXRjaCA9IHtcbiAgbmV3OiBmdW5jdGlvbihwMSwgcDIpIHtcbiAgICB2YXIgbSA9IHtcbiAgICAgIF9fcHJvdG9fXzogdGhpcyxcbiAgICAgIHAxLCBwMixcbiAgICB9O1xuXG4gICAgLy8gTWF0Y2ggaXMgYSBieWVcbiAgICBpZiAocDEgPT09IHAyKVxuICAgICAgbS53aW5uZXIgPSBwMTtcblxuICAgIHJldHVybiBtO1xuICB9LFxuXG4gIGdldCB3aW5uZXIoKSB7IHJldHVybiAoKSA9PiB0aGlzLndpbiB9LFxuICBzZXQgd2lubmVyKHApIHtcbiAgICBpZiAocCA9PT0gJ3AxJykgdGhpcy53aW4gPSB0aGlzLnAxO1xuICAgIGVsc2UgaWYgKHAgPT09ICdwMicpIHRoaXMud2luID0gdGhpcy5wMjtcbiAgICBlbHNlIGlmIChwID09PSB0aGlzLnAxIHx8IHAgPT09IHRoaXMucDIgfHwgcCA9PSBudWxsKVxuICAgICAgdGhpcy53aW4gPSBwO1xuICAgIGVsc2UgdGhyb3cgXCJXaW5uZXIgc2hvdWxkIGJlIHAxLCBwMiBvciBudWxsXCI7XG4gIH0sXG5cbiAgZ2V0IGxvc2VyKCkgeyByZXR1cm4gKCkgPT4ge1xuICAgIGlmKHRoaXMud2luID09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgZWxzZSByZXR1cm4gdGhpcy53aW4gPT09IHRoaXMucDEgPyB0aGlzLnAyIDogdGhpcy5wMTtcbiAgfX0sXG59O1xuXG4vLyBSZXR1cm4gdGhlIG5hbWUgb2YgYSBwbGF5ZXJcbmZ1bmN0aW9uIG5hbWUocGxheWVyKSB7XG4gIGlmIChwbGF5ZXIgPT0gbnVsbCkgcmV0dXJuIHBsYXllcjtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdmdW5jdGlvbicpIHJldHVybiBuYW1lKHBsYXllcigpKTtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdvYmplY3QnKSByZXR1cm4gbmFtZShwbGF5ZXIubmFtZSk7XG4gIHJldHVybiBwbGF5ZXI7XG59XG5cbmZ1bmN0aW9uIGxhc3RfY2hhcihwbGF5ZXIpIHtcbiAgaWYgKHBsYXllciA9PSBudWxsKSByZXR1cm4gcGxheWVyO1xuICBpZiAodHlwZW9mIHBsYXllciA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGxhc3RfY2hhcihwbGF5ZXIoKSk7XG4gIGlmICh0eXBlb2YgcGxheWVyID09PSAnb2JqZWN0JykgcmV0dXJuIGxhc3RfY2hhcihwbGF5ZXIubGFzdF9jaGFyKTtcbiAgcmV0dXJuIHBsYXllcjtcbn1cblxuZnVuY3Rpb24gc2V0X2xhc3RfY2hhcihwbGF5ZXIsIGxhc3RfY2hhcikge1xuICBpZiAocGxheWVyID09IG51bGwpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdmdW5jdGlvbicpIHJldHVybiBzZXRfbGFzdF9jaGFyKHBsYXllcigpLCBsYXN0X2NoYXIpO1xuICBpZiAodHlwZW9mIHBsYXllciA9PT0gJ29iamVjdCcpIHtcbiAgICBzYXZlKG5hbWUocGxheWVyKSwgbGFzdF9jaGFyKTtcbiAgICBwbGF5ZXIubGFzdF9jaGFyID0gbGFzdF9jaGFyO1xuICB9XG59XG5cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIHdpbm5lcnMgZnJvbSBhIGxpc3Qgb2YgbWF0Y2hlcy5cbmZ1bmN0aW9uIHdpbm5lcnMobWF0Y2hlcykge1xuICByZXR1cm4gbWF0Y2hlcy5tYXAobSA9PiBtLndpbm5lcik7XG59XG5cbmZ1bmN0aW9uIGxvc2VycyhtYXRjaGVzKSB7XG4gIHJldHVybiBtYXRjaGVzLm1hcChtID0+IG0ubG9zZXIpO1xufVxuXG4vLyBSZXR1cm4gdGhlIGxpc3Qgb2YgdGhlIG4gYmVzdCBwbGF5ZXJzLCBkZXBlbmRpbmcgb24gYSBzY29yaW5nXG4vLyBmdW5jdGlvbiBmb3IgZWFjaCBtYXRjaC4gIFRoZSBzY29yaW5nIGZ1bmN0aW9uIHRha2VzIGEgcGxheWVyIGFuZFxuLy8gbWF0Y2gsIGFuZCByZXR1cm5zIHRoZSBwbGF5ZXIncyBzY29yZSBhcyBhIG51bWJlci5cbmZ1bmN0aW9uIGJlc3QobiwgbWF0Y2hlcywgc2NvcmluZykge1xuICByZXR1cm4gcmFuZ2Uobi0xLCAwKS5tYXAoaSA9PiBiZXN0TnRoKGkpKTtcblxuICAvLyBYWFg6IHNvcnRpbmcgYW5kIGNvbXB1dGluZyB0aGUgc2NvcmVzIGVhY2ggdGltZSBpcyBmYXIgZnJvbVxuICAvLyBvcHRpbWFsLCBidXQgd2UgYXJlIGRlYWxpbmcgd2l0aCB2ZXJ5IHNtYWxsIG51bWJlcnMgaGVyZS5cbiAgZnVuY3Rpb24gYmVzdE50aChuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ29udmVydCB0byBhcnJheSBmb3Igc29ydGluZ1xuICAgICAgdmFyIHNjb3Jlc19hcnJheSA9IFtdO1xuICAgICAgc2NvcmVzKG1hdGNoZXMsIHNjb3JpbmcpXG4gICAgICAgIC5mb3JFYWNoKChbayx2XSkgPT4geyBzY29yZXNfYXJyYXkucHVzaChbayx2XSkgfSk7XG4gICAgICBzY29yZXNfYXJyYXkuc29ydCgoW2sxLHYxXSwgW2syLHYyXSkgPT4gdjIgLSB2MSk7XG5cbiAgICAgIHZhciBiZXN0ID0gc2NvcmVzX2FycmF5W25dO1xuICAgICAgaWYgKGJlc3RbMV0gPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICBlbHNlIHJldHVybiBiZXN0WzBdO1xuICAgIH1cbiAgfVxufVxuXG4vLyBSZXR1cm4gYSBNYXAgb2YgKHNvcnRlZCkgc2NvcmVzIGZvciB0aGUgZ2l2ZW4gbWF0Y2hlcyBhbmQgYSBzY29yaW5nXG4vLyBmdW5jdGlvbi4gIFRoZSBzY29yaW5nIGZ1bmN0aW9uIHRha2VzIGEgcGxheWVyIGFuZCBtYXRjaCwgYW5kXG4vLyByZXR1cm5zIHRoZSBwbGF5ZXIncyBzY29yZSBhcyBhIG51bWJlci5cbmZ1bmN0aW9uIHNjb3JlcyhtYXRjaGVzLCBzY29yaW5nKSB7XG4gIGlmIChzY29yaW5nID09IG51bGwpIHNjb3JpbmcgPSBkZWZhdWx0U2NvcmluZztcblxuICB2YXIgc2NvcmVzID0gbmV3IE1hcCgpOyAgICAgICAvLyBNYXAgc3VwcG9ydHMgZnVuY3Rpb24ga2V5c1xuXG4gIG1hdGNoZXMuZm9yRWFjaChtID0+IHtcbiAgICBbbS5wMSwgbS5wMl0uZm9yRWFjaChwID0+IHtcbiAgICAgIHZhciBzID0gc2NvcmVzLmdldChwKSB8fCAwO1xuICAgICAgc2NvcmVzLnNldChwLCBzICsgc2NvcmluZyhwLCBtKSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHZhciBzb3J0ZWRfc2NvcmVzID0gWy4uLnNjb3Jlc107XG4gIHNvcnRlZF9zY29yZXMuc29ydCgoW2sxLHYxXSxbazIsdjJdKSA9PiB2MiAtIHYxKTtcblxuICByZXR1cm4gc29ydGVkX3Njb3Jlcztcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFNjb3JpbmcocGxheWVyLCBtYXRjaCkge1xuICBpZiAocGxheWVyID09PSBtYXRjaC53aW5uZXIoKSkgcmV0dXJuIDE7XG4gIGVsc2UgcmV0dXJuIDA7XG59XG5cbi8vIFJldHVybiB0aGUgbGlzdCBvZiBtYXRjaGVzIGJldHdlZW4gcGxheWVycywgd2hlcmUgZWFjaCBwbGF5ZXIgZ2V0c1xuLy8gdG8gbWVldCBhbGwgdGhlIG90aGVyIHBsYXllcnMgb25jZS5cbmZ1bmN0aW9uIGxlYWd1ZShwbGF5ZXJzKSB7XG4gIGlmIChwbGF5ZXJzLmxlbmd0aCA9PT0gMilcbiAgICByZXR1cm4gW21hdGNoLm5ldyhwbGF5ZXJzWzBdLCBwbGF5ZXJzWzFdKV07XG5cbiAgdmFyIHAxID0gcGxheWVyc1swXTtcbiAgdmFyIHJlc3QgPSBwbGF5ZXJzLnNsaWNlKDEpO1xuXG4gIHZhciBtYXRjaGVzID0gcmVzdC5tYXAocDIgPT4gbWF0Y2gubmV3KHAxLCBwMikpO1xuICByZXR1cm4gbWF0Y2hlcy5jb25jYXQobGVhZ3VlKHJlc3QpKTtcbn1cblxuZnVuY3Rpb24gaXNMZWFndWUoZXZlbnQpIHtcbiAgLy8gSWYgaXQgY29udGFpbnMgbWF0Y2hlcyBhdCBmaXJzdCBsZXZlbCwgaXQncyBhIGxlYWd1ZVxuICByZXR1cm4gISFldmVudFswXS5wMTtcbn1cblxuLy8gUmV0dXJuIGEgbGlzdCBvZiBsZXZlbHMsIHdoZXJlIGVhY2ggbGV2ZWwgaXMgYSBsaXN0IG9mIG1hdGNoZXNcbi8vIGJldHdlZW4gcGxheWVycyBpbiB0aGUgdG91cm5leS4gIEZpbmFsZSBpcyB0aGUgbGFzdCBsZXZlbC5cbmZ1bmN0aW9uIHRvdXJuZXkocGxheWVycykge1xuICBpZiAocGxheWVycy5sZW5ndGggPT09IDIpXG4gICAgcmV0dXJuIFtbbWF0Y2gubmV3KHBsYXllcnNbMF0sIHBsYXllcnNbMV0pXV07XG5cbiAgdmFyIG4gPSBNYXRoLnBvdygyLCBNYXRoLmZsb29yKE1hdGgubG9nKHBsYXllcnMubGVuZ3RoKS9NYXRoLkxOMikpO1xuICB2YXIgbSA9IHBsYXllcnMubGVuZ3RoIC0gbjtcbiAgaWYgKG0gPiAwKSB7XG4gICAgdmFyIFtub3csIHVwXSA9IHNwbGl0KHBsYXllcnMsIFttICogMl0pO1xuICAgIHZhciBlbGltID0gcGFpcnMobm93KTtcbiAgICB2YXIgYnllcyA9IHVwLm1hcChwID0+IG1hdGNoLm5ldyhwLHApKTtcbiAgICB2YXIgbWF0Y2hlcyA9IGVsaW0uY29uY2F0KGJ5ZXMpO1xuICAgIHJldHVybiBbbWF0Y2hlc10uY29uY2F0KHRvdXJuZXkod2lubmVycyhtYXRjaGVzKSkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtYXRjaGVzID0gcGFpcnMocGxheWVycyk7XG4gICAgcmV0dXJuIFttYXRjaGVzXS5jb25jYXQodG91cm5leSh3aW5uZXJzKG1hdGNoZXMpKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9zZXJzQnJhY2tldCh0b3VybmV5LCBwcmV2V2lubmVycykge1xuICBpZiAocHJldldpbm5lcnMgPT0gbnVsbCkgcHJldldpbm5lcnMgPSBbXTtcbiAgaWYgKHRvdXJuZXkubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG4gIGNvbnNvbGUubG9nKHByZXZXaW5uZXJzLmNvbmNhdChsb3NlcnModG91cm5leVswXSkpLmxlbmd0aCk7XG5cbiAgdmFyIG1hdGNoZXMgPSBwYWlycyhwcmV2V2lubmVycy5jb25jYXQobG9zZXJzKHRvdXJuZXlbMF0pKSk7XG4gIHJldHVybiBbbWF0Y2hlc10uY29uY2F0KGxvc2Vyc0JyYWNrZXQodG91cm5leS5zbGljZSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5uZXJzKG1hdGNoZXMpKSk7XG59XG5cbmZ1bmN0aW9uIHRvdXJuZXlEb3VibGVFbGltaW5hdGlvbihwbGF5ZXJzKSB7XG4gIHZhciB0ID0gdG91cm5leShwbGF5ZXJzKTtcbiAgdmFyIGwgPSBsb3NlcnNCcmFja2V0KHQpO1xuICB2YXIgZmluYWxlID0gcGFpcnMod2lubmVycyhsYXN0KHQpLmNvbmNhdChsYXN0KGwpKSkpO1xuICByZXR1cm4gW3QsIGwsIGZpbmFsZV07XG59XG5cbi8vIFJldHVybiBhIGxpc3Qgb2YgbWF0Y2hlcyBiZXR3ZWVuIHBsYXllcnMsIHdoZXJlIGVhY2ggcGxheWVyIGlzXG4vLyBtYXRjaGVkIHdpdGggaXRzIG5laWdoYm9yLCBhcyBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgYSB0b3VybmV5LlxuZnVuY3Rpb24gcGFpcnMocGxheWVycykge1xuICBpZiAocGxheWVycy5sZW5ndGggJSAyID09PSAxKVxuICAgIHRocm93IFwiQ2FuJ3QgcGFpciBvZGQgbnVtYmVyIG9mIHBsYXllcnNcIjtcblxuICB2YXIgbWF0Y2hlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICB2YXIgbSA9IG1hdGNoLm5ldyhwbGF5ZXJzW2ldLCBwbGF5ZXJzW2krMV0pO1xuICAgIG1hdGNoZXMucHVzaChtKTtcbiAgfVxuICByZXR1cm4gbWF0Y2hlcztcbn1cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIHBsYXllcnMgc3BsaXQgaW50byBncm91cHMgb2YgbGVuZ3RocyBzcGVjaWZpZWRcbi8vIGJ5IGBncm91cHNgLlxuZnVuY3Rpb24gc3BsaXQocGxheWVycywgZ3JvdXBzKSB7XG4gIGlmIChncm91cHMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBbcGxheWVyc107XG5cbiAgdmFyIGhkID0gcGxheWVycy5zbGljZSgwLCBncm91cHNbMF0pO1xuICB2YXIgdGwgPSBwbGF5ZXJzLnNsaWNlKGdyb3Vwc1swXSk7XG4gIHZhciBnID0gZ3JvdXBzLnNsaWNlKDEpO1xuICByZXR1cm4gW2hkXS5jb25jYXQoc3BsaXQodGwsIGcpKTtcbn1cblxuLy8gUmV0dXJuIFtzdGFydCwgLi4uLCBlbmRdLCB3aGVyZSBzdGFydCBkZWZhdWx0cyB0byAxXG5mdW5jdGlvbiByYW5nZShlbmQsIHN0YXJ0KSB7XG4gIGlmIChzdGFydCA9PSBudWxsKSBzdGFydCA9IDE7XG4gIGlmIChlbmQgPCBzdGFydCkgcmV0dXJuIFtdO1xuICBlbHNlIHJldHVybiByYW5nZShlbmQgLSAxLCBzdGFydCkuY29uY2F0KGVuZCk7XG59XG5cbi8vIE1peCBwbGF5ZXJzIG91dCBvZiBlbGltaW5hdGlvbiByb3VuZHMgYXMgdG8gbm90IG1lZXQgYWdhaW4gaW4gdGhlXG4vLyBmaXJzdCBsZXZlbCBvZiBhIHRvdXJuZXkuICBbWzEsMl0sWzMsNF0sLi4uXSB5aWVsZHMgWzEsMywyLDQsLi4uXS5cbmZ1bmN0aW9uIG1peChncm91cHMpIHtcbiAgaWYgKGdyb3Vwc1swXS5sZW5ndGggPT09IDApIHJldHVybiBncm91cHNbMV07XG4gIGlmIChncm91cHNbMV0ubGVuZ3RoID09PSAwKSByZXR1cm4gZ3JvdXBzWzBdO1xuXG4gIHZhciBoZWFkcyA9IGdyb3Vwcy5tYXAoZyA9PiBnWzBdKTtcbiAgdmFyIHRhaWxzID0gZ3JvdXBzLm1hcChnID0+IGcuc2xpY2UoMSkpO1xuXG4gIHJldHVybiBoZWFkcy5jb25jYXQobWl4KHRhaWxzKSk7XG59XG5cbmZ1bmN0aW9uIGxhc3QobWF0Y2hlcykge1xuICByZXR1cm4gbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdO1xufVxuXG5mdW5jdGlvbiBzaHVmZmxlKGFycmF5KSB7XG4gIHZhciByID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKTtcblxuICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBqID0gcigpO1xuICAgIHdoaWxlIChzaHVmZmxlZFtqXSlcbiAgICAgIGogPSAoaiArIDEpICUgYXJyYXkubGVuZ3RoO1xuICAgIHNodWZmbGVkW2pdID0gYXJyYXlbaV07XG4gIH1cblxuICByZXR1cm4gc2h1ZmZsZWQ7XG59XG5cbi8vfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+flxuLy8gVmlld1xuXG52YXIgcmVuZGVyID0ge1xuICBldmVudHM6IGZ1bmN0aW9uKGVzKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVzLmZvckVhY2goZSA9PiB7ICRmLmFwcGVuZENoaWxkKHJlbmRlci5ldmVudChlKSk7IH0pO1xuICAgIHJldHVybiAkZjtcbiAgfSxcblxuICBldmVudDogZnVuY3Rpb24oZSkge1xuICAgIGlmIChpc0xlYWd1ZShlKSkgcmV0dXJuIHJlbmRlci5sZWFndWUoZSk7XG4gICAgZWxzZSByZXR1cm4gcmVuZGVyLnRvdXJuZXkoZSk7XG4gIH0sXG5cbiAgbGVhZ3VlOiBmdW5jdGlvbihsKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJGYuY2xhc3NMaXN0LmFkZCgnbGVhZ3VlJyk7XG5cbiAgICB2YXIgJGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgJGhlYWRlci50ZXh0Q29udGVudCA9ICdMZWFndWUnO1xuICAgICRmLmFwcGVuZENoaWxkKCRoZWFkZXIpO1xuXG4gICAgdmFyICRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkZGl2LmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1jb250ZW50Jyk7XG5cbiAgICB2YXIgJG1hdGNoZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpO1xuICAgICRtYXRjaGVzLmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1tYXRjaGVzJyk7XG4gICAgbC5mb3JFYWNoKG0gPT4geyAkbWF0Y2hlcy5hcHBlbmRDaGlsZChyZW5kZXIubWF0Y2gobSkpOyB9KTtcbiAgICAkZGl2LmFwcGVuZENoaWxkKCRtYXRjaGVzKTtcblxuICAgIHZhciAkc2NvcmVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICAkc2NvcmVzLmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1zY29yZXMnKTtcbiAgICB2YXIgJHNjb3Jlc19oZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgIHZhciAkdGhfcGxheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICAkdGhfcGxheWVyLnRleHRDb250ZW50ID0gJ1BsYXllcic7XG4gICAgJHNjb3Jlc19oZWFkLmFwcGVuZENoaWxkKCR0aF9wbGF5ZXIpO1xuXG4gICAgdmFyICR0aF9zY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgJHRoX3Njb3JlLnRleHRDb250ZW50ID0gJ1Njb3JlJztcbiAgICAkc2NvcmVzX2hlYWQuYXBwZW5kQ2hpbGQoJHRoX3Njb3JlKTtcblxuICAgICRzY29yZXMuYXBwZW5kQ2hpbGQoJHNjb3Jlc19oZWFkKTtcblxuICAgIHNjb3JlcyhsKS5mb3JFYWNoKChbayx2XSkgPT4ge1xuICAgICAgdmFyICRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgdmFyICRuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICRuYW1lLnRleHRDb250ZW50ID0gbmFtZShrKTtcbiAgICAgICRzLmFwcGVuZENoaWxkKCRuYW1lKTtcblxuICAgICAgdmFyICRwb2ludHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgJHBvaW50cy50ZXh0Q29udGVudCA9IHY7XG4gICAgICAkcy5hcHBlbmRDaGlsZCgkcG9pbnRzKTtcblxuICAgICAgJHNjb3Jlcy5hcHBlbmRDaGlsZCgkcyk7XG4gICAgfSk7XG5cbiAgICAkZGl2LmFwcGVuZENoaWxkKCRzY29yZXMpO1xuXG4gICAgJGYuYXBwZW5kQ2hpbGQoJGRpdik7XG5cbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgdG91cm5leTogZnVuY3Rpb24odCkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ3RvdXJuZXknKTtcblxuICAgIHZhciAkaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAkaGVhZGVyLnRleHRDb250ZW50ID0gJ1RvdXJuZXknO1xuICAgICRmLmFwcGVuZENoaWxkKCRoZWFkZXIpO1xuXG4gICAgdmFyICR0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJHQuY2xhc3NMaXN0LmFkZCgndG91cm5leS1tYXRjaGVzJyk7XG4gICAgdC5mb3JFYWNoKGwgPT4geyAkdC5hcHBlbmRDaGlsZChyZW5kZXIubGV2ZWwobCkpOyB9KTtcbiAgICAkZi5hcHBlbmRDaGlsZCgkdCk7XG5cbiAgICB2YXIgJHdpbm5lckxldmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAkd2lubmVyTGV2ZWwuY2xhc3NMaXN0LmFkZCgnbGV2ZWwnKTtcblxuICAgIHZhciAkd2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICR3aW5uZXIuY2xhc3NMaXN0LmFkZCgncGxheWVyLW5hbWUnKTtcbiAgICAkd2lubmVyLmNsYXNzTGlzdC5hZGQoJ3dpbm5lcicpO1xuICAgICR3aW5uZXIudGV4dENvbnRlbnQgPSBuYW1lKGxhc3QodClbMF0ud2lubmVyKTtcbiAgICAkd2lubmVyTGV2ZWwuYXBwZW5kQ2hpbGQoJHdpbm5lcik7XG5cbiAgICAkdC5hcHBlbmRDaGlsZCgkd2lubmVyTGV2ZWwpO1xuXG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIGxldmVsOiBmdW5jdGlvbihsKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICRmLmFwcGVuZENoaWxkKHJlbmRlci5tYXRjaGVzKGwpKTtcbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgbWF0Y2hlczogZnVuY3Rpb24obXMpIHtcbiAgICB2YXIgJGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ2xldmVsJyk7XG4gICAgbXMuZm9yRWFjaChtID0+IHsgJGYuYXBwZW5kQ2hpbGQocmVuZGVyLm1hdGNoKG0pKTsgfSk7XG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIG1hdGNoOiBmdW5jdGlvbihtKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAkZi5jbGFzc0xpc3QuYWRkKCdtYXRjaCcpO1xuICAgIGlmIChtLnAxID09PSBtLnAyKVxuICAgICAgJGYuY2xhc3NMaXN0LmFkZCgnYnllJyk7XG5cbiAgICB2YXIgJHBsYXllcjEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkcGxheWVyMS5jbGFzc0xpc3QuYWRkKCdwbGF5ZXIxJyk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJHBsYXllcjEpO1xuXG4gICAgdmFyICRwMSA9IHJlbmRlci5wbGF5ZXIobS5wMSwgbSk7XG4gICAgJHBsYXllcjEuYXBwZW5kQ2hpbGQoJHAxKTtcblxuICAgIHZhciAkY2hhcl9wMSA9IHJlbmRlci5jaGFyc19saXN0KG0ucDEsIG0ucDFfY2hhcik7XG4gICAgJGNoYXJfcDEuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBtLnAxX2NoYXIgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICBzZXRfbGFzdF9jaGFyKG0ucDEsIG0ucDFfY2hhcik7XG4gICAgfSk7XG4gICAgJHAxLmFwcGVuZENoaWxkKCRjaGFyX3AxKTtcbiAgICAkcDEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHsgbS5wMV9jaGFyID0gJGNoYXJfcDEudmFsdWUgfSk7XG5cbiAgICB2YXIgJHBsYXllcjIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkcGxheWVyMi5jbGFzc0xpc3QuYWRkKCdwbGF5ZXIyJyk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJHBsYXllcjIpO1xuXG4gICAgdmFyICRwMiA9IHJlbmRlci5wbGF5ZXIobS5wMiwgbSk7XG4gICAgJHBsYXllcjIuYXBwZW5kQ2hpbGQoJHAyKTtcblxuICAgIHZhciAkY2hhcl9wMiA9IHJlbmRlci5jaGFyc19saXN0KG0ucDIsIG0ucDJfY2hhcik7XG4gICAgJGNoYXJfcDIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBtLnAyX2NoYXIgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICBzZXRfbGFzdF9jaGFyKG0ucDIsIG0ucDJfY2hhcik7XG4gICAgfSk7XG4gICAgJHAyLmFwcGVuZENoaWxkKCRjaGFyX3AyKTtcbiAgICAkcDIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHsgbS5wMl9jaGFyID0gJGNoYXJfcDIudmFsdWUgfSk7XG5cbiAgICB2YXIgJHJlc2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgJHJlc2V0LmNsYXNzTGlzdC5hZGQoJ3Jlc2V0LW1hdGNoJyk7XG4gICAgJHJlc2V0LnRleHRDb250ZW50ID0gJ1gnO1xuICAgICRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIG0ud2lubmVyID0gbnVsbDtcbiAgICAgIG0ucDFfY2hhciA9IG51bGw7XG4gICAgICBtLnAyX2NoYXIgPSBudWxsO1xuICAgIH0pO1xuICAgICRmLmFwcGVuZENoaWxkKCRyZXNldCk7XG5cbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgY2hhcnNfbGlzdDogZnVuY3Rpb24ocCwgcF9jaGFyKSB7XG4gICAgdmFyICRwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAkcC5jbGFzc0xpc3QuYWRkKCdjaGFyJyk7XG4gICAgJHAudHlwZSA9ICd0ZXh0JztcbiAgICAkcC5wbGFjZWhvbGRlciA9ICdEYW4nO1xuICAgICRwLnNldEF0dHJpYnV0ZSgnbGlzdCcsICdhbGwtY2hhcnMnKTtcbiAgICB2YXIgY2ggPSBwX2NoYXIgfHwgbGFzdF9jaGFyKHApIHx8IHJldHJpZXZlKG5hbWUocCkpO1xuICAgIGlmIChjaCAhPSBudWxsKVxuICAgICAgJHAudmFsdWUgPSBjaDtcblxuICAgIHJldHVybiAkcDtcbiAgfSxcblxuICBwbGF5ZXI6IGZ1bmN0aW9uKHAsIG0pIHtcbiAgICB2YXIgJGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkZi5jbGFzc0xpc3QuYWRkKCdwbGF5ZXItaW5mbycpO1xuXG4gICAgdmFyICRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICRidXR0b24uaWQgPSBgcmFkaW8tJHtnZW5pZCgpfWA7XG4gICAgJGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFkaW8nKTtcblxuICAgICRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7IG0ud2lubmVyID0gcDsgfSk7XG4gICAgaWYgKHAgPT09IG0ud2lubmVyKCkpXG4gICAgICAkYnV0dG9uLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsIHRydWUpO1xuICAgIGlmIChuYW1lKG0ucDEpID09IG51bGwgfHwgbmFtZShtLnAyKSA9PSBudWxsKVxuICAgICAgJGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJGJ1dHRvbik7XG5cbiAgICB2YXIgJGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAkbGFiZWwuY2xhc3NMaXN0LmFkZCgncGxheWVyLW5hbWUnKTtcbiAgICAkbGFiZWwudGV4dENvbnRlbnQgPSBuYW1lKHApO1xuICAgICRsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICRidXR0b24uaWQpO1xuICAgICRmLmFwcGVuZENoaWxkKCRsYWJlbCk7XG5cbiAgICByZXR1cm4gJGY7XG4gIH0sXG59O1xuXG52YXIgdmlldyA9IHtcbiAgbmV3OiBmdW5jdGlvbigkcm9vdCwgZXZlbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fcHJvdG9fXzogdGhpcyxcbiAgICAgICRyb290LCBldmVudHMsXG4gICAgfTtcbiAgfSxcblxuICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRyb290LmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuJHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyLmV2ZW50cyh0aGlzLmV2ZW50cykpO1xuICB9LFxufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgdmFyICRwbGF5ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BsYXllci1saXN0Jyk7XG4gIHZhciAkbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYXRjaC1saXN0Jyk7XG4gIHZhciAkbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuLXBsYXllcnMnKTtcblxuICB2YXIgdiA9IHZpZXcubmV3KCRsaXN0KTtcblxuICAkbi5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICB2YXIgbiA9IHBhcnNlSW50KCRuLnZhbHVlLCAxMCk7XG4gICAgdmFyIHBsYXllcnMgPSBbXTtcblxuICAgIHJhbmdlKG4pLmZvckVhY2goaSA9PiB7XG4gICAgICBpZiAoJHBsYXllcnMuY2hpbGROb2Rlc1tpXSA9PSBudWxsKSB7XG4gICAgICAgIHZhciAkZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICRkaXYuaWQgPSBgcGxheWVyLSR7aX1gO1xuICAgICAgICAkZGl2LmNsYXNzTGlzdC5hZGQoJ25hbWUtY29udGFpbmVyJyk7XG5cbiAgICAgICAgdmFyICRuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgJG5hbWUuY2xhc3NMaXN0LmFkZCgnbmFtZScpO1xuICAgICAgICAkbmFtZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dCcpO1xuICAgICAgICAkbmFtZS52YWx1ZSA9IHJldHJpZXZlKCRkaXYuaWQpIHx8ICdQJyArIGk7XG4gICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoJG5hbWUpO1xuXG4gICAgICAgIHZhciAkbG9jayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICRsb2NrLmlkID0gYGxvY2stJHtpfWA7XG4gICAgICAgICRsb2NrLmNsYXNzTGlzdC5hZGQoJ2xvY2snKTtcbiAgICAgICAgJGxvY2suc2V0QXR0cmlidXRlKCd0eXBlJywgJ2NoZWNrYm94Jyk7XG4gICAgICAgICRsb2NrLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICRuYW1lLmNsYXNzTGlzdC50b2dnbGUoJ2xvY2tlZCcpO1xuICAgICAgICAgICRuYW1lLmRpc2FibGVkID0gISRuYW1lLmRpc2FibGVkO1xuICAgICAgICB9KTtcbiAgICAgICAgJGRpdi5hcHBlbmRDaGlsZCgkbG9jayk7XG5cbiAgICAgICAgdmFyICRsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICRsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICRsb2NrLmlkKTtcbiAgICAgICAgJGxhYmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhIGZhLXVubG9ja1wiPjwvaT48aSBjbGFzcz1cImZhIGZhLWxvY2tcIj48L2k+JztcbiAgICAgICAgJGRpdi5hcHBlbmRDaGlsZCgkbGFiZWwpO1xuXG4gICAgICAgICRwbGF5ZXJzLmFwcGVuZENoaWxkKCRkaXYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHBsYXllcnMuY2hpbGROb2Rlc1tpXS5jbGFzc0xpc3QucmVtb3ZlKCdvZmYnKTtcbiAgICAgICAgdmFyICRuYW1lID0gJHBsYXllcnMucXVlcnlTZWxlY3RvcihgI3BsYXllci0ke2l9IC5uYW1lYCk7XG4gICAgICB9XG4gICAgICBwbGF5ZXJzLnB1c2goe25hbWU6ICgpID0+ICRuYW1lLnZhbHVlfSk7XG4gICAgfSk7XG5cbiAgICByYW5nZSgkcGxheWVycy5jaGlsZE5vZGVzLmxlbmd0aC0xLCBuKzEpLmZvckVhY2goaSA9PiB7XG4gICAgICAkcGxheWVycy5jaGlsZE5vZGVzW2ldLmNsYXNzTGlzdC5hZGQoJ29mZicpO1xuICAgIH0pO1xuXG4gICAgdi5ldmVudHMgPSBldmVudHMocGxheWVycyk7XG4gICAgdi5yZWZyZXNoKCk7XG4gIH0pO1xuXG4gICRuLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcpKTtcblxuICAkcGxheWVycy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChldmVudCkgPT4ge1xuICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCduYW1lJykpIHtcbiAgICAgIHNhdmUoZXZlbnQudGFyZ2V0LmlkLCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgdi5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkbGlzdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldmVudCA9PiB7XG4gICAgLy8gTmVlZCB0aGUgc2V0VGltZW91dCB0byBsZXQgdGhlIGV2ZW50IGJ1YmJsZSBhbmQgYmUgY2F1Z2h0IGJ5XG4gICAgLy8gb3RoZXIgbGlzdGVuZXJzIGJlZm9yZSByZWNyZWF0aW5nIHRoZSB2aWV3XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHYucmVmcmVzaCgpOyB9ICwgMCk7XG4gIH0pO1xuXG4gIHZhciAkc2h1ZmZsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaHVmZmxlLXBsYXllcnMnKTtcbiAgJHNodWZmbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgdmFyICRuYW1lcyA9IFtdLmZpbHRlci5jYWxsKFxuICAgICAgJHBsYXllcnMucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQubmFtZScpLFxuICAgICAgJHAgPT4gISRwLnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdvZmYnKVxuICAgICAgICAgJiYgISRwLmNsYXNzTGlzdC5jb250YWlucygnbG9ja2VkJykpO1xuICAgIHZhciBuYW1lcyA9IFtdLm1hcC5jYWxsKCRuYW1lcywgJGkgPT4gJGkudmFsdWUpO1xuICAgIG5hbWVzID0gc2h1ZmZsZShuYW1lcyk7XG4gICAgW10uZm9yRWFjaC5jYWxsKCRuYW1lcywgKCRuLGkpID0+IHsgJG4udmFsdWUgPSBuYW1lc1tpXTsgfSk7XG4gICAgdi5yZWZyZXNoKCk7XG4gIH0pO1xufSk7XG5cbnZhciBzYXZlID0gKGssdikgPT4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oayx2KTtcbnZhciByZXRyaWV2ZSA9IGsgPT4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oayk7XG52YXIgZ2VuaWQgPSAoKCkgPT4geyB2YXIgaSA9IDA7IHJldHVybiAoKSA9PiArK2kgfSkoKTtcbiJdfQ==