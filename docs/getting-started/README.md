# Getting Started

## Requirements

First you have to make sure that:

- Node.js v8 or newer is installed
- A Vue.js project that uses Vuex

## Installation

1. Install the dependencies: \
   `npm install vuex-multi-history` or `yarn add vuex-multi-history`

2. Initialize the plugin:

   ```typescript
   import {VuexMultiHistory} from 'demo/.yalc/vuex-multi-history/dist/index';

   ...

   const vuexMultiHistory = new VuexMultiHistory();
   ```

3. Register the plugin in the store:
   ```typescript
   export default new Vuex.Store({
    state: {...},
    mutations: {...},
    ...
    plugins: [vuexMultiHistory.plugin],
   });
   ```

## Usage

A single history was created, because no options was defined and that is the default behavior. \
This history is now accessible by calling `history()` on the Vuex `Store`-instance, which will return an instance of `VuexHistory`.

`VuexHistory` has methods like `undo`, `redo`, `reset` and more.

Example:

```typescript
```
