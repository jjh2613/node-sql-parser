const { expect } = require('chai')
const Parser = require('../src/parser').default
const { arrayStructValueToSQL } = require('../src/array-struct')
const { arrayStructTypeToSQL } = require('../src/util')

describe('BigQuery', () => {
  const parser = new Parser();
  const opt = {
    database: 'bigquery'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'select *',
      sql: [
        'SELECT * FROM (SELECT "apple" AS fruit, "carrot" AS vegetable);',
        "SELECT * FROM (SELECT 'apple' AS fruit, 'carrot' AS vegetable)"
      ]
    },
    {
      title: 'select simple column with parentheses',
      sql: [
        'SELECT ((aaa + bbb) / ccc) FROM xxx',
        "SELECT ((aaa + bbb) / ccc) FROM xxx"
      ]
    },
    {
      title: 'select expression.*',
      sql: [
        `WITH groceries AS
        (SELECT "milk" AS dairy,
          "eggs" AS protein,
          "bread" AS grain)
        SELECT g.*
        FROM groceries AS g;`,
        "WITH groceries AS (SELECT 'milk' AS dairy, 'eggs' AS protein, 'bread' AS grain) SELECT g.* FROM groceries AS g"
      ]
    },
    {
      title: 'select expression.* with struct',
      sql: [
        `WITH locations AS
        (SELECT STRUCT("Seattle" AS city, "Washington" AS state) AS location
        UNION ALL
        SELECT STRUCT("Phoenix" AS city, "Arizona" AS state) AS location)
      SELECT l.locations.*
      FROM locations l;`,
        "WITH locations AS (SELECT STRUCT('Seattle' AS city, 'Washington' AS state) AS location UNION ALL SELECT STRUCT('Phoenix' AS city, 'Arizona' AS state) AS location) SELECT l.locations.* FROM locations AS l"
      ]
    },
    {
      title: 'select expression.* with array struct',
      sql: [
        `WITH locations AS
        (SELECT ARRAY<STRUCT<city STRING, state STRING>>[("Seattle", "Washington"),
          ("Phoenix", "Arizona")] AS location)
      SELECT l.*
      FROM locations l;`,
        "WITH locations AS (SELECT ARRAY<STRUCT<city STRING, state STRING>>[('Seattle', 'Washington'), ('Phoenix', 'Arizona')] AS location) SELECT l.* FROM locations AS l"
      ]
    },
    {
      title: 'select * expect',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * EXCEPT (order_id)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * EXCEPT (order_id) FROM orders"
      ]
    },
    {
      title: 'select * replace',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * REPLACE ("widget" AS item_name)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE ('widget' AS item_name) FROM orders"
      ]
    },
    {
      title: 'select * replace calculate',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * REPLACE (quantity/2 AS quantity)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE (quantity / 2 AS quantity) FROM orders"
      ]
    },
    {
      title: 'select as struct',
      sql: [
        'SELECT AS STRUCT 1 x, 2, 3 xx',
        'SELECT AS STRUCT 1 AS x, 2, 3 AS xx'
      ]
    },
    {
      title: 'select as value',
      sql: [
        'SELECT AS VALUE STRUCT(1 AS x, 2, 3 AS x)',
        'SELECT AS VALUE STRUCT(1 AS x, 2, 3 AS x)'
      ]
    },
    {
      title: 'select as value from',
      sql: [
        'SELECT AS VALUE STRUCT(1 a, 2 b) xyz FROM ttt',
        'SELECT AS VALUE STRUCT(1 AS a, 2 AS b) AS xyz FROM ttt'
      ]
    },
    {
      title: 'select from project.dataset.table',
      sql: [
        'SELECT * FROM project.dataset.Roster;',
        'SELECT * FROM project.dataset.Roster'
      ]
    },
    {
      title: 'select from table for system_time as of',
      sql: [
        'SELECT * FROM t FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR);',
        'SELECT * FROM t FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)'
      ]
    },
    {
      title: 'select from table for system_time as of string',
      sql: [
        "SELECT * FROM t FOR SYSTEM_TIME AS OF '2017-01-01 10:00:00-07:00';",
        "SELECT * FROM t FOR SYSTEM_TIME AS OF '2017-01-01 10:00:00-07:00'"
      ]
    },
    {
      title: 'select from table for system_time as of in',
      sql: [
        'SELECT * FROM t1 WHERE t1.a IN (SELECT t2.a FROM t2 FOR SYSTEM_TIME AS OF t1.timestamp_column);',
        'SELECT * FROM t1 WHERE t1.a IN (SELECT t2.a FROM t2 FOR SYSTEM_TIME AS OF t1.timestamp_column)'
      ]
    },
    {
      title: 'select from unnest array expr',
      sql: [
        "SELECT * FROM UNNEST(ARRAY<STRUCT<x INT64, y STRING>>[(1, 'foo'), (3, 'bar')]);",
        "SELECT * FROM UNNEST (ARRAY<STRUCT<x INT64, y STRING>>[(1, 'foo'), (3, 'bar')])"
      ]
    },
    {
      title: 'select from unnest array path',
      sql: [
        'SELECT * FROM UNNEST ([1, 2, 3]);',
        'SELECT * FROM UNNEST ([1, 2, 3])'
      ]
    },
    {
      title: 'select from unnest JSON_EXTRACT_ARRAY',
      sql: [
        'SELECT a, b, c, ARRAY(SELECT * FROM UNNEST(JSON_EXTRACT_ARRAY(d))) AS d FROM e WHERE LOWER(f)=\'123\' GROUP BY a, b, c',
        'SELECT a, b, c, ARRAY(SELECT * FROM UNNEST (JSON_EXTRACT_ARRAY(d))) AS d FROM e WHERE LOWER(f) = \'123\' GROUP BY a, b, c'
      ]
    },
    {
      title: 'select from unnest with offset',
      sql: [
        'SELECT * FROM UNNEST ( ) AS abc WITH OFFSET AS num',
        'SELECT * FROM UNNEST ( ) AS abc WITH OFFSET AS num'
      ]
    },
    {
      title: 'select with_query_name',
      sql: [
        `WITH
        subQ1 AS (SELECT * FROM Roster WHERE SchoolID = 52),
        subQ2 AS (SELECT SchoolID FROM subQ1)
      SELECT DISTINCT * FROM subQ2;`,
        'WITH subQ1 AS (SELECT * FROM Roster WHERE SchoolID = 52), subQ2 AS (SELECT SchoolID FROM subQ1) SELECT DISTINCT * FROM subQ2'
      ]
    },
    {
      title: 'select subquery',
      sql: [
        `SELECT AVG ( PointsScored )
        FROM
        ( SELECT PointsScored
          FROM Stats
          WHERE SchoolID = 77 )`,
        'SELECT AVG(PointsScored) FROM (SELECT PointsScored FROM Stats WHERE SchoolID = 77)'
      ]
    },
    {
      title: 'select subquery have alias',
      sql: [
        `SELECT r.LastName
        FROM
        ( SELECT * FROM Roster) AS r`,
        'SELECT r.LastName FROM (SELECT * FROM Roster) AS r'
      ]
    },
    {
      title: 'select implicit "comma cross join"',
      sql: [
        'SELECT * FROM Roster, TeamMascot',
        'SELECT * FROM Roster, TeamMascot'
      ]
    },
    {
      title: 'select cross join',
      sql: [
        'SELECT * FROM Roster cross join TeamMascot',
        'SELECT * FROM Roster CROSS JOIN TeamMascot'
      ]
    },
    {
      title: 'select inner join using',
      sql: [
        `SELECT FirstName
        FROM Roster INNER JOIN PlayerStats
        USING (LastName);`,
        'SELECT FirstName FROM Roster INNER JOIN PlayerStats USING (LastName)'
      ]
    },
    {
      title: 'select order by using parentheses',
      sql: [
        `( SELECT * FROM Roster
          UNION ALL
          SELECT * FROM TeamMascot )
        ORDER BY SchoolID;`,
        '( SELECT * FROM Roster UNION ALL SELECT * FROM TeamMascot ) ORDER BY SchoolID ASC'
      ]
    },
    {
      title: 'select window clause',
      sql: [
        `SELECT item, purchases, category,
        LAST_VALUE(item)
        OVER (item_window) AS most_popular
        FROM Produce
        WINDOW item_window AS (
          PARTITION BY category
          ORDER BY purchases
          ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING)`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER (item_window) AS most_popular FROM Produce WINDOW item_window AS (PARTITION BY category ORDER BY purchases ASC ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING)'
      ]
    },
    {
      title: 'select window clause list',
      sql: [
        `SELECT item, purchases, category, LAST_VALUE(item)
        OVER d AS most_popular
      FROM Produce
      WINDOW
        a AS (PARTITION BY category),
        b AS (a ORDER BY purchases),
        c AS (b ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING),
        d AS (c)`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER d AS most_popular FROM Produce WINDOW a AS (PARTITION BY category), b AS (a ORDER BY purchases ASC), c AS (b ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING), d AS (c)'
      ]
    },
    {
      title: 'select window clause list over window',
      sql: [
        `SELECT item, purchases, category, LAST_VALUE(item)
        OVER (c ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS most_popular
      FROM Produce
      WINDOW
        a AS (PARTITION BY category),
        b AS (a ORDER BY purchases),
        c AS b`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER (c ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS most_popular FROM Produce WINDOW a AS (PARTITION BY category), b AS (a ORDER BY purchases ASC), c AS b'
      ]
    },
    {
      title: 'select unnest array limit',
      sql: [
        `SELECT *
        FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter
        ORDER BY letter ASC LIMIT 2`,
        "SELECT * FROM UNNEST (ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter ORDER BY letter ASC LIMIT 2"
      ]
    },
    {
      title: 'select unnest array limit and offset',
      sql: [
        `SELECT *
        FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter
        ORDER BY letter ASC LIMIT 2 OFFSET 1`,
        "SELECT * FROM UNNEST (ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter ORDER BY letter ASC LIMIT 2 OFFSET 1"
      ]
    },
    {
      title: 'tail comma',
      sql: [
        `SELECT season as season,
        academic_year as academic_year,
        FROM source`,
        'SELECT season AS season, academic_year AS academic_year FROM source'
      ]
    },
    {
      title: 'select union distinct',
      sql: [
        `SELECT win_team_id AS winTeamID, win_market as market, winName as name from winners UNION DISTINCT (SELECT * from losers)`,
        'SELECT win_team_id AS winTeamID, win_market AS market, winName AS name FROM winners UNION DISTINCT (SELECT * FROM losers)'
      ]
    },
    {
      title: 'select offset',
      sql: [
        `WITH locations AS
        (SELECT ARRAY<STRUCT<city STRING, state STRING>>[("Seattle", "Washington"),
          ("Phoenix", "Arizona")] AS location)
      SELECT l.LOCATION[offset(0)].*
      FROM locations l;`,
        "WITH locations AS (SELECT ARRAY<STRUCT<city STRING, state STRING>>[('Seattle', 'Washington'), ('Phoenix', 'Arizona')] AS location) SELECT l.LOCATION[offset(0)].* FROM locations AS l"
      ]
    },
    {
      title: 'select scalar function with args',
      sql: [
        'SELECT CURRENT_DATE(\'America/New_York\') FROM table1;',
        "SELECT CURRENT_DATE('America/New_York') FROM table1"
      ]
    },
    {
      title: 'select extract function with args',
      sql: [
        "SELECT EXTRACT(DAY FROM DATE '2013-12-25') as the_day FROM table1;",
        "SELECT EXTRACT(DAY FROM DATE '2013-12-25') AS the_day FROM table1"
      ]
    },
    {
      title: 'select regex extract function with args',
      sql: [
        'SELECT REGEXP_EXTRACT(CAST(date AS String), r"^[0-9]+") AS regexp FROM table1',
        'SELECT REGEXP_EXTRACT(CAST(date AS STRING), r"^[0-9]+") AS regexp FROM table1'
      ]
    },
    {
      title: 'select regex substr function with args',
      sql: [
        'SELECT REGEXP_SUBSTR(CAST(date AS String), r"^[0-9]+", 2, 10) AS regexp FROM table1',
        'SELECT REGEXP_SUBSTR(CAST(date AS STRING), r"^[0-9]+", 2, 10) AS regexp FROM table1'
      ]
    },
  ]

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })

  it('should return empty str for non-array-struct', () => {
    expect(arrayStructValueToSQL({ type: 'non-array-struct' })).to.equal('')
  })

  it('should without parentheses', () => {
    const ast = parser.astify(SQL_LIST[15].sql[0], opt)
    const expr = ast.select.from.expr
    expr.parentheses = false
    expr.expr_list = {
      type: 'string',
      value: 'abc'
    }
    expect(arrayStructValueToSQL(expr)).to.equal(`'${expr.expr_list.value}'`)
  })

  it('should return undefined and dataType', () => {
    expect(arrayStructTypeToSQL()).to.equal(undefined)
    expect(arrayStructTypeToSQL({ dataType: 'array' })).to.equal('ARRAY undefined')
  })
})
