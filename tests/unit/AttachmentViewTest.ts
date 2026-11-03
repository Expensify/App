import {checkIsFileImage} from '@components/Attachments/AttachmentView';

describe('checkIsFileImage', () => {
    describe('file type', () => {
        it('returns true when the file type is a renderable image MIME type and the file name has no image extension', () => {
            // Given a pasted file with an image MIME type but a name without an image extension
            const source = 'blob:https://new.expensify.com/1234-5678';
            const fileName = 'image';
            const fileType = 'image/png';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, fileName, fileType);

            // Then it is detected as an image
            expect(result).toBe(true);
        });

        it('returns false when the file type is an image MIME type that React Native cannot render', () => {
            // Given a file with an image MIME type outside the renderable list
            const source = 'blob:https://new.expensify.com/1234-5678';
            const fileName = 'image';
            const fileType = 'image/vnd.adobe.photoshop';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, fileName, fileType);

            // Then it is not detected as an image
            expect(result).toBe(false);
        });

        it('returns false when the file type is not an image MIME type', () => {
            // Given a file with a non-image MIME type
            const source = 'blob:https://new.expensify.com/1234-5678';
            const fileName = 'document';
            const fileType = 'text/plain';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, fileName, fileType);

            // Then it is not detected as an image
            expect(result).toBe(false);
        });
    });

    describe('file name', () => {
        it('returns true when the file name has an image extension and no file type is provided', () => {
            // Given a file named with an image extension and no MIME type
            const source = 'blob:https://new.expensify.com/1234-5678';
            const fileName = 'receipt.png';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, fileName);

            // Then it is detected as an image
            expect(result).toBe(true);
        });

        it('returns false when neither the file name nor the source has an image extension', () => {
            // Given a file named with a non-image extension and no MIME type
            const source = 'blob:https://new.expensify.com/1234-5678';
            const fileName = 'receipt.pdf';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, fileName);

            // Then it is not detected as an image
            expect(result).toBe(false);
        });
    });

    describe('source', () => {
        it('returns true when the source URL has an image extension', () => {
            // Given a source URL pointing to an image and no file name or type
            const source = 'https://new.expensify.com/receipt.jpg';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, undefined);

            // Then it is detected as an image
            expect(result).toBe(true);
        });

        it('returns true when the source is a number, which is how static images are represented in React Native', () => {
            // Given a numeric source
            const source = 42;

            // When checking whether the file is an image
            const result = checkIsFileImage(source, undefined);

            // Then it is detected as an image
            expect(result).toBe(true);
        });

        it('returns false when the source is a blob URL with no file name or type', () => {
            // Given a blob source with no file name or type
            const source = 'blob:https://new.expensify.com/1234-5678';

            // When checking whether the file is an image
            const result = checkIsFileImage(source, undefined);

            // Then it is not detected as an image
            expect(result).toBe(false);
        });
    });
});
