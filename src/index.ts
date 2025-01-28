import ms from "ms"
import { echo, fn } from '../test/util' //? for Testing

type PromisifyFunction = (...args: any[]) => any
type PromisifyObject = { [key: string | number | symbol]: any }
type PromisifyTarget = PromisifyFunction | PromisifyObject

type timeoutType = ms.StringValue | number
type bindType = 'this' | PromisifyObject | optionsType //? for IntelliSense
type cbType = 'errFirst' | 'resultOnly'
type optionsType = {
  timeout?: timeoutType
  bind?: bindType
  cbType?: cbType
  cache?: boolean
}

type cacheType = WeakMap<PromisifyTarget, { promise: PromisifyPromise<PromisifyTarget>, options: optionsType }>
interface cache {
  set: (
    target: PromisifyTarget,
    the_cache: {
      promise: PromisifyPromise<PromisifyTarget>,
      options: optionsType,
    }
  ) => void
  get: (
    target: PromisifyTarget,
    options?: optionsType,
  ) => {
    promise: PromisifyPromise<PromisifyTarget> | undefined,
    options: optionsType | undefined,
  } | undefined
}

type PromisifyPromiseFunction<T extends PromisifyFunction> = (...args: Parameters<T>) => Promise<ReturnType<T>>
type PromisifyPromiseObject<T extends PromisifyObject> = {
  [K in keyof T]: T[K] extends PromisifyFunction
  ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
  : T[K]
}
type PromisifyPromise<T> = T extends PromisifyFunction //? for IntelliSense
  ? (...args: Parameters<T>) => Promise<ReturnType<T>>
  : {
    [K in keyof T]: T[K] extends PromisifyFunction
    ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
    : T[K]
  }

/**
 * The `Promisify` class provides methods to convert callback-based functions and objects into Promise-based ones.
 * It supports various options such as timeout, binding context, callback type, and caching.
 * 
 * @class Promisify
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
 * @more https://github.com/benzaria/es-promisify / https://benzaria.github.io/es-promisify
 * 
 * @param {PromiseConstructor} [customPromiseModule] Optional custom Promise implementation.
 * @param {optionsType} [defaultOptions] Optional default options for promisification.
 * 
 * @method public `objpromisify` : Promisifies all methods of an object.
 * 
 * @method public `promisify` : Promisifies a function.
 * 
 * @method public `handler` : Handles the promisification of functions or objects.
 * 
 * @property public `$_Promise` : The Promise implementation to use.
 * @property public `defOptions` : Default options for promisification.
 * @property static `Cache` : Cache for promisified targets.
 * @property public `cache` : Cache handling methods.
 */
class Promisify {
  public $_Promise: PromiseConstructor = Promise

  static Cache: cacheType = new WeakMap()

  public defOptions: optionsType = {
    timeout: 0,
    bind: 'this',
    cbType: 'errFirst',
    cache: true,
  }

  constructor(customPromiseModule?: PromiseConstructor, options?: optionsType) {
    this.$_Promise = customPromiseModule ?? this.$_Promise
    this.defOptions = options ?? this.defOptions
  }

  /**
   * An object representing a cache with `set` and `get` methods.
   * @property set : A method to set a cache entry.
   * @param {PromisifyTarget} target The target key for the cache entry.
   * @param {cache.set.the_cache} the_cache The cache value to be set.
   * 
   * @property get : A method to retrieve a cache entry.
   * @param {PromisifyTarget} target The target key for the cache entry.
   * @param {optionsType} options Options to match the cache entry.
   * @returns {Object} The cache entry if found and options match, otherwise an `undefined` is returned.
   */
  private cache: cache = {
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
  private msTime(time: timeoutType): number {
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

    for (const key in obj)
      if (!(key in this.defOptions))
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
    const opt = args.pop()

    let options: optionsType = {
      ...this.defOptions,
      timeout: args[0] ?? this.defOptions.timeout,
      bind: args[1] !== 'this' ? args[1] ?? target : target,
    }

    if (this.isOptions(opt))
      options = { ...options, ...opt }

    return options
  }

  /**
   * Promisifies all methods of an object.
   * @param {T} obj The object whose methods will be promisified.
   * @param {timeoutTyper} [timeout=0] Optional timeout for the promisified methods.
   * @param {bindType} [bind=obj] The context for the function, `"this"` refere to the `target`
   * @returns {PromisifyPromiseObject<T>} The object with promisified methods.
   * @memberof Promisify 
   */
  public objpromisify<T extends PromisifyObject>(
    obj: T,
    timeout: timeoutType = 0,
    bind: bindType = obj,
    cbType: cbType = 'errFirst',
    cache: boolean = true,
  ): PromisifyPromiseObject<T> {
    return new Proxy(obj, {
      get: (obj, prop, receiver) => {
        const target = Reflect.get(obj, prop, receiver);
        if (typeof target !== 'function') return target;
        return this.promisify(target, timeout, bind, cbType, cache);
      },

      set: (obj, prop, value, receiver) => {
        return Reflect.set(obj, prop, value, receiver);
      }
    });
  }

  /**
   * Promisifies a function.
   * @param {T} target The function to be promisified.
   * @param {timeoutTyper} [timeout=0] Optional timeout for the promisified function.
   * @param {bindType} [bind=target] The context for the function, `"this"` refere to the `target`
   * @returns {PromisifyPromiseFunction<T>} The promisified function.
   * @memberof Promisify 
   */
  public promisify<T extends PromisifyFunction>(
    target: T,
    timeout: timeoutType = 0,
    bind: bindType = target,
    cbType: cbType = 'errFirst',
    cache: boolean = true,
  ): PromisifyPromiseFunction<T> {
    const msTimeout = this.msTime(timeout)

    const promise = (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new this.$_Promise((resolve, reject) => {
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
      this.cache.set(target, { promise, options: { timeout, bind, cbType, cache } })

    return promise
  }

  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {optionsType} [options] Options to controle the promise behavior.
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
   * @param {timeoutTyper} [timeout=0] Timeout for the promisified methods
   * @param {optionsType} [options] Options to controle the promise behavior.
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
   * @param {timeoutTyper} [timeout=0] Timeout for the promisified methods.
   * @param {bindType} [bind=target] The context for the function or object, `"this"` refere to the `target`.
   * @param {optionsType} [options] Options to controle the promise behavior.
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
  public handler<T extends PromisifyTarget>(
    target: T,
    ...args: any[]
  ): PromisifyPromise<T> {
    const { timeout, bind, cbType, cache } = this.optionsParse(target, ...args)
    const options: any = [timeout, bind, cbType, cache]

    const cached = this.cache.get(target, options)
    if (cached)
      return cached.promise as PromisifyPromise<T>

    if (typeof target === 'function')
      return this.promisify(target as PromisifyFunction, ...options) as PromisifyPromise<T>

    if (typeof target === 'object' && target !== null)
      return this.objpromisify(target as PromisifyObject, ...options) as PromisifyPromise<T>

    throw new TypeError(`Can only promisify functions, eventListeners or objects\ntarget: ${target}`)
  }
}

/**
 * Creates a new instance of Promisify and returns its handler method bound to the instance.
 * @param {PromiseConstructor} [customPromiseModule] An optional custom promise implementation to use.
 * @param {optionsType} [options] Optional configuration options for the Promisify instance.
 * @returns {Promisify["handler"]} The handler method of the Promisify instance, bound to the instance.
 */
const newPromisify = (customPromiseModule?: PromiseConstructor, options?: optionsType): Promisify["handler"] => {
  const promisifyInstance = new Promisify(customPromiseModule, options)
  return promisifyInstance.handler.bind(promisifyInstance)
}

const defHandler = newPromisify()
export { Promisify, newPromisify, defHandler as default }
export type types = {
  PromisifyFunction: PromisifyFunction
  PromisifyObject: PromisifyObject
  PromisifyTarget: PromisifyTarget
  PromisifyPromiseFunction: PromisifyPromiseFunction<any>
  PromisifyPromiseObject: PromisifyPromiseObject<any>
  PromisifyPromise: PromisifyPromise<any>
  PromisifyHandler: Promisify["handler"]
  timeoutType: timeoutType
  bindType: bindType
  cbType: cbType
  optionsType: optionsType
  cacheType: cacheType
  cache: cache
}