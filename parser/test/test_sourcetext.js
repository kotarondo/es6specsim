require("./harness.js")
load("../unicode.js")
load("../sourcetext.js")
load("../tokenizer.js")

try {

    setSourceText("");
    AssertEquals(peekChar(), "");
    AssertEquals(nextChar(), "");

    setSourceText("1");
    AssertEquals(peekChar(), "1");
    AssertEquals(nextChar(), "");
    proceedChar("1");
    AssertEquals(peekChar(), "");

    setSourceText("12");
    AssertEquals(peekChar(), "1");
    AssertEquals(nextChar(), "2");
    proceedChar("1");
    AssertEquals(peekChar(), "2");
    AssertEquals(nextChar(), "");
    proceedChar("2");
    AssertEquals(peekChar(), "");

    setSourceText("\uD800\uDC00\uD8FF\uDCFF");
    AssertEquals(peekChar(), "\uD800\uDC00");
    AssertEquals(nextChar(), "\uD8FF\uDCFF");
    proceedChar("\uD800\uDC00");
    AssertEquals(peekChar(), "\uD8FF\uDCFF");

    setSourceText("\uD800\uD8FF\uDCFF");
    AssertEquals(peekChar(), "\uD800");
    AssertEquals(nextChar(), "\uD8FF\uDCFF");
    proceedChar("\uD800");
    AssertEquals(peekChar(), "\uD8FF\uDCFF");

    setSourceText("\uDC00\uD8FF\uDCFF");
    AssertEquals(peekChar(), "\uDC00");
    AssertEquals(nextChar(), "\uD8FF\uDCFF");
    proceedChar("\uDC00");
    AssertEquals(peekChar(), "\uD8FF\uDCFF");

    setSourceText("a\r\nbc");
    try {
        proceedChar("z");
    } catch (e) {
        var ee = e;
    }
    Assert(ee && ee instanceof EarlySyntaxError && ee instanceof EarlyError);
    AssertEquals(ee.sourceLine, 1);
    AssertEquals(ee.sourceColumn, 1);
    proceedChar("a");
    proceedChar("\r");
    proceedChar("\n");
    proceedChar("b");
    var ee = new EarlyReferenceError();
    AssertEquals(ee.sourceLine, 2);
    AssertEquals(ee.sourceColumn, 2);

    setSourceText("abcde");
    AssertEquals(nextChar(), "b");
    AssertEquals(nextChar(2), "c");
    AssertEquals(nextChar(3), "d");
    proceedChar("a");
    AssertEquals(nextChar(), "c");
    AssertEquals(nextChar(2), "d");
    AssertEquals(nextChar(3), "e");
    proceedChar("b");

    setSourceText("abcde");
    proceedChar("a");
    enterModule();
    enterStrictMode();
    var saved = saveSourceTextContext();
    setSourceText("xyz");
    AssertEquals(nextChar(), "y");
    Assert(!isInModule());
    Assert(!isInStrictMode());
    restoreSourceTextContext(saved);
    Assert(isInModule());
    Assert(isInStrictMode());
    leaveModule();
    leaveStrictMode();
    Assert(!isInModule());
    Assert(!isInStrictMode());
    proceedChar("b");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
