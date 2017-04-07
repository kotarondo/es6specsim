require("./harness.js")
load("../unicode.js")
load("../sourcetext.js")
load("../tokenizer.js")
load("../production.js")
load("../expressions.js")
load("../functions.js")
load("../statements.js")
load("../modules.js")
load("../utility.js")
load("./load_static_semantics.js")

try {
    setParsingText("a=1; b=1;");
    Assert(parseScript() instanceof Script);
    AssertEquals(peekToken(), "");

    test_early_error(parseScript, [], "let a; let a; let a", false, "EarlySyntaxError: 15.1.1-A: a", 1, 12);
    test_early_error(parseScript, [], "function a(){} let a", false, "EarlySyntaxError: 15.1.1-B: a", 1, 10);
    test_no_error(parseScript, [], "function a(){} var a");
    test_early_error(parseScript, [], "super()", false, "EarlySyntaxError: 15.1.1-C", 1, 0);
    test_early_error(parseScript, [], "new.target", false, "EarlySyntaxError: 15.1.1-D", 1, 0);
    test_early_error(parseScript, [], "L:L:L:;", false, "EarlySyntaxError: 15.1.1-E: L", 1, 3);
    test_no_error(parseScript, [], "L:;L:;");
    test_early_error(parseScript, [], "break M;", false, "EarlySyntaxError: 15.1.1-F: M", 1, 7);
    test_early_error(parseScript, [], "for(;;)continue M;", false, "EarlySyntaxError: 15.1.1-G: M", 1, 17);

    test_no_error(parseScript, [], "var f = function () { 'use strict'; return typeof this; }\nvar x;");
    test_early_error(parseScript, [], "return = 1;", false, "EarlySyntaxError");

    test_no_error(parseScript, [], "`a=2 ${b} c=1 ${d} e=3`");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
