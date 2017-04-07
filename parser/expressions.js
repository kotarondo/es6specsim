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

// 12 ECMAScript Language: Expressions

var lastLeftHandSideExpression$;

// 12.1 Identifiers

function parseIdentifierReference(Yield) {
    var pos = getParsingPosition();
    if (!Yield && peekToken() === "yield") {
        proceedToken("yield");
        var ref = new IdentifierReference("yield").setPosition(pos);
        validateEarlyError_12_1_1_B(ref);
    } else {
        var SV = parseIdentifier();
        var ref = new IdentifierReference(SV).setPosition(pos);
        validateEarlyError_12_1_1_C(ref, Yield);
    }
    ref.strict = isInStrictMode();
    return ref;
}

function parseBindingIdentifier(Yield) {
    var pos = getParsingPosition();
    if (!Yield && peekToken() === "yield") {
        proceedToken("yield");
        var binding = new BindingIdentifier("yield").setPosition(pos);
        validateEarlyError_12_1_1_B(binding);
    } else {
        var SV = parseIdentifier();
        var binding = new BindingIdentifier(SV).setPosition(pos);
        validateEarlyError_12_1_1_A(binding);
        validateEarlyError_12_1_1_C(binding, Yield);
    }
    return binding;
}

function parseLabelIdentifier(Yield) {
    var pos = getParsingPosition();
    if (!Yield && peekToken() === "yield") {
        proceedToken("yield");
        var label = new LabelIdentifier("yield").setPosition(pos);
        validateEarlyError_12_1_1_B(label);
    } else {
        var SV = parseIdentifier();
        var label = new LabelIdentifier(SV).setPosition(pos);
        validateEarlyError_12_1_1_C(label, Yield);
    }
    return label;
}

function parseIdentifier() {
    if (!isTokenIdentifierName(peekToken()) || isReservedWord(peekToken())) {
        throw new EarlySyntaxError();
    }
    var SV = SVofIdentifierName(peekToken());
    validateEarlyError_12_1_1_D(SV);
    validateEarlyError_12_1_1_E(SV);
    proceedToken();
    return SV;
}

function validateEarlyError_12_1_1_A(Identifier) {
    if (isInStrictMode() && (Identifier.SV === "arguments" || Identifier.SV === "eval")) {
        throw new EarlySyntaxError("12.1.1-A", Identifier);
    }
}

function validateEarlyError_12_1_1_B(Identifier) {
    if (isInStrictMode()) {
        throw new EarlySyntaxError("12.1.1-B", Identifier);
    }
}

function validateEarlyError_12_1_1_C(Identifier, Yield) {
    if (Yield && Identifier.SV === "yield") {
        throw new EarlySyntaxError("12.1.1-C", Identifier);
    }
}

function validateEarlyError_12_1_1_D(SV) {
    if (isInStrictMode()) {
        switch (SV) {
            case "implements":
            case "interface":
            case "let":
            case "package":
            case "private":
            case "protected":
            case "public":
            case "static":
            case "yield":
                throw new EarlySyntaxError("12.1.1-D", SV);
        }
    }
}

function validateEarlyError_12_1_1_E(SV) {
    if (isReservedWord(SV) && SV !== "yield") {
        throw new EarlySyntaxError("12.1.1-E", SV);
    }
}

// 12.2 Primary Expression

function parsePrimaryExpression(Yield) {
    var token = peekToken();
    switch (token) {
        case "this":
            proceedToken("this");
            return new ThisExpression();
        case "[":
            return parseArrayLiteral(Yield);
        case "{":
            return parseObjectLiteral(Yield);
        case "function":
            if (nextToken() === "*") {
                return parseGeneratorExpression();
            }
            return parseFunctionExpression();
        case "class":
            return parseClassExpression(Yield);
        case "/":
        case "/=":
            var token = peekTokenAsRegularExpressionLiteral();
            var body = BodyTextOfRegularExpressionLiteral(token);
            var flag = FlagTextOfRegularExpressionLiteral(token);
            validateEarlyError_12_2_8_1_A(body, flag);
            validateEarlyError_12_2_8_1_B(flag);
            proceedToken();
            return new RegularExpressionLiteral(body, flag);
        case "(":
            proceedToken("(");
            var expr = parseExpression("In", Yield);
            proceedToken(")");
            return expr;
        case "null":
            proceedToken("null");
            return new LiteralExpression(null);
        case "true":
            proceedToken("true");
            return new LiteralExpression(true);
        case "false":
            proceedToken("false");
            return new LiteralExpression(false);
    }
    if (isTokenIdentifierName(token)) {
        return parseIdentifierReference(Yield);
    }
    if (isTokenStringLiteral(token)) {
        proceedToken();
        var SV = SVofStringLiteral(token);
        return new LiteralExpression(SV);
    }
    if (isTokenNumericLiteral(token)) {
        proceedToken();
        var MV = MVofNumericLiteral(token);
        return new LiteralExpression(MV);
    }
    if (isTokenTemplate(token)) {
        return parseTemplateLiteral(Yield);
    }
    throw new EarlySyntaxError();
}

function parseArrayLiteral(Yield) {
    proceedToken("[");
    var list = [];
    while (true) {
        list.push(parseElision());
        if (peekToken() === "]") {
            break;
        }
        if (peekToken() === "...") {
            proceedToken("...");
            var expr = parseAssignmentExpression("In", Yield);
            list.push(new SpreadElement(expr));
        } else {
            var expr = parseAssignmentExpression("In", Yield);
            list.push(expr);
        }
        if (peekToken() !== ",") {
            break;
        }
        proceedToken(",");
    }
    proceedToken("]");
    return new ArrayLiteral(list);
}

function parseElision() {
    for (var n = 0; peekToken() === ","; n++) {
        proceedToken(",");
    }
    return new Elision(n);
}

function parseObjectLiteral(Yield) {
    proceedToken("{");
    var list = [];
    while (true) {
        if (peekToken() === "}") break;
        var prop = parsePropertyDefinition(Yield);
        list.push(prop);
        if (peekToken() === "}") break;
        proceedToken(",");
    }
    proceedToken("}");
    return new ObjectLiteral(new PropertyDefinitionList(list));
}

function parsePropertyDefinition(Yield) {
    var pos = getParsingPosition();
    if (isTokenIdentifierName(peekToken())) {
        switch (nextToken()) {
            case ",":
            case "}":
                var ref = parseIdentifierReference(Yield);
                return new PropertyDefinitionByReference(ref);
            case "=":
                parseIdentifierReference(Yield);
                parseInitializer("In", Yield);
                return new CoverInitializedName().setPosition(pos);
        }
    }
    if (peekToken() !== "*") {
        var name = parsePropertyName(Yield);
        if (peekToken() === ":") {
            proceedToken(":");
            var expr = parseAssignmentExpression("In", Yield);
            return new PropertyDefinitionByName(name, expr);
        }
    }
    setParsingPosition(pos);
    var def = parseMethodDefinition(Yield);
    validateEarlyError_12_2_6_1_A(def);
    return new PropertyDefinitionByMethod(def);
}

function parsePropertyName(Yield) {
    if (peekToken() === "[") {
        return parseComputedPropertyName(Yield);
    }
    return parseLiteralPropertyName();
}

function parseLiteralPropertyName() {
    var token = peekToken();
    if (isTokenIdentifierName(token)) {
        var SV = SVofIdentifierName(token);
    } else if (isTokenStringLiteral(token)) {
        var SV = SVofStringLiteral(token);
    } else if (isTokenNumericLiteral(token)) {
        var SV = ToString(MVofNumericLiteral(token));
    } else {
        throw new EarlySyntaxError();
    }
    proceedToken();
    return new LiteralPropertyName(SV);
}

function parseComputedPropertyName(Yield) {
    proceedToken("[");
    var expr = parseAssignmentExpression("In", Yield);
    proceedToken("]");
    return new ComputedPropertyName(expr);
}

function parseInitializer(In, Yield) {
    proceedToken("=");
    return parseAssignmentExpression(In, Yield);
}

function parseTemplateLiteral(Yield) {
    var list = [];
    var token = peekToken();
    proceedToken();
    list.push(new TemplateToken(token));
    if (isTokenTemplateHead(token)) {
        while (true) {
            list.push(parseExpression("In", Yield));
            var token = peekTokenAsTemplateMiddleOrTail();
            proceedToken();
            list.push(new TemplateToken(token));
            if (isTokenTemplateTail(token)) {
                break;
            }
        }
    }
    return new TemplateLiteral(list);
}

function validateEarlyError_12_2_6_1_A(MethodDefinition) {
    var d;
    if (d = MethodDefinition.HasDirectSuper()) {
        throw new EarlySyntaxError("12.2.6.1-A", d);
    }
}

function validateEarlyError_12_2_6_1_B(Production) {
    var d;
    if (d = Production.Contains("CoverInitializedName")) {
        throw new EarlySyntaxError("12.2.6.1-B", d);
    }
}

function validateEarlyError_12_2_8_1_A(BodyText, FlagText) {
    var saved = saveSourceTextContext();
    try {
        //TODO clarify regular expression literal's early sytax error rule
        //(1) u flag is involved?
        //(2) BMP conversion is needed?
        setSourceText(BodyText);
        if (FlagText.search("u") >= 0) {
            parsePattern("U");
        } else {
            sourceBMP$ = true;
            parsePattern();
        }
    } catch (e) {
        //console.log(e.stack);
        throw new EarlySyntaxError("12.2.8.1-A");
    }
    restoreSourceTextContext(saved);
}

function validateEarlyError_12_2_8_1_B(FlagText) {
    if (FlagText.search(/[^gimuy]/) >= 0) {
        throw new EarlySyntaxError("12.2.8.1-B");
    }
    for (var i = 0; i < 5; i++) {
        var f = "gimuy" [i];
        if (FlagText.indexOf(f) !== FlagText.lastIndexOf(f)) {
            throw new EarlySyntaxError("12.2.8.1-B");
        }
    }
}

// 12.3 Left-Hand-Side Expressions

function parseLeftHandSideExpression(Yield) {
    for (var newOperators = 0; peekToken() === "new"; newOperators++) {
        var pos = getParsingPosition();
        proceedToken("new");
    }
    if (newOperators > 0 && peekToken() === "." && nextToken() === "target") {
        newOperators--;
        proceedToken(".");
        proceedToken("target");
        var expr = new NewTarget().setPosition(pos);
    } else if (peekToken() === "super") {
        var pos = getParsingPosition();
        switch (nextToken()) {
            case "[":
                proceedToken("super");
                proceedToken("[");
                var index = parseExpression("In", Yield);
                proceedToken("]");
                var expr = new SuperPropertyByIndex(index).setPosition(pos);
                break;
            case ".":
                proceedToken("super");
                proceedToken(".");
                if (!isTokenIdentifierName(peekToken())) {
                    throw new EarlySyntaxError();
                }
                var SV = SVofIdentifierName(peekToken());
                proceedToken();
                var expr = new SuperPropertyByName(SV).setPosition(pos);
                break;
            case "(":
                proceedToken("super");
                var args = parseArguments(Yield);
                var expr = new SuperCall(args).setPosition(pos);
                break;
            default:
                throw new EarlySyntaxError();
        }
    }
    if (!expr) {
        var expr = parsePrimaryExpression(Yield);
    }
    return parseLeftHandSideExpressionChain(Yield, newOperators, expr);
}

function parseLeftHandSideExpressionChain(Yield, newOperators, expr) {
    while (true) {
        switch (peekToken()) {
            case "[":
                proceedToken("[");
                var index = parseExpression("In", Yield);
                proceedToken("]");
                var expr = new PropertyAccessorByIndex(expr, index);
                continue;
            case ".":
                proceedToken(".");
                if (!isTokenIdentifierName(peekToken())) {
                    throw new EarlySyntaxError();
                }
                var SV = SVofIdentifierName(peekToken());
                proceedToken();
                var expr = new PropertyAccessorByName(expr, SV);
                continue;
            case "(":
                var args = parseArguments(Yield);
                if (newOperators > 0) {
                    newOperators--;
                    var expr = new NewOperator(expr, args);
                } else {
                    var expr = new FunctionCall(expr, args);
                }
                continue;
        }
        if (isTokenTemplate(peekToken())) {
            var tmpl = parseTemplateLiteral(Yield);
            var expr = new TaggedTemplate(expr, tmpl);
            continue;
        }
        break;
    }
    while (newOperators--) {
        var expr = new NewOperator(expr);
    }
    lastLeftHandSideExpression$ = expr;
    return expr;
}

function parseArguments(Yield) {
    proceedToken("(");
    var list = [];
    if (peekToken() !== ")") {
        while (true) {
            if (peekToken() === "...") {
                proceedToken("...");
                var expr = parseAssignmentExpression("In", Yield);
                var expr = new SpreadArgument(expr);
            } else {
                var expr = parseAssignmentExpression("In", Yield);
            }
            list.push(expr);
            if (peekToken() !== ",") break;
            proceedToken(",");
        }
    }
    proceedToken(")");
    return new Arguments(list);
}

// 12.4 Postfix Expressions

function parsePostfixExpression(Yield) {
    var expr = parseLeftHandSideExpression(Yield);
    return parsePostfixExpressionChain(Yield, expr);
}

function parsePostfixExpressionChain(Yield, expr) {
    var operator = peekToken();
    switch (operator) {
        case "++":
        case "--":
            if (!peekTokenIsLineSeparated()) {
                proceedToken(operator);
                validateEarlyError_12_4_1(expr);
                return new PostfixOperator(expr, operator);
            }
    }
    return expr;
}

function validateEarlyError_12_4_1(LeftHandSideExpression) {
    if (!LeftHandSideExpression.IsValidSimpleAssignmentTarget()) {
        throw new EarlyReferenceError("12.4.1");
    }
}

// 12.5 Unary Operators

function parseUnaryExpression(Yield) {
    var operator = peekToken();
    switch (operator) {
        case "delete":
        case "void":
        case "typeof":
        case "++":
        case "--":
        case "+":
        case "-":
        case "~":
        case "!":
            proceedToken(operator);
            var expr = parseUnaryExpression(Yield);
            if (operator === "++" || operator === "--") validateEarlyError_12_5_1(expr);
            if (operator === "delete") validateEarlyError_12_5_4_1(expr);
            return new UnaryOperator(operator, expr);
        default:
            return parsePostfixExpression(Yield);
    }
}

function validateEarlyError_12_5_1(UnaryExpression) {
    if (!UnaryExpression.IsValidSimpleAssignmentTarget()) {
        throw new EarlyReferenceError("12.5.1");
    }
}

function validateEarlyError_12_5_4_1(UnaryExpression) {
    if (isInStrictMode() && UnaryExpression instanceof IdentifierReference) {
        throw new EarlySyntaxError("12.5.4.1");
    }
}

// 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13

function operatorPriority(operator) {
    switch (operator) {
        case "*":
        case "/":
        case "%":
            return 11;
        case "+":
        case "-":
            return 10;
        case "<<":
        case ">>":
        case ">>>":
            return 9;
        case "<":
        case ">":
        case "<=":
        case ">=":
        case "instanceof":
        case "in":
            return 8;
        case "==":
        case "!=":
        case "===":
        case "!==":
            return 7;
        case "&":
            return 6;
        case "^":
            return 5;
        case "|":
            return 4;
        case "&&":
            return 3;
        case "||":
            return 2;
        case "?":
            return 1;
    }
    return 0;
}

function parseExpressionChain(In, Yield, priority, expr) {
    while (true) {
        var operator = peekToken();
        var prio = operatorPriority(operator);
        if (priority >= prio) {
            break;
        }
        if (operator === "in") {
            if (!In) break;
        }
        proceedToken(operator);
        if (operator === "?") {
            var expr2 = parseAssignmentExpression("In", Yield);
            proceedToken(":");
            var expr3 = parseAssignmentExpression(In, Yield);
            return new ConditionalOperator(expr, expr2, expr3);
        }
        var expr2 = parseUnaryExpression(Yield);
        var expr2 = parseExpressionChain(In, Yield, prio, expr2);
        var expr = new BinaryOperator(expr, operator, expr2);
    }
    return expr;
}

// 12.14 Assignment Operators

function parseAssignmentExpression(In, Yield) {
    var pos = getParsingPosition();
    var firstToken = peekToken();
    if (Yield && firstToken === "yield") {
        return parseYieldExpression(In);
    }
    if (isTokenIdentifierName(firstToken) && nextToken() === "=>") {
        return parseArrowFunction(In, Yield);
    }
    if (firstToken === "(") {
        proceedToken("(");
        switch (peekToken()) {
            case ")":
                break;
            case "...":
                proceedToken("...");
                parseBindingIdentifier(Yield);
                break;
            default:
                var expr = parseAssignmentExpression("In", Yield);
                while (peekToken() === ",") {
                    proceedToken(",");
                    if (peekToken() === "...") {
                        proceedToken("...");
                        parseBindingIdentifier(Yield);
                        var expr = void 0;
                        break;
                    }
                    var expr2 = parseAssignmentExpression("In", Yield);
                    var expr = new CommaOperator(expr, expr2);
                }
                break;
        }
        proceedToken(")");
        if (peekToken() === "=>") {
            setParsingPosition(pos);
            return parseArrowFunction(In, Yield);
        }
        if (!expr) {
            setParsingPosition(pos);
            return parsePrimaryExpression(Yield); // always throws EarlyError
        }
        expr = parseLeftHandSideExpressionChain(Yield, 0, expr);
        expr = parsePostfixExpressionChain(Yield, expr);
    } else {
        var expr = parseUnaryExpression(Yield);
    }
    var expr = parseExpressionChain(In, Yield, 0, expr);
    var operator = peekToken();
    switch (operator) {
        case "=":
        case "*=":
        case "/=":
        case "%=":
        case "+=":
        case "-=":
        case "<<=":
        case ">>=":
        case ">>>=":
        case "&=":
        case "|=":
        case "^=":
            if (lastLeftHandSideExpression$ !== expr) {
                throw new EarlySyntaxError();
            }
            if (operator === "=" && (firstToken === '[' && expr instanceof ArrayLiteral || firstToken === '{' && expr instanceof ObjectLiteral)) {
                setParsingPosition(pos);
                var expr = parseAssignmentPattern(Yield);
            } else {
                validateEarlyError_12_14_1(expr);
            }
            proceedToken(operator);
            var expr2 = parseAssignmentExpression(In, Yield);
            return new AssignmentOperator(expr, operator, expr2);
    }
    return expr;
}

function validateEarlyError_12_14_1(LeftHandSideExpression) {
    if (!LeftHandSideExpression.IsValidSimpleAssignmentTarget()) {
        throw new EarlyReferenceError("12.14.1");
    }
}

// 12.14.5 Destructuring Assignment

function parseAssignmentPattern(Yield) {
    if (peekToken() === "{") {
        return parseObjectAssignmentPattern(Yield);
    }
    return parseArrayAssignmentPattern(Yield);
}

function parseObjectAssignmentPattern(Yield) {
    proceedToken("{");
    var list = [];
    while (true) {
        if (peekToken() === "}") break;
        var prop = parseAssignmentProperty(Yield);
        list.push(prop);
        if (peekToken() === "}") break;
        proceedToken(",");
    }
    proceedToken("}");
    return new ObjectAssignmentPattern(list);
}

function parseArrayAssignmentPattern(Yield) {
    proceedToken("[");
    var list = [];
    while (true) {
        list.push(parseElision());
        if (peekToken() === "]") {
            break;
        } else if (peekToken() === "...") {
            var rest = parseAssignmentRestElement(Yield);
            list.push(rest);
            break;
        }
        var elem = parseAssignmentElement(Yield);
        list.push(elem);
        if (peekToken() !== ",") {
            break;
        }
        proceedToken(",");
    }
    proceedToken("]");
    return new ArrayAssignmentPattern(list);
}

function parseAssignmentProperty(Yield) {
    if (isTokenIdentifierName(peekToken()) && nextToken() !== ":") {
        var ref = parseIdentifierReference(Yield);
        validateEarlyError_12_14_5_1_A(ref);
        if (peekToken() === "=") {
            var init = parseInitializer("In", Yield);
        }
        return new AssignmentPropertyByIdentifier(ref, init);
    }
    var name = parsePropertyName(Yield);
    proceedToken(":");
    var elem = parseAssignmentElement(Yield);
    return new AssignmentPropertyByName(name, elem);
}

function parseAssignmentElement(Yield) {
    var target = parseDestructuringAssignmentTarget(Yield);
    if (peekToken() === "=") {
        var init = parseInitializer("In", Yield);
    }
    return new AssignmentElement(target, init);
}

function parseAssignmentRestElement(Yield) {
    proceedToken("...");
    var target = parseDestructuringAssignmentTarget(Yield);
    return new AssignmentRestElement(target);
}

function parseDestructuringAssignmentTarget(Yield) {
    var pos = getParsingPosition();
    var firstToken = peekToken();
    var expr = parseLeftHandSideExpression(Yield);
    if (firstToken === '[' && expr instanceof ArrayLiteral || firstToken === '{' && expr instanceof ObjectLiteral) {
        setParsingPosition(pos);
        var expr = parseAssignmentPattern(Yield);
    } else {
        validateEarlyError_12_14_5_1_C(expr);
    }
    return expr;
}

function validateEarlyError_12_14_5_1_A(IdentifierReference) {
    if (!IdentifierReference.IsValidSimpleAssignmentTarget()) {
        throw new EarlySyntaxError("12.14.5.1-A");
    }
}

function validateEarlyError_12_14_5_1_C(LeftHandSideExpression) {
    if (!LeftHandSideExpression.IsValidSimpleAssignmentTarget()) {
        throw new EarlySyntaxError("12.14.5.1-C");
    }
}

// 12.15 Comma Operator ( , )

function parseExpression(In, Yield) {
    var expr = parseAssignmentExpression(In, Yield);
    while (peekToken() === ",") {
        proceedToken(",");
        var expr2 = parseAssignmentExpression(In, Yield);
        var expr = new CommaOperator(expr, expr2);
    }
    return expr;
}
