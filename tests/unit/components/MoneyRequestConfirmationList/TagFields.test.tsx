import {render, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import TagFields from '@components/MoneyRequestConfirmationList/sections/TagFields';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
// The new-row flash needs a screen's transition context, which the row is rendered without here.
jest.mock('@components/MoneyRequestConfirmationList/sections/useFieldRowHighlightStyle', () => () => ({}));

let mockIsAnchoredDropdownsBetaEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: (beta: string) => mockIsAnchoredDropdownsBetaEnabled && beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.ANCHORED_FIELD_DROPDOWNS,
}));

// Records what the row decided and renders its list straight away, so each test can read both without pressing anything.
let mockShouldOpenInDropdown: boolean | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown}: {shouldOpenInDropdown: boolean; renderDropdown: (props: ExpenseFieldDropdownRenderProps) => ReactNode}) => {
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        return renderDropdown({
            isVisible: true,
            onClose: () => {},
            anchorPosition: {horizontal: 0, vertical: 0},
            anchorAlignment: {horizontal: 'left', vertical: 'top'},
            shouldMeasureAnchorPositionFromTop: true,
            shouldSwitchPositionIfOverflow: false,
            popoverWidth: 300,
            popoverHeight: 300,
        });
    };
});

const mockTagListIndexes: number[] = [];
jest.mock('@components/MoneyRequestConfirmationList/sections/TagFieldDropdown', () => ({tagListIndex}: {tagListIndex: number}) => {
    mockTagListIndexes.push(tagListIndex);
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const policy: Policy = {...createRandomPolicy(1), hasMultipleTagLists: true};

const independentTags: PolicyTagLists = {
    Department: {name: 'Department', orderWeight: 0, required: false, tags: {Engineering: {name: 'Engineering', enabled: true}}},
    Project: {name: 'Project', orderWeight: 1, required: false, tags: {Alpha: {name: 'Alpha', enabled: true}}},
};

// The second level's tags only apply under a parent tag, which makes the lists dependent.
const dependentTags: PolicyTagLists = {
    State: {name: 'State', orderWeight: 0, required: false, tags: {California: {name: 'California', enabled: true}}},
    City: {name: 'City', orderWeight: 1, required: false, tags: {Oakland: {name: 'Oakland', enabled: true, rules: {parentTagsFilter: '^California$'}}}},
};

type RenderParams = {
    tagIndex?: number;
    tags?: PolicyTagLists;
    action?: IOUAction;
    isReadOnly?: boolean;
    didConfirm?: boolean;
    hasDependentTags?: boolean;
};

const renderTagRow = ({tagIndex = 0, tags = independentTags, action = CONST.IOU.ACTION.CREATE, isReadOnly = false, didConfirm = false, hasDependentTags = false}: RenderParams = {}) => {
    const policyTagList = Object.values(tags).at(tagIndex);
    if (!policyTagList) {
        throw new Error('Missing tag list for the test');
    }
    return render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={action}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                <TagFields
                    tagIndex={tagIndex}
                    policy={policy}
                    hasDependentTags={hasDependentTags}
                    policyTagList={policyTagList}
                    isTagRequired={false}
                    previousShouldShow
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    transactionID={TRANSACTION_ID}
                    action={action}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    reportID={REPORT_ID}
                    reportActionID={undefined}
                    formError=""
                />
            </ExpenseFormLayoutContext.Provider>
        </ConfirmationFieldsProvider>,
    );
};

describe('TagFields', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        mockShouldOpenInDropdown = undefined;
        mockTagListIndexes.length = 0;
        jest.mocked(Navigation.navigate).mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    const givenPolicyTags = async (tags: PolicyTagLists) => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, tags);
        await waitForBatchedUpdates();
    };

    it('opens the tag list in place while creating an expense', async () => {
        // Given a workspace with independent tag lists and the anchored dropdowns beta on
        await givenPolicyTags(independentTags);

        // When the expense form renders a tag row
        renderTagRow();

        // Then the row opens its list in a container anchored to it rather than pushing the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
    });

    it('gives each tag row its own list', async () => {
        // Given a workspace with two independent tag lists
        await givenPolicyTags(independentTags);

        // When the form renders the row for the second list
        renderTagRow({tagIndex: 1});

        // Then that row's container picks from the second list, not the first
        await waitFor(() => {
            expect(mockTagListIndexes).toContain(1);
        });
        expect(mockTagListIndexes).not.toContain(0);
    });

    it('keeps the full-page selector for dependent tags', async () => {
        // Given a workspace whose second tag level depends on the first, which the full page walks through level by level
        await givenPolicyTags(dependentTags);

        // When the form renders a tag row for those lists
        renderTagRow({tags: dependentTags, hasDependentTags: true});

        // Then the row keeps opening the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('keeps the full-page selector when the beta is off', async () => {
        // Given a workspace with independent tags, for a user without the anchored dropdowns beta
        mockIsAnchoredDropdownsBetaEnabled = false;
        await givenPolicyTags(independentTags);

        // When the form renders a tag row
        renderTagRow();

        // Then the row opens the full-page selector as before
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('does not open the list on a read-only or confirmed form', async () => {
        // Given a workspace with independent tags
        await givenPolicyTags(independentTags);

        // When the row renders on a read-only form, and then on one that was already confirmed
        renderTagRow({isReadOnly: true});
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
        renderTagRow({didConfirm: true});

        // Then neither opens a list the user can no longer change anything from
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('keeps the full-page selector when editing a saved expense', async () => {
        // Given a workspace with independent tags, and an expense that already exists
        await givenPolicyTags(independentTags);

        // When the form renders a tag row to edit it
        renderTagRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row keeps the full-page selector, which this PR leaves in place for edits
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });
});
