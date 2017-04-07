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

Production.prototype.IsValidSimpleAssignmentTarget = function() {
    if (this.chain) {
        return this.chain.IsValidSimpleAssignmentTarget();
    }
    Assert();
}

// 12.1.3

IdentifierReference.prototype.IsValidSimpleAssignmentTarget = function() {
    if (this.strict && (this.SV === "eval" || this.SV === "arguments")) {
        return false;
    }
    return true;
}

// 12.2.1.5

ThisExpression.prototype.IsValidSimpleAssignmentTarget =
    LiteralExpression.prototype.IsValidSimpleAssignmentTarget =
    ArrayLiteral.prototype.IsValidSimpleAssignmentTarget =
    ObjectLiteral.prototype.IsValidSimpleAssignmentTarget =
    FunctionExpression.prototype.IsValidSimpleAssignmentTarget =
    ClassExpression.prototype.IsValidSimpleAssignmentTarget =
    GeneratorExpression.prototype.IsValidSimpleAssignmentTarget =
    RegularExpressionLiteral.prototype.IsValidSimpleAssignmentTarget =
    TemplateLiteral.prototype.IsValidSimpleAssignmentTarget = function() {
        return false;
    }

// 12.3.1.5

PropertyAccessorByIndex.prototype.IsValidSimpleAssignmentTarget =
    PropertyAccessorByName.prototype.IsValidSimpleAssignmentTarget =
    SuperProperty.prototype.IsValidSimpleAssignmentTarget = function() {
        return true;
    }

FunctionCall.prototype.IsValidSimpleAssignmentTarget =
    SuperCall.prototype.IsValidSimpleAssignmentTarget =
    TaggedTemplate.prototype.IsValidSimpleAssignmentTarget =
    NewOperator.prototype.IsValidSimpleAssignmentTarget =
    NewTarget.prototype.IsValidSimpleAssignmentTarget = function() {
        return false;
    }

// 12.4.3

PostfixOperator.prototype.IsValidSimpleAssignmentTarget = function() {
    return false;
}

// 12.5.3

UnaryOperator.prototype.IsValidSimpleAssignmentTarget = function() {
    return false;
}

// 12.6.2
// 12.7.2
// 12.8.2
// 12.9.2
// 12.10.2
// 12.11.2
// 12.12.2

BinaryOperator.prototype.IsValidSimpleAssignmentTarget = function() {
    return false;
}

// 12.13.2

ConditionalOperator.prototype.IsValidSimpleAssignmentTarget = function() {
    return false;
}

// 12.14.3

YieldExpression.prototype.IsValidSimpleAssignmentTarget =
    YieldStarExpression.prototype.IsValidSimpleAssignmentTarget =
    ArrowFunction.prototype.IsValidSimpleAssignmentTarget =
    AssignmentOperator.prototype.IsValidSimpleAssignmentTarget = function() {
        return false;
    }

// 12.15.2

CommaOperator.prototype.IsValidSimpleAssignmentTarget = function() {
    return false;
}
