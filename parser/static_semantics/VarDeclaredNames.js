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

Production.prototype.VarDeclaredNames = function() {
    if (this.chain) {
        return this.chain.VarDeclaredNames();
    }
    Assert();
}

function concatVarDeclaredNamesOnList() {
    var list = this.list;
    var names = [];
    for (var i = 0; i < list.length; i++) {
        names = names.concat(list[i].VarDeclaredNames());
    }
    return names;
}

// 13.1.5

EmptyStatement.prototype.VarDeclaredNames =
    ExpressionStatement.prototype.VarDeclaredNames =
    ContinueStatement.prototype.VarDeclaredNames =
    BreakStatement.prototype.VarDeclaredNames =
    ReturnStatement.prototype.VarDeclaredNames =
    ThrowStatement.prototype.VarDeclaredNames =
    DebuggerStatement.prototype.VarDeclaredNames = function() {
        return [];
    }

// 13.2.11

StatementList.prototype.VarDeclaredNames = concatVarDeclaredNamesOnList;

StatementListItemOfDeclaration.prototype.VarDeclaredNames = function() {
    return [];
}

// 13.3.2.2

VariableStatement.prototype.VarDeclaredNames = function() {
    return this.VariableDeclarationList.BoundNames();
}

// 13.6.5

IfStatement.prototype.VarDeclaredNames = function() {
    var names = this.Statement.VarDeclaredNames();
    if (this.Statement2) {
        names = names.concat(this.Statement2.VarDeclaredNames());
    }
    return names;
}

// 13.7.2.4

DoStatement.prototype.VarDeclaredNames = function() {
    return this.Statement.VarDeclaredNames();
}

// 13.7.3.4

WhileStatement.prototype.VarDeclaredNames = function() {
    return this.Statement.VarDeclaredNames();
}

// 13.7.4.5
// 13.7.5.7

ForStatement.prototype.VarDeclaredNames =
    ForInStatement.prototype.VarDeclaredNames =
    ForOfStatement.prototype.VarDeclaredNames = function() {
        if (this.type === "var") {
            var names = this.head.BoundNames();
            names = names.concat(this.Statement.VarDeclaredNames());
            return names;
        } else {
            return this.Statement.VarDeclaredNames();
        }
    }

// 13.11.5

WithStatement.prototype.VarDeclaredNames = function() {
    return this.Statement.VarDeclaredNames();
}

// 13.12.7

SwitchStatement.prototype.VarDeclaredNames = function() {
    return this.CaseBlock.VarDeclaredNames();
}

CaseBlock.prototype.VarDeclaredNames = function() {
    var names = this.CaseClauses.VarDeclaredNames();
    if (this.defaultClause) {
        names = names.concat(this.DefaultClauses.VarDeclaredNames());
        names = names.concat(this.CaseClauses2.VarDeclaredNames());
    }
    return names;
}

CaseClauses.prototype.VarDeclaredNames = concatVarDeclaredNamesOnList;

CaseClause.prototype.VarDeclaredNames = function() {
    return this.StatementList.VarDeclaredNames();
}

DefaultClause.prototype.VarDeclaredNames = function() {
    return this.StatementList.VarDeclaredNames();
}

// 13.13.12

LabelledStatement.prototype.VarDeclaredNames = function() {
    var item = this.LabelledItem;
    if (item instanceof FunctionDeclaration) {
        return item.VarDeclaredNames();
    }
    return [];
}

// 13.15.5

TryStatement.prototype.VarDeclaredNames = function() {
    var names = this.Block.VarDeclaredNames();
    if (this.Block2) names = names.concat(this.Block2.VarDeclaredNames());
    if (this.Block3) names = names.concat(this.Block3.VarDeclaredNames());
    return names;
}

// 14.1.15

FunctionStatementList.prototype.VarDeclaredNames = function() {
    return this.StatementList.TopLevelVarDeclaredNames();
}

// 14.2.12

ConciseBody.prototype.VarDeclaredNames = function() {
    return [];
}

// 15.1.5

ScriptBody.prototype.VarDeclaredNames = function() {
    return this.StatementList.TopLevelVarDeclaredNames();
}

//15.2.1.13

ModuleItemList.prototype.VarDeclaredNames = concatVarDeclaredNamesOnList;

ImportDeclaration.prototype.VarDeclaredNames =
    ExportDeclaration.prototype.VarDeclaredNames = function() {
        return [];
    }

ExportDeclarationByVariable.prototype.VarDeclaredNames = function() {
    return this.BoundNames();
}
