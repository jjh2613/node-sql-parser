const { expect } = require("chai");
const Parser = require("../src/parser").default;

describe("Tibero", () => {
  const parser = new Parser();
  const opt = {
    database: "tibero",
  };

  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: "select with simple 陳 Query",
      sql: [`SELECT 陳 FrOm 박대연`, `SELECT 陳 FROM 박대연`],
    },
    {
      title: "select with simple Hangul Query",
      sql: [
        `SELECT 사랑, "합니다" FrOm "박대연"`,
        `SELECT 사랑, "합니다" FROM "박대연"`,
      ],
    },
    {
      title: "select with join keys, tab names, nested parenthese in where",
      sql: [
        `SELECT "col1", COL2, col3 FROM "user1".TAB1, "tab2", user3.TAB3, "user4"."tab4", user5."tab5" WHERE ("aa".col1(+) = "bb"."col2" (+)) or (aa.col4 = cc.col5(+))`,
        `SELECT "col1", COL2, COL3 FROM "user1".TAB1, "tab2", USER3.TAB3, "user4"."tab4", USER5."tab5" WHERE ("aa".COL1 (+) = "bb"."col2" (+)) OR (AA.COL4 = CC.COL5 (+))`,
      ],
    },
    {
      title: "Update Query With Sub Query",
      sql: [
        `UPDATE TEAM A SET A.E_TEAM_NAME = (SELECT X."stadium_name" FROM STADIUM X WHERE X.STADIUM_ID = A.STADIUM_ID)`,
        `UPDATE TEAM AS A SET A.E_TEAM_NAME = (SELECT X."stadium_name" FROM STADIUM AS X WHERE X.STADIUM_ID = A.STADIUM_ID)`,
      ],
    },
    {
      title: "LEFT JOIN",
      sql: [
        `select * from dept left join dept_team on dept."deptno" = dept_team.deptno`,
        'SELECT * FROM DEPT LEFT OUTER JOIN DEPT_TEAM ON DEPT."deptno" = DEPT_TEAM.DEPTNO',
      ],
    },
    {
      title: "RIGHT JOIN",
      sql: [
        `SELECT * FROM EMP right JOIN DEPT ON EMP.DEPTNO = DEPT.DEPTNO`,
        `SELECT * FROM EMP RIGHT OUTER JOIN DEPT ON EMP.DEPTNO = DEPT.DEPTNO`,
      ],
    },
    {
      title: "LEFT OUTER JOIN",
      sql: [
        `select * from dept left outer join dept_team on dept."deptno" = dept_team.deptno`,
        'SELECT * FROM DEPT LEFT OUTER JOIN DEPT_TEAM ON DEPT."deptno" = DEPT_TEAM.DEPTNO',
      ],
    },
    {
      title: "RIGHT OUTER JOIN",
      sql: [
        `select * from dept right outer join dept_team on dept."deptno" = dept_team.deptno`,
        'SELECT * FROM DEPT RIGHT OUTER JOIN DEPT_TEAM ON DEPT."deptno" = DEPT_TEAM.DEPTNO',
      ],
    },
    {
      title: "FULL OUTER JOIN",
      sql: [
        `select * from dept FULL OUTER join dept_team on dept."deptno" = dept_team.deptno`,
        'SELECT * FROM DEPT FULL OUTER JOIN DEPT_TEAM ON DEPT."deptno" = DEPT_TEAM.DEPTNO',
      ],
    },
    {
      title: "Innet Join",
      sql: [
        `select worker.empno, worker.ename, manager.ename from emp worker inner join emp manager on(worker.mgr = manager.empno)`,
        "SELECT WORKER.EMPNO, WORKER.ENAME, MANAGER.ENAME FROM EMP AS WORKER INNER JOIN EMP AS MANAGER ON (WORKER.MGR = MANAGER.EMPNO)",
      ],
    },
    {
      title: 'CROSS JOIN"',
      sql: [
        "SELECT * FROM sample.contacts a CROSS JOIN sample.customers b",
        "SELECT * FROM SAMPLE.CONTACTS AS A CROSS JOIN SAMPLE.CUSTOMERS AS B",
      ],
    },
    {
      title: 'Natural JOIN"',
      sql: [
        "SELECT * FROM SAMPLE.CONTACTS AS A Natural JOIN SAMPLE.CUSTOMERS AS B",
        "SELECT * FROM SAMPLE.CONTACTS AS A NATURAL JOIN SAMPLE.CUSTOMERS AS B",
      ],
    },
    {
      title: 'select implicit "comma cross join"',
      sql: [
        'SELECT * FROM "Roster", TeamMascot',
        'SELECT * FROM "Roster", TEAMMASCOT',
      ],
    },
    {
      title: "select inner join using",
      sql: [
        `SELECT FirstName
        FROM "Roster" INNER JOIN PlayerStats
        USING (LastName);`,
        'SELECT FIRSTNAME FROM "Roster" INNER JOIN PLAYERSTATS USING (LASTNAME)',
      ],
    },
    {
      title: "select union query",
      sql: [
        `SELECT DEPTNO FROM EMP UNION SELECT DEPTNO FROM DEPT`,
        "SELECT DEPTNO FROM EMP UNION SELECT DEPTNO FROM DEPT",
      ],
    },
    {
      title: "select union all query",
      sql: [
        `SELECT DEPTNO FROM EMP UNION ALL SELECT DEPTNO FROM DEPT`,
        `SELECT DEPTNO FROM EMP UNION ALL SELECT DEPTNO FROM DEPT`,
      ],
    },
    {
      title: "select union query",
      sql: [
        `SELECT DEPTNO FROM EMP UNION SELECT DEPTNO FROM DEPT`,
        `SELECT DEPTNO FROM EMP UNION SELECT DEPTNO FROM DEPT`,
      ],
    },
    {
      title: "select intersect query",
      sql: [
        `SELECT DEPTNO FROM EMP intersect SELECT DEPTNO FROM DEPT`,
        `SELECT DEPTNO FROM EMP INTERSECT SELECT DEPTNO FROM DEPT`,
      ],
    },
    {
      title: "select minus query",
      sql: [
        `SELECT DEPTNO FROM EMP minus SELECT DEPTNO FROM DEPT`,
        `SELECT DEPTNO FROM EMP MINUS SELECT DEPTNO FROM DEPT`,
      ],
    },
    {
      title: "select nested operator query",
      sql: [
        `SELECT DEPTNO FROM EMP union all SELECT DEPTNO FROM DEPT intersect SELECT DEPTNO2 FROM DEPT2 minus SELECT DEPTNO2 FROM DEPT2`,
        `SELECT DEPTNO FROM EMP UNION ALL SELECT DEPTNO FROM DEPT INTERSECT SELECT DEPTNO2 FROM DEPT2 MINUS SELECT DEPTNO2 FROM DEPT2`,
      ],
    },
    {
      title: "Group By Roll Up Query",
      sql: [
        `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY ROLLUP(DNAME, (JOB, MGR))`,
        `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY ROLLUP(DNAME, (JOB,MGR))`,
      ],
    },
    {
      title: "Group By Cube Query",
      sql: [
        `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY CUBE(DNAME, (JOB, MGR))`,
        `SELECT DNAME, JOB, MGR, SUM(SAL) FROM EMP, DEPT WHERE DEPT.DEPTNO = EMP.DEPTNO GROUP BY CUBE(DNAME, (JOB,MGR))`,
      ],
    },
    {
      title: "Window Fns with qualified frame clause",
      sql: [
        `SELECT
            first_name,
            SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC) AS age_window
          FROM roster`,
        "SELECT FIRST_NAME, SUM(USER_AGE) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT DESC) AS AGE_WINDOW FROM ROSTER",
      ],
    },
    {
      title: "Window Fns - range, 20 preceding, current row",
      sql: [
        `select max(standard_cost) over (partition by category_id order by product_id desc range between 20 preceding and current row) from sample.products`,
        "SELECT MAX(STANDARD_COST) OVER (PARTITION BY CATEGORY_ID ORDER BY PRODUCT_ID DESC RANGE BETWEEN 20 PRECEDING AND CURRENT ROW) FROM SAMPLE.PRODUCTS",
      ],
    },
    {
      title: "Window Fns - rows, unbounded following, current row",
      sql: [
        `select max(standard_cost) over (partition by category_id order by product_id desc rows between current row and unbounded following) from sample.products`,
        "SELECT MAX(STANDARD_COST) OVER (PARTITION BY CATEGORY_ID ORDER BY PRODUCT_ID DESC ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) FROM SAMPLE.PRODUCTS",
      ],
    },
    {
      title: "Window Fns - range, unbounded preceding w/o between",
      sql: [
        `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at ASC
                range UNbounded preceding
            ) AS age_window
          FROM roster`,
        "SELECT FIRST_NAME, SUM(USER_AGE) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT ASC RANGE UNBOUNDED PRECEDING) AS AGE_WINDOW FROM ROSTER",
      ],
    },
    {
      title: "Window Fns (RANGE) + Window Fns (ROWS) - Multiple",
      sql: [
        `SELECT
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
          FROM roster`,
        "SELECT FIRST_NAME, SUM(USER_AGE) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT DESC RANGE BETWEEN 1 PRECEDING AND 5 FOLLOWING) AS AGE_WINDOW, SUM(USER_AGE) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS AGE_WINDOW2 FROM ROSTER",
      ],
    },
    {
      title: "Window Fns + RANKING",
      sql: [
        `SELECT
            ROW_NUMBER() OVER (
                PARTITION BY user_city
                ORDER BY created_at
            ) AS age_window
          FROM roster`,
        "SELECT ROW_NUMBER() OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT ASC) AS AGE_WINDOW FROM ROSTER",
      ],
    },
    {
      title: "Window Fns + DENSE_RANK w/ empty OVER",
      sql: [
        `SELECT
            DENSE_RANK() OVER () AS age_window
          FROM roster`,
        "SELECT DENSE_RANK() OVER () AS AGE_WINDOW FROM ROSTER",
      ],
    },
    {
      title: "Window Fns + LAG",
      sql: [
        `SELECT
            LAG(user_name, 10) OVER (
                PARTITION BY user_city
                ORDER BY created_at
            ) AS age_window
          FROM roster`,
        "SELECT LAG(USER_NAME, 10) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT ASC) AS AGE_WINDOW FROM ROSTER",
      ],
    },
    {
      title: "Window Fns + LEAD",
      sql: [
        `SELECT
          LEAD(user_name, 10) OVER (
              PARTITION BY user_city
              ORDER BY created_at
          ) AS age_window
        FROM roster`,
        "SELECT LEAD(USER_NAME, 10) OVER (PARTITION BY USER_CITY ORDER BY CREATED_AT ASC) AS AGE_WINDOW FROM ROSTER",
      ],
    },
    // {
    //   title: 'Window Fns + NTH_VALUE',
    //   sql: [
    //     `SELECT
    //     NTH_VALUE(user_name, 10) OVER (
    //           PARTITION BY user_city
    //           ORDER BY created_at
    //       ) AS age_window
    //     FROM roster`,
    //     'SELECT NTH_VALUE("user_name", 10) RESPECT NULLS OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
    //   ]
    // },
    {
      title: "Window Fns + FIRST_VALUE",
      sql: [
        `SELECT first_value(product_name)
            OVER (PARTITION BY category_id ORDER BY product_id ASC) AS AGE_WINDOW FROM sample.products`,
        "SELECT first_value(PRODUCT_NAME) OVER (PARTITION BY CATEGORY_ID ORDER BY PRODUCT_ID ASC) AS AGE_WINDOW FROM SAMPLE.PRODUCTS",
      ],
    },
    {
      title: "Window Fns + FIRST_VALUE (ignore null)",
      sql: [
        `SELECT first_value(product_name ignore nulls) 
            OVER (PARTITION BY category_id ORDER BY product_id ASC) AS AGE_WINDOW FROM sample.products`,
        "SELECT first_value(PRODUCT_NAME IGNORE NULLS) OVER (PARTITION BY CATEGORY_ID ORDER BY PRODUCT_ID ASC) AS AGE_WINDOW FROM SAMPLE.PRODUCTS",
      ],
    },
    {
      title: "array column",
      sql: [
        "SELECT ARRAY[col1, col2, 1, 'str_literal'] from tableb",
        `SELECT ARRAY["col1","col2",1,'str_literal'] FROM "tableb"`,
      ],
    },
    {
      title: "row function column",
      sql: [
        "SELECT ROW(col1, col2, 'literal', 1) from tableb",
        `SELECT ROW("col1", "col2", 'literal', 1) FROM "tableb"`,
      ],
    },
    {
      title: "json column",
      sql: [
        `SELECT
        d.metadata->>'communication_status' as communication_status
      FROM
        device d
      WHERE d.metadata->>'communication_status' IS NOT NULL
      LIMIT 10;`,
        `SELECT "d"."metadata" ->> 'communication_status' AS "communication_status" FROM "device" AS "d" WHERE "d"."metadata" ->> 'communication_status' IS NOT NULL LIMIT 10`,
      ],
    },
    {
      title: "case when in pg",
      sql: [
        `SELECT SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) FROM tablename`,
        `SELECT SUM(CASE WHEN "status" = 'ACTIVE' THEN 1 ELSE 0 END) FROM "tablename"`,
      ],
    },
    {
      title: "key keyword in pg",
      sql: [
        `SELECT * FROM partitions WHERE location IS NULL AND code like 'XX-%' AND key <> 1;`,
        `SELECT * FROM "partitions" WHERE "location" IS NULL AND "code" LIKE 'XX-%' AND "key" <> 1`,
      ],
    },
    {
      title: "alias processing",
      sql: [
        `SELECT "col1" alias1, COL2 as alias2, col3 "ALiAS3", col4 as "Alias4" FROM tab`,
        `SELECT "col1" ALIAS1, COL2 AS ALIAS2, COL3 "ALiAS3", COL4 AS "AAAlias4" FROM TAB`,
      ],
    },
  ];
  function neatlyNestTestedSQL(sqlList) {
    sqlList.forEach((sqlInfo) => {
      const { title, sql } = sqlInfo;
      it(`should support ${title}`, () => {
        expect(getParsedSql(sql[0], opt)).to.equal(sql[1]);
      });
    });
  }
  neatlyNestTestedSQL(SQL_LIST);

  describe("create sequence", () => {
    const SQL_LIST = [
      {
        title: "create sequence",
        sql: [
          `CREATE SEQUENCE public.table_id_seq`,
          'CREATE SEQUENCE "public"."table_id_seq"',
        ],
      },
      {
        title: "create sequence increment by",
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10',
        ],
      },
      {
        title: "create sequence increment by minvalue and maxvalue",
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 minvalue 20 maxvalue 30`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 MINVALUE 20 MAXVALUE 30',
        ],
      },
      {
        title: "create sequence increment by start with cache",
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 no minvalue no maxvalue start with 1 cache 3`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3',
        ],
      },
      {
        title: "create sequence increment by start with cache, cycle and owned",
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 no minvalue no maxvalue start with 1 cache 3 no cycle owned by tn.cn`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 NO CYCLE OWNED BY "tn"."cn"',
        ],
      },
      {
        title: "create sequence increment by start with cache, cycle and owned",
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment 10 no minvalue no maxvalue start with 1 cache 3 cycle owned by none`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 CYCLE OWNED BY NONE',
        ],
      },
    ];
    neatlyNestTestedSQL(SQL_LIST);
  });
});
