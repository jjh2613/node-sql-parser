import Tracer from "pegjs-backtrace";
const path = require("path");
import tiberoParser from "./tiberoParser";
import realTiberoParser from "../output/prod/build/tibero"
import pegjsParser from "../output/prod"


const log_gogo = (tree) => {
  console.log("origin tree")
  console.log(tree)
  // console.log("select tree")
  // console.log(tree.children[0].children[1].children[0].children[0].children[0])
  // console.log("where tree")
  // console.log(tree.children[0].children[1].children[0].children[0].children[0].children[10])
  // console.log("where - primary tree")
  // console.log(tree.children[0].children[1].children[0].children[0].children[0].children[10].children[2].children[0].children[1].children[0].children[0].children[0].children[0].children[0].children[0])
}


// const simpleString = "select abc1, abc2 from tab where tab1.abc1(+) = tab2.bcd1 or ddd1(+) = ggg(+)";
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2, "tab3", user1."tab4", user2."tab5", "user3".tab6, "user4"."tab7" WHERE ("aa".col1(+) = "bb"."col2" (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2 WHERE ("aa".col1(+) = "bb"."col2" (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2 WHERE ("aa".col1(+) = bb.col2 (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2, user1."tab1", "user2".tab2 WHERE col2(+) = "aa".col1(+) and aa."col3"(+) = "aa"."col4"(+) `;
const simpleString = `SELECT 陳 FrOm 박대연`;


const parser = tiberoParser;

const tracer = new Tracer(simpleString, {
  // showTrace: true,
  // showSource: true,

  // useColor: true,

  matchesNode: (node, options) => {
    if (node.type === "rule.match") {
      return true;
    } else {
      return false;
    }
  },
});

console.log("String : ", simpleString);

let token
try{
  token = parser.parse(simpleString, {
    tracer: tracer,
  });
  log_gogo(tracer.getParseTree())
}catch(e){
  console.log("parse error")
  log_gogo(tracer.getParseTree())
}
console.log(token)


console.log("Real Parser")
// const rtp = new pegjsParser.Parser()
// const realAst = rtp.astify(simpleString, {database: "tibero"})


const rtp = new realTiberoParser.Parser()
const realAst = rtp.astify(simpleString)
console.log(rtp.sqlify(realAst))


