# vuex-multi-history

[![Build Status](https://travis-ci.com/Veake/vuex-multi-history.svg?token=Bg4GBGTdq9xroxnkokv8&branch=master)](https://travis-ci.com/Veake/vuex-multi-history)
[![npm version](https://badge.fury.io/js/vuex-multi-history.svg)](https://badge.fury.io/js/vuex-multi-history)
[![codecov](https://codecov.io/gh/Veake/vuex-multi-history/branch/master/graph/badge.svg)](https://codecov.io/gh/Veake/vuex-multi-history)

Multiple histories for Vuex

## Requirements

- npm or yarn

## Getting Started

1.  Install the dependencies: \
    `npm install vue vuex vuex-history-plugin` \
    or \
    `yarn add vue vuex vuex-history-plugin`

    or by using a CDN: \
    `<script src="https://unpkg.com/vuex-multi-history@<version>/dist/index.umd.js"></script>`

    > **INFO if using a CDN**:
    >   
    > Replace `<version>` with an available npm-version of `vuex-multi-history` that's higher than or equal to *2.0.1*.\
    > The root of this module will be available via `window.VuexMultiHistory` and `VuexMultiHistory` if loading it via a `<script>`-tag.

2.  Initialize the plugin:

    ```typescript
    import { VuexMultiHistory } from 'vuex-multi-history';
    ...

    const options = {};
    const vuexHistory = new VuexMultiHistory(options);
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

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Initializing a single history](#initializing-a-single-history)
  - [Initializing multiple histories](#initializing-multiple-histories)
  - [Using a history](#using-a-history)
- [Options](#options)
  - [`histories`-Options](#histories-options)
  - [`transform`-Options](#transform-options)
- [Types](#types)
  - [Store](#store)
  - [`VuexMultiHistory`](#vuexmultihistory)
    - [Constructor](#constructor)
    - [Properties](#properties)
    - [Methods](#methods)
  - [`HistorySnapshot`](#historysnapshot)
  - [`VuexHistory`](#vuexhistory)
    - [Properties](#properties-1)
    - [Properties](#find-options)
    - [Methods](#methods-1)
  - [Functions](#functions)
    - [`FilterFunction`](#filterfunction)
    - [`AllocateFunction`](#allocatefunction)
    - [`SerializeFunction`](#serializefunction)
    - [`DeserializeFunction`](#deserializefunction)
- [Docs](#docs)

## Usage

### Initializing a single history

By default a single history will be initialized if you do not modify the [`histories`](#histories-options)-object of the options of [`VuexMultiHistory`](#vuexmultihistory), which can be either done by passing it to the constructor or setting it manually.

Example:

```typescript
import { VuexMultiHistory } from 'vuex-multi-history';

const vuexHistory = new VuexMultiHistory();
```

Example (CommonJS):

```javascript
const VuexMultiHistory = require('vuex-multi-history');

const vuexHistory = new VuexMultiHistory.VuexMultiHistory();
```

### Initializing multiple histories

It is possible to initialize multiple histories. This can be done by modifying the [`histories`](#histories-options)-object of the options of [`VuexMultiHistory`](#vuexmultihistory), which can be either done by passing it to the constructor or setting it manually.

For each key of [`histories.keys`](#histories-options) a history will be created, which will also be accessible by the given key. \
Also [`histories.allocate`](#histories-options) has to be provided, which is of the type [`AllocateFunction`](#allocatefunction) and used to determine to which histories the snapshot will be added.
You can read more about the [`AllocateFunction`](#allocatefunction) [here](#allocatefunction).

Example:

```typescript
import { VuexMultiHistory } from 'vuex-multi-history';

const vuexHistory = new VuexMultiHistory({
  histories: {
    allocate: (mutation) => {
      return mutation.type === 'someType' ? ['historyA'] : ['historyB'];
    },
    keys: ['historyA', 'historyB'],
  },
});
```

> The store that uses the plugin will have two separate histories: 'historyA' and 'historyB'

### Using a history

Now anywhere in the code, where the Vuex-`Store` that uses this plugin is accessible, the `Store`'s [`history`](#store)-method can be used. \
The [`history`](#store)-method has the following signature:

```typescript
history(historyKey?: string): VuexHistory;
```

> **INFO**:
>
> - If you do not pass a historyKey the plugin will assume that you mean the first key declared in [`histories.keys`](#histories-options).
> - If you pass a key that is not declared in [`histories.keys`](#histories-options) an error will be thrown because this is a logical error.

After retrieving a [`VuexHistory`](#vuexhistory)-instance you can use it's methods and access it's properties which are listed [here](#vuexhistory).

Example:

```typescript
this.$store.history('historyKey').undo();
```

## Options

Options can be passed to the constructor of [`VuexMultiHistory`](#vuexmultihistory). The type of these options is [`VuexMultiHistoryOptions`](#options).

The available options are listed in the tables below:

> \* default values written in related object

| key       | type                                | default      | description                                                                                             |
| --------- | ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| debug     | `boolean`                           | false        | Determines whether error-messages should be printed                                                     |
| size      | `number`                            | 50           | Maximum amount of snapshots a history can hold. If the maximum is reached the first one will be removed |
| filter    | [`FilterFunction`](#filterfunction) | returns true | Determines whether the given mutation is supported                                                      |
| histories | `HistoriesOptions`                  | \*           | Options related to the histories                                                                        |
| transform | `TransformOptions`                  | \*           | Options related to serializing and deserializing state-data                                             |

> All the options above are optional

#### `histories`-Options

The options beneath are required when the `histories`-object is passed.

| key      | type                                    | default                               | description                                                      |
| -------- | --------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| allocate | [`AllocateFunction`](#allocatefunction) | returns first key of `histories.keys` | Determines which history/histories a snapshot should be added to |
| keys     | `string[]`                              | `['default']`                         | For each given key a separate history will be created            |

#### `transform`-Options

The options beneath are required when the `transform`-object is passed.

| key         | type                                          | default                         | description                                                           |
| ----------- | --------------------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| serialize   | [`SerializeFunction`](#serializefunction)     | returns complete state          | Reduces the state-object when it will be added to the history         |
| deserialize | [`DeserializeFunction`](#deserializefunction) | returns complete snapshot-state | Will be used to merge the reduced state-object with the current state |

## Types

### Store

The plugin adds a method with the signature `history(historyKey?: string): VuexHistory` to the prototype of `Store`. \
That makes is possible to call `store.history()` or `store.history(key)` to retrieve a [`VuexHistory`](#vuexhistory).

> **INFO**:
>
> - If you do not pass a historyKey the plugin will assume that you mean the first key declared in [`histories.keys`](#histories-options).
> - If you pass a key that is not declared in [`histories.keys`](#histories-options) an error will be thrown because this is a logical error.

### `VuexMultiHistory`

A [`VuexMultiHistory`](#vuexmultihistory)-object has the following constructor, properties and methods:

#### Constructor

The options that can be passed to the plugin are listed [here](#options). \
The constructor has the following signature:

```typescript
new VuexHistory(plugin: VuexMultiHistory, historyKey: string): VuexHistory
```

#### Properties

All properties are `readonly` and cannot be replaced.

| key     | type                                             | description                                                                       |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| options | [`VuexMultiHistoryOptions`](#options)            | read more [here](#options)                                                        |
| data    | `{ historyMap: { [key: string]: VuexHistory } }` | keeps track of the histories                                                      |
| plugin  | `VuexPlugin`                                     | plugin-instance that has to be added `plugins` when initializing the Vuex-`Store` |

#### Methods

For all these methods the `historyKey` will be the first key in [`histories.keys`](#histories-options) of the options.

| signature                                          | description                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `getHistory(historyKey?: string): VuexHistory`     | returns the [`VuexHistory`](#vuexhistory) with the given key; if there is no history for the key, an error will be thrown |
| `serialize(historyKey?: string, state: any): any`  | serializes the given state, you can read more [here](#serializefunction)                                                  |
| `deserialize(historyKey?: string, data: any): any` | deserialized the given data to a state, you can read more [here](#deserializefunction)                                    |

### `HistorySnapshot`

A [`HistorySnapshot`](#historysnapshot) is an object hat has the following signature:

```typescript
{
  mutation: string;
  stateData: any;
}
```

Whenever a mutation occurs in the Vuex-`Store` and it passes the [`filter`](#options) as well as the [`allocate`](#histories-options)-function the `addSnapshot`-function of the [`VuexHistory`](#vuexhistory) will be called and a new instance of [`ReferencableHistorySnapshot`](#historysnapshot) will be created.

The difference between [`ReferencableHistorySnapshot`](#historysnapshot) and [`HistorySnapshot`](#historysnapshot) is that [`ReferencableHistorySnapshot`](#historysnapshot) has an additional `id`-property which will be managed by the [`VuexHistory`](#vuexhistory)-instance.

### `VuexHistory`

A [`VuexHistory`](#vuexhistory)-object has the following properties and methods:

#### Properties

| key          | type   | description                                                                        |
| ------------ | ------ | ---------------------------------------------------------------------------------- |
| length       | number | returns the amount of snapshots the history has                                    |
| index        | number | returns the index the history is currently at                                      |
| initialState | any    | returns the initial state of the history; the result is automatically deserialized |
| idCount      | number | returns the number the id counter is currently at                                  |

#### Find Options

`FindSnapshotOptions`: accepts `{ id: number }` or `{ index: number }` or `{ instance: ReferencableHistorySnapshot }`

`GetSnapshotOptions`: accepts `{ id: number }` or `{ index: number }`

`GetSnapshotIndexOptions`: accepts `{ id: number }` or `{ instance: ReferencableHistorySnapshot }`

> **INFO**:
>
> If more than one option is provided, the function will return `undefined` (`getSnapshot`) or `-1` (`getSnapshotIndex`). \
> Examples: \
> `getSnapshot({ id: 1, index: 0 })` will return `undefined` \
> `getSnapshotIndex({ id: 1, instance: someInstance })` will return `-1`

#### Methods

| signature                                                                                                 | description                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addSnapshot(snapshot: HistorySnapshot): VuexHistory`                                                     | adds a snapshot to the history                                                                                                                              |
| `getSnapshot(options: GetSnapshotOptions): ReferencableHistorySnapshot`<code>&#124;</code>`undefined`     | returns a copy of a snapshot of the history                                                                                                                 |
| `getSnapshotIndex(options: GetSnapshotIndexOptions): number`                                              | returns the index of a snapshot of the history                                                                                                              |
| `removeSnapshot(options: FindSnapshotOptions): ReferencableHistorySnapshot`<code>&#124;</code>`undefined` | deletes a snapshot of the history                                                                                                                           |
| `updateSnapshot(options: FindSnapshotOptions, snapshot: ReferencableHistorySnapshot): VuexHistory`        | updates a snapshot of the history                                                                                                                           |
| `goto(options: FindSnapshotOptions): VuexHistory`                                                         | jumps to the state of the related snapshot if there is any                                                                                                  |
| `canUndo(amount: number = 1): boolean`                                                                    | returns if undo is possible                                                                                                                                 |
| `undo(amount: number = 1): VuexHistory`                                                                   | undoes the last snapshot                                                                                                                                    |
| `canRedo(amount: number = 1): boolean`                                                                    | returns if redo is possible                                                                                                                                 |
| `redo(amount: number = 1): VuexHistory`                                                                   | redoes the next possible snapshot                                                                                                                           |
| `hasChanges(): boolean`                                                                                   | returns if there are any snapshots in the history                                                                                                           |
| `overrideInitialState(state): VuexHistory`                                                                | overrides the initial state                                                                                                                                 |
| `clearHistory(overrideInitialState: boolean = true): void`                                                | clears the history and by default overrides the initial state, this flag can be set to `false` to avoid overriding                                          |
| `reset(): void`                                                                                           | clears the history and replaces the current state with the initial                                                                                          |
| `serialize(state: any): any`                                                                              | gives access to the [`SerializeFunction`](#serializefunction); should be used when manually adding a snapshot; you can read more [here](#serializefunction) |
| `deserialize(data: any): void`                                                                            | gives access to the [`DeserializeFunction`](#deserializefunction); you can read more [here](#deserializefunction)                                           |

### Functions

Every function will be called with having `this` set to the instance of [`VuexMultiHistory`](#vuexmultihistory), this way the functions have access to properties and methods of [`VuexMultiHistory`](#vuexmultihistory).

#### `FilterFunction`

A [`FilterFunction`](#filterfunction) has the following signature:

```typescript
(mutation: MutationPayload): boolean;
```

The aim of this function is to determine whether the given `mutation` is allowed to be added to any history or not. \
If the function returns `true`, it will be added, if it returns `false` the mutation will not processed any further and not added to any history.

#### `AllocateFunction`

The [`AllocateFunction`](#allocatefunction) is called after the [`FilterFunction`](#filterfunction) if it returned `true` or if the `filter` in the options was explicitly set to `undefined` or `null`. \
It has the following signature:

```typescript
(mutation: MutationPayload): string[];
```

The aim of this function is to determine, based on the `mutation`, to which histories the snapshot will be added.
The returned strings should be those or a subset of those, that are in the options in [`histories.keys`](#histories-options).

> **INFO**:
>
> If a key is returned that is not in [`histories.keys`](#histories-options) an error will be thrown, because this is a logical error.

#### `SerializeFunction`

The [`SerializeFunction`](#serializefunction) is called when a snapshot is about to be saved. It determines which data will be saved in the snapshot and can be used to reduce the stored data drastically, as well as making it possible to just replace parts of the state. \
It has the following signature:

```typescript
(historyKey: string, state: any): any;
```

#### `DeserializeFunction`

The [`DeserializeFunction`](#deserializefunction) is called when the data of a snapshot is taken to update the current state and it is supposed to rebuild the state of the snapshot by merging the current state with the data. \
This way not the whole state will be brought back to it's state of the snapshot. \
It has the following signature:

```typescript
(historyKey: string, data: any): any;
```

## Docs

You can take a look at the docs [here](https://veake.github.io/vuex-multi-history/) for in-depth and up-to-date type-declarations.
