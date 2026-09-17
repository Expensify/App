import {act, render} from '@testing-library/react-native';

import type {SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';

import type * as BulkEditActions from '@libs/actions/IOU/BulkEdit';

import SearchEditMultipleTagPage from '@pages/Search/SearchEditMultiple/SearchEditMultipleTagPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists, Transaction} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/**
 * Locks in the bulk-edit tag deselect fix (issue #100538). A select then deselect of the same tag level
 * is a net no-op, so `saveTag` must drop the recorded per-level intent. `bulkEditTagChanges` is the single
 * source of truth for the save (the flattened `tag` is display-only), so we assert the recorded intent.
 * The apply-time write safety is covered in tests/actions/IOUTest/BulkEditTest.ts.
 */

const POLICY_ID = 'A1B2C3';

type SavedTagPayload = {tag: string | null; bulkEditTagChanges: Record<string, string | null>};

// Capture the props TagPicker passes to SelectionList so we can fire its onSelectRow (that is saveTag).
const mockSelectionList = jest.fn<null, [SelectionListWithSectionsProps<ListItem>]>(() => null);
jest.mock('@components/SelectionList/SelectionListWithSections', () => ({
    __esModule: true,
    default: (props: SelectionListWithSectionsProps<ListItem>) => mockSelectionList(props),
}));

// Strip the chrome so the page renders in jsdom without navigation/safe-area plumbing.
jest.mock('@components/ScreenWrapper', () => (props: {children: React.ReactNode}) => props.children);
jest.mock('@components/HeaderWithBackButton', () => () => null);

// The page resolves its policyID from the search selection; pin it so we only exercise saveTag.
jest.mock('@hooks/useSearchBulkEditPolicyID', () => ({__esModule: true, default: () => POLICY_ID}));

// Capture the payload saveTag records, instead of merging it into Onyx, so the assertion is exact.
const mockUpdateBulkEditDraftTransaction = jest.fn<void, [SavedTagPayload]>();
jest.mock('@libs/actions/IOU/BulkEdit', () => {
    const actual = jest.requireActual<typeof BulkEditActions>('@libs/actions/IOU/BulkEdit');
    return {...actual, updateBulkEditDraftTransaction: (payload: SavedTagPayload) => mockUpdateBulkEditDraftTransaction(payload)};
});

jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {goBack: jest.fn()}}));

let mockTagListIndex = '0';
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actual,
        useRoute: () => ({params: {tagListIndex: mockTagListIndex}}),
        useIsFocused: () => true,
        useFocusEffect: jest.fn(),
        useNavigation: () => ({isFocused: () => true, addListener: () => () => {}}),
    };
});

function makePolicy(hasMultipleTagLists: boolean): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: POLICY_ID, areTagsEnabled: true, hasMultipleTagLists};
}

// Numeric-string object keys are built programmatically because a `{0: ...}` literal trips the
// naming-convention lint rule (same pattern used in tests/actions/IOUTest/BulkEditTest.ts).
// Seeds carry only real values; expected payloads may include null (a deleted intent).
function seedChanges(entries: Array<[number, string]>): Record<string, string> {
    return Object.fromEntries(entries.map(([index, value]) => [String(index), value]));
}
function expectChanges(entries: Array<[number, string | null]>): Record<string, string | null> {
    return Object.fromEntries(entries.map(([index, value]) => [String(index), value]));
}

const SINGLE_TAGS: PolicyTagLists = {
    Tag: {name: 'Tag', orderWeight: 0, required: false, tags: {TagA: {name: 'TagA', enabled: true}}},
};

const INDEPENDENT_TAGS: PolicyTagLists = {
    Region: {name: 'Region', orderWeight: 0, required: false, tags: {R1: {name: 'R1', enabled: true}}},
    Project: {name: 'Project', orderWeight: 1, required: false, tags: {P7: {name: 'P7', enabled: true}}},
};

const DEPENDENT_TAGS: PolicyTagLists = {
    CostCenter: {name: 'CostCenter', orderWeight: 0, required: false, tags: {CostCenterA: {name: 'CostCenterA', enabled: true}}},
    Indication: {name: 'Indication', orderWeight: 1, required: false, tags: {IndicationX: {name: 'IndicationX', enabled: true, parentTagsFilter: 'CostCenterA'}}},
};

async function renderAndTap({
    policy,
    policyTags,
    draft,
    tagListIndex,
    tappedTag,
}: {
    policy: Policy;
    policyTags: PolicyTagLists;
    draft: Partial<Transaction>;
    tagListIndex: number;
    tappedTag: string;
}): Promise<SavedTagPayload | undefined> {
    mockTagListIndex = String(tagListIndex);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, policyTags);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, draft);

    render(<SearchEditMultipleTagPage />);
    await waitForBatchedUpdatesWithAct();

    const onSelectRow = mockSelectionList.mock.calls.at(-1)?.[0].onSelectRow;
    const tappedOption: ListItem = {keyForList: tappedTag, searchText: tappedTag};
    await act(async () => {
        onSelectRow?.(tappedOption);
    });

    return mockUpdateBulkEditDraftTransaction.mock.calls.at(-1)?.[0];
}

describe('SearchEditMultipleTagPage saveTag (bulk-edit tag deselect, #100538)', () => {
    beforeEach(async () => {
        mockSelectionList.mockClear();
        mockUpdateBulkEditDraftTransaction.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('single tag list: select then deselect the same tag records no edit (the reported repro)', async () => {
        const payload = await renderAndTap({
            policy: makePolicy(false),
            policyTags: SINGLE_TAGS,
            // State right after the first tap selected TagA.
            draft: {selectedTransactionIDs: ['t1', 't2'], tag: 'TagA', bulkEditTagChanges: seedChanges([[0, 'TagA']])},
            tagListIndex: 0,
            tappedTag: 'TagA',
        });

        // Intent deleted (null): apply time writes nothing, so no flicker and no MODIFIED_EXPENSE message.
        expect(payload?.bulkEditTagChanges).toEqual(expectChanges([[0, null]]));
    });

    it('independent multi-level: deselecting the child leaves the shared parent intact', async () => {
        const payload = await renderAndTap({
            policy: makePolicy(true),
            policyTags: INDEPENDENT_TAGS,
            draft: {selectedTransactionIDs: ['t1'], tag: 'R1:P7', bulkEditTagChanges: seedChanges([[1, 'P7']])},
            tagListIndex: 1,
            tappedTag: 'P7',
        });

        // Child intent deleted, so apply time keeps each expense's own R1:P7 instead of collapsing to R1.
        expect(payload?.bulkEditTagChanges).toEqual(expectChanges([[1, null]]));
    });

    it('dependent multi-level: deselecting the child does not strip it (null-alone regression)', async () => {
        const payload = await renderAndTap({
            policy: makePolicy(true),
            policyTags: DEPENDENT_TAGS,
            draft: {selectedTransactionIDs: ['t1'], tag: 'CostCenterA:IndicationX', bulkEditTagChanges: seedChanges([[1, 'IndicationX']])},
            tagListIndex: 1,
            tappedTag: 'IndicationX',
        });

        // Child intent deleted, so apply time keeps CostCenterA:IndicationX untouched (null-alone regression).
        expect(payload?.bulkEditTagChanges).toEqual(expectChanges([[1, null]]));
    });

    it('dependent multi-level: deselecting an auto-selected child still records a real clear', async () => {
        const payload = await renderAndTap({
            policy: makePolicy(true),
            policyTags: DEPENDENT_TAGS,
            // The parent CostCenterA was picked and auto-selected its only child IndicationX (no child
            // intent recorded). Deselecting that child is a genuine clear, not an undo.
            draft: {selectedTransactionIDs: ['t1'], tag: 'CostCenterA:IndicationX', bulkEditTagChanges: seedChanges([[0, 'CostCenterA']])},
            tagListIndex: 1,
            tappedTag: 'IndicationX',
        });

        // Keeps '' so apply time genuinely trims the child. This preserves the behavior PR #97951 added.
        expect(payload?.bulkEditTagChanges).toEqual(expectChanges([[1, '']]));
    });

    it('dependent multi-level: undoing the parent pick drops the intent even though it auto-selected a child', async () => {
        const payload = await renderAndTap({
            policy: makePolicy(true),
            policyTags: DEPENDENT_TAGS,
            // The parent CostCenterA was picked and auto-selected its only child IndicationX; only the
            // parent intent is recorded. Tapping the parent again undoes that own pick.
            draft: {selectedTransactionIDs: ['t1'], tag: 'CostCenterA:IndicationX', bulkEditTagChanges: seedChanges([[0, 'CostCenterA']])},
            tagListIndex: 0,
            tappedTag: 'CostCenterA',
        });

        // isUndoingOwnPick matches at the parent, so the intent is deleted and the whole subtree nets to
        // nothing: apply time writes no tag and each expense keeps the value it already had.
        expect(payload?.bulkEditTagChanges).toEqual(expectChanges([[0, null]]));
    });
});
