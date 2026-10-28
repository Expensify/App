import {approveDomainAdminshipRequest, declineDomainAdminshipRequest} from '@libs/actions/Domain';
import {hasPendingDomainAdminRequestsToReview} from '@libs/DomainUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

const domainAccountID = 123;
const adminAccountID = 1;
const requesterAccountID = 456;
const otherRequesterAccountID = 789;

const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const;
const pendingActionsKey = `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}` as const;

/** The state the Admins page and the brick road indicator both render from. */
async function getReviewState() {
    await waitForBatchedUpdates();
    const domain = await getOnyxValue(domainKey);
    const domainPendingActions = await getOnyxValue(pendingActionsKey);

    return {
        hasBrickRoad: hasPendingDomainAdminRequestsToReview(domain, adminAccountID, domainPendingActions),
        requesterAccountIDs: Object.keys(domain?.domain_adminRequesters ?? {}),
        requesterPendingAction: domainPendingActions?.adminshipRequester?.[requesterAccountID]?.pendingAction,
    };
}

function seedDomain(requesterAccountIDs: number[]) {
    const domain: Domain = {
        accountID: domainAccountID,
        email: 'admin@test.com',
        validated: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        domain_defaultSecurityGroupID: '',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        domain_adminRequesters: requesterAccountIDs.reduce<NonNullable<Domain['domain_adminRequesters']>>((acc, accountID) => {
            acc[accountID] = 'read';

            return acc;
        }, {}),
    };
    Reflect.set(domain, `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${adminAccountID}`, adminAccountID);

    return Onyx.set(domainKey, domain).then(waitForBatchedUpdates);
}

// Denying a request keeps the requester in `domain_adminRequesters` until the decline lands, so the row can render
// offline and on failure. The brick road indicator counts that same list, so before the fix denying the last request
// offline left a green dot on the Workspaces tab, the domain row and the Domain admins menu item with nothing left to
// review behind it. The requester's `DELETE` pending action is what separates the two now.
describe('handling a domain adminship request while offline', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = getGlobalFetchMock();
        IntlStore.load(CONST.LOCALES.EN);
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await waitForBatchedUpdates();
    });

    afterAll(async () => {
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
    });

    it('denying the last request keeps its row but drops the brick road', async () => {
        await seedDomain([requesterAccountID]);
        expect((await getReviewState()).hasBrickRoad).toBe(true);

        declineDomainAdminshipRequest(domainAccountID, requesterAccountID);

        const reviewState = await getReviewState();
        expect(reviewState.requesterPendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(reviewState.requesterAccountIDs).toEqual([String(requesterAccountID)]);
        expect(reviewState.hasBrickRoad).toBe(false);
    });

    it('denying one request keeps the brick road while another is still waiting', async () => {
        await seedDomain([requesterAccountID, otherRequesterAccountID]);

        declineDomainAdminshipRequest(domainAccountID, requesterAccountID);

        expect((await getReviewState()).hasBrickRoad).toBe(true);
    });

    it('approving the last request drops the brick road as well', async () => {
        await seedDomain([requesterAccountID]);

        approveDomainAdminshipRequest(domainAccountID, requesterAccountID, 'requester@test.com', 'test.com');

        expect((await getReviewState()).hasBrickRoad).toBe(false);
    });
});
