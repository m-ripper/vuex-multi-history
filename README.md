# vuex-multi-history

[![Build Status](https://travis-ci.com/m-ripper/vuex-multi-history.svg?token=Bg4GBGTdq9xroxnkokv8&branch=master)](https://travis-ci.com/m-ripper/vuex-multi-history)
[![npm version](https://badge.fury.io/js/vuex-multi-history.svg)](https://badge.fury.io/js/vuex-multi-history)
[![codecov](https://codecov.io/gh/m-ripper/vuex-multi-history/branch/master/graph/badge.svg)](https://codecov.io/gh/m-ripper/vuex-multi-history)

Multiple histories for Vuex

The Demo is available [here](https://m-ripper.github.io/vuex-multi-history/example/).

## Getting Started

1.  Install the dependencies: \
    `npm install vue vuex vuex-history-plugin` \
    or \
    `yarn add vue vuex vuex-history-plugin`

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

For more information visit the [docs](https://m-ripper.github.io/vuex-multi-history/).
