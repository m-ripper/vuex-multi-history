---
sidebarDepth: 3
---

# Guide

The guide should give enough information to get started using `vuex-multi-history`.

## Requirements

First you have to make sure that:

- Node.js v8 or newer is installed
- A Vue.js project that uses Vuex

## Installation

1. Install the dependencies: \
   `npm install vuex-multi-history` or `yarn add vuex-multi-history`

2. Initialize the plugin:

   ```typescript
   import {VuexMultiHistory} from 'vuex-multi-history';

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
   Now the plugin is registered in the store and ready to be used.

## Usage

### Managing histories

The following methods for managing histories are available on the store after the plugin was registered:

| signature                                                    | description                                                                                                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `addHistory(historyKey: string): VuexHistory | undefined`    | Adds a new history that is related to the given key.<br>- `undefined` will be returned if a history is already related to the given key. |
| `hasHistory(historyKey: string) boolean`                     | Returns `true` if a history is related to the given key and `false` if not.                                                              |
| `removeHistory(historyKey: string): VuexHistory | undefined` | Removes a history that is related to the given key.<br>- `undefined` will be returned if no history is related to the given key.         |
| `listHistoryKeys(): string[]`                                | Lists all keys that are related to histories.                                                                                            |

These methods are also available on the `VuexMultiHistory`-instance, which you find more information about [here](/api/classes/vuexmultihistory).

For more information about the methods that were added to the store, take a look [here](/api/interfaces/_vuex_.store).

### Controlling a history

A history can be retrieved by calling `history(historyKey?: string)` on the store. The first history gets returned if no key was passed. \
This method will return an instance of `VuexHistory` that provides methods such as `undo` and `redo`.
::: warning
If no history was found that is related to the given key, an error will be thrown.
:::
The most important methods of `VuexHistory` are the following:

| signature                                                                                    | description                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `canUndo(amount: number = 1): boolean`                                                       | Returns `true` if the history can undo for the given amount and `false` if not.                                    |
| `canRedo(amount: number = 1): boolean`                                                       | Returns `true` if the history can redo for the given amount and `false` if not.                                    |
| `undo(amount: number = 1): VuexHistory`                                                      | Changes state to the state of the previous snapshot.                                                               |
| `redo(amount: number = 1): VuexHistory`                                                      | Changes state to the state of the next snapshot.                                                                   |
| `goto(options: {id: number} | {index: number} | {instance: UniqueVuexHistory}): VuexHistory` | Changes state to the state that is found by the given `id`, `index` or `instance`. Only one is possible at a time. |
| `clearHistory(): void`                                                                       | Clears the history and overrides the initial state with the current.                                               |
| `reset(): void`                                                                              | Resets the state of the history to the initial state.                                                              |

More information about `VuexHistory` is available [here](/api/classes/vuexhistory).

## Options

Options of the type `VuexMultiHistoryOptiosn` can be passed to the constructor of `VuexMultiHistory`.

Example:

```typescript
import { VuexMultiHistory } from 'vuex-multi-history';

const vuexMultiHistory = new VuexMultiHistory({
  debug: true,
  size: 20,
  histories: {
    resolve: (mutation) => {
      return mutation.type === 'someMutation' ? 'keyB' : 'keyA';
    },
    keys: ['keyA', 'keyB'],
  },
});
```

### VuexMultiHistoryOptions

| key       | type               | default        | description                                                                          |
| --------- | ------------------ | -------------- | ------------------------------------------------------------------------------------ |
| debug     | `boolean`          | `false`        | Determines whether additional debug information should be shown.                     |
| filter    | `FilterFunction`   | returns `true` | Determines whether the given mutation should be processed by the plugin.             |
| size      | `number`           | 50             | Sets the maximum amount of snapshots a history can hold before replacing the oldest. |
| histories | `HistoriesOptions` | -              | -                                                                                    |
| transform | `TransformOptions` | -              | -                                                                                    |

More information about `VuexMultiHistoryOptions` is available [here](/api/interfaces/vuexmultihistoryoptions).

#### FilterFunction

The `FilterFunction` is called when a mutation was committed. It determines whether the mutation should be further processed. \
It has the following signature:

`(this: VuexMultiHistory, mutation: MutationPayload) => boolean`

If `true` is returned the mutation will be further processed and if `false` is returned the mutation will be skipped.

More information about `FilterFunction` is available [here](/api/#filterfunction).

### HistoriesOptions

| key     | type              | default           | description                                                                    |
| ------- | ----------------- | ----------------- | ------------------------------------------------------------------------------ |
| keys    | `string[]`        | `['default']`     | Sets the default keys that are used to create the initial histories.           |
| resolve | `ResolveFunction` | returns first key | Determines to which histories a snapshot will be added for the given mutation. |

More information about `HistoriesOptions` is available [here](/api/interfaces/historiesoptions).

#### ResolveFunction

The `ResolveFunction` is called after the `FilterFunction`. It determines based on the mutation to which histories a snapshot will be added. \
It has the following signature:

`(this: VuexMultiHistory, mutation: MutationPayload) => string[]`

The resulting array should be filled with strings that are each related to a history.

More information about `ResolveFunction` is available [here](/api/#resolvefunction).

### TransformOptions

| key         | type                  | default                    | description                                                           |
| ----------- | --------------------- | -------------------------- | --------------------------------------------------------------------- |
| serialize   | `SerializeFunction`   | returns the whole state    | Allows reducing the data that will be saved in a snapshot.            |
| deserialize | `DeserializeFunction` | return the whole stateData | Allows rebuilding the state data from the reduced data in a snapshot. |

More information about `TransformOptions` is available [here](/api/interfaces/transformoptions).

#### SerializeFunction

The `SerializeFunction` is called whenever a snapshot is added. It allows reducing the data that will be saved in the snapshot based on the historyKey. \
It has the following signature:

`(this: VuexMultiHistory, historyKey: string, state: any) => any`

The resulting data will be the snapshot's data.

More information about the `SerializeFunction` is available [here](/api/#serializefunction).

#### DeserializeFunction

The `DeserializeFunction` is called whenever a snapshot's data is used to change the current state. It allows rebuilding the state data frm the reduced data in a snapshot. \
It has the following signature:

`(this: VuexMultiHistory, historyKey: string, stateData: any, state: any) => any`

The resulting data will be used to replace the current state.

More information about the `DeserializeFunction` is available [here](/api/#deserializefunction).
