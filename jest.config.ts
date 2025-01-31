import { Config } from "jest";

export default {

    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],

} as Config