import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import * as FileUtils from '../../src/libs/fileDownload/FileUtils';

describe('FileUtils', () => {
    describe('splitExtensionFromFileName', () => {
        it('should return correct file name and extension', () => {
            const file = FileUtils.splitExtensionFromFileName('image.jpg');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return correct file name and extension even with multiple dots on the file name', () => {
            const file = FileUtils.splitExtensionFromFileName('image.pdf.jpg');
            expect(file.fileName).toEqual('image.pdf');
            expect(file.fileExtension).toEqual('jpg');
        });

        it('should return empty extension if the file name does not have it', () => {
            const file = FileUtils.splitExtensionFromFileName('image');
            expect(file.fileName).toEqual('image');
            expect(file.fileExtension).toEqual('');
        });
    });

    describe('appendTimeToFileName', () => {
        it('should append current time to the end of the file name', () => {
            const actualFileName = FileUtils.appendTimeToFileName('image.jpg');
            const expectedFileName = `image-${DateUtils.getDBTime()}.jpg`;
            expect(actualFileName).toEqual(expectedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });

        it('should append current time to the end of the file name without extension', () => {
            const actualFileName = FileUtils.appendTimeToFileName('image');
            const expectedFileName = `image-${DateUtils.getDBTime()}`;
            expect(actualFileName).toEqual(expectedFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_'));
        });
    });
});
