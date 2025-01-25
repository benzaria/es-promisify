import ms from "ms"
import { echo } from '../test/util' //? for Testing

export type PromisifyTarget = (...args: any[]) => any
export type PromisifyObject = { [key: string | number | symbol]: any }
export type PromisifyHandler = PromisifyTarget | PromisifyObject

export type timeoutType = ms.StringValue | number
export type bindType = 'this' | PromisifyObject | optionsType //? for IntelliSense
export type cbType = 'errFirst' | 'resultOnly'
export type optionsType = {
  timeout?: timeoutType
  bind?: bindType
  cbType?: cbType
  cache?: boolean
}

export type cache = {
  set: (target: PromisifyHandler, promise: PromisifyPromise<PromisifyHandler>, options: optionsType) => void
  get: (target: PromisifyHandler, options?: optionsType) => {
    promise: PromisifyPromise<PromisifyHandler> | undefined,
    options: optionsType | undefined,
  }
}

export type PromisifyPromiseTarget<T extends PromisifyTarget> = (...args: Parameters<T>) => Promise<ReturnType<T>>
export type PromisifyPromiseObject<T extends PromisifyObject> = {
  [K in keyof T]: T[K] extends PromisifyTarget
  ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
  : T[K]
}
export type PromisifyPromise<T> = T extends PromisifyTarget
  ? (...args: Parameters<T>) => Promise<ReturnType<T>>
  : {
    [K in keyof T]: T[K] extends PromisifyTarget
    ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
    : T[K]
  }

class Promisify {
  private $_Promise: PromiseConstructor = Promise

  static Cache: WeakMap<PromisifyHandler, { promise: PromisifyPromise<any>, options: optionsType }> = new WeakMap()

  private defOptions: optionsType = {
    timeout: 0,
    bind: 'this',
    cbType: 'errFirst',
    cache: true,
  }

  constructor(customPromiseModule?: PromiseConstructor, options?: optionsType) {
    if (customPromiseModule)
      this.$_Promise = customPromiseModule
    this.defOptions = options ?? this.defOptions
  }

  /**
   * Converts a time value to milliseconds.
   * @param {timeoutType} time - The time value to convert. Can be a string or a number.
   *               If a string is provided, it will be parsed using the `ms` library.
   *               If a number is provided, it will be returned as is.
   * @returns {number} The time value in milliseconds.
   * @memberof Promisify 
   */
  static msTime(time: timeoutType): number {
    //echo('msTime', time)
    if (typeof time === 'string') return ms(time)
    return time
  }

  private isOptions(obj: any): boolean {

    if (Object.keys(obj).length > Object.keys(this.defOptions).length)
      return false

    for (const key in obj)
      if (!(key in this.defOptions))
        return false

    return true
  }

  private argParse(target: PromisifyHandler, ...args: any[]) {

    echo(args)

    const opt = args.pop()

    let options: optionsType = {
      ...this.defOptions,
      timeout: args[0] ?? this.defOptions.timeout,
      bind: args[1] !== 'this' ? args[1] ?? target : target,
    }

    options = this.isOptions(opt)
      ? { ...options, ...opt }
      : options

    echo(options, options.bind?.toString())
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
  objpromisify<T extends PromisifyObject>(
    obj: T,
    timeout: timeoutType = 0,
    bind: bindType = obj,
    cbType: cbType = 'errFirst',
  ): PromisifyPromiseObject<T> {
    return new Proxy(obj, {
      get: (obj, prop, receiver) => {
        const target = Reflect.get(obj, prop, receiver)
        if (typeof target !== 'function') return target

        return this.promisify(target, timeout, bind, cbType)
      },
    })
  }

  /**
   * Promisifies a function.
   * @param {T} target The function to be promisified.
   * @param {timeoutTyper} [timeout=0] Optional timeout for the promisified function.
   * @param {bindType} [bind=target] The context for the function, `"this"` refere to the `target`
   * @returns {PromisifyPromiseTarget<T>} The promisified function.
   * @memberof Promisify 
   */
  promisify<T extends PromisifyTarget>(
    target: T,
    timeout: timeoutType = 0,
    bind: bindType = target,
    cbType: cbType = 'errFirst',
  ): PromisifyPromiseTarget<T> {
    const msTimeout = Promisify.msTime(timeout)
    //echo('in promisify', timeout, msTimeout)

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

    // if (cache)
    //   this.cache.set(target, { promise, options })

    return promise
  }


  /**
   * Handles the promisification of functions or objects.
   * @param {T} target The target function or object to be promisified.
   * @param {optionsType} [options] Options to controle the promise behavior.
   * @return {PromisifyPromise<T>} The promisified function or object.
   * @memberof Promisify 
   */
  handler<T extends PromisifyHandler>(
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
  handler<T extends PromisifyHandler>(
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
  handler<T extends PromisifyHandler>(
    target: T,
    timeout?: timeoutType,
    bind?: bindType,
    options?: {
      cbType?: cbType,
      cache?: boolean,
    }
  ): PromisifyPromise<T>
  handler<T extends PromisifyHandler>(
    target: T,
    ...args: any[]
  ): PromisifyPromise<T> {
    const { timeout, bind, cbType, cache } = this.argParse(target, ...args)
    const options: any = [timeout, bind, cbType, cache]
    //echo('in handler')

    const cached = this.cache.get(target, options)
    if (cached)
      return cached.promise as PromisifyPromise<T>

    if (typeof target === 'function')
      return this.promisify(target as PromisifyTarget, ...options) as PromisifyPromise<T>

    if (typeof target === 'object' && target !== null)
      return this.objpromisify(target as PromisifyObject, ...options) as PromisifyPromise<T>

    throw new TypeError(`Can only promisify functions, eventListeners or objects\ntarget: ${target}`)
  }

  cache: cache = {
    set: (target, promise, options) => {
      Promisify.Cache.set(target, { promise, options })
    },
    get: (target, options) => {
      const cache = Promisify.Cache.get(target)

      if (cache && JSON.stringify(cache.options) === JSON.stringify(options))
        return cache

      return { promise: undefined, options: undefined }
    }
  }

}

const newPromisify = (customPromiseModule?: PromiseConstructor, options?: optionsType): Promisify["handler"] => {
  const promisifyInstance = new Promisify(customPromiseModule, options)
  const promisifyHandler: typeof promisifyInstance.handler = promisifyInstance.handler.bind(promisifyInstance)
  return promisifyHandler
}

const defHandler = newPromisify()
export { newPromisify, Promisify, defHandler as default }