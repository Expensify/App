import {render, screen} from '@testing-library/react-native';

import SpendRuleMerchantsBase from '@components/SpendRules/configuration/SpendRuleMerchantsBase';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import React from 'react';

type RNComponent = React.ComponentType<{testID?: string; children?: React.ReactNode}>;
type ReactNative = {Pressable: RNComponent; View: RNComponent; Text: RNComponent};

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, preferredLocale: 'en'}));
jest.mock('@hooks/useThemeStyles', () => () => new Proxy({}, {get: () => ({})}));
jest.mock('@hooks/useCanWriteCardSpendRules', () => () => true);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Plus: () => null}),
    useMemoizedLazyIllustrations: () => ({FoodTruck: () => null}),
}));

jest.mock('@components/MenuItemWithTopDescription', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    const RNPressable = reactNative.Pressable;
    function MockMenuItem({pressableTestID, title}: {pressableTestID?: string; title?: string}) {
        const RNView = reactNative.View;
        return (
            <RNPressable testID={pressableTestID}>
                <RNView testID={`${pressableTestID}-title`}>{title}</RNView>
            </RNPressable>
        );
    }
    return {__esModule: true, default: MockMenuItem};
});

jest.mock('@components/MenuItem', () => ({__esModule: true, default: () => null}));
jest.mock('@components/FormAlertWithSubmitButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/HeaderWithBackButton', () => ({__esModule: true, default: () => null}));
jest.mock('@components/BlockingViews/BlockingView', () => ({__esModule: true, default: () => null}));
jest.mock('@components/ScreenWrapper', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    const RNView = reactNative.View;
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <RNView>{children}</RNView>};
});
jest.mock('@components/ScrollView', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    return {__esModule: true, default: reactNative.View};
});
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    const reactNative = jest.requireActual<ReactNative>('react-native');
    const RNView = reactNative.View;
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <RNView>{children}</RNView>};
});

type MerchantsProp = Parameters<typeof SpendRuleMerchantsBase>[0]['merchants'];

function renderMerchants(merchants: MerchantsProp) {
    return render(
        <SpendRuleMerchantsBase
            policyID="policy-1"
            action={CONST.SPEND_RULES.ACTION.ALLOW}
            merchants={merchants}
            getEditMerchantRoute={() => ROUTES.HOME as Route}
        />,
    );
}

describe('SpendRuleMerchantsBase — rowId stability', () => {
    it('rowId is derived from index alone, so editing `name` or `matchType` does not shift the focus-return identifier', () => {
        renderMerchants([
            {name: 'Acme', matchType: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS},
            {name: 'Globex', matchType: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO},
        ]);
        expect(screen.getByTestId('merchant-0')).toBeOnTheScreen();
        expect(screen.getByTestId('merchant-1')).toBeOnTheScreen();

        screen.unmount();
        renderMerchants([
            {name: 'Acme Inc', matchType: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO},
            {name: 'Globex', matchType: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO},
        ]);
        expect(screen.getByTestId('merchant-0')).toBeOnTheScreen();
        expect(screen.getByTestId('merchant-0-title').props.children).toBe('Acme Inc');
    });
});
