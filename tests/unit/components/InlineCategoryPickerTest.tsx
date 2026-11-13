import {act, render} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import InlineCategoryPicker from '@components/TransactionItemRow/DataCells/InlineCategoryPicker';

import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import getOnyxValue from '../../utils/getOnyxValue';
import {expectAPICommandToHaveBeenCalled, getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// CategoryPickerModal already tests closing after creation; here we exercise the inline caller's permissions and save data.
jest.mock('@components/CategoryPicker/CategoryPickerModal', () => jest.fn(() => null));

const POLICY_ID = '1';
const policy: Policy = {
    id: POLICY_ID,
    name: 'Workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.TEAM,
    owner: 'admin@example.com',
    outputCurrency: 'USD',
    areCategoriesEnabled: true,
};

const renderPicker = (onSave = jest.fn(), policyID: string | undefined = POLICY_ID) => {
    render(
        <InlineCategoryPicker
            policyID={policyID}
            isVisible
            selectedCategory="Training"
            onClose={jest.fn()}
            onSave={onSave}
            anchorPosition={{horizontal: 0, vertical: 0}}
        />,
        {wrapper: OnyxListItemProvider},
    );
    return onSave;
};

const getPickerProps = () => {
    const props = jest.mocked(CategoryPickerModal).mock.lastCall?.[0];
    if (!props) {
        throw new Error('Expected the inline category picker to render');
    }
    return props;
};

describe('InlineCategoryPicker', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = getGlobalFetchMock();
        jest.mocked(CategoryPickerModal).mockClear();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, email: 'admin@example.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Food: {name: 'Food', enabled: true}});
        await waitForBatchedUpdates();
    });

    it('creates and saves a category with the updated category collection', async () => {
        // Given an eligible admin using the inline category picker
        const onSave = renderPicker();
        await waitForBatchedUpdatesWithAct();

        // When an unmatched search creates a category
        const createCategory = getPickerProps().onCreateCategory;
        expect(createCategory).toBeDefined();
        act(() => createCategory?.('Training'));
        await waitForBatchedUpdatesWithAct();

        // Then the inline save receives the new category immediately, without waiting for the expense row to render
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, 1);
        expect(onSave).toHaveBeenCalledWith('Training', expect.objectContaining({Training: expect.objectContaining({name: 'Training', enabled: true})}));
        const categories = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`);
        expect(categories?.Training?.enabled).toBe(true);
    });

    it('re-enables and saves an already-selected disabled category', async () => {
        // Given an expense still holding a category that was disabled on the workspace
        const categories: PolicyCategories = {Training: {name: 'Training', enabled: false, externalID: 'training-id'}};
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, categories);
        const onSave = renderPicker();
        await waitForBatchedUpdatesWithAct();

        // When the admin creates the same name from the empty search results
        act(() => getPickerProps().onCreateCategory?.('Training'));
        await waitForBatchedUpdatesWithAct();

        // Then creation re-enables rather than duplicates it, and does not skip saving just because the name is unchanged
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, 1);
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, 0);
        expect(onSave).toHaveBeenCalledWith('Training', expect.objectContaining({Training: expect.objectContaining({enabled: true, externalID: 'training-id'})}));
    });

    it.each([{role: CONST.POLICY.ROLE.USER}, {areCategoriesEnabled: false}, {archivedDate: '2026-01-01'}, {connections: createMock<Policy['connections']>({quickbooksOnline: {}})}])(
        'does not offer creation when workspace permissions prohibit it: %p',
        async (changes) => {
            // Given a workspace where the current user cannot create categories in situ
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, changes);

            // When the inline picker opens
            renderPicker();
            await waitForBatchedUpdatesWithAct();

            // Then an empty search cannot offer category creation
            expect(getPickerProps().onCreateCategory).toBeUndefined();
        },
    );

    it('allows Submit workspace editors to create categories', async () => {
        // Given an editor who manages a Submit workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {type: CONST.POLICY.TYPE.SUBMIT, role: CONST.POLICY.ROLE.EDITOR});

        // When the inline picker opens
        renderPicker();
        await waitForBatchedUpdatesWithAct();

        // Then it uses the same category creation permissions as the existing expense pickers
        expect(getPickerProps().onCreateCategory).toBeDefined();
    });

    it('does not create categories on a draft workspace', async () => {
        // Given only a draft workspace, whose default categories must not be overwritten
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${CONST.POLICY.ID_FAKE}`, {...policy, id: CONST.POLICY.ID_FAKE});

        // When the picker opens without a real workspace ID
        renderPicker(jest.fn(), '');
        await waitForBatchedUpdatesWithAct();

        // Then it cannot offer the create row
        expect(getPickerProps().onCreateCategory).toBeUndefined();
    });
});
