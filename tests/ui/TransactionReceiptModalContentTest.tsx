import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type {ButtonProps} from '@components/Button';

import useAllTransactions from '@hooks/useAllTransactions';
import type useOnyx from '@hooks/useOnyx';

import {replaceReceipt} from '@libs/actions/IOU/Receipt';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import ReceiptStorage from '@libs/ReceiptStorage';
import type * as ReportActionsUtils from '@libs/ReportActionsUtils';

import type AttachmentModalContainerProps from '@pages/media/AttachmentModalScreen/AttachmentModalContainer/types';
import TransactionReceiptModalContent from '@pages/media/AttachmentModalScreen/routes/TransactionReceiptModalContent';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/cropOrRotateImage', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/actions/IOU/Receipt', () => ({
    detachReceipt: jest.fn(),
    navigateToStartStepIfScanFileCannotBeRead: jest.fn(),
    replaceReceipt: jest.fn(),
    setMoneyRequestReceipt: jest.fn(),
}));
jest.mock('@libs/actions/OdometerTransactionUtils', () => ({removeMoneyRequestOdometerImage: jest.fn(), setMoneyRequestOdometerImage: jest.fn()}));
jest.mock('@libs/actions/Report', () => ({openReport: jest.fn()}));
jest.mock('@libs/ReceiptStorage', () => ({__esModule: true, default: {adopt: jest.fn(), toLocalUri: jest.fn(), resolve: jest.fn()}}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {goBack: jest.fn(), navigate: jest.fn(), dismissModal: jest.fn()}}));
jest.mock('@libs/ReportActionsUtils', () => ({
    getIOUActionForTransactionID: jest.requireActual<typeof ReportActionsUtils>('@libs/ReportActionsUtils').getIOUActionForTransactionID,
    getReportAction: jest.fn(),
    isTrackExpenseAction: () => false,
    resolveTransactionThreadReport: jest.requireActual<typeof ReportActionsUtils>('@libs/ReportActionsUtils').resolveTransactionThreadReport,
}));
// Permissions are fixed here so the test reaches the modal's rotate handler.
jest.mock('@libs/ReportUtils', () => ({canEditFieldOfMoneyRequest: () => true, isMoneyRequestReport: () => true, isTrackExpenseReport: () => false}));
jest.mock('@hooks/useAllTransactions', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.requireActual<{useOnyx: typeof useOnyx}>('react-native-onyx').useOnyx}));
jest.mock('@hooks/usePolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useRestartOnOdometerImagesFailure', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: jest.fn()})}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@pages/media/AttachmentModalScreen/routes/hooks/useDownloadAttachment', () => ({__esModule: true, default: () => jest.fn()}));

jest.mock('@components/Button', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function ReceiptButton({onPress, children}: ButtonProps) {
        return (
            <Pressable
                accessibilityRole="button"
                onPress={(event) => {
                    onPress?.(event);
                }}
            >
                {children}
            </Pressable>
        );
    }
    return {__esModule: true, default: Object.assign(ReceiptButton, {Icon: () => null, Text})};
});

// The container renders only the footer buttons, so the test needs no carousel or navigation UI.
jest.mock('@pages/media/AttachmentModalScreen/AttachmentModalContainer', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function ReceiptContainer({contentProps}: AttachmentModalContainerProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
        return <View>{contentProps.footerActionButtons}</View>;
    }
    return {__esModule: true, default: ReceiptContainer};
});

type ReceiptScreenProps = AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>;
const transactionID = '123';
const reportID = '456';
const receiptName = 'receipt.jpeg';
const originalUri = 'file:///receipts/original.jpeg';
const manipulatedUri = 'file:///cache/manipulated.jpeg';
const durableUri = 'file:///receipts/durable.jpeg';

const receiptTransaction = createMock<Transaction>({
    transactionID,
    reportID,
    receipt: {source: originalUri, filename: receiptName, type: CONST.IMAGE_FILE_FORMAT.JPEG, state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
});

describe('TransactionReceiptModalContent', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        jest.mocked(useAllTransactions).mockReturnValue({[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: receiptTransaction});
        jest.mocked(ReceiptStorage.adopt).mockResolvedValue('durable.jpeg');
        jest.mocked(ReceiptStorage.toLocalUri).mockReturnValue(durableUri);
        jest.mocked(ReceiptStorage.resolve).mockImplementation((source) => (typeof source === 'string' ? source : undefined));
    });

    it('saves a rotated native receipt as the image manipulator result with the durable URI', async () => {
        // Given native image manipulation returns a plain result object instead of a web File
        jest.mocked(cropOrRotateImage).mockResolvedValue({uri: manipulatedUri, width: 640, height: 480, size: 12, name: receiptName, type: CONST.IMAGE_FILE_FORMAT.JPEG});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, createMock<Report>({reportID, type: CONST.REPORT.TYPE.EXPENSE}));
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 1});
        render(
            <TransactionReceiptModalContent
                navigation={createMock<ReceiptScreenProps['navigation']>({goBack: jest.fn()})}
                route={{key: 'receipt', name: SCREENS.TRANSACTION_RECEIPT, params: {reportID, transactionID}}}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user rotates the receipt
        fireEvent.press(screen.getByText('common.rotate'));

        // Then the replacement keeps the native result's fields and points at the durable copy, because `new File` cannot read a native file URI
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacementFile = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0].file;
        expect(replacementFile).not.toBeInstanceOf(File);
        expect(replacementFile).toEqual({uri: durableUri, source: durableUri, width: 640, height: 480, size: 12, name: receiptName, type: CONST.IMAGE_FILE_FORMAT.JPEG});
    });
});
