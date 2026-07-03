import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import Navigation from '@libs/Navigation/Navigation';

import NetSuiteCustomListPicker from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldNew/NetSuiteCustomListPicker';

import ROUTES from '@src/ROUTES';

import {render} from '@testing-library/react-native';

jest.mock('@components/MenuItemWithTopDescription', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

describe('NetSuiteCustomListPicker', () => {
    const mockedMenuItem = jest.mocked(MenuItemWithTopDescription);
    const mockedNavigate = jest.mocked(Navigation.navigate);

    beforeEach(() => {
        mockedMenuItem.mockClear();
        mockedNavigate.mockClear();
    });

    it('navigates to the selector route using the route policyID when the picker is pressed', () => {
        render(<NetSuiteCustomListPicker policyID="P1" />);

        mockedMenuItem.mock.lastCall?.[0].onPress?.({} as never);

        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR.getRoute('P1'));
    });

    it('does not navigate when policyID is undefined so an "undefined" deep link is never produced', () => {
        render(<NetSuiteCustomListPicker />);

        mockedMenuItem.mock.lastCall?.[0].onPress?.({} as never);

        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});
