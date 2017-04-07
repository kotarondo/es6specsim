require("./harness.js")
load("../unicode.js")

var countZs = 0;
for (var i = 0; i <= 0x10ffff; i++) {
    if (isUnicodeZs(fromCodePoint(i))) {
        countZs++;
    }
}
AssertEquals(countZs, 18);

var countID_Start = 0;
for (var i = 0; i <= 0x10ffff; i++) {
    if (isUnicodeID_Start(fromCodePoint(i))) {
        countID_Start++;
    }
}
AssertEquals(countID_Start, 93672);

var countID_Continue = 0;
for (var i = 0; i <= 0x10ffff; i++) {
    if (isUnicodeID_Continue(fromCodePoint(i))) {
        countID_Continue++;
    }
}
AssertEquals(countID_Continue, 95331);

function perf_test_Zs(cp) {
    var testChar = fromCodePoint(eval(cp));
    PerformanceEval(function() {
            isUnicodeZs(testChar);
        },
        "isUnicodeZs(" + cp + ")", 1000000, "ns");
}

perf_test_Zs("0x7f");
perf_test_Zs("0x7fff");

function perf_test_ID_Start(cp) {
    var testChar = fromCodePoint(eval(cp));
    PerformanceEval(function() {
            isUnicodeID_Start(testChar);
        },
        "isUnicodeID_Start(" + cp + ")", 1000000, "ns");
}

perf_test_ID_Start("0x45");
perf_test_ID_Start("0x65");
perf_test_ID_Start("0x7f");
perf_test_ID_Start("0x7fff");

function perf_test_ID_Continue(cp) {
    var testChar = fromCodePoint(eval(cp));
    PerformanceEval(function() {
            isUnicodeID_Continue(testChar);
        },
        "isUnicodeID_Continue(" + cp + ")", 1000000, "ns");
}

perf_test_ID_Continue("0x35");
perf_test_ID_Continue("0x45");
perf_test_ID_Continue("0x65");
perf_test_ID_Continue("0x7f");
perf_test_ID_Continue("0x7fff");

TestSuccess();
