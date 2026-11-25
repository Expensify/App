import type {AnyRequest} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import ONYXKEYS from '../../src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/canPersistRequest', () => jest.requireActual<Record<string, unknown>>('../../src/libs/canPersistRequest/index.native.ts'));

// Stands in for the React Native File that the share and scan flows put in a receipt create. Like that File, it keeps
// its name and type on the prototype, so JSON leaves them out unless they are copied onto the file.
class MockReceiptFile extends Blob {
    #fileName: string;

    lastModified = 0;

    webkitRelativePath = '';

    uri = 'file:///Documents/Receipts-Upload/receipt.jpg';

    source = 'file:///Documents/Receipts-Upload/receipt.jpg';

    public constructor(fileBits: BlobPart[] = [], fileName = 'receipt.jpg', options: FilePropertyBag = {type: 'image/jpeg'}) {
        super(fileBits, options);
        this.#fileName = fileName;
    }

    get name() {
        return this.#fileName;
    }
}

function buildReceiptCreate(): AnyRequest {
    return {
        command: 'TrackExpense',
        requestIndex: 1,
        data: {transactionID: '1', receipt: new MockReceiptFile()},
    };
}

const receiptCreate = buildReceiptCreate();

const moveCreatedExpense: AnyRequest = {
    command: 'ChangeTransactionsReport',
    requestIndex: 2,
    data: {transactionList: '1', reportID: '2'},
};

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    PersistedRequests.clear();
});

afterEach(() => {
    PersistedRequests.clear();
    Onyx.clear();
});

describe('PersistedRequests (native)', () => {
    it('keeps a receipt create on disk while it is being sent', async () => {
        // Given a receipt create holding a File, with a move of that expense queued behind it
        const originalFile = global.File;
        global.File = MockReceiptFile;

        try {
            PersistedRequests.save(receiptCreate);
            PersistedRequests.save(moveCreatedExpense);
            await waitForBatchedUpdates();

            // When the queue starts sending the create
            PersistedRequests.processNextRequest();
            await waitForBatchedUpdates();

            // Then the create is on disk as the request being sent, so an app killed now sends it again on the next
            // start, before the move, instead of sending only the move for an expense the server never got
            const ongoingOnDisk = await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS);
            const queueOnDisk = await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS);
            expect(ongoingOnDisk?.command).toBe('TrackExpense');
            expect(queueOnDisk?.map((request) => request.command)).toEqual(['ChangeTransactionsReport']);
        } finally {
            global.File = originalFile;
        }
    });

    it('keeps an updated receipt create on disk', async () => {
        // Given a receipt create that is being sent
        const originalFile = global.File;
        global.File = MockReceiptFile;

        try {
            // When the ongoing request is replaced, as HandleUnusedOptimisticID does when the server swaps an optimistic ID
            PersistedRequests.updateOngoingRequest(receiptCreate);
            await waitForBatchedUpdates();

            // Then the stored copy is the receipt create too, so it still survives an app kill
            const ongoingOnDisk = await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS);
            expect(ongoingOnDisk?.command).toBe('TrackExpense');
        } finally {
            global.File = originalFile;
        }
    });

    it('keeps the receipt name and type when the request is stored as JSON', async () => {
        // Given a receipt create whose File keeps its name and type on the prototype
        const request = buildReceiptCreate();

        // When it is queued and then written to disk, which stores it as JSON
        PersistedRequests.save(request);
        await waitForBatchedUpdates();
        const storedRequest: unknown = JSON.parse(JSON.stringify(PersistedRequests.getAll().at(0)));

        // Then the stored receipt still has the name and type, so the upload rebuilt from it after a restart is a named
        // image instead of an unnamed part the server can't use
        expect(storedRequest).toEqual(
            expect.objectContaining({
                data: expect.objectContaining({
                    receipt: expect.objectContaining({
                        name: 'receipt.jpg',
                        type: 'image/jpeg',
                        source: 'file:///Documents/Receipts-Upload/receipt.jpg',
                    }),
                }),
            }),
        );
    });
});
