import {act, renderHook} from '@testing-library/react-native';

import useUndeleteTransactions from '@hooks/useUndeleteTransactions';

import {undeleteTransactions} from '@libs/actions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Transaction', () => ({undeleteTransactions: jest.fn()}));

// Peripheral data the write is handed. None of it is read from Onyx by the handler.
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, email: 'me@example.com'})));
jest.mock('@hooks/useDelegateAccountID', () => jest.fn(() => undefined));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: jest.fn(() => false), isBetaEnabledOrUnknown: jest.fn(() => false)})));
jest.mock('@hooks/usePersonalDetailByLogin', () => ({useGetPersonalDetailsByLogin: jest.fn(() => () => ({}))}));

const POLICY_ID = 'policy1';

describe('useUndeleteTransactions', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('passes the stored cards, tags, rules and track intent to the undelete', async () => {
        // Given a personal workspace with tags and a rule, a card, and a user who picked a track intent during onboarding
        const policyTagList = createMock<OnyxTypes.PolicyTagLists>({Department: {name: 'Department', orderWeight: 0, required: false, tags: {}}});
        const cardList = createMock<OnyxTypes.CardList>({card1: {cardID: 1}});
        const rule = createMock<OnyxTypes.Rule>({scope: CONST.RULES.SCOPE.POLICY, scopeID: POLICY_ID});
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_POLICY_ID]: POLICY_ID,
            [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const]: createMock<OnyxTypes.Policy>({id: POLICY_ID}),
            [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}` as const]: policyTagList,
            [ONYXKEYS.CARD_LIST]: cardList,
            [`${ONYXKEYS.COLLECTION.RULE}rule1` as const]: rule,
            [ONYXKEYS.NVP_INTRO_SELECTED]: {choice: CONST.ONBOARDING_CHOICES.TRACK_PERSONAL},
        });
        const {result} = renderHook(() => useUndeleteTransactions());
        await waitForBatchedUpdates();
        const transaction = createMock<OnyxTypes.Transaction>({transactionID: 'txn1'});

        // When the deleted expense is restored
        await act(async () => {
            await result.current([transaction]);
        });

        // Then the stored values still reach the undelete, so the restored expense's violations are computed from them
        expect(undeleteTransactions).toHaveBeenCalledWith(
            expect.objectContaining({transactionIDs: ['txn1'], policyTagList, cardList, isTrackIntentUser: true, rules: {[`${ONYXKEYS.COLLECTION.RULE}rule1`]: rule}}),
        );
    });
});
