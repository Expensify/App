import {WRITE_COMMANDS} from '@libs/API/types';
import membersNeedCategoryError from '@libs/Middleware/MembersNeedCategoryError';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type MembersNeedCategoryModal from '@src/types/onyx/MembersNeedCategoryModal';
import type Request from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = 'ABC123';

function buildDisableRequest(overrides: Partial<Request<OnyxKey>> = {}): Request<OnyxKey> {
    return {
        command: WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED,
        data: {
            policyID: POLICY_ID,
            categories: JSON.stringify([
                {name: 'Fuel', enabled: false},
                {name: 'Meals', enabled: false},
            ]),
        },
        ...overrides,
    } as Request<OnyxKey>;
}

function buildResponse(overrides: Partial<Response<OnyxKey>> = {}): Response<OnyxKey> {
    return {
        jsonCode: CONST.JSON_CODE.EXP_ERROR,
        additionalData: {accountIDs: [2, 3]},
        ...overrides,
    } as Response<OnyxKey>;
}

async function getModalSignal() {
    await waitForBatchedUpdates();
    return new Promise<MembersNeedCategoryModal | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.RAM_ONLY_MEMBERS_NEED_CATEGORY_MODAL,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('MembersNeedCategoryError', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('signals the modal with the members the backend refused to leave without a category', async () => {
        // Given the backend rejected disabling two categories because of two members
        const response = buildResponse();

        // When the response passes through the middleware
        const result = await membersNeedCategoryError(Promise.resolve(response), buildDisableRequest(), true);

        // Then the modal is signalled for that workspace, those members and both categories, and the response is untouched
        expect(await getModalSignal()).toEqual({policyID: POLICY_ID, accountIDs: [2, 3], categoryCount: 2});
        expect(result).toBe(response);
    });

    it('does nothing when the disable succeeded', async () => {
        // Given the backend accepted the disable
        // When the response passes through the middleware
        await membersNeedCategoryError(Promise.resolve(buildResponse({jsonCode: CONST.JSON_CODE.SUCCESS})), buildDisableRequest(), true);

        // Then no modal is signalled
        expect(await getModalSignal()).toBeFalsy();
    });

    it('does nothing when the failure has no members, such as a generic error', async () => {
        // Given the backend failed for another reason, so it sent no accountIDs
        // When the response passes through the middleware
        await membersNeedCategoryError(Promise.resolve(buildResponse({additionalData: undefined})), buildDisableRequest(), true);

        // Then no modal is signalled, and the category row's own error covers it
        expect(await getModalSignal()).toBeFalsy();
    });

    it('ignores other commands', async () => {
        // Given another command failed with accountIDs
        // When the response passes through the middleware
        await membersNeedCategoryError(Promise.resolve(buildResponse()), buildDisableRequest({command: WRITE_COMMANDS.SET_WORKSPACE_REQUIRES_CATEGORY}), true);

        // Then no modal is signalled, since only disabling categories can leave members without one
        expect(await getModalSignal()).toBeFalsy();
    });
});
