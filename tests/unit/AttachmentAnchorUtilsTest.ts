import {wrapAttachmentAnchorsInBlocks} from '@libs/AttachmentAnchorUtils';

describe('wrapAttachmentAnchorsInBlocks', () => {
    const url = 'https://www.expensify.com/chat-attachments/123/w_abc.csv';

    it('puts a file anchor in its own block wherever it sits in the comment', () => {
        // Given an edited comment with text before and after the file anchor, followed by the edited label
        const html = `Help<br /><br /><a href="${url}" data-attachment-id="1">file.csv</a><br />Text<edited ></edited>`;

        // When the anchors are wrapped
        // Then the file anchor sits in a block, the break after it is absorbed, and the text on both sides stays outside it
        expect(wrapAttachmentAnchorsInBlocks(html)).toBe(`Help<br /><br /><attachment-block><a href="${url}" data-attachment-id="1">file.csv</a></attachment-block>Text<edited ></edited>`);
    });

    it('keeps the deleted styling around the block', () => {
        // Given a comment styled as pending deletion while offline
        const html = `<del><a href="${url}" data-attachment-id="1">file.csv</a>J</del>`;

        // When the anchors are wrapped
        // Then the block sits inside the deleted styling
        expect(wrapAttachmentAnchorsInBlocks(html)).toBe(`<del><attachment-block><a href="${url}" data-attachment-id="1">file.csv</a></attachment-block>J</del>`);
    });

    it('recognizes a file anchor by its URL once the attributes are gone', () => {
        // Given an edited anchor the server returned without any attachment attribute
        const html = `<a href="${url}" target="_blank" rel="noreferrer noopener">file.csv</a><br />J`;

        // When the anchors are wrapped
        // Then the chat attachment URL is enough to wrap it
        expect(wrapAttachmentAnchorsInBlocks(html)).toBe(`<attachment-block><a href="${url}" target="_blank" rel="noreferrer noopener">file.csv</a></attachment-block>J`);
    });

    it('leaves ordinary links inline', () => {
        // Given a comment with a plain link, including one that only mentions the attribute name in its query string
        const html = 'See <a href="https://google.com/?data-expensify-source=1" target="_blank">google</a> now';

        // When the anchors are wrapped
        // Then nothing changes
        expect(wrapAttachmentAnchorsInBlocks(html)).toBe(html);
    });
});
