/*
 * @Author: lk
 * @Date: 2019-10-09 10:46:22
 * @Last Modified by: lk
 * @Last Modified time: 2020-05-08 15:20:59
 * @Description:  生成sql
 */
const joinType = {
  '1': 'inner join',
  '2': 'left join',
  '3': 'right join'
}

/**
 * 生成查询sql
 * @param {*} modelJson
 * @param {查询节点} middleNode
 */
export function searchSql(modelJson, middleNode) {
  let sql = 'select '
  if (middleNode.T05JoinNode.distinctFlag === '1') {
    sql += 'distinct '
  }
  const aliasMap = {}
  const T05JoinColumn = middleNode.T05JoinColumn
  const mainNode = middleNode.T05JoinTable.find(it => it.joinType === '0')
  const mainTable = modelJson.T05ModelTable.find(item => item.tableNumber === mainNode.tableNumber)
  let joinTable = null
  const joinNode = middleNode.T05JoinTable.find(it => it.joinType === '1')
  if (joinNode) {
    joinTable = modelJson.T05ModelTable.find(item => item.tableNumber === joinNode.tableNumber)
  }
  // 添加主表和关联表的别名到集合
  if (!aliasMap[mainNode.tableIdx + '']) {
    aliasMap[mainNode.tableIdx + ''] = '_' + mainNode.tableIdx
  }
  if (joinTable && !aliasMap[joinNode.tableIdx + '']) {
    aliasMap[joinNode.tableIdx + ''] = '_' + joinNode.tableIdx
  }
  // 结果表
  const resultTable = modelJson.T05ModelTable.find(item => item.tableNumber === middleNode.tableNumber)
  // 遍历查询结果
  sql += resultColumn(T05JoinColumn, middleNode, modelJson, resultTable, aliasMap)
  sql += 'from '
  if (mainTable.tableType === '2') {
    sql += '#{' + mainTable.tableNumber + '}'
  } else {
    sql += mainTable.tableName
  }
  sql += ' as ' + aliasMap[mainNode.tableIdx + ''] + ' '
  // 关联条件
  if (joinTable) {
    sql += joinCondition(joinNode, joinTable, mainTable, mainNode, aliasMap)
  }
  // where
  if (middleNode.T05JoinFilter.where.length > 0) {
    sql += 'where '
    sql += getFilterStr(middleNode.T05JoinFilter.where, aliasMap)
  }
  // groupBy
  if (middleNode.T05JoinNode.groupInfo.length > 0) {
    sql += 'group by '
    const groupByStr = getGroupByStr(middleNode.T05JoinNode.groupInfo, aliasMap)
    sql += groupByStr.substring(0, groupByStr.length - 1) + ' '
  }
  // orderBy
  if (middleNode.T05JoinOrder.length > 0) {
    sql += getOrderByStr(middleNode.T05JoinOrder, middleNode, modelJson, aliasMap) + ' '
  }
  // having
  if (middleNode.T05JoinFilter.hive.length > 0) {
    sql += 'having '
    sql += getFilterStr(middleNode.T05JoinFilter.hive, aliasMap)
  }
  return sql
}

const uninoMap = {
  '1': 'union',
  '2': 'union all'
}

/**
 * 生成追加sql
 * @param {*} modelJson
 * @param {追加节点} middleNode
 */
export function addSql(modelJson, middleNode) {
  let sql = 'select '
  const T05UnionTable = middleNode.T05UnionTable
  const resultTable = modelJson.T05ModelTable.find(item => item.tableNumber === middleNode.tableNumber)
  for (const [index, iterator] of T05UnionTable.entries()) {
    const oriTable = modelJson.T05ModelTable.find(item => item.tableNumber === iterator.tableNumber)
    const T05UnionColumn = iterator.T05UnionColumn
    if (iterator.unionType !== '0') {
      sql += uninoMap[iterator.unionType] + ' select '
    }
    const currentTime = new Date().getTime()
    for (const [i, it] of T05UnionColumn.entries()) {
      const oriColumn = oriTable.T05ModelColumn.find(item => item.columnNumber === it.columnNumber)
      const resultColumn = resultTable.T05ModelColumn[i]
      if (i !== 0) {
        sql += ','
      }
      sql += '_' + currentTime + index + '.' + oriColumn.columnName + ' '
      sql += 'as ' + resultColumn.columnName
      if (i === T05UnionColumn.length - 1) {
        sql += ' '
      }
    }
    if (oriTable.tableType === '1') {
      sql += 'from ' + oriTable.tableName
    } else {
      sql += 'from ' + '#{' + oriTable.tableNumber + '}'
    }
    sql += ' as ' + '_' + currentTime + index + ' '
  }
  return sql
}

/**
 * 结果列
 * @param {*} T05JoinColumn
 * @param {*} middleNode
 * @param {*} modelJson
 * @param {*} resultTable
 * @param {*} aliasMap
 */
function resultColumn(T05JoinColumn, middleNode, modelJson, resultTable, aliasMap) {
  let sql = ''
  // 遍历查询结果
  for (const [index, iterator] of T05JoinColumn.entries()) {
    if (index !== 0) {
      sql += ','
    }
    if (Number.isFinite(iterator.expressionNumber)) {
      const joinExpression = middleNode.T05JoinExpression.find(item => item.columnIdx === iterator.expressionNumber)
      sql += expressionText('', joinExpression.expression, aliasMap)
    } else {
      const tableNumber = iterator.tableNumber
      const tableIdx = iterator.tableIdx
      const modelTable = modelJson.T05ModelTable.find(item => item.tableNumber === tableNumber)
      const modelColumn = modelTable.T05ModelColumn.find(item => item.columnNumber === iterator.columnNumber)
      if (iterator.groupFunc) {
        sql += iterator.groupFunc + '('
        sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName
        sql += ') '
      } else {
        sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName + ' '
      }
    }
    sql += 'as ' + resultTable.T05ModelColumn[index].columnName + ' '
  }
  return sql
}

/**
 * 关联表
 * @param {*} joinNode
 * @param {*} joinTable
 * @param {*} mainTable
 * @param {*} mainNode
 * @param {*} aliasMap
 */
function joinCondition(joinNode, joinTable, mainTable, mainNode, aliasMap) {
  let sql = ''
  sql += joinType[joinNode.joinRelation.type] + ' '
  if (joinTable.tableType === '2') { // 关联为结果表
    sql += '#{' + joinTable.tableNumber + '}'
  } else { // 关联为原始表
    sql += joinTable.tableName
  }
  sql += ' as ' + aliasMap[joinNode.tableIdx + ''] + ' '
  const mainColumn = mainTable.T05ModelColumn.find(item => item.columnNumber === joinNode.joinRelation.relations[0].originalColumnNumber)
  const joinColumn = joinTable.T05ModelColumn.find(item => item.columnNumber === joinNode.joinRelation.relations[0].relationColumnNumber)
  sql += 'on ' + aliasMap[mainNode.tableIdx + ''] + '.' + mainColumn.columnName + ' '
  sql += '= '
  sql += aliasMap[joinNode.tableIdx + ''] + '.' + joinColumn.columnName + ' '
  return sql
}

/**
 * 获取计算列表达式
 * @param {结果} text
 * @param {递归children} arr
 * @param {别名集合} aliasMap
 */
function expressionText(text, arr, aliasMap) {
  for (const iterator of arr) {
    if (iterator.type === 2) {
      text += aliasMap[iterator.tableIdx + ''] + '.' + iterator.columnName + ' '
    } else if (iterator.type === 3) {
      text += '${' + iterator.value + '}' + ' '
    } else {
      text += iterator.value + ' '
    }
    if (iterator.children && iterator.children.length > 0) {
      text = expressionText(text, iterator.children, aliasMap)
    }
  }
  return text
}

/**
 * 获取filter
 * @param {*} filter
 * @param {*} aliasMap
 */
function getFilterStr(filter, aliasMap) {
  let result = ''
  if (filter[0].type === '1') {
    result += expressionText('', filter[0].value, aliasMap)
  } else {
    result = getChildrenFilterStr(filter[0], aliasMap, result, true)
  }
  return result
}

/**
 * 获取filter递归
 * @param {*} node
 * @param {*} aliasMap
 * @param {*} result
 */
function getChildrenFilterStr(node, aliasMap, result, first) {
  if (!first) {
    result += '('
  }
  for (const [index, iterator] of node.children.entries()) {
    if (index === 1) {
      result += node.value + ' '
    }
    if (iterator.type === '1') {
      result += expressionText('', iterator.value, aliasMap)
    } else {
      result = getChildrenFilterStr(iterator, aliasMap, result)
    }
  }
  if (!first) {
    result += ')'
  }
  return result
}

/**
 * 分组
 * @param {*} groupInfo
 * @param {*} aliasMap
 */
function getGroupByStr(groupInfo, aliasMap) {
  let groupByStr = ''
  for (const table of groupInfo) {
    for (const column of table.columns) {
      groupByStr += aliasMap[table.tableIdx + ''] + '.' + column.columnName + ','
    }
  }
  return groupByStr
}

function getOrderByStr(T05JoinOrder, middleNode, modelJson, aliasMap) {
  let sql = 'order by '
  // 遍历查询结果
  for (const [index, iterator] of T05JoinOrder.entries()) {
    if (index !== 0) {
      sql += ','
    }
    if (Number.isFinite(iterator.expressionNumber)) {
      const joinExpression = middleNode.T05JoinExpression.find(item => item.columnIdx === iterator.expressionNumber)
      sql += expressionText('', joinExpression.expression, aliasMap)
    } else {
      const tableNumber = iterator.tableNumber
      const tableIdx = iterator.tableIdx
      const modelTable = modelJson.T05ModelTable.find(item => item.tableNumber === tableNumber)
      const modelColumn = modelTable.T05ModelColumn.find(item => item.columnNumber === iterator.columnNumber)
      sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName + ' '
    }
    sql += iterator === '2' ? 'desc' : 'asc'
  }
  return sql
}
