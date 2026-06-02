/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'TEST_POLICY_123';
const domainID = 12345678;

// Real feed names that are already in the spell-check dictionary
const oldStyleFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_FILE_DOWNLOAD;
const oauthFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT;

describe('useCardFeeds', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('effectiveWorkspaceAccountID fallback for domain-based card accounts', () => {
        it('returns feeds from the linked domain when workspaceAccountID is 0 and a feed has preferredPolicy matching the policy', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {workspaceAccountID: 0});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainID}`, {
                settings: {
                    companyCards: {
                        // Old-style feed linking the domain to this policy — no cards, will be filtered by the gray zone rule
                        [oldStyleFeed]: {preferredPolicy: policyID, liabilityType: 'corporate'},
                        // Active OAuth feed with no preferredPolicy — should appear because domainID matches effectiveWorkspaceAccountID
                        [oauthFeed]: {preferredPolicy: '', liabilityType: 'corporate'},
                    },
                    oAuthAccountDetails: {
                        [oauthFeed]: {credentials: 'xxxx', expiration: 9999999999, accountList: ['Card 1']},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainID}_${oauthFeed}`, {
                '123': {cardID: 123, cardName: 'Card 1'},
            });
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            await waitFor(() => {
                const [workspaceFeeds] = result.current;
                const feedKeys = Object.keys(workspaceFeeds ?? {});
                expect(feedKeys.some((key) => key.includes(oauthFeed))).toBe(true);
                expect(Object.values(workspaceFeeds ?? {}).every((feed) => feed.domainID === domainID)).toBe(true);
            });
        });

        it('returns no feeds when workspaceAccountID is 0 and no domain has a feed linked to the policy', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {workspaceAccountID: 0});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainID}`, {
                settings: {
                    companyCards: {
                        [oauthFeed]: {preferredPolicy: '', liabilityType: 'corporate'},
                    },
                    oAuthAccountDetails: {
                        [oauthFeed]: {credentials: 'xxxx', expiration: 9999999999, accountList: ['Card 1']},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainID}_${oauthFeed}`, {
                '123': {cardID: 123, cardName: 'Card 1'},
            });
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            await waitFor(() => {
                const [workspaceFeeds] = result.current;
                expect(Object.keys(workspaceFeeds ?? {}).length).toBe(0);
            });
        });

        it('does not use the fallback when workspaceAccountID is non-zero', async () => {
            const workspaceAccountID = 99999999;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {workspaceAccountID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainID}`, {
                settings: {
                    companyCards: {
                        [oauthFeed]: {preferredPolicy: '', liabilityType: 'corporate'},
                    },
                    oAuthAccountDetails: {
                        [oauthFeed]: {credentials: 'xxxx', expiration: 9999999999, accountList: ['Card 1']},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainID}_${oauthFeed}`, {
                '123': {cardID: 123, cardName: 'Card 1'},
            });
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            await waitFor(() => {
                const [workspaceFeeds] = result.current;
                const feedKeys = Object.keys(workspaceFeeds ?? {});
                expect(feedKeys.some((key) => key.includes(oauthFeed))).toBe(false);
            });
        });
    });

    describe('linkedPolicyIDs predicate filtering', () => {
        const combinedFeedKey = getCardFeedWithDomainID(oauthFeed, domainID);

        const setupDomainFeed = async (companyCardSettings: {preferredPolicy: string; linkedPolicyIDs?: string[]}) => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {workspaceAccountID: 0});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainID}`, {
                settings: {
                    companyCards: {
                        [oauthFeed]: {...companyCardSettings, liabilityType: 'corporate'},
                    },
                    oAuthAccountDetails: {
                        [oauthFeed]: {credentials: 'xxxx', expiration: 9999999999, accountList: ['Card 1']},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainID}_${oauthFeed}`, {
                '123': {cardID: 123, cardName: 'Card 1'},
            });
            await waitForBatchedUpdates();
        };

        it('includes domain feeds when linkedPolicyIDs contains only an empty string and preferredPolicy matches', async () => {
            await setupDomainFeed({preferredPolicy: policyID, linkedPolicyIDs: ['']});

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            // The combined feed key contains '.', so wrap it in an array to disable
            // jest's nested-path interpretation in toHaveProperty.
            await waitFor(() => expect(result.current[0]).toHaveProperty([combinedFeedKey]));
        });

        it('includes domain feeds when linkedPolicyIDs is an empty array and preferredPolicy matches', async () => {
            await setupDomainFeed({preferredPolicy: policyID, linkedPolicyIDs: []});

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            await waitFor(() => expect(result.current[0]).toHaveProperty([combinedFeedKey]));
        });

        it('excludes feeds when linkedPolicyIDs explicitly lists other policies and preferredPolicy does not match', async () => {
            await setupDomainFeed({preferredPolicy: 'OTHER_POLICY', linkedPolicyIDs: ['OTHER_POLICY']});

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            // Wait for the hook to finish loading before asserting absence, so the negative
            // assertion can't pass vacuously while Onyx is still hydrating.
            await waitFor(() => expect(result.current[1].status).toBe('loaded'));
            expect(result.current[0]).not.toHaveProperty([combinedFeedKey]);
        });

        it('includes feeds when policyID is one of multiple meaningful entries in linkedPolicyIDs', async () => {
            await setupDomainFeed({preferredPolicy: 'OTHER_POLICY', linkedPolicyIDs: ['OTHER_POLICY', policyID]});

            const {result} = renderHook(() => useCardFeeds(policyID));
            await waitForBatchedUpdates();

            await waitFor(() => expect(result.current[0]).toHaveProperty([combinedFeedKey]));
        });
    });
});
