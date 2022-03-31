import Tracer from "pegjs-backtrace";
const path = require("path");
import tiberoParser from "./tiberoParser";
import realTiberoParser from "../output/prod/build/tibero";
import pegjsParser from "../output/prod";

const isDebugMode = true;

const log_gogo = (tree) => {
  if (!isDebugMode) return;
  console.log("origin tree");
  console.log(tree);
  console.log("column_clause operator tree");
  const column_clause = tree.children[0].children[1].children[0].children[0].children[0].children[6]
  console.log(column_clause);
  console.log("primary operator tree");
  const primary = column_clause.children[0].children[3].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
  console.log(primary);

  console.log("cast_expr operator tree");
  const cast_expr = primary.children[0];
  console.log(cast_expr);
};

let simpleString;
// const simpleString = "select abc1, abc2 from tab where tab1.abc1(+) = tab2.bcd1 or ddd1(+) = ggg(+)";
simpleString = `SELECT "col1", COL2, col3 FROM "user1".TAB1, "tab2", user3.TAB3, "user4"."tab4", user5."tab5" WHERE ("aa".col1(+) = "bb"."col2" (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2 WHERE ("aa".col1(+) = "bb"."col2" (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2 WHERE ("aa".col1(+) = bb.col2 (+)) or (aa.col4 = cc.col5(+))`;
// const simpleString = `SELECT "col1", COL2, col3 FROM TAB, TAB2, user1."tab1", "user2".tab2 WHERE col2(+) = "aa".col1(+) and aa."col3"(+) = "aa"."col4"(+) `;
// const simpleString = `SELECT 陳 FrOm 박대연`;
simpleString = `UPDATE TEAM A SET A.E_TEAM_NAME = (SELECT X."stadium_name" FROM STADIUM X WHERE X.STADIUM_ID = A.STADIUM_ID)`;
simpleString = `select * from dept FULL OUTER join dept_team on dept."deptno" = dept_team.deptno`;
simpleString = `select worker.empno, worker.ename, manager.ename from emp worker inner join emp manager on(worker.mgr = manager.empno)`;
simpleString = `SELECT * FROM sample.contacts a CROSS JOIN sample.customers b`;
simpleString = `SELECT * FROM sample.contacts a natural JOIN sample.customers b`;
simpleString = `SELECT FirstName FROM "Roster" INNER JOIN PlayerStats USING (LastName)`;
simpleString = `SELECT DEPTNO FROM EMP UNION SELECT DEPTNO FROM DEPT`;
simpleString = `SELECT DEPTNO FROM EMP UNION ALL SELECT DEPTNO FROM DEPT`;
simpleString = `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY ROLLUP(DNAME, (JOB, MGR))`;
simpleString = `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY CUBE(DNAME, (JOB, MGR))`;
simpleString = `SELECT DEPTNO FROM EMP union all SELECT DEPTNO FROM DEPT intersect SELECT DEPTNO2 FROM DEPT2 minus SELECT DEPTNO2 FROM DEPT2`;
simpleString = "SELECT DEPTNO FROM EMP intersect SELECT DEPTNO FROM DEPT";
simpleString = `SELECT
first_name,
SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at) AS age_window
FROM roster`;
simpleString = `select max(standard_cost) over (partition by category_id order by product_id desc range) from sample.products`;
simpleString = `select max(standard_cost) over (partition by category_id order by product_id desc range between 20 preceding and current row) from sample.products`;
simpleString = `SELECT
first_name,
SUM(user_age) OVER (
    PARTITION BY user_city
    ORDER BY created_at ASC
    range UNbounded preceding
) AS age_window
FROM roster`;
simpleString = `
SELECT
  first_name,
  SUM(user_age) OVER (
      PARTITION BY user_city
      ORDER BY created_at DESC
      RANGE BETWEEN 1 preceding AND 5 FOLLOWING
  ) AS age_window,
  SUM(user_age) OVER (
      PARTITION BY user_city
      ORDER BY created_at DESC
      ROWS BETWEEN unbounded preceding AND unbounded following
  ) AS age_window2
FROM roster`;
simpleString = `SELECT
lead(user_name, 10) OVER (
    PARTITION BY user_city
    ORDER BY created_at
) AS age_window
FROM roster`;
simpleString = `SELECT first_value(product_name)
OVER (PARTITION BY category_id ORDER BY product_id ASC) AS AGE_WINDOW FROM sample.products`;
simpleString = `SELECT first_value(product_name)
OVER (PARTITION BY category_id ORDER BY product_id ASC) AS AGE_WINDOW FROM sample.products`;
simpleString = `with example as (
	select * from products
),
example2 as (
	select * from warehouses
)
select * from example`;

simpleString = `
select * from example where (aa != 'gg' and rownum <= 20) and bb = 20`;

simpleString = `
select * from example where (aa != 'gg' and rownum <= 20) and bb = 20`;

simpleString = `
select * from example group by GROUPING SETS((job, mgr), (dd, gg)), aa`;

simpleString = `SELECT * FROM EMP right JOIN DEPT ON EMP.DEPTNO = DEPT.DEPTNO`;

simpleString = `SELECT "co l1" alias1, COL2 as alias2, col3 "ALi AS3", col4 as "AAAlias4" FROM tab`;

simpleString = `SELECT cast("col1" as varchar2(100)) alias1, cast(col2 as varchar2(100)) as alias2, col3 "ALi AS3", col4 as "AAAlias4" FROM tab`;

simpleString = `SELECT substring(col1 from 1 for 4) as ss, substring("col2", 1, 4) as ss2  from tab1`;

simpleString = `select extract(YEAR from 'aa') from hyperdata.datajob_history`

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

let token;
try {
  token = parser.parse(simpleString, {
    tracer: tracer,
  });
  log_gogo(tracer.getParseTree());
} catch (e) {
  console.log("parse error");
  log_gogo(tracer.getParseTree());
}
console.log(token);
console.log(JSON.stringify(token, null, "\t"));

console.log("Real Parser");
// const rtp = new pegjsParser.Parser()
// const realAst = rtp.astify(simpleString, {database: "tibero"})

const rtp = new realTiberoParser.Parser();
const realAst = rtp.astify(simpleString);
console.log(rtp.sqlify(realAst));
