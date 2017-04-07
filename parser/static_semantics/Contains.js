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

Production.prototype.Contains = function(symbol) {
    if (this.chain) {
        return this.chain.Contains(symbol);
    }
    Assert();
}

// returns a production found instead of "true"

/*
Supports Only:
	Contains SuperProperty
	Contains SuperCall
	Contains YieldExpression 
	Contains super
	Contains this
	Contains NewTarget
	Contains CoverInitializedName
*/

function ContainsOnList(symbol) {
    var d;
    var list = this.list;
    for (var i = 0; i < list.length; i++) {
        if (d = list[i].Contains(symbol)) return d;
    }
    return false;
}

// Implicit

IdentifierReference.prototype.Contains = function(symbol) {
    return false;
}

BindingIdentifier.prototype.Contains = function(symbol) {
    return false;
}

LabelIdentifier.prototype.Contains = function(symbol) {
    return false;
}

ThisExpression.prototype.Contains = function(symbol) {
    if (symbol === "this") {
        return this;
    }
    return false;
}

LiteralExpression.prototype.Contains = function(symbol) {
    return false;
}

RegularExpressionLiteral.prototype.Contains = function(symbol) {
    return false;
}

ArrayLiteral.prototype.Contains = ContainsOnList;

Elision.prototype.Contains = function(symbol) {
    return false;
}

PropertyDefinitionList.prototype.Contains = ContainsOnList;

CoverInitializedName.prototype.Contains = function(symbol) {
    if (symbol === "CoverInitializedName") {
        return this;
    }
    return false;
}

PropertyDefinitionByName.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.AssignmentExpression.Contains(symbol)) return d;
    return false;
}

// 12.2.6.3

PropertyDefinitionByMethod.prototype.Contains = function(symbol) {
    return this.MethodDefinition.ComputedPropertyContains(symbol);
}

LiteralPropertyName.prototype.Contains = function(symbol) {
    return false;
}

// Implicit

TemplateLiteral.prototype.Contains = ContainsOnList;

TemplateToken.prototype.Contains = function(symbol) {
    return false;
}

PropertyAccessorByIndex.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.Expression.Contains(symbol)) return d;
    return false;
}

PropertyAccessorByName.prototype.Contains = function(symbol) {
    return this.expr.Contains(symbol);
}

TaggedTemplate.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.TemplateLiteral.Contains(symbol)) return d;
    return false;
}

NewTarget.prototype.Contains = function(symbol) {
    if (symbol === "NewTarget") {
        return this;
    }
}

NewOperator.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (this.Arguments && (d = this.Arguments.Contains(symbol))) return d;
    return false;
}

FunctionCall.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.Arguments.Contains(symbol)) return d;
    return false;
}

SuperPropertyByIndex.prototype.Contains = function(symbol) {
    if (symbol === "SuperProperty" || symbol === "super") {
        return this;
    }
    return this.chain.Contains(symbol);
}

SuperPropertyByName.prototype.Contains = function(symbol) {
    if (symbol === "SuperProperty" || symbol === "super") {
        return this;
    }
    return false;
}

SuperCall.prototype.Contains = function(symbol) {
    if (symbol === "SuperCall" || symbol === "super") {
        return this;
    }
    return this.chain.Contains(symbol);
}

Arguments.prototype.Contains = ContainsOnList;

ConditionalOperator.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.expr2.Contains(symbol)) return d;
    if (d = this.expr3.Contains(symbol)) return d;
    return false;
}

BinaryOperator.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.expr2.Contains(symbol)) return d;
    return false;
}

AssignmentOperator.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.expr2.Contains(symbol)) return d;
    return false;
}

ObjectAssignmentPattern.prototype.Contains = ContainsOnList;

ArrayAssignmentPattern.prototype.Contains = ContainsOnList;

AssignmentPropertyByIdentifier.prototype.Contains = function(symbol) {
    var d;
    if (d = this.IdentifierReference.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

AssignmentPropertyByName.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.AssignmentElement.Contains(symbol)) return d;
    return false;
}

AssignmentElement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.DestructuringAssignmentTarget.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

CommaOperator.prototype.Contains = function(symbol) {
    var d;
    if (d = this.expr.Contains(symbol)) return d;
    if (d = this.expr2.Contains(symbol)) return d;
    return false;
}

StatementList.prototype.Contains = ContainsOnList;

LexicalDeclaration.prototype.Contains = function(symbol) {
    return this.BindingList.Contains(symbol);
}

BindingList.prototype.Contains = ContainsOnList;

LexicalBindingByIdentifier.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingIdentifier.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

LexicalBindingByPattern.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingPattern.Contains(symbol)) return d;
    if (d = this.Initializer.Contains(symbol)) return d;
    return false;
}

VariableDeclarationList.prototype.Contains = ContainsOnList;

VariableDeclarationByIdentifier.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingIdentifier.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

VariableDeclarationByPattern.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingPattern.Contains(symbol)) return d;
    if (d = this.Initializer.Contains(symbol)) return d;
    return false;
}

ArrayBindingPattern.prototype.Contains = ContainsOnList;

ObjectBindingPattern.prototype.Contains = ContainsOnList;

BindingProperty.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.BindingElement.Contains(symbol)) return d;
    return false;
}

BindingElement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingPattern.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

SingleNameBinding.prototype.Contains = function(symbol) {
    var d;
    if (d = this.BindingIdentifier.Contains(symbol)) return d;
    if (this.Initializer && (d = this.Initializer.Contains(symbol))) return d;
    return false;
}

EmptyStatement.prototype.Contains = function(symbol) {
    return false;
}

IfStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    if (this.Statement2 && (d = this.Statement2.Contains(symbol))) return d;
    return false;
}

DoStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

WhileStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

ForStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.head && (d = this.head.Contains(symbol))) return d;
    if (this.Expression && (d = this.Expression.Contains(symbol))) return d;
    if (this.Expression2 && (d = this.Expression2.Contains(symbol))) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

ForInStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.head && (d = this.head.Contains(symbol))) return d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

ForOfStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.head && (d = this.head.Contains(symbol))) return d;
    if (d = this.AssignmentExpression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

ContinueStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.chain && (d = this.chain.Contains(symbol))) return d;
    return false;
}

BreakStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.chain && (d = this.chain.Contains(symbol))) return d;
    return false;
}

ReturnStatement.prototype.Contains = function(symbol) {
    var d;
    if (this.chain && (d = this.chain.Contains(symbol))) return d;
    return false;
}

WithStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.Statement.Contains(symbol)) return d;
    return false;
}

SwitchStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.CaseBlock.Contains(symbol)) return d;
    return false;
}

CaseBlock.prototype.Contains = function(symbol) {
    var d;
    if (d = this.CaseClauses.Contains(symbol)) return d;
    if (this.DefaultClause && (d = this.DefaultClause.Contains(symbol))) return d;
    if (this.CaseClauses2 && (d = this.CaseClauses2.Contains(symbol))) return d;
    return false;
}

CaseClauses.prototype.Contains = ContainsOnList;

CaseClause.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Expression.Contains(symbol)) return d;
    if (d = this.StatementList.Contains(symbol)) return d;
    return false;
}

LabelledStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.LabelIdentifier.Contains(symbol)) return d;
    if (d = this.LabelledItem.Contains(symbol)) return d;
    return false;
}

TryStatement.prototype.Contains = function(symbol) {
    var d;
    if (d = this.Block.Contains(symbol)) return d;
    if (this.CatchParameter && (d = this.CatchParameter.Contains(symbol))) return d;
    if (this.Block2 && (d = this.Block2.Contains(symbol))) return d;
    if (this.Block3 && (d = this.Block3.Contains(symbol))) return d;
    return false;
}

// 14.1.4

FunctionDeclaration.prototype.Contains =
    FunctionExpression.prototype.Contains = function(symbol) {
        return false;
    }

// Implicit

FormalParameterList.prototype.Contains = ContainsOnList;

// 14.2.3

ArrowFunction.prototype.Contains = function(symbol) {
    switch (symbol) {
        case "NewTarget":
        case "SuperProperty":
        case "SuperCall":
        case "super":
        case "this":
            break;
        default:
            return false;
    }
    var d;
    if (d = this.ArrowParameters.Contains(symbol)) return d;
    return this.ConciseBody.Contains(symbol);
}

// Implicit

MethodDefinitionNormal.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.StrictFormalParameters.Contains(symbol)) return d;
    if (d = this.FunctionBody.Contains(symbol)) return d;
    return false;
}

MethodDefinitionGet.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.FunctionBody.Contains(symbol)) return d;
    return false;
}

MethodDefinitionSet.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.PropertySetParameterList.Contains(symbol)) return d;
    if (d = this.FunctionBody.Contains(symbol)) return d;
    return false;
}

GeneratorMethod.prototype.Contains = function(symbol) {
    var d;
    if (d = this.PropertyName.Contains(symbol)) return d;
    if (d = this.StrictFormalParameters.Contains(symbol)) return d;
    if (d = this.GeneratorBody.Contains(symbol)) return d;
    return false;
}

// 14.4.4

GeneratorDeclaration.prototype.Contains = function(symbol) {
    return false;
}

GeneratorExpression.prototype.Contains = function(symbol) {
    return false;
}

// Implicit

YieldExpression.prototype.Contains = function(symbol) {
    if (symbol === "YieldExpression") {
        return this;
    }
    var d;
    if (this.chain && (d = this.chain.Contains(symbol))) return d;
    return false;
}

YieldStarExpression.prototype.Contains = function(symbol) {
    if (symbol === "YieldExpression") {
        return this;
    }
    var d;
    if (this.chain && (d = this.chain.Contains(symbol))) return d;
    return false;
}

// 14.5.4

ClassDeclaration.prototype.Contains = function(symbol) {
    var d;
    if (this.BindingIdentifier && (d = this.BindingIdentifier.Contains(symbol))) return d;
    if (this.Expression && (d = this.Expression.Contains(symbol))) return d;
    if (d = this.ClassBody.ComputedPropertyContains(symbol)) return d;
    return false;
}

ClassExpression.prototype.Contains = function(symbol) {
    var d;
    if (this.BindingIdentifier && (d = this.BindingIdentifier.Contains(symbol))) return d;
    if (this.Expression && (d = this.Expression.Contains(symbol))) return d;
    if (d = this.ClassBody.ComputedPropertyContains(symbol)) return d;
    return false;
}

// Implicit

ClassElementList.prototype.Contains = ContainsOnList;

ModuleItemList.prototype.Contains = ContainsOnList;

ImportDeclarationByClause.prototype.Contains = function(symbol) {
    var d;
    if (d = this.ImportClause.Contains(symbol)) return d;
    if (d = this.FromClause.Contains(symbol)) return d;
    return false;
}

ImportClauseBySpaceWithDefault.prototype.Contains = function(symbol) {
    var d;
    if (d = this.ImportedDefaultBinding.Contains(symbol)) return d;
    if (d = this.NameSpaceImport.Contains(symbol)) return d;
    return false;
}

ImportClauseByNamedWithDefault.prototype.Contains = function(symbol) {
    var d;
    if (d = this.ImportedDefaultBinding.Contains(symbol)) return d;
    if (d = this.NamedImports.Contains(symbol)) return d;
    return false;
}

NamedImports.prototype.Contains = ContainsOnList;

ImportSpecifier.prototype.Contains = function(symbol) {
    return this.ImportedBinding.Contains(symbol);
}

ModuleSpecifier.prototype.Contains = function(symbol) {
    return false;
}

ExportDeclarationByClauseFrom.prototype.Contains = function(symbol) {
    var d;
    if (d = this.ExportClause.Contains(symbol)) return d;
    if (d = this.FromClause.Contains(symbol)) return d;
    return false;
}

ExportClause.prototype.Contains = ContainsOnList;

ExportSpecifier.prototype.Contains = function(symbol) {
    return false;
}
