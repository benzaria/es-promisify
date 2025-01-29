import ms from "ms"
import './types/index.d'
// const { echo, fn } = await import('../test/util') //? for testing

/**
 * A class that provides methods to promisify functions and objects.
 * 
 * @class Promisify
 * 
 * @property {PromiseConstructor} $_Promise The Promise constructor to use for creating promises.
 * @property {WeakMap} Cache A cache to store promisified functions and objects.
 * @property {optionsType} defOptions Default options for promisification.
 * 
 * @constructor
 * @param {PromiseConstructor} [customPromiseModule] A custom Promise constructor.
 * @param {optionsType} [options] Custom options for promisification.
 * 
 * @example
 * import {newPromisify, Promisify, promisify} from 'es-promisify';
 * //       ↑ new Handler, ↑ new class, ↑ default Handler
 * 
 * // Advance: Create an instance of Promisify Handler with custom constructor and options
 * const custom_promisify = newPromisify(customPromiseConstructor, defaultOptions);
 * 
 * // Promisify a function
 * const asyncFn = promisify(fn);
 * const res = await asyncFn(...args);
 * 
 * // Promisify an object methodes
 * const asyncObj = promisify(obj);
 * const res = await asyncObj.fn(...args);
 * // or
 * const asyncFn = promisify(obj.fn, { bind: obj });
 * const res = await asyncFn(...args);
 * 
 * @moreAT https://github.com/benzaria/es-promisify / https://benzaria.github.io/es-promisify
 * 
 * @method handler Handles the promisification of functions or objects.
 * @param {T} target The target function or object to be promisified.
 * @param {timeoutType} [timeout] Timeout for the promisified methods.
 * @param {bindType} [bind] The context for the function or object, `"this"` refers to the `target`.
 * @param {cbType} [cbType] The callback type, either 'errFirst' or 'resultOnly'.
 * @param {boolean} [cache] Whether to cache the promisified function.
 * @param {optionsType} [options] Options to control the promise behavior.
 * @returns {PromisifyPromise<T>} The promisified function or object.
 * 
 * @method objpromisify Promisifies all methods of an object.
 *  @param {{
 *       timeout?: timeoutType,
 *       bind?: bindType,
 *       cbType?: cbType,
 *       cache?: boolean,
 *     }} [options] Options to controle the promise behavior.
 * @returns {PromisifyPromiseObject<T>} The object with promisified methods.
 * 
 * @method promisify Promisifies a function.
 * @param {T} target The function to be promisified.
 * @param {{
 *       timeout?: timeoutType,
 *       bind?: bindType,
 *       cbType?: cbType,
 *       cache?: boolean,
 *     }} [options] Options to controle the promise behavior.
 * @returns {PromisifyPromiseFunction<T>} The promisified function.
 * 
 * @method cache.set Sets a cache entry.
 * @param {PromisifyTarget} target The target key for the cache entry.
 * @param {cache.set.the_cache} the_cache The cache value to be set.
 * 
 * @method cache.get Retrieves a cache entry.
 * @param {PromisifyTarget} target The target key for the cache entry.
 * @param {optionsType} options Options to match the cache entry.
 * @returns {Object} The cache entry if found and options match, otherwise `undefined`.
 */
class Promisify {
  public static Cache: cacheType = new WeakMap()
  public $Promise: PromiseConstructor = Promise

  /**
   * Default options for the promisify function.
   * @property {number} timeout — The timeout duration in milliseconds. Default is 0 = no timeout.
   * @property {string} bind — The context (`this` value) to bind the function to. Default is 'this' = target.
   * @property {string} cbType — The type of callback pattern used. Default is 'errFirst'.
   * @property {boolean} cache — Indicates whether to cache the result. Default is true.
   */
  public defOptions: optionsType = {
    timeout: 0,
    bind: 'this',
    cbType: 'errFirst',
    cache: true,
  }

  constructor(customPromiseModule?: PromiseConstructor, defOptions?: optionsType) {
    this.$Promise = customPromiseModule ?? this.$Promise
    this.defOptions = defOptions ?? this.defOptions
  }

  /**
   * An object representing a cache with `set` and `get` methods.
   * @property set — A method to set a cache entry.
   * @param {PromisifyTarget} target The target key for the cache entry.
   * @param {cache.set.the_cache} the_cache The cache value to be set.
   * 
   * @property get — A method to retrieve a cache entry.
   * @param {PromisifyTarget} target The target key for the cache entry.
   * @param {optionsType} options Options to match the cache entry.
   * @returns {Object} The cache entry if found and options match, otherwise an `undefined` is returned.
   */
  public cache: cache = {
    set: (target, the_cache) => {
      Promisify.Cache.set(target, the_cache)
    },
    get: (target, options) => {
      const cache = Promisify.Cache.get(target)

      if (cache && JSON.stringify(cache.options) === JSON.stringify(options))
        return cache

      return undefined
    }
  }

  /**
   * Converts a time value to milliseconds.
   * @param {timeoutType} time The time value to convert. Can be a string or a number.
   *               If a string is provided, it will be parsed using the `ms` library.
   *               If a number is provided, it will be returned as is.
   * @returns {number} The time value in milliseconds.
   * @memberof Promisify 
   */
  private msTime(time?: timeoutType): number {
    if (!time) return 0
    if (typeof time === 'string') return ms(time)
    return time
  }


  /**
   * Checks if the provided object matches the expected options type.
   * @param {optionsType|object} obj The object to be checked against the default options.
   * @returns {boolean} `true` if the object is a valid options type, `false` otherwise.
   */
  private isOptions(obj: optionsType | object): boolean {
    if (!obj || (Object.keys(obj).length > Object.keys(this.defOptions).length))
      return false

    if (!Object.keys(obj).every(key => key in this.defOptions))
      return false

    return true
  }

  /**
   * Parses the arguments and merges them with the default options.
   * @param {PromisifyTarget} target The target function or object to be promisified.
   * @param {any[]} args Additional arguments that may include options.
   * @returns The merged options object.
   */
  private optionsParse(target: PromisifyTarget, ...args: any[]): optionsType {
    const options: optionsType = { ...this.defOptions };
    const opt = args[args.length - 1]

    if (!opt) return options

    Object.assign(options, {
      timeout: args[0] ?? this.defOptions.timeout,
      bind: args[1] !== 'this' ? args[1] ?? target : target,
      cbType: args[2] ?? this.defOptions.cbType,
      cache: args[3] ?? this.defOptions.cache,
    })

    if (this.isOptions(opt)) {
      Object.assign(options, opt)
    }

    return options
  }

  /**
   * Promisifies all methods of an object.
   * @param {T} obj The object whose methods will be promisified.
   *  @param {{
   *       timeout?: timeoutType,
   *       bind?: bindType,
   *       cbType?: cbType,
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @returns {PromisifyPromiseObject<T>} The object with promisified methods.
   * @memberof Promisify 
   */
  public objpromisify<T extends PromisifyObject>(
    obj: T,
    options?: {
      timeout?: timeoutType,
      bind?: bindType,
      cbType?: cbType,
      cache?: boolean,
    }
  ): PromisifyPromiseObject<T> {
    return new Proxy(obj, {
      get: (obj, prop, receiver) => {
        const target = Reflect.get(obj, prop, receiver);
        if (typeof target !== 'function') return target;
        return this.promisify(target, options);
      },

      set: (obj, prop, value, receiver) => {
        return Reflect.set(obj, prop, value, receiver);
      }
    });
  }

  /**
   * Promisifies a function.
   * @param {T} target The function to be promisified.
   *  @param {{
   *       timeout?: timeoutType,
   *       bind?: bindType,
   *       cbType?: cbType,
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @returns {PromisifyPromiseFunction<T>} The promisified function.
   * @memberof Promisify 
   */
  public promisify<T extends PromisifyFunction>(
    target: T,
    options?: {
      timeout?: timeoutType,
      bind?: bindType,
      cbType?: cbType,
      cache?: boolean,
    },
  ): PromisifyPromiseFunction<T> {
    const { timeout, bind, cbType, cache } = { ...this.defOptions, ...options };
    const msTimeout = this.msTime(timeout)

    const promise = (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new this.$Promise((resolve, reject) => {
        let __timeout: NodeJS.Timeout

        args.push((...results: any[]): void => {
          clearTimeout(__timeout)
          if (cbType === 'errFirst') {
            if (results[0]) reject(results[0])
            results.shift()
            resolve(results.length > 1 ? results : results[0])
          } else
            resolve(results as ReturnType<T>)
        })

        target.call(bind, ...args)

        if (msTimeout)
          __timeout = setTimeout(() => reject(new Error(`Operation timed out after ${msTimeout}ms '${timeout}'`)), msTimeout)
      })
    }

    if (cache)
      this.cache.set(target, { promise, options: { timeout, bind, cbType } })

    return promise
  }

  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {{
   *       timeout?: timeoutType,
   *       bind?: bindType,
   *       cbType?: cbType,
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @return {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify 
   */
  handler<T extends PromisifyTarget>(
    target: T,
    options?: {
      timeout?: timeoutType,
      bind?: bindType,
      cbType?: cbType,
      cache?: boolean,
    }
  ): PromisifyPromise<T>
  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {timeoutType} [timeout] Timeout for the promisified methods
   * @param {{
   *       bind?: bindType,
   *       cbType?: cbType,
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @return {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify 
   */
  handler<T extends PromisifyTarget>(
    target: T,
    timeout?: timeoutType,
    options?: {
      bind?: bindType,
      cbType?: cbType,
      cache?: boolean,
    }
  ): PromisifyPromise<T>
  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {timeoutType} [timeout] Timeout for the promisified methods.
   * @param {bindType} [bind] The context for the function or object, `"this"` refere to the `target`.
   * @param {{
   *       cbType?: cbType,
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @returns {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify 
   */
  handler<T extends PromisifyTarget>(
    target: T,
    timeout?: timeoutType,
    bind?: bindType,
    options?: {
      cbType?: cbType,
      cache?: boolean,
    }
  ): PromisifyPromise<T>
  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {timeoutType} [timeout] Timeout for the promisified methods.
   * @param {bindType} [bind] The context for the function or object, `"this"` refere to the `target`.
   * @param {cbType} [cbType] The callback type, either 'errFirst' or 'resultOnly'.
   * @param {{
   *       cache?: boolean,
   *     }} [options] Options to controle the promise behavior.
   * @return {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify
   */
  handler<T extends PromisifyTarget>(
    target: T,
    timeout?: timeoutType,
    bind?: bindType,
    cbType?: cbType,
    options?: {
      cache?: boolean,
    }
  ): PromisifyPromise<T>
  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {timeoutType} [timeout] Timeout for the promisified methods.
   * @param {bindType} [bind] The context for the function or object, `"this"` refere to the `target`.
   * @param {cbType} [cbType] The callback type, either 'errFirst' or 'resultOnly'.
   * @param {boolean} [cache] Whether to cache the promisified function.
   * @return {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify
   */
  handler<T extends PromisifyTarget>(
    target: T,
    timeout?: timeoutType,
    bind?: bindType,
    cbType?: cbType,
    cache?: boolean,
  ): PromisifyPromise<T>
  public handler<T extends PromisifyTarget>(
    target: T,
    ...args: any[]
  ): PromisifyPromise<T> {
    const { timeout, bind, cbType, cache } = this.optionsParse(target, ...args)
    const options: optionsType = { timeout, bind, cbType, cache }

    const cached = this.cache.get(target, { timeout, bind, cbType })
    if (cached)
      return cached.promise as PromisifyPromise<T>

    if (typeof target === 'function')
      return this.promisify(target as PromisifyFunction, options) as PromisifyPromise<T>

    if (typeof target === 'object' && target !== null)
      return this.objpromisify(target as PromisifyObject, options) as PromisifyPromise<T>

    throw new TypeError(`Can only promisify functions, eventListeners or objects\ntarget: ${target}`)
  }
}

/**
 * Creates a new instance of Promisify and returns its handler method bound to the instance.
 * @param {PromiseConstructor} [customPromiseModule] An optional custom promise implementation to use.
 * @param {optionsType} [defOptions] Optional configuration options for the Promisify instance.
 * @returns {Promisify["handler"]} The handler method of the Promisify instance, bound to the instance.
 */
const newPromisify = (customPromiseModule?: PromiseConstructor, defOptions?: optionsType): Promisify["handler"] => {
  const promisifyInstance = new Promisify(customPromiseModule, defOptions)
  return promisifyInstance.handler.bind(promisifyInstance)
}

const promisify = newPromisify()

const _this: new (...args: any[]) => any = function (this: any, ..._args: any[]): void {
  this.promisify = promisify;
} as any

const Phandler: ProxyHandler<any> = {
  construct(target, args) {
    const promisify = newPromisify(...args)
    target.prototype.promisify = promisify
    return new Proxy(new _this(), Phandler)
  },

  apply(target, _, args) {
    return target.prototype?.promisify(...args)
  },

  get(target, prop, receiver) {
    return Reflect.get(target.prototype.promisify, prop, receiver)
      ?? Reflect.get(Promisify, prop, receiver)
  },

  set(target, prop, value, receiver) {
    return Reflect.set(target.prototype.promisify, prop, value, receiver);
  },
}

export const proxy: PromisifyHandler = new Proxy(new _this(), Phandler)
export { Promisify, newPromisify, promisify as default }