import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {getReceiptSourceKind} from '@libs/ReceiptStorage/durableFolder';

jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockGetReceiptsUploadFolderPath = jest.mocked(getReceiptsUploadFolderPath);

describe('getReceiptSourceKind', () => {
    beforeEach(() => {
        mockGetReceiptsUploadFolderPath.mockReturnValue('/var/mobile/Containers/Data/Application/AAAA-1111/Documents/Receipts-Upload');
    });

    it('matches the receipts folder under a different container prefix', () => {
        // Given a receipt stored before an iOS upgrade moved the app container

        // When it is classified
        const kind = getReceiptSourceKind('file:///private/var/mobile/Containers/Data/Application/BBBB-2222/Documents/Receipts-Upload/photo_1.jpg');

        // Then it still counts as the receipts folder, because only the folder name survives an upgrade
        expect(kind).toBe('receiptsFolder');
    });

    it('recognizes the image cache on iOS and Android', () => {
        // Given the folders expo-image-manipulator saves into on each platform

        // When they are classified
        const iosKind = getReceiptSourceKind('file:///var/mobile/Containers/Data/Application/AAAA-1111/Library/Caches/ImageManipulator/abc.jpg');
        const androidKind = getReceiptSourceKind('file:///data/user/0/com.expensify.chat/cache/ImageManipulator/abc.jpg');

        // Then both count as the image cache
        expect(iosKind).toBe('imageManipulatorCache');
        expect(androidKind).toBe('imageManipulatorCache');
    });

    it('reports any other local file as otherTemp', () => {
        // Given a file left in the picker's temporary folder

        // When it is classified
        const kind = getReceiptSourceKind('file:///var/mobile/Containers/Data/Application/AAAA-1111/tmp/IMG_0001.jpg');

        // Then it is flagged as not durable
        expect(kind).toBe('otherTemp');
    });

    it('returns nothing on a platform without a receipts folder', () => {
        // Given web, which keeps receipts as object URLs
        mockGetReceiptsUploadFolderPath.mockReturnValue('');

        // When a web source is classified
        const kind = getReceiptSourceKind('blob:https://new.expensify.com/1234');

        // Then there is no kind to report
        expect(kind).toBeUndefined();
    });
});
