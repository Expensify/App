import * as FileDownloadAndroid from '@src/libs/fileDownload/index.android';

describe('FileDownloadAndroid', () => {
    describe('truncateFileNameToSafeLength', () => {
        it('should truncate the file names longer than 70 characters', () => {
            const fileName = '----------2025-09-11_09_36_21.446-2025-09-20_04_12_29.481-2025-09-20_06_38_28.278-2025-10-01_03_28_05.899-2025-10-03_23_59_50.039-2025-10-06_22_28_53.119-2025-10-06_23_40_17.151.docx';
            const truncatedFileName = FileDownloadAndroid.truncateFileNameToSafeLength(fileName);
            expect(truncatedFileName).toEqual('----------2025-09-11_09_36_21.446-2025-09-20_04_12_29.481-2025-09-20_0.docx');
        });

        it('should not truncate the file names shorter than 70 characters', () => {
            const fileName = 'image.jpg';
            const truncatedFileName = FileDownloadAndroid.truncateFileNameToSafeLength(fileName);
            expect(truncatedFileName).toEqual('image.jpg');
        });

        it('should truncate files with file names exactly 70 characters', () => {
            const fileName = '----------2025-09-11_09_36_21.446-2025-09-20_04_12_29.481-2025-09-20_0.docx';
            const truncatedFileName = FileDownloadAndroid.truncateFileNameToSafeLength(fileName);
            expect(truncatedFileName).toEqual(fileName);
        });
    });
});
