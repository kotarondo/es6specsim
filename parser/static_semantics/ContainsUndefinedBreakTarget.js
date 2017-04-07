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

Production.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    if (this.chain) {
        return this.chain.ContainsUndefinedBreakTarget(labelSet);
    }
    Assert();
}

// returns a production found instead of "true"

function ContainsUndefinedBreakTargetOnList(labelSet) {
    var d;
    var list = this.list;
    for (var i = 0; i < list.length; i++) {
        if (d = list[i].ContainsUndefinedBreakTarget(labelSet)) return d;
    }
    return false;
}

// 13.1.2

VariableStatement.prototype.ContainsUndefinedBreakTarget =
    EmptyStatement.prototype.ContainsUndefinedBreakTarget =
    ExpressionStatement.prototype.ContainsUndefinedBreakTarget =
    ContinueStatement.prototype.ContainsUndefinedBreakTarget =
    ReturnStatement.prototype.ContainsUndefinedBreakTarget =
    ThrowStatement.prototype.ContainsUndefinedBreakTarget =
    DebuggerStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
        return false;
    }

// 13.2.3

StatementList.prototype.ContainsUndefinedBreakTarget = ContainsUndefinedBreakTargetOnList;

StatementListItemOfDeclaration.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return false;
}

// 13.6.3

IfStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    var d;
    if (d = this.Statement.ContainsUndefinedBreakTarget(labelSet)) return d;
    if (this.Statement2 && (d = this.Statement2.ContainsUndefinedBreakTarget(labelSet))) return d;
    return false;
}

// 13.7.2.2

DoStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.Statement.ContainsUndefinedBreakTarget(labelSet);
}

// 13.7.3.2

WhileStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.Statement.ContainsUndefinedBreakTarget(labelSet);
}

// 13.7.4.3
// 13.7.5.4

ForStatement.prototype.ContainsUndefinedBreakTarget =
    ForInStatement.prototype.ContainsUndefinedBreakTarget =
    ForOfStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    }

// 13.9.2

BreakStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    if (this.LabelIdentifier) {
        if (labelSet.indexOf(this.LabelIdentifier.SV) < 0) {
            return this.LabelIdentifier;
        }
    }
    return false;
}

// 13.11.3

WithStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.Statement.ContainsUndefinedBreakTarget(labelSet);
}

// 13.12.3

SwitchStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.CaseBlock.ContainsUndefinedBreakTarget(labelSet);
}

CaseBlock.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    var d;
    if (d = this.CaseClauses.ContainsUndefinedBreakTarget(labelSet)) return d;
    if (this.defaultClause) {
        if (d = this.DefaultClauses.ContainsUndefinedBreakTarget(labelSet)) return d;
        if (d = this.CaseClauses2.ContainsUndefinedBreakTarget(labelSet)) return d;
    }
    return false;
}

CaseClauses.prototype.ContainsUndefinedBreakTarget = ContainsUndefinedBreakTargetOnList;

CaseClause.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.StatementList.ContainsUndefinedBreakTarget(labelSet);
}

DefaultClause.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    return this.StatementList.ContainsUndefinedBreakTarget(labelSet);
}

// 13.13.3

LabelledStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    var label = this.LabelIdentifier.SV;
    var newLabelSet = labelSet.concat(label);
    return this.LabelledItem.ContainsUndefinedBreakTarget(newLabelSet);
}

// 13.15.3

TryStatement.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
    var d;
    if (d = this.Block.ContainsUndefinedBreakTarget(labelSet)) return d;
    if (this.Block2 && (d = this.Block2.ContainsUndefinedBreakTarget(labelSet))) return d;
    if (this.Block3 && (d = this.Block3.ContainsUndefinedBreakTarget(labelSet))) return d;
    return false;
}

//15.2.1.3

ModuleItemList.prototype.ContainsUndefinedBreakTarget = ContainsUndefinedBreakTargetOnList;

ImportDeclaration.prototype.ContainsUndefinedBreakTarget =
    ExportDeclaration.prototype.ContainsUndefinedBreakTarget = function(labelSet) {
        return false;
    }
