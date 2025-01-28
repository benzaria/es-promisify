import ms from 'ms';

type PromisifyFunction = (...args: any[]) => any;
type PromisifyObject = {
    [key: string | number | symbol]: any;
};
type PromisifyTarget = PromisifyFunction | PromisifyObject;
type timeoutType = ms.StringValue | number;
type bindType = 'this' | PromisifyObject | optionsType;
type cbType = 'errFirst' | 'resultOnly';
type optionsType = {
    timeout?: timeoutType;
    bind?: bindType;
    cbType?: cbType;
    cache?: boolean;
};
interface cache {
    set: (target: PromisifyTarget, the_cache: {
        promise: PromisifyPromise<PromisifyTarget>;
        options: optionsType;
    }) => void;
    get: (target: PromisifyTarget, options?: optionsType) => {
        promise: PromisifyPromise<PromisifyTarget> | undefined;
        options: optionsType | undefined;
    };
}
type cacheType = WeakMap<PromisifyTarget, {
    promise: PromisifyPromise<PromisifyTarget>;
    options: optionsType;
}>;
type PromisifyPromiseFunction<T extends PromisifyFunction> = (...args: Parameters<T>) => Promise<ReturnType<T>>;
type PromisifyPromiseObject<T extends PromisifyObject> = {
    [K in keyof T]: T[K] extends PromisifyFunction ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> : T[K];
};
type PromisifyPromise<T> = T extends PromisifyFunction ? (...args: Parameters<T>) => Promise<ReturnType<T>> : {
    [K in keyof T]: T[K] extends PromisifyFunction ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> : T[K];
};
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
declare class Promisify {
    $_Promise: PromiseConstructor;
    static Cache: cacheType;
    defOptions: optionsType;
    constructor(customPromiseModule?: PromiseConstructor, options?: optionsType);
    cache: cache;
    /**
     * Converts a time value to milliseconds.
     * @param {timeoutType} time The time value to convert. Can be a string or a number.
     *               If a string is provided, it will be parsed using the `ms` library.
     *               If a number is provided, it will be returned as is.
     * @returns {number} The time value in milliseconds.
     * @memberof Promisify
     */
    private msTime;
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
     * @param {timeoutTyper} [timeout=0] Optional timeout for the promisified methods.
     * @param {bindType} [bind=obj] The context for the function, `"this"` refere to the `target`
     * @returns {PromisifyPromiseObject<T>} The object with promisified methods.
     * @memberof Promisify
     */
    objpromisify<T extends PromisifyObject>(obj: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, cache?: boolean): PromisifyPromiseObject<T>;
    /**
     * Promisifies a function.
     * @param {T} target The function to be promisified.
     * @param {timeoutTyper} [timeout=0] Optional timeout for the promisified function.
     * @param {bindType} [bind=target] The context for the function, `"this"` refere to the `target`
     * @returns {PromisifyPromiseFunction<T>} The promisified function.
     * @memberof Promisify
     */
    promisify<T extends PromisifyFunction>(target: T, timeout?: timeoutType, bind?: bindType, cbType?: cbType, cache?: boolean): PromisifyPromiseFunction<T>;
    /**
     * Handles the promisification of functions or objects.
     * @param {T} target The target function or object to be promisified.
     * @param {optionsType} [options] Options to controle the promise behavior.
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
     * @param {timeoutTyper} [timeout=0] Timeout for the promisified methods
     * @param {optionsType} [options] Options to controle the promise behavior.
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
     * @param {timeoutTyper} [timeout=0] Timeout for the promisified methods.
     * @param {bindType} [bind=target] The context for the function or object, `"this"` refere to the `target`.
     * @param {optionsType} [options] Options to controle the promise behavior.
     * @returns {PromisifyPromise<T>} The promisified function or object.
     * @memberof Promisify
     */
    handler<T extends PromisifyTarget>(target: T, timeout?: timeoutType, bind?: bindType, options?: {
        cbType?: cbType;
        cache?: boolean;
    }): PromisifyPromise<T>;
}
declare const newPromisify: (customPromiseModule?: PromiseConstructor, options?: optionsType) => Promisify["handler"];
declare const _default: Promisify["handler"];

type types = {
    PromisifyFunction: PromisifyFunction;
    PromisifyObject: PromisifyObject;
    PromisifyTarget: PromisifyTarget;
    PromisifyPromiseFunction: PromisifyPromiseFunction<any>;
    PromisifyPromiseObject: PromisifyPromiseObject<any>;
    PromisifyPromise: PromisifyPromise<any>;
    PromisifyHandler: Promisify["handler"];
    timeoutType: timeoutType;
    bindType: bindType;
    cbType: cbType;
    optionsType: optionsType;
    cache: cache;
    cacheType: cacheType;
};

export { Promisify, newPromisify, _default as default, type types };
