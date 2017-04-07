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

Production.prototype.ExportedNames = function() {
    if (this.chain) {
        return this.chain.ExportedNames();
    }
    Assert();
}

function concatExportedNames() {
    var list = this.list;
    var names = [];
    for (var i = 0; i < list.length; i++) {
        names = names.concat(list[i].ExportedNames());
    }
    return names;
}

// 15.2.1.6

ModuleItemList.prototype.ExportedNames = concatExportedNames;

ImportDeclaration.prototype.ExportedNames =
    StatementListItem.prototype.ExportedNames = function() {
        return [];
    }

// 15.2.3.4

ExportDeclarationAllFrom.prototype.ExportedNames = function() {
    return [];
}

ExportDeclarationByClauseFrom.prototype.ExportedNames =
    ExportDeclarationByClause.prototype.ExportedNames = function() {
        return this.ExportClause.ExportedNames();
    }

ExportDeclarationByVariable.prototype.ExportedNames = function() {
    return this.VariableStatement.BoundNames();
}

ExportDeclarationByDeclaration.prototype.ExportedNames = function() {
    return this.Declaration.BoundNames();
}

ExportDeclarationDefaultByHoistable.prototype.ExportedNames =
    ExportDeclarationDefaultByClass.prototype.ExportedNames =
    ExportDeclarationDefaultByExpression.prototype.ExportedNames = function() {
        var pos = this.getPosition();
        return [new BindingIdentifier("default").setPosition(pos)];
    }

ExportClause.prototype.ExportedNames = concatExportedNames;

ExportSpecifier.prototype.ExportedNames = function() {
    if (!this.IdentifierName2) {
        var pos = this.getPosition();
        var name = this.IdentifierName;
    } else {
        var pos = this.position2;
        var name = this.IdentifierName2;
    }
    var SV = SVofIdentifierName(name);
    return [new BindingIdentifier(SV).setPosition(pos)];
}
