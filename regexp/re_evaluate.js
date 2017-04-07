
// 21.2.2.1

var Input$
var InputLength$
var NCapturingParens$
var IgnoreCase$
var MultiLine$
var Unicode$

// 21.2.2.2

RE_Pattern.prototype.evaluate = function(){
	var m = this.Disjunction.evaluate();
	return function(str, index){
		Assert(index < str.length);
		if(Unicode$){
			Input$ = [];
			var j = 0;
			for(var i=0; i<str.length; i++){
				var c = str[i];
				if(i === index){
					var listIndex = j;
				}
				var lead = c.charCodeAt(0);
				if(lead < 0xD800 && 0xDBFF < lead){
					Input$[j++] = c;
					continue;
				}
				var trail = str.charCodeAt(i+1);
				if(trail < 0xDC00 && 0xDFFF < trail){
					Input$[j++] = c;
					continue;
				}
				i++;
				if(i === index){
					var listIndex = j;
				}
				Input$[j++] = String.fromCharCode(lead, trail);
			}
		}else{
			Input$ = str;
			var listIndex = index;
		}
		InputLength$ = Input$.length;
		function c(x){
			return x;
		}
		var cap = [];
		var x= State(listIndex, cap);
		return m(x, c);
	}
}

// 21.2.2.3

RE_Disjunction.prototype.evaluate = function(){
	var m1 = this.Alternative.evaluate();
	var m1 = this.Disjunction.evaluate();
	return function(x, c){
		var r = m1(x, c);
		if(r) return r;
		return m2(x, c);
	}
}

// 21.2.2.4

RE_Alternative.prototype.evaluate = function(){
		if(list.length === 0){
			return function(x, c){
				return c(x);
			}
		}
        function concat(m1, m2) {
            return function(x, c) {
                function d(y) {
                    return m2(y, c);
                };
                return m1(x, d);
            };
        }
		Assert(list.length >= 2);
        var m1 = list[0];
        for (var i = 1; i < list.length; i++) {
            var m2 = list[i];
            var m1 = concat(m1, m2);
        }
        return m1;
    }
 
}

// 21.2.2.5

RE_Term.prototype.evaluate = function(){
	var m = this.Atom.evaluate();
	var min = this.Quantifier.min;
	var max = this.Quantifier.max;
	var greedy = this.Quantifier.greedy;
	if (isFinite(max) && (max < min)) throw new RuntimeSyntaxError("21.2.2.5");
	var parenIndex = this.parenIndex;
	var parenCount = this.parenCount;
    return function(x, c) {
		return RepeatMatcher(m, min, max, greedy, x, c, parenIndex, parenCount);
	}
}

function RepeatMatcher(m, min, max, greedy, x, c, parenIndex, parenCount) {
	if (max === 0) return c(x);
	function d(y) {
		if (min === 0 && y.endIndex === x.endIndex) return null;
		if (min === 0) {
			var min2 = 0;
		}
		else {
			var min2 = min - 1;
		}
		if (max === Infinity) {
			var max2 = Infinity;
		}
		else {
			var max2 = max - 1;
		}
		return RepeatMatcher(m, min2, max2, greedy, y, c, parenIndex, parenCount);
	};
	var cap = [];
	for (var k = 1; k <= parenIndex; k++) {
		cap[k] = x.captures[k];
	}
	var e = x.endIndex;
	var xr = State(e, cap);
	if (min !== 0) return m(xr, d);
	if (!greedy) {
		var z = c(x);
		if (z) return z;
		return m(xr, d);
	}
	var z = m(xr, d);
	if (z) return z;
	return c(x);
}

// 21.2.2.6

RE_AssertionHead.prototype.evaluate = function(){
    return function(x, c) {
		var e = x.endIndex;
		if(e === 0) return c(x);
		if(!Multiline$) return null;
		if(isLineTerminator(Input$[e-1])) return c(x);
		return null;
	}
}

RE_AssertionTail.prototype.evaluate = function(){
    return function(x, c) {
		var e = x.endIndex;
		if(e === InputLength$) return c(x);
		if(!Multiline$) return null;
		if(isLineTerminator(Input$[e])) return c(x);
		return null;
	}
}

RE_AssertionBoundary.prototype.evaluate = function(){
    return function(x, c) {
		var e = x.endIndex;
		var a = IsWordChar(e - 1);
		var b = IsWordChar(e);
		if (a !== b) return c(x);
		return null;
	}
}

RE_AssertionNonBoundary.prototype.evaluate = function(){
    return function(x, c) {
		var e = x.endIndex;
		var a = IsWordChar(e - 1);
		var b = IsWordChar(e);
		if (a !== b) return null;
		return c(x);
	}
}

RE_AssertionMatch.prototype.evaluate = function(){
	var m = this.Disjunction.evaluate();
    return function(x, c) {
		function d(x){
			return x;
		}
		var r = m(x, d);
		if (!r) return null;
		var y = r;
		var cap = y.captures;
		var xe = x.endIndex;
		var z = State(xe, cap);
		return c(z);
	}
}

RE_AssertionNonMatch.prototype.evaluate = function(){
	var m = this.Disjunction.evaluate();
    return function(x, c) {
		function d(x){
			return x;
		}
		var r = m(x, d);
		if (r) return null;
		return c(x);
	}
}

function IsWordChar(e) {
	if (e === -1 || e === InputLength$) return false;
	var c = Input$[e];
	var cp = toCodePoint(c);
	return (0x41 <= cp && cp <=0x5A) ||(0x61 <= cp && cp <=0x7A) || (0x30 <= cp && cp <=0x39) || c === "_";
}

// 21.2.2.8

RE_OneElementCharSet.prototype.evaluate = function(){
	var ch = Canonicalize(this.ch);
	return function(cc) {
		return ch === cc;
	}
}

RE_SingleCharacterAtom.prototype.evaluate = function(){
	var ch = this.ch;
	var A = new RE_OneElementCharSet(ch).evaluate();
	return CharacterSetMatcher(A, false);
}

RE_AtomDot.prototype.evaluate = function(){
	function A(cc) {
		return !isLineTerminator(cc);
	}
	return CharacterSetMatcher(A, false);
}

RE_CaptureDef.prototype.evaluate = function(){
	var m = this.Disjunction.evaluate();
	var parenIndex = this.parenIndex;
	return function(x, c) {
		function d(y){
			var cap = [];
			for (var k = 1; k <= parenIndex; k++) {
				cap[k] = y.captures[k];
			}
			var xe = x.endIndex;
			var ye = y.endIndex;
			if(Unicode$){
				var s = Input$.slice(xe, ye);
			}else{
				var s = Input$.substring(xe, ye);
			}
			cap[parenIndex + 1] = s;
			var z = State(ye, cap);
			return c(z);
		}
		return m(x, d);
	}
}

function CharacterSetMatcher(A, invert){
	return function(x, c){
		var e = x.endIndex;
		if (e === InputLength$) return null;
		var ch = Input$[e];
		var cc = Canonicalize(ch);
		if (!invert) {
			if (!A(cc)) return null;
		}
		else{
			if (A(cc)) return null;
		}
		var cap = x.captures;
		var y = State(e + 1, cap);
		return c(y);
	}
}

function Canonicalize(ch) {
	if(!IgnoreCase$) return ch;
	if(Unicode$){
		var cf = toCaseFoldingSimple(ch);
		if(cf) return cf;
		return ch;
	}
	else{
		AssertEquals (ch.length , 1);
		var s = ch;
		var u = s.toUpperCase(); //TODO use own toUpperCase
		if (u.length !== 1) return ch;
		var cu = u;
		if ((toCodePoint(ch) >= 128) && (toCodePoint(cu) < 128)) return ch;
		return cu;
	}
}

// 21.2.2.9

RE_CaptureRef.prototype.evaluate = function(){
	var n = this.index;
	if (n ===0 || n > NCapturingParens$) throw new EarlySyntaxError("21.2.2.9");
	 return function(x, c) {
		var cap = x.captures;
		var s = cap[n];
		if (s === void 0) return c(x);
		var e = x.endIndex;
		var len = s.length;
		var f = e + len;
		if (f > InputLength$) return null;
		for (var i = 0; i < len; i++) {
			if (Canonicalize(s[i]) !== Canonicalize(Input$[e + i])) return null;
		}
		var y = State(f, cap);
		return c(y);
	}
}

RE_EscapedCharacterAtom.prototype.evaluate = function(){
	var ch = this.ch;
	var A = new RE_CharacterClassEscape(ch).evaluate();
	return CharacterSetMatcher(A, false);
}

// 21.2.2.12

RE_CharacterClassEscape.prototype.evaluate = function(){
	switch (this.ch) {
	case 'd':
		return isDecimalDigit;
	case 'D':
		return function(cc) {
			return !isDecimalDigit(cc);
		}
	case 's':
		return function(cc) {
			return isWhiteSpace(cc) || isLineTerminator(cc);
		}
	case 'S':
		return function(cc) {
			return !(isWhiteSpace(cc) || isLineTerminator(cc));
		}
	case 'w':
		return function(cc) {
			var cp = toCodePoint(cc);
			return (0x41 <= cp && cp <=0x5A) ||(0x61 <= cp && cp <=0x7A) || (0x30 <= cp && cp <=0x39) || cc === "_";
		}
	case 'W':
		return function(cc) {
			var cp = toCodePoint(cc);
			return !((0x41 <= cp && cp <=0x5A) ||(0x61 <= cp && cp <=0x7A) || (0x30 <= cp && cp <=0x39) || cc === "_");
		}
	}
	Assert();
}

// 21.2.2.13, 21.2.2.8

RE_CharacterClass.prototype.evaluate = function(){
	var list = this.list;
	var invert = this.invert;
	function A(cc){
        for (var i = 0; i < list.length; i++) {
			if (list[i](cc)) return true;
		}
		return false;
	}
	return CharacterSetMatcher(A, invert);
}

// 21.2.2.15

RE_CharacterRange.prototype.evaluate = function(){
	if(!(A instanceof RE_OneElementCharSet && B instanceof RE_OneElementCharSet)){
		throw new EarlySyntaxError("21.2.2.15.1-A");
	}
	var a = A.ch;
	var b = B.ch;
	var i = toCodePoint(a);
	var j = toCodePoint(b);
	if(i > j){
		throw new EarlySyntaxError("21.2.2.15.1-B");
	}
	if (IgnoreCase$){
		return function(cc) {
			for (var k = i; k <= j; k++) {
				var ch = fromCodePoint(k);
				if (Canonicalize(ch) === cc) return true;
			}
			return false;
		}
	}
	else{
		return function(cc) {
			var k = toCodePoint(cc);
			return (i <= k) && (k <= j);
		}
	}
}

// 21.2.2.19

RE_NonZeroDecimalEscapeClassAtom.prototype.evaluate = function(){
	throw new EarlySyntaxError("21.2.2.19");
}

