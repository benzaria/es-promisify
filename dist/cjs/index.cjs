"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Promisify: () => Promisify,
  default: () => promisify,
  newPromisify: () => newPromisify,
  proxy: () => proxy
});
module.exports = __toCommonJS(index_exports);
var import_to_ms = __toESM(require("@benzn/to-ms"), 1);
var Promisify = class _Promisify {
  static Cache = /* @__PURE__ */ new WeakMap();
  $Promise = Promise;
  /**
   * Default options for the promisify function.
   * @property {number} timeout — The timeout duration in milliseconds. Default is 0 = no timeout.
   * @property {string} bind — The context (`this` value) to bind the function to. Default is 'this' = target.
   * @property {string} cbType — The type of callback pattern used. Default is 'errFirst'.
   * @property {boolean} cache — Indicates whether to cache the result. Default is true.
   */
  defOptions = {
    timeout: 0,
    bind: "this",
    cbType: "errFirst",
    cache: !0
  };
  constructor(customPromiseModule, defOptions) {
    this.$Promise = customPromiseModule ?? this.$Promise, this.defOptions = defOptions ?? this.defOptions;
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
  cache = {
    set: (target, the_cache) => {
      _Promisify.Cache.set(target, the_cache);
    },
    get: (target, options) => {
      let cache = _Promisify.Cache.get(target);
      if (cache && JSON.stringify(cache.options) === JSON.stringify(options))
        return cache;
    }
  };
  /**
   * Checks if the provided object matches the expected options type.
   * @param {optionsType|object} obj The object to be checked against the default options.
   * @returns {boolean} `true` if the object is a valid options type, `false` otherwise.
   */
  isOptions(obj) {
    return !(!obj || Object.keys(obj).length > Object.keys(this.defOptions).length || !Object.keys(obj).every((key) => key in this.defOptions));
  }
  /**
   * Parses the arguments and merges them with the default options.
   * @param {PromisifyTarget} target The target function or object to be promisified.
   * @param {any[]} args Additional arguments that may include options.
   * @returns The merged options object.
   */
  optionsParse(target, ...args) {
    let options = { ...this.defOptions }, opt = args[args.length - 1];
    return opt && (Object.assign(options, {
      timeout: args[0] ?? this.defOptions.timeout,
      bind: args[1] !== "this" ? args[1] ?? target : target,
      cbType: args[2] ?? this.defOptions.cbType,
      cache: args[3] ?? this.defOptions.cache
    }), this.isOptions(opt) && Object.assign(options, opt)), options;
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
  objpromisify(obj, options) {
    return new Proxy(obj, {
      get: (obj2, prop, receiver) => {
        let target = Reflect.get(obj2, prop, receiver);
        return typeof target != "function" ? target : this.promisify(target, options);
      },
      set: (obj2, prop, value, receiver) => Reflect.set(obj2, prop, value, receiver)
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
  promisify(target, options) {
    let { timeout, bind, cbType, cache } = { ...this.defOptions, ...options }, msTimeout = (0, import_to_ms.default)(timeout), promise = (...args) => new this.$Promise((resolve, reject) => {
      let __timeout;
      args.push((...results) => {
        clearTimeout(__timeout), cbType === "errFirst" ? (results[0] && reject(results[0]), results.shift(), resolve(results.length > 1 ? results : results[0])) : resolve(results);
      }), target.call(bind, ...args), msTimeout && (__timeout = setTimeout(() => reject(new Error(`Operation timed out after ${msTimeout}ms '${timeout}'`)), msTimeout));
    });
    return cache && this.cache.set(target, { promise, options: { timeout, bind, cbType } }), promise;
  }
  handler(target, ...args) {
    let { timeout, bind, cbType, cache } = this.optionsParse(target, ...args), options = { timeout, bind, cbType, cache }, cached = this.cache.get(target, { timeout, bind, cbType });
    if (cached)
      return cached.promise;
    if (typeof target == "function")
      return this.promisify(target, options);
    if (typeof target == "object" && target !== null)
      return this.objpromisify(target, options);
    throw new TypeError(`Can only promisify functions, eventListeners or objects
target: ${target}`);
  }
}, newPromisify = (customPromiseModule, defOptions) => {
  let promisifyInstance = new Promisify(customPromiseModule, defOptions);
  return promisifyInstance.handler.bind(promisifyInstance);
}, promisify = newPromisify(), _this = function(..._args) {
  this.promisify = promisify;
}, Phandler = {
  construct(target, args) {
    let promisify2 = newPromisify(...args);
    return target.prototype.promisify = promisify2, new Proxy(new _this(), Phandler);
  },
  apply(target, _, args) {
    return target.prototype?.promisify(...args);
  },
  get(target, prop, receiver) {
    return Reflect.get(target.prototype.promisify, prop, receiver) ?? Reflect.get(Promisify, prop, receiver);
  },
  set(target, prop, value, receiver) {
    return Reflect.set(target.prototype.promisify, prop, value, receiver);
  }
}, proxy = new Proxy(new _this(), Phandler);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Promisify,
  newPromisify,
  proxy
});
