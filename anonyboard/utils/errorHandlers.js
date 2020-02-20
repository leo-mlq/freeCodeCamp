var throwError = (code, errorType, errorMessage) => error => {
  if (!error) error = new Error(errorMessage || 'Default Error')
  error.code = code
  error.errorType = errorType
  throw error
}
var throwIf = (fn, code, errorType, errorMessage) => result => {
  if (fn(result)) {
    return throwError(code, errorType, errorMessage)()
  }
  return result
}
var sendSuccess = (res, message) => data => {
  res.status(200).json({type: 'success', message, data})
}

var sendIf = (fn, res, status, errorMessage) => result => {
  if (fn(result)) {
    sendError = (res, status, errorMessage)()
  }
  return result
}

var sendError = (res, status, message) => error => {
  res.status(status || error.code).json({
    type: 'error', 
    message: message || error.message, 
    error
  })
}

module.exports = {throwError, throwIf, sendSuccess, sendIf, sendError}