import replaceOptimisticMemberAccountID from '@libs/Middleware/ReplaceOptimisticMemberAccountID';
import {generateAccountID} from '@libs/UserUtils';

import {clear, getAll, save} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const INVITEE_LOGIN = 'invitee@example.com';
const INVITEE_REAL_ACCOUNT_ID = 23663818;
const INVITEE_OPTIMISTIC_ACCOUNT_ID = generateAccountID(INVITEE_LOGIN);
const ADMIN_ACCOUNT_ID = 17734745;
const OTHER_MEMBER_ACCOUNT_ID = 17761858;

let requestIndex = 0;

function buildCategoryVisibilityRequest(selectedAccountIDs: number[], deselectedAccountIDs: number[]): AnyRequest {
    requestIndex += 1;
    return {
        command: 'SetPolicyCategoryMemberVisibility',
        data: {
            policyID: 'policyID',
            categoryNames: JSON.stringify(['Benefits']),
            selectedAccountIDList: JSON.stringify(selectedAccountIDs),
            deselectedAccountIDList: JSON.stringify(deselectedAccountIDs),
            apiRequestType: 'write',
        },
        requestIndex,
    };
}

/** Builds the invite request, whose successData removes the placeholder personal details of the accountIDs it generated */
function buildInviteRequest(optimisticAccountIDs: number[] = [INVITEE_OPTIMISTIC_ACCOUNT_ID]): AnyRequest {
    requestIndex += 1;
    return {
        command: 'AddMembersToWorkspace',
        data: {policyID: 'policyID', employees: JSON.stringify([{email: INVITEE_LOGIN, role: 'user'}]), apiRequestType: 'write'},
        successData: [{onyxMethod: 'merge', key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: Object.fromEntries(optimisticAccountIDs.map((accountID) => [accountID, null]))}],
        requestIndex,
    };
}

/** Builds the invite's response, which sends each member's personal details under their real accountID */
function buildInviteResponse(personalDetails: Record<number, {login: string}>, jsonCode = 200): Response<typeof ONYXKEYS.PERSONAL_DETAILS_LIST> {
    return {
        jsonCode,
        onyxData: [{onyxMethod: 'merge', key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: personalDetails}],
    };
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(async () => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    // PersistedRequests.save() only lands in getAll() once the module's Onyx connect callback has initialized it.
    await waitForBatchedUpdates();
    clear();
    await waitForBatchedUpdates();
});

afterEach(async () => {
    await clear();
    await Onyx.clear();
});

describe('ReplaceOptimisticMemberAccountID middleware', () => {
    it('replaces the invitee generated accountID in a queued category visibility change once the invite succeeds', async () => {
        // Given a category visibility change queued offline that unchecks the invitee while their accountID is still the generated one
        save(buildCategoryVisibilityRequest([OTHER_MEMBER_ACCOUNT_ID], [ADMIN_ACCOUNT_ID, INVITEE_OPTIMISTIC_ACCOUNT_ID]));
        await waitForBatchedUpdates();

        // When the invite succeeds and its response sends the invitee's real accountID
        const response = buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}, [ADMIN_ACCOUNT_ID]: {login: 'admin@example.com'}});
        const resolvedResponse = await replaceOptimisticMemberAccountID(Promise.resolve(response), buildInviteRequest(), true);

        // Then the queued request sends the real accountID, so the server doesn't reject it, and every other ID and param is unchanged
        expect(resolvedResponse).toBe(response);
        const persistedData = getAll().at(0)?.data;
        expect(persistedData?.deselectedAccountIDList).toBe(JSON.stringify([ADMIN_ACCOUNT_ID, INVITEE_REAL_ACCOUNT_ID]));
        expect(persistedData?.selectedAccountIDList).toBe(JSON.stringify([OTHER_MEMBER_ACCOUNT_ID]));
        expect(persistedData?.categoryNames).toBe(JSON.stringify(['Benefits']));
    });

    it('puts the invitee back under the real accountID when the queued category visibility change fails', async () => {
        // Given a queued change that unchecks the admin from Benefits, which the invitee could use, so its failureData puts
        // back both of them under the accountIDs known when it was made
        const categoriesKey = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policyID` as const;
        const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES>> = [
            {onyxMethod: Onyx.METHOD.MERGE, key: categoriesKey, value: {Benefits: {pendingFields: {visibleTo: null}}}},
        ];
        const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: categoriesKey,
                value: {Benefits: {visibleTo: {[ADMIN_ACCOUNT_ID]: true, [INVITEE_OPTIMISTIC_ACCOUNT_ID]: true}, pendingFields: {visibleTo: null}}},
            },
        ];
        save<typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES>({...buildCategoryVisibilityRequest([INVITEE_OPTIMISTIC_ACCOUNT_ID], [ADMIN_ACCOUNT_ID]), successData, failureData});
        await waitForBatchedUpdates();

        // When the invite succeeds, which also drops the generated accountID from visibleTo
        const response = buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}});
        await replaceOptimisticMemberAccountID(Promise.resolve(response), buildInviteRequest(), true);

        // Then a failure puts the invitee back under the real accountID, so they keep the category, and the successData,
        // which has no accountIDs, is unchanged
        const persistedRequest = getAll().at(0);
        expect(persistedRequest?.failureData?.at(0)?.value).toEqual({
            Benefits: {visibleTo: {[ADMIN_ACCOUNT_ID]: true, [INVITEE_REAL_ACCOUNT_ID]: true}, pendingFields: {visibleTo: null}},
        });
        expect(persistedRequest?.successData).toEqual(successData);
    });

    it('replaces the generated accountID of a phone number invited without the SMS domain in a member category visibility change', async () => {
        // Given a phone number invitee whose accountID was generated from the number without the SMS domain, and a
        // change to their categories queued from their member page
        const phoneNumber = '+15005550006';
        requestIndex += 1;
        save({
            command: 'SetPolicyMemberCategoryVisibility',
            data: {policyID: 'policyID', accountIDList: JSON.stringify([generateAccountID(phoneNumber)]), categories: JSON.stringify(['Benefits']), apiRequestType: 'write'},
            requestIndex,
        });
        await waitForBatchedUpdates();

        // When the invite succeeds and the server returns the login with the SMS domain
        await replaceOptimisticMemberAccountID(
            Promise.resolve(buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: `${phoneNumber}${CONST.SMS.DOMAIN}`}})),
            buildInviteRequest([generateAccountID(phoneNumber)]),
            true,
        );

        // Then the queued request sends the real accountID
        expect(getAll().at(0)?.data?.accountIDList).toBe(JSON.stringify([INVITEE_REAL_ACCOUNT_ID]));
    });

    it("leaves a real member's accountID alone when another member's login hashes to it", async () => {
        // Given a member whose real accountID happens to be the ID generated from an existing member's login, and a
        // category visibility change queued for them
        const existingMemberLogin = 'existing@example.com';
        const existingMemberRealAccountID = 30000001;
        const memberWithMatchingAccountID = generateAccountID(existingMemberLogin);
        const request = buildCategoryVisibilityRequest([memberWithMatchingAccountID], [ADMIN_ACCOUNT_ID, INVITEE_OPTIMISTIC_ACCOUNT_ID]);
        save(request);
        await waitForBatchedUpdates();

        // When the invite succeeds and its response sends the existing member's personal details along with the invitee's
        const response = buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}, [existingMemberRealAccountID]: {login: existingMemberLogin}});
        await replaceOptimisticMemberAccountID(Promise.resolve(response), buildInviteRequest(), true);

        // Then only the invitee's generated ID is replaced, since the invite never generated an ID for the existing member
        const persistedData = getAll().at(0)?.data;
        expect(persistedData?.selectedAccountIDList).toBe(JSON.stringify([memberWithMatchingAccountID]));
        expect(persistedData?.deselectedAccountIDList).toBe(JSON.stringify([ADMIN_ACCOUNT_ID, INVITEE_REAL_ACCOUNT_ID]));
    });

    it('leaves the queued requests alone when every invitee already has an account', async () => {
        // Given a category visibility change queued with an accountID that matches the invitee's generated one
        const request = buildCategoryVisibilityRequest([INVITEE_OPTIMISTIC_ACCOUNT_ID], [ADMIN_ACCOUNT_ID]);
        save(request);
        await waitForBatchedUpdates();

        // When an invite that generated no accountIDs succeeds, since the invitee already had personal details
        await replaceOptimisticMemberAccountID(Promise.resolve(buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}})), buildInviteRequest([]), true);

        // Then the queued request is unchanged, since none of its IDs were generated by the invite
        expect(getAll().at(0)?.data).toStrictEqual(request.data);
    });

    it('leaves the queued requests alone when the invite fails', async () => {
        // Given a category visibility change queued with the invitee's generated accountID
        const request = buildCategoryVisibilityRequest([INVITEE_OPTIMISTIC_ACCOUNT_ID], [ADMIN_ACCOUNT_ID]);
        save(request);
        await waitForBatchedUpdates();

        // When the invite fails, so the invitee never becomes a member
        await replaceOptimisticMemberAccountID(Promise.resolve(buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}}, 400)), buildInviteRequest(), true);

        // Then the queued request is unchanged, since there's no member to give the change to
        expect(getAll().at(0)?.data).toStrictEqual(request.data);
    });

    it('only rewrites the accountID lists of the commands that send member accountIDs', async () => {
        // Given a queued request of another command whose data happens to hold the invitee's generated accountID
        requestIndex += 1;
        const unrelatedRequest: AnyRequest = {
            command: 'UpdateAgentPrompt',
            data: {agentAccountID: INVITEE_OPTIMISTIC_ACCOUNT_ID, accountIDList: JSON.stringify([INVITEE_OPTIMISTIC_ACCOUNT_ID]), apiRequestType: 'write'},
            requestIndex,
        };
        save(unrelatedRequest);
        await waitForBatchedUpdates();

        // When the invite succeeds
        await replaceOptimisticMemberAccountID(Promise.resolve(buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}})), buildInviteRequest(), true);

        // Then that request is unchanged, since its IDs may not be member accountIDs at all
        expect(getAll().at(0)?.data).toStrictEqual(unrelatedRequest.data);
    });

    it('ignores responses of other commands', async () => {
        // Given a category visibility change queued with the invitee's generated accountID
        const request = buildCategoryVisibilityRequest([INVITEE_OPTIMISTIC_ACCOUNT_ID], [ADMIN_ACCOUNT_ID]);
        save(request);
        await waitForBatchedUpdates();

        // When another command's response sends the invitee's personal details
        requestIndex += 1;
        await replaceOptimisticMemberAccountID(
            Promise.resolve(buildInviteResponse({[INVITEE_REAL_ACCOUNT_ID]: {login: INVITEE_LOGIN}})),
            {command: 'OpenPolicyCategoriesPage', data: {policyID: 'policyID'}, requestIndex},
            true,
        );

        // Then the queued request is unchanged, since only a successful invite makes the invitee a member
        expect(getAll().at(0)?.data).toStrictEqual(request.data);
    });
});
