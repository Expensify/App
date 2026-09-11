import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';

const source = 'https://www.expensify.com/chat-attachments/123/w_62c85849a4867ea83e8ffdecdc3ab1e694a86963.csv';

describe('getAttachmentDetails', () => {
    it('reads the source and file name from a freshly uploaded anchor', () => {
        const html = `<a href="${source}" data-expensify-source="${source}" data-attachment-id="1">PerDiem-test.csv</a>`;
        expect(getAttachmentDetails(html)).toMatchObject({sourceURL: source, originalFileName: 'PerDiem-test.csv'});
    });

    it('falls back to the href when the source attribute was dropped by an edit', () => {
        const html = `<a href="${source}" data-attachment-id="1" target="_blank" rel="noreferrer noopener">edited per diem</a>`;
        expect(getAttachmentDetails(html)).toMatchObject({sourceURL: source, originalFileName: 'edited per diem'});
    });

    it('falls back to a chat-attachments href even without the attachment id', () => {
        const html = `<a href="${source}" target="_blank" rel="noreferrer noopener">edited per diem</a>`;
        expect(getAttachmentDetails(html).sourceURL).toBe(source);
    });

    it('picks the attachment anchor over an earlier plain link when the source attribute is gone', () => {
        const html = `See <a href="https://google.com" target="_blank" rel="noreferrer noopener">google</a><br /><br /><a href="${source}" data-attachment-id="1">file.csv</a>`;
        expect(getAttachmentDetails(html)).toMatchObject({sourceURL: source, originalFileName: 'file.csv'});
    });

    it('does not treat an external href as the source just because the message has an attachment id', () => {
        const html = '<a href="https://google.com" data-attachment-id="1">google</a>';
        expect(getAttachmentDetails(html).sourceURL).toBe('');
    });

    it('leaves a plain link with no source', () => {
        const html = '<a href="https://google.com" target="_blank" rel="noreferrer noopener">google</a>';
        expect(getAttachmentDetails(html).sourceURL).toBe('');
    });

    it('does not read an href from an image without a source attribute', () => {
        const html = '<img src="https://example.com/x.png" data-name="x.png" />';
        expect(getAttachmentDetails(html).sourceURL).toBe('');
    });
});
