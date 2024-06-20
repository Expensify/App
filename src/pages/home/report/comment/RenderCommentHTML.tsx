import React from 'react';
import RenderHTML from '@components/RenderHTML';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';

type RenderCommentHTMLProps = {
    source: OriginalMessageSource;
    html: string;
};

function RenderCommentHTML({html, source}: RenderCommentHTMLProps) {
    const commentHtml = source === 'email' ? `<email-comment>${html}</email-comment>` : `<comment>${html}</comment>`;

    return <RenderHTML html={commentHtml} />;
}

RenderCommentHTML.displayName = 'RenderCommentHTML';

export default RenderCommentHTML;
