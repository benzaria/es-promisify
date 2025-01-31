import { msInput } from '@benzn/to-ms';

declare global {
    type PromisifyFunction = (...args: any[]) => any;
    type PromisifyObject = {
        [key: string | number | symbol]: any;
    };
    type PromisifyTarget = PromisifyFunction | PromisifyObject;
    type timeoutType = msInput;
    type bindType = 'this' | PromisifyObject | optionsType;
    type cbType = 'errFirst' | 'resultOnly';
    type optionsType = {
        timeout?: timeoutType;
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    };
    type cacheType = WeakMap<PromisifyTarget, {
        promise: PromisifyPromise<PromisifyTarget>;
        options: optionsType;
    }>;
    type cache = {
        set: (target: PromisifyTarget, the_cache: {
            promise: PromisifyPromise<PromisifyTarget>;
            options: optionsType;
        }) => void;
        get: (target: PromisifyTarget, options?: optionsType) => {
            promise: PromisifyPromise<PromisifyTarget> | undefined;
            options: optionsType | undefined;
        } | undefined;
    };
    type PromisifyPromiseFunction<T extends PromisifyFunction> = (...args: Parameters<T>) => Promise<ReturnType<T>>;
    type PromisifyPromiseObject<T extends PromisifyObject> = {
        [K in keyof T]: T[K] extends PromisifyFunction ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> : T[K];
    };
    type PromisifyPromise<T> = T extends PromisifyFunction ? (...args: Parameters<T>) => Promise<ReturnType<T>> : {
        [K in keyof T]: T[K] extends PromisifyFunction ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> : T[K];
    };
    type PromisifyHandler = {
        new (customPromiseModule?: PromiseConstructor, defOptions?: optionsType): PromisifyHandler;
        Cache: cache;
        defOptions: optionsType;
        Promise: Promisify["$Promise"];
        <T extends PromisifyTarget>(target: T, options?: {
            timeout?: timeoutType;
            bind?: bindType;
            cbType?: cbType;
            cache?: boolean;
        }): PromisifyPromise<T>;
        <T extends PromisifyTarget>(target: T, timeout?: timeoutType, options?: {
            bind?: bindType;
            cbType?: cbType;
            cache?: boolean;
        }): PromisifyPromise<T>;
        <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, options?: {
            cbType?: cbType;
            cache?: boolean;
        }): PromisifyPromise<T>;
        <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, options?: {
            cache?: boolean;
        }): PromisifyPromise<T>;
        <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, cache?: boolean): PromisifyPromise<T>;
    };
}

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
declare class Promisify {
    static Cache: cacheType;
    $Promise: PromiseConstructor;
    /**
     * Default options for the promisify function.
     * @property {number} timeout — The timeout duration in milliseconds. Default is 0 = no timeout.
     * @property {string} bind — The context (`this` value) to bind the function to. Default is 'this' = target.
     * @property {string} cbType — The type of callback pattern used. Default is 'errFirst'.
     * @property {boolean} cache — Indicates whether to cache the result. Default is true.
     */
    defOptions: optionsType;
    constructor(customPromiseModule?: PromiseConstructor, defOptions?: optionsType);
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
    cache: cache;
    /**
     * Checks if the provided object matches the expected options type.
     * @param {optionsType|object} obj The object to be checked against the default options.
     * @returns {boolean} `true` if the object is a valid options type, `false` otherwise.
     */
    private isOptions;
    /**
     * Parses the arguments and merges them with the default options.
     * @param {PromisifyTarget} target The target function or object to be promisified.
     * @param {any[]} args Additional arguments that may include options.
     * @returns The merged options object.
     */
    private optionsParse;
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
    objpromisify<T extends PromisifyObject>(obj: T, options?: {
        timeout?: timeoutType;
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromiseObject<T>;
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
    promisify<T extends PromisifyFunction>(target: T, options?: {
        timeout?: timeoutType;
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromiseFunction<T>;
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
    handler<T extends PromisifyTarget>(target: T, options?: {
        timeout?: timeoutType;
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
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
    handler<T extends PromisifyTarget>(target: T, timeout?: timeoutType, options?: {
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
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
    handler<T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, options?: {
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
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
    handler<T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, options?: {
        cache?: boolean;
    }): PromisifyPromise<T>;
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
    handler<T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, cache?: boolean): PromisifyPromise<T>;
}
/**
 * Creates a new instance of Promisify and returns its handler method bound to the instance.
 * @param {PromiseConstructor} [customPromiseModule] An optional custom promise implementation to use.
 * @param {optionsType} [defOptions] Optional configuration options for the Promisify instance.
 * @returns {Promisify["handler"]} The handler method of the Promisify instance, bound to the instance.
 */
declare const newPromisify: (customPromiseModule?: PromiseConstructor, defOptions?: optionsType) => Promisify["handler"];
declare const promisify: {
    <T extends PromisifyTarget>(target: T, options?: {
        timeout?: timeoutType;
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
    <T extends PromisifyTarget>(target: T, timeout?: timeoutType, options?: {
        bind?: bindType;
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
    <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, options?: {
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
    <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, options?: {
        cache?: boolean;
    }): PromisifyPromise<T>;
    <T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, cache?: boolean): PromisifyPromise<T>;
};
declare const proxy: PromisifyHandler;

export { Promisify, promisify as default, newPromisify, proxy };
