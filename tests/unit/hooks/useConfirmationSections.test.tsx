import {renderHook} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useConfirmationSections from '@components/MoneyRequestConfirmationList/hooks/useConfirmationSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type Params = Parameters<typeof useConfirmationSections>[0];

const payee = {accountID: 1, login: 'me@test.com'} as CurrentUserPersonalDetails;
const otherParticipant = {accountID: 2, login: 'other@test.com', keyForList: '2'} as unknown as Participant;
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
        const editableRow = editable.current.at(0)?.data.at(0) as {isInteractive?: boolean; shouldShowRightCaret?: boolean} | undefined;
        const readonlyRow = readonly.current.at(0)?.data.at(0) as {isInteractive?: boolean; shouldShowRightCaret?: boolean} | undefined;
        expect(editableRow?.isInteractive).toBe(true);
        expect(editableRow?.shouldShowRightCaret).toBe(true);
        expect(readonlyRow?.isInteractive).toBe(false);
        expect(readonlyRow?.shouldShowRightCaret).toBe(false);
    });
});
