import Str from 'expensify-common/lib/str';
import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import AnchorForAttachmentsOnly from '@components/AnchorForAttachmentsOnly';
import AnchorForCommentsOnly from '@components/AnchorForCommentsOnly';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useThemeStyles from '@hooks/useThemeStyles';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

type AnchorRendererProps = CustomRendererProps<TBlock> & {
    /** Key of the element */
    key?: string;
};

function AnchorRenderer({tnode, style, key}: AnchorRendererProps) {
    const styles = useThemeStyles();
    const htmlAttribs = tnode.attributes;
    const {environmentURL} = useEnvironment();
    // An auth token is needed to download Expensify chat attachments
    const isAttachment = Boolean(htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);
    const tNodeChild = tnode?.domNode?.children?.[0];
    const displayName = tNodeChild && 'data' in tNodeChild && typeof tNodeChild.data === 'string' ? tNodeChild.data : '';
    const parentStyle = tnode.parent?.styles?.nativeTextRet ?? {};
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const internalNewExpensifyPath = Link.getInternalNewExpensifyPath(attrHref);
    const internalExpensifyPath = Link.getInternalExpensifyPath(attrHref);
    const isVideo = attrHref && Str.isVideo(attrHref);

    if (!HTMLEngineUtils.isChildOfComment(tnode)) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.
        return (
            <Text
                style={styles.link}
                onPress={() => Link.openLink(attrHref, environmentURL, isAttachment)}
                suppressHighlighting
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        );
    }

    if (isAttachment && !isVideo) {
        return (
            <AnchorForAttachmentsOnly
                source={tryResolveUrlFromApiRoot(attrHref)}
                displayName={displayName}
            />
        );
    }

    return (
        <AnchorForCommentsOnly
            href={attrHref}
            // Unless otherwise specified open all links in
            // a new window. On Desktop this means that we will
            // skip the default Save As... download prompt
            // and defer to whatever browser the user has.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            target={htmlAttribs.target || '_blank'}
            rel={htmlAttribs.rel || 'noopener noreferrer'}
            style={[style, parentStyle, styles.textUnderlinePositionUnder, styles.textDecorationSkipInkNone]}
            key={key}
            // Only pass the press handler for internal links. For public links or whitelisted internal links fallback to default link handling
            onPress={internalNewExpensifyPath || internalExpensifyPath ? () => Link.openLink(attrHref, environmentURL, isAttachment) : undefined}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </AnchorForCommentsOnly>
    );
}

AnchorRenderer.displayName = 'AnchorRenderer';

export default AnchorRenderer;
