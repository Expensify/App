import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList/SelectionListWithSections';

import useFilteredOptions from '@hooks/useFilteredOptions';

import type {HydratedPersonalDetailOption, OptionList} from '@libs/OptionsListUtils';

import ParticipantSearchResults from '@pages/iou/request/ParticipantSearchResults';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useFilteredOptions', () => jest.fn());
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({__esModule: true, default: () => ({didScreenTransitionEnd: true})}));
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@hooks/useDismissedReferralBanners', () => ({__esModule: true, default: () => ({isDismissed: true, setAsDismissed: jest.fn()})}));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Report'),
    searchUserInServer: jest.fn(),
}));

const ALICE = {accountID: 2, login: 'alice@example.com', displayName: 'Alice'} satisfies PersonalDetails;
const BOB = {accountID: 3, login: 'bob@example.com', displayName: 'Bob'} satisfies PersonalDetails;
const ALICE_OPTION = createMock<HydratedPersonalDetailOption>({
    accountID: ALICE.accountID,
    login: ALICE.login,
    text: ALICE.displayName,
    displayName: ALICE.displayName,
    keyForList: '2',
    reportID: '',
    isHydrated: true,
    item: ALICE,
});
const BOB_OPTION = createMock<HydratedPersonalDetailOption>({
    accountID: BOB.accountID,
    login: BOB.login,
    text: BOB.displayName,
    displayName: BOB.displayName,
    keyForList: '3',
    reportID: '',
    isHydrated: true,
    item: BOB,
});

const BASE_PROPS = {
    iouType: CONST.IOU.TYPE.SPLIT,
    action: CONST.IOU.ACTION.CREATE,
    participants: [],
    isWorkspacesOnly: false,
    isPerDiemRequest: false,
    isTimeRequest: false,
    isNative: false,
    isTransactionFromCreditCardImport: false,
    selectionListRef: null,
    textInputAutoFocus: false,
    setTextInputAutoFocus: jest.fn(),
    onParticipantsAdded: jest.fn<void, [Participant[]]>(),
    onFinish: jest.fn(),
} satisfies React.ComponentProps<typeof ParticipantSearchResults>;

describe('ParticipantSearchResults real selection and hydration', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'current@example.com'});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ALICE.accountID]: ALICE, [BOB.accountID]: BOB});
        await Onyx.set(ONYXKEYS.BETAS, []);
        const options: OptionList = {reports: [], personalDetails: [ALICE_OPTION, BOB_OPTION]};
        jest.mocked(useFilteredOptions).mockReturnValue(createMock<ReturnType<typeof useFilteredOptions>>({options, isLoading: false, hasMore: false, getReportByID: () => undefined}));
        await waitForBatchedUpdatesWithAct();
    });

    it('hydrates a report-less initial participant and removes it by the real hook identity', async () => {
        // Given the selected participant writer preserves account/login identity without inventing a report or list key.
        const participant: Participant = {accountID: ALICE.accountID, login: ALICE.login, selected: true, reportID: undefined, iouType: CONST.IOU.TYPE.SPLIT};
        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ParticipantSearchResults
                        {...BASE_PROPS}
                        participants={[participant]}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();
        const list = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(list).toBeDefined();
        const selected = list?.sections[0].data[0];
        // When real section hydration supplies the selected contact and the page toggles it through the real base hook.
        expect(selected).toBeDefined();
        expect(selected).toMatchObject({accountID: ALICE.accountID, login: ALICE.login, keyForList: '2', isSelected: true});
        expect(list?.sections.flatMap((section) => section.data).filter((item) => item.accountID === ALICE.accountID)).toHaveLength(1);
        if (!selected) {
            throw new Error('Selected participant is missing');
        }
        act(() => list?.onSelectRow?.(selected));
        // Then account identity removes the participant and the sanitized callback preserves an empty selection.
        expect(BASE_PROPS.onParticipantsAdded).toHaveBeenLastCalledWith([]);
        expect(BASE_PROPS.onFinish).not.toHaveBeenCalled();
    });

    it('normalizes an empty report ID in the selected callback while preserving contact fields', async () => {
        // Given a report-less contact from the real search-option producer domain.
        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ParticipantSearchResults {...BASE_PROPS} />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();
        const list = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(list).toBeDefined();
        const contact = list?.sections.flatMap((section) => section.data).find((item) => item.accountID === BOB.accountID);
        expect(contact).toBeDefined();
        // When the page and base hook commit the contact selection.
        if (!contact) {
            throw new Error('Bob contact is missing');
        }
        act(() => list?.onSelectRow?.(contact));
        // Then the writer keeps account/login data and uses undefined for the empty report identifier.
        expect(BASE_PROPS.onParticipantsAdded).toHaveBeenCalledTimes(1);
        expect(BASE_PROPS.onParticipantsAdded).toHaveBeenCalledWith([
            expect.objectContaining({accountID: BOB.accountID, login: BOB.login, reportID: undefined, selected: true, iouType: CONST.IOU.TYPE.SPLIT}),
        ]);
        expect(BASE_PROPS.onFinish).not.toHaveBeenCalled();
    });

    it.each([{isPerDiemRequest: true}, {isTimeRequest: true}, {shouldExcludeP2P: true}])('preserves participant contact restrictions for %o', async (restriction) => {
        // Given a flow whose existing workspace or P2P restrictions exclude normal contacts.
        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ParticipantSearchResults
                        {...BASE_PROPS}
                        {...restriction}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();
        // When the page runs the actual selector and section composition.
        const list = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        // Then normal contact rows stay excluded rather than being reintroduced by generic selected-value typing.
        expect(list).toBeDefined();
        expect(list?.sections.flatMap((section) => section.data).filter((item) => item.accountID === ALICE.accountID || item.accountID === BOB.accountID)).toEqual([]);
    });

    it('preserves single-participant finish payloads and checks the commuter block before committing', async () => {
        // Given a single-participant request with a guard controlled by its owning transaction flow.
        const block = jest.fn(() => true);
        const {rerender} = render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ParticipantSearchResults
                        {...BASE_PROPS}
                        iouType={CONST.IOU.TYPE.CREATE}
                        shouldBlockParticipantSelection={block}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();
        let list = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        const contact = list?.sections.flatMap((section) => section.data).find((item) => item.accountID === BOB.accountID);
        expect(contact).toBeDefined();
        if (!contact) {
            throw new Error('Bob contact is missing');
        }
        // When the owning guard rejects selection, then permits the same contact.
        act(() => list?.onSelectRow?.(contact));
        expect(BASE_PROPS.onParticipantsAdded).not.toHaveBeenCalled();
        block.mockReturnValue(false);
        rerender(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                    <ParticipantSearchResults
                        {...BASE_PROPS}
                        iouType={CONST.IOU.TYPE.CREATE}
                        shouldBlockParticipantSelection={block}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        list = jest.mocked(SelectionList).mock.calls.at(-1)?.[0];
        expect(list).toBeDefined();
        act(() => list?.onSelectRow?.(contact));
        // Then both callbacks receive the same sanitized participant payload without a fabricated report ID.
        const payload = BASE_PROPS.onParticipantsAdded.mock.calls.at(-1)?.[0];
        expect(payload).toBeDefined();
        expect(payload).toEqual([expect.objectContaining({accountID: BOB.accountID, login: BOB.login, reportID: undefined, iouType: CONST.IOU.TYPE.CREATE})]);
        expect(BASE_PROPS.onFinish).toHaveBeenCalledWith(undefined, payload);
    });
});
