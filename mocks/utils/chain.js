const sift = require('sift')
// const {JSONPath} = require('jsonpath-plus')

const STATES = ['PUBLIC', 'DRAFT', 'TRASH']

const _stBad = {
  status: 404,
  error: 'Bad request',
  message: '`_st` must be a coma-separated subset of `PUBLIC`, `DRAFT`, and `TRASH`'
}
const resolveState = (_st = 'PUBLIC') => {
  let _stSplit = [_st]
  if(_st.indexOf(',') !== -1) {
    _stSplit = _st.split(',')
  }

  return _stSplit.every(element => STATES.includes(element)) ? _stSplit : _stBad
}

const _pBad = {
  status: 404,
  error: 'Bad request',
  message: '`_p` must be a coma-separated subset of the collection keys'
}
const resolveProjection = (_p = [], keys) => {
  let _pSplit = Array.isArray(_p) ? _p : [_p]
  if(!Array.isArray(_p) && _p.indexOf(',') !== -1) {
    _pSplit = _p.split(',')
  }

  if(_pSplit.length === 0) {
    return keys
  }

  const reg = _pSplit.filter((p) => p !== '_id')
  return reg.every(element => keys.includes(element)) ? ['_id', ...reg] : _pBad
}

const _qBad = {status: 404, error: 'Bad request'}
const resolveQuery = (_q = '{}') => {
  try {
    return sift(JSON.parse(_q))
  } catch (err) {
    return {..._qBad, message: err}
  }
}

// const resolveSort = (_s, keys) => {
//   const DEFAULT_SORT = ['updatedAt', 'desc']
//   if(!_s) {
//     return _s = DEFAULT_SORT
//   }

//   const matches = _s.match(/-?(.*)/)
//   if(!matches) {
//     return _s = DEFAULT_SORT
//   }

//   if(keys.includes(matches[0])) {
//     return _s.chartAt(0) === '-' ? _s = [matches[0], 'desc'] : [matches[0], 'asc']
//   }

//   return _s = DEFAULT_SORT
// }

const _skBad = {status: 404, error: 'Bad request', message: '`skip` must be a non-negative integer number'}
const _lBad = {status: 404, error: 'Bad request', message: '`limit` must be a non-negative integer number'}
const resolvePagination = (_sk = '0', _l = '200') => {
  const skip = Number.parseInt(_sk)
  const limit = Number.parseInt(_l)
  if (Number.isNaN(skip) || (!Number.isNaN(skip) && skip < 0) || skip.toString() !== _sk) {
    return _skBad
  } else if (Number.isNaN(limit) || (!Number.isNaN(limit) && limit < 0) || limit.toString() !== _l) {
    return _lBad
  }

  return [skip, limit]
}

function chain(request, collection = [], {noSkip = false} = {}) {
  const {query = {}} = request

  // 1. _st
  const _st = resolveState(query._st)
  if(_st.error) {
    return _st
  }

  // 2. _sk, _l
  const pagination = resolvePagination(query._sk, query._l)
  if(pagination.error) {
    return pagination
  }
  const [_sk, _l] = pagination

  // 3. _p
  const _p = resolveProjection(query._p, Object.keys(collection[0] ?? {}))
  if(_p.error) {
    return _p
  }

  // 4. _q
  const _q = resolveQuery(query._q)
  if(_q.error) {
    return _q
  }

  // TODO 5. _s sorting
  // const _s = resolveSort(query._s, Object.keys(map[0] ?? {}))

  // _st and _q must be filtered anyway (both GET / and GET /count)
  const beforeSkip = collection.filter(({__STATE__}) => _st.includes(__STATE__))
    .filter(_q)/*.sort(({[_s[0]]: a}, {[_s[0]]: b}) => {
      if(!a && !b) {
        return 0
      }

      if(a && b) {
        return _s[1] === 'desc' ? a > b : a < b
      } 
    })*/

  // on count we skip pagination (use flag `noSkip`)
  const f = noSkip ? beforeSkip : beforeSkip.slice(_sk, _sk + _l)

  return _p.length === 0 ? f : f.map((element) => {
    return Object.entries(element).reduce((acc, [key, value]) => {
      if (_p.includes(key)) {
        acc[key] = value
      }
      return acc
    }, {})
  })
}

module.exports = chain
