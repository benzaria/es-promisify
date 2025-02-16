# es-promisify

`es-promisify` is a lightweight utility that converts Node.js callback-style functions to Promises, enabling you to use modern async/await syntax with legacy APIs.

## Installation

You can install `es-promisify` via npm:

```sh
npm install es-promisify
```

## Basic Usage

Here's a basic example of how to use `es-promisify`: [More](#advance-usage)

- [x] **cjs**

```typescript
const promisify = require('es-promisify')
const fs = require('fs')

// overload-1: promisify(fn, optionsObj)
const readFileAsync = promisify(fs.readFile, { timeout: '2s', bind: fs, cbType: 'errFirst', cache: true })

readFileAsync('example.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

- [x] **esm**

```typescript
import promisify from 'es-promisify'

const fn = (str: string, cb: (err, ...res) => void) => {
  setTimeout(() => {
    cb(null, str.toUpperCase())
  }, 2e3)
}

// overload-2: promisify(fn, timeout, optionsObj)
const result = await promisify(fn, 3e3)('upperCase this!!')

console.log(result) //=> UPPERCASE THIS!! after 2s
```

## API

### promisify(target, ...params)

- `target` (Function|Object): With callback-style to convert.
- ***...params*** :
  - `timeout` (String|Number): Timeout for the promisified function.
  - `bind` (Object|String): The context for the function. `'this' = target`
  - `options` (Object): Optional settings.
    - `timeout`, `bind` : Optional overload prop, instead of the above.
    - `cbType` (String): Callback type, either 'errFirst' or 'resultOnly'.
    - `cache` (Boolean): Whether to cache the promisified function.
- Returns: A `Promise` function.

## Advance Usage

### `Promisify` class

```javascript
import { newPromisify, Promisify } from 'es-promisify'

// methode-1 
const promisify = newPromisify(customPromiseConstructor, defultOptions)
// return ↑ the handler binded to new instance

// methode-2
const P = new Promisify(/* same optional args */) 
//    ↑ the class instance
const promisify = P.handler.bind(P)
//        ↑ the handler



```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.
