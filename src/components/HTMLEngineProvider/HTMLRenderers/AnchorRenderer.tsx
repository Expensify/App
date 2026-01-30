import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import AnchorForAttachmentsOnly from '@components/AnchorForAttachmentsOnly';
import AnchorForCommentsOnly from '@components/AnchorForCommentsOnly';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getInternalExpensifyPath, getInternalNewExpensifyPath, openLink} from '@libs/actions/Link';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';

type AnchorRendererProps = CustomRendererProps<TText | TPhrasing> & {
    /** Key of the element */
    key?: string;
};

function AnchorRenderer({tnode, style, key}: AnchorRendererProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttribs = tnode.attributes;
    const {environmentURL} = useEnvironment();
    const {hovered, bind} = useHover();
    // An auth token is needed to download Expensify chat attachments
    const isAttachment = !!htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
    const tNodeChild = tnode?.domNode?.children?.at(0);
    const displayName = tNodeChild && 'data' in tNodeChild && typeof tNodeChild.data === 'string' ? tNodeChild.data : '';
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const parentStyle = tnode.parent?.styles?.nativeTextRet ?? {};
    const internalNewExpensifyPath = getInternalNewExpensifyPath(attrHref);
    const internalExpensifyPath = getInternalExpensifyPath(attrHref);
    const isVideo = attrHref && Str.isVideo(attrHref);
    const linkHasImage = tnode.tagName === 'a' && tnode.children.some((child) => child.tagName === 'img');

    const isDeleted = HTMLEngineUtils.isDeletedNode(tnode);
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    const textDecorationLineStyle = isDeleted ? styles.lineThrough : {};

    const onLinkPress = useMemo(() => {
        if (internalNewExpensifyPath || internalExpensifyPath) {
            return () => openLink(attrHref, environmentURL, isAttachment);
        }

        return undefined;
    }, [internalNewExpensifyPath, internalExpensifyPath, attrHref, environmentURL, isAttachment]);

    if (!HTMLEngineUtils.isChildOfComment(tnode) && !isChildOfTaskTitle) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.

        // Define link style based on context
        let linkStyle: StyleProp<TextStyle> = styles.link;

        // Special handling for links in RBR to maintain consistent font size
        if (HTMLEngineUtils.isChildOfRBR(tnode)) {
            linkStyle = [
                styles.link,
                {
                    fontSize: HTMLEngineUtils.getFontSizeOfRBRChild(tnode),
                },
            ];
        }

        if (HTMLEngineUtils.isChildOfLabelText(tnode)) {
            linkStyle = [styles.textLabel, styles.textLineHeightNormal, styles.link];
        }

        // Special handling for links in label font to maintain consistent font size
        if (HTMLEngineUtils.isChildOfMutedTextLabel(tnode)) {
            linkStyle = [styles.mutedNormalTextLabel, styles.link];
        }

        // Special handling for links in extra small font to maintain consistent font size
        if (HTMLEngineUtils.isChildOfMutedTextXS(tnode)) {
            linkStyle = [styles.textExtraSmallSupporting, styles.link];
        }

        // Special handling for links in micro font to maintain consistent font size
        if (HTMLEngineUtils.isChildOfMutedTextMicro(tnode)) {
            linkStyle = [styles.textMicroSupporting, styles.link];
        }

        if (HTMLEngineUtils.isChildOfAlertText(tnode)) {
            linkStyle = [styles.formError, styles.mb0, styles.link];
        }

        if (tnode.classes.includes('no-style-link')) {
            // If the link has a class of a no-style-link, we don't apply any styles
            linkStyle = {...(style as TextStyle)};
            delete linkStyle.color;
            delete linkStyle.textDecorationLine;
            delete linkStyle.textDecorationColor;
        }

        return (
            <TextLink
                style={linkStyle}
                onPress={() => openLink(attrHref, environmentURL, isAttachment)}
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </TextLink>
        );
    }

    if (isAttachment && !isVideo) {
        return (
            <AnchorForAttachmentsOnly
                source={tryResolveUrlFromApiRoot(attrHref)}
                displayName={displayName}
                isDeleted={isDeleted}
            />
        );
    }

    const hoverStyle = hovered ? StyleUtils.getColorStyle(theme.linkHover) : {};
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
            style={[
                style,
                parentStyle,
                styles.textDecorationLineNone,
                textDecorationLineStyle,
                styles.textUnderlinePositionUnder,
                styles.textDecorationSkipInkNone,
                isChildOfTaskTitle && styles.taskTitleMenuItem,
                styles.dInlineFlex,
                hoverStyle,
            ]}
            key={key}
            // Only pass the press handler for internal links. For public links or whitelisted internal links fallback to default link handling
            onPress={onLinkPress}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...bind}
            linkHasImage={linkHasImage}
        >
            <TNodeChildrenRenderer
                tnode={tnode}
                renderChild={(props) => {
                    if (props.childTnode.tagName === 'br') {
                        return <Text key={props.key}>{'\n'}</Text>;
                    }
                    if (props.childTnode.type === 'text' && props.childTnode.tagName !== 'code') {
                        return (
                            <Text
                                key={props.key}
                                style={[
                                    props.childTnode.getNativeStyles(),
                                    parentStyle,
                                    styles.textDecorationLineNone,
                                    textDecorationLineStyle,
                                    styles.textUnderlinePositionUnder,
                                    styles.textDecorationSkipInkNone,
                                    styles.dInlineFlex,
                                    hoverStyle,
                                ]}
                            >
                                {props.childTnode.data}
                            </Text>
                        );
                    }
                    return props.childElement;
                }}
            />
        </AnchorForCommentsOnly>
    );
}

export default AnchorRenderer;
