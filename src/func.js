import { exprToSQL } from './expr'
import { hasVal, identifierToSql, toUpper } from './util'
import { overToSQL } from './over'

function castToSQL(expr) {
  const { target, expr: expression, symbol, as: alias } = expr
  const { length, dataType, parentheses, scale } = target
  let str = ''
  if (length) str = scale ? `${length}, ${scale}` : `(${length})`
  if (parentheses) str = `(${str})`
  let prefix = exprToSQL(expression)
  let symbolChar = '::'
  let suffix = ''
  if (symbol === 'as') {
    prefix = `CAST(${prefix}`
    suffix = ')'
    symbolChar = ` ${symbol.toUpperCase()} `
  }
  if (alias) suffix += ` AS ${identifierToSql(alias)}`
  return `${prefix}${symbolChar}${dataType}${str}${suffix}`
}

function extractFunToSQL(stmt) {
  const { args, type } = stmt
  const { field, cast_type: castType, source } = args
  const result = [`${toUpper(type)}(${toUpper(field)}`, 'FROM', toUpper(castType), exprToSQL(source)]
  return `${result.filter(hasVal).join(' ')})`
}

function funcToSQL(expr) {
  const { args, name } = expr
  if (!args) return name
  const { parentheses, over } = expr
  const str = `${name}(${exprToSQL(args).join(', ')})`
  const overStr = overToSQL(over)
  return [parentheses ? `(${str})` : str, overStr].filter(hasVal).join(' ')
}

function substringFromForFuncToSQL(expr) {
  const { args, name } = expr
  const processedArgs = exprToSQL(args)
  return `${name}(${processedArgs[0]} FROM ${processedArgs[1]} FOR ${processedArgs[2]})`
}

export {
  castToSQL,
  extractFunToSQL,
  funcToSQL,
  substringFromForFuncToSQL,
}
