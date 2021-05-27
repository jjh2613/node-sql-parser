// SqlParser = require("../output/prod")
import TiberoSqlParser from "../output/prod/build/tibero"
import Tracer from "pegjs-backtrace"

const parser = new TiberoSqlParser.Parser();
// const sqlParser = new SqlParser.Parser({tracer: tracer})

const testQuery1 = "select col1, col2 from d.tt where col1 = col2"
const tracer = new Tracer(simpleString, {
  showTrace: true,
  useColor: true,
  showSource: true  
})
console.log(`Test Query 1 ::: ${testQuery1}`)
// console.log(parser.astify(testQuery1))
try {
  // parser.parse(testQuery1)
  parser.parse(testQuery1, {tracer: tracer})
  // tracer.showTrace();
} catch(e) {
  console.log(e)
  console.log(tracer.getBacktraceString());  
}



// const testQuery2 = "select * from a, b left outer join a on b"
// // const testQuery2 = "select * from a, b where a(+) = b"
// console.log("testQuery2 : ")
// console.log(parser.astify(testQuery2))

// const testQuery3 = "select SUM(dd) OVER (PARTITION BY user_city ORDER BY created_at DESC) AS age_window from a"
// console.log("testQuery3 : ")
// console.log(parser.astify(testQuery3))