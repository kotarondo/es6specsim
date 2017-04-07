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

// 14 ECMAScript Language: Functions

// 14.1 Function Definitions

function parseFunctionDeclaration(Yield, Default) {
    var pos = getParsingPosition();
    proceedToken("function");
    if (peekToken() !== "(") {
        var name = parseBindingIdentifier(Yield);
    } else {
        if (!Default) throw new EarlySyntaxError();
    }
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseFormalParameters(!"Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseFunctionBody(!"Yield");
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseFormalParameters(!"Yield");
        });
    }
    validateEarlyError_14_1_2_A2G(name, param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return new FunctionDeclaration(name, param, body).setPosition(pos);
}

function parseFunctionExpression() {
    proceedToken("function");
    if (peekToken() !== "(") {
        var name = parseBindingIdentifier(!"Yield");
    }
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseFormalParameters(!"Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseFunctionBody(!"Yield");
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            setParsingPosition(paramPos);
            param = parseFormalParameters(!"Yield");
        });
    }
    validateEarlyError_14_1_2_A2G(name, param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return new FunctionExpression(name, param, body);
}

function parseStrictFormalParameters(Yield) {
    var param = parseFormalParameters(Yield);
    validateEarlyError_14_1_2_H(param);
    return param;
}

function parseFormalParameters(Yield) {
    var params = parseFormalParameterList(Yield);
    validateEarlyError_14_1_2_I(params);
    return new FormalParameters(params);
}

function parseFormalParameterList(Yield) {
    var list = [];
    if (peekToken() !== ")") {
        while (true) {
            if (peekToken() === "...") {
                var rest = parseFunctionRestParameter(Yield);
                list.push(rest);
                break;
            }
            var elem = parseFormalParameter(Yield);
            list.push(elem);
            if (peekToken() !== ",") break;
            proceedToken(",");
        }
    }
    return new FormalParameterList(list);
}

function parseFunctionRestParameter(Yield) {
    return parseBindingRestElement(Yield);
}

function parseFormalParameter(Yield) {
    return parseBindingElement(Yield);
}

function parseFunctionBody(Yield) {
    var saved = saveBodyContext();
    if (isInStrictMode() || containsUseStrictDirective()) {
        enterStrictMode();
    }
    var stmts = parseFunctionStatementList(Yield);
    validateEarlyError_14_1_2_J2N(stmts);
    var body = new FunctionBody(stmts);
    body.strict = isInStrictMode();
    if (isInStrictMode()) {
        leaveStrictMode();
    }
    restoreBodyContext(saved);
    return body;
}

function parseFunctionStatementList(Yield) {
    var stmts = parseStatementList(Yield, "Return");
    return new FunctionStatementList(stmts);
}

function validateEarlyError_14_1_2_A2G(BindingIdentifier, FormalParameters, FunctionBody) {
    if (FunctionBody.strict) {
        validateEarlyError_14_1_2_H(FormalParameters);
    }
    if (FunctionBody.strict && BindingIdentifier) {
        if (BindingIdentifier.SV === "eval" || BindingIdentifier.SV === "arguments") {
            throw new EarlySyntaxError("14.1.2-B", BindingIdentifier);
        }
    }
    var d;
    var names = FormalParameters.BoundNames();
    var names2 = FunctionBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.1.2-C", d);
    }
    if (d = FormalParameters.Contains("SuperProperty")) {
        throw new EarlySyntaxError("14.1.2-D", d);
    }
    if (d = FunctionBody.Contains("SuperProperty")) {
        throw new EarlySyntaxError("14.1.2-E", d);
    }
    if (d = FormalParameters.Contains("SuperCall")) {
        throw new EarlySyntaxError("14.1.2-F", d);
    }
    if (d = FunctionBody.Contains("SuperCall")) {
        throw new EarlySyntaxError("14.1.2-G", d);
    }
}

function validateEarlyError_14_1_2_H(FormalParameters) {
    var d;
    var names = FormalParameters.BoundNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("14.1.2-H", d);
    }
}

function validateEarlyError_14_1_2_I(FormalParameterList) {
    var d;
    if (!FormalParameterList.IsSimpleParameterList()) {
        if (d = containsAnyDuplicateEntries(FormalParameterList.BoundNames())) {
            throw new EarlySyntaxError("14.1.2-I", d);
        }
    }
}

function validateEarlyError_14_1_2_J2N(FunctionStatementList) {
    var d;
    var names = FunctionStatementList.LexicallyDeclaredNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("14.1.2-J", d);
    }
    var names2 = FunctionStatementList.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.1.2-K", d);
    }
    if (d = FunctionStatementList.ContainsDuplicateLabels([])) {
        throw new EarlySyntaxError("14.1.2-L", d);
    }
    if (d = FunctionStatementList.ContainsUndefinedBreakTarget([])) {
        throw new EarlySyntaxError("14.1.2-M", d);
    }
    if (d = FunctionStatementList.ContainsUndefinedContinueTarget([], [])) {
        throw new EarlySyntaxError("14.1.2-N", d);
    }
}

// 14.1.1 Directive Prologues and the Use Strict Directive

function containsUseStrictDirective() {
    var pos = getParsingPosition();
    var strict = false;
    while (true) {
        var token = peekToken();
        if (!isTokenStringLiteral(token)) {
            break;
        }
        proceedToken();
        if (!isAutoSemicolonCapable()) {
            break;
        }
        proceedAutoSemicolon();
        if (token === '"use strict"' || token === "'use strict'") {
            var strict = true;
        }
    }
    setParsingPosition(pos);
    return strict;
}

function reparseInStrictMode(paramPos, f) {
    var pos = getParsingPosition();
    var isLineSeparated = peekTokenIsLineSeparated();
    setParsingPosition(paramPos);
    enterStrictMode();
    f();
    leaveStrictMode();
    setParsingPosition(pos, isLineSeparated);
}

// 14.2 Arrow Function Definitions

function parseArrowFunction(In, Yield) {
    var paramPos = getParsingPosition();
    var param = parseArrowParameters(Yield);
    if (peekTokenIsLineSeparated()) {
        throw new EarlySyntaxError();
    }
    proceedToken("=>");
    var body = parseConciseBody(In);
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseArrowParameters(Yield);
        });
    }
    validateEarlyError_14_2_1(param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return new ArrowFunction(param, body);
}

function parseArrowParameters(Yield) {
    if (peekToken() !== "(") {
        var ident = parseBindingIdentifier(Yield);
        return new SingleArrowParameter(ident);
    }
    proceedToken("(");
    var param = parseStrictFormalParameters(Yield);
    proceedToken(")");
    return param;
}

function parseConciseBody(In) {
    if (peekToken() !== "{") {
        var expr = parseAssignmentExpression(In);
        var body = new ConciseBody(expr);
    } else {
        proceedToken("{");
        var body = parseFunctionBody(!"Yield");
        proceedToken("}");
    }
    return body;
}

function validateEarlyError_14_2_1(ArrowParameters, ConciseBody) {
    var d;
    if (d = ArrowParameters.Contains("YieldExpression")) {
        throw new EarlySyntaxError("14.2.1-A", d);
    }
    if (d = ConciseBody.Contains("YieldExpression")) {
        throw new EarlySyntaxError("14.2.1-B", d);
    }
    var names = ArrowParameters.BoundNames();
    var names2 = ConciseBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.2.1-C", d);
    }
}

// 14.3 Method Definitions

function parseMethodDefinition(Yield) {
    var pos = getParsingPosition();
    switch (peekToken()) {
        case "get":
            if (nextToken() === "(") break;
            proceedToken("get");
            var name = parsePropertyName(Yield);
            proceedToken("(");
            proceedToken(")");
            proceedToken("{");
            var body = parseFunctionBody(!"Yield");
            proceedToken("}");
            validateEarlyError_12_2_6_1_B(body);
            return new MethodDefinitionGet(name, body).setPosition(pos);
        case "set":
            if (nextToken() === "(") break;
            proceedToken("set");
            var name = parsePropertyName(Yield);
            proceedToken("(");
            var paramPos = getParsingPosition();
            var param = parsePropertySetParameterList();
            proceedToken(")");
            proceedToken("{");
            var body = parseFunctionBody(!"Yield");
            proceedToken("}");
            if (body.strict && !isInStrictMode()) {
                reparseInStrictMode(paramPos, function() {
                    param = parsePropertySetParameterList();
                });
            }
            validateEarlyError_14_3_1_BC(param, body);
            validateEarlyError_12_2_6_1_B(param);
            validateEarlyError_12_2_6_1_B(body);
            return new MethodDefinitionSet(name, param, body).setPosition(pos);
        case "*":
            return parseGeneratorMethod(Yield).setPosition(pos);
    }
    var name = parsePropertyName(Yield);
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseStrictFormalParameters(!"Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseFunctionBody(!"Yield");
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseStrictFormalParameters(!"Yield");
        });
    }
    validateEarlyError_14_3_1_A(param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return new MethodDefinitionNormal(name, param, body).setPosition(pos);
}

function parsePropertySetParameterList() {
    return parseFormalParameter(!"Yield");
}

function validateEarlyError_14_3_1_A(StrictFormalParameters, FunctionBody) {
    var d;
    var names = StrictFormalParameters.BoundNames();
    var names2 = FunctionBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.3.1-A", d);
    }
}

function validateEarlyError_14_3_1_BC(PropertySetParameterList, FunctionBody) {
    var d;
    var names = PropertySetParameterList.BoundNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("14.3.1-B", d);
    }
    var names2 = FunctionBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.3.1-C", d);
    }
}

// 14.4 Generator Function Definitions

function parseGeneratorMethod(Yield) {
    proceedToken("*");
    var name = parsePropertyName(Yield);
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseStrictFormalParameters("Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseGeneratorBody();
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseStrictFormalParameters("Yield");
        });
    }
    var method = new GeneratorMethod(name, param, body);
    validateEarlyError_14_4_1_A(method);
    validateEarlyError_14_4_1_BC(param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return method;
}

function parseGeneratorDeclaration(Yield, Default) {
    var pos = getParsingPosition();
    proceedToken("function");
    proceedToken("*");
    if (peekToken() !== "(") {
        var name = parseBindingIdentifier(Yield);
    } else {
        if (!Default) throw new EarlySyntaxError();
    }
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseFormalParameters("Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseGeneratorBody();
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseFormalParameters("Yield");
        });
    }
    var decl = new GeneratorDeclaration(name, param, body).setPosition(pos);
    // TODO spec bug? applying only when name is defined // see NOTE2 in 14.1.2
    validateEarlyError_14_4_1_D(decl);
    validateEarlyError_14_4_1_F2K(name, param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return decl;
}

function parseGeneratorExpression() {
    proceedToken("function");
    proceedToken("*");
    if (peekToken() !== "(") {
        var name = parseBindingIdentifier("Yield");
    }
    proceedToken("(");
    var paramPos = getParsingPosition();
    var param = parseFormalParameters("Yield");
    proceedToken(")");
    proceedToken("{");
    var body = parseGeneratorBody();
    proceedToken("}");
    if (body.strict && !isInStrictMode()) {
        reparseInStrictMode(paramPos, function() {
            param = parseFormalParameters("Yield");
        });
    }
    var expr = new GeneratorExpression(name, param, body);
    validateEarlyError_14_4_1_E(expr);
    validateEarlyError_14_4_1_F2K(name, param, body);
    validateEarlyError_12_2_6_1_B(param);
    validateEarlyError_12_2_6_1_B(body);
    return expr;
}

function parseGeneratorBody() {
    return parseFunctionBody("Yield");
}

function parseYieldExpression(In) {
    var pos = getParsingPosition();
    proceedToken("yield");
    if (peekTokenIsLineSeparated()) {
        return new YieldExpression(void 0);
    }
    switch (peekToken()) {
        case ")":
        case "]":
        case "}":
        case ",":
        case ";":
        case ":":
            return new YieldExpression(void 0).setPosition(pos);
        default:
            var expr = parseAssignmentExpression(In, "Yield");
            return new YieldExpression(expr).setPosition(pos);
        case "*":
            proceedToken("*");
            var expr = parseAssignmentExpression(In, "Yield");
            return new YieldStarExpression(expr).setPosition(pos);
    }
}

function validateEarlyError_14_4_1_A(GeneratorMethod) {
    var d;
    if (d = GeneratorMethod.HasDirectSuper()) {
        throw new EarlySyntaxError("14.4.1-A", d);
    }
}

function validateEarlyError_14_4_1_BC(StrictFormalParameters, GeneratorBody) {
    var d;
    if (d = StrictFormalParameters.Contains("YieldExpression")) {
        throw new EarlySyntaxError("14.4.1-B", d);
    }
    var names = StrictFormalParameters.BoundNames();
    var names2 = GeneratorBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.4.1-C", d);
    }
}

function validateEarlyError_14_4_1_D(GeneratorDeclaration) {
    var d;
    if (d = GeneratorDeclaration.HasDirectSuper()) {
        throw new EarlySyntaxError("14.4.1-D", d);
    }
}

function validateEarlyError_14_4_1_E(GeneratorExpression) {
    var d;
    if (d = GeneratorExpression.HasDirectSuper()) {
        throw new EarlySyntaxError("14.4.1-E", d);
    }
}

function validateEarlyError_14_4_1_F2K(BindingIdentifier, FormalParameters, GeneratorBody) {
    if (GeneratorBody.strict) {
        validateEarlyError_14_1_2_H(FormalParameters);
    }
    if (GeneratorBody.strict && BindingIdentifier) {
        if (BindingIdentifier.SV === "eval" || BindingIdentifier.SV === "arguments") {
            throw new EarlySyntaxError("14.4.1-G", BindingIdentifier);
        }
    }
    var d;
    var names = FormalParameters.BoundNames();
    var names2 = GeneratorBody.LexicallyDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("14.4.1-H", d);
    }
    if (d = FormalParameters.Contains("YieldExpression")) {
        throw new EarlySyntaxError("14.4.1-I", d);
    }
    if (d = FormalParameters.Contains("SuperProperty")) {
        throw new EarlySyntaxError("14.4.1-J", d);
    }
    if (d = GeneratorBody.Contains("SuperProperty")) {
        throw new EarlySyntaxError("14.4.1-K", d);
    }
}

// 14.5 Class Definitions

function parseClassDeclaration(Yield, Default) {
    var pos = getParsingPosition();
    enterStrictMode();
    proceedToken("class");
    if (peekToken() !== "extends" && peekToken() !== "{") {
        var name = parseBindingIdentifier(Yield);
    } else {
        if (!Default) throw new EarlySyntaxError();
    }
    if (peekToken() === "extends") {
        proceedToken("extends");
        var expr = parseLeftHandSideExpression(Yield);
    }
    proceedToken("{");
    var body = parseClassBody(Yield);
    proceedToken("}");
    leaveStrictMode();
    validateEarlyError_14_5_1_A(expr, body);
    return new ClassDeclaration(name, expr, body).setPosition(pos);
}

function parseClassExpression(Yield, Default) {
    enterStrictMode();
    proceedToken("class");
    if (peekToken() !== "extends" && peekToken() !== "{") {
        var name = parseBindingIdentifier(Yield);
    }
    if (peekToken() === "extends") {
        proceedToken("extends");
        var expr = parseLeftHandSideExpression(Yield);
    }
    proceedToken("{");
    var body = parseClassBody(Yield);
    proceedToken("}");
    leaveStrictMode();
    validateEarlyError_14_5_1_A(expr, body);
    return new ClassExpression(name, expr, body);
}

function parseClassBody(Yield) {
    var elems = parseClassElementList(Yield);
    validateEarlyError_14_5_1_B(elems);
    var body = new ClassBody(elems);
    var list = elems.list;
    for (var i = 0; i < list.length; i++) {
        if (list[i].static) continue;
        if (list[i].PropName() === "constructor") {
            body.ConstructorMethod = list[i];
            break;
        }
    }
    return body;
}

function parseClassElementList(Yield) {
    var list = [];
    while (true) {
        switch (peekToken()) {
            default: var def = parseMethodDefinition(Yield);
            list.push(def);
            validateEarlyError_14_5_1_CD(def);
            break;
            case "static":
                    proceedToken("static");
                var def = parseMethodDefinition(Yield);
                def.static = true;
                list.push(def);
                validateEarlyError_14_5_1_EF(def);
                break;
            case ";":
                    proceedToken(";");
                break;
            case "}":
                    return new ClassElementList(list);
        }
    }
}

function validateEarlyError_14_5_1_A(ClassHeritage, ClassBody) {
    var d;
    if (!ClassHeritage) {
        var constructor = ClassBody.ConstructorMethod;
        if (constructor && (d = constructor.HasDirectSuper())) {
            throw new EarlySyntaxError("14.5.1-A", d);
        }
    }
}

function validateEarlyError_14_5_1_B(ClassElementList) {
    var list = ClassElementList.list;
    var occurrence = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i].static) continue;
        if (list[i].PropName() === "constructor") occurrence++;
        if (occurrence > 1) {
            throw new EarlySyntaxError("14.5.1-B", list[i]);
        }
    }
}

function validateEarlyError_14_5_1_CD(MethodDefinition) {
    var d;
    if (MethodDefinition.PropName() !== "constructor") {
        if (d = MethodDefinition.HasDirectSuper()) {
            throw new EarlySyntaxError("14.5.1-C", d);
        }
    } else {
        if (!(MethodDefinition instanceof MethodDefinitionNormal)) {
            throw new EarlySyntaxError("14.5.1-D", MethodDefinition);
        }
    }
}

function validateEarlyError_14_5_1_EF(MethodDefinition) {
    var d;
    if (d = MethodDefinition.HasDirectSuper()) {
        throw new EarlySyntaxError("14.5.1-E", d);
    }
    if (MethodDefinition.PropName() === "prototype") {
        throw new EarlySyntaxError("14.5.1-F", MethodDefinition);
    }
}
