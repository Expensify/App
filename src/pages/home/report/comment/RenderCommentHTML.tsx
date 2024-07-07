import React from 'react';
import RenderHTML from '@components/RenderHTML';
import type { OriginalMessageSource } from '@src/types/onyx/OriginalMessage';
import sanitizeHTML from '@src/utils/sanitizeHTML';
import he from "he";

type RenderCommentHTMLProps = {
    source: OriginalMessageSource;
    html: string;
};

function RenderCommentHTML({html, source}: RenderCommentHTMLProps) {
    const sanitizedHtml = sanitizeHTML(html);
    const decodedHtml = he.decode(sanitizedHtml);

    const commentHtml = source === 'email' ? `<email-comment>${decodedHtml}</email-comment>` : `<comment>${decodedHtml}</comment>`;

    return <RenderHTML html={commentHtml} />;
}

RenderCommentHTML.displayName = 'RenderCommentHTML';

export default RenderCommentHTML;
