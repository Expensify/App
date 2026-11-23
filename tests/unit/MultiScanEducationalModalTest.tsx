import {act, renderHook} from '@testing-library/react-native';

import type {FeatureTrainingModalProps} from '@components/FeatureTrainingModal';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import MultiScanEducationalModalContent from '@components/MultiScanEducationalModalContent';

import type useMultiScanEducationalModal from '@hooks/useMultiScanEducationalModal/index';
import type useNativeMultiScanEducationalModal from '@hooks/useMultiScanEducationalModal/index.native';
import useOnyx from '@hooks/useOnyx';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';

import {MultiScanProvider, useMultiScanActions, useMultiScanState} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';
import useScanRouteParams from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams';

import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockModalProps: FeatureTrainingModalProps | undefined;

jest.mock('@components/FeatureTrainingModal', () => ({
    __esModule: true,
    default: (props: FeatureTrainingModalProps) => {
        mockModalProps = props;
        return null;
    },
}));
jest.mock('@components/MultiScanEducationalModalContent', () => ({__esModule: true, default: () => null}));
jest.mock('@hooks/useMultiScanEducationalModal', () => jest.requireActual<{default: typeof useNativeMultiScanEducationalModal}>('@hooks/useMultiScanEducationalModal/index.native'));
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useShouldSuppressPromotionalUI');
jest.mock('@libs/actions/Welcome', () => ({dismissProductTraining: jest.fn()}));
jest.mock('@userActions/TransactionEdit', () => ({removeTransactionReceipt: jest.fn(), removeDraftTransactionsByIDs: jest.fn()}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams');

function renderMultiScan() {
    return renderHook(() => ({...useMultiScanState(), ...useMultiScanActions(), styles: useThemeStyles()}), {
        wrapper: ({children}: {children: React.ReactNode}) => (
            <ModalProvider>
                <MultiScanProvider>{children}</MultiScanProvider>
            </ModalProvider>
        ),
    });
}

describe('multi-scan education', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockModalProps = undefined;
        jest.mocked(useScanRouteParams).mockReturnValue({
            iouType: CONST.IOU.TYPE.SUBMIT,
            routeName: SCREENS.MONEY_REQUEST.CREATE,
            action: CONST.IOU.ACTION.CREATE,
            reportID: '1',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        jest.mocked(useShouldSuppressPromotionalUI).mockReturnValue(false);
        jest.mocked(useOnyx).mockImplementation((key) => [key === ONYXKEYS.COLLECTION.TRANSACTION_DRAFT ? ['1', '2'] : {}, {status: 'loaded'}]);
    });

    it.each(['confirm', 'close'] as const)('dismisses training only after the global modal finishes its %s path', async (action) => {
        // Given native multi-scan training that has not been dismissed
        const {result} = renderMultiScan();

        // When multi-scan is toggled, its state and draft cleanup update without waiting for the modal
        await act(async () => {
            result.current.toggleMultiScan();
            await waitForBatchedUpdates();
        });

        // Then the global entry preserves the content and padding without dismissing training early
        expect(result.current.isMultiScanEnabled).toBe(true);
        expect(removeTransactionReceipt).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        expect(removeDraftTransactionsByIDs).toHaveBeenCalledWith(['1', '2'], true);
        expect(mockModalProps?.modalInnerContainerStyle).toEqual(result.current.styles.pt0);
        expect(React.isValidElement(mockModalProps?.children) && mockModalProps.children.type).toBe(MultiScanEducationalModalContent);
        expect(mockModalProps?.shouldCloseOnConfirm).toBe(true);
        expect(dismissProductTraining).not.toHaveBeenCalled();

        // When confirming, dismissal still waits for the modal's close animation
        if (action === 'confirm') {
            await act(async () => {
                mockModalProps?.onConfirm?.(false);
                await waitForBatchedUpdates();
            });
            expect(dismissProductTraining).not.toHaveBeenCalled();
        }
        await act(async () => {
            mockModalProps?.onClose?.();
            await waitForBatchedUpdates();
        });

        // Then either close path records dismissal once and leaves multi-scan enabled
        expect(dismissProductTraining).toHaveBeenCalledTimes(1);
        expect(dismissProductTraining).toHaveBeenCalledWith(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
        expect(result.current.isMultiScanEnabled).toBe(true);
        act(() => result.current.disableMultiScan());
        expect(result.current.isMultiScanEnabled).toBe(false);
    });

    it.each(['dismissed', 'suppressed'] as const)('does not open education when training is %s', async (reason) => {
        // Given a user who already dismissed training or cannot see promotional UI
        jest.mocked(useShouldSuppressPromotionalUI).mockReturnValue(reason === 'suppressed');
        if (reason === 'dismissed') {
            jest.mocked(useOnyx).mockImplementation((key) => [
                key === ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING ? {[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]: true} : [],
                {status: 'loaded'},
            ]);
        }
        const {result} = renderMultiScan();

        // When multi-scan is toggled on and off
        await act(async () => {
            result.current.toggleMultiScan();
            await waitForBatchedUpdates();
        });
        expect(result.current.isMultiScanEnabled).toBe(true);
        act(() => result.current.toggleMultiScan());

        // Then toggling still works without opening a modal or recording another dismissal
        expect(result.current.isMultiScanEnabled).toBe(false);
        expect(mockModalProps).toBeUndefined();
        expect(dismissProductTraining).not.toHaveBeenCalled();
        expect(removeTransactionReceipt).toHaveBeenCalledTimes(2);
    });

    it('keeps the web hook a no-op without requiring a global modal provider', () => {
        // Given the explicit web implementation rather than Jest's native module resolution
        const useWebMultiScanEducationalModal = jest.requireActual<{default: typeof useMultiScanEducationalModal}>('@hooks/useMultiScanEducationalModal/index.ts').default;
        const {result} = renderHook(useWebMultiScanEducationalModal);

        // When a web caller tries to show education
        const dismissal = result.current();

        // Then no modal or dismissal promise exists, so training remains untouched on web
        expect(dismissal).toBeUndefined();
        expect(mockModalProps).toBeUndefined();
        expect(dismissProductTraining).not.toHaveBeenCalled();
    });
});
