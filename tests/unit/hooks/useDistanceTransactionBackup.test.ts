import {renderHook} from '@testing-library/react-native';

import {openReport} from '@libs/actions/Report';

import useDistanceTransactionBackup from '@pages/iou/request/step/IOURequestStepDistance/hooks/useDistanceTransactionBackup';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@libs/actions/TransactionEdit', () => ({
    createBackupTransaction: jest.fn(),
    removeBackupTransaction: jest.fn(),
    restoreOriginalTransactionFromBackup: jest.fn(),
}));

describe('useDistanceTransactionBackup', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it("sends the expense report policy's full policy snapshot marker when reopening the report after an unsaved edit", async () => {
        // Given a distance expense without a route in a workspace expense report whose full policy snapshot is already cached
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}report1`, {reportID: 'report1', policyID: 'policy1'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}policy1`, {lastModified: 123});
        await waitForBatchedUpdates();
        const {unmount} = renderHook(() =>
            useDistanceTransactionBackup({
                transaction: createMock<Transaction>({transactionID: 'transaction1', reportID: 'report1'}),
                isCreatingNewRequest: false,
                isEditingSplit: false,
                isDraft: false,
                introSelected: undefined,
                conciergeChat: undefined,
                isSelfTourViewed: undefined,
                hasCompletedGuidedSetupFlow: undefined,
                transactionWasSavedRef: {current: false},
            }),
        );
        await waitForBatchedUpdates();

        // When the distance editor closes without saving
        unmount();

        // Then the report is reopened with the marker so Auth can skip the policy collections it already sent
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: 'report1', fullPolicySnapshot: {policyID: 'policy1', lastModified: 123}}));
    });
});
