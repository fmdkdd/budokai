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

function events(players, eventType) {
  var n = players.length;

  if (eventType === "league") return [shuffle(league(players))];

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
  var $isTourney = document.querySelector("#event-type-tourney");
  var $isLeague = document.querySelector("#event-type-league");

  var v = view.new($list);

  $n.addEventListener("input", refreshEvents);
  $isTourney.addEventListener("input", refreshEvents);
  $isLeague.addEventListener("change", refreshEvents);

  function refreshEvents() {
    var n = parseInt($n.value, 10);
    var eventType = $isTourney.checked ? "tourney" : "league";
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

    v.events = events(players, eventType);
    v.refresh();
  }

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

//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxnQkFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEMsTUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0IsV0FBTyxFQUFFLENBQUM7R0FDWDs7QUFFRCxPQUFLLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDakIsUUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0MsTUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsV0FBTyxFQUFFLENBQUM7R0FDWDs7QUFFRCxTQUFPLEVBQUUsVUFBUyxFQUFFLEVBQUU7QUFDcEIsUUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxNQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixNQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQUUsUUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FBRSxDQUFDLENBQUM7QUFDdEQsV0FBTyxFQUFFLENBQUM7R0FDWDs7QUFFRCxPQUFLLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDakIsUUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxNQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixRQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFDZixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFMUIsUUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxZQUFRLENBQUMs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LENBQUMsTUFBTSxFQUFFLFVBQUEsRUFBRTthQUFJLEVBQUUsQ0FBQyxLQUFLO0tBQUEsQ0FBQyxDQUFDO0FBQ2hELFNBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsTUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUMsRUFBRSxFQUFDLENBQUMsRUFBSztBQUFFLFFBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQUUsQ0FBQyxDQUFDO0FBQzVELEtBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFJLElBQUksR0FBRyxVQUFDLENBQUMsRUFBQyxDQUFDO1NBQUssWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0NBQUEsQ0FBQztBQUM5QyxJQUFJLFFBQVEsR0FBRyxVQUFBLENBQUM7U0FBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUFBLENBQUM7QUFDNUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxZQUFNO0FBQUUsTUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEFBQUMsT0FBTztXQUFNLEVBQUUsQ0FBQztHQUFBLENBQUE7Q0FBRSxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJidWRva2FpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVG91cm5hbWVudCBoZWxwZXJcbi8vIDEuIEFzayBmb3IgbnVtYmVyIG9mIHBhcnRpY2lwYW50c1xuLy8gMi4gU2hvdyB0aGUgZm9ybSBvZiB0aGUgdG91cm5hbWVudCB3aXRoIG51bWJlcnNcbi8vIDMuIENhbiBhc3NpZ24gbmFtZXMgdG8gbnVtYmVyc1xuLy8gNC4gQ2FuIHNodWZmbGUgcGFydGljaXBhbnRzXG4vLyA1LiBHaXZlcyBsaXN0IG9mIG1hdGNoZXMgdG8gcGxheVxuLy8gNi4gQ2FuIGNoYW5nZSB3aW5uZXIgb2YgbWF0Y2ggYXQgd2lsbFxuXG4vLyBUT0RPOiBzdGF0aWMgdmlld3MgZm9yIHBvc3Rlcml0eVxuLy8gVE9ETzogZGlmZmVyZW50IG9wdGlvbnMgKGluIG51bWJlciBvZiBtYXRjaGVzKSB3aGVyZSBpdCBtYWtlcyBzZW5zZVxuLy8gVE9ETzogbG9zZXJzIGJyYWNrZXQgYXMgYW4gb3B0aW9uXG5cbmZ1bmN0aW9uIGV2ZW50cyhwbGF5ZXJzLCBldmVudFR5cGUpIHtcbiAgdmFyIG4gPSBwbGF5ZXJzLmxlbmd0aDtcblxuICBpZiAoZXZlbnRUeXBlID09PSAnbGVhZ3VlJylcbiAgICByZXR1cm4gW3NodWZmbGUobGVhZ3VlKHBsYXllcnMpKV07XG5cbiAgaWYgKG4gPT09IDMpIHtcbiAgICByZXR1cm4gW3NodWZmbGUobGVhZ3VlKHBsYXllcnMpKV07XG4gIH1cblxuICBlbHNlIGlmIChuID09PSA0IHx8IG4gPT09IDgpXG4gICAgcmV0dXJuIFt0b3VybmV5KHBsYXllcnMpXTtcblxuICBlbHNlIGlmIChuID09PSA1KSB7XG4gICAgdmFyIFtnMSwgZzJdID0gc3BsaXQocGxheWVycywgWzMsMl0pO1xuICAgIHZhciBsID0gc2h1ZmZsZShsZWFndWUoZzEpKTtcbiAgICB2YXIgdyA9IGJlc3QoMiwgbCk7XG4gICAgcmV0dXJuIFtsLCB0b3VybmV5KG1peChbdywgZzJdKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gNikge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFszLDNdKTtcbiAgICB2YXIgbDEgPSBzaHVmZmxlKGxlYWd1ZShnMSkpO1xuICAgIHZhciBsMiA9IHNodWZmbGUobGVhZ3VlKGcyKSk7XG4gICAgdmFyIHcxID0gYmVzdCgyLCBsMSk7XG4gICAgdmFyIHcyID0gYmVzdCgyLCBsMik7XG4gICAgcmV0dXJuIFtsMSwgbDIsIHRvdXJuZXkobWl4KFt3MSwgdzJdKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gNykge1xuICAgIHJldHVybiBbdG91cm5leShwbGF5ZXJzLmNvbmNhdChsYXN0KHBsYXllcnMpKSldO1xuICB9XG5cbiAgZWxzZSBpZiAobiA9PT0gOSkge1xuICAgIHZhciBbZzEsIGcyXSA9IHNwbGl0KHBsYXllcnMsIFszLDZdKTtcbiAgICB2YXIgbCA9IHNodWZmbGUobGVhZ3VlKGcxKSk7XG4gICAgdmFyIHcgPSBiZXN0KDIsIGwpO1xuICAgIHJldHVybiBbbCwgdG91cm5leShtaXgoW3csIGcyXSkpXTtcbiAgfVxuXG4gIGVsc2UgaWYgKG4gPT09IDEwKSB7XG4gICAgdmFyIFtnMSwgZzJdID0gc3BsaXQocGxheWVycywgWzQsNl0pO1xuICAgIHZhciBsID0gc2h1ZmZsZShsZWFndWUoZzEpKTtcbiAgICB2YXIgdyA9IGJlc3QoMiwgbCk7XG4gICAgcmV0dXJuIFtsLCB0b3VybmV5KG1peChbdywgZzJdKSldO1xuICB9XG5cbiAgZWxzZVxuICAgIHJldHVybiBbdG91cm5leShwbGF5ZXJzKV07XG59XG5cbnZhciBtYXRjaCA9IHtcbiAgbmV3OiBmdW5jdGlvbihwMSwgcDIpIHtcbiAgICB2YXIgbSA9IHtcbiAgICAgIF9fcHJvdG9fXzogdGhpcyxcbiAgICAgIHAxLCBwMixcbiAgICB9O1xuXG4gICAgLy8gTWF0Y2ggaXMgYSBieWVcbiAgICBpZiAocDEgPT09IHAyKVxuICAgICAgbS53aW5uZXIgPSBwMTtcblxuICAgIHJldHVybiBtO1xuICB9LFxuXG4gIGdldCB3aW5uZXIoKSB7IHJldHVybiAoKSA9PiB0aGlzLndpbiB9LFxuICBzZXQgd2lubmVyKHApIHtcbiAgICBpZiAocCA9PT0gJ3AxJykgdGhpcy53aW4gPSB0aGlzLnAxO1xuICAgIGVsc2UgaWYgKHAgPT09ICdwMicpIHRoaXMud2luID0gdGhpcy5wMjtcbiAgICBlbHNlIGlmIChwID09PSB0aGlzLnAxIHx8IHAgPT09IHRoaXMucDIgfHwgcCA9PSBudWxsKVxuICAgICAgdGhpcy53aW4gPSBwO1xuICAgIGVsc2UgdGhyb3cgXCJXaW5uZXIgc2hvdWxkIGJlIHAxLCBwMiBvciBudWxsXCI7XG4gIH0sXG5cbiAgZ2V0IGxvc2VyKCkgeyByZXR1cm4gKCkgPT4ge1xuICAgIGlmKHRoaXMud2luID09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgZWxzZSByZXR1cm4gdGhpcy53aW4gPT09IHRoaXMucDEgPyB0aGlzLnAyIDogdGhpcy5wMTtcbiAgfX0sXG59O1xuXG4vLyBSZXR1cm4gdGhlIG5hbWUgb2YgYSBwbGF5ZXJcbmZ1bmN0aW9uIG5hbWUocGxheWVyKSB7XG4gIGlmIChwbGF5ZXIgPT0gbnVsbCkgcmV0dXJuIHBsYXllcjtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdmdW5jdGlvbicpIHJldHVybiBuYW1lKHBsYXllcigpKTtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdvYmplY3QnKSByZXR1cm4gbmFtZShwbGF5ZXIubmFtZSk7XG4gIHJldHVybiBwbGF5ZXI7XG59XG5cbmZ1bmN0aW9uIGxhc3RfY2hhcihwbGF5ZXIpIHtcbiAgaWYgKHBsYXllciA9PSBudWxsKSByZXR1cm4gcGxheWVyO1xuICBpZiAodHlwZW9mIHBsYXllciA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGxhc3RfY2hhcihwbGF5ZXIoKSk7XG4gIGlmICh0eXBlb2YgcGxheWVyID09PSAnb2JqZWN0JykgcmV0dXJuIGxhc3RfY2hhcihwbGF5ZXIubGFzdF9jaGFyKTtcbiAgcmV0dXJuIHBsYXllcjtcbn1cblxuZnVuY3Rpb24gc2V0X2xhc3RfY2hhcihwbGF5ZXIsIGxhc3RfY2hhcikge1xuICBpZiAocGxheWVyID09IG51bGwpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBwbGF5ZXIgPT09ICdmdW5jdGlvbicpIHJldHVybiBzZXRfbGFzdF9jaGFyKHBsYXllcigpLCBsYXN0X2NoYXIpO1xuICBpZiAodHlwZW9mIHBsYXllciA9PT0gJ29iamVjdCcpIHtcbiAgICBzYXZlKG5hbWUocGxheWVyKSwgbGFzdF9jaGFyKTtcbiAgICBwbGF5ZXIubGFzdF9jaGFyID0gbGFzdF9jaGFyO1xuICB9XG59XG5cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIHdpbm5lcnMgZnJvbSBhIGxpc3Qgb2YgbWF0Y2hlcy5cbmZ1bmN0aW9uIHdpbm5lcnMobWF0Y2hlcykge1xuICByZXR1cm4gbWF0Y2hlcy5tYXAobSA9PiBtLndpbm5lcik7XG59XG5cbmZ1bmN0aW9uIGxvc2VycyhtYXRjaGVzKSB7XG4gIHJldHVybiBtYXRjaGVzLm1hcChtID0+IG0ubG9zZXIpO1xufVxuXG4vLyBSZXR1cm4gdGhlIGxpc3Qgb2YgdGhlIG4gYmVzdCBwbGF5ZXJzLCBkZXBlbmRpbmcgb24gYSBzY29yaW5nXG4vLyBmdW5jdGlvbiBmb3IgZWFjaCBtYXRjaC4gIFRoZSBzY29yaW5nIGZ1bmN0aW9uIHRha2VzIGEgcGxheWVyIGFuZFxuLy8gbWF0Y2gsIGFuZCByZXR1cm5zIHRoZSBwbGF5ZXIncyBzY29yZSBhcyBhIG51bWJlci5cbmZ1bmN0aW9uIGJlc3QobiwgbWF0Y2hlcywgc2NvcmluZykge1xuICByZXR1cm4gcmFuZ2Uobi0xLCAwKS5tYXAoaSA9PiBiZXN0TnRoKGkpKTtcblxuICAvLyBYWFg6IHNvcnRpbmcgYW5kIGNvbXB1dGluZyB0aGUgc2NvcmVzIGVhY2ggdGltZSBpcyBmYXIgZnJvbVxuICAvLyBvcHRpbWFsLCBidXQgd2UgYXJlIGRlYWxpbmcgd2l0aCB2ZXJ5IHNtYWxsIG51bWJlcnMgaGVyZS5cbiAgZnVuY3Rpb24gYmVzdE50aChuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ29udmVydCB0byBhcnJheSBmb3Igc29ydGluZ1xuICAgICAgdmFyIHNjb3Jlc19hcnJheSA9IFtdO1xuICAgICAgc2NvcmVzKG1hdGNoZXMsIHNjb3JpbmcpXG4gICAgICAgIC5mb3JFYWNoKChbayx2XSkgPT4geyBzY29yZXNfYXJyYXkucHVzaChbayx2XSkgfSk7XG4gICAgICBzY29yZXNfYXJyYXkuc29ydCgoW2sxLHYxXSwgW2syLHYyXSkgPT4gdjIgLSB2MSk7XG5cbiAgICAgIHZhciBiZXN0ID0gc2NvcmVzX2FycmF5W25dO1xuICAgICAgaWYgKGJlc3RbMV0gPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICBlbHNlIHJldHVybiBiZXN0WzBdO1xuICAgIH1cbiAgfVxufVxuXG4vLyBSZXR1cm4gYSBNYXAgb2YgKHNvcnRlZCkgc2NvcmVzIGZvciB0aGUgZ2l2ZW4gbWF0Y2hlcyBhbmQgYSBzY29yaW5nXG4vLyBmdW5jdGlvbi4gIFRoZSBzY29yaW5nIGZ1bmN0aW9uIHRha2VzIGEgcGxheWVyIGFuZCBtYXRjaCwgYW5kXG4vLyByZXR1cm5zIHRoZSBwbGF5ZXIncyBzY29yZSBhcyBhIG51bWJlci5cbmZ1bmN0aW9uIHNjb3JlcyhtYXRjaGVzLCBzY29yaW5nKSB7XG4gIGlmIChzY29yaW5nID09IG51bGwpIHNjb3JpbmcgPSBkZWZhdWx0U2NvcmluZztcblxuICB2YXIgc2NvcmVzID0gbmV3IE1hcCgpOyAgICAgICAvLyBNYXAgc3VwcG9ydHMgZnVuY3Rpb24ga2V5c1xuXG4gIG1hdGNoZXMuZm9yRWFjaChtID0+IHtcbiAgICBbbS5wMSwgbS5wMl0uZm9yRWFjaChwID0+IHtcbiAgICAgIHZhciBzID0gc2NvcmVzLmdldChwKSB8fCAwO1xuICAgICAgc2NvcmVzLnNldChwLCBzICsgc2NvcmluZyhwLCBtKSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHZhciBzb3J0ZWRfc2NvcmVzID0gWy4uLnNjb3Jlc107XG4gIHNvcnRlZF9zY29yZXMuc29ydCgoW2sxLHYxXSxbazIsdjJdKSA9PiB2MiAtIHYxKTtcblxuICByZXR1cm4gc29ydGVkX3Njb3Jlcztcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFNjb3JpbmcocGxheWVyLCBtYXRjaCkge1xuICBpZiAocGxheWVyID09PSBtYXRjaC53aW5uZXIoKSkgcmV0dXJuIDE7XG4gIGVsc2UgcmV0dXJuIDA7XG59XG5cbi8vIFJldHVybiB0aGUgbGlzdCBvZiBtYXRjaGVzIGJldHdlZW4gcGxheWVycywgd2hlcmUgZWFjaCBwbGF5ZXIgZ2V0c1xuLy8gdG8gbWVldCBhbGwgdGhlIG90aGVyIHBsYXllcnMgb25jZS5cbmZ1bmN0aW9uIGxlYWd1ZShwbGF5ZXJzKSB7XG4gIGlmIChwbGF5ZXJzLmxlbmd0aCA9PT0gMilcbiAgICByZXR1cm4gW21hdGNoLm5ldyhwbGF5ZXJzWzBdLCBwbGF5ZXJzWzFdKV07XG5cbiAgdmFyIHAxID0gcGxheWVyc1swXTtcbiAgdmFyIHJlc3QgPSBwbGF5ZXJzLnNsaWNlKDEpO1xuXG4gIHZhciBtYXRjaGVzID0gcmVzdC5tYXAocDIgPT4gbWF0Y2gubmV3KHAxLCBwMikpO1xuICByZXR1cm4gbWF0Y2hlcy5jb25jYXQobGVhZ3VlKHJlc3QpKTtcbn1cblxuZnVuY3Rpb24gaXNMZWFndWUoZXZlbnQpIHtcbiAgLy8gSWYgaXQgY29udGFpbnMgbWF0Y2hlcyBhdCBmaXJzdCBsZXZlbCwgaXQncyBhIGxlYWd1ZVxuICByZXR1cm4gISFldmVudFswXS5wMTtcbn1cblxuLy8gUmV0dXJuIGEgbGlzdCBvZiBsZXZlbHMsIHdoZXJlIGVhY2ggbGV2ZWwgaXMgYSBsaXN0IG9mIG1hdGNoZXNcbi8vIGJldHdlZW4gcGxheWVycyBpbiB0aGUgdG91cm5leS4gIEZpbmFsZSBpcyB0aGUgbGFzdCBsZXZlbC5cbmZ1bmN0aW9uIHRvdXJuZXkocGxheWVycykge1xuICBpZiAocGxheWVycy5sZW5ndGggPT09IDIpXG4gICAgcmV0dXJuIFtbbWF0Y2gubmV3KHBsYXllcnNbMF0sIHBsYXllcnNbMV0pXV07XG5cbiAgdmFyIG4gPSBNYXRoLnBvdygyLCBNYXRoLmZsb29yKE1hdGgubG9nKHBsYXllcnMubGVuZ3RoKS9NYXRoLkxOMikpO1xuICB2YXIgbSA9IHBsYXllcnMubGVuZ3RoIC0gbjtcbiAgaWYgKG0gPiAwKSB7XG4gICAgdmFyIFtub3csIHVwXSA9IHNwbGl0KHBsYXllcnMsIFttICogMl0pO1xuICAgIHZhciBlbGltID0gcGFpcnMobm93KTtcbiAgICB2YXIgYnllcyA9IHVwLm1hcChwID0+IG1hdGNoLm5ldyhwLHApKTtcbiAgICB2YXIgbWF0Y2hlcyA9IGVsaW0uY29uY2F0KGJ5ZXMpO1xuICAgIHJldHVybiBbbWF0Y2hlc10uY29uY2F0KHRvdXJuZXkod2lubmVycyhtYXRjaGVzKSkpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtYXRjaGVzID0gcGFpcnMocGxheWVycyk7XG4gICAgcmV0dXJuIFttYXRjaGVzXS5jb25jYXQodG91cm5leSh3aW5uZXJzKG1hdGNoZXMpKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9zZXJzQnJhY2tldCh0b3VybmV5LCBwcmV2V2lubmVycykge1xuICBpZiAocHJldldpbm5lcnMgPT0gbnVsbCkgcHJldldpbm5lcnMgPSBbXTtcbiAgaWYgKHRvdXJuZXkubGVuZ3RoID09PSAwKSByZXR1cm4gW107XG4gIGNvbnNvbGUubG9nKHByZXZXaW5uZXJzLmNvbmNhdChsb3NlcnModG91cm5leVswXSkpLmxlbmd0aCk7XG5cbiAgdmFyIG1hdGNoZXMgPSBwYWlycyhwcmV2V2lubmVycy5jb25jYXQobG9zZXJzKHRvdXJuZXlbMF0pKSk7XG4gIHJldHVybiBbbWF0Y2hlc10uY29uY2F0KGxvc2Vyc0JyYWNrZXQodG91cm5leS5zbGljZSgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5uZXJzKG1hdGNoZXMpKSk7XG59XG5cbmZ1bmN0aW9uIHRvdXJuZXlEb3VibGVFbGltaW5hdGlvbihwbGF5ZXJzKSB7XG4gIHZhciB0ID0gdG91cm5leShwbGF5ZXJzKTtcbiAgdmFyIGwgPSBsb3NlcnNCcmFja2V0KHQpO1xuICB2YXIgZmluYWxlID0gcGFpcnMod2lubmVycyhsYXN0KHQpLmNvbmNhdChsYXN0KGwpKSkpO1xuICByZXR1cm4gW3QsIGwsIGZpbmFsZV07XG59XG5cbi8vIFJldHVybiBhIGxpc3Qgb2YgbWF0Y2hlcyBiZXR3ZWVuIHBsYXllcnMsIHdoZXJlIGVhY2ggcGxheWVyIGlzXG4vLyBtYXRjaGVkIHdpdGggaXRzIG5laWdoYm9yLCBhcyBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgYSB0b3VybmV5LlxuZnVuY3Rpb24gcGFpcnMocGxheWVycykge1xuICBpZiAocGxheWVycy5sZW5ndGggJSAyID09PSAxKVxuICAgIHRocm93IFwiQ2FuJ3QgcGFpciBvZGQgbnVtYmVyIG9mIHBsYXllcnNcIjtcblxuICB2YXIgbWF0Y2hlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICB2YXIgbSA9IG1hdGNoLm5ldyhwbGF5ZXJzW2ldLCBwbGF5ZXJzW2krMV0pO1xuICAgIG1hdGNoZXMucHVzaChtKTtcbiAgfVxuICByZXR1cm4gbWF0Y2hlcztcbn1cblxuLy8gUmV0dXJuIHRoZSBsaXN0IG9mIHBsYXllcnMgc3BsaXQgaW50byBncm91cHMgb2YgbGVuZ3RocyBzcGVjaWZpZWRcbi8vIGJ5IGBncm91cHNgLlxuZnVuY3Rpb24gc3BsaXQocGxheWVycywgZ3JvdXBzKSB7XG4gIGlmIChncm91cHMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBbcGxheWVyc107XG5cbiAgdmFyIGhkID0gcGxheWVycy5zbGljZSgwLCBncm91cHNbMF0pO1xuICB2YXIgdGwgPSBwbGF5ZXJzLnNsaWNlKGdyb3Vwc1swXSk7XG4gIHZhciBnID0gZ3JvdXBzLnNsaWNlKDEpO1xuICByZXR1cm4gW2hkXS5jb25jYXQoc3BsaXQodGwsIGcpKTtcbn1cblxuLy8gUmV0dXJuIFtzdGFydCwgLi4uLCBlbmRdLCB3aGVyZSBzdGFydCBkZWZhdWx0cyB0byAxXG5mdW5jdGlvbiByYW5nZShlbmQsIHN0YXJ0KSB7XG4gIGlmIChzdGFydCA9PSBudWxsKSBzdGFydCA9IDE7XG4gIGlmIChlbmQgPCBzdGFydCkgcmV0dXJuIFtdO1xuICBlbHNlIHJldHVybiByYW5nZShlbmQgLSAxLCBzdGFydCkuY29uY2F0KGVuZCk7XG59XG5cbi8vIE1peCBwbGF5ZXJzIG91dCBvZiBlbGltaW5hdGlvbiByb3VuZHMgYXMgdG8gbm90IG1lZXQgYWdhaW4gaW4gdGhlXG4vLyBmaXJzdCBsZXZlbCBvZiBhIHRvdXJuZXkuICBbWzEsMl0sWzMsNF0sLi4uXSB5aWVsZHMgWzEsMywyLDQsLi4uXS5cbmZ1bmN0aW9uIG1peChncm91cHMpIHtcbiAgaWYgKGdyb3Vwc1swXS5sZW5ndGggPT09IDApIHJldHVybiBncm91cHNbMV07XG4gIGlmIChncm91cHNbMV0ubGVuZ3RoID09PSAwKSByZXR1cm4gZ3JvdXBzWzBdO1xuXG4gIHZhciBoZWFkcyA9IGdyb3Vwcy5tYXAoZyA9PiBnWzBdKTtcbiAgdmFyIHRhaWxzID0gZ3JvdXBzLm1hcChnID0+IGcuc2xpY2UoMSkpO1xuXG4gIHJldHVybiBoZWFkcy5jb25jYXQobWl4KHRhaWxzKSk7XG59XG5cbmZ1bmN0aW9uIGxhc3QobWF0Y2hlcykge1xuICByZXR1cm4gbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdO1xufVxuXG5mdW5jdGlvbiBzaHVmZmxlKGFycmF5KSB7XG4gIHZhciByID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyYXkubGVuZ3RoKTtcblxuICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBqID0gcigpO1xuICAgIHdoaWxlIChzaHVmZmxlZFtqXSlcbiAgICAgIGogPSAoaiArIDEpICUgYXJyYXkubGVuZ3RoO1xuICAgIHNodWZmbGVkW2pdID0gYXJyYXlbaV07XG4gIH1cblxuICByZXR1cm4gc2h1ZmZsZWQ7XG59XG5cbi8vfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+flxuLy8gVmlld1xuXG52YXIgcmVuZGVyID0ge1xuICBldmVudHM6IGZ1bmN0aW9uKGVzKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGVzLmZvckVhY2goZSA9PiB7ICRmLmFwcGVuZENoaWxkKHJlbmRlci5ldmVudChlKSk7IH0pO1xuICAgIHJldHVybiAkZjtcbiAgfSxcblxuICBldmVudDogZnVuY3Rpb24oZSkge1xuICAgIGlmIChpc0xlYWd1ZShlKSkgcmV0dXJuIHJlbmRlci5sZWFndWUoZSk7XG4gICAgZWxzZSByZXR1cm4gcmVuZGVyLnRvdXJuZXkoZSk7XG4gIH0sXG5cbiAgbGVhZ3VlOiBmdW5jdGlvbihsKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJGYuY2xhc3NMaXN0LmFkZCgnbGVhZ3VlJyk7XG5cbiAgICB2YXIgJGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgJGhlYWRlci50ZXh0Q29udGVudCA9ICdMZWFndWUnO1xuICAgICRmLmFwcGVuZENoaWxkKCRoZWFkZXIpO1xuXG4gICAgdmFyICRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkZGl2LmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1jb250ZW50Jyk7XG5cbiAgICB2YXIgJG1hdGNoZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpO1xuICAgICRtYXRjaGVzLmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1tYXRjaGVzJyk7XG4gICAgbC5mb3JFYWNoKG0gPT4geyAkbWF0Y2hlcy5hcHBlbmRDaGlsZChyZW5kZXIubWF0Y2gobSkpOyB9KTtcbiAgICAkZGl2LmFwcGVuZENoaWxkKCRtYXRjaGVzKTtcblxuICAgIHZhciAkc2NvcmVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICAkc2NvcmVzLmNsYXNzTGlzdC5hZGQoJ2xlYWd1ZS1zY29yZXMnKTtcbiAgICB2YXIgJHNjb3Jlc19oZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgIHZhciAkdGhfcGxheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICAkdGhfcGxheWVyLnRleHRDb250ZW50ID0gJ1BsYXllcic7XG4gICAgJHNjb3Jlc19oZWFkLmFwcGVuZENoaWxkKCR0aF9wbGF5ZXIpO1xuXG4gICAgdmFyICR0aF9zY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgJHRoX3Njb3JlLnRleHRDb250ZW50ID0gJ1Njb3JlJztcbiAgICAkc2NvcmVzX2hlYWQuYXBwZW5kQ2hpbGQoJHRoX3Njb3JlKTtcblxuICAgICRzY29yZXMuYXBwZW5kQ2hpbGQoJHNjb3Jlc19oZWFkKTtcblxuICAgIHNjb3JlcyhsKS5mb3JFYWNoKChbayx2XSkgPT4ge1xuICAgICAgdmFyICRzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgdmFyICRuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICRuYW1lLnRleHRDb250ZW50ID0gbmFtZShrKTtcbiAgICAgICRzLmFwcGVuZENoaWxkKCRuYW1lKTtcblxuICAgICAgdmFyICRwb2ludHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgJHBvaW50cy50ZXh0Q29udGVudCA9IHY7XG4gICAgICAkcy5hcHBlbmRDaGlsZCgkcG9pbnRzKTtcblxuICAgICAgJHNjb3Jlcy5hcHBlbmRDaGlsZCgkcyk7XG4gICAgfSk7XG5cbiAgICAkZGl2LmFwcGVuZENoaWxkKCRzY29yZXMpO1xuXG4gICAgJGYuYXBwZW5kQ2hpbGQoJGRpdik7XG5cbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgdG91cm5leTogZnVuY3Rpb24odCkge1xuICAgIHZhciAkZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ3RvdXJuZXknKTtcblxuICAgIHZhciAkaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICAkaGVhZGVyLnRleHRDb250ZW50ID0gJ1RvdXJuZXknO1xuICAgICRmLmFwcGVuZENoaWxkKCRoZWFkZXIpO1xuXG4gICAgdmFyICR0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJHQuY2xhc3NMaXN0LmFkZCgndG91cm5leS1tYXRjaGVzJyk7XG4gICAgdC5mb3JFYWNoKGwgPT4geyAkdC5hcHBlbmRDaGlsZChyZW5kZXIubGV2ZWwobCkpOyB9KTtcbiAgICAkZi5hcHBlbmRDaGlsZCgkdCk7XG5cbiAgICB2YXIgJHdpbm5lckxldmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgICAkd2lubmVyTGV2ZWwuY2xhc3NMaXN0LmFkZCgnbGV2ZWwnKTtcblxuICAgIHZhciAkd2lubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICR3aW5uZXIuY2xhc3NMaXN0LmFkZCgncGxheWVyLW5hbWUnKTtcbiAgICAkd2lubmVyLmNsYXNzTGlzdC5hZGQoJ3dpbm5lcicpO1xuICAgICR3aW5uZXIudGV4dENvbnRlbnQgPSBuYW1lKGxhc3QodClbMF0ud2lubmVyKTtcbiAgICAkd2lubmVyTGV2ZWwuYXBwZW5kQ2hpbGQoJHdpbm5lcik7XG5cbiAgICAkdC5hcHBlbmRDaGlsZCgkd2lubmVyTGV2ZWwpO1xuXG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIGxldmVsOiBmdW5jdGlvbihsKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICRmLmFwcGVuZENoaWxkKHJlbmRlci5tYXRjaGVzKGwpKTtcbiAgICByZXR1cm4gJGY7XG4gIH0sXG5cbiAgbWF0Y2hlczogZnVuY3Rpb24obXMpIHtcbiAgICB2YXIgJGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvbCcpO1xuICAgICRmLmNsYXNzTGlzdC5hZGQoJ2xldmVsJyk7XG4gICAgbXMuZm9yRWFjaChtID0+IHsgJGYuYXBwZW5kQ2hpbGQocmVuZGVyLm1hdGNoKG0pKTsgfSk7XG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIG1hdGNoOiBmdW5jdGlvbihtKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAkZi5jbGFzc0xpc3QuYWRkKCdtYXRjaCcpO1xuICAgIGlmIChtLnAxID09PSBtLnAyKVxuICAgICAgJGYuY2xhc3NMaXN0LmFkZCgnYnllJyk7XG5cbiAgICB2YXIgJHBsYXllcjEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAkcGxheWVyMS5jbGFzc0xpc3QuYWRkKCdwbGF5ZXIxJyk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJHBsYXllcjEpO1xuXG4gICAgdmFyICRwMSA9IHJlbmRlci5wbGF5ZXIobS5wMSwgbSk7XG4gICAgJHBsYXllcjEuYXBwZW5kQ2hpbGQoJHAxKTtcblxuICAgIHZhciAkY2hhcl9wMSA9IHJlbmRlci5jaGFyc19saXN0KG0ucDEsIG0ucDFfY2hhcik7XG4gICAgJGNoYXJfcDEuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2ZW50KSA9PiB7XG4gICAgICBtLnAxX2NoYXIgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICBzZXRfbGFzdF9jaGFyKG0ucDEsIG0ucDFfY2hhcik7XG4gICAgfSk7XG4gICAgJHAxLmFwcGVuZENoaWxkKCRjaGFyX3AxKTtcbiAgICAkcDEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlQ2hhcnMpO1xuXG4gICAgdmFyICRwbGF5ZXIyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJHBsYXllcjIuY2xhc3NMaXN0LmFkZCgncGxheWVyMicpO1xuICAgICRmLmFwcGVuZENoaWxkKCRwbGF5ZXIyKTtcblxuICAgIHZhciAkcDIgPSByZW5kZXIucGxheWVyKG0ucDIsIG0pO1xuICAgICRwbGF5ZXIyLmFwcGVuZENoaWxkKCRwMik7XG5cbiAgICB2YXIgJGNoYXJfcDIgPSByZW5kZXIuY2hhcnNfbGlzdChtLnAyLCBtLnAyX2NoYXIpO1xuICAgICRjaGFyX3AyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgbS5wMl9jaGFyID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgc2V0X2xhc3RfY2hhcihtLnAyLCBtLnAyX2NoYXIpO1xuICAgIH0pO1xuICAgICRwMi5hcHBlbmRDaGlsZCgkY2hhcl9wMik7XG4gICAgJHAyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUNoYXJzKTtcblxuICAgIHZhciAkcmVzZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAkcmVzZXQuY2xhc3NMaXN0LmFkZCgncmVzZXQtbWF0Y2gnKTtcbiAgICAkcmVzZXQudGV4dENvbnRlbnQgPSAnWCc7XG4gICAgJHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgbS53aW5uZXIgPSBudWxsO1xuICAgICAgbS5wMV9jaGFyID0gbnVsbDtcbiAgICAgIG0ucDJfY2hhciA9IG51bGw7XG4gICAgfSk7XG4gICAgJGYuYXBwZW5kQ2hpbGQoJHJlc2V0KTtcblxuICAgIHJldHVybiAkZjtcblxuICAgIGZ1bmN0aW9uIHNhdmVDaGFycygpIHtcbiAgICAgIG0ucDFfY2hhciA9ICRjaGFyX3AxLnZhbHVlO1xuICAgICAgbS5wMl9jaGFyID0gJGNoYXJfcDIudmFsdWU7XG4gICAgfVxuICB9LFxuXG4gIGNoYXJzX2xpc3Q6IGZ1bmN0aW9uKHAsIHBfY2hhcikge1xuICAgIHZhciAkcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgJHAuY2xhc3NMaXN0LmFkZCgnY2hhcicpO1xuICAgICRwLnR5cGUgPSAndGV4dCc7XG4gICAgJHAucGxhY2Vob2xkZXIgPSAnRGFuJztcbiAgICAkcC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCAnYWxsLWNoYXJzJyk7XG4gICAgdmFyIGNoID0gcF9jaGFyIHx8IGxhc3RfY2hhcihwKSB8fCByZXRyaWV2ZShuYW1lKHApKTtcbiAgICBpZiAoY2ggIT0gbnVsbClcbiAgICAgICRwLnZhbHVlID0gY2g7XG5cbiAgICByZXR1cm4gJHA7XG4gIH0sXG5cbiAgcGxheWVyOiBmdW5jdGlvbihwLCBtKSB7XG4gICAgdmFyICRmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgJGYuY2xhc3NMaXN0LmFkZCgncGxheWVyLWluZm8nKTtcblxuICAgIHZhciAkYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAkYnV0dG9uLmlkID0gYHJhZGlvLSR7Z2VuaWQoKX1gO1xuICAgICRidXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ3JhZGlvJyk7XG5cbiAgICAkYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4geyBtLndpbm5lciA9IHA7IH0pO1xuICAgIGlmIChwID09PSBtLndpbm5lcigpKVxuICAgICAgJGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICBpZiAobmFtZShtLnAxKSA9PSBudWxsIHx8IG5hbWUobS5wMikgPT0gbnVsbClcbiAgICAgICRidXR0b24uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICRmLmFwcGVuZENoaWxkKCRidXR0b24pO1xuXG4gICAgdmFyICRsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgJGxhYmVsLmNsYXNzTGlzdC5hZGQoJ3BsYXllci1uYW1lJyk7XG4gICAgJGxhYmVsLnRleHRDb250ZW50ID0gbmFtZShwKTtcbiAgICAkbGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAkYnV0dG9uLmlkKTtcbiAgICAkZi5hcHBlbmRDaGlsZCgkbGFiZWwpO1xuXG4gICAgcmV0dXJuICRmO1xuICB9LFxuXG4gIHNhdmVMaW5rOiBmdW5jdGlvbihldmVudHMpIHtcbiAgICB2YXIgJGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICRkaXYuY2xhc3NMaXN0LmFkZCgnYnVkb2thaS1kYXRhJyk7XG5cbiAgICB2YXIgbGluayA9IGVuY29kZShzZXJpYWxpemUuYWxsKGV2ZW50cykpO1xuXG4gICAgdmFyICRwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICRwLmNsYXNzTGlzdC5hZGQoJ2RhdGEnKTtcbiAgICAkcC50ZXh0Q29udGVudCA9IGxpbms7XG4gICAgJGRpdi5hcHBlbmRDaGlsZCgkcCk7XG5cbiAgICB2YXIgJGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgJGEuc2V0QXR0cmlidXRlKCdocmVmJywgZW5jb2RlVVJJKGBtYWlsdG86P3N1YmplY3Q9W0J1ZG9rYWldIFNhdmUgbWUmYm9keT0ke2xpbmt9YCkpO1xuICAgICRhLnRleHRDb250ZW50ID0gJ3Bvc3QnO1xuICAgICRkaXYuYXBwZW5kQ2hpbGQoJGEpO1xuXG4gICAgcmV0dXJuICRkaXY7XG4gIH0sXG59O1xuXG52YXIgdmlldyA9IHtcbiAgbmV3OiBmdW5jdGlvbigkcm9vdCwgZXZlbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fcHJvdG9fXzogdGhpcyxcbiAgICAgICRyb290LCBldmVudHMsXG4gICAgfTtcbiAgfSxcblxuICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRyb290LmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuJHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyLmV2ZW50cyh0aGlzLmV2ZW50cykpO1xuICAgIHRoaXMuJHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyLnNhdmVMaW5rKHRoaXMuZXZlbnRzKSk7XG4gIH0sXG59O1xuXG52YXIgc2VyaWFsaXplID0ge1xuICBhbGwoZXZlbnRzKSB7XG4gICAgdmFyIGV2ID0gW107XG5cbiAgICBldmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAgIGlmIChpc0xlYWd1ZShlKSkgZXYucHVzaChzZXJpYWxpemUubGVhZ3VlKGUpKVxuICAgICAgZWxzZSBldi5wdXNoKHNlcmlhbGl6ZS50b3VybmV5KGUpKVxuICAgIH0pO1xuXG4gICAgdmFyIG0gPSB7XG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAgZGF0ZTogKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXVxuICAgICAgLGV2ZW50czogZXZcbiAgICB9O1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG0pO1xuICB9LFxuXG4gIGxlYWd1ZShsKSB7XG4gICAgcmV0dXJuIGwubWFwKG0gPT4gc2VyaWFsaXplLm1hdGNoKG0pKTtcbiAgfSxcblxuICB0b3VybmV5KHQpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IFtdO1xuICAgIHQuZm9yRWFjaChicmFja2V0ID0+IGJyYWNrZXQuZm9yRWFjaChtID0+IHtcbiAgICAgIGlmIChtLnAxICE9PSBtLnAyKVxuICAgICAgbWF0Y2hlcy5wdXNoKHNlcmlhbGl6ZS5tYXRjaChtKSk7XG4gICAgfSkpO1xuICAgIHJldHVybiBtYXRjaGVzO1xuICB9LFxuXG4gIG1hdGNoKG0pIHtcbiAgICB2YXIgd2lubmVyO1xuICAgIGlmIChtLnAxID09PSBtLndpbm5lcigpKVxuICAgICAgd2lubmVyID0gJ3AxJztcbiAgICBlbHNlIGlmIChtLndpbm5lcigpID09PSBtLnAyKVxuICAgICAgd2lubmVyID0gJ3AyJztcblxuICAgIHJldHVybiB7XG4gICAgICBwMToge25hbWU6IG5hbWUobS5wMSksXG4gICAgICAgICAgIGNoYXI6IG0ucDFfY2hhcn0sXG4gICAgICBwMjoge25hbWU6IG5hbWUobS5wMiksXG4gICAgICAgICAgIGNoYXI6IG0ucDJfY2hhcn0sXG4gICAgICB3aW5uZXIsXG4gICAgfTtcbiAgfSxcbn07XG5cbnZhciBlbmNvZGUgPSBzID0+IGJ0b2EoZW5jb2RlVVJJKHMpKVxudmFyIGRlY29kZSA9IHMgPT4gZGVjb2RlVVJJKGF0b2IocykpXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIHZhciAkcGxheWVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwbGF5ZXItbGlzdCcpO1xuICB2YXIgJGxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWF0Y2gtbGlzdCcpO1xuICB2YXIgJG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbi1wbGF5ZXJzJyk7XG4gIHZhciAkaXNUb3VybmV5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2V2ZW50LXR5cGUtdG91cm5leScpO1xuICB2YXIgJGlzTGVhZ3VlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2V2ZW50LXR5cGUtbGVhZ3VlJyk7XG5cbiAgdmFyIHYgPSB2aWV3Lm5ldygkbGlzdCk7XG5cbiAgJG4uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCByZWZyZXNoRXZlbnRzKTtcbiAgJGlzVG91cm5leS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHJlZnJlc2hFdmVudHMpO1xuICAkaXNMZWFndWUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVmcmVzaEV2ZW50cyk7XG5cbiAgZnVuY3Rpb24gcmVmcmVzaEV2ZW50cygpIHtcbiAgICB2YXIgbiA9IHBhcnNlSW50KCRuLnZhbHVlLCAxMCk7XG4gICAgdmFyIGV2ZW50VHlwZSA9ICRpc1RvdXJuZXkuY2hlY2tlZCA/ICd0b3VybmV5JyA6ICdsZWFndWUnO1xuICAgIHZhciBwbGF5ZXJzID0gW107XG5cbiAgICByYW5nZShuKS5mb3JFYWNoKGkgPT4ge1xuICAgICAgaWYgKCRwbGF5ZXJzLmNoaWxkTm9kZXNbaV0gPT0gbnVsbCkge1xuICAgICAgICB2YXIgJGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAkZGl2LmlkID0gYHBsYXllci0ke2l9YDtcbiAgICAgICAgJGRpdi5jbGFzc0xpc3QuYWRkKCduYW1lLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIHZhciAkbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICRuYW1lLmNsYXNzTGlzdC5hZGQoJ25hbWUnKTtcbiAgICAgICAgJG5hbWUuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQnKTtcbiAgICAgICAgJG5hbWUudmFsdWUgPSByZXRyaWV2ZSgkZGl2LmlkKSB8fCAnUCcgKyBpO1xuICAgICAgICAkZGl2LmFwcGVuZENoaWxkKCRuYW1lKTtcblxuICAgICAgICB2YXIgJGxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAkbG9jay5pZCA9IGBsb2NrLSR7aX1gO1xuICAgICAgICAkbG9jay5jbGFzc0xpc3QuYWRkKCdsb2NrJyk7XG4gICAgICAgICRsb2NrLnNldEF0dHJpYnV0ZSgndHlwZScsICdjaGVja2JveCcpO1xuICAgICAgICAkbG9jay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAkbmFtZS5jbGFzc0xpc3QudG9nZ2xlKCdsb2NrZWQnKTtcbiAgICAgICAgICAkbmFtZS5kaXNhYmxlZCA9ICEkbmFtZS5kaXNhYmxlZDtcbiAgICAgICAgfSk7XG4gICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoJGxvY2spO1xuXG4gICAgICAgIHZhciAkbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAkbGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAkbG9jay5pZCk7XG4gICAgICAgICRsYWJlbC5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYSBmYS11bmxvY2tcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS1sb2NrXCI+PC9pPic7XG4gICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoJGxhYmVsKTtcblxuICAgICAgICAkcGxheWVycy5hcHBlbmRDaGlsZCgkZGl2KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRwbGF5ZXJzLmNoaWxkTm9kZXNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnb2ZmJyk7XG4gICAgICAgIHZhciAkbmFtZSA9ICRwbGF5ZXJzLnF1ZXJ5U2VsZWN0b3IoYCNwbGF5ZXItJHtpfSAubmFtZWApO1xuICAgICAgfVxuICAgICAgcGxheWVycy5wdXNoKHtuYW1lOiAoKSA9PiAkbmFtZS52YWx1ZX0pO1xuICAgIH0pO1xuXG4gICAgcmFuZ2UoJHBsYXllcnMuY2hpbGROb2Rlcy5sZW5ndGgtMSwgbisxKS5mb3JFYWNoKGkgPT4ge1xuICAgICAgJHBsYXllcnMuY2hpbGROb2Rlc1tpXS5jbGFzc0xpc3QuYWRkKCdvZmYnKTtcbiAgICB9KTtcblxuICAgIHYuZXZlbnRzID0gZXZlbnRzKHBsYXllcnMsIGV2ZW50VHlwZSk7XG4gICAgdi5yZWZyZXNoKCk7XG4gIH1cblxuICAkbi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnKSk7XG5cbiAgJHBsYXllcnMuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbmFtZScpKSB7XG4gICAgICBzYXZlKGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmlkLCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgdi5yZWZyZXNoKCk7XG4gICAgfVxuICB9KTtcblxuICAkbGlzdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBldmVudCA9PiB7XG4gICAgLy8gTmVlZCB0aGUgc2V0VGltZW91dCB0byBsZXQgdGhlIGV2ZW50IGJ1YmJsZSBhbmQgYmUgY2F1Z2h0IGJ5XG4gICAgLy8gb3RoZXIgbGlzdGVuZXJzIGJlZm9yZSByZWNyZWF0aW5nIHRoZSB2aWV3XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHYucmVmcmVzaCgpOyB9ICwgMCk7XG4gIH0pO1xuXG4gIHZhciAkc2h1ZmZsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaHVmZmxlLXBsYXllcnMnKTtcbiAgJHNodWZmbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgdmFyICRuYW1lcyA9IFtdLmZpbHRlci5jYWxsKFxuICAgICAgJHBsYXllcnMucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQubmFtZScpLFxuICAgICAgJHAgPT4gISRwLnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdvZmYnKVxuICAgICAgICAgJiYgISRwLmNsYXNzTGlzdC5jb250YWlucygnbG9ja2VkJykpO1xuICAgIHZhciBuYW1lcyA9IFtdLm1hcC5jYWxsKCRuYW1lcywgJGkgPT4gJGkudmFsdWUpO1xuICAgIG5hbWVzID0gc2h1ZmZsZShuYW1lcyk7XG4gICAgW10uZm9yRWFjaC5jYWxsKCRuYW1lcywgKCRuLGkpID0+IHsgJG4udmFsdWUgPSBuYW1lc1tpXTsgfSk7XG4gICAgdi5yZWZyZXNoKCk7XG4gIH0pO1xufSk7XG5cbnZhciBzYXZlID0gKGssdikgPT4gbG9jYWxTdG9yYWdlLnNldEl0ZW0oayx2KTtcbnZhciByZXRyaWV2ZSA9IGsgPT4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oayk7XG52YXIgZ2VuaWQgPSAoKCkgPT4geyB2YXIgaSA9IDA7IHJldHVybiAoKSA9PiArK2kgfSkoKTtcbiJdfQ==