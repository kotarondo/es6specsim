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

function Production() {}
Production.prototype.toString = void 0;

Production.prototype.setPosition = function(pos) {
    this.position = pos;
    return this;
}

Production.prototype.getPosition = function() {
    if (this.position >= 0) {
        return this.position;
    }
    if (this.chain) {
        return this.chain.getPosition();
    }
    Assert();
}

Expression.prototype = new Production();

function Expression() {
    //pseudo class
}

Statement.prototype = new Production();

function Statement() {
    //pseudo class
}

Declaration.prototype = new Production();

function Declaration() {
    //pseudo class
}

IdentifierReference.prototype = new Expression();

function IdentifierReference(SV) {
    AssertEquals(typeof SV, "string");
    this.SV = SV;
}
IdentifierReference.prototype.toString = function() {
    return this.SV;
}

BindingIdentifier.prototype = new Production();

function BindingIdentifier(SV) {
    AssertEquals(typeof SV, "string");
    this.SV = SV;
}
BindingIdentifier.prototype.toString = function() {
    return this.SV;
}

LabelIdentifier.prototype = new Production();

function LabelIdentifier(SV) {
    AssertEquals(typeof SV, "string");
    this.SV = SV;
}
LabelIdentifier.prototype.toString = function() {
    return this.SV;
}

ThisExpression.prototype = new Expression();

function ThisExpression() {}

LiteralExpression.prototype = new Expression();

function LiteralExpression(value) {
    Assert(value === null || typeof value !== "object");
    this.value = value;
}

RegularExpressionLiteral.prototype = new Expression();

function RegularExpressionLiteral(BodyText, FlagText) {
    AssertEquals(typeof BodyText, "string");
    AssertEquals(typeof FlagText, "string");
    this.BodyText = BodyText;
    this.FlagText = FlagText;
}

ArrayLiteral.prototype = new Expression();

function ArrayLiteral(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

Elision.prototype = new Production();

function Elision(ElisionWidth) {
    AssertEquals(typeof ElisionWidth, "number");
    this.ElisionWidth = ElisionWidth;
}

SpreadElement.prototype = new Production();

function SpreadElement(AssignmentExpression) {
    this.AssignmentExpression = AssignmentExpression;
    this.chain = AssignmentExpression;
}

ObjectLiteral.prototype = new Expression();

function ObjectLiteral(PropertyDefinitionList) {
    this.PropertyDefinitionList = PropertyDefinitionList;
    this.chain = PropertyDefinitionList;
}

PropertyDefinitionList.prototype = new Production();

function PropertyDefinitionList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

PropertyDefinition.prototype = new Production();

function PropertyDefinition() {
    //abstract class
}

PropertyDefinitionByReference.prototype = new PropertyDefinition();

function PropertyDefinitionByReference(IdentifierReference) {
    this.IdentifierReference = IdentifierReference;
    this.chain = IdentifierReference;
}

CoverInitializedName.prototype = new PropertyDefinition();

function CoverInitializedName() {}

PropertyDefinitionByName.prototype = new PropertyDefinition();

function PropertyDefinitionByName(PropertyName, AssignmentExpression) {
    this.PropertyName = PropertyName;
    this.AssignmentExpression = AssignmentExpression;
}

PropertyDefinitionByMethod.prototype = new PropertyDefinition();

function PropertyDefinitionByMethod(MethodDefinition) {
    this.MethodDefinition = MethodDefinition;
    this.chain = MethodDefinition;
}

PropertyName.prototype = new Production();

function PropertyName() {
    //abstract class
}

LiteralPropertyName.prototype = new PropertyName();

function LiteralPropertyName(SV) {
    AssertEquals(typeof SV, "string");
    this.SV = SV;
}

ComputedPropertyName.prototype = new PropertyName();

function ComputedPropertyName(AssignmentExpression) {
    this.AssignmentExpression = AssignmentExpression;
    this.chain = AssignmentExpression;
}

TemplateLiteral.prototype = new Expression();

function TemplateLiteral(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

TemplateToken.prototype = new Expression();

function TemplateToken(token) {
    AssertEquals(typeof token, "string");
    //TODO caching TV and TRV
}

PropertyAccessorByIndex.prototype = new Expression();

function PropertyAccessorByIndex(expr, Expression) {
    this.expr = expr;
    this.Expression = Expression;
}

PropertyAccessorByName.prototype = new Expression();

function PropertyAccessorByName(expr, SV) {
    AssertEquals(typeof SV, "string");
    this.expr = expr;
    this.SV = SV;
}

TaggedTemplate.prototype = new Expression();

function TaggedTemplate(expr, TemplateLiteral) {
    this.expr = expr;
    this.TemplateLiteral = TemplateLiteral;
}

NewTarget.prototype = new Expression();

function NewTarget() {}

NewOperator.prototype = new Expression();

function NewOperator(expr, Arguments) {
    this.expr = expr;
    this.Arguments = Arguments;
}

FunctionCall.prototype = new Expression();

function FunctionCall(expr, Arguments) {
    this.expr = expr;
    this.Arguments = Arguments;
}

SuperProperty.prototype = new Expression();

function SuperProperty() {
    //abstract class
}

SuperPropertyByIndex.prototype = new SuperProperty();

function SuperPropertyByIndex(Expression) {
    this.Expression = Expression;
    this.chain = Expression;
}

SuperPropertyByName.prototype = new SuperProperty();

function SuperPropertyByName(SV) {
    this.SV = SV;
}

SuperCall.prototype = new Expression();

function SuperCall(Arguments) {
    this.Arguments = Arguments;
    this.chain = Arguments;
}

Arguments.prototype = new Production();

function Arguments(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

SpreadArgument.prototype = new Production();

function SpreadArgument(AssignmentExpression) {
    this.AssignmentExpression = AssignmentExpression;
    this.chain = AssignmentExpression;
}

PostfixOperator.prototype = new Expression();

function PostfixOperator(expr, operator) {
    AssertEquals(typeof operator, "string");
    this.operator = operator;
    this.expr = expr;
    this.chain = expr;
}

UnaryOperator.prototype = new Expression();

function UnaryOperator(operator, expr) {
    AssertEquals(typeof operator, "string");
    this.operator = operator;
    this.expr = expr;
    this.chain = expr;
}

ConditionalOperator.prototype = new Expression();

function ConditionalOperator(expr, expr2, expr3) {
    this.expr = expr;
    this.expr2 = expr2;
    this.expr3 = expr3;
}

BinaryOperator.prototype = new Expression();

function BinaryOperator(expr, operator, expr2) {
    AssertEquals(typeof operator, "string");
    this.operator = operator;
    this.expr = expr;
    this.expr2 = expr2;
}

AssignmentOperator.prototype = new Expression();

function AssignmentOperator(expr, operator, expr2) {
    AssertEquals(typeof operator, "string");
    this.operator = operator;
    this.expr = expr;
    this.expr2 = expr2;
}

AssignmentPattern.prototype = new Production();

function AssignmentPattern() {
    //abstract class
}

ObjectAssignmentPattern.prototype = new AssignmentPattern();

function ObjectAssignmentPattern(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

ArrayAssignmentPattern.prototype = new AssignmentPattern();

function ArrayAssignmentPattern(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

AssignmentProperty.prototype = new Production();

function AssignmentProperty() {
    //abstract class
}

AssignmentPropertyByIdentifier.prototype = new AssignmentProperty();

function AssignmentPropertyByIdentifier(IdentifierReference, Initializer) {
    this.IdentifierReference = IdentifierReference;
    this.Initializer = Initializer;
}

AssignmentPropertyByName.prototype = new AssignmentProperty();

function AssignmentPropertyByName(PropertyName, AssignmentElement) {
    this.PropertyName = PropertyName;
    this.AssignmentElement = AssignmentElement;
}

AssignmentElement.prototype = new Production();

function AssignmentElement(DestructuringAssignmentTarget, Initializer) {
    this.DestructuringAssignmentTarget = DestructuringAssignmentTarget;
    this.Initializer = Initializer;
}

AssignmentRestElement.prototype = new Production();

function AssignmentRestElement(DestructuringAssignmentTarget) {
    this.DestructuringAssignmentTarget = DestructuringAssignmentTarget;
    this.chain = DestructuringAssignmentTarget;
}

CommaOperator.prototype = new Expression();

function CommaOperator(expr, expr2) {
    this.expr = expr;
    this.expr2 = expr2;
}

BlockStatement.prototype = new Statement();

function BlockStatement(Block) {
    this.Block = Block;
    this.chain = Block;
}

Block.prototype = new Production();

function Block(StatementList) {
    this.StatementList = StatementList;
    this.chain = StatementList;
}

StatementList.prototype = new Production();

function StatementList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

StatementListItem.prototype = new Production();

function StatementListItem() {
    //abstract class
}

StatementListItemOfStatement.prototype = new StatementListItem();

function StatementListItemOfStatement(Statement) {
    this.Statement = Statement;
    this.chain = Statement;
}

StatementListItemOfDeclaration.prototype = new StatementListItem();

function StatementListItemOfDeclaration(Declaration) {
    this.Declaration = Declaration;
    this.chain = Declaration;
}

LexicalDeclaration.prototype = new Declaration();

function LexicalDeclaration(LetOrConst, BindingList) {
    AssertEquals(typeof LetOrConst, "string");
    this.LetOrConst = LetOrConst;
    this.BindingList = BindingList;
}

BindingList.prototype = new Production();

function BindingList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

LexicalBinding.prototype = new Production();

function LexicalBinding() {
    //abstract class
}

LexicalBindingByIdentifier.prototype = new LexicalBinding();

function LexicalBindingByIdentifier(BindingIdentifier, Initializer) {
    this.BindingIdentifier = BindingIdentifier;
    this.Initializer = Initializer;
}

LexicalBindingByPattern.prototype = new LexicalBinding();

function LexicalBindingByPattern(BindingPattern, Initializer) {
    this.BindingPattern = BindingPattern;
    this.Initializer = Initializer;
}

VariableStatement.prototype = new Statement();

function VariableStatement(VariableDeclarationList) {
    this.VariableDeclarationList = VariableDeclarationList;
    this.chain = VariableDeclarationList;
}

VariableDeclarationList.prototype = new Production();

function VariableDeclarationList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

VariableDeclaration.prototype = new Production();

function VariableDeclaration() {
    //abstract class
}

VariableDeclarationByIdentifier.prototype = new VariableDeclaration();

function VariableDeclarationByIdentifier(BindingIdentifier, Initializer) {
    this.BindingIdentifier = BindingIdentifier;
    this.Initializer = Initializer;
}

VariableDeclarationByPattern.prototype = new VariableDeclaration();

function VariableDeclarationByPattern(BindingPattern, Initializer) {
    this.BindingPattern = BindingPattern;
    this.Initializer = Initializer;
}

BindingPattern.prototype = new Production();

function BindingPattern() {
    //abstract class
}

ArrayBindingPattern.prototype = new BindingPattern();

function ArrayBindingPattern(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

ObjectBindingPattern.prototype = new BindingPattern();

function ObjectBindingPattern(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

BindingProperty.prototype = new Production();

function BindingProperty(PropertyName, BindingElement) {
    this.PropertyName = PropertyName;
    this.BindingElement = BindingElement;
}

BindingElement.prototype = new Production();

function BindingElement(BindingPattern, Initializer) {
    this.BindingPattern = BindingPattern;
    this.Initializer = Initializer;
}

SingleNameBinding.prototype = new Production();

function SingleNameBinding(BindingIdentifier, Initializer) {
    this.BindingIdentifier = BindingIdentifier;
    this.Initializer = Initializer;
}

BindingRestElement.prototype = new Production();

function BindingRestElement(BindingIdentifier) {
    this.BindingIdentifier = BindingIdentifier;
    this.chain = BindingIdentifier;
}

EmptyStatement.prototype = new Statement();

function EmptyStatement() {}

ExpressionStatement.prototype = new Statement();

function ExpressionStatement(Expression) {
    this.Expression = Expression;
    this.chain = Expression;
}

IfStatement.prototype = new Statement();

function IfStatement(Expression, Statement, Statement2) {
    this.Expression = Expression;
    this.Statement = Statement;
    this.Statement2 = Statement2;
}

DoStatement.prototype = new Statement();

function DoStatement(Statement, Expression) {
    this.Statement = Statement;
    this.Expression = Expression;
}

WhileStatement.prototype = new Statement();

function WhileStatement(Expression, Statement) {
    this.Expression = Expression;
    this.Statement = Statement;
}

ForStatement.prototype = new Statement();

function ForStatement(type, head, Expression, Expression2, Statement) {
    AssertEquals(typeof type, "string");
    this.type = type;
    this.head = head;
    this.Expression = Expression;
    this.Expression2 = Expression2;
    this.Statement = Statement;
}

ForInStatement.prototype = new Statement();

function ForInStatement(type, head, Expression, Statement) {
    AssertEquals(typeof type, "string");
    this.type = type;
    this.head = head;
    this.Expression = Expression;
    this.Statement = Statement;
}

ForOfStatement.prototype = new Statement();

function ForOfStatement(type, head, AssignmentExpression, Statement) {
    AssertEquals(typeof type, "string");
    this.type = type;
    this.head = head;
    this.AssignmentExpression = AssignmentExpression;
    this.Statement = Statement;
}

ContinueStatement.prototype = new Statement();

function ContinueStatement(LabelIdentifier) {
    this.LabelIdentifier = LabelIdentifier;
    this.chain = LabelIdentifier; // maybe undefined
}

BreakStatement.prototype = new Statement();

function BreakStatement(LabelIdentifier) {
    this.LabelIdentifier = LabelIdentifier;
    this.chain = LabelIdentifier; // maybe undefined
}

ReturnStatement.prototype = new Statement();

function ReturnStatement(Expression) {
    this.Expression = Expression;
    this.chain = Expression; // maybe undefined
}

WithStatement.prototype = new Statement();

function WithStatement(Expression, Statement) {
    this.Expression = Expression;
    this.Statement = Statement;
}

SwitchStatement.prototype = new Statement();

function SwitchStatement(Expression, CaseBlock) {
    this.Expression = Expression;
    this.CaseBlock = CaseBlock;
}

CaseBlock.prototype = new Production();

function CaseBlock(CaseClauses, DefaultClause, CaseClauses2) {
    this.CaseClauses = CaseClauses;
    this.DefaultClause = DefaultClause;
    this.CaseClauses2 = CaseClauses2;
}

CaseClauses.prototype = new Production();

function CaseClauses(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

CaseClause.prototype = new Production();

function CaseClause(Expression, StatementList) {
    this.Expression = Expression;
    this.StatementList = StatementList;
}

DefaultClause.prototype = new Production();

function DefaultClause(StatementList) {
    this.StatementList = StatementList;
    this.chain = StatementList;
}

LabelledStatement.prototype = new Statement();

function LabelledStatement(LabelIdentifier, LabelledItem) {
    this.LabelIdentifier = LabelIdentifier;
    this.LabelledItem = LabelledItem;
}

ThrowStatement.prototype = new Statement();

function ThrowStatement(Expression) {
    this.Expression = Expression;
    this.chain = Expression;
}

TryStatement.prototype = new Statement();

function TryStatement(Block, CatchParameter, Block2, Block3) {
    this.Block = Block;
    this.CatchParameter = CatchParameter;
    this.Block2 = Block2;
    this.Block3 = Block3;
}

DebuggerStatement.prototype = new Statement();

function DebuggerStatement() {}

FunctionDeclaration.prototype = new Declaration();

function FunctionDeclaration(BindingIdentifier, FormalParameters, FunctionBody) {
    this.BindingIdentifier = BindingIdentifier;
    this.FormalParameters = FormalParameters;
    this.FunctionBody = FunctionBody;
}

FunctionExpression.prototype = new Expression();

function FunctionExpression(BindingIdentifier, FormalParameters, FunctionBody) {
    this.BindingIdentifier = BindingIdentifier;
    this.FormalParameters = FormalParameters;
    this.FunctionBody = FunctionBody;
}

FormalParameters.prototype = new Production();

function FormalParameters(FormalParameterList) {
    this.FormalParameterList = FormalParameterList;
    this.chain = FormalParameterList;
}

FormalParameterList.prototype = new Production();

function FormalParameterList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

FunctionBody.prototype = new Production();

function FunctionBody(FunctionStatementList) {
    this.FunctionStatementList = FunctionStatementList;
    this.chain = FunctionStatementList;
}

FunctionStatementList.prototype = new Production();

function FunctionStatementList(StatementList) {
    this.StatementList = StatementList;
    this.chain = StatementList;
}

ArrowFunction.prototype = new Expression();

function ArrowFunction(ArrowParameters, ConciseBody) {
    this.ArrowParameters = ArrowParameters;
    this.ConciseBody = ConciseBody;
}

SingleArrowParameter.prototype = new Production();

function SingleArrowParameter(BindingIdentifier) {
    this.BindingIdentifier = BindingIdentifier;
    this.chain = BindingIdentifier;
}

ConciseBody.prototype = new Production();

function ConciseBody(AssignmentExpression) {
    this.AssignmentExpression = AssignmentExpression;
    this.chain = AssignmentExpression;
}

MethodDefinition.prototype = new Production();

function MethodDefinition() {
    //abstract class
}

MethodDefinitionNormal.prototype = new MethodDefinition();

function MethodDefinitionNormal(PropertyName, StrictFormalParameters, FunctionBody) {
    this.PropertyName = PropertyName;
    this.StrictFormalParameters = StrictFormalParameters;
    this.FunctionBody = FunctionBody;
}

MethodDefinitionGet.prototype = new MethodDefinition();

function MethodDefinitionGet(PropertyName, FunctionBody) {
    this.PropertyName = PropertyName;
    this.FunctionBody = FunctionBody;
}

MethodDefinitionSet.prototype = new MethodDefinition();

function MethodDefinitionSet(PropertyName, PropertySetParameterList, FunctionBody) {
    this.PropertyName = PropertyName;
    this.PropertySetParameterList = PropertySetParameterList;
    this.FunctionBody = FunctionBody;
}

GeneratorMethod.prototype = new MethodDefinition();

function GeneratorMethod(PropertyName, StrictFormalParameters, GeneratorBody) {
    this.PropertyName = PropertyName;
    this.StrictFormalParameters = StrictFormalParameters;
    this.GeneratorBody = GeneratorBody;
}

GeneratorDeclaration.prototype = new Declaration();

function GeneratorDeclaration(BindingIdentifier, FormalParameters, GeneratorBody) {
    this.BindingIdentifier = BindingIdentifier;
    this.FormalParameters = FormalParameters;
    this.GeneratorBody = GeneratorBody;
}

GeneratorExpression.prototype = new Expression();

function GeneratorExpression(BindingIdentifier, FormalParameters, GeneratorBody) {
    this.BindingIdentifier = BindingIdentifier;
    this.FormalParameters = FormalParameters;
    this.GeneratorBody = GeneratorBody;
}

YieldExpression.prototype = new Expression();

function YieldExpression(Expression) {
    this.Expression = Expression;
    this.chain = Expression; // maybe undefined
}

YieldStarExpression.prototype = new Expression();

function YieldStarExpression(Expression) {
    this.Expression = Expression;
    this.chain = Expression;
}

ClassDeclaration.prototype = new Declaration();

function ClassDeclaration(BindingIdentifier, Expression, ClassBody) {
    this.BindingIdentifier = BindingIdentifier;
    this.Expression = Expression;
    this.ClassBody = ClassBody;
}

ClassExpression.prototype = new Expression();

function ClassExpression(BindingIdentifier, Expression, ClassBody) {
    this.BindingIdentifier = BindingIdentifier; // maybe undefined
    this.Expression = Expression; // maybe undefined
    this.ClassBody = ClassBody;
}

ClassBody.prototype = new Production();

function ClassBody(ClassElementList) {
    this.ClassElementList = ClassElementList;
    this.chain = ClassElementList;
}

ClassElementList.prototype = new Production();

function ClassElementList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

Script.prototype = new Production();

function Script(ScriptBody) {
    this.ScriptBody = ScriptBody;
    this.chain = ScriptBody;
}

ScriptBody.prototype = new Production();

function ScriptBody(StatementList) {
    this.StatementList = StatementList;
    this.chain = StatementList;
}

Module.prototype = new Production();

function Module(ModuleBody) {
    this.ModuleBody = ModuleBody;
    this.chain = ModuleBody;
}

ModuleBody.prototype = new Production();

function ModuleBody(ModuleItemList) {
    this.ModuleItemList = ModuleItemList;
    this.chain = ModuleItemList;
}

ModuleItemList.prototype = new Production();

function ModuleItemList(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

ImportDeclaration.prototype = new Production();

function ImportDeclaration() {
    //abstract class
}

ImportDeclarationByClause.prototype = new ImportDeclaration();

function ImportDeclarationByClause(ImportClause, FromClause) {
    this.ImportClause = ImportClause;
    this.FromClause = FromClause;
}

ImportDeclarationBySpecifier.prototype = new ImportDeclaration();

function ImportDeclarationBySpecifier(ModuleSpecifier) {
    this.ModuleSpecifier = ModuleSpecifier;
    this.chain = ModuleSpecifier;
}

ImportClause.prototype = new Production();

function ImportClause() {
    //abstract class
}

ImportClauseByDefault.prototype = new ImportClause();

function ImportClauseByDefault(ImportedDefaultBinding) {
    this.ImportedDefaultBinding = ImportedDefaultBinding;
    this.chain = ImportedDefaultBinding;
}

ImportClauseBySpace.prototype = new ImportClause();

function ImportClauseBySpace(NameSpaceImport) {
    this.NameSpaceImport = NameSpaceImport;
    this.chain = NameSpaceImport;
}

ImportClauseByNamed.prototype = new ImportClause();

function ImportClauseByNamed(NamedImports) {
    this.NamedImports = NamedImports;
    this.chain = NamedImports;
}

ImportClauseBySpaceWithDefault.prototype = new ImportClause();

function ImportClauseBySpaceWithDefault(ImportedDefaultBinding, NameSpaceImport) {
    this.ImportedDefaultBinding = ImportedDefaultBinding;
    this.NameSpaceImport = NameSpaceImport;
}

ImportClauseByNamedWithDefault.prototype = new ImportClause();

function ImportClauseByNamedWithDefault(ImportedDefaultBinding, NamedImports) {
    this.ImportedDefaultBinding = ImportedDefaultBinding;
    this.NamedImports = NamedImports;
}

NamedImports.prototype = new Production();

function NamedImports(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

ImportSpecifier.prototype = new Production();

function ImportSpecifier(IdentifierName, ImportedBinding) {
    if (IdentifierName) AssertEquals(typeof IdentifierName, "string");
    this.IdentifierName = IdentifierName; // maybe undefined
    this.ImportedBinding = ImportedBinding;
}

ModuleSpecifier.prototype = new Production();

function ModuleSpecifier(StringLiteral) {
    AssertEquals(typeof StringLiteral, "string");
    this.StringLiteral = StringLiteral;
}

ExportDeclaration.prototype = new Production();

function ExportDeclaration() {
    //abstract class
}

ExportDeclarationAllFrom.prototype = new ExportDeclaration();

function ExportDeclarationAllFrom(FromClause) {
    this.FromClause = FromClause;
    this.chain = FromClause;
}

ExportDeclarationByClauseFrom.prototype = new ExportDeclaration();

function ExportDeclarationByClauseFrom(ExportClause, FromClause) {
    this.ExportClause = ExportClause;
    this.FromClause = FromClause;
}

ExportDeclarationByClause.prototype = new ExportDeclaration();

function ExportDeclarationByClause(ExportClause) {
    this.ExportClause = ExportClause;
    this.chain = ExportClause;
}

ExportDeclarationByVariable.prototype = new ExportDeclaration();

function ExportDeclarationByVariable(VariableStatement) {
    this.VariableStatement = VariableStatement;
    this.chain = VariableStatement;
}

ExportDeclarationByDeclaration.prototype = new ExportDeclaration();

function ExportDeclarationByDeclaration(Declaration) {
    this.Declaration = Declaration;
    this.chain = Declaration;
}

ExportDeclarationDefaultByHoistable.prototype = new ExportDeclaration();

function ExportDeclarationDefaultByHoistable(HoistableDeclaration) {
    this.HoistableDeclaration = HoistableDeclaration;
    this.chain = HoistableDeclaration;
}

ExportDeclarationDefaultByClass.prototype = new ExportDeclaration();

function ExportDeclarationDefaultByClass(ClassDeclaration) {
    this.ClassDeclaration = ClassDeclaration;
    this.chain = ClassDeclaration;
}

ExportDeclarationDefaultByExpression.prototype = new ExportDeclaration();

function ExportDeclarationDefaultByExpression(AssignmentExpression) {
    this.AssignmentExpression = AssignmentExpression;
    this.chain = AssignmentExpression;
}

ExportClause.prototype = new Production();

function ExportClause(list) {
    AssertInstanceof(list, Array);
    this.list = list;
}

ExportSpecifier.prototype = new Production();

function ExportSpecifier(IdentifierName, IdentifierName2) {
    AssertEquals(typeof IdentifierName, "string");
    if (IdentifierName2) AssertEquals(typeof IdentifierName2, "string");
    this.IdentifierName = IdentifierName;
    this.IdentifierName2 = IdentifierName2; // maybe undefined
}
