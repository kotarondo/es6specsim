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

Error.stackTraceLimit = Infinity;

try {

    setParsingText("{} {a; b\n c}");
    Assert(parseStatement() instanceof BlockStatement);
    Assert(parseStatement() instanceof BlockStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "{let abc; function abc(){} let abc}", false, "EarlySyntaxError: 13.2.1-A: abc", 1, 20);
    test_early_error(parseStatement, [], "{var ab; let ab;}", false, "EarlySyntaxError: 13.2.1-B: ab", 1, 6);
    test_early_error(parseStatement, [], "{let ab; var ab;}", false, "EarlySyntaxError: 13.2.1-B: ab", 1, 14);
    test_early_error(parseStatement, [], "{{var a;} let a;}", false, "EarlySyntaxError: 13.2.1-B: a", 1, 7);
    test_no_error(parseStatement, [], "{var a; {let a;}}", false);

    setParsingText("{let = 2; let(); let in 1\n let instanceof a;}");
    Assert(parseStatement() instanceof BlockStatement);
    AssertEquals(peekToken(), "");

    setParsingText("{function a(){} function b(){} {function a(){} function b(){} }}");
    Assert(parseStatement() instanceof BlockStatement);
    AssertEquals(peekToken(), "");

    setParsingText("let a; let b,c=2,d; let [a]=b,[aa,b,...c]=d; const {c}=d,{f=2,b:d=r}=e;");
    Assert(parseStatementListItem() instanceof StatementListItemOfDeclaration);
    Assert(parseStatementListItem() instanceof StatementListItemOfDeclaration);
    Assert(parseStatementListItem() instanceof StatementListItemOfDeclaration);
    Assert(parseStatementListItem() instanceof StatementListItemOfDeclaration);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatementListItem, [], "const let=1", false, "EarlySyntaxError: 13.3.1.1-A: let", 1, 7);
    test_early_error(parseStatementListItem, [], "let let", false, "EarlySyntaxError: 13.3.1.1-A: let", 1, 5);
    test_early_error(parseStatementListItem, [], "let aa,bb,aa", false, "EarlySyntaxError: 13.3.1.1-B: aa", 1, 11);
    test_no_error(parseStatementListItem, [], "const a  =1 ");
    test_early_error(parseStatementListItem, [], "const a  ; ", false, "EarlySyntaxError: 13.3.1.1-C", 1, 10);

    setParsingText("var a; var b,c=2,d; var [a]=b,[a,b,...c]=d; var {c}=d,{f=2,b:d=r}=e;");
    Assert(parseStatementListItem().Statement instanceof VariableStatement);
    Assert(parseStatementListItem().Statement instanceof VariableStatement);
    Assert(parseStatementListItem().Statement instanceof VariableStatement);
    Assert(parseStatementListItem().Statement instanceof VariableStatement);
    AssertEquals(peekToken(), "");

    setParsingText("a; ; d; ;");
    Assert(parseStatement() instanceof ExpressionStatement);
    Assert(parseStatement() instanceof EmptyStatement);
    Assert(parseStatement() instanceof ExpressionStatement);
    Assert(parseStatement() instanceof EmptyStatement);
    AssertEquals(peekToken(), "");

    setParsingText("if(a)b=1;if(a)b=2;else{b=3} if(!a)d=1\nif(a){d=1}else g;");
    Assert(parseStatement() instanceof IfStatement);
    Assert(parseStatement() instanceof IfStatement);
    Assert(parseStatement() instanceof IfStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("do{f()}while(a); do\na\nwhile(b) if(a)do{}while(a)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof DoStatement);
    Assert(parseStatement() instanceof DoStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("while(a){f()} while(!a)\na\n if(a)while(a)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof WhileStatement);
    Assert(parseStatement() instanceof WhileStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(;;){} for(a;b;c)a\n if(a)for(a=1;;a++)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(var a=1;;){} for(var a,{b:b=2}=c;b in i;c)a\n if(a)for(var a=1;;a++)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(let a=1;;){} for(let a,{b:b=2}=c;b in i;c)a\n if(a)for(let a=1;;a++)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(const a=1;;){} for(const a=1,{b:b=2}=c;b=1 in i;c)a\n if(a)for(const a=1;;a++)\n/*\n*/;else b; 1");
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof ForStatement);
    Assert(parseStatement() instanceof IfStatement);
    Assert(parseStatement() instanceof ExpressionStatement);

    setParsingText("for(a in b){} for(a[1] in b in i)a\n");
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "for(let f;;){var f,f,f}", false, "EarlySyntaxError: 13.7.4.1: f", 1, 18);
    test_early_error(parseStatement, [], "for(new f in a){}", false, "EarlySyntaxError: 13.7.5.1-B");
    test_early_error(parseStatement, [], "for(f(a) in a){}", false, "EarlySyntaxError: 13.7.5.1-B");
    test_early_error(parseStatement, [], "for(eval in a){}", true, "EarlySyntaxError: 13.7.5.1-B");

    test_early_error(parseScript, [], "for({a=1,b=1} ;;){}", false, "EarlySyntaxError: 12.2.6.1-B");
    test_no_error(parseScript, [], "for({a=1,b=1} in c){}");
    test_no_error(parseScript, [], "for((({a=1,b=1})) of c){}");
    test_early_error(parseScript, [], "for(let of c){}", false, "EarlySyntaxError");
    test_no_error(parseScript, [], "for(let in c){}");

    setParsingText("for({a:b=2,} in b,c){} for({a:b+2,}.a in b,c){} for((({a:b=2,}))in b,c){}");
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for([a,,...{b=2}] in b,c){}");
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(var a in b){} for(var [a,b,...c] in b in i)a\n for(var {a,c:d=e,f=2,} in b());");
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(let a in b){} for(let [a,b,...c] in b in i)a\n for(let {a,c:d=e,f=2,} in b());");
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(const a in b){} for(const [a,b,...c] in b in i)a\n for(const {a,c:d=e,f=2,} in b());");
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    Assert(parseStatement() instanceof ForInStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(a of b){} for(a[1] of b in i)a\n");
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(var a of b){} for(var [a,b,...c] of b in i)a\n for(var {a,c:d=e,f=2,} of b());");
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(let a of b){} for(let [a,b,...c] of b in i)a\n for(let {a,c:d=e,f=2,} of b());");
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("for(const a of b){} for(const [a,b,...c] of b in i)a\n for(const {a,c:d=e,f=2,} of b());");
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    Assert(parseStatement() instanceof ForOfStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "for(const let in a){}", false, "EarlySyntaxError: 13.7.5.1-D: let", 1, 11);
    test_early_error(parseStatement, [], "for(let {let} of a){}", false, "EarlySyntaxError: 13.7.5.1-D: let", 1, 10);
    test_early_error(parseStatement, [], "for(let [aa,bb,aa,aa] in a){}", false, "EarlySyntaxError: 13.7.5.1-F: aa", 1, 16);
    test_early_error(parseStatement, [], "for(let aa,bb,aa;;){}", false, "EarlySyntaxError: 13.3.1.1-B: aa", 1, 15);
    test_early_error(parseStatement, [], "for(const aa,bb,cc;;){}", false, "EarlySyntaxError: 13.3.1.1-C");

    test_early_error(parseStatement, [], "for(let v in a){var v}", false, "EarlySyntaxError: 13.7.5.1-E: v", 1, 21);

    setParsingText("for(var let of b){}");
    Assert(parseStatement() instanceof ForOfStatement);
    setParsingText("for(var let=1,let=2;;){}");
    Assert(parseStatement() instanceof ForStatement);

    setParsingText("continue; continue\n a;continue a; continue");
    enterIterationStatement();
    Assert(parseStatement() instanceof ContinueStatement);
    Assert(parseStatement() instanceof ContinueStatement);
    Assert(parseStatement() instanceof ExpressionStatement);
    Assert(parseStatement() instanceof ContinueStatement);
    Assert(parseStatement() instanceof ContinueStatement);

    setParsingText("break; break\n a;break a; break");
    enterSwitchStatement();
    Assert(parseStatement() instanceof BreakStatement);
    Assert(parseStatement() instanceof BreakStatement);
    Assert(parseStatement() instanceof ExpressionStatement);
    Assert(parseStatement() instanceof BreakStatement);
    Assert(parseStatement() instanceof BreakStatement);

    setParsingText("return; return\n a+1;return a+1; return");
    Assert(parseStatement(0, "Return") instanceof ReturnStatement);
    Assert(parseStatement(0, "Return") instanceof ReturnStatement);
    Assert(parseStatement(0, "Return") instanceof ExpressionStatement);
    Assert(parseStatement(0, "Return") instanceof ReturnStatement);
    Assert(parseStatement(0, "Return") instanceof ReturnStatement);

    setParsingText("with(a){f()} with(!a)\na\n if(a)with(a)\n/*\n*/;else b;");
    Assert(parseStatement() instanceof WithStatement);
    Assert(parseStatement() instanceof WithStatement);
    Assert(parseStatement() instanceof IfStatement);
    AssertEquals(peekToken(), "");

    setParsingText("switch(a){case 1:a;break;case 2:default:b;break;case 3:c;break;case 4:if(a);}");
    Assert(parseStatement() instanceof SwitchStatement);
    AssertEquals(peekToken(), "");

    setParsingText("switch(a){} switch(a){case 1:case 2:L1:a;} switch(a){default:case 2:}");
    Assert(parseStatement() instanceof SwitchStatement);
    Assert(parseStatement() instanceof SwitchStatement);
    Assert(parseStatement() instanceof SwitchStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "switch(1){case 1:let a; case 2:function a(){}}", false, "EarlySyntaxError: 13.12.1-A: a", 1, 41);
    test_early_error(parseStatement, [], "switch(1){case 2:function a(){} case 1:let a; }", false, "EarlySyntaxError: 13.12.1-A: a", 1, 44);
    test_early_error(parseStatement, [], "switch(1){case 1:let a; case 2:var a}", false, "EarlySyntaxError: 13.12.1-B: a", 1, 36);
    test_early_error(parseStatement, [], "switch(1){case 1:var a; case 2:let a}", false, "EarlySyntaxError: 13.12.1-B: a", 1, 22);

    setParsingText("L1:a; L2:\nLL3:if(a)L4:;else L5:a;");
    Assert(parseStatement() instanceof LabelledStatement);
    Assert(parseStatement() instanceof LabelledStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "L1:function a(){}", true, "EarlySyntaxError: 13.13.1");
    test_early_error(parseStatement, [], "if(1)L1:L2:function a(){}", false, "EarlySyntaxError: 13.6.1", 1, 6);
    test_early_error(parseStatement, [], "while(1)L1:L2:function a(){}", false, "EarlySyntaxError: 13.7.1.1", 1, 9);
    test_early_error(parseStatement, [], "with(1)L1:L2:L3:function a(){}", false, "EarlySyntaxError: 13.11.1-B", 1, 8);
    test_early_error(parseStatement, [], "with(1)function a(){}", false, "EarlySyntaxError", 1, 8);
    test_no_error(parseStatement, [], "with(1)L1:L2:L3:a=function a(){}", false);

    setParsingText("try{}catch(e){}finally{} try{}finally{} try{}catch({a:c,b=2,}){}");
    Assert(parseStatement() instanceof TryStatement);
    Assert(parseStatement() instanceof TryStatement);
    Assert(parseStatement() instanceof TryStatement);

    test_early_error(parseStatement, [], "try{}catch([a,a,a]){}", false, "EarlySyntaxError: 13.15.1-A: a", 1, 15);
    test_early_error(parseStatement, [], "try{}catch(a){let c; function a(){};}", false, "EarlySyntaxError: 13.15.1-B: a", 1, 31);
    test_early_error(parseStatement, [], "try{}catch([a,b]){let l,a;{let a}}", false, "EarlySyntaxError: 13.15.1-B: a", 1, 25);
    test_early_error(parseStatement, [], "try{}catch([a,b]){var c; var a,a;}", false, "EarlySyntaxError: 13.15.1-C: a", 1, 30);
    test_early_error(parseStatement, [], "try{}catch(a){while(1){var a,a;}}", false, "EarlySyntaxError: 13.15.1-C: a", 1, 28);
    test_early_error(parseStatement, [], "try{}catch(a){for(var a;;){var c,a;}}", false, "EarlySyntaxError: 13.15.1-C: a", 1, 23);

    setParsingText("debugger; debugger\n debugger");
    Assert(parseStatement() instanceof DebuggerStatement);
    Assert(parseStatement() instanceof DebuggerStatement);
    Assert(parseStatement() instanceof DebuggerStatement);
    AssertEquals(peekToken(), "");

    test_early_error(parseStatement, [], "++ ++ y", false, "EarlyReferenceError: 12.5.1");
    test_early_error(parseScript, [], "var z=\n x\n ++\n ++\n y", false, "EarlyReferenceError: 12.5.1");

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
