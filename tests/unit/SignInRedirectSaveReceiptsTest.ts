import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import {getPendingReceiptRequests, saveReceiptsToGallery} from '@libs/savePendingReceiptsToGallery';
import redirectToSignIn from '@userActions/SignInRedirect';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/savePendingReceiptsToGallery', () => ({
    getPendingReceiptRequests: jest.fn(() => []),
    saveReceiptsToGallery: jest.fn(() => Promise.resolve({savedCount: 0, failedCount: 0})),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), warn: jest.fn(), alert: jest.fn(), hmmm: jest.fn()},
}));

const mockedGetPending = jest.mocked(getPendingReceiptRequests);
const mockedSave = jest.mocked(saveReceiptsToGallery);
// eslint-disable-next-line @typescript-eslint/unbound-method -- Log is a jest mock, so there is no `this` to bind
const mockedLogInfo = jest.mocked(Log.info);

const SAMPLE_RECEIPTS = [{localPath: 'file:///pending.jpg'}];

describe('clearStorageAndRedirect saves pending receipts before clearing storage', () => {
    let order: string[];
    let clearSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        order = [];
        mockedGetPending.mockReset();
        mockedSave.mockReset();
        mockedLogInfo.mockReset();

        mockedGetPending.mockReturnValue(SAMPLE_RECEIPTS);
        mockedSave.mockImplementation(() =>
            Promise.resolve().then(() => {
                order.push('save');
                return {savedCount: 1, failedCount: 0};
            }),
        );
        clearSpy = jest.spyOn(Onyx, 'clear').mockImplementation(() => {
            order.push('clear');
            return Promise.resolve();
        });
    });

    afterEach(() => {
        clearSpy.mockRestore();
    });

    it('resolves the save before Onyx.clear is invoked', async () => {
        await redirectToSignIn();
        await waitForBatchedUpdates();

        expect(mockedSave).toHaveBeenCalledWith(SAMPLE_RECEIPTS);
        expect(order).toEqual(['save', 'clear']);
    });

    it('logs the saved and failed counts with the [Receipt] prefix', async () => {
        await redirectToSignIn();
        await waitForBatchedUpdates();

        expect(mockedLogInfo).toHaveBeenCalledWith(expect.stringContaining('[Receipt]'), false, {savedCount: 1, failedCount: 0});
    });

    it('still clears storage when the save rejects', async () => {
        mockedSave.mockRejectedValue(new Error('save failed'));

        await redirectToSignIn();
        await waitForBatchedUpdates();

        expect(clearSpy).toHaveBeenCalled();
    });

    it('does not attempt a save when no receipts are pending, but still clears storage', async () => {
        mockedGetPending.mockReturnValue([]);

        await redirectToSignIn();
        await waitForBatchedUpdates();

        expect(mockedSave).not.toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });
});
