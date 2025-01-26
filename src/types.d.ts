/**
 * This module provides a utility function to convert callback-based functions to promise-based functions.
 * It uses the `es-promisify` npm package to achieve this conversion.
 *
 * The `es-promisify` package is a lightweight and efficient library that allows you to promisify functions
 * that follow the Node.js callback convention (i.e., the callback is the last argument and follows the
 * pattern `callback(error, result)`).
 *
 * Usage:
 * 
 * ```javascript
 * const promisify = require('es-promisify');
 * 
 * // Example of a callback-based function
 * function callbackFunction(arg1, arg2, callback) {
 *     // Some asynchronous operation
 *     if (someError) {
 *         return callback(someError);
 *     }
 *     callback(null, result);
 * }
 * 
 * // Convert the callback-based function to a promise-based function
 * const promiseFunction = promisify(callbackFunction);
 * 
 * // Use the promise-based function
 * promiseFunction(arg1, arg2)
 *     .then(result => {
 *         // Handle the result
 *     })
 *     .catch(error => {
 *         // Handle the error
 *     });
 * ```
 *
 * This utility is particularly useful for modernizing legacy codebases or integrating with libraries
 * that still use callback-based APIs.
 */