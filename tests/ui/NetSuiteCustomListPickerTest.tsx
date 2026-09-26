import {render} from '@testing-library/react-native';

import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';

import Navigation from '@libs/Navigation/Navigation';

import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';

import ROUTES from '@src/ROUTES';

import type {GestureResponderEvent} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@components/MenuItem/layout/MenuItemRoot', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

describe('NetSuiteCustomListPicker', () => {
    const mockedMenuItemRoot = jest.mocked(MenuItemRoot);
    const mockedNavigate = jest.mocked(Navigation.navigate);

    beforeEach(() => {
        mockedMenuItemRoot.mockClear();
        mockedNavigate.mockClear();
    });

    it('navigates to the selector route using the route policyID when the picker is pressed', () => {
        render(<NetSuiteCustomListPicker policyID="P1" />);

        mockedMenuItemRoot.mock.lastCall?.[0].onPress?.(createMock<GestureResponderEvent>({}));

        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR.getRoute('P1'));
    });

    it('does not navigate when policyID is undefined so an "undefined" deep link is never produced', () => {
        render(<NetSuiteCustomListPicker />);

        mockedMenuItemRoot.mock.lastCall?.[0].onPress?.(createMock<GestureResponderEvent>({}));

        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});
