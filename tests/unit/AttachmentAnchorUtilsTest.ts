import {wrapAttachmentAnchorsInBlocks} from '@libs/AttachmentAnchorUtils';

describe('wrapAttachmentAnchorsInBlocks', () => {
    const reportActionID = '123';
    const url = `https://www.expensify.com/chat-attachments/${reportActionID}/w_abc.csv`;

    it('puts a file anchor in its own block wherever it sits in the comment', () => {
        // Given an edited comment with text before and after the file anchor, followed by the edited label
        const html = `Help<br /><br /><a href="${url}" data-attachment-id="1">file.csv</a><br />Text<edited ></edited>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then the file anchor sits in a block, the break after it is absorbed, and the text on both sides stays outside it
        expect(wrapped).toBe(`Help<br /><br /><attachment-block><a href="${url}" data-attachment-id="1">file.csv</a></attachment-block>Text<edited ></edited>`);
    });

    it('keeps the deleted styling around the block', () => {
        // Given a comment styled as pending deletion while offline
        const html = `<del><a href="${url}" data-attachment-id="1">file.csv</a>J</del>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then the block sits inside the deleted styling
        expect(wrapped).toBe(`<del><attachment-block><a href="${url}" data-attachment-id="1">file.csv</a></attachment-block>J</del>`);
    });

    it('recognizes a file anchor by its URL once the attributes are gone, and restores the attachment ID', () => {
        // Given an edited anchor the server returned without any attachment attribute, whose URL names this action
        const html = `<a href="${url}" target="_blank" rel="noreferrer noopener">file.csv</a><br />J`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then it is wrapped and stamped, so the renderer draws the card without re-deriving it from the URL
        expect(wrapped).toBe(`<attachment-block><a href="${url}" target="_blank" rel="noreferrer noopener" data-attachment-id="${reportActionID}">file.csv</a></attachment-block>J`);
    });

    it("leaves a link to another message's attachment alone", () => {
        // Given a comment holding nothing but a link the author pasted to a file uploaded in an earlier message
        const html = `<a href="https://www.expensify.com/chat-attachments/999/w_abc.jpg" target="_blank" rel="noreferrer noopener">https://www.expensify.com/chat-attachments/999/w_abc.jpg</a>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then the URL names a different action, so it stays an ordinary link instead of rendering as this message's file
        expect(wrapped).toBe(html);
    });

    it("leaves an image the author linked to this message's own file alone", () => {
        // Given the message's own attachment rewritten by an edit as a linked image, so the URL does name this action
        const imageURL = `https://www.expensify.com/chat-attachments/${reportActionID}/w_abc.jpg`;
        const html = `<a href="${imageURL}"><img src="${imageURL}" alt="photo" /></a>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then it stays a linked image, because an anchor holding a picture has no label to name a file card with
        expect(wrapped).toBe(html);
    });

    it('leaves an attachment URL wrapped around an image alone', () => {
        // Given a linked image the author wrote by hand from an attachment URL, which has no text to name a card with
        const html = `<a href="https://www.expensify.com/chat-attachments/999/w_abc.jpg"><img src="https://www.expensify.com/chat-attachments/999/w_abc.jpg" alt="photo" /></a>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then it renders as the link it was written as
        expect(wrapped).toBe(html);
    });

    it('does not read a truncated attachment URL as a file', () => {
        // Given the href left behind when an edit cuts the tail off the link
        const html = `<a href="${url.slice(0, -4)}" target="_blank">file</a>`;

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then the incomplete URL does not make a card
        expect(wrapped).toBe(html);
    });

    it('leaves a link to another host inline even when it carries an attachment ID', () => {
        // Given a link off our attachment host that kept an attachment ID, which the server allows while it strips the source
        const html = 'See <a href="https://example.com/chat-attachments/1/invoice.csv" data-attachment-id="1">invoice.csv</a>';

        // When the anchors are wrapped
        // Then it stays an inline link, since a file card would download it with the viewer's auth token
        expect(wrapAttachmentAnchorsInBlocks(html, reportActionID)).toBe(html);
    });

    it('still blocks a file still uploading, whose source is a local URL', () => {
        // Given an optimistic file anchor that only has its local source so far
        const local = 'blob:https://dev.new.expensify.com:8082/uuid-1';
        const html = `<a href="${local}" data-expensify-source="${local}">file.csv</a>`;

        // When the anchors are wrapped
        // Then it gets its block, because the source attribute alone still marks it as a file
        expect(wrapAttachmentAnchorsInBlocks(html, reportActionID)).toBe(`<attachment-block>${html}</attachment-block>`);
    });

    it('leaves ordinary links inline', () => {
        // Given a comment with a plain link, including one that only mentions the attribute name in its query string
        const html = 'See <a href="https://google.com/?data-expensify-source=1" target="_blank">google</a> now';

        // When the anchors are wrapped
        const wrapped = wrapAttachmentAnchorsInBlocks(html, reportActionID);

        // Then nothing changes
        expect(wrapped).toBe(html);
    });
});
