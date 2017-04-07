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

// 10 ECMAScript Language: Source Code

var sourceText$;
var sourceBMP$;
var sourceFileName$;
var sourceLine$;
var sourceColumn$;
var readCharPos$;
var peekCharPos$;
var peekChar$;
var nextCharPos$;
var nextChar$;
var inModule$;
var inStrictMode$;
var earlyErrorPos$;

// 10.1 Source Text

function peekChar() {
    return peekChar$;
}

function nextChar(idx) {
    if (idx) {
        AssertGreaterEquals(idx, 2);
        var pos = getCharPos();
        while (--idx >= 1) {
            proceedChar();
        }
        var c = nextChar();
        setCharPos(pos);
        return c;
    }
    if (nextChar$ === void 0) {
        nextCharPos$ = readCharPos$;
        nextChar$ = readChar();
    }
    return nextChar$;
}

function proceedChar(exp) {
    if (exp && exp !== peekChar$) {
        throw new EarlySyntaxError();
    }
    nextChar();
    peekCharPos$ = nextCharPos$;
    peekChar$ = nextChar$;
    nextCharPos$ = void 0;
    nextChar$ = void 0;
}

function proceedChar2(exp) {
    if (!exp) exp = "";
    proceedChar(exp[0]);
    proceedChar(exp[1]);
}

function proceedChar3(exp) {
    if (!exp) exp = "";
    proceedChar(exp[0]);
    proceedChar(exp[1]);
    proceedChar(exp[2]);
}

function getCharPos() {
    return peekCharPos$;
}

function setCharPos(pos) {
    readCharPos$ = pos;
    peekCharPos$ = pos;
    peekChar$ = readChar();
    nextCharPos$ = void 0;
    nextChar$ = void 0;
}

function setSourceText(text) {
    sourceText$ = text;
    sourceBMP$ = false;
    sourceFileName$ = "";
    sourceLine$ = 1;
    sourceColumn$ = 1;
    setCharPos(0);
    inModule$ = 0;
    inStrictMode$ = 0;
    earlyErrorPos$ = void 0;
}

function setSourceInfo(filename, line, column) {
    sourceFileName$ = filename;
    sourceLine$ = line || 1;
    sourceColumn$ = column || 1;
}

function saveSourceTextContext() {
    return {
        text: sourceText$,
        bmp: sourceBMP$,
        filename: sourceFileName$,
        line: sourceLine$,
        column: sourceColumn$,
        pos: peekCharPos$,
        inModule: inModule$,
        inStrictMode: inStrictMode$,
        earlyErrorPos: earlyErrorPos$,
    };
}

function restoreSourceTextContext(ctx) {
    sourceText$ = ctx.text;
    sourceBMP$ = ctx.bmp;
    sourceFileName$ = ctx.filename;
    sourceLine$ = ctx.line;
    sourceColumn$ = ctx.column;
    setCharPos(ctx.pos);
    inModule$ = ctx.inModule;
    inStrictMode$ = ctx.inStrictMode;
    earlyErrorPos$ = ctx.earlyErrorPos;
}

function readChar() {
    var c = sourceText$[readCharPos$];
    if (c === void 0) {
        return "";
    }
    var lead = c.charCodeAt(0);
    if (0xD800 <= lead && lead <= 0xDBFF && !sourceBMP$) {
        var trail = sourceText$.charCodeAt(readCharPos$ + 1);
        if (0xDC00 <= trail && trail <= 0xDFFF) {
            readCharPos$ += 2;
            return String.fromCharCode(lead, trail);
        }
    }
    readCharPos$ += 1;
    return c;
}

// 10.2 Types of Source Code

function isInModule() {
    return !!inModule$;
}

function enterModule() {
    AssertEquals(inModule$, 0);
    ++inModule$;
}

function leaveModule() {
    --inModule$;
    AssertEquals(inModule$, 0);
}

// 10.2.1 Strict Mode Code

function isInStrictMode() {
    return !!inStrictMode$;
}

function enterStrictMode() {
    ++inStrictMode$;
}

function leaveStrictMode() {
    --inStrictMode$;
    AssertGreaterEquals(inStrictMode$, 0);
}

// Static Semantics: Early Errors

EarlyError.prototype = Object.create(Error.prototype);

function EarlyError(message, d) {
    this.message = message;
    if (d) {
        if (d.getPosition) {
            var pos = d.getPosition();
        }
        if (d.toString) {
            this.message += ": " + d.toString();
        }
    }
    if (!(pos >= 0)) {
        var pos = earlyErrorPos$;
    }
    if (!(pos >= 0)) {
        var pos = peekCharPos$;
    }
    var lineNumber = sourceLine$ - 1;
    var linePos = 1 - sourceColumn$;
    var i = 0;
    while (i < pos) {
        var c = sourceText$[i++];
        if (!isLineTerminator(c)) {
            continue;
        }
        if (c === "\r" && sourceText$[i] === "\n") {
            i++;
        }
        lineNumber++;
        linePos = i;
    }
    this.sourceLine = lineNumber + 1;
    this.sourceColumn = pos - linePos + 1;
    this.filename = sourceFileName$;
}

EarlySyntaxError.prototype = Object.create(EarlyError.prototype);
EarlySyntaxError.prototype.name = "EarlySyntaxError";

function EarlySyntaxError(message, d) {
    EarlyError.call(this, message, d);
    Error.captureStackTrace(this, EarlySyntaxError);
}

EarlyReferenceError.prototype = Object.create(EarlyError.prototype);
EarlyReferenceError.prototype.name = "EarlyReferenceError";

function EarlyReferenceError(message, d) {
    EarlyError.call(this, message, d);
    Error.captureStackTrace(this, EarlyReferenceError);
}
