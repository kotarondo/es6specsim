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

Production.prototype.ComputedPropertyContains = function(symbol) {
    if (this.chain) {
        return this.chain.ComputedPropertyContains(symbol);
    }
    Assert();
}

// returns a production found instead of "true"

function ComputedPropertyContainsOnList(symbol) {
    var d;
    var list = this.list;
    for (var i = 0; i < list.length; i++) {
        if (d = list[i].ComputedPropertyContains(symbol)) return d;
    }
    return false;
}

// 12.2.6.2

LiteralPropertyName.prototype.ComputedPropertyContains = function(symbol) {
    return false;
}

ComputedPropertyName.prototype.ComputedPropertyContains = function(symbol) {
    return this.Contains(symbol);
}

// 14.3.2

MethodDefinitionNormal.prototype.ComputedPropertyContains =
    MethodDefinitionGet.prototype.ComputedPropertyContains =
    MethodDefinitionSet.prototype.ComputedPropertyContains = function(symbol) {
        return this.PropertyName.ComputedPropertyContains(symbol);
    }

// 14.4.3

GeneratorMethod.prototype.ComputedPropertyContains = function(symbol) {
    return this.PropertyName.ComputedPropertyContains(symbol);
}

// 14.5.5

ClassElementList.prototype.ComputedPropertyContains = ComputedPropertyContainsOnList;
