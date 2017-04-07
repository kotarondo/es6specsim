/*
 Copyright (c) 2016, Kotaro Endo.
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 
 2. Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
 
 3. Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// 13 ECMAScript Language: Statements and Declarations

var AnnexB_3_2$ = true;

var inIterationStatement$;
var inSwitchStatement$;

function isInIterationStatement() {
    return !!inIterationStatement$;
}

function enterIterationStatement() {
    AssertGreaterEquals(inIterationStatement$, 0);
    ++inIterationStatement$;
}

function leaveIterationStatement() {
    --inIterationStatement$;
    AssertGreaterEquals(inIterationStatement$, 0);
}

function isInSwitchStatement() {
    return !!inSwitchStatement$;
}

function enterSwitchStatement() {
    AssertGreaterEquals(inSwitchStatement$, 0);
    ++inSwitchStatement$;
}

function leaveSwitchStatement() {
    --inSwitchStatement$;
    AssertGreaterEquals(inSwitchStatement$, 0);
}

function saveBodyContext() {
    var ctx = {
        inIterationStatement: inIterationStatement$,
        inSwitchStatement: inSwitchStatement$,
    };
    inIterationStatement$ = 0;
    inSwitchStatement$ = 0;
    return ctx;
}

function restoreBodyContext(ctx) {
    AssertEquals(inIterationStatement$, 0);
    AssertEquals(inSwitchStatement$, 0);
    inIterationStatement$ = ctx.inIterationStatement;
    inSwitchStatement$ = ctx.inSwitchStatement;
}

// 13.1 Statement Semantics

function parseStatement(Yield, Return) {
    var pos = getParsingPosition();
    switch (peekToken()) {
        case "{":
            return parseBlockStatement(Yield, Return).setPosition(pos);
        case "var":
            return parseVariableStatement(Yield).setPosition(pos);
        case ";":
            return parseEmptyStatement().setPosition(pos);
        case "if":
            return parseIfStatement(Yield, Return).setPosition(pos);
        case "do":
            return parseDoStatement(Yield, Return).setPosition(pos);
        case "while":
            return parseWhileStatement(Yield, Return).setPosition(pos);
        case "for":
            return parseForStatement(Yield, Return).setPosition(pos);
        case "switch":
            return parseSwitchStatement(Yield, Return).setPosition(pos);
        case "continue":
            return parseContinueStatement(Yield).setPosition(pos);
        case "break":
            return parseBreakStatement(Yield).setPosition(pos);
        case "return":
            if (!Return) break;
            return parseReturnStatement(Yield).setPosition(pos);
        case "with":
            return parseWithStatement(Yield, Return).setPosition(pos);
        case "throw":
            return parseThrowStatement(Yield).setPosition(pos);
        case "try":
            return parseTryStatement(Yield, Return).setPosition(pos);
        case "debugger":
            return parseDebuggerStatement().setPosition(pos);
        case "function":
        case "class":
            throw new EarlySyntaxError();
        case "let":
            if (nextToken() === "[") {
                throw new EarlySyntaxError();
            }
    }
    if (isTokenIdentifierName(peekToken()) && nextToken() === ":") {
        return parseLabelledStatement(Yield, Return).setPosition(pos);
    }
    return parseExpressionStatement(Yield).setPosition(pos);
}

function parseDeclaration(Yield) {
    switch (peekToken()) {
        case "function":
            return parseHoistableDeclaration(Yield, !"Default");
        case "class":
            return parseClassDeclaration(Yield, !"Default");
        case "let":
        case "const":
            return parseLexicalDeclaration("In", Yield);
    }
    throw new EarlySyntaxError();
}

function parseHoistableDeclaration(Yield, Default) {
    AssertEquals(peekToken(), "function");
    if (nextToken() === "*") {
        return parseGeneratorDeclaration(Yield, Default);
    }
    return parseFunctionDeclaration(Yield, Default);
}

// 13.2 Block

function parseBlockStatement(Yield, Return) {
    var block = parseBlock(Yield, Return);
    return new BlockStatement(block);
}

function parseBlock(Yield, Return) {
    proceedToken("{");
    var stmts = parseStatementList(Yield, Return);
    proceedToken("}");
    validateEarlyError_13_2_1(stmts);
    return new Block(stmts);
}

function validateEarlyError_13_2_1(StatementList) {
    var d;
    var names = StatementList.LexicallyDeclaredNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("13.2.1-A", d);
    }
    var names2 = StatementList.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("13.2.1-B", d);
    }
}

function parseStatementList(Yield, Return) {
    var list = [];
    while (true) {
        switch (peekToken()) {
            case "}":
            case "case":
            case "default":
            case "":
                return new StatementList(list);
        }
        var item = parseStatementListItem(Yield, Return);
        list.push(item);
    }
}

function parseStatementListItem(Yield, Return) {
    switch (peekToken()) {
        case "let":
            if (nextToken() !== "[" && nextToken() !== "{") {
                if (!isTokenIdentifierName(nextToken()) || isReservedWord(nextToken())) {
                    break;
                }
            }
        case "const":
        case "function":
        case "class":
            var decl = parseDeclaration(Yield);
            return new StatementListItemOfDeclaration(decl);
    }
    var stmt = parseStatement(Yield, Return);
    return new StatementListItemOfStatement(stmt);
}

// 13.3 Declarations and the Variable Statement

function parseLexicalDeclaration(In, Yield) {
    var pos = getParsingPosition();
    var type = peekToken();
    proceedToken(type);
    var bindings = parseBindingList(In, Yield, type);
    proceedAutoSemicolon();
    validateEarlyError_13_3_1_1_AB(bindings);
    return new LexicalDeclaration(type, bindings).setPosition(pos);
}

function parseBindingList(In, Yield, type) {
    var list = [];
    while (true) {
        var decl = parseLexicalBinding(In, Yield, type);
        list.push(decl);
        if (peekToken() !== ",") {
            break;
        }
        proceedToken(",");
    }
    return new BindingList(list);
}

function parseLexicalBinding(In, Yield, type) {
    if (peekToken() !== "[" && peekToken() !== "{") {
        var ident = parseBindingIdentifier(Yield);
        if (peekToken() === "=") {
            var init = parseInitializer(In, Yield);
        } else {
            validateEarlyError_13_3_1_1_C(type);
        }
        return new LexicalBindingByIdentifier(ident, init);
    }
    var patt = parseBindingPattern(Yield);
    var init = parseInitializer(In, Yield);
    return new LexicalBindingByPattern(patt, init);
}

function validateEarlyError_13_3_1_1_AB(BindingList) {
    var d;
    var names = BindingList.BoundNames();
    if (d = alsoOccursIn(["let"], names)) {
        throw new EarlySyntaxError("13.3.1.1-A", d);
    }
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("13.3.1.1-B", d);
    }
}

function validateEarlyError_13_3_1_1_C(type) {
    if (type === "const") {
        throw new EarlySyntaxError("13.3.1.1-C");
    }
}

function parseVariableStatement(Yield) {
    proceedToken("var");
    var decls = parseVariableDeclarationList("In", Yield);
    proceedAutoSemicolon();
    return new VariableStatement(decls);
}

function parseVariableDeclarationList(In, Yield) {
    var list = [];
    while (true) {
        var decl = parseVariableDeclaration(In, Yield);
        list.push(decl);
        if (peekToken() !== ",") {
            break;
        }
        proceedToken(",");
    }
    return new VariableDeclarationList(list);
}

function parseVariableDeclaration(In, Yield) {
    if (peekToken() !== "[" && peekToken() !== "{") {
        var ident = parseBindingIdentifier(Yield);
        if (peekToken() === "=") {
            var init = parseInitializer(In, Yield);
        }
        return new VariableDeclarationByIdentifier(ident, init);
    }
    var patt = parseBindingPattern(Yield);
    var init = parseInitializer(In, Yield);
    return new VariableDeclarationByPattern(patt, init);
}

function parseBindingPattern(Yield) {
    switch (peekToken()) {
        case "{":
            return parseObjectBindingPattern(Yield);
        case "[":
            return parseArrayBindingPattern(Yield);
    }
    throw new EarlySyntaxError();
}

function parseObjectBindingPattern(Yield) {
    proceedToken("{");
    var list = [];
    while (true) {
        if (peekToken() === "}") break;
        var prop = parseBindingProperty(Yield);
        list.push(prop);
        if (peekToken() === "}") break;
        proceedToken(",");
    }
    proceedToken("}");
    return new ObjectBindingPattern(list);
}

function parseArrayBindingPattern(Yield) {
    proceedToken("[");
    var list = [];
    while (true) {
        list.push(parseElision());
        if (peekToken() === "]") {
            break;
        } else if (peekToken() === "...") {
            var rest = parseBindingRestElement(Yield);
            list.push(rest);
            break;
        }
        var elem = parseBindingElement(Yield);
        list.push(elem);
        if (peekToken() !== ",") {
            break;
        }
        proceedToken(",");
    }
    proceedToken("]");
    return new ArrayBindingPattern(list);
}

function parseBindingProperty(Yield) {
    if (isTokenIdentifierName(peekToken()) && nextToken() !== ":") {
        return parseSingleNameBinding(Yield);
    }
    var name = parsePropertyName(Yield);
    proceedToken(":");
    var elem = parseBindingElement(Yield);
    return new BindingProperty(name, elem);
}

function parseBindingElement(Yield) {
    if (peekToken() !== "[" && peekToken() !== "{") {
        return parseSingleNameBinding(Yield);
    }
    var patt = parseBindingPattern(Yield);
    if (peekToken() === "=") {
        var init = parseInitializer("In", Yield);
    }
    return new BindingElement(patt, init);
}

function parseSingleNameBinding(Yield) {
    var ident = parseBindingIdentifier(Yield);
    if (peekToken() === "=") {
        var init = parseInitializer("In", Yield);
    }
    return new SingleNameBinding(ident, init);
}

function parseBindingRestElement(Yield) {
    proceedToken("...");
    var ident = parseBindingIdentifier(Yield);
    return new BindingRestElement(ident);
}

// 13.4 Empty Statement

function parseEmptyStatement() {
    proceedToken(";");
    return new EmptyStatement();
}

// 13.5 Expression Statement

function parseExpressionStatement(Yield) {
    var expr = parseExpression("In", Yield);
    proceedAutoSemicolon();
    return new ExpressionStatement(expr);
}

// 13.6 The if Statement

function parseIfStatement(Yield, Return) {
    proceedToken("if");
    proceedToken("(");
    var expr = parseExpression("In", Yield);
    proceedToken(")");
    var stmt = parseStatement(Yield, Return);
    validateEarlyError_13_6_1(stmt);
    if (peekToken() === "else") {
        proceedToken("else");
        var stmt2 = parseStatement(Yield, Return);
        validateEarlyError_13_6_1(stmt2);
    }
    return new IfStatement(expr, stmt, stmt2);
}

function validateEarlyError_13_6_1(Statement) {
    if (IsLabelledFunction(Statement)) {
        throw new EarlySyntaxError("13.6.1", Statement);
    }
}

// 13.7 Iteration Statements

function parseDoStatement(Yield, Return) {
    enterIterationStatement();
    proceedToken("do");
    var stmt = parseStatement(Yield, Return);
    validateEarlyError_13_7_1_1(stmt);
    proceedToken("while");
    proceedToken("(");
    var expr = parseExpression("In", Yield);
    proceedToken(")");
    if (peekToken() === ";") {
        proceedToken(";");
    }
    leaveIterationStatement();
    return new DoStatement(stmt, expr);
}

function parseWhileStatement(Yield, Return) {
    enterIterationStatement();
    proceedToken("while");
    proceedToken("(");
    var expr = parseExpression("In", Yield);
    proceedToken(")");
    var stmt = parseStatement(Yield, Return);
    validateEarlyError_13_7_1_1(stmt);
    leaveIterationStatement();
    return new WhileStatement(expr, stmt);
}

function parseForStatement(Yield, Return) {
    enterIterationStatement();
    proceedToken("for");
    proceedToken("(");
    var pos = getParsingPosition();
    var type = peekToken();
    switch (type) {
        case "let":
            if (nextToken() !== "[" && nextToken() !== "{") {
                if (!isTokenIdentifierName(nextToken()) || isReservedWord(nextToken())) {
                    break;
                }
            }
        case "const":
        case "var":
            proceedToken(type);
            var binding = parseForBinding(Yield);
            switch (peekToken()) {
                case "in":
                    if (type !== "var") validateEarlyError_13_7_5_1_DF(binding);
                    return case_in(type, binding);
                case "of":
                    if (type !== "var") validateEarlyError_13_7_5_1_DF(binding);
                    return case_of(type, binding);
            }
            setParsingPosition(pos);
            proceedToken(type);
            if (type === "var") {
                var decls = parseVariableDeclarationList(!"In", Yield);
                return case_def(type, decls);
            } else {
                var bindings = parseBindingList(!"In", Yield, type);
                validateEarlyError_13_3_1_1_AB(bindings);
                return case_def(type, new LexicalDeclaration(type, bindings));
            }
        case ";":
            return case_def("", void 0);
    }
    var expr = parseExpression(!"In", Yield);
    if (peekToken() === "in" || peekToken() === "of") {
        if (lastLeftHandSideExpression$ !== expr) {
            throw new EarlySyntaxError();
        }
        if (expr instanceof ArrayLiteral || expr instanceof ObjectLiteral) {
            setParsingPosition(pos);
            for (var i = 0; peekToken() === "("; i++) {
                proceedToken("(");
            }
            var expr = parseAssignmentPattern(Yield);
            while (i--) {
                proceedToken(")");
            }
        } else {
            validateEarlyError_13_7_5_1_B(expr);
        }
        switch (peekToken()) {
            case "in":
                return case_in("", expr);
            case "of":
                if (type === "let") throw new EarlySyntaxError();
                return case_of("", expr);
        }
    }
    return case_def("", expr);

    function case_def(type, head) {
        proceedToken(";");
        if (peekToken() !== ";") {
            var expr = parseExpression("In", Yield);
        }
        proceedToken(";");
        if (peekToken() !== ")") {
            var expr2 = parseExpression("In", Yield);
        }
        proceedToken(")");
        var stmt = parseStatement(Yield, Return);
        validateEarlyError_13_7_1_1(stmt);
        if (type === "let" || type === "const") validateEarlyError_13_7_4_1(head, stmt);
        leaveIterationStatement();
        return new ForStatement(type, head, expr, expr2, stmt);
    }

    function case_in(type, head) {
        proceedToken("in");
        var expr = parseExpression("In", Yield);
        proceedToken(")");
        var stmt = parseStatement(Yield, Return);
        validateEarlyError_13_7_1_1(stmt);
        if (type === "let" || type === "const") validateEarlyError_13_7_5_1_E(head, stmt);
        leaveIterationStatement();
        return new ForInStatement(type, head, expr, stmt);
    }

    function case_of(type, head) {
        proceedToken("of");
        var expr = parseAssignmentExpression("In", Yield);
        proceedToken(")");
        var stmt = parseStatement(Yield, Return);
        validateEarlyError_13_7_1_1(stmt);
        if (type === "let" || type === "const") validateEarlyError_13_7_5_1_E(head, stmt);
        leaveIterationStatement();
        return new ForOfStatement(type, head, expr, stmt);
    }
}

function parseForBinding(Yield) {
    if (peekToken() !== "[" && peekToken() !== "{") {
        return parseBindingIdentifier(Yield);
    }
    return parseBindingPattern(Yield);
}

function validateEarlyError_13_7_1_1(Statement) {
    if (IsLabelledFunction(Statement)) {
        throw new EarlySyntaxError("13.7.1.1", Statement);
    }
}

function validateEarlyError_13_7_4_1(LexicalDeclaration, Statement) {
    var d;
    var names = LexicalDeclaration.BoundNames();
    var names2 = Statement.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("13.7.4.1", d);
    }
}

function validateEarlyError_13_7_5_1_B(LeftHandSideExpression) {
    if (!LeftHandSideExpression.IsValidSimpleAssignmentTarget()) {
        throw new EarlySyntaxError("13.7.5.1-B");
    }
}

function validateEarlyError_13_7_5_1_DF(ForBinding) {
    var d;
    var names = ForBinding.BoundNames();
    if (d = alsoOccursIn(["let"], names)) {
        throw new EarlySyntaxError("13.7.5.1-D", d);
    }
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("13.7.5.1-F", d);
    }
}

function validateEarlyError_13_7_5_1_E(ForDeclaration, Statement) {
    var d;
    var names = ForDeclaration.BoundNames();
    var names2 = Statement.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("13.7.5.1-E", d);
    }
}

// 13.8 The continue Statement

function parseContinueStatement(Yield) {
    validateEarlyError_13_8_1();
    proceedToken("continue");
    if (isTokenIdentifierName(peekToken()) && !peekTokenIsLineSeparated()) {
        var label = parseLabelIdentifier(Yield);
    }
    proceedAutoSemicolon();
    return new ContinueStatement(label);
}

function validateEarlyError_13_8_1() {
    if (!isInIterationStatement()) {
        throw new EarlySyntaxError("13.8.1");
    }
}

// 13.9 The break Statement

function parseBreakStatement(Yield) {
    proceedToken("break");
    if (isTokenIdentifierName(peekToken()) && !peekTokenIsLineSeparated()) {
        var label = parseLabelIdentifier(Yield);
    } else {
        validateEarlyError_13_9_1();
    }
    proceedAutoSemicolon();
    return new BreakStatement(label);
}

function validateEarlyError_13_9_1() {
    if (!isInIterationStatement() && !isInSwitchStatement()) {
        throw new EarlySyntaxError("13.8.1");
    }
}

// 13.10 The return Statement

function parseReturnStatement(Yield) {
    proceedToken("return");
    if (!isAutoSemicolonCapable()) {
        var expr = parseExpression("In", Yield);
    }
    proceedAutoSemicolon();
    return new ReturnStatement(expr);
}

// 13.11 The with Statement

function parseWithStatement(Yield, Return) {
    validateEarlyError_13_11_1_A();
    proceedToken("with");
    proceedToken("(");
    var expr = parseExpression("In", Yield);
    proceedToken(")");
    var stmt = parseStatement(Yield, Return);
    validateEarlyError_13_11_1_B(stmt);
    return new WithStatement(expr, stmt);
}

function validateEarlyError_13_11_1_A() {
    if (isInStrictMode()) {
        throw new EarlySyntaxError("13.11.1-A");
    }
}

function validateEarlyError_13_11_1_B(Statement) {
    if (IsLabelledFunction(Statement)) {
        throw new EarlySyntaxError("13.11.1-B", Statement);
    }
}

// 13.12 The switch Statement

function parseSwitchStatement(Yield, Return) {
    enterSwitchStatement();
    proceedToken("switch");
    proceedToken("(");
    var expr = parseExpression("In", Yield);
    proceedToken(")");
    proceedToken("{");
    var clauses = parseCaseClauses(Yield, Return);
    if (peekToken() === "default") {
        var defaultClause = parseDefaultClause(Yield, Return);
        var clauses2 = parseCaseClauses(Yield, Return);
    } else {
        validateEarlyError_13_12_1(clauses);
    }
    proceedToken("}");
    leaveSwitchStatement();
    return new SwitchStatement(expr, new CaseBlock(clauses, defaultClause, clauses2));
}

function parseCaseClauses(Yield, Return) {
    var list = [];
    while (peekToken() === "case") {
        proceedToken("case");
        var expr = parseExpression("In", Yield);
        proceedToken(":");
        var stmts = parseStatementList(Yield, Return);
        list.push(new CaseClause(expr, stmts));
    }
    return new CaseClauses(list);
}

function parseDefaultClause(Yield, Return) {
    proceedToken("default");
    proceedToken(":");
    var stmts = parseStatementList(Yield, Return);
    return new DefaultClause(stmts);
}

function validateEarlyError_13_12_1(CaseClauses) {
    var d;
    var names = CaseClauses.LexicallyDeclaredNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("13.12.1-A", d);
    }
    var names2 = CaseClauses.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("13.12.1-B", d);
    }
}

// 13.13 Labelled Statements

function parseLabelledStatement(Yield, Return) {
    var label = parseLabelIdentifier(Yield);
    proceedToken(":");
    var item = parseLabelledItem(Yield, Return);
    return new LabelledStatement(label, item);
}

function parseLabelledItem(Yield, Return) {
    if (peekToken() !== "function") {
        return parseStatement(Yield, Return);
    }
    validateEarlyError_13_13_1();
    return parseFunctionDeclaration(Yield, !"Default");
}

function validateEarlyError_13_13_1() {
    if (!AnnexB_3_2$ || isInStrictMode()) {
        throw new EarlySyntaxError("13.13.1");
    }
}

function IsLabelledFunction(stmt) {
    if (!(stmt instanceof LabelledStatement)) return false;
    var item = stmt.LabelledItem;
    if (item instanceof FunctionDeclaration) return true;
    var subStmt = item;
    return IsLabelledFunction(subStmt);
}

// 13.14 The throw Statement

function parseThrowStatement(Yield) {
    proceedToken("throw");
    if (peekTokenIsLineSeparated()) {
        throw new EarlySyntaxError();
    }
    var expr = parseExpression("In", Yield);
    return new ThrowStatement(expr);
}

// 13.15 The try Statement

function parseTryStatement(Yield, Return) {
    proceedToken("try");
    var block1 = parseBlock(Yield, Return);
    if (peekToken() === "catch") {
        proceedToken("catch");
        proceedToken("(");
        var param = parseCatchParameter(Yield);
        proceedToken(")");
        var block2 = parseBlock(Yield, Return);
        validateEarlyError_13_15_1(param, block2);
    }
    if (peekToken() === "finally") {
        proceedToken("finally");
        var block3 = parseBlock(Yield, Return);
    }
    return new TryStatement(block1, param, block2, block3);
}

function parseCatchParameter(Yield) {
    if (peekToken() !== "[" && peekToken() !== "{") {
        return parseBindingIdentifier(Yield);
    }
    return parseBindingPattern(Yield);
}

function validateEarlyError_13_15_1(CatchParameter, Block) {
    var d;
    var names = CatchParameter.BoundNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("13.15.1-A", d);
    }
    var names2 = Block.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("13.15.1-B", d);
    }
    var names3 = Block.VarDeclaredNames();
    if (d = alsoOccursIn(names, names3)) {
        throw new EarlySyntaxError("13.15.1-C", d);
    }
}

// 13.16 The debugger statement

function parseDebuggerStatement() {
    proceedToken("debugger");
    proceedAutoSemicolon();
    return new DebuggerStatement();
}
