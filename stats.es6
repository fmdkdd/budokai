document.addEventListener('DOMContentLoaded', init);

function init() {
  var matches = [];
  var namesDict = {};
  window.stats.forEach(s => s.events.forEach(e => {
    e.forEach(m => {
      namesDict[m.p1.name] = true;
      namesDict[m.p2.name] = true;
      matches.push(m);
    });
  }));
  var names = Object.getOwnPropertyNames(namesDict);

  var matrix = computeMatchesMatrix(matches, names);
  refreshMatches(names, matrix);
}

function refreshMatches(names, matrix) {
  var frag = document.createDocumentFragment();

  var quantize = d3.scale.quantize()
    .domain([d3.min(matrix, r => d3.min(r)),
             d3.max(matrix, r => d3.max(r))])
    .range(d3.range(5).map(i => "q" + i));

  var chart = d3.select('#all-matches');

  chart.append('thead')
    .append('tr')
    .selectAll('td')
      .data(names)
    .enter().append('td')
    .text(d => d);

  chart.select('thead tr')
    .insert('td', ':first-child');

  chart.append('tbody')
    .selectAll('tr')
    .data(matrix)
    .enter().append('tr')
    .each(makeRow);

  function makeRow(row, y) {
    d3.select(this)
      .selectAll('td')
        .data(row)
      .enter().append('td')
        .attr('data-x', (d,x) => x)
        .attr('data-y', _ => y)
        .attr('class', d => 'square ' + quantize(d))
        .on('mouseenter', highlightLabels)
        .append('span')
          .attr('class', 'delta-score')
          .text(d => d);

    d3.select(this)
      .insert('td', ':first-child')
      .attr('class', 'name')
      .text(names[y]);
  }

  document.querySelector('#all-matches tbody')
    .addEventListener('mouseleave', unhighlightLabels);

  function highlightLabels() {
    var target = this;
    chart.selectAll('.square')
      .classed('inactive', function() {
        return !((this.getAttribute('data-y') === target.getAttribute('data-y')
                  && this.getAttribute('data-x') === target.getAttribute('data-x'))
                 || (this.getAttribute('data-x') === target.getAttribute('data-y')
                     && this.getAttribute('data-y') === target.getAttribute('data-x')))
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
      matrix[i][j] = 0;
    }
  }

  matches.forEach(m => {
    var p1 = names.indexOf(m.p1.name);
    var p2 = names.indexOf(m.p2.name);

    if (m.winner === 'p1') {
      matrix[p1][p2] += 1;
//      matrix[p2][p1] -= 1;
    } else {
//      matrix[p1][p2] -= 1;
      matrix[p2][p1] += 1;
    }
  });

  return matrix;
}