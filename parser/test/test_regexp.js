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

try {

    test_no_error(parseExpression, [], "/ /");
    test_no_error(parseExpression, [], "/\\//");
    test_no_error(parseExpression, [], "/a|b/");
    test_no_error(parseExpression, [], "/||a|/");
    test_no_error(parseExpression, [], "/a^$|/");
    test_no_error(parseExpression, [], "/|\\b\\B|(?=)(?!)/");
    test_no_error(parseExpression, [], "/(?=|a(?!b)c|)/");
    test_no_error(parseExpression, [], "/a*b+c?a*?b+?c??d{0}d{123}d{1,}d{111,2}/");
    test_no_error(parseExpression, [], "/d{00019}?d{123}?d{123,}?d{1,00922222222222222222299999}?/");
    test_no_error(parseExpression, [], "/.\\0\\1\\2343(aa|)(||)(?:)()(?:aa|bb()(?:))/");
    test_no_error(parseExpression, [], "/\\f\\n\\r\\t\\v/");
    test_no_error(parseExpression, [], "/\\ca\\cz\\cA\\cZ/");
    test_no_error(parseExpression, [], "/\\x00\\xff\\xFF/");
    test_no_error(parseExpression, [], "/\\u0000\\uffff\\uFFFF/");
    test_no_error(parseExpression, [], "/\\ud800\\udcff\\udcFF\\d800/");
    test_no_error(parseExpression, [], "/\\u{12345}/u"); //TODO clarify the spec
    test_no_error(parseExpression, [], "/\\d\\D\\s\\S\\w\\W/");
    test_no_error(parseExpression, [], "/[][a][aa][^][^a][^aa]/");
    test_no_error(parseExpression, [], "/[-][--][---][----][-----][------]/");
    test_no_error(parseExpression, [], "/[\\0\\1\\234-\\b]/");
    test_no_error(parseExpression, [], "/[\\f-\\n-\\r\\t-\\v]/");
    test_no_error(parseExpression, [], "/[\\ca\\cz\\cA\\cZ]/");
    test_no_error(parseExpression, [], "/[\\x00\\xff\\xFF]/");
    test_no_error(parseExpression, [], "/[\\u0000\\uffff\\uFFFF]/");
    test_no_error(parseExpression, [], "/[\\ud800\\udcff\\udcFF\\d800]/");
    test_no_error(parseExpression, [], "/[\\u{12345}]/u"); //TODO clarify the spec
    test_no_error(parseExpression, [], "/[-\\d-\\D-\\s-\\S-\\w-\\W-]/");
    test_early_error(parseExpression, [], "/]/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/{/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\00/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\c0/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\x0K/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\u000K/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\u{0}/", false, "EarlySyntaxError: 12.2.8.1-A");
    test_early_error(parseExpression, [], "/\\u{999999}/u", false, "EarlySyntaxError: 12.2.8.1-A");

    test_no_error(parseExpression, [], "/\\\uD800\uDC00/"); //TODO clarify the spec

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
