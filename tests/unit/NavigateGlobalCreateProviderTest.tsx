/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- baseProps is a minimal test fixture; casting via `as unknown` keeps the test focused on mount-stability instead of dragging in every field of WithCurrentUserPersonalDetailsProps */
import {render} from '@testing-library/react-native';
import React, {useEffect} from 'react';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import {NavigateGlobalCreateProvider} from '@pages/iou/request/step/IOURequestStepScan/components/NavigateGlobalCreateContext';
import CONST from '@src/CONST';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Stub the heavy hooks the Subscriber pulls in — this test only cares about
// mount stability of the children subtree across the isReady transition.
jest.mock('@hooks/useDefaultExpensePolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useSelfDMReport', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));

const baseProps = {
    iouType: CONST.IOU.TYPE.CREATE,
    reportID: '1',
    transactionID: 't1',
    transaction: undefined,
    backToReport: undefined,
    currentUserPersonalDetails: {accountID: 1, login: 'a@b.com'},
} as unknown as WithCurrentUserPersonalDetailsProps & {
    iouType: typeof CONST.IOU.TYPE.CREATE;
    reportID: string;
    transactionID: string;
    transaction: undefined;
    backToReport: undefined;
};

describe('NavigateGlobalCreateProvider', () => {
    it('does not remount children across the isReady transition', async () => {
        let mountCount = 0;

        function Child() {
            useEffect(() => {
                mountCount++;
            }, []);
            return null;
        }

        render(
            <NavigateGlobalCreateProvider {...baseProps}>
                <Child />
            </NavigateGlobalCreateProvider>,
        );

        // Wait for the Provider's one-tick useEffect (setIsReady) + the
        // Subscriber to mount and its own useEffect (fnRef publish) to fire.
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        // If the Provider's root element type ever changes across the isReady
        // flip, React would tear down and rebuild the children subtree — the
        // Camera would remount, and this count would jump to 2.
        expect(mountCount).toBe(1);
    });
});
