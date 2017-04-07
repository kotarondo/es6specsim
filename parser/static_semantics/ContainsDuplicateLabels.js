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

Production.prototype.ContainsDuplicateLabels = function(labelSet) {
    if (this.chain) {
        return this.chain.ContainsDuplicateLabels(labelSet);
    }
    Assert();
}

// returns a production found instead of "true"

function ContainsDuplicateLabelsOnList(labelSet) {
    var d;
    var list = this.list;
    for (var i = 0; i < list.length; i++) {
        if (d = list[i].ContainsDuplicateLabels(labelSet)) return d;
    }
    return false;
}

// 13.1.1

VariableStatement.prototype.ContainsDuplicateLabels =
    EmptyStatement.prototype.ContainsDuplicateLabels =
    ExpressionStatement.prototype.ContainsDuplicateLabels =
    ContinueStatement.prototype.ContainsDuplicateLabels =
    BreakStatement.prototype.ContainsDuplicateLabels =
    ReturnStatement.prototype.ContainsDuplicateLabels =
    ThrowStatement.prototype.ContainsDuplicateLabels =
    DebuggerStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
        return false;
    }

// 13.2.2

StatementList.prototype.ContainsDuplicateLabels = ContainsDuplicateLabelsOnList;

StatementListItemOfDeclaration.prototype.ContainsDuplicateLabels = function(labelSet) {
    return false;
}

// 13.6.2

IfStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    var d;
    if (d = this.Statement.ContainsDuplicateLabels(labelSet)) return d;
    if (this.Statement2 && (d = this.Statement2.ContainsDuplicateLabels(labelSet))) return d;
    return false;
}

// 13.7.2.1

DoStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.Statement.ContainsDuplicateLabels(labelSet);
}

// 13.7.3.1

WhileStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.Statement.ContainsDuplicateLabels(labelSet);
}

// 13.7.4.2
// 13.7.5.3

ForStatement.prototype.ContainsDuplicateLabels =
    ForInStatement.prototype.ContainsDuplicateLabels =
    ForOfStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    }

// 13.11.2

WithStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.Statement.ContainsDuplicateLabels(labelSet);
}

// 13.12.2

SwitchStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.CaseBlock.ContainsDuplicateLabels(labelSet);
}

CaseBlock.prototype.ContainsDuplicateLabels = function(labelSet) {
    var d;
    if (d = this.CaseClauses.ContainsDuplicateLabels(labelSet)) return d;
    if (this.defaultClause) {
        if (d = this.DefaultClauses.ContainsDuplicateLabels(labelSet)) return d;
        if (d = this.CaseClauses2.ContainsDuplicateLabels(labelSet)) return d;
    }
    return false;
}

CaseClauses.prototype.ContainsDuplicateLabels = ContainsDuplicateLabelsOnList;

CaseClause.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.StatementList.ContainsDuplicateLabels(labelSet);
}

DefaultClause.prototype.ContainsDuplicateLabels = function(labelSet) {
    return this.StatementList.ContainsDuplicateLabels(labelSet);
}

// 13.13.2

LabelledStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    var label = this.LabelIdentifier.SV;
    if (labelSet.indexOf(label) >= 0) {
        return this.LabelIdentifier;
    }
    var newLabelSet = labelSet.concat(label);
    return this.LabelledItem.ContainsDuplicateLabels(newLabelSet);
}

// 13.15.2

TryStatement.prototype.ContainsDuplicateLabels = function(labelSet) {
    var d;
    if (d = this.Block.ContainsDuplicateLabels(labelSet)) return d;
    if (this.Block2 && (d = this.Block2.ContainsDuplicateLabels(labelSet))) return d;
    if (this.Block3 && (d = this.Block3.ContainsDuplicateLabels(labelSet))) return d;
    return false;
}

//15.2.1.2

ModuleItemList.prototype.ContainsDuplicateLabels = ContainsDuplicateLabelsOnList;

ImportDeclaration.prototype.ContainsDuplicateLabels =
    ExportDeclaration.prototype.ContainsDuplicateLabels = function(labelSet) {
        return false;
    }
