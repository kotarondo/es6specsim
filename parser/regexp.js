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

var NCapturingParens$

function parsePattern(U) {
    NCapturingParens$ = 0;
    var disj = parseDisjunction(U);
    if (peekChar() !== "") {
        throw new EarlySyntaxError();
    }
    return new RE_Pattern(disj);
}

function parseDisjunction(U) {
    var m1 = parseAlternative(U);
    if (peekChar() !== "|") return m1;
    proceedChar();
    var m2 = parseDisjunction(U);
    return new RE_Disjunction(m1, m2);
}

function parseAlternative(U) {
    var list = [];
    while (peekChar() !== "") {
        var m = parseTerm(U);
        if (!m) break;
        list.push(m);
    }
    if (list.length === 1) {
        return list[0];
    }
    return new RE_Alternative(list);
}

function parseTerm(U) {
    var parenIndex = NCapturingParens$;
    var m = parseAssertion(U);
    if (m) return m;
    var m = parseAtom(U);
    if (!m) return m;
    var q = readQuantifier();
    if (!q) return m;
    var parenCount = NCapturingParens$ - parenIndex;
    return new RE_Term(m, q, parenIndex, parenCount);
}

function parseAssertion(U) {
    switch (peekChar()) {
        case "^":
            proceedChar();
            return new RE_AssertionHead();
        case "$":
            proceedChar();
            return new RE_AssertionTail();
        case "\\":
            if (nextChar() === "b") {
                proceedChar2();
                return new RE_AssertionBoundary();
            }
            if (nextChar() === "B") {
                proceedChar2();
                return new RE_AssertionNonBoundary();
            }
            break;
        case "(":
            if (nextChar() === "?" && nextChar(2) === "=") {
                proceedChar3();
                var m = parseDisjunction(U);
                proceedChar(")");
                return new RE_AssertionMatch(m);
            }
            if (nextChar() === "?" && nextChar(2) === "!") {
                proceedChar3();
                var m = parseDisjunction(U);
                proceedChar(")");
                return new RE_AssertionNonMatch(m);
            }
            break;
    }
    return void 0;
}

function readQuantifier() {
    switch (peekChar()) {
        case "*":
            proceedChar();
            var min = 0;
            var max = Infinity;
            break;
        case "+":
            proceedChar();
            var min = 1;
            var max = Infinity;
            break;
        case "?":
            proceedChar();
            var min = 0;
            var max = 1;
            break;
        case "{":
            proceedChar();
            var min = readDecimalDigits();
            var max = min;
            if (peekChar() === ",") {
                proceedChar();
                if (peekChar() === "}") {
                    var max = Infinity;
                } else {
                    var max = readDecimalDigits();
                }
            }
            proceedChar("}");
            break;
        default:
            return void 0;
    }
    var greedy = true;
    if (peekChar() === "?") {
        proceedChar();
        var greedy = false;
    }
    return {
        min: min,
        max: max,
        greedy: greedy
    };
}

function parseAtom(U) {
    var c = peekChar();
    switch (c) {
        case ".":
            proceedChar();
            return new RE_AtomDot();
        case "\\":
            proceedChar();
            return parseAtomEscape(U);
        case "[":
            return parseCharacterClass(U);
        case "(":
            if (nextChar() === "?" && nextChar(2) === ":") {
                proceedChar3();
                var m = parseDisjunction(U);
                proceedChar(")");
                return m;
            }
            var parenIndex = NCapturingParens$++;
            proceedChar();
            var m = parseDisjunction(U);
            proceedChar(")");
            return new RE_CaptureDef(m, parenIndex);
        case "^":
        case "$":
        case "*":
        case "+":
        case "?":
        case "|":
        case "]":
        case ")":
        case "{":
        case "}":
            return void 0;
    }
    proceedChar();
    return new RE_SingleCharacterAtom(c);
}

function isSyntaxCharacter(c) {
    switch (c) {
        case "^":
        case "$":
        case "\\":
        case ".":
        case "*":
        case "+":
        case "?":
        case "(":
        case ")":
        case "[":
        case "]":
        case "{":
        case "}":
        case "|":
            return true;
    }
    return false;
}

function parseAtomEscape(U) {
    var c = peekChar();
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
            var n = readDecimalEscape();
            if (n === 0) {
                return new RE_SingleCharacterAtom("\0");
            }
            return new RE_CaptureRef(n);
        case "d":
        case "D":
        case "s":
        case "S":
        case "w":
        case "W":
            proceedChar();
            return new RE_EscapedCharacterAtom(c);
    }
    var c = readCharacterEscape(U);
    return new RE_SingleCharacterAtom(c);
}

function readCharacterEscape(U) {
    switch (peekChar()) {
        case "t":
            proceedChar();
            return "\u0009";
        case "n":
            proceedChar();
            return "\u000A";
        case "v":
            proceedChar();
            return "\u000B";
        case "f":
            proceedChar();
            return "\u000C";
        case "r":
            proceedChar();
            return "\u000D";
        case "c":
            var ch = nextChar();
            if (ch === "") {
                break;
            }
            var i = toCodePoint(ch);
            if (!((0x41 <= i && i <= 0x5A) || (0x61 <= i && i <= 0x7A))) {
                break;
            }
            proceedChar();
            proceedChar();
            return fromCodePoint(i % 32);
        case "x":
            return readHexEscapeSequence();
        case "u":
            return readRegExpUnicodeEscapeSequence(U);
    }
    return readIdentityEscape(U);
}

function readIdentityEscape(U) {
    var c = peekChar();
    proceedChar();
    if (U) {
        AssertEquals(U, "U");
        if (!isSyntaxCharacter(c) && c !== "/") {
            throw new EarlySyntaxError();
        }
    } else {
        if (isUnicodeID_Continue(c)) {
            throw new EarlySyntaxError();
        }
    }
    return c;
}

function readRegExpUnicodeEscapeSequence(U) {
    proceedChar("u");
    if (!U) {
        return fromCodePoint(readHex4Digits());
    }
    AssertEquals(U, "U");
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
            validateEarlyError_21_2_1_1(code);
        }
        proceedChar("}");
        return fromCodePoint(code);
    }
    var surrogate = readHex4Digits();
    if (0xD800 <= surrogate && surrogate <= 0xDBFF) {
        if (peekChar() === "\\" && nextChar() === "u") {
            var pos = getParsingPosition();
            proceedChar();
            proceedChar();
            var surrogate2 = readHex4Digits();
            if (0xDC00 <= surrogate2 && surrogate2 <= 0xDFFF) {
                return String.fromCharCode(surrogate, surrogate2);
            }
            setParsingPosition(pos);
        }
    }
    return fromCodePoint(surrogate);
}

function validateEarlyError_21_2_1_1(code) {
    if (code > 1114111) {
        throw new EarlySyntaxError("21.2.1.1");
    }
}

function readDecimalEscape() {
    if (peekChar() === "0") {
        proceedChar();
        if (isDecimalDigit(peekChar())) {
            throw new EarlySyntaxError();
        }
        return 0;
    }
    return readDecimalDigits();
}

function parseCharacterClass(U) {
    proceedChar("[");
    if (peekChar() === "^") {
        var invert = true;
        proceedChar();
    }
    var list = parseClassRanges(U);
    proceedChar("]");
    return new RE_CharacterClass(list, invert);
}

function parseClassRanges(U) {
    var list = [];
    while (peekChar() !== "]") {
        var A = parseClassAtom(U);
        if (peekChar() !== "-") {
            list.push(A);
            continue;
        }
        proceedChar();
        if (peekChar() === "]") {
            list.push(A);
            list.push(new RE_OneElementCharSet("-"));
            break;
        }
        var B = parseClassAtom(U);
        list.push(new RE_CharacterRange(A, B));
    }
    return list;
}

function parseClassAtom(U) {
    if (peekChar() !== "\\") {
        var c = peekChar();
        proceedChar();
        return new RE_OneElementCharSet(c);
    }
    proceedChar();
    var c = peekChar();
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
            var n = readDecimalEscape();
            if (n === 0) {
                return new RE_OneElementCharSet("\0");
            }
            return new RE_NonZeroDecimalEscapeClassAtom();
        case "b":
            return new RE_OneElementCharSet("\u0008");
        case "-":
            if (U) {
                AssertEquals(U, "U");
                return new RE_OneElementCharSet("-");
            }
            break;
        case "d":
        case "D":
        case "s":
        case "S":
        case "w":
        case "W":
            proceedChar();
            return new RE_CharacterClassEscape(c);
    }
    var c = readCharacterEscape(U);
    return new RE_OneElementCharSet(c);
}
