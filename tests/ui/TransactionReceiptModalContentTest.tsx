/** Exercises receipt editing through the modal and the web and native image producers. */
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type {ButtonProps} from '@components/ButtonComposed';
import type ReceiptCropView from '@components/ReceiptCropView';

import useAllTransactions from '@hooks/useAllTransactions';
import type useOnyx from '@hooks/useOnyx';

import {replaceReceipt, setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {setMoneyRequestOdometerImage} from '@libs/actions/OdometerTransactionUtils';
import type * as CropOrRotateImageModule from '@libs/cropOrRotateImage';
import type {CropOrRotateImage} from '@libs/cropOrRotateImage/types';
import fetchImage from '@libs/fetchImage';
import * as ReceiptPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {logReceiptAdoptFailed} from '@libs/telemetry/ReceiptObservability';

import type AttachmentModalContainerProps from '@pages/media/AttachmentModalScreen/AttachmentModalContainer/types';
import TransactionReceiptModalContent from '@pages/media/AttachmentModalScreen/routes/TransactionReceiptModalContent';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModalScreen/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import type {ImageManipulatorContext, ImageRef} from 'expo-image-manipulator';
import type {ComponentProps} from 'react';
import type ReactNative from 'react-native';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import React from 'react';
import {Platform} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import ImageSize from 'react-native-image-size';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockNativeProducer = false;

// Dispatch to the real implementation so neither producer's result is manufactured by the test.
jest.mock('@libs/cropOrRotateImage', () => {
    const web = jest.requireActual<typeof CropOrRotateImageModule>('../../src/libs/cropOrRotateImage/index.ts');
    const native = jest.requireActual<typeof CropOrRotateImageModule>('../../src/libs/cropOrRotateImage/index.native.ts');
    return {
        __esModule: true,
        default: (...args: Parameters<CropOrRotateImage>) => (mockNativeProducer ? native.default : web.default)(...args),
    };
});

jest.mock('expo-image-manipulator', () => ({ImageManipulator: {manipulate: jest.fn()}, SaveFormat: {JPEG: 'jpeg', PNG: 'png', WEBP: 'webp'}}));
jest.mock('react-native-image-size', () => ({__esModule: true, default: {getSize: jest.fn()}}));
jest.mock('react-native-blob-util', () => ({__esModule: true, default: {fs: {stat: jest.fn()}}}));
jest.mock('@libs/Log', () => ({__esModule: true, default: {warn: jest.fn(), info: jest.fn(), alert: jest.fn()}}));
jest.mock('@libs/actions/IOU/Receipt', () => ({
    detachReceipt: jest.fn(),
    navigateToStartStepIfScanFileCannotBeRead: jest.fn(),
    replaceReceipt: jest.fn(),
    setMoneyRequestReceipt: jest.fn(),
}));
jest.mock('@libs/actions/OdometerTransactionUtils', () => ({removeMoneyRequestOdometerImage: jest.fn(), setMoneyRequestOdometerImage: jest.fn()}));
jest.mock('@libs/actions/Report', () => ({openReport: jest.fn()}));
jest.mock('@libs/telemetry/ReceiptObservability', () => ({logReceiptAdoptFailed: jest.fn()}));
jest.mock('@libs/ReceiptStorage', () => ({__esModule: true, default: {adopt: jest.fn(), toLocalUri: jest.fn(), resolve: jest.fn()}}));
jest.mock('@libs/fetchImage', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {goBack: jest.fn(), navigate: jest.fn(), dismissModal: jest.fn()}}));
jest.mock('@libs/ReportActionsUtils', () => ({getReportAction: jest.fn(), isTrackExpenseAction: () => false}));
// Permissions are fixed here so each case reaches the modal's editing handlers.
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

jest.mock('@components/ButtonComposed', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function ReceiptButton({onPress, children, isDisabled, isLoading}: ButtonProps) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={typeof children === 'string' ? children : undefined}
                onPress={(event) => {
                    onPress?.(event);
                }}
                disabled={isDisabled}
                accessibilityState={{disabled: isDisabled, busy: isLoading}}
            >
                {children}
            </Pressable>
        );
    }
    return {__esModule: true, default: Object.assign(ReceiptButton, {Icon: () => null, Text})};
});

// The container exposes the modal's actual controls without mounting unrelated carousel/navigation UI.
jest.mock('@pages/media/AttachmentModalScreen/AttachmentModalContainer', () => {
    const {View, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function ReceiptContainer({contentProps}: AttachmentModalContainerProps<typeof SCREENS.TRANSACTION_RECEIPT>) {
        return (
            <View>
                {contentProps.footerActionButtons}
                {contentProps.customAttachmentContent}
                <Text testID="pdf-rotation">{contentProps.pdfRotation}</Text>
            </View>
        );
    }
    return {__esModule: true, default: ReceiptContainer};
});

// Geometry enters at the crop-view callback. The modal and image manipulator still perform the crop.
jest.mock('@components/ReceiptCropView', () => {
    const {View, Text, Pressable} = jest.requireActual<typeof ReactNative>('react-native');
    function CropSelection({imageUri, onCropChange}: ComponentProps<typeof ReceiptCropView>) {
        return (
            <View>
                <Text testID="crop-uri">{imageUri}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Select crop"
                    onPress={() => onCropChange?.({x: -2.7, y: 8.9, width: 15.8, height: 1.2})}
                />
            </View>
        );
    }
    return {__esModule: true, default: CropSelection};
});

type ReceiptScreenProps = AttachmentModalScreenProps<typeof SCREENS.TRANSACTION_RECEIPT>;
const transactionID = '123';
const reportID = '456';
const receiptName = 'receipt.jpeg';
const originalUri = 'file:///receipts/original.jpeg';
const manipulatedUri = 'file:///cache/manipulated.jpeg';
const durableUri = 'file:///receipts/durable.jpeg';
const webObjectUri = 'blob:manipulated-receipt';
const receiptObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const mockCreateReceiptObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>();

const receiptTransaction = createMock<Transaction>({
    transactionID,
    reportID,
    receipt: {source: originalUri, filename: receiptName, type: CONST.IMAGE_FILE_FORMAT.JPEG, state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
});
const receiptReport = createMock<Report>({reportID, type: CONST.REPORT.TYPE.EXPENSE});
const imageRef = createMock<ImageRef>({saveAsync: jest.fn<ReturnType<ImageRef['saveAsync']>, Parameters<ImageRef['saveAsync']>>()});
const imageContext = createMock<ImageManipulatorContext>({
    crop: jest.fn<ReturnType<ImageManipulatorContext['crop']>, Parameters<ImageManipulatorContext['crop']>>().mockReturnThis(),
    rotate: jest.fn<ReturnType<ImageManipulatorContext['rotate']>, Parameters<ImageManipulatorContext['rotate']>>().mockReturnThis(),
    renderAsync: jest.fn<ReturnType<ImageManipulatorContext['renderAsync']>, Parameters<ImageManipulatorContext['renderAsync']>>(),
});

async function renderReceipt(transaction = receiptTransaction, params: Partial<ReceiptScreenProps['route']['params']> = {}) {
    jest.mocked(useAllTransactions).mockReturnValue({[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction});
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, receiptReport);
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, transaction);
    await Onyx.set(ONYXKEYS.SESSION, {accountID: 1, encryptedAuthToken: 'receipt-test-token'});
    render(
        <TransactionReceiptModalContent
            navigation={createMock<ReceiptScreenProps['navigation']>({goBack: jest.fn()})}
            route={{key: 'receipt', name: SCREENS.TRANSACTION_RECEIPT, params: {reportID, transactionID, ...params}}}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {configurable: true, writable: true, value: mockCreateReceiptObjectURL});
});

afterAll(() => {
    if (receiptObjectURLDescriptor) {
        Object.defineProperty(URL, 'createObjectURL', receiptObjectURLDescriptor);
    } else {
        Reflect.deleteProperty(URL, 'createObjectURL');
    }
});

beforeEach(async () => {
    jest.clearAllMocks();
    await Onyx.clear();
    mockNativeProducer = false;
    jest.replaceProperty(Platform, 'OS', 'web');
    jest.spyOn(ImageManipulator, 'manipulate').mockReturnValue(imageContext);
    jest.spyOn(imageContext, 'renderAsync').mockResolvedValue(imageRef);
    jest.spyOn(imageRef, 'saveAsync').mockResolvedValue({uri: manipulatedUri, width: 640, height: 480, base64: 'discard-this-native-field'});
    jest.spyOn(RNFetchBlob.fs, 'stat').mockResolvedValue(createMock<Awaited<ReturnType<typeof RNFetchBlob.fs.stat>>>({size: 12}));
    jest.spyOn(ImageSize, 'getSize').mockResolvedValue({width: 640, height: 480, rotation: 0});
    jest.mocked(ReceiptStorage.adopt).mockResolvedValue('durable.jpeg');
    jest.mocked(ReceiptStorage.toLocalUri).mockReturnValue(durableUri);
    jest.mocked(ReceiptStorage.resolve).mockImplementation((source) => (typeof source === 'string' ? source : undefined));
    jest.mocked(fetchImage).mockResolvedValue(originalUri);
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(createMock<Response>({blob: () => Promise.resolve(new Blob(['image-bytes'], {type: CONST.IMAGE_FILE_FORMAT.JPEG}))}));
    mockCreateReceiptObjectURL.mockReturnValue(webObjectUri);
});

afterEach(() => jest.restoreAllMocks());

describe('TransactionReceiptModalContent image editing', () => {
    it.each(['web', 'android', 'ios'] as const)('rotates a %s receipt and uploads the durable producer representation', async (platform) => {
        mockNativeProducer = platform !== 'web';
        jest.replaceProperty(Platform, 'OS', platform);
        await renderReceipt();
        fireEvent.press(screen.getByText('common.rotate'));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacement = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0];
        expect(replacement).toBeDefined();
        expect(replacement?.transaction).toEqual(receiptTransaction);
        expect(replacement?.source).toBe(durableUri);
        expect(replacement?.isSameReceipt).toBe(true);
        expect(replacement?.state).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
        expect(replacement?.file).toMatchObject({uri: durableUri, source: durableUri, name: receiptName, type: CONST.IMAGE_FILE_FORMAT.JPEG});
        expect(jest.spyOn(imageContext, 'rotate')).toHaveBeenCalledWith(-90);
        expect(jest.spyOn(imageContext, 'crop')).not.toHaveBeenCalled();
        expect(jest.spyOn(imageRef, 'saveAsync')).toHaveBeenCalledWith({compress: 1, format: SaveFormat.JPEG});
        expect(ReceiptStorage.adopt).toHaveBeenCalledWith(platform === 'web' ? webObjectUri : manipulatedUri, receiptName);
        expect(ReceiptStorage.toLocalUri).toHaveBeenCalledWith('durable.jpeg');
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
        expect(setMoneyRequestOdometerImage).not.toHaveBeenCalled();
        if (platform === 'web') {
            expect(replacement?.file).toBeInstanceOf(File);
            expect(replacement?.file?.size).toBe(new Blob(['image-bytes']).size);
        } else {
            expect(replacement?.file).not.toBeInstanceOf(File);
            expect(replacement?.file).toMatchObject({width: 640, height: 480, size: 12});
            expect(replacement?.file).not.toHaveProperty('base64');
            expect(globalThis.fetch).not.toHaveBeenCalled();
            expect(jest.spyOn(URL, 'createObjectURL')).not.toHaveBeenCalled();
        }
    });

    it.each([true, false])('retains the iOS fallback when dimension lookup succeeds: %s', async (hasDimensions) => {
        mockNativeProducer = true;
        jest.replaceProperty(Platform, 'OS', 'ios');
        jest.spyOn(imageContext, 'renderAsync').mockRejectedValueOnce(new Error('image allocation failed'));
        if (!hasDimensions) {
            jest.spyOn(ImageSize, 'getSize').mockRejectedValueOnce(new Error('dimensions unavailable'));
        }
        await renderReceipt();
        fireEvent.press(screen.getByText('common.rotate'));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacement = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0];
        expect(replacement).toBeDefined();
        expect(replacement?.file).not.toBeInstanceOf(File);
        expect(replacement?.file).toMatchObject({uri: durableUri, source: durableUri, width: hasDimensions ? 640 : 0, height: hasDimensions ? 480 : 0, size: 12, name: receiptName});
        expect(ReceiptStorage.adopt).toHaveBeenCalledWith(originalUri, receiptName);
        expect(jest.spyOn(ImageSize, 'getSize')).toHaveBeenCalledWith(originalUri);
        expect(jest.spyOn(Log, 'warn')).toHaveBeenCalled();
    });

    it.each(['web', 'android'] as const)('logs adoption failure and keeps the original %s manipulation URI', async (platform) => {
        mockNativeProducer = platform === 'android';
        jest.replaceProperty(Platform, 'OS', platform);
        const adoptionError = new Error('receipt folder unavailable');
        jest.mocked(ReceiptStorage.adopt).mockRejectedValueOnce(adoptionError);
        await renderReceipt();
        fireEvent.press(screen.getByText('common.rotate'));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacement = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0];
        expect(replacement).toBeDefined();
        const fallbackUri = platform === 'web' ? webObjectUri : manipulatedUri;
        expect(replacement?.source).toBe(fallbackUri);
        expect(replacement?.file).toMatchObject({uri: fallbackUri, source: fallbackUri});
        expect(logReceiptAdoptFailed).toHaveBeenCalledWith({error: adoptionError, captureSource: 'replace'});
        expect(ReceiptStorage.toLocalUri).not.toHaveBeenCalled();
    });

    it.each(['web', 'android'] as const)('floors and clamps crop geometry for %s without the rotation-only flags', async (platform) => {
        mockNativeProducer = platform === 'android';
        jest.replaceProperty(Platform, 'OS', platform);
        await renderReceipt();
        fireEvent.press(screen.getByText('receipt.crop'));
        expect(screen.getByTestId('crop-uri')).toHaveTextContent(originalUri);
        fireEvent.press(screen.getByRole('button', {name: 'Select crop'}));
        fireEvent.press(screen.getByText('common.save'));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        const replacement = jest.mocked(replaceReceipt).mock.calls.at(0)?.[0];
        expect(replacement).toBeDefined();
        expect(replacement?.file).toMatchObject({uri: durableUri, source: durableUri});
        expect(replacement).not.toHaveProperty('isSameReceipt');
        expect(replacement).not.toHaveProperty('state');
        expect(jest.spyOn(imageContext, 'crop')).toHaveBeenCalledWith({originX: 0, originY: 8, width: 15, height: 1});
        expect(jest.spyOn(imageContext, 'rotate')).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', {name: 'Select crop'})).toBeNull();
    });

    it('writes the draft receipt using its transaction key', async () => {
        mockNativeProducer = true;
        jest.replaceProperty(Platform, 'OS', 'android');
        await renderReceipt(receiptTransaction, {action: CONST.IOU.ACTION.CREATE});
        fireEvent.press(screen.getByText('common.rotate'));
        await waitFor(() => expect(setMoneyRequestReceipt).toHaveBeenCalledTimes(1));
        expect(setMoneyRequestReceipt).toHaveBeenCalledWith(transactionID, durableUri, receiptName, true, CONST.IMAGE_FILE_FORMAT.JPEG);
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(setMoneyRequestOdometerImage).not.toHaveBeenCalled();
    });

    it.each([
        {imageType: CONST.IOU.ODOMETER_IMAGE_TYPE.START, isDraft: true, isEditingConfirmation: true},
        {imageType: CONST.IOU.ODOMETER_IMAGE_TYPE.END, isDraft: true, isEditingConfirmation: false},
        {imageType: CONST.IOU.ODOMETER_IMAGE_TYPE.START, isDraft: false, isEditingConfirmation: false},
        {imageType: CONST.IOU.ODOMETER_IMAGE_TYPE.END, isDraft: false, isEditingConfirmation: true},
    ])('routes $imageType odometer edits with draft=$isDraft and confirmation=$isEditingConfirmation', async ({imageType, isDraft, isEditingConfirmation}) => {
        mockNativeProducer = true;
        jest.replaceProperty(Platform, 'OS', 'android');
        const odometerTransaction = createMock<Transaction>({
            transactionID,
            reportID,
            comment: {
                odometerStartImage: {uri: 'file:///start.jpeg', name: 'start.jpeg', type: CONST.IMAGE_FILE_FORMAT.JPEG},
                odometerEndImage: {uri: 'file:///end.jpeg', name: 'end.jpeg', type: CONST.IMAGE_FILE_FORMAT.JPEG},
            },
        });
        await renderReceipt(odometerTransaction, {imageType, isEditingConfirmation, ...(isDraft ? {action: CONST.IOU.ACTION.CREATE} : {})});
        fireEvent.press(screen.getByText('common.rotate'));
        await waitFor(() => expect(setMoneyRequestOdometerImage).toHaveBeenCalledTimes(1));
        const odometerUpdate = jest.mocked(setMoneyRequestOdometerImage).mock.calls.at(0);
        expect(odometerUpdate).toBeDefined();
        expect(odometerUpdate?.[0]).toEqual(odometerTransaction);
        expect(odometerUpdate?.[1]).toBe(imageType);
        expect(odometerUpdate?.[2]).toMatchObject({uri: durableUri, source: durableUri, name: imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'start.jpeg' : 'end.jpeg'});
        expect(odometerUpdate?.[2]).not.toBeInstanceOf(File);
        expect(odometerUpdate?.[3]).toBe(isDraft);
        expect(odometerUpdate?.[4]).toBe(!isEditingConfirmation);
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
        expect(replaceReceipt).not.toHaveBeenCalled();
    });

    it.each(['rotate', 'crop'] as const)('clears busy state after a rejected %s and permits retry', async (operation) => {
        mockNativeProducer = true;
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(imageContext, 'renderAsync').mockRejectedValueOnce(new Error('manipulation failed'));
        await renderReceipt();
        if (operation === 'crop') {
            fireEvent.press(screen.getByText('receipt.crop'));
            fireEvent.press(screen.getByRole('button', {name: 'Select crop'}));
        }
        const buttonText = operation === 'crop' ? 'common.save' : 'common.rotate';
        fireEvent.press(screen.getByText(buttonText));
        await waitForBatchedUpdatesWithAct();
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(ReceiptStorage.adopt).not.toHaveBeenCalled();
        fireEvent.press(screen.getByText(buttonText));
        await waitFor(() => expect(replaceReceipt).toHaveBeenCalledTimes(1));
        expect(jest.spyOn(imageContext, 'renderAsync')).toHaveBeenCalledTimes(2);
    });

    it('ignores rotation and exits cropping when authentication supplies no image URI', async () => {
        jest.mocked(fetchImage).mockResolvedValue('');
        const remoteReceipt = createMock<Transaction>({...receiptTransaction, receipt: {...receiptTransaction.receipt, source: 'https://example.com/receipt.jpeg'}});
        await renderReceipt(remoteReceipt);
        fireEvent.press(screen.getByText('common.rotate'));
        fireEvent.press(screen.getByText('receipt.crop'));
        fireEvent.press(screen.getByRole('button', {name: 'Select crop'}));
        fireEvent.press(screen.getByText('common.save'));
        await waitForBatchedUpdatesWithAct();
        expect(jest.spyOn(ImageManipulator, 'manipulate')).not.toHaveBeenCalled();
        expect(ReceiptStorage.adopt).not.toHaveBeenCalled();
        expect(replaceReceipt).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', {name: 'Select crop'})).toBeNull();
    });

    it('cycles PDF rotation through the four quarter turns', async () => {
        // Jest resolves getPlatform to its native module independently of Platform.OS.
        jest.spyOn(ReceiptPlatform, 'default').mockReturnValue(CONST.PLATFORM.WEB);
        const pdfTransaction = createMock<Transaction>({...receiptTransaction, receipt: {source: 'file:///receipts/original.pdf', filename: 'receipt.pdf', type: 'application/pdf'}});
        await renderReceipt(pdfTransaction);
        expect(screen.getByTestId('pdf-rotation')).toHaveTextContent('0');
        for (const rotation of [270, 180, 90, 0]) {
            fireEvent.press(screen.getByText('common.rotate'));
            expect(screen.getByTestId('pdf-rotation')).toHaveTextContent(String(rotation));
        }
        expect(jest.spyOn(ImageManipulator, 'manipulate')).not.toHaveBeenCalled();
    });
});
