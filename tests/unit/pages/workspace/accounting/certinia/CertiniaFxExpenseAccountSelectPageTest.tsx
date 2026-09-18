import {render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import type {Policy} from '@src/types/onyx';

import type {ComponentType} from 'react';

import React from 'react';

import createMock from '../../../../../utils/createMock';

jest.mock('@pages/workspace/withPolicyConnections', () => (Component: ComponentType) => Component);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const CertiniaFxExpenseAccountSelectPage = require('@pages/workspace/accounting/certinia/advanced/CertiniaFxExpenseAccountSelectPage').default;

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));

jest.mock('@hooks/useCanConfigureCurrencyConversionFees', () => ({
    __esModule: true,
    default: () => true,
}));

jest.mock('@hooks/useDynamicBackPath', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Telescope: 1}),
}));

jest.mock('@hooks/useSelectionListSearch', () => ({
    __esModule: true,
    default: (data: unknown[]) => ({filteredData: data, textInputOptions: {}}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn()},
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

function buildPolicy(config: {hasPSAOnly?: boolean; hasPSA?: boolean}): Policy {
    return createMock<Policy>({
        id: '1',
        connections: {
            financialforce: {
                config,
                data: {expenseAccounts: []},
            },
        },
    });
}

function renderPicker(config: {hasPSAOnly?: boolean; hasPSA?: boolean}) {
    render(<CertiniaFxExpenseAccountSelectPage policy={buildPolicy(config)} />);
    const selectionScreenProps = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!selectionScreenProps) {
        throw new Error('Expected SelectionScreen to render');
    }
    return selectionScreenProps;
}

describe('CertiniaFxExpenseAccountSelectPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('blocks PSA-only connections so the picker cannot be reached by deep link', () => {
        // Given: a PSA-only Certinia connection, with the currency conversion cost settings otherwise available.
        // When: the FX expense account picker is opened.
        const selectionScreenProps = renderPicker({hasPSAOnly: true, hasPSA: true});

        // Then: the picker is blocked. The Advanced page already hides the row for PSA-only.
        expect(selectionScreenProps.shouldBeBlocked).toBe(true);
    });

    it('does not block FFA connections', () => {
        // Given: an FFA Certinia connection.
        // When: the FX expense account picker is opened.
        const selectionScreenProps = renderPicker({hasPSAOnly: false});

        // Then: the picker is shown.
        expect(selectionScreenProps.shouldBeBlocked).toBe(false);
    });

    it('does not block mixed FFA and PSA connections', () => {
        // Given: a mixed FFA/PSA connection (hasPSA is true, but it is not PSA-only).
        // When: the FX expense account picker is opened.
        const selectionScreenProps = renderPicker({hasPSAOnly: false, hasPSA: true});

        // Then: the picker is shown, matching the Advanced page row.
        expect(selectionScreenProps.shouldBeBlocked).toBe(false);
    });
});
