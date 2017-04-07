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
    setParsingText("function a(){} function(a,a){} function f(a,b,c){'use strict'}");
    Assert(parseFunctionDeclaration() instanceof FunctionDeclaration);
    Assert(parseFunctionDeclaration(null, "Default") instanceof FunctionDeclaration);
    Assert(parseFunctionDeclaration() instanceof FunctionDeclaration);
    AssertEquals(peekToken(), "");

    setParsingText("function a(){} function(a,a){} function f(a,b,c){'use strict'}");
    Assert(parseFunctionExpression() instanceof FunctionExpression);
    Assert(parseFunctionExpression() instanceof FunctionExpression);
    Assert(parseFunctionExpression() instanceof FunctionExpression);
    AssertEquals(peekToken(), "");

    setParsingText("function (a,{b:e=2},[c,,d,...b], ...f){}");
    Assert(parseFunctionExpression() instanceof FunctionExpression);
    AssertEquals(peekToken(), "");

    test_early_error(parseFunctionExpression, [], "function eval(){'use strict'}", false, "EarlySyntaxError: 14.1.2-B: eval", 1, 10);
    test_early_error(parseFunctionExpression, [], "function arguments(){'use strict'}", false, "EarlySyntaxError: 14.1.2-B: arguments", 1, 10);
    test_early_error(parseFunctionExpression, [], "function(a){let a;{let a}}", false, "EarlySyntaxError: 14.1.2-C: a", 1, 17);
    test_no_error(parseFunctionExpression, [], "function(a=1){}", true);
    test_early_error(parseFunctionExpression, [], "function(a=super.a){}", true, "EarlySyntaxError: 14.1.2-D", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(){super.a}", true, "EarlySyntaxError: 14.1.2-E", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(a=super[a]){}", true, "EarlySyntaxError: 14.1.2-D", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(){super[a]}", true, "EarlySyntaxError: 14.1.2-E", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(a=super(a)){}", true, "EarlySyntaxError: 14.1.2-F", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(){super(a)}", true, "EarlySyntaxError: 14.1.2-G", 1, 12);
    test_early_error(parseFunctionExpression, [], "function(){a=>super(a)}", true, "EarlySyntaxError: 14.1.2-G", 1, 15);

    test_early_error(parseFunctionExpression, [], "function(a,a,a){}", true, "EarlySyntaxError: 14.1.2-H: a", 1, 12);
    test_early_error(parseFunctionExpression, [], "function (a,{b:e=2},[,...e]){}", true, "EarlySyntaxError: 14.1.2-I: e", 1, 26);
    test_early_error(parseFunctionExpression, [], "function(){let a; const a=1;}", false, "EarlySyntaxError: 14.1.2-J: a", 1, 25);
    test_early_error(parseFunctionExpression, [], "function(){let a; var a;}", false, "EarlySyntaxError: 14.1.2-K: a", 1, 23);
    test_no_error(parseFunctionExpression, [], "function(){L:a;L:b;}", false);
    test_early_error(parseFunctionExpression, [], "function(){L:{L:L:b}}", false, "EarlySyntaxError: 14.1.2-L: L", 1, 15);
    test_early_error(parseFunctionExpression, [], "function(){L:switch(c){case 1:L:b}}", false, "EarlySyntaxError: 14.1.2-L: L", 1, 31);
    test_no_error(parseFunctionExpression, [], "function(){L:while(1)break L}", false);
    test_early_error(parseFunctionExpression, [], "function(){while(1)break L}", false, "EarlySyntaxError: 14.1.2-M: L", 1, 26);
    test_early_error(parseFunctionExpression, [], "function(){switch(c){case 1:break L;L:;}}", false, "EarlySyntaxError: 14.1.2-M: L", 1, 35);
    test_no_error(parseFunctionExpression, [], "function(){L:for(;;){continue L}}", false);
    test_early_error(parseFunctionExpression, [], "function(){while(1)continue L}", false, "EarlySyntaxError: 14.1.2-N: L", 1, 29);
    test_early_error(parseFunctionExpression, [], "function(){while(1)L:continue L}", false, "EarlySyntaxError: 14.1.2-N: L", 1, 31);
    test_early_error(parseFunctionExpression, [], "function(){for(;;){L:;continue L}}", false, "EarlySyntaxError: 14.1.2-N: L", 1, 32);

    setParsingText("a => a = b");
    Assert(parseArrowFunction() instanceof ArrowFunction);
    AssertEquals(peekToken(), "");

    setParsingText("(a, b) => {a = b}");
    Assert(parseArrowFunction() instanceof ArrowFunction);
    AssertEquals(peekToken(), "");

    test_early_error(parseArrowFunction, [null, "Yield"], "(a=yield)=>a", false, "EarlySyntaxError: 14.2.1-A", 1, 4);
    test_early_error(parseArrowFunction, [null, "Yield"], "(a=yield a)=>a", false, "EarlySyntaxError: 14.2.1-A", 1, 4);
    test_early_error(parseArrowFunction, [null, "Yield"], "(a=yield*a)=>a", false, "EarlySyntaxError: 14.2.1-A", 1, 4);
    test_no_error(parseArrowFunction, [null, "Yield"], "a=>yield");
    test_no_error(parseArrowFunction, [null, "Yield"], "a=>yield*a");
    test_no_error(parseArrowFunction, [null, "Yield"], "a=>{yield}");
    test_no_error(parseArrowFunction, [null, "Yield"], "a=>{yield*a}");
    test_no_error(parseArrowFunction, [null, "Yield"], "a=>function*(){yield 1}");
    // TODO find 14.2.1-B case

    test_early_error(parseArrowFunction, [], "a=>{let a;}", false, "EarlySyntaxError: 14.2.1-C: a", 1, 9);
    test_early_error(parseArrowFunction, [], "({b,a})=>{let a;}", false, "EarlySyntaxError: 14.2.1-C: a", 1, 15);
    test_no_error(parseArrowFunction, [], "a=>{var a;}", false);
    test_no_error(parseArrowFunction, [], "a=>{{let a;}}", false);
    test_no_error(parseArrowFunction, [], "a=>{function a(){}}", false);

    setParsingText("aa (a,b,c){} get aa(){} set aa(a){}");
    Assert(parseMethodDefinition() instanceof MethodDefinitionNormal);
    Assert(parseMethodDefinition() instanceof MethodDefinitionGet);
    Assert(parseMethodDefinition() instanceof MethodDefinitionSet);
    AssertEquals(peekToken(), "");

    setParsingText("get (){} set(aa){}");
    Assert(parseMethodDefinition() instanceof MethodDefinitionNormal);
    Assert(parseMethodDefinition() instanceof MethodDefinitionNormal);
    AssertEquals(peekToken(), "");

    setParsingText("* get (){} * set(aa){}");
    Assert(parseMethodDefinition() instanceof GeneratorMethod);
    Assert(parseMethodDefinition() instanceof GeneratorMethod);
    AssertEquals(peekToken(), "");

    test_early_error(parseMethodDefinition, [], "aa(a,b){let a,b}", false, "EarlySyntaxError: 14.3.1-A: a", 1, 13);
    test_early_error(parseMethodDefinition, [], "set aa([a,a,a]){}", false, "EarlySyntaxError: 14.3.1-B: a", 1, 11);
    test_no_error(parseMethodDefinition, [], "aa(a,b){{let a,b}}", false);
    test_early_error(parseMethodDefinition, [], "set aa({b,a}){let a}", false, "EarlySyntaxError: 14.3.1-C: a", 1, 19);
    test_no_error(parseMethodDefinition, [], "set aa(a){{let a,b}}", false);

    test_no_error(parseMethodDefinition, [], "* aa(){super[a]}");
    test_early_error(parseMethodDefinition, [], "* aa(){super(a)}", false, "EarlySyntaxError: 14.4.1-A", 1, 8);
    test_early_error(parseMethodDefinition, [], "* aa(a=super()){}", false, "EarlySyntaxError: 14.4.1-A", 1, 8);
    test_early_error(parseMethodDefinition, [], "* aa({b=yield}){}", false, "EarlySyntaxError: 14.4.1-B", 1, 9);
    test_early_error(parseMethodDefinition, [], "* aa({b,a}){let a}", false, "EarlySyntaxError: 14.4.1-C: a", 1, 17);

    setParsingText("function *a(){} function*(a){} function *f(a,b,c){'use strict'}");
    Assert(parseGeneratorDeclaration() instanceof GeneratorDeclaration);
    Assert(parseGeneratorDeclaration(null, "Default") instanceof GeneratorDeclaration);
    Assert(parseGeneratorDeclaration() instanceof GeneratorDeclaration);
    AssertEquals(peekToken(), "");

    test_early_error(parseGeneratorDeclaration, [], "function*n(a){super()}", false, "EarlySyntaxError: 14.4.1-D", 1, 15);
    test_early_error(parseGeneratorDeclaration, [], "function*n(a=super()){}", false, "EarlySyntaxError: 14.4.1-D", 1, 14);
    test_early_error(parseGeneratorDeclaration, [null, "Default"], "function*(a){super()}", false, "EarlySyntaxError: 14.4.1-D", 1, 14);

    setParsingText("function *a(){} function*(a){} function *f(a,b,c){'use strict'}");
    Assert(parseGeneratorExpression() instanceof GeneratorExpression);
    Assert(parseGeneratorExpression() instanceof GeneratorExpression);
    Assert(parseGeneratorExpression() instanceof GeneratorExpression);
    AssertEquals(peekToken(), "");

    //14.4.1-F
    test_early_error(parseGeneratorExpression, [], "function*(a,a){}", true, "EarlySyntaxError: 14.1.2-H: a", 1, 13);
    test_early_error(parseGeneratorExpression, [], "function*(a,{b:e=2},[,...e]){}", true, "EarlySyntaxError: 14.1.2-I: e", 1, 26);
    test_early_error(parseGeneratorExpression, [], "function*(){let a; const a=1;}", false, "EarlySyntaxError: 14.1.2-J: a", 1, 26);
    test_early_error(parseGeneratorExpression, [], "function*(){let a; var a,a;}", false, "EarlySyntaxError: 14.1.2-K: a", 1, 24);

    test_early_error(parseGeneratorExpression, [], "function*(a){super()}", false, "EarlySyntaxError: 14.4.1-E", 1, 14);
    test_early_error(parseGeneratorExpression, [], "function*(a=super()){}", false, "EarlySyntaxError: 14.4.1-E", 1, 13);
    test_early_error(parseGeneratorExpression, [], "function*eval(){'use strict'}", false, "EarlySyntaxError: 14.4.1-G: eval", 1, 10);
    test_early_error(parseGeneratorExpression, [], "function*arguments(){'use strict'}", false, "EarlySyntaxError: 14.4.1-G: arguments", 1, 10);
    test_early_error(parseGeneratorExpression, [], "function*(a){let a;}", false, "EarlySyntaxError: 14.4.1-H: a", 1, 18);
    test_early_error(parseGeneratorExpression, [], "function*(a=yield){}", false, "EarlySyntaxError: 14.4.1-I", 1, 13);
    test_early_error(parseGeneratorExpression, [], "function*(a=super[1]){}", false, "EarlySyntaxError: 14.4.1-J", 1, 13);
    test_early_error(parseGeneratorExpression, [], "function*(){super.a}", false, "EarlySyntaxError: 14.4.1-K", 1, 13);

    test_no_error(parseGeneratorExpression, [], "function*(){yield a}");
    test_no_error(parseScript, [], "var a=function*(){yield a};");

    setParsingText("yield; yield a; yield a*b; yield*a*b ");
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken(";")
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken(";")
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken(";")
    Assert(parseYieldExpression() instanceof YieldStarExpression);
    AssertEquals(peekToken(), "");

    setParsingText("yield \n a yield /*\n*/a yield \n*a ");
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken("a")
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken("a")
    Assert(parseYieldExpression() instanceof YieldExpression);
    proceedToken("*")
    proceedToken("a")

    setParsingText("class aa extends bb {} class aa {} class extends cc[1] {}");
    Assert(parseClassDeclaration() instanceof ClassDeclaration);
    Assert(parseClassDeclaration() instanceof ClassDeclaration);
    Assert(parseClassDeclaration(null, "Default") instanceof ClassDeclaration);
    AssertEquals(peekToken(), "");

    setParsingText("class aa extends bb {} class aa {} class extends cc[1] {}");
    Assert(parseClassExpression() instanceof ClassExpression);
    Assert(parseClassExpression() instanceof ClassExpression);
    Assert(parseClassExpression() instanceof ClassExpression);
    AssertEquals(peekToken(), "");

    setParsingText("class aa {static a(){} b(c){} get a(){} set b(y){}}");
    Assert(parseClassExpression() instanceof ClassExpression);
    AssertEquals(peekToken(), "");

    test_no_error(parseClassExpression, [], "class extends a{;}");
    test_early_error(parseClassExpression, [], "class{constructor(){super()}}", false, "EarlySyntaxError: 14.5.1-A", 1, 21);
    test_early_error(parseClassDeclaration, [], "class A{constructor(){super()}}", false, "EarlySyntaxError: 14.5.1-A", 1, 23);
    test_no_error(parseClassExpression, [], "class extends a{constructor(){super()}}");
    test_early_error(parseClassExpression, [], "class{constructor(){}constructor(){}constructor(){}}", false, "EarlySyntaxError: 14.5.1-B", 1, 22);
    test_no_error(parseClassExpression, [], "class{constructor(){}static constructor(){}}");
    test_early_error(parseClassExpression, [], "class{a(){super()}}", false, "EarlySyntaxError: 14.5.1-C", 1, 11);
    test_early_error(parseClassExpression, [], "class{*constructor(){}}", false, "EarlySyntaxError: 14.5.1-D", 1, 7);
    test_early_error(parseClassExpression, [], "class{get constructor(){}}", false, "EarlySyntaxError: 14.5.1-D", 1, 7);
    test_early_error(parseClassExpression, [], "class{static constructor(){super()}}", false, "EarlySyntaxError: 14.5.1-E", 1, 28);
    test_early_error(parseClassExpression, [], "class{static a(){super()}}", false, "EarlySyntaxError: 14.5.1-E", 1, 18);
    test_early_error(parseClassExpression, [], "class{static prototype(){}}", false, "EarlySyntaxError: 14.5.1-F", 1, 14);
    test_no_error(parseClassExpression, [], "class{prototype(){}}");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
