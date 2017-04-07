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

// 15 ECMAScript Language: Scripts and Modules

function isInDirectEvalCodeContainedInNonArrowFunction() {
    //TODO direct eval
    return false;
}

// 15.1 Scripts

function parseScript() {
    var body = parseScriptBody();
    validateEarlyError_15_1_1_AB(body);
    validateEarlyError_12_2_6_1_B(body);
    return new Script(body);
}

function parseScriptBody() {
    var saved = saveBodyContext();
    if (isInStrictMode() || containsUseStrictDirective()) {
        enterStrictMode();
    }
    var stmts = parseStatementList();
    if (peekToken() !== "") {
        throw new EarlySyntaxError();
    }
    validateEarlyError_15_1_1_C2G(stmts);
    if (isInStrictMode()) {
        leaveStrictMode();
    }
    restoreBodyContext(saved);
    return new ScriptBody(stmts);
}

function validateEarlyError_15_1_1_AB(ScriptBody) {
    var d;
    var names = ScriptBody.LexicallyDeclaredNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("15.1.1-A", d);
    }
    var names2 = ScriptBody.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("15.1.1-B", d);
    }
}

function validateEarlyError_15_1_1_C2G(StatementList) {
    var d;
    if (!isInDirectEvalCodeContainedInNonArrowFunction()) {
        if (d = StatementList.Contains("super")) {
            throw new EarlySyntaxError("15.1.1-C", d);
        }
        if (d = StatementList.Contains("NewTarget")) {
            throw new EarlySyntaxError("15.1.1-D", d);
        }
    }
    if (d = StatementList.ContainsDuplicateLabels([])) {
        throw new EarlySyntaxError("15.1.1-E", d);
    }
    if (d = StatementList.ContainsUndefinedBreakTarget([])) {
        throw new EarlySyntaxError("15.1.1-F", d);
    }
    if (d = StatementList.ContainsUndefinedContinueTarget([], [])) {
        throw new EarlySyntaxError("15.1.1-G", d);
    }
}

// 15.2 Modules

function parseModule() {
    var body = parseModuleBody();
    validateEarlyError_12_2_6_1_B(body);
    return new Module(body);
}

function parseModuleBody() {
    var saved = saveBodyContext();
    enterModule();
    enterStrictMode();
    var items = parseModuleItemList();
    validateEarlyError_15_2_1_1(items);
    leaveStrictMode();
    leaveModule();
    restoreBodyContext(saved);
    return new ModuleBody(items);
}

function parseModuleItemList() {
    var list = [];
    while (true) {
        switch (peekToken()) {
            case "":
                return new ModuleItemList(list);
        }
        var item = parseModuleItem();
        list.push(item);
    }
}

function parseModuleItem() {
    var pos = getParsingPosition();
    switch (peekToken()) {
        case "import":
            return parseImportDeclaration().setPosition(pos);
        case "export":
            return parseExportDeclaration().setPosition(pos);
    }
    return parseStatementListItem(!"Yield", !"Return");
}

function validateEarlyError_15_2_1_1(ModuleItemList) {
    var d;
    var names = ModuleItemList.LexicallyDeclaredNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("15.2.1.1-A", d);
    }
    var names2 = ModuleItemList.VarDeclaredNames();
    if (d = alsoOccursIn(names, names2)) {
        throw new EarlySyntaxError("15.2.1.1-B", d);
    }
    var names3 = ModuleItemList.ExportedNames();
    if (d = containsAnyDuplicateEntries(names3)) {
        throw new EarlySyntaxError("15.2.1.1-C", d);
    }
    var names4 = ModuleItemList.ExportedBindings();
    if (d = doesNotAlsoOccursIn(names4, names2.concat(names))) {
        throw new EarlySyntaxError("15.2.1.1-D", d);
    }
    if (d = ModuleItemList.Contains("super")) {
        throw new EarlySyntaxError("15.2.1.1-E", d);
    }
    if (d = ModuleItemList.Contains("NewTarget")) {
        throw new EarlySyntaxError("15.2.1.1-F", d);
    }
    if (d = ModuleItemList.ContainsDuplicateLabels([])) {
        throw new EarlySyntaxError("15.2.1.1-G", d);
    }
    if (d = ModuleItemList.ContainsUndefinedBreakTarget([])) {
        throw new EarlySyntaxError("15.2.1.1-H", d);
    }
    if (d = ModuleItemList.ContainsUndefinedContinueTarget([], [])) {
        throw new EarlySyntaxError("15.2.1.1-I", d);
    }
}

function validateEarlyError_15_2_2_1(ImportDeclaration) {
    var d;
    var names = ImportDeclaration.BoundNames();
    if (d = containsAnyDuplicateEntries(names)) {
        throw new EarlySyntaxError("15.2.2.1", d);
    }
}

// 15.2.2 Imports

function parseImportDeclaration() {
    proceedToken("import");
    if (isTokenStringLiteral(peekToken())) {
        var spec = parseModuleSpecifier();
        proceedAutoSemicolon();
        return new ImportDeclarationBySpecifier(spec);
    }
    var iclause = parseImportClause();
    var fclause = parseFromClause();
    proceedAutoSemicolon();
    var decl = new ImportDeclarationByClause(iclause, fclause);
    validateEarlyError_15_2_2_1(decl);
    return decl;
}

function parseImportClause() {
    switch (peekToken()) {
        case '*':
            var space = parseNameSpaceImport();
            return new ImportClauseBySpace(space);
        case '{':
            var named = parseNamedImports();
            return new ImportClauseByNamed(named);
    }
    var def = parseImportedDefaultBinding();
    if (peekToken() === ",") {
        proceedToken(",");
        switch (peekToken()) {
            case '*':
                var space = parseNameSpaceImport();
                return new ImportClauseBySpaceWithDefault(def, space);
            case '{':
                var named = parseNamedImports();
                return new ImportClauseByNamedWithDefault(def, named);
        }
        throw new EarlySyntaxError();
    }
    return new ImportClauseByDefault(def);
}

function parseImportedDefaultBinding() {
    return parseImportedBinding();
}

function parseNameSpaceImport() {
    proceedToken("*");
    proceedToken("as");
    return parseImportedBinding();
}

function parseNamedImports() {
    var list = [];
    proceedToken("{");
    while (true) {
        if (peekToken() === "}") break;
        var spec = parseImportSpecifier();
        list.push(spec);
        if (peekToken() === "}") break;
        proceedToken(",");
    }
    proceedToken("}");
    return new NamedImports(list);
}

function parseFromClause() {
    proceedToken("from");
    return parseModuleSpecifier();
}

function parseImportSpecifier() {
    var alias = peekToken();
    if (isTokenIdentifierName(alias) && nextToken() === "as") {
        proceedToken(alias);
        proceedToken("as");
    }
    var name = parseImportedBinding();
    return new ImportSpecifier(alias, name);
}

function parseModuleSpecifier() {
    var spec = peekToken();
    if (!isTokenStringLiteral(spec)) {
        throw new EarlySyntaxError();
    }
    proceedToken(spec);
    return new ModuleSpecifier(spec);
}

function parseImportedBinding() {
    return parseBindingIdentifier();
}

// 15.2.3 Exports

function parseExportDeclaration() {
    proceedToken("export");
    switch (peekToken()) {
        case "*":
            proceedToken("*");
            var fclause = parseFromClause();
            proceedAutoSemicolon();
            return new ExportDeclarationAllFrom(fclause);
        case "{":
            var clause = parseExportClause();
            if (peekToken() === "from") {
                var fclause = parseFromClause();
                proceedAutoSemicolon();
                return new ExportDeclarationByClauseFrom(clause, fclause);
            }
            proceedAutoSemicolon();
            validateEarlyError_15_2_3_1(clause);
            return new ExportDeclarationByClause(clause);
        case "var":
            var stmt = parseVariableStatement(!"Yield");
            return new ExportDeclarationByVariable(stmt);
        case "function":
        case "class":
        case "let":
        case "const":
            var decl = parseDeclaration(!"Yield");
            return new ExportDeclarationByDeclaration(decl);
    }
    proceedToken("default");
    switch (peekToken()) {
        case "function":
            var decl = parseHoistableDeclaration(!"Yield", "Default");
            return new ExportDeclarationDefaultByHoistable(decl);
        case "class":
            var decl = parseClassDeclaration(!"Yield", "Default");
            return new ExportDeclarationDefaultByClass(decl);
    }
    var expr = parseAssignmentExpression("In", !"Yield");
    return new ExportDeclarationDefaultByExpression(expr);
}

function parseExportClause() {
    var list = [];
    proceedToken("{");
    while (true) {
        if (peekToken() === "}") break;
        var spec = parseExportSpecifier();
        list.push(spec);
        if (peekToken() === "}") break;
        proceedToken(",");
    }
    proceedToken("}");
    return new ExportClause(list);
}

function parseExportSpecifier() {
    var pos = getParsingPosition();
    var name = peekToken();
    if (!isTokenIdentifierName(name)) {
        throw new EarlySyntaxError();
    }
    proceedToken(name);
    if (peekToken() === "as") {
        proceedToken("as");
        var pos2 = getParsingPosition();
        var name2 = peekToken();
        if (!isTokenIdentifierName(name2)) {
            throw new EarlySyntaxError();
        }
        proceedToken(name2);
    }
    var spec = new ExportSpecifier(name, name2).setPosition(pos);
    spec.position2 = pos2;
    return spec;
}

function validateEarlyError_15_2_3_1(ExportClause) {
    var names = ExportClause.ReferencedBindings();
    for (var i = 0; i < names.length; i++) {
        var n = names[i];
        var SV = n.toString();
        if (isReservedWord(SV)) {
            throw new EarlySyntaxError("15.2.3.1", n);
        }
        switch (SV) {
            case "implements":
            case "interface":
            case "let":
            case "package":
            case "private":
            case "protected":
            case "public":
            case "static":
            case "yield":
                throw new EarlySyntaxError("15.2.3.1", n);
        }
    }
}
