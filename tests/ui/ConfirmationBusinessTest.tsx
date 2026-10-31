import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {SubPageProps} from '@hooks/useSubPage/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import ConfirmationBusiness from '@pages/ReimbursementAccount/USD/BusinessInfo/subSteps/ConfirmationBusiness';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {CompanyStepProps} from '@src/types/form/ReimbursementAccountForm';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {buildAchData} from '../utils/ReimbursementAccountTestUtils';
import {getOnyxData, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

const Stack = createPlatformStackNavigator<ReimbursementAccountNavigatorParamList>();

const INCORPORATION_CASES = {
    LLC: {incorporationType: 'LLC', incorporationState: 'CA'},
    CORPORATION: {incorporationType: 'CORPORATION', incorporationState: 'NY'},
    PARTNERSHIP: {incorporationType: 'PARTNERSHIP', incorporationState: 'TX'},
    COOPERATIVE: {incorporationType: 'COOPERATIVE', incorporationState: 'WA'},
    SOLE_PROPRIETORSHIP: {incorporationType: 'SOLE_PROPRIETORSHIP', incorporationState: 'CA'},
    OTHER: {incorporationType: 'OTHER', incorporationState: 'NY'},
} as const satisfies Record<keyof typeof CONST.INCORPORATION_TYPES, Pick<CompanyStepProps, 'incorporationType' | 'incorporationState'>>;

async function renderBusinessConfirmation(draft: Partial<ReimbursementAccountForm> = {}, shouldSeedAccount = true) {
    await act(async () => {
        if (shouldSeedAccount) {
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: buildAchData({incorporationType: 'CORPORATION', incorporationState: 'NY'})});
        }
        await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, draft);
    });
    const onNext = jest.fn<ReturnType<SubPageProps['onNext']>, Parameters<SubPageProps['onNext']>>();
    const onMove = jest.fn<ReturnType<SubPageProps['onMove']>, Parameters<SubPageProps['onMove']>>();
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name={SCREENS.REIMBURSEMENT_ACCOUNT_ROOT}>
                            {() => (
                                <ConfirmationBusiness
                                    isEditing={false}
                                    onNext={onNext}
                                    onMove={onMove}
                                />
                            )}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return {onNext, onMove};
}

describe('ConfirmationBusiness incorporation summary and confirmation', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        jest.clearAllMocks();
    });

    it.each(Object.values(INCORPORATION_CASES))('translates draft $incorporationType and $incorporationState using catalogue keys', async (incorporation) => {
        // Given draft catalogue keys override a different saved incorporation summary
        // When the real projection and translated summary rows render
        await renderBusinessConfirmation(incorporation);

        // Then every picker type key and representative state keys have their production labels
        expect(screen.getByText(translateLocal(`businessInfoStep.incorporationType.${incorporation.incorporationType}`))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal(`allStates.${incorporation.incorporationState}.stateName`))).toBeOnTheScreen();
    });

    it('shows no incorporation type for a saved value without a label', async () => {
        // Given a saved value that is not one of the picker's type keys
        // When the summary rows render
        await renderBusinessConfirmation({incorporationType: 'Corp', incorporationState: 'NY'});

        // Then the row has no raw translation path, and the state label still renders
        expect(screen.queryByText('businessInfoStep.incorporationType.Corp')).toBeNull();
        expect(screen.queryByText(translateLocal('businessInfoStep.incorporationType.CORPORATION'))).toBeNull();
        expect(screen.getByText(translateLocal('allStates.NY.stateName'))).toBeOnTheScreen();
    });

    it('falls back to ACH incorporation when the draft omits the fields', async () => {
        // Given the saved company is a New York corporation and has no draft override
        // When the real getSubStepValues projection reads the account
        const {onMove} = await renderBusinessConfirmation();

        // Then the saved labels remain visible and their edit destinations retain their indexes
        expect(screen.getByText(translateLocal('businessInfoStep.incorporationType.CORPORATION'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('allStates.NY.stateName'))).toBeOnTheScreen();
        const companyTypeButton = await screen.findByRole(CONST.ROLE.BUTTON, {
            name: `${translateLocal('businessInfoStep.companyType')}, ${translateLocal('businessInfoStep.incorporationType.CORPORATION')}`,
        });
        fireEvent.press(companyTypeButton, {nativeEvent: {}});
        expect(onMove).toHaveBeenCalledWith(CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.BUSINESS_INFO.COMPANY_TYPE);
        expect(onMove).toHaveBeenCalledTimes(1);
        const incorporationStateButton = await screen.findByRole(CONST.ROLE.BUTTON, {
            name: `${translateLocal('businessInfoStep.incorporationState')}, ${translateLocal('allStates.NY.stateName')}`,
        });
        fireEvent.press(incorporationStateButton, {nativeEvent: {}});
        expect(onMove).toHaveBeenCalledWith(CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.BUSINESS_INFO.INCORPORATION_STATE);
        expect(onMove).toHaveBeenCalledTimes(2);
    });

    it.each([true, false])('keeps empty incorporation rows with a saved account=%s', async (shouldSeedAccount) => {
        // Given explicit empty draft fields must override saved values, and absent data also stays blank
        const draft = shouldSeedAccount ? ({incorporationType: '', incorporationState: ''} as const) : {};

        // When the actual summary receives empty or missing incorporation data
        await renderBusinessConfirmation(draft, shouldSeedAccount);

        // Then the field names render without borrowing the saved company's translated values
        expect(screen.getByText(translateLocal('businessInfoStep.companyType'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('businessInfoStep.incorporationState'))).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('businessInfoStep.incorporationType.CORPORATION'))).not.toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('allStates.NY.stateName'))).not.toBeOnTheScreen();
    });

    it('blocks unchecked confirmation through the real form validation', async () => {
        // Given false is a saved checkbox value but does not confirm the restricted-business requirement
        const {onNext} = await renderBusinessConfirmation({hasNoConnectionToCannabis: false});

        // When the user submits without confirming
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('common.confirm')}));

        // Then the production validation explains the restriction and does not advance
        expect(await screen.findByText(translateLocal('bankAccount.error.restrictedBusiness'))).toBeOnTheScreen();
        expect(onNext).not.toHaveBeenCalled();
    });

    it('saves a checked confirmation and advances through the real form', async () => {
        // Given the user has not confirmed the requirement yet
        const {onNext} = await renderBusinessConfirmation({hasNoConnectionToCannabis: false});

        // When the actual checkbox changes and the form is submitted
        fireEvent.press(screen.getByRole(CONST.ROLE.CHECKBOX));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal('common.confirm')}));
        await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));

        // Then submission and the draft carry true rather than bypassing checkbox validation
        expect(onNext).toHaveBeenCalledWith(expect.objectContaining({hasNoConnectionToCannabis: true}));
        await getOnyxData({
            key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
            callback: (draft) => expect(draft?.hasNoConnectionToCannabis).toBe(true),
        });
    });
});
