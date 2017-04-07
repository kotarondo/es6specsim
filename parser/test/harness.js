global.load = function(filename) {
    var source = require('fs').readFileSync(filename).toString();
    require('vm').runInThisContext(source, filename);
}

global.TestSuccess = function() {
    process.exit(0);
}

function AssertionError(message) {
    return new Error("assertion: " + message);
}

global.Assert = function(cond) {
    if (!cond) throw AssertionError("");
}

global.AssertEquals = function(a, b) {
    if (!(a === b)) throw AssertionError(a + " === " + b);
}

global.AssertGreaterEquals = function(a, b) {
    if (!(a >= b)) throw AssertionError(a + " >= " + b);
}

global.AssertLessEquals = function(a, b) {
    if (!(a <= b)) throw AssertionError(a + " <= " + b);
}

global.AssertInstanceof = function(a, b) {
    if (!(a instanceof b)) throw AssertionError(a + " instanceof " + b);
}

global.PerformanceEval = function(f, name, repeat) {
    var start = Date.now();
    var count = 0;
    do {
        for (var i = 0; i < repeat; i++) {
            f();
        }
        count++;
        var end = Date.now();
        var elapsed = end - start;
    } while (elapsed < 100);
    var v = elapsed * 0.001 / (count * repeat);
    var unit = "s";
    if (v < 1) {
        v = v * 1000;
        var unit = "ms";
        if (v < 1) {
            v = v * 1000;
            var unit = "us";
            if (v < 1) {
                v = v * 1000;
                var unit = "ns";
            }
        }
    }
    console.log("performance: " + name + ": " + v.toPrecision(3) + unit);
}

global.test_no_error = function(f, args, text, strict) {
    setParsingText(text);
    if (strict) enterStrictMode();
    f.apply(null, args);
    if (strict) leaveStrictMode();
    AssertEquals(peekToken(), "");
}

global.test_early_error = function(f, args, text, strict, expected, line, column) {
    try {
        setParsingText(text);
        if (strict) enterStrictMode();
        f.apply(null, args);
    } catch (e) {
        var ee = e;
    }
    AssertEquals(ee ? "error" : "no error", "error");
    AssertEquals(ee.toString(), expected);
    if (line) AssertEquals(ee.sourceLine, line);
    if (column) AssertEquals(ee.sourceColumn, column);
}

global.ToString = function(v) {
    return String(v);
}
