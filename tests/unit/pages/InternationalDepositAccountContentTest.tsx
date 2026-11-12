import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {clearCorpayBankAccountFields} from '@libs/actions/BankAccounts';
import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import InternationalDepositAccountContent from '@pages/settings/Wallet/InternationalDepositAccount/InternationalDepositAccountContent';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer, useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.fn());
jest.mock('@hooks/useRootNavigationState', () => jest.fn());
jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: jest.fn(),
    useRoute: jest.fn(),
}));
jest.mock('@libs/actions/BankAccounts', () => ({clearCorpayBankAccountFields: jest.fn()}));
jest.mock('@libs/actions/FormActions', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/FormActions'),
    clearDraftValues: jest.fn(),
}));

const mockStep = jest.fn<null, [SubPageProps]>(() => null);
const nextPage = jest.fn();
const prevPage = jest.fn();
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function TestFlow() {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name={SCREENS.SETTINGS.ADD_BANK_ACCOUNT}>
                            {() => (
                                <InternationalDepositAccountContent
                                    privatePersonalDetails={undefined}
                                    corpayFields={undefined}
                                    bankAccountList={undefined}
                                    draftValues={undefined}
                                    country={CONST.COUNTRY.GB}
                                    isAccountLoading={false}
                                />
                            )}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>
    );
}

function configureStep(pageIndex: number = CONST.CORPAY_FIELDS.INDEXES.MAPPING.CONFIRMATION, isEditing = false) {
    jest.mocked(useSubPage).mockReturnValue(
        createMock<ReturnType<typeof useSubPage>>({CurrentPage: mockStep, nextPage, prevPage, pageIndex, isEditing, isRedirecting: false}),
    );
}

describe('InternationalDepositAccountContent completion navigation', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useIsFocused).mockReturnValue(true);
        jest.mocked(useRoute).mockReturnValue({key: 'bank-account', name: 'bank-account'});
        jest.mocked(useRootNavigationState).mockReturnValue({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR});
        configureStep();
    });

    it('exits when the completed confirmation regains focus without advancing again', () => {
        // Given confirmation advanced after a successful creation, not merely after pressing Confirm
        const {rerender} = render(<TestFlow />);
        act(() => mockStep.mock.lastCall?.[0].onNext());
        expect(nextPage).toHaveBeenCalledTimes(1);
        expect(goBackSpy).not.toHaveBeenCalled();

        // When success covers confirmation and browser Back restores its focus
        jest.mocked(useIsFocused).mockReturnValue(false);
        rerender(<TestFlow />);
        jest.mocked(useIsFocused).mockReturnValue(true);
        rerender(<TestFlow />);

        // Then the existing finish path clears the draft and exits rather than opening success again
        expect(goBackSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        expect(clearCorpayBankAccountFields).toHaveBeenCalledTimes(1);
        expect(nextPage).toHaveBeenCalledTimes(1);
    });

    it('does not exit an unfinished confirmation when it regains focus', () => {
        // Given confirmation has not advanced, including when a creation request fails
        const {rerender} = render(<TestFlow />);

        // When an edit or another screen covers it and the user comes back
        jest.mocked(useIsFocused).mockReturnValue(false);
        rerender(<TestFlow />);
        jest.mocked(useIsFocused).mockReturnValue(true);
        rerender(<TestFlow />);

        // Then its draft is retained and the flow is not exited
        expect(goBackSpy).not.toHaveBeenCalled();
        expect(clearDraftValues).not.toHaveBeenCalled();
        expect(clearCorpayBankAccountFields).not.toHaveBeenCalled();
    });

    it('does not mark an edit return as a successful submission', () => {
        // Given an edited bank-details step that returns to confirmation without creating an account
        configureStep(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS, true);
        const {rerender} = render(<TestFlow />);

        // When the edit is saved and that screen later regains focus
        act(() => mockStep.mock.lastCall?.[0].onNext());
        jest.mocked(useIsFocused).mockReturnValue(false);
        rerender(<TestFlow />);
        jest.mocked(useIsFocused).mockReturnValue(true);
        rerender(<TestFlow />);

        // Then only the normal edit return happens, without completed-account cleanup
        expect(goBackSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(undefined, CONST.CORPAY_FIELDS.PAGE_NAME.CONFIRM));
        expect(clearDraftValues).not.toHaveBeenCalled();
        expect(nextPage).not.toHaveBeenCalled();
    });

    it('exits on Android Back from success instead of returning to confirmation', () => {
        // Given the success screen for an account that has already been created
        configureStep(CONST.CORPAY_FIELDS.INDEXES.MAPPING.SUCCESS);
        render(<TestFlow />);

        // When its registered Android back callback runs
        let wasHandled: boolean | undefined;
        act(() => {
            wasHandled = jest.mocked(useAndroidBackButtonHandler).mock.lastCall?.[0]();
        });

        // Then the whole flow is finished and no previous wizard step is opened
        expect(wasHandled).toBe(true);
        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        expect(prevPage).not.toHaveBeenCalled();
    });
});
