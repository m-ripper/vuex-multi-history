# vuex-history-plugin

(Multi-) History for Vuex

## Demo

> Coming soon

## Getting Started

1.  `npm install vue vuex vuex-history-plugin`  
    or \
    `yarn install vue vuex vuex-history-plugin`

2.  Initialize the plugin:

    ```typescript
    import { VuexHistoryPlugin } from './VuexHistoryPlugin';

    ...

    const options = {};
    const vuexHistory = new VuexHistoryPlugin(options);
    ```

3.  Register the plugin in the store:

    ```typescript
    import { Store } from 'vuex';

    ...

    new Store({
           ...

           plugins: [vuexHistory.plugin],
    });
    ```

## Usage

When initializing the plugin you can set which histories will be initialized by passing `histories` to the options. \
For each key of `histories.keys` a separate history will be initialized. \
Example:

```typescript
const vuexHistory = new VuexHistoryPlugin({
  histories: {
    allocate: (mutation) => {
      return mutation.type === 'someType' ? ['historyA'] : ['historyB'];
    },
    keys: ['historyA', 'historyB'],
  },
});
```

As you can see you also need to provide an `allocate`-function, which is of the type `AllocationFunction` and determines in which history the next entry will be saved, based on the mutation.  \
You can read more about the `AllocationFunction` [here]().

> If you do not pass a `histories`-object to the options, the default-options will be used.

Now anywhere in your code where you have access to the vuex-`Store` you can use the `history`-method. The `history`-method has the following signature:

```typescript
history(historyKey?: string): VuexHistory;
```

If you do not pass a historyKey the plugin will assume that you mean the first key declared in `histories.keys`. \
If you pass a key that is not declared in `histories.keys` an error will be thrown because this is a logical error.

After retrieving a `VuexHistory`-instance you have access to the following methods:

| signature                                         | description                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `canUndo(): boolean`                              | returns if undo is possible                                                                                        |
| `undo(): this`                                    | undoes the last entry                                                                                              |
| `canRedo(): boolean`                              | returns if redo is possible                                                                                        |
| `redo(): this`                                    | redoes the next possible entry                                                                                     |
| `hasChanges(): boolean`                           | returns if there are any entries                                                                                   |
| `overrideInitialState(state): this`               | overrides the initial state                                                                                        |
| `clearHistory(overrideInitialState = true): void` | clears the history and by default overrides the initial state, this flag can be set to `false` to avoid overriding |
| `reset(): void`                                   | clears the history and replaces the current state with the initial                                                 |

Example:

```typescript
const history = this.$store.history('historyKey');
if (history.canUndo()) {
  history.undo();
}
```

## Options

> \* default values written in related object

| key       | type               | default | description                                                                                            |
| --------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| size      | `number`           |         | Maximum amount of entries a history can hold. If the maximum is reached the first one will be removed. |
| filter    | `FilterFunction`   |         | Determines whether the given mutation is supported                                                     |
| histories | `HistoriesOptions` | \*      | Options related to the histories                                                                       |
| transform | `TransformOptions` | \*      | Options related to serializing and deserializing state-data                                            |

##### HistoriesOptions

| key      | type                 | default                               | description                                                    |
| -------- | -------------------- | ------------------------------------- | -------------------------------------------------------------- |
| allocate | `AllocationFunction` | returns first key of `histories.keys` | Determines which history/histories an entry should be added to |
| keys     | `string[]`           | `['default']`                         | For each given key a separate history will be created          |

##### TransformOptions

| key         | type                  | default                      | description                                                           |
| ----------- | --------------------- | ---------------------------- | --------------------------------------------------------------------- |
| serialize   | `SerializeFunction`   | returns complete state       | Reduces the state-object when it will be added to the history         |
| deserialize | `DeserializeFunction` | returns complete entry-state | Will be used to merge the reduced state-object with the current state |

## Types

#### FilterFunction

#### AllocationFunction

#### SerializeFunction

#### DeserializeFunction
