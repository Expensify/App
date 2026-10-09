import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';

const source = 'https://www.expensify.com/chat-attachments/123/w_62c85849a4867ea83e8ffdecdc3ab1e694a86963.csv';

describe('getAttachmentDetails', () => {
    it('reads the source and file name from a freshly uploaded anchor', () => {
        // Given an anchor exactly as a fresh upload stores it, with its attachment attributes
        const html = `<a href="${source}" data-expensify-source="${source}" data-attachment-id="1">PerDiem-test.csv</a>`;

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then the source attribute and the anchor text are used
        expect(details).toMatchObject({sourceURL: source, originalFileName: 'PerDiem-test.csv'});
    });

    it('falls back to the href when the source attribute was dropped by an edit', () => {
        // Given an edited anchor that lost its source attribute on the server but kept its attachment id
        const html = `<a href="${source}" data-attachment-id="1" target="_blank" rel="noreferrer noopener">edited per diem</a>`;

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then the href stands in for the missing source, and the renamed label is the file name
        expect(details).toMatchObject({sourceURL: source, originalFileName: 'edited per diem'});
    });

    it('falls back to a chat-attachments href even without the attachment id', () => {
        // Given an edited anchor that kept neither attachment attribute, only its chat-attachments href
        const html = `<a href="${source}" target="_blank" rel="noreferrer noopener">edited per diem</a>`;

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then the Expensify-hosted href alone is enough to use as the source
        expect(details.sourceURL).toBe(source);
    });

    it('picks the attachment anchor over an earlier plain link when the source attribute is gone', () => {
        // Given an edited comment with an ordinary link before the file anchor, and no source attribute on either
        const html = `See <a href="https://google.com" target="_blank" rel="noreferrer noopener">google</a><br /><br /><a href="${source}" data-attachment-id="1">file.csv</a>`;

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then the file anchor is picked, so Download does not open the other link
        expect(details).toMatchObject({sourceURL: source, originalFileName: 'file.csv'});
    });

    it('does not treat an external href as the source just because the message has an attachment id', () => {
        // Given an anchor to an external site that happens to carry an attachment id
        const html = '<a href="https://google.com" data-attachment-id="1">google</a>';

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then no source is read, because the auth token is only ever appended to Expensify-hosted URLs
        expect(details.sourceURL).toBe('');
    });

    it("picks this message's own attachment over a link to an earlier upload", () => {
        // Given an edited comment that links to a file uploaded earlier and then holds its own file, neither carrying a source attribute
        const earlierURL = 'https://www.expensify.com/chat-attachments/111/w_old.csv';
        const ownURL = 'https://www.expensify.com/chat-attachments/222/w_new.csv';
        const html = `See <a href="${earlierURL}" target="_blank" rel="noreferrer noopener">old.csv</a><br /><br /><a href="${ownURL}" target="_blank" rel="noreferrer noopener">new.csv</a>`;

        // When the attachment details are read for the action that holds the second file
        const details = getAttachmentDetails(html, '222');

        // Then Download uses this message's own file rather than the first Expensify-hosted link in the text
        expect(details).toMatchObject({sourceURL: ownURL, originalFileName: 'new.csv'});
    });

    it('falls back to the first Expensify-hosted link when no anchor names this action', () => {
        // Given a comment whose attachment URL carries no action ID of its own, such as a receipt
        const receiptURL = 'https://www.expensify.com/receipts/w_abc.jpg';
        const html = `<a href="${receiptURL}" target="_blank" rel="noreferrer noopener">receipt.jpg</a>`;

        // When the attachment details are read
        const details = getAttachmentDetails(html, '222');

        // Then the Expensify-hosted link is still used, so receipts keep working
        expect(details).toMatchObject({sourceURL: receiptURL, originalFileName: 'receipt.jpg'});
    });

    it('leaves a plain link with no source', () => {
        // Given an ordinary link with no attachment attributes
        const html = '<a href="https://google.com" target="_blank" rel="noreferrer noopener">google</a>';

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then no source is read
        expect(details.sourceURL).toBe('');
    });

    it('does not read an href from an image without a source attribute', () => {
        // Given an image tag with no source attribute
        const html = '<img src="https://example.com/x.png" data-name="x.png" />';

        // When the attachment details are read from it
        const details = getAttachmentDetails(html);

        // Then the anchor fallback is not applied to images, so no source is read
        expect(details.sourceURL).toBe('');
    });
});
