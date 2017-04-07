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

function containsAnyDuplicateEntries(list) {
    while (true) {
        if (list.length <= 1) return void 0;
        var m = list[0];
        var mStr = m.toString();
        var l = [];
        var h = [];
        for (var i = 1; i < list.length; i++) {
            var a = list[i];
            var aStr = a.toString();
            if (aStr === mStr) return a;
            if (aStr < mStr) {
                l.push(a);
            } else {
                h.push(a);
            }
        }
        list = h;
        if (a = containsAnyDuplicateEntries(l)) return a;
    }
}

function alsoOccursIn(list, list2) {
    while (true) {
        if (list.length === 0) return false;
        if (list2.length === 0) return false;
        var m = list2[0];
        var mStr = m.toString();
        var l = [];
        var h = [];
        for (var i = 0; i < list.length; i++) {
            var a = list[i];
            var aStr = a.toString();
            if (aStr === mStr) return m;
            if (aStr < mStr) {
                l.push(a);
            } else {
                h.push(a);
            }
        }
        var l2 = [];
        var h2 = [];
        for (var i = 1; i < list2.length; i++) {
            var a = list2[i];
            var aStr = a.toString();
            if (aStr === mStr) continue;
            if (aStr < mStr) {
                l2.push(a);
            } else {
                h2.push(a);
            }
        }
        list = h;
        list2 = h2;
        if (a = alsoOccursIn(l, l2)) return a;
    }
}

function doesNotAlsoOccursIn(list, list2) {
    while (true) {
        if (list.length === 0) return false;
        if (list2.length === 0) return list[0];
        var m = list[0];
        var mStr = m.toString();
        var l2 = [];
        var h2 = [];
        var occurrence = false;
        for (var i = 0; i < list2.length; i++) {
            var a = list2[i];
            var aStr = a.toString();
            if (aStr === mStr) {
                occurrence = true;
                continue;
            }
            if (aStr < mStr) {
                l2.push(a);
            } else {
                h2.push(a);
            }
        }
        if (!occurrence) return m;
        var l = [];
        var h = [];
        for (var i = 1; i < list.length; i++) {
            var a = list[i];
            var aStr = a.toString();
            if (aStr === mStr) continue;
            if (aStr < mStr) {
                l.push(a);
            } else {
                h.push(a);
            }
        }
        list = h;
        list2 = h2;
        if (a = doesNotAlsoOccursIn(l, l2)) return a;
    }
}
