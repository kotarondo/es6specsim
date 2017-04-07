require("./harness.js")
load("../unicode.js")
load("../sourcetext.js")
load("../tokenizer.js")
load("../production.js")
load("../expressions.js")
load("../functions.js")
load("../statements.js")
load("../modules.js")
load("../utility.js")
load("./load_static_semantics.js")

try {
    setParsingText("a=1; b=1;");
    Assert(parseModule() instanceof Module);
    AssertEquals(peekToken(), "");

    test_no_error(parseModule, [], "");
    test_no_error(parseModule, [], ";");
    test_no_error(parseModule, [], "" +
        "import 'b';" +
        "import a from 'c';" +
        "import * as b from 'c';" +
        "import {} from 'c';" +
        "import {c} from 'c';" +
        "import {d as e} from 'c';" +
        "import {f, g as h} from 'c';" +
        "import def1,* as i from 'c';" +
        "import def2,{j1 as j2, j3, j4 as j5 } from 'c';" +
        "export * from 'e';" +
        "export {} from 'e';" +
        "export {c} from 'e';" +
        "export {c as d} from 'e';" +
        "export {j1 as j2, j3, j4 as j5 } from 'c';" +
        "export {};" +
        "export var k;" +
        "export function f1(){};" +
        "export function*f2(){};" +
        "export class f3{};" +
        "export let f4;" +
        "export const f5=1;" +
        "export default function (){};"
    );
    test_no_error(parseModule, [], "export default function (){}");
    test_no_error(parseModule, [], "export default function* (){}");
    test_no_error(parseModule, [], "export default function a (){}");
    test_no_error(parseModule, [], "export default function*a (){}");
    test_no_error(parseModule, [], "export default class {}");
    test_no_error(parseModule, [], "export default class a{}");
    test_no_error(parseModule, [], "export default a+b");
    test_early_error(parseModule, [], "export default var a", false, "EarlySyntaxError", 1, 16);
    test_early_error(parseModule, [], "export default const a", false, "EarlySyntaxError", 1, 16);
    test_early_error(parseModule, [], "export default let", false, "EarlySyntaxError: 12.1.1-D: let", 1, 16);

    test_early_error(parseModule, [], "function a(){}; function a(){};", false, "EarlySyntaxError: 15.2.1.1-A: a", 1, 26);
    test_early_error(parseModule, [], "var a; function a(){}", false, "EarlySyntaxError: 15.2.1.1-B: a", 1, 5);
    test_early_error(parseModule, [], "var a;export { a, a,a };", false, "EarlySyntaxError: 15.2.1.1-C: a", 1, 19);
    test_early_error(parseModule, [], "export { a, a,a };var a;", false, "EarlySyntaxError: 15.2.1.1-C: a", 1, 13);
    test_early_error(parseModule, [], "export { a};export var a;", false, "EarlySyntaxError: 15.2.1.1-C: a", 1, 24);
    test_no_error(parseModule, [], "export { a};var a;");
    test_early_error(parseModule, [], "export { unre};", false, "EarlySyntaxError: 15.2.1.1-D: unre", 1, 10);
    test_no_error(parseModule, [], "export { unre};var unre");
    test_no_error(parseModule, [], "export { unre};let unre");
    test_no_error(parseModule, [], "export { unre};function unre(){}");
    test_early_error(parseModule, [], " super()", false, "EarlySyntaxError: 15.2.1.1-E", 1, 2);
    test_early_error(parseModule, [], " super[1]", false, "EarlySyntaxError: 15.2.1.1-E", 1, 2);
    test_early_error(parseModule, [], " a=super.a", false, "EarlySyntaxError: 15.2.1.1-E", 1, 4);
    test_no_error(parseModule, [], "a={super:1}");
    test_early_error(parseModule, [], "new.target", false, "EarlySyntaxError: 15.2.1.1-F", 1, 1);
    test_early_error(parseModule, [], "L:L:L:;", false, "EarlySyntaxError: 15.2.1.1-G: L", 1, 3);
    test_no_error(parseModule, [], "L:;L:;");
    test_early_error(parseModule, [], "break M;", false, "EarlySyntaxError: 15.2.1.1-H: M", 1, 7);
    test_early_error(parseModule, [], "for(;;)continue M;", false, "EarlySyntaxError: 15.2.1.1-I: M", 1, 17);
    test_early_error(parseModule, [], "while(false){continue A}", false, "EarlySyntaxError: 15.2.1.1-I: A", 1, 23);
    test_early_error(parseModule, [], "import{a,a,   a} from 'mod'", false, "EarlySyntaxError: 15.2.2.1: a", 1, 10);
    test_early_error(parseModule, [], "import{a,b as a} from 'mod'", false, "EarlySyntaxError: 15.2.2.1: a", 1, 15);
    test_no_error(parseModule, [], "import{a as a} from 'mod'");
    test_no_error(parseModule, [], "import{a} from 'a'");
    test_early_error(parseModule, [], "export{super}", false, "EarlySyntaxError: 15.2.3.1: super", 1, 8);
    test_early_error(parseModule, [], "export{super,super}", false, "EarlySyntaxError: 15.2.3.1: super", 1, 8);
    test_early_error(parseModule, [], "export{super1,interface}", false, "EarlySyntaxError: 15.2.3.1: interface", 1, 15);
    test_no_error(parseModule, [], "export{super} from 'a'");
    test_no_error(parseModule, [], "export{a as super};var a");
    test_no_error(parseModule, [], "export{a as super} from 'a'");

    test_early_error(parseModule, [], "export default function*(a){super()}", false, "EarlySyntaxError: 14.4.1-D", 1, 29);
    test_early_error(parseModule, [], "export default function*(a, a){}", false, "EarlySyntaxError: 14.1.2-H: a", 1, 29);
    test_early_error(parseModule, [], "export default function*f(a){super()}", false, "EarlySyntaxError: 14.4.1-D", 1, 30);
    test_early_error(parseModule, [], "export default function*f(a, a){}", false, "EarlySyntaxError: 14.1.2-H: a", 1, 30);

} catch (e) {
    if (e instanceof EarlyError) {
        console.log(e);
    }
    throw e;
}
