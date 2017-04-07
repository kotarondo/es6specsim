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

Production.prototype.LexicallyDeclaredNames = function() {
    if (this.chain) {
        return this.chain.LexicallyDeclaredNames();
    }
    Assert();
}

function concatLexicallyDeclaredNamesOnList() {
    var list = this.list;
    var names = [];
    for (var i = 0; i < list.length; i++) {
        names = names.concat(list[i].LexicallyDeclaredNames());
    }
    return names;
}

// 13.2.5

StatementList.prototype.LexicallyDeclaredNames = concatLexicallyDeclaredNamesOnList;

StatementListItemOfStatement.prototype.LexicallyDeclaredNames = function() {
    var stmt = this.Statement;
    if (stmt instanceof LabelledStatement) {
        return stmt.LexicallyDeclaredNames();
    }
    return [];
}

StatementListItemOfDeclaration.prototype.LexicallyDeclaredNames = function() {
    return this.Declaration.BoundNames();
}

// 13.12.5

CaseBlock.prototype.LexicallyDeclaredNames = function() {
    var names = this.CaseClauses.LexicallyDeclaredNames();
    if (this.defaultClause) {
        names = names.concat(this.DefaultClauses.LexicallyDeclaredNames());
        names = names.concat(this.CaseClauses2.LexicallyDeclaredNames());
    }
    return names;
}

CaseClauses.prototype.LexicallyDeclaredNames = concatLexicallyDeclaredNamesOnList;

CaseClause.prototype.LexicallyDeclaredNames = function() {
    return this.StatementList.LexicallyDeclaredNames();
}

DefaultClause.prototype.LexicallyDeclaredNames = function() {
    return this.StatementList.LexicallyDeclaredNames();
}

// 13.13.6

LabelledStatement.prototype.LexicallyDeclaredNames = function() {
    var item = this.LabelledItem;
    if (item instanceof FunctionDeclaration) {
        return item.BoundNames();
    }
    return [];
}

// 14.1.13

FunctionStatementList.prototype.LexicallyDeclaredNames = function() {
    return this.StatementList.TopLevelLexicallyDeclaredNames();
}

// 14.2.10

ConciseBody.prototype.LexicallyDeclaredNames = function() {
    return [];
}

// 15.1.3

ScriptBody.prototype.LexicallyDeclaredNames = function() {
    return this.StatementList.TopLevelLexicallyDeclaredNames();
}

//15.2.1.11

ModuleItemList.prototype.LexicallyDeclaredNames = concatLexicallyDeclaredNamesOnList;

ImportDeclaration.prototype.LexicallyDeclaredNames =
    ExportDeclaration.prototype.LexicallyDeclaredNames = function() {
        return this.BoundNames();
    }

ExportDeclarationByVariable.prototype.LexicallyDeclaredNames = function() {
    return [];
}
