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

// 11 ECMAScript Language: Lexical Grammar

var AnnexB_1_1$ = true;
var AnnexB_1_2$ = true;
var AnnexB_1_3$ = true;

var peekTokenIsLineSeparated$;
var peekTokenPos$;
var peekToken$;
var nextTokenIsLineSeparated$;
var nextTokenPos$;
var nextToken$;

// 11.2 White Space

function isWhiteSpace(c) {
    switch (c) {
        case "\u0009": // <TAB>
        case "\u000B": // <VT>
        case "\u000C": // <FF>
        case "\u0020": // <SP>
        case "\u00A0": // <NBSP>
        case "\uFEFF": // <ZWNBSP>
            return true;
    }
    return isUnicodeZs(c);
}

// 11.3 Line Terminators

function isLineTerminator(c) {
    switch (c) {
        case "\u000A": // <LF>
        case "\u000D": // <CR>
        case "\u2028": // <LS>
        case "\u2029": // <PS>
            return true;
    }
    return false;
}

// 11.4 Comments

function skipMultiLineComment() {
    proceedChar("/");
    proceedChar("*");
    while (true) {
        var c = peekChar();
        if (c === "") {
            throw new EarlySyntaxError();
        }
        if (c === "*" && nextChar() === "/") {
            proceedChar("*");
            proceedChar("/");
            break;
        }
        if (isLineTerminator(c)) {
            var isLineSeparated = true;
        }
        proceedChar(c);
    }
    return isLineSeparated;
}

function skipSingleLineComment() {
    proceedChar("/");
    proceedChar("/");
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            break;
        }
        proceedChar(c);
    }
}

function skipSingleLineHTMLOpenComment() {
    proceedChar("<");
    proceedChar("!");
    proceedChar("-");
    proceedChar("-");
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            break;
        }
        proceedChar(c);
    }
}

function skipSingleLineHTMLCloseComment() {
    proceedChar("-");
    proceedChar("-");
    proceedChar(">");
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            break;
        }
        proceedChar(c);
    }
}

function skipSeparators() {
    while (true) {
        var c = peekChar();
        if (c === "") {
            var isLineSeparated = true;
            break;
        }
        if (isWhiteSpace(c)) {
            proceedChar(c);
            continue;
        }
        if (isLineTerminator(c)) {
            var isLineSeparated = true;
            proceedChar(c);
            continue;
        }
        if (c === "/" && nextChar() === "*") {
            if (skipMultiLineComment()) {
                var isLineSeparated = true;
            }
            continue;
        }
        if (c === "/" && nextChar() === "/") {
            skipSingleLineComment();
            continue;
        }
        if (AnnexB_1_3$ && !isInModule()) {
            if (c === "<" && nextChar() === "!" && nextChar(2) === "-" && nextChar(3) === "-") {
                skipSingleLineHTMLOpenComment();
                continue;
            }
            if (isLineSeparated && c === "-" && nextChar() === "-" && nextChar(2) === ">") {
                skipSingleLineHTMLCloseComment();
                continue;
            }
        }
        break;
    }
    return isLineSeparated;
}

// 11.5 Tokens

function peekToken() {
    return peekToken$;
}

function nextToken() {
    if (nextToken$ === void 0) {
        earlyErrorPos$ = void 0;
        nextTokenIsLineSeparated$ = skipSeparators();
        nextTokenPos$ = getCharPos();
        nextToken$ = readCommonToken();
        earlyErrorPos$ = peekTokenPos$;
    }
    return nextToken$;
}

function peekTokenIsLineSeparated() {
    return peekTokenIsLineSeparated$;
}

function proceedToken(exp) {
    if (exp && exp !== peekToken$) {
        throw new EarlySyntaxError();
    }
    nextToken();
    peekTokenIsLineSeparated$ = nextTokenIsLineSeparated$;
    peekTokenPos$ = nextTokenPos$;
    peekToken$ = nextToken$;
    nextToken$ = void 0;
    earlyErrorPos$ = peekTokenPos$;
}

function getParsingPosition() {
    return peekTokenPos$;
}

function setParsingPosition(pos, isLineSeparated) {
    earlyErrorPos$ = void 0;
    if (pos === peekTokenPos$) return;
    setCharPos(pos);
    peekTokenIsLineSeparated$ = skipSeparators() || isLineSeparated;
    peekTokenPos$ = getCharPos();
    peekToken$ = readCommonToken();
    nextToken$ = void 0;
    earlyErrorPos$ = peekTokenPos$;
}

function setParsingText(text) {
    setSourceText(text);
    peekTokenPos$ = void 0;
    setParsingPosition(0);
    inIterationStatement$ = 0;
    inSwitchStatement$ = 0;
}

function readCommonToken() {
    if (peekChar() === "") {
        return "";
    }
    var start = getCharPos();
    if (!skipIfIdentifierName() && !skipIfPunctuator() && !skipIfNumericLiteral() && !skipIfStringLiteral() && !skipIfTemplate()) {
        console.log(sourceText$);
        console.log(readCharPos$);
        throw new EarlySyntaxError();
    }
    var end = getCharPos();
    return sourceText$.substring(start, end);
}

function isTokenIdentifierName(token) {
    return isUnicodeID_Start(token[0]) || token[0] === "$" || token[0] === "_" || token[0] === "\\";
}

function isTokenStringLiteral(token) {
    return token[0] === '"' || token[0] === "'";
}

function isTokenNumericLiteral(token) {
    return isDecimalDigit(token[0]) || token[0] === "." && isDecimalDigit(token[1]);
}

function isTokenTemplate(token) {
    return token[0] === "`";
}

function isTokenTemplateHead(token) {
    return token[0] === "`" && token[token.length - 1] === "{";
}

function isTokenTemplateMiddle(token) {
    return token[0] === "}" && token[token.length - 1] === "{";
}

function isTokenTemplateTail(token) {
    return token[0] === "}" && token[token.length - 1] === "`";
}

// 11.6 Names and Keywords

function skipIfIdentifierName() {
    if (!skipIfIdentifierStart()) return false;
    while (skipIfIdentifierPart());
    return true;
}

function skipIfIdentifierStart() {
    var c = peekChar();
    if (isUnicodeID_Start(c)) {
        proceedChar(c);
        return true;
    }
    switch (c) {
        case "$":
        case "_":
            proceedChar(c);
            return true;
        case "\\":
            proceedChar(c);
            var SV = readUnicodeEscapeSequence();
            validateEarlyError_11_6_1_1_A(SV);
            return true;
    }
    return false;
}

function skipIfIdentifierPart() {
    var c = peekChar();
    if (isUnicodeID_Continue(c)) {
        proceedChar(c);
        return true;
    }
    switch (c) {
        case "$":
        case "_":
        case "\u200C": // <ZWNJ>
        case "\u200D": // <ZWJ>
            proceedChar(c);
            return true;
        case "\\":
            proceedChar(c);
            var SV = readUnicodeEscapeSequence();
            validateEarlyError_11_6_1_1_B(SV);
            return true;
    }
    return false;
}

function validateEarlyError_11_6_1_1_A(SV) {
    if (!isUnicodeID_Start(SV)) {
        switch (SV) {
            case "$":
            case "_":
                return;
        }
        throw new EarlySyntaxError("11.6.1.1-A");
    }
}

function validateEarlyError_11_6_1_1_B(SV) {
    if (!isUnicodeID_Continue(SV)) {
        switch (SV) {
            case "$":
            case "_":
            case "\u200C": // <ZWNJ>
            case "\u200D": // <ZWJ>
                return;
        }
        throw new EarlySyntaxError("11.6.1.1-B");
    }
}

function SVofIdentifierName(token) {
    if (token.indexOf("\\") < 0) {
        return token;
    }
    var saved = saveSourceTextContext();
    setSourceText(token);
    var buffer = [];
    while (true) {
        var c = peekChar();
        if (c === "") {
            break;
        }
        proceedChar(c);
        if (c === "\\") {
            c = readUnicodeEscapeSequence();
        }
        buffer.push(c);
    }
    restoreSourceTextContext(saved);
    return buffer.join("");
}

function isReservedWord(SV) {
    switch (SV) {
        case "break":
        case "case":
        case "catch":
        case "class":
        case "const":
        case "continue":
        case "debugger":
        case "default":
        case "delete":
        case "do":
        case "else":
        case "export":
        case "extends":
        case "finally":
        case "for":
        case "function":
        case "if":
        case "import":
        case "in":
        case "instanceof":
        case "new":
        case "return":
        case "super":
        case "switch":
        case "this":
        case "throw":
        case "try":
        case "typeof":
        case "var":
        case "void":
        case "while":
        case "with":
        case "yield":
        case "enum":
        case "null":
        case "true":
        case "false":
            return true;
        case "await":
            if (isInModule()) {
                return true;
            }
            break;
        case "implements":
        case "interface":
        case "package":
        case "private":
        case "protected":
        case "public":
            if (isInStrictMode()) {
                return true;
            }
            break;
    }
    return false;
}

// 11.7 Punctuators 

function skipIfPunctuator() {
    var c = peekChar();
    switch (c) {
        case "{":
        case "}":
        case "(":
        case ")":
        case "[":
        case "]":
        case ";":
        case ",":
        case "~":
        case "?":
        case ":":
            proceedChar(c);
            return true;
        case ".":
            if (isDecimalDigit(nextChar())) {
                return false;
            }
            proceedChar(".");
            if (peekChar() === "." && nextChar() === ".") {
                proceedChar(".");
                proceedChar(".");
            }
            return true;
        case "<":
            proceedChar("<");
            peekChar() === "<" && proceedChar("<");
            peekChar() === "=" && proceedChar("=");
            return true;
        case ">":
            proceedChar(">");
            peekChar() === ">" && proceedChar(">");
            peekChar() === ">" && proceedChar(">");
            peekChar() === "=" && proceedChar("=");
            return true;
        case "=":
            proceedChar("=");
            if (peekChar() === ">") {
                proceedChar(">");
                return true;
            }
            peekChar() === "=" && proceedChar("=");
            peekChar() === "=" && proceedChar("=");
            return true;
        case "!":
            proceedChar("!");
            peekChar() === "=" && proceedChar("=");
            peekChar() === "=" && proceedChar("=");
            return true;
        case "+":
        case "-":
        case "&":
        case "|":
            proceedChar(c);
            if (peekChar() === c) {
                proceedChar(c);
                return true;
            }
            peekChar() === "=" && proceedChar("=");
            return true;
        case "*":
        case "%":
        case "^":
        case "/":
            proceedChar(c);
            peekChar() === "=" && proceedChar("=");
            return true;
    }
    return false;
}

// 11.8.3 Numeric Literals

function skipNumericLiteral() {
    if (peekChar() === "0") {
        proceedChar("0");
        switch (peekChar()) {
            case "b":
            case "B":
                proceedChar();
                if (!isBinaryDigit(peekChar())) {
                    throw new EarlySyntaxError();
                }
                while (isBinaryDigit(peekChar())) {
                    proceedChar();
                }
                return;
            case "o":
            case "O":
                proceedChar();
                if (!isOctalDigit(peekChar())) {
                    throw new EarlySyntaxError();
                }
                while (isOctalDigit(peekChar())) {
                    proceedChar();
                }
                return;
            case "x":
            case "X":
                proceedChar();
                if (!isHexDigit(peekChar())) {
                    throw new EarlySyntaxError();
                }
                while (isHexDigit(peekChar())) {
                    proceedChar();
                }
                return;
        }
        if (isDecimalDigit(peekChar())) {
            if (isInStrictMode()) {
                throw new EarlySyntaxError();
            }
            if (!AnnexB_1_1$) {
                throw new EarlySyntaxError();
            }
            while (isOctalDigit(peekChar())) {
                proceedChar();
            }
            if (!isDecimalDigit(peekChar())) {
                return;
            }
        }
    }
    while (isDecimalDigit(peekChar())) {
        proceedChar();
    }
    if (peekChar() === ".") {
        proceedChar();
        while (isDecimalDigit(peekChar())) {
            proceedChar();
        }
    }
    if (peekChar() === "e" || peekChar() === "E") {
        proceedChar();
        if (peekChar() === "+" || peekChar() === "-") {
            proceedChar();
        }
        if (!isDecimalDigit(peekChar())) {
            throw new EarlySyntaxError();
        }
        while (isDecimalDigit(peekChar())) {
            proceedChar();
        }
    }
}

function skipIfNumericLiteral() {
    if (isDecimalDigit(peekChar()) || peekChar() === "." && isDecimalDigit(nextChar())) {
        skipNumericLiteral();
        var c = peekChar();
        if (isUnicodeID_Start(c) || isDecimalDigit(c) || c === "$" || c === "_" || c === "\\") {
            throw new EarlySyntaxError();
        }
        return true;
    }
    return false;
}

function isDecimalDigit(c) {
    switch (c) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            return true;
    }
    return false;
}

function isBinaryDigit(c) {
    switch (c) {
        case "0":
        case "1":
            return true;
    }
    return false;
}

function isOctalDigit(c) {
    switch (c) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
            return true;
    }
    return false;
}

function isHexDigit(c) {
    switch (c) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "a":
        case "b":
        case "c":
        case "d":
        case "e":
        case "f":
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
            return true;
    }
    return false;
}

function MVofDigit(c) {
    switch (c) {
        case "0":
            return 0;
        case "1":
            return 1;
        case "2":
            return 2;
        case "3":
            return 3;
        case "4":
            return 4;
        case "5":
            return 5;
        case "6":
            return 6;
        case "7":
            return 7;
        case "8":
            return 8;
        case "9":
            return 9;
        case "a":
            return 10;
        case "b":
            return 11;
        case "c":
            return 12;
        case "d":
            return 13;
        case "e":
            return 14;
        case "f":
            return 15;
        case "A":
            return 10;
        case "B":
            return 11;
        case "C":
            return 12;
        case "D":
            return 13;
        case "E":
            return 14;
        case "F":
            return 15;
    }
}

function MVofNumericLiteral(token) {
    if (token[0] !== "0") {
        return Number(token);
    }
    switch (token[1]) {
        case ".":
        case "e":
        case "E":
        case void 0:
            return Number(token);
        case "b":
        case "B":
            var i = 2;
            var d = 2;
            break;
        case "o":
        case "O":
            var i = 2;
            var d = 8;
            break;
        case "x":
        case "X":
            var i = 2;
            var d = 16;
            break;
        default:
            if (token.search(/[89]/) >= 0) {
                for (var i = 0; token[i] === "0"; i++);
                return Number(token.substring(i));
            }
            var i = 1;
            var d = 8;
            break;
    }
    var v = 0;
    while (true) {
        var c = token[i++];
        if (c === void 0) {
            break;
        }
        v = v * d + MVofDigit(c);
    }
    return v;
}

// 11.8.4 String Literals

function skipIfStringLiteral() {
    var t = peekChar();
    if (t !== "'" && t !== '"') return false;
    proceedChar(t);
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            throw new EarlySyntaxError();
        }
        if (c === t) {
            break;
        }
        if (c === "\\") {
            if (isLineTerminator(nextChar())) {
                skipLineContinuation();
                continue;
            }
            proceedChar("\\");
            skipEscapeSequence(AnnexB_1_2$ && !isInStrictMode());
            continue;
        }
        proceedChar(c);
    }
    proceedChar(t);
    return true;
}

function skipLineContinuation() {
    proceedChar("\\");
    var c = peekChar();
    Assert(isLineTerminator(c));
    proceedChar();
    if (c === "\r" && peekChar() === "\n") {
        proceedChar("\n");
    }
}

function SVofStringLiteral(token) {
    if (token.indexOf("\\") < 0) {
        return token.substring(1, token.length - 1);
    }
    var saved = saveSourceTextContext();
    setSourceText(token);
    var buffer = [];
    var t = peekChar();
    proceedChar();
    while (true) {
        var start = getCharPos();
        while (true) {
            var c = peekChar();
            if (c === t || c === "\\") {
                break;
            }
            proceedChar(c);
        }
        var end = getCharPos();
        if (start < end) {
            buffer.push(token.substring(start, end));
        }
        if (c === t) {
            break;
        }
        if (c === "\\") {
            if (isLineTerminator(nextChar())) {
                skipLineContinuation();
                continue;
            }
            proceedChar("\\");
            var c = readEscapeSequence();
        }
        buffer.push(c);
    }
    restoreSourceTextContext(saved);
    return buffer.join("");
}

function skipEscapeSequence(extension) {
    var c = peekChar();
    if (isDecimalDigit(c)) {
        if (c === "0" && !isDecimalDigit(nextChar())) {
            proceedChar("0");
            return;
        }
        if (!extension) {
            throw new EarlySyntaxError();
        }
    }
    readEscapeSequence();
}

function readEscapeSequence() {
    var c = peekChar();
    if (c === "") {
        throw new EarlySyntaxError();
    }
    if (isDecimalDigit(c)) {
        return readLegacyOctalEscapeSequence();
    }
    switch (c) {
        case "b":
            proceedChar();
            return "\b";
        case "f":
            proceedChar();
            return "\f";
        case "n":
            proceedChar();
            return "\n";
        case "r":
            proceedChar();
            return "\r";
        case "t":
            proceedChar();
            return "\t";
        case "v":
            proceedChar();
            return "\v";
        case "x":
            return readHexEscapeSequence();
        case "u":
            return readUnicodeEscapeSequence();
    }
    proceedChar();
    return c;
}

function readHexEscapeSequence() {
    proceedChar("x");
    var code = 0;
    for (var i = 0; i < 2; i++) {
        var c = peekChar();
        if (!isHexDigit(c)) {
            throw new EarlySyntaxError();
        }
        proceedChar(c);
        code = code * 16 + MVofDigit(c);
    }
    return fromCodePoint(code);
}

function readUnicodeEscapeSequence() {
    proceedChar("u");
    if (peekChar() === "{") {
        proceedChar("{");
        if (!isHexDigit(peekChar())) {
            throw new EarlySyntaxError();
        }
        var code = 0;
        while (true) {
            var c = peekChar();
            if (!isHexDigit(c)) {
                break;
            }
            proceedChar(c);
            code = code * 16 + MVofDigit(c);
            validateEarlyError_11_8_4_1(code);
        }
        proceedChar("}");
        return fromCodePoint(code);
    }
    return fromCodePoint(readHex4Digits());
}

function readDecimalDigits() {
    if (!isDecimalDigit(peekChar())) {
        throw new EarlySyntaxError();
    }
    var x = 0;
    while (true) {
        var c = peekChar();
        if (!isDecimalDigit(c)) {
            break;
        }
        proceedChar(c);
        x = x * 10 + MVofDigit(c);
    }
    return x;
}

function readHex4Digits() {
    var code = 0;
    for (var i = 0; i < 4; i++) {
        var c = peekChar();
        if (!isHexDigit(c)) {
            throw new EarlySyntaxError();
        }
        proceedChar(c);
        code = code * 16 + MVofDigit(c);
    }
    return code;
}

function readLegacyOctalEscapeSequence() {
    var c1 = peekChar();
    if (!isOctalDigit(c1)) {
        throw new EarlySyntaxError();
    }
    proceedChar(c1);
    var code = MVofDigit(c1);
    var c2 = peekChar();
    if (isOctalDigit(c2)) {
        proceedChar(c2);
        code = code * 8 + MVofDigit(c2);
        if (c1 === "0" || c1 === "1" || c1 === "2" || c1 === "3") {
            var c3 = peekChar();
            if (isOctalDigit(c3)) {
                proceedChar(c3);
                code = code * 8 + MVofDigit(c3);
            }
        }
    }
    return fromCodePoint(code);
}

function validateEarlyError_11_8_4_1(code) {
    if (code > 1114111) {
        throw new EarlySyntaxError("11.8.4.1");
    }
}

// 11.8.5 Regular Expression Literals

function peekTokenAsRegularExpressionLiteral() {
    earlyErrorPos$ = void 0;
    nextToken$ = void 0;
    setCharPos(peekTokenPos$);
    var start = getCharPos();
    proceedChar("/");
    skipRegularExpressionBody();
    proceedChar("/");
    skipRegularExpressionFlags();
    var end = getCharPos();
    earlyErrorPos$ = peekTokenPos$;
    return sourceText$.substring(start, end);
}

function skipRegularExpressionBody() {
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            throw new EarlySyntaxError();
        }
        if (c === "/") {
            break;
        }
        if (c === "\\") {
            skipRegularExpressionBackslashSequence();
            continue;
        }
        if (c === "[") {
            skipRegularExpressionClass();
            continue;
        }
        proceedChar(c);
    }
}

function skipRegularExpressionBackslashSequence() {
    proceedChar("\\");
    var c = peekChar();
    if (c === "" || isLineTerminator(c)) {
        throw new EarlySyntaxError();
    }
    proceedChar(c);
}

function skipRegularExpressionClass() {
    proceedChar("[");
    while (true) {
        var c = peekChar();
        if (c === "" || isLineTerminator(c)) {
            throw new EarlySyntaxError();
        }
        if (c === "]") {
            break;
        }
        if (c === "\\") {
            skipRegularExpressionBackslashSequence();
            continue;
        }
        proceedChar(c);
    }
    proceedChar("]");
}

function skipRegularExpressionFlags() {
    while (true) {
        var c = peekChar();
        if (!skipIfIdentifierPart()) return;
        validateEarlyError_11_8_5_1(c);
    }
}

function validateEarlyError_11_8_5_1(c) {
    if (c === "\\") {
        throw new EarlySyntaxError("11.8.5.1");
    }
}

function BodyTextOfRegularExpressionLiteral(token) {
    return token.substring(1, token.lastIndexOf("/"));
}

function FlagTextOfRegularExpressionLiteral(token) {
    return token.substring(token.lastIndexOf("/") + 1);
}

// 11.8.6 Template Literal Lexical Components

function skipIfTemplate() {
    if (peekChar() !== "`") return false;
    proceedChar("`");
    skipTemplateCharacters();
    if (peekChar() === "`") {
        proceedChar("`");
    } else {
        proceedChar("$");
        proceedChar("{");
    }
    return true;
}

function skipTemplateCharacters() {
    while (true) {
        var c = peekChar();
        if (c === "") {
            throw new EarlySyntaxError();
        }
        switch (c) {
            case "$":
                if (nextChar() === "{") return;
                break;
            case "\\":
                if (isLineTerminator(nextChar())) {
                    skipLineContinuation();
                    continue;
                }
                proceedChar("\\");
                skipEscapeSequence(false);
                continue;
            case "`":
                return;
        }
        proceedChar(c);
    }
}

function peekTokenAsTemplateMiddleOrTail() {
    earlyErrorPos$ = void 0;
    nextToken$ = void 0;
    setCharPos(peekTokenPos$);
    var start = getCharPos();
    proceedChar("}");
    skipTemplateCharacters();
    if (peekChar() === "`") {
        proceedChar("`");
    } else {
        proceedChar("$");
        proceedChar("{");
    }
    var end = getCharPos();
    earlyErrorPos$ = peekTokenPos$;
    return sourceText$.substring(start, end);
}

function TVofTemplateToken(token) {
    //TODO TV
}

function TRVofTemplateToken(token) {
    //TODO TRV
}

// 11.9 Automatic Semicolon Insertion

function proceedAutoSemicolon() {
    if (peekToken$ === ";") {
        proceedToken(";");
        return;
    }
    if (!isAutoSemicolonCapable()) {
        throw new EarlySyntaxError();
    }
}

function isAutoSemicolonCapable() {
    return peekToken$ === ";" || peekTokenIsLineSeparated$ || peekToken$ === "}";
}
