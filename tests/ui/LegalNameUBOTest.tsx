import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type {SubPageProps} from '@hooks/useSubPage/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';

import LegalNameUBO from '@pages/ReimbursementAccount/USD/BeneficialOwnerInfo/subSteps/BeneficialOwnerDetailsFormSubSteps/LegalNameUBO';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReimbursementAccountForm} from '@src/types/form';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {getOnyxData, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

const Stack = createPlatformStackNavigator<ReimbursementAccountNavigatorParamList>();

const OWNER_A = 'owner_with_underscores';
const OWNER_B = 'other';
const OWNER_FIELDS = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const OWNER_A_FIRST_NAME = `${OWNER_FIELDS.PREFIX}_${OWNER_A}_${OWNER_FIELDS.FIRST_NAME}` as const;
const OWNER_A_LAST_NAME = `${OWNER_FIELDS.PREFIX}_${OWNER_A}_${OWNER_FIELDS.LAST_NAME}` as const;
const OWNER_B_FIRST_NAME = `${OWNER_FIELDS.PREFIX}_${OWNER_B}_${OWNER_FIELDS.FIRST_NAME}` as const;
const OWNER_B_LAST_NAME = `${OWNER_FIELDS.PREFIX}_${OWNER_B}_${OWNER_FIELDS.LAST_NAME}` as const;
const OWNER_B_NAMES = {
    [OWNER_B_FIRST_NAME]: 'Grace',
    [OWNER_B_LAST_NAME]: 'Hopper',
} satisfies Partial<ReimbursementAccountForm>;
const OWNER_A_NAMES = {
    [OWNER_A_FIRST_NAME]: 'Ada',
    [OWNER_A_LAST_NAME]: 'Lovelace',
} satisfies Partial<ReimbursementAccountForm>;
const UPDATED_OWNER_A_NAMES = {
    [OWNER_A_FIRST_NAME]: 'Katherine',
    [OWNER_A_LAST_NAME]: 'Johnson',
} satisfies Partial<ReimbursementAccountForm>;

function renderOwnerName(ownerID: string, isEditing: boolean, onNext: SubPageProps['onNext']) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name={SCREENS.REIMBURSEMENT_ACCOUNT_ROOT}>
                            {() => (
                                <LegalNameUBO
                                    beneficialOwnerBeingModifiedID={ownerID}
                                    isEditing={isEditing}
                                    onNext={onNext}
                                    onMove={jest.fn<ReturnType<SubPageProps['onMove']>, Parameters<SubPageProps['onMove']>>()}
                                />
                            )}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('LegalNameUBO owner fields and draft submission', () => {
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

    it.each([
        {isEditing: false, shouldSeedOwnerA: true},
        {isEditing: true, shouldSeedOwnerA: true},
        {isEditing: false, shouldSeedOwnerA: false},
        {isEditing: true, shouldSeedOwnerA: false},
    ])('saves only owner A with isEditing=$isEditing and saved defaults=$shouldSeedOwnerA', async ({isEditing, shouldSeedOwnerA}) => {
        // Given a second owner must survive edits to an owner whose ID contains delimiters
        const initialDraft = {...OWNER_B_NAMES, ...(shouldSeedOwnerA ? OWNER_A_NAMES : {})};
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, initialDraft);
        });
        const onNext = jest.fn<ReturnType<SubPageProps['onNext']>, Parameters<SubPageProps['onNext']>>();
        renderOwnerName(OWNER_A, isEditing, onNext);
        await waitForBatchedUpdatesWithAct();
        const firstName = screen.getByLabelText(translateLocal('personalInfoStep.legalFirstName'));
        const lastName = screen.getByLabelText(translateLocal('personalInfoStep.legalLastName'));
        expect(firstName.props.value).toBe(shouldSeedOwnerA ? 'Ada' : '');
        expect(lastName.props.value).toBe(shouldSeedOwnerA ? 'Lovelace' : '');

        // When real inputs and the real submit hook handle the selected owner's new legal name
        fireEvent.changeText(firstName, 'Katherine');
        fireEvent.changeText(lastName, 'Johnson');
        await waitForBatchedUpdatesWithAct();
        await getOnyxData({
            key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
            callback: (draft) => {
                expect(draft).toEqual(isEditing ? initialDraft : {...OWNER_B_NAMES, ...UPDATED_OWNER_A_NAMES});
            },
        });
        fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: translateLocal(isEditing ? 'common.confirm' : 'common.next')}));
        await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));

        // Then confirmation projects exactly first and last name while preserving the other owner in Onyx
        expect(onNext).toHaveBeenCalledWith(...(isEditing ? [UPDATED_OWNER_A_NAMES] : []));
        await getOnyxData({
            key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
            callback: (draft) => expect(draft).toEqual({...OWNER_B_NAMES, ...UPDATED_OWNER_A_NAMES}),
        });
    });

    it('uses the other owner ID to read its own saved defaults', async () => {
        // Given two owners have different saved names in the same form draft
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {...OWNER_A_NAMES, ...OWNER_B_NAMES});
        });

        // When the second owner is selected through the production component
        renderOwnerName(OWNER_B, true, jest.fn<ReturnType<SubPageProps['onNext']>, Parameters<SubPageProps['onNext']>>());
        await waitForBatchedUpdatesWithAct();

        // Then its defaults cannot be borrowed from the first owner
        expect(screen.getByLabelText(translateLocal('personalInfoStep.legalFirstName')).props.value).toBe('Grace');
        expect(screen.getByLabelText(translateLocal('personalInfoStep.legalLastName')).props.value).toBe('Hopper');
    });
});
