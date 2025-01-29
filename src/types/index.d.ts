import ms from 'ms'
import { Promisify } from "../index";

declare global {

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
    type cache = {
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


    type PromisifyHandler = {
        new(customPromiseModule?: PromiseConstructor, defOptions?: optionsType): PromisifyHandler
        Cache: cache
        defOptions: optionsType
        Promise: Promisify["$Promise"]
        <T extends PromisifyTarget>(
            target: T,
            options?: {
                timeout?: timeoutType,
                bind?: bindType,
                cbType?: cbType,
                cache?: boolean,
            }
        ): PromisifyPromise<T>
        <T extends PromisifyTarget>(
            target: T,
            timeout?: timeoutType,
            options?: {
                bind?: bindType,
                cbType?: cbType,
                cache?: boolean,
            }
        ): PromisifyPromise<T>
        <T extends PromisifyTarget>(
            target: T,
            timeout?: timeoutType,
            bind?: bindType,
            options?: {
                cbType?: cbType,
                cache?: boolean,
            }
        ): PromisifyPromise<T>
        <T extends PromisifyTarget>(
            target: T,
            timeout?: timeoutType,
            bind?: bindType,
            cbType?: cbType,
            options?: {
                cache?: boolean,
            }
        ): PromisifyPromise<T>
        <T extends PromisifyTarget>(
            target: T,
            timeout?: timeoutType,
            bind?: bindType,
            cbType?: cbType,
            cache?: boolean,
        ): PromisifyPromise<T>
    }
}