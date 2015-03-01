BABEL_OPTS=--source-maps-inline --whitelist es6.destructuring,es6.properties.shorthand,es6.arrowFunctions,es6.spread,es6.templateLiterals

.PHONY: go all clean

all: budokai.js history.js stats.js

%.js: %.es6
	babel ${BABEL_OPTS} $< -o $@

go: budokai.es6
	babel --watch ${BABEL_OPTS} budokai.es6 -o budokai.js

clean:
	rm budokai.js history.js stats.js
