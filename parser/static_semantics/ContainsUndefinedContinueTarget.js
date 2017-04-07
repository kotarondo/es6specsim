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

Production.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    if (this.chain) {
        return this.chain.ContainsUndefinedContinueTarget(iterationSet, labelSet);
    }
    Assert();
}

// returns a production found instead of "true"

function ContainsUndefinedContinueTargetOnList(iterationSet, labelSet) {
    var d;
    var list = this.list;
    for (var i = 0; i < list.length; i++) {
        if (d = list[i].ContainsUndefinedContinueTarget(iterationSet, [])) return d;
    }
    return false;
}

// 13.1.3

VariableStatement.prototype.ContainsUndefinedContinueTarget =
    EmptyStatement.prototype.ContainsUndefinedContinueTarget =
    ExpressionStatement.prototype.ContainsUndefinedContinueTarget =
    BreakStatement.prototype.ContainsUndefinedContinueTarget =
    ReturnStatement.prototype.ContainsUndefinedContinueTarget =
    ThrowStatement.prototype.ContainsUndefinedContinueTarget =
    DebuggerStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
        return false;
    }

// 13.2.4

StatementList.prototype.ContainsUndefinedContinueTarget = ContainsUndefinedContinueTargetOnList;

StatementListItemOfDeclaration.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    return false;
}

// 13.6.4

IfStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var d;
    if (d = this.Statement.ContainsUndefinedContinueTarget(iterationSet, [])) return d;
    if (this.Statement2 && (d = this.Statement2.ContainsUndefinedContinueTarget(iterationSet, []))) return d;
    return false;
}

// 13.1.3
// 13.7.2.3

DoStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var newIterationSet = iterationSet.concat(labelSet);
    return this.Statement.ContainsUndefinedContinueTarget(newIterationSet, []);
}

// 13.1.3
// 13.7.3.3

WhileStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var newIterationSet = iterationSet.concat(labelSet);
    return this.Statement.ContainsUndefinedContinueTarget(newIterationSet, []);
}

// 13.1.3
// 13.7.4.4
// 13.7.5.5

ForStatement.prototype.ContainsUndefinedContinueTarget =
    ForInStatement.prototype.ContainsUndefinedContinueTarget =
    ForOfStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
        var newIterationSet = iterationSet.concat(labelSet);
        return this.Statement.ContainsUndefinedContinueTarget(newIterationSet, []);
    }

// 13.8.2

ContinueStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    if (this.LabelIdentifier) {
        if (iterationSet.indexOf(this.LabelIdentifier.SV) < 0) {
            return this.LabelIdentifier;
        }
    }
    return false;
}

// 13.11.4

WithStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
}

// 13.12.4

SwitchStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    return this.CaseBlock.ContainsUndefinedContinueTarget(iterationSet, []);
}

CaseBlock.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var d;
    if (d = this.CaseClauses.ContainsUndefinedContinueTarget(iterationSet, [])) return d;
    if (this.defaultClause) {
        if (d = this.DefaultClauses.ContainsUndefinedContinueTarget(iterationSet, [])) return d;
        if (d = this.CaseClauses2.ContainsUndefinedContinueTarget(iterationSet, [])) return d;
    }
    return false;
}

CaseClauses.prototype.ContainsUndefinedContinueTarget = ContainsUndefinedContinueTargetOnList;

CaseClause.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    return this.StatementList.ContainsUndefinedContinueTarget(iterationSet, []);
}

DefaultClause.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    return this.StatementList.ContainsUndefinedContinueTarget(iterationSet, []);
}

// 13.13.4

LabelledStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var label = this.LabelIdentifier.SV;
    var newLabelSet = labelSet.concat(label);
    return this.LabelledItem.ContainsUndefinedContinueTarget(iterationSet, newLabelSet);
}

// 13.15.4

TryStatement.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
    var d;
    if (d = this.Block.ContainsUndefinedContinueTarget(iterationSet, [])) return d;
    if (this.Block2 && (d = this.Block2.ContainsUndefinedContinueTarget(iterationSet, []))) return d;
    if (this.Block3 && (d = this.Block3.ContainsUndefinedContinueTarget(iterationSet, []))) return d;
    return false;
}

//15.2.1.4

ModuleItemList.prototype.ContainsUndefinedContinueTarget = ContainsUndefinedContinueTargetOnList;

ImportDeclaration.prototype.ContainsUndefinedContinueTarget =
    ExportDeclaration.prototype.ContainsUndefinedContinueTarget = function(iterationSet, labelSet) {
        return false;
    }
