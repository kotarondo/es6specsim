require("./harness.js")
load("../unicode.js")
load("../sourcetext.js")
load("../tokenizer.js")
load("../production.js")
load("../expressions.js")
load("../regexp.js")
load("../re_production.js")
load("../functions.js")
load("../statements.js")
load("../modules.js")
load("../utility.js")
load("./load_static_semantics.js")

function test_file_syntax(filename) {
    var text = require('fs').readFileSync(filename).toString();
    setParsingText(text, filename)
    parseScript();
    AssertEquals(peekToken(), "");
}

try {
    var files = ["expressions.js", "modules.js", "sourcetext.js", "tokenizer.js", "utility.js", "functions.js", "production.js", "statements.js", "unicode.js"];
    for (var i in files) {
        test_file_syntax("../" + files[i]);
    }

    var files = ["BoundNames.js", "ContainsUndefinedContinueTarget.js", "PropName.js", "ComputedPropertyContains.js", "HasDirectSuper.js", "TopLevelLexicallyDeclaredNames.js", "ContainsDuplicateLabels.js", "IsSimpleParameterList.js", "TopLevelVarDeclaredNames.js", "Contains.js", "IsValidSimpleAssignmentTarget.js", "VarDeclaredNames.js", "ContainsUndefinedBreakTarget.js", "LexicallyDeclaredNames.js"];
    for (var i in files) {
        test_file_syntax("../static_semantics/" + files[i]);
    }

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
