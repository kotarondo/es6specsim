require("./harness.js")
load("../unicode.js")
load("../sourcetext.js")
load("../tokenizer.js")

try {

    setParsingText("abc");
    try {
        proceedToken("a");
    } catch (e) {
        var ee = e;
    }
    Assert(ee && ee instanceof EarlySyntaxError && ee instanceof EarlyError);
    AssertEquals(ee.sourceLine, 1);
    AssertEquals(ee.sourceColumn, 1);

    setParsingText("a-cd00++100.12!=='777'");
    proceedToken("a");
    proceedToken("-");
    proceedToken("cd00");
    proceedToken("++");
    proceedToken("100.12");
    proceedToken("!==");
    proceedToken("'777'");
    AssertEquals(peekToken(), "");
    proceedToken();
    AssertEquals(peekToken(), "");
    proceedToken();
    AssertEquals(peekToken(), "");

    setParsingText("a-cd00/100.12/='777'");
    AssertEquals(nextToken(), "-");
    proceedToken();
    AssertEquals(nextToken(), "cd00");
    proceedToken();
    AssertEquals(nextToken(), "/");
    proceedToken();
    AssertEquals(nextToken(), "100.12");
    proceedToken();
    AssertEquals(nextToken(), "/=");
    proceedToken();
    AssertEquals(nextToken(), "'777'");
    proceedToken();
    AssertEquals(peekToken(), "'777'");

    setParsingText("A /* comments \n/*\n*/B/**/C");
    proceedToken("A");
    Assert(peekTokenIsLineSeparated());
    proceedToken("B");
    Assert(!peekTokenIsLineSeparated());
    proceedToken("C");
    AssertEquals(peekToken(), "");

    setParsingText("/ // comments //\n\n/\n");
    proceedToken("/");
    Assert(peekTokenIsLineSeparated());
    proceedToken("/");
    AssertEquals(peekToken(), "");

    setParsingText("A <!-- comments //\nB");
    proceedToken("A");
    Assert(peekTokenIsLineSeparated());
    proceedToken("B");
    AssertEquals(peekToken(), "");

    setParsingText("A <!- comments //\nB");
    proceedToken("A");
    proceedToken("<");
    proceedToken("!");
    proceedToken("-");
    proceedToken("comments");
    proceedToken("B");
    AssertEquals(peekToken(), "");

    setParsingText("B/*\nCCCC*/-->C\nD");
    proceedToken("B");
    Assert(peekTokenIsLineSeparated());
    proceedToken("D");
    AssertEquals(peekToken(), "");

    setParsingText("B/*CCCC*/-->C\nD");
    proceedToken("B");
    proceedToken("--");
    proceedToken(">");
    proceedToken("C");
    proceedToken("D");
    AssertEquals(peekToken(), "");

    setParsingText("/AB //g");
    AssertEquals(peekToken(), "/");
    AssertEquals(peekTokenAsRegularExpressionLiteral(), "/AB /");
    proceedToken();
    proceedToken("/");
    proceedToken("g");

    setParsingText("/=AB/igm;");
    AssertEquals(peekToken(), "/=");
    AssertEquals(peekTokenAsRegularExpressionLiteral(), "/=AB/igm");
    proceedToken();
    proceedToken(";");

    setParsingText("aa`simple template`bb");
    proceedToken("aa");
    Assert(isTokenTemplate(peekToken()));
    proceedToken("`simple template`");
    proceedToken("bb");

    setParsingText("`temp\n ${abc/**/} middl//\n ${/**/expr*2} \nclose`a");
    Assert(isTokenTemplateHead(peekToken()));
    proceedToken("`temp\n ${");
    proceedToken("abc");
    AssertEquals(peekToken(), "}");
    AssertEquals(token = peekTokenAsTemplateMiddleOrTail(), "} middl//\n ${");
    Assert(isTokenTemplateMiddle(token));
    proceedToken();
    proceedToken("expr");
    proceedToken("*");
    proceedToken("2");
    AssertEquals(peekToken(), "}");
    AssertEquals(token = peekTokenAsTemplateMiddleOrTail(), "} \nclose`");
    Assert(isTokenTemplateTail(token));
    proceedToken();
    proceedToken("a");

    Assert(isTokenIdentifierName("abc"));
    Assert(isTokenIdentifierName("$abc"));
    Assert(isTokenIdentifierName("$0"));
    Assert(isTokenIdentifierName("_"));
    Assert(isTokenIdentifierName("\\u0041a"));

    Assert(isTokenStringLiteral("\"abc\""));
    Assert(isTokenStringLiteral("\'abc\'"));

    Assert(isTokenNumericLiteral("123"));
    Assert(isTokenNumericLiteral(".123"));

    test_early_error(peekToken, [], "0x ", false, "EarlySyntaxError", 1, 3);
    test_early_error(peekToken, [], "0b ", false, "EarlySyntaxError", 1, 3);
    test_early_error(peekToken, [], "0o ", false, "EarlySyntaxError", 1, 3);
    test_early_error(peekToken, [], "\\u0030abc", false, "EarlySyntaxError: 11.6.1.1-A");
    test_early_error(peekToken, [], "a\\u0020bc", false, "EarlySyntaxError: 11.6.1.1-B");
    test_early_error(peekToken, [], "a\\u{110000}", false, "EarlySyntaxError: 11.8.4.1");

    setParsingText("\\u0041\\u{0000042};");
    Assert(isTokenIdentifierName(peekToken()));
    AssertEquals(SVofIdentifierName(peekToken()), "AB");
    proceedToken();
    proceedToken(";");

    Assert(isReservedWord("break"));
    Assert(!isReservedWord("let"));

    setParsingText("public");
    enterStrictMode();
    Assert(isReservedWord(peekToken()));
    leaveStrictMode();
    Assert(!isReservedWord(peekToken()));

    setParsingText("await");
    enterModule();
    Assert(isReservedWord(peekToken()));
    leaveModule();
    Assert(!isReservedWord(peekToken()));

    setParsingText("0b1010");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 10);

    setParsingText("0o7531");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 3929);

    setParsingText("0x7531");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 0x7531);

    setParsingText("0");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 0);

    setParsingText("0.1e+2");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 10);

    setParsingText("10000e-3");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 10);

    setParsingText("07531");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 3929);

    setParsingText("075318.5");
    Assert(isTokenNumericLiteral(peekToken()));
    AssertEquals(MVofNumericLiteral(peekToken()), 75318.5);

    setParsingText("'a\\\r\nb\\\rc\\\nd'");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "abcd");

    setParsingText("\"a\\0\\b\\f\\n\\r\\t\\vz\"");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "a\0\b\f\n\r\t\vz");

    setParsingText("'a\\x12\\x00\\xffz'");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "a\x12\0\xffz");

    setParsingText("\"a\\uDC00\\u0000\\u{000041}z\"");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "a\uDC00\0Az");

    setParsingText("'a\\u{27801}z'");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "a\uD85E\uDC01z");

    setParsingText("'a\\123\\345\\456\\567z'");
    Assert(isTokenStringLiteral(peekToken()));
    AssertEquals(SVofStringLiteral(peekToken()), "a\x53\xE5\x256\x2e7z");

    setParsingText("/[abc]\\f\\\\b\\r\\n/abcdef;");
    AssertEquals(peekTokenAsRegularExpressionLiteral(), "/[abc]\\f\\\\b\\r\\n/abcdef");
    proceedToken();
    proceedToken(";");

    test_early_error(peekTokenAsRegularExpressionLiteral, [], "/a/g\\u0041", false, "EarlySyntaxError: 11.8.5.1");
    test_early_error(peekTokenAsRegularExpressionLiteral, [], "/abcdef", false, "EarlySyntaxError");
    test_early_error(peekTokenAsRegularExpressionLiteral, [], "/abc\ndef/", false, "EarlySyntaxError");
    test_early_error(peekTokenAsRegularExpressionLiteral, [], "/abc\\\ndef/", false, "EarlySyntaxError");

    setParsingText("/body[a/c]\\u0041\\//giumy");
    var token = peekTokenAsRegularExpressionLiteral();
    AssertEquals(BodyTextOfRegularExpressionLiteral(token), "body[a/c]\\u0041\\/");
    AssertEquals(FlagTextOfRegularExpressionLiteral(token), "giumy");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
