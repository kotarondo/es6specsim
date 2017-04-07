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

Production.prototype.BoundNames = function() {
    if (this.chain) {
        return this.chain.BoundNames();
    }
    Assert();
}

function concatBoundNamesOnList() {
    var list = this.list;
    var names = [];
    for (var i = 0; i < list.length; i++) {
        names = names.concat(list[i].BoundNames());
    }
    return names;
}

// 12.1.2

BindingIdentifier.prototype.BoundNames = function() {
    return [this];
}

// 13.3.1.2

LexicalDeclaration.prototype.BoundNames = function() {
    return this.BindingList.BoundNames();
}

BindingList.prototype.BoundNames = concatBoundNamesOnList;

LexicalBindingByIdentifier.prototype.BoundNames = function() {
    return this.BindingIdentifier.BoundNames();
}

LexicalBindingByPattern.prototype.BoundNames = function() {
    return this.BindingPattern.BoundNames();
}

// 13.3.2.1

VariableDeclarationList.prototype.BoundNames = concatBoundNamesOnList;

VariableDeclarationByIdentifier.prototype.BoundNames = function() {
    return this.BindingIdentifier.BoundNames();
}

VariableDeclarationByPattern.prototype.BoundNames = function() {
    return this.BindingPattern.BoundNames();
}

// 13.3.3.1

ObjectBindingPattern.prototype.BoundNames = concatBoundNamesOnList;

ArrayBindingPattern.prototype.BoundNames = concatBoundNamesOnList;

Elision.prototype.BoundNames = function() {
    return [];
}

BindingProperty.prototype.BoundNames = function() {
    return this.BindingElement.BoundNames();
}

SingleNameBinding.prototype.BoundNames = function() {
    return this.BindingIdentifier.BoundNames();
}

BindingElement.prototype.BoundNames = function() {
    return this.BindingPattern.BoundNames();
}

// 13.7.5.2 is merged into validateEarlyError_13_7_5_1_E()

// 14.1.3

FunctionDeclaration.prototype.BoundNames = function() {
    if (this.BindingIdentifier) {
        return this.BindingIdentifier.BoundNames();
    }
    var pos = this.getPosition();
    return [new BindingIdentifier("*default*").setPosition(pos)];
}

FormalParameterList.prototype.BoundNames = concatBoundNamesOnList;

// 14.2.2 is merged

// 14.4.2

GeneratorDeclaration.prototype.BoundNames = function() {
    if (this.BindingIdentifier) {
        return this.BindingIdentifier.BoundNames();
    }
    var pos = this.getPosition();
    return [new BindingIdentifier("*default*").setPosition(pos)];
}

// 14.5.2

ClassDeclaration.prototype.BoundNames = function() {
    if (this.BindingIdentifier) {
        return this.BindingIdentifier.BoundNames();
    }
    var pos = this.getPosition();
    return [new BindingIdentifier("*default*").setPosition(pos)];
}

// 15.2.2.2

ImportDeclarationByClause.prototype.BoundNames = function() {
    return this.ImportClause.BoundNames();
}

ImportDeclarationBySpecifier.prototype.BoundNames = function() {
    return [];
}

ImportClauseBySpaceWithDefault.prototype.BoundNames = function() {
    var names = this.ImportedDefaultBinding.BoundNames();
    return names.concat(this.NameSpaceImport.BoundNames());
}

ImportClauseByNamedWithDefault.prototype.BoundNames = function() {
    var names = this.ImportedDefaultBinding.BoundNames();
    return names.concat(this.NamedImports.BoundNames());
}

NamedImports.prototype.BoundNames = concatBoundNamesOnList;

ImportSpecifier.prototype.BoundNames = function() {
    return this.ImportedBinding.BoundNames();
}

// 15.2.3.2

ExportDeclarationAllFrom.prototype.BoundNames =
    ExportDeclarationByClauseFrom.prototype.BoundNames =
    ExportDeclarationByClause.prototype.BoundNames = function() {
        return [];
    }

ExportDeclarationByVariable.prototype.BoundNames = function() {
    return this.VariableStatement.BoundNames();
}

ExportDeclarationByDeclaration.prototype.BoundNames = function() {
    return this.Declaration.BoundNames();
}

ExportDeclarationDefaultByHoistable.prototype.BoundNames = function() {
    var names = this.HoistableDeclaration.BoundNames();
    if (!alsoOccursIn(["*default*"], names)) {
        var pos = this.getPosition();
        names.push(new BindingIdentifier("*default*").setPosition(pos));
    }
    return names;
}

ExportDeclarationDefaultByClass.prototype.BoundNames = function() {
    var names = this.ClassDeclaration.BoundNames();
    if (!alsoOccursIn(["*default*"], names)) {
        var pos = this.getPosition();
        names.push(new BindingIdentifier("*default*").setPosition(pos));
    }
    return names;
}

ExportDeclarationDefaultByExpression.prototype.BoundNames = function() {
    var pos = this.getPosition();
    return [new BindingIdentifier("*default*").setPosition(pos)];
}
