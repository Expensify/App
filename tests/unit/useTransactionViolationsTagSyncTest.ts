import {renderHook, waitFor} from '@testing-library/react-native';

import useTransactionViolations from '@hooks/useTransactionViolations';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        email: 'test@example.com',
        accountID: 1,
    })),
}));

describe('useTransactionViolations tag sync', () => {
    const transactionID = 'tag-txn-1';
    const reportID = 'tag-report-1';
    const policyID = 'tag-policy-1';
    const tagName = 'Tag 1';
    const otherTagName = 'Tag 2';

    const policy: Policy = {
        ...createRandomPolicy(1),
        id: policyID,
        requiresTag: true,
    };

    const policyTags: PolicyTagLists = {
        Tag: {
            name: 'Tag',
            required: true,
            orderWeight: 0,
            tags: {
                [tagName]: {name: tagName, enabled: true},
                [otherTagName]: {name: otherTagName, enabled: true},
            },
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTags);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            policyID,
            ownerAccountID: 1,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
            ...createRandomTransaction(1),
            transactionID,
            reportID,
            tag: tagName,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
        await waitForBatchedUpdates();
    });

    it('flags the expense as soon as the tag it holds is deleted from the policy', async () => {
        // Given an expense whose tag is still valid, so it carries no violations
        const {result} = renderHook(() => useTransactionViolations(transactionID));

        await waitFor(() => {
            expect(result.current).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY}));
        });

        // When the workspace admin deletes that tag and only the tag list update reaches this client
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {Tag: {tags: {[tagName]: null}}});
        await waitForBatchedUpdates();

        // Then the expense is flagged straight away, without a transactionViolations_ update or a refresh
        await waitFor(() => {
            expect(result.current).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY}));
        });
    });

    it('clears the violation as soon as the tag is enabled again', async () => {
        // Given an expense flagged for a tag the workspace had disabled
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {Tag: {tags: {[tagName]: {enabled: false}}}});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolations(transactionID));

        await waitFor(() => {
            expect(result.current).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY}));
        });

        // When the admin re-enables the tag
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {Tag: {tags: {[tagName]: {enabled: true}}}});
        await waitForBatchedUpdates();

        // Then the violation goes away without waiting for the server to clear it
        await waitFor(() => {
            expect(result.current).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY}));
        });
    });

    it('keeps the stored violations when the policy tags are not loaded', async () => {
        // Given a client that holds a tagOutOfPolicy violation but no tag list for the policy
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
            {name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
        ]);
        await waitForBatchedUpdates();

        // When the violations are read
        const {result} = renderHook(() => useTransactionViolations(transactionID));

        // Then the server's violation is kept, since an absent tag list is not evidence that the tag is valid
        await waitFor(() => {
            expect(result.current).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY}));
        });
    });
});
