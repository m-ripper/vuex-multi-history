# Options

When instantiating the plugin, options can be passed to the constructor of `VuexMultiHistory`

Example:

```typescript
import { VuexMultiHistory } from 'vuex-multi-history';

const vuexMultiHistory = new VuexMultiHistory({
  debug: true,
  size: 20,
  histories: {
    keys: ['foo', 'bar'],
    resolve: (mutation) => {
      return mutation.type === 'someMutation' ? 'foo' : 'bar';
    },
  },
});
```

All available options are listed below.

## `VuexMultiHistoryOptions`

| key       | type               | default                                    |
| --------- | ------------------ | ------------------------------------------ |
| debug     | `boolean`          | `false`                                    |
| size      | `number`           | 50                                         |
| filter    | `FilterFunction`   | return `true`                              |
| histories | `HistoriesOptions` | see [here](/guide/usage/#historiesoptions) |
| transform | `TransformOptions` | see [here](/guide/usage/#transformoptions) |

### `HistoriesOptions`

| key     | type              | default                               |
| ------- | ----------------- | ------------------------------------- |
| keys    | `string[]`        | `['default']`                         |
| resolve | `ResolveFunction` | returns first key of `histories.keys` |

### `TransformOptions`

| key         | type                  | default                         |
| ----------- | --------------------- | ------------------------------- |
| serialize   | `SerializeFunction`   | returns complete state          |
| deserialize | `DeserializeFunction` | returns complete snapshot state |
