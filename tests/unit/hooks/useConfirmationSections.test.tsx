import {renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useConfirmationSections from '@components/MoneyRequestConfirmationList/hooks/useConfirmationSections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type Params = Parameters<typeof useConfirmationSections>[0];

const payee = {accountID: 1, login: 'me@test.com'} as CurrentUserPersonalDetails;
const smsPayee = {accountID: 3, login: '+18332403627@expensify.sms'} as CurrentUserPersonalDetails;
const otherParticipant = createMock<Participant>({accountID: 2, login: 'other@test.com', keyForList: '2'});
const splitParticipant = {accountID: 2, keyForList: '2', login: 'other@test.com'} as Participant & {keyForList: string};

function makeBase(overrides: Partial<Params> = {}): Params {
    return {
        isTypeSplit: false,
        shouldHideToSection: false,
        canEditParticipant: true,
        payeePersonalDetails: payee as OnyxTypes.PersonalDetails,
        splitParticipants: [splitParticipant],
        selectedParticipants: [otherParticipant],
        getSplitSectionHeader: () => <View />,
        ...overrides,
    };
}

function Wrapper({children}: {children: React.ReactNode}) {
    return <LocaleContextProvider>{children}</LocaleContextProvider>;
}

describe('useConfirmationSections', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdatesWithAct();
    });

    it('produces two sections for split type (paidBy + participants)', () => {
        const {result} = renderHook(() => useConfirmationSections(makeBase({isTypeSplit: true})), {wrapper: Wrapper});
        expect(result.current).toHaveLength(2);
        expect(result.current.at(0)?.sectionIndex).toBe(0);
        // First section is "paid by" with the payee, second is the participants list with custom header
        expect(result.current.at(0)?.data).toHaveLength(1);
        expect(result.current.at(1)?.sectionIndex).toBe(1);
        expect(result.current.at(1)?.customHeader).toBeDefined();
        expect(result.current.at(1)?.data).toHaveLength(1);
    });

    it('formats split payee SMS login using the localized phone-number formatter', () => {
        const {result} = renderHook(() => useConfirmationSections(makeBase({isTypeSplit: true, payeePersonalDetails: smsPayee as OnyxTypes.PersonalDetails})), {wrapper: Wrapper});
        expect(result.current.at(0)?.data.at(0)?.text).toBe('(833) 240-3627');
    });

    it('produces a single "to" section for non-split types', () => {
        const {result} = renderHook(() => useConfirmationSections(makeBase()), {wrapper: Wrapper});
        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)?.sectionIndex).toBe(0);
        expect(result.current.at(0)?.data).toHaveLength(1);
        // Non-split sections do not carry a customHeader
        expect(result.current.at(0)?.customHeader).toBeUndefined();
    });

    it('produces an empty array when shouldHideToSection is set on a non-split', () => {
        const {result} = renderHook(() => useConfirmationSections(makeBase({shouldHideToSection: true})), {wrapper: Wrapper});
        expect(result.current).toEqual([]);
    });

    it('flags participants as interactive only when canEditParticipant is true', () => {
        const {result: editable} = renderHook(() => useConfirmationSections(makeBase({canEditParticipant: true})), {wrapper: Wrapper});
        const {result: readonly} = renderHook(() => useConfirmationSections(makeBase({canEditParticipant: false})), {wrapper: Wrapper});
        const editableRow = editable.current.at(0)?.data.find((item) => item.keyForList === otherParticipant.keyForList);
        const readonlyRow = readonly.current.at(0)?.data.find((item) => item.keyForList === otherParticipant.keyForList);

        if (!editableRow || !('isInteractive' in editableRow) || !('shouldShowRightCaret' in editableRow)) {
            throw new Error('Expected the editable participant row to expose its interaction state');
        }
        if (!readonlyRow || !('isInteractive' in readonlyRow) || !('shouldShowRightCaret' in readonlyRow)) {
            throw new Error('Expected the read-only participant row to expose its interaction state');
        }

        expect(editableRow.isInteractive).toBe(true);
        expect(editableRow.shouldShowRightCaret).toBe(true);
        expect(readonlyRow.isInteractive).toBe(false);
        expect(readonlyRow.shouldShowRightCaret).toBe(false);
    });
});
