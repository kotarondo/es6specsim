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

var fs = require('fs');

function test_file_syntax(filename) {
    var text = fs.readFileSync(filename).toString();
    var comment = text.match(/\/\*---[\s\S]*---\*\//);
    var metadata = comment[0];
    var esid = metadata.match(/^ *esid:(.*)/m);
    var negative = metadata.match(/^ *negative:(.*)/m);
    var flags = metadata.match(/^ *flags:(.*)/m);
    if (esid && esid[1].indexOf("sec-") >= 0) {
        return;
    }
    if (flags && flags[1].search("module") > 0) {
        var isModule = true;
    }
    if (flags && flags[1].search("noStrict") > 0) {
        var isNoStrict = true;
    }
    if (flags && flags[1].search("onlyStrict") > 0) {
        var isOnlyStrict = true;
    }
    if (flags && flags[1].search("raw") > 0) {
        var isRaw = true;
    }
    if (!isModule && !isNoStrict && !isRaw) {
        test_raw('"use strict";\n' + text);
    }
    if (!isOnlyStrict) {
        test_raw(text);
    }

    function test_raw(text) {
        try {
            test_once(text);
        } catch (e) {
            console.log(filename);
            console.log(e);
        }
    }

    function test_once(text) {
        if (!negative) {
            test_notrap(text);
            return;
        }
        try {
            test_notrap(text);
        } catch (e) {
            if (e instanceof EarlySyntaxError) {
                if (negative[1].search("SyntaxError") < 0) {
                    throw e;
                }
            } else if (e instanceof EarlyReferenceError) {
                if (negative[1].search("[Syntax|Reference]Error") < 0) {
                    throw e;
                }
            } else {
                throw e;
            }
            return;
        }
        if (negative[1].search("SyntaxError") >= 0) {
            if (text.search(/^eval\(/m) > 0) return;
            if (text.search(/^if \(eval\(/m) > 0) return;
            throw new Error("expected: " + negative[1]);
        }
    }

    function test_notrap(text) {
        setParsingText(text, filename)
        if (isModule) {
            parseModule();
        } else {
            parseScript();
        }
        AssertEquals(peekToken(), "");
    }
}

function test_dir_syntax(dirname) {
    fs.readdirSync(dirname).forEach(function(filename) {
        var path = dirname + "/" + filename;
        if (fs.statSync(path).isDirectory()) {
            test_dir_syntax(path);
        }
        else if (path.lastIndexOf(".js") === path.length - 3) {
            test_file_syntax(path);
        }
    });
}

try {
    test_dir_syntax("/home/endo/test262/test/language");
} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
