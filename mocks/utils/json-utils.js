/*
 * Copyright 2021 Mia srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const {JSONPath} = require('jsonpath-plus')
const {applyOperation, deepClone} = require('fast-json-patch')

const GROUPS_CONFIGURATION = {
  function: {
    key: 'groups',
  },
}

const userGroupsObjectBuilder = (userGroups) => {
  const userGroupsObject = {}
  for (const userGroup of userGroups) {
    userGroupsObject[userGroup] = true
  }
  return userGroupsObject
}

const buildPluginFunction = (plugin) => {
  return new Function(GROUPS_CONFIGURATION.function.key, `return !!(${plugin.aclExpression})`)
}

const evaluatePluginExpression = (userGroupsObject) => {
  return (plugin) => {
    const expressionEvaluationFunction = buildPluginFunction(plugin)
    return expressionEvaluationFunction(userGroupsObject)
  }
}

const jsonPathCallback = (valuesToAvoid, expressionEvaluator) => (payload, payloadType, fullPayload) => {
  if (!expressionEvaluator(fullPayload.value)) {
    valuesToAvoid.push(payload)
  }
}

const patchCreator = (valueToAvoid) => ({
  op: 'remove',
  path: valueToAvoid,
})

const aclExpressionEvaluator = (jsonToFilter, userGroups) => {
  const clonedJsonToFilter = deepClone(jsonToFilter)
  const userGroupsObject = userGroupsObjectBuilder(userGroups)
  const expressionEvaluator = evaluatePluginExpression(userGroupsObject)
  const valuesToAvoid = []
  const pathCallback = jsonPathCallback(valuesToAvoid, expressionEvaluator)
  do {
    valuesToAvoid.splice(0)
    JSONPath({path: '$..aclExpression^', json: clonedJsonToFilter, resultType: 'pointer', callback: pathCallback})
    const [patchToApply] = valuesToAvoid
    patchToApply && applyOperation(clonedJsonToFilter, patchCreator(patchToApply))
  } while (valuesToAvoid.length !== 0)
  return clonedJsonToFilter
}

module.exports = {aclExpressionEvaluator}
