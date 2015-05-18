'use strict';

document.addEventListener('DOMContentLoaded', init);

function init() {
  var matches = [];
  var namesDict = {};
  window.stats.forEach(function (s) {
    return s.events.forEach(function (e) {
      e.forEach(function (m) {
        namesDict[m.p1.name] = true;
        namesDict[m.p2.name] = true;
        matches.push(m);
      });
    });
  });
  var names = Object.getOwnPropertyNames(namesDict).sort();

  var matrix = computeMatchesMatrix(matches, names);
  refreshMatches(names, matrix);
}

function refreshMatches(names, matrix) {
  var frag = document.createDocumentFragment();

  var quantize = d3.scale.quantize().domain([d3.min(matrix, function (r) {
    return d3.min(r);
  }), d3.max(matrix, function (r) {
    return d3.max(r);
  })]).range(d3.range(5).map(function (i) {
    return 'q' + i;
  }));

  var chart = d3.select('#all-matches');

  chart.append('thead').append('tr').selectAll('td').data(names).enter().append('td').text(function (d) {
    return d;
  });

  chart.select('thead tr').insert('td', ':first-child');

  chart.append('tbody').selectAll('tr').data(matrix).enter().append('tr').each(makeRow);

  function makeRow(row, y) {
    d3.select(this).selectAll('td').data(row).enter().append('td').attr('data-x', function (d, x) {
      return x;
    }).attr('data-y', function (_) {
      return y;
    }).attr('class', function (d) {
      return 'square ' + quantize(d);
    }).on('mouseenter', highlightLabels).append('span').attr('class', 'delta-score').text(function (d) {
      return d;
    });

    d3.select(this).insert('td', ':first-child').attr('class', 'name').text(names[y]);
  }

  document.querySelector('#all-matches tbody').addEventListener('mouseleave', unhighlightLabels);

  function highlightLabels() {
    var target = this;
    chart.selectAll('.square').classed('inactive', function () {
      return !(this.getAttribute('data-y') === target.getAttribute('data-y') && this.getAttribute('data-x') === target.getAttribute('data-x') || this.getAttribute('data-x') === target.getAttribute('data-y') && this.getAttribute('data-y') === target.getAttribute('data-x'));
    });

    var x = parseInt(this.getAttribute('data-x'), 10);
    chart.selectAll('thead td').classed('active', function (d, i) {
      return x == i - 1;
    });
    var y = parseInt(this.getAttribute('data-y'), 10);
    chart.selectAll('.name').classed('active', function (d, i) {
      return y == i;
    });
  }

  function unhighlightLabels() {
    chart.selectAll('.inactive').classed('inactive', false);
  }
}

function computeMatchesMatrix(matches, names) {
  var matrix = [];

  // Fill matrix with zeroes
  var l = names.length;
  for (var i = 0; i < l; ++i) {
    matrix[i] = [];
    for (var j = 0; j < l; ++j) {
      matrix[i][j] = i === j ? '' : 0;
    }
  }

  // Count victories
  matches.forEach(function (m) {
    var p1 = names.indexOf(m.p1.name);
    var p2 = names.indexOf(m.p2.name);

    if (m.winner === 'p1') {
      matrix[p1][p2] += 1;
    } else {
      matrix[p2][p1] += 1;
    }
  });

  // Normalize victories
  for (var i = 0; i < l; ++i) {
    for (var j = 0; j < i; ++j) {
      var totalMatches = matrix[i][j] + matrix[j][i];
      if (totalMatches > 10) {
        matrix[i][j] *= 10 / totalMatches;
        matrix[j][i] *= 10 / totalMatches;
        matrix[i][j] = Math.round(matrix[i][j] * 10) / 10;
        matrix[j][i] = Math.round(matrix[j][i] * 10) / 10;
      }
    }
  }

  return matrix;
}

//# sourceMappingURL=stats.js.map