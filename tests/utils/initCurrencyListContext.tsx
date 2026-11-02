import {render} from '@testing-library/react-native';
import type {RenderAPI} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import currencyList from '../unit/currencyList.json';
import waitForBatchedUpdates from './waitForBatchedUpdates';

type OnyxInitOptions = Parameters<typeof Onyx.init>[0];

async function initCurrencyListContext(options: OnyxInitOptions): Promise<RenderAPI> {
    Onyx.init({
        ...options,
        initialKeyStates: {
            ...options?.initialKeyStates,
            [ONYXKEYS.CURRENCY_LIST]: currencyList,
        },
    });

    const provider = render(<CurrencyListContextProvider>{null}</CurrencyListContextProvider>);
    await waitForBatchedUpdates();
    return provider;
}

export default initCurrencyListContext;
