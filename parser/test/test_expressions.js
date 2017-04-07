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
load("../utility.js")
load("./load_static_semantics.js")

try {

    setParsingText("abc \\u0041bcd yield arguments eval implements");
    AssertEquals(parseIdentifierReference().SV, "abc");
    AssertEquals(parseIdentifierReference().SV, "Abcd");
    AssertEquals(parseIdentifierReference().SV, "yield");
    AssertEquals(parseIdentifierReference().SV, "arguments");
    AssertEquals(parseIdentifierReference().SV, "eval");
    AssertEquals(parseIdentifierReference().SV, "implements");
    AssertEquals(peekToken(), "");

    setParsingText("abc \\u0041bcd yield arguments eval implements");
    AssertEquals(parseBindingIdentifier().SV, "abc");
    AssertEquals(parseBindingIdentifier().SV, "Abcd");
    AssertEquals(parseBindingIdentifier().SV, "yield");
    AssertEquals(parseBindingIdentifier().SV, "arguments");
    AssertEquals(parseBindingIdentifier().SV, "eval");
    AssertEquals(parseBindingIdentifier().SV, "implements");
    AssertEquals(peekToken(), "");

    setParsingText("abc \\u0041bcd yield arguments eval implements");
    AssertEquals(parseLabelIdentifier().SV, "abc");
    AssertEquals(parseLabelIdentifier().SV, "Abcd");
    AssertEquals(parseLabelIdentifier().SV, "yield");
    AssertEquals(parseLabelIdentifier().SV, "arguments");
    AssertEquals(parseLabelIdentifier().SV, "eval");
    AssertEquals(parseLabelIdentifier().SV, "implements");
    AssertEquals(peekToken(), "");

    test_early_error(parseIdentifierReference, ["Yield"], "yield", false, "EarlySyntaxError");
    test_early_error(parseIdentifierReference, [], "yield", true, "EarlySyntaxError: 12.1.1-B: yield", 1, 1);
    test_early_error(parseIdentifierReference, ["Yield"], "yi\\u0065ld", false, "EarlySyntaxError: 12.1.1-C: yield", 1, 1);
    test_early_error(parseBindingIdentifier, ["Yield"], "yield", false, "EarlySyntaxError");
    test_early_error(parseBindingIdentifier, [], "yield", true, "EarlySyntaxError: 12.1.1-B: yield", 1, 1);
    test_early_error(parseBindingIdentifier, ["Yield"], "yi\\u0065ld", false, "EarlySyntaxError: 12.1.1-C: yield", 1, 1);
    test_early_error(parseBindingIdentifier, [], "arguments", true, "EarlySyntaxError: 12.1.1-A: arguments", 1, 1);
    test_early_error(parseBindingIdentifier, [], "eval", true, "EarlySyntaxError: 12.1.1-A: eval", 1, 1);
    test_early_error(parseLabelIdentifier, ["Yield"], "yield", false, "EarlySyntaxError");
    test_early_error(parseLabelIdentifier, [], "yield", true, "EarlySyntaxError: 12.1.1-B: yield", 1, 1);
    test_early_error(parseLabelIdentifier, ["Yield"], "yi\\u0065ld", false, "EarlySyntaxError: 12.1.1-C: yield", 1, 1);
    test_early_error(parseIdentifier, [], "impl\\u0065ments", true, "EarlySyntaxError: 12.1.1-D: implements", 1, 1);
    test_early_error(parseIdentifier, [], "tru\\u0065", false, "EarlySyntaxError: 12.1.1-E: true", 1, 1);

    // Primary Expression

    setParsingText("this [] {} function*(){} function(){} class{} /r/ /=/ (a) null true false a 0 `a`");
    Assert(parsePrimaryExpression() instanceof ThisExpression);
    Assert(parsePrimaryExpression() instanceof ArrayLiteral);
    Assert(parsePrimaryExpression() instanceof ObjectLiteral);
    Assert(parsePrimaryExpression() instanceof GeneratorExpression);
    Assert(parsePrimaryExpression() instanceof FunctionExpression);
    Assert(parsePrimaryExpression() instanceof ClassExpression);
    Assert(parsePrimaryExpression() instanceof RegularExpressionLiteral);
    Assert(parsePrimaryExpression() instanceof RegularExpressionLiteral);
    Assert(parsePrimaryExpression() instanceof IdentifierReference);
    Assert(parsePrimaryExpression() instanceof LiteralExpression);
    Assert(parsePrimaryExpression() instanceof LiteralExpression);
    Assert(parsePrimaryExpression() instanceof LiteralExpression);
    Assert(parsePrimaryExpression() instanceof IdentifierReference);
    Assert(parsePrimaryExpression() instanceof LiteralExpression);
    Assert(parsePrimaryExpression() instanceof TemplateLiteral);
    AssertEquals(peekToken(), "");

    setParsingText("[a, b, c] [,,a,,] [,...a,b,...c][...a,,,]");
    Assert(parsePrimaryExpression() instanceof ArrayLiteral);
    Assert(parsePrimaryExpression() instanceof ArrayLiteral);
    Assert(parsePrimaryExpression() instanceof ArrayLiteral);
    Assert(parsePrimaryExpression() instanceof ArrayLiteral);
    AssertEquals(peekToken(), "");

    setParsingText("{a, b, c}{a:a,b:b,}{[a]:2+3,'11':a,11:b,get(){},set(){},[1](){},*a(){},get a(){},set a(v){}}");
    Assert(parsePrimaryExpression() instanceof ObjectLiteral);
    Assert(parsePrimaryExpression() instanceof ObjectLiteral);
    Assert(parsePrimaryExpression() instanceof ObjectLiteral);
    AssertEquals(peekToken(), "");

    setParsingText("{a=2, b, c=1+v}"); // Covered Grammer
    Assert(parsePrimaryExpression() instanceof ObjectLiteral);
    AssertEquals(peekToken(), "");

    test_early_error(parseExpression, [], "{a(){\nsuper()}}", false, "EarlySyntaxError: 12.2.6.1-A", 2, 1);
    test_early_error(parseFunctionDeclaration, [], "function a(){a={a=super()}}", false, "EarlySyntaxError: 12.2.6.1-B", 1, 17);
    test_no_error(parseFunctionDeclaration, [], "function a(){a={super:a}}");
    test_early_error(parseFunctionDeclaration, [], "function a(){class a{[{a=b}](){}}}", false, "EarlySyntaxError: 12.2.6.1-B");
    test_early_error(parseFunctionDeclaration, [], "function a(){\nvar a = {a=2, b, c=1+v}}", false, "EarlySyntaxError: 12.2.6.1-B", 2, 10);

    setParsingText("`a=2 ${b} c=1 ${d} e=3` /99/");
    Assert(parsePrimaryExpression() instanceof TemplateLiteral);
    Assert(parsePrimaryExpression() instanceof RegularExpressionLiteral);
    AssertEquals(peekToken(), "");

    test_early_error(parsePrimaryExpression, [], "/a/ga", false, "EarlySyntaxError: 12.2.8.1-B");
    test_early_error(parsePrimaryExpression, [], "/a/gig", false, "EarlySyntaxError: 12.2.8.1-B");
    test_early_error(parsePrimaryExpression, [], "/a/gimuiy", false, "EarlySyntaxError: 12.2.8.1-B");

    // LeftHandSide Expression

    setParsingText("new a[1](8) new a(8).a(9) a `temp ${a}=c` /end/");
    Assert(parseLeftHandSideExpression() instanceof NewOperator);
    Assert(parseLeftHandSideExpression() instanceof FunctionCall);
    Assert(parseLeftHandSideExpression() instanceof TaggedTemplate);
    Assert(parseLeftHandSideExpression() instanceof RegularExpressionLiteral);
    AssertEquals(peekToken(), "");

    setParsingText("a[a+b] a.b0ggg super[2] super.aaa new.target");
    Assert(parseLeftHandSideExpression() instanceof PropertyAccessorByIndex);
    Assert(parseLeftHandSideExpression() instanceof PropertyAccessorByName);
    Assert(parseLeftHandSideExpression() instanceof SuperPropertyByIndex);
    Assert(parseLeftHandSideExpression() instanceof SuperPropertyByName);
    Assert(parseLeftHandSideExpression() instanceof NewTarget);
    AssertEquals(peekToken(), "");

    // Postfix Expression

    setParsingText("a++ a-- a.b++ a[1]++ a\n--");
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    Assert(parsePostfixExpression() instanceof IdentifierReference);
    AssertEquals(peekToken(), "--");

    test_early_error(parsePostfixExpression, [], "a()++", false, "EarlyReferenceError: 12.4.1");
    test_early_error(parsePostfixExpression, [], "eval++", true, "EarlyReferenceError: 12.4.1");
    test_early_error(parsePostfixExpression, [], "arguments++", true, "EarlyReferenceError: 12.4.1");

    setParsingText("super[1]++ super.aa++");
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    Assert(parsePostfixExpression() instanceof PostfixOperator);
    AssertEquals(peekToken(), "");

    // Unary Expression

    setParsingText("delete a void a typeof a \n++a \n--a +a -a ~a !a /end/");
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof UnaryOperator);
    Assert(parseUnaryExpression() instanceof RegularExpressionLiteral);
    AssertEquals(peekToken(), "");

    test_early_error(parseUnaryExpression, [], "++a()", false, "EarlyReferenceError: 12.5.1");
    test_early_error(parseUnaryExpression, [], "delete a", true, "EarlySyntaxError: 12.5.4.1");

    // Assignment Expression

    setParsingText("a+b a=b+c a?1:2");
    Assert(parseAssignmentExpression() instanceof BinaryOperator);
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    Assert(parseAssignmentExpression() instanceof ConditionalOperator);
    AssertEquals(peekToken(), "");

    test_early_error(parseAssignmentExpression, [], "a+b=2", false, "EarlySyntaxError");
    test_early_error(parseAssignmentExpression, [], "a+b+=2", false, "EarlySyntaxError");
    setParsingText("(a)=2");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    setParsingText("(((a)))=((a))");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);

    setParsingText("()=>{} (a)=>a a=>{} (a,b,c)=>{} (...c)=>{} (a,b,...c)=>a+b a");
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof ArrowFunction);
    Assert(parseAssignmentExpression() instanceof IdentifierReference);
    AssertEquals(peekToken(), "");

    setParsingText("yield a+b yield*g a");
    Assert(parseAssignmentExpression("In", "Yield") instanceof YieldExpression);
    Assert(parseAssignmentExpression("In", "Yield") instanceof YieldStarExpression);
    Assert(parseAssignmentExpression() instanceof IdentifierReference);
    setParsingText("yield a+b yield*g a");
    Assert(parseAssignmentExpression() instanceof IdentifierReference);
    Assert(parseAssignmentExpression() instanceof BinaryOperator);
    Assert(parseAssignmentExpression() instanceof BinaryOperator);
    Assert(parseAssignmentExpression() instanceof IdentifierReference);
    AssertEquals(peekToken(), "");

    setParsingText("{}=d {a}={a} {a,b,c}=d {a,b=2,c=b,}=d e");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    Assert(parseAssignmentExpression() instanceof IdentifierReference);
    AssertEquals(peekToken(), "");

    setParsingText("[]=d; [a]=d; [,,a,b,,,c,,]=d; [a,b=2,c=b,...d]=d;");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    AssertEquals(peekToken(), "");

    setParsingText("[1].a=d; {a}[2]=d; {eval}=1; [...eval]=1;");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    Assert(parseAssignmentExpression() instanceof AssignmentOperator);
    proceedToken(";");
    AssertEquals(peekToken(), "");

    test_early_error(parseAssignmentExpression, [], "a()=1", false, "EarlyReferenceError: 12.14.1");
    test_early_error(parseAssignmentExpression, [], "{eval}=1", true, "EarlySyntaxError: 12.14.5.1-A");
    test_early_error(parseAssignmentExpression, [], "[...eval]=1", true, "EarlySyntaxError: 12.14.5.1-C");

    test_no_error(parseExpression, [], "(function(){})(30)[1]++");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
