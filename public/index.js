import Tracer from "pegjs-backtrace";
const path = require("path");
import tiberoParser from "./tiberoParser";
import realTiberoParser from "../output/prod/build/tibero"
import pegjsParser from "../output/prod"

// const simpleString = "select abc1, abc2 from tab where tab1.abc1(+) = tab2.bcd1 or ddd1(+) = ggg(+)";
const simpleString = `SELECT col1, COL2, col3 FROM TAB, TAB2 WHERE (aa.col1(+) = bb.col2 (+)) or (aa.col4 = cc.col5(+))`;


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

const token = parser.parse(simpleString, {
  tracer: tracer,
});

console.log(tracer.getParseTree())
console.log(token)


console.log("Real Parser")
// const rtp = new pegjsParser.Parser()
// const realAst = rtp.astify(simpleString, {database: "tibero"})


const rtp = new realTiberoParser.Parser()
const realAst = rtp.astify(simpleString)
console.log(rtp.sqlify(realAst))


