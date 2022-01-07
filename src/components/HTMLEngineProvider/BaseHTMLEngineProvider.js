/* eslint-disable react/prop-types */
import _ from 'underscore';
import React, {useMemo} from 'react';
import {TouchableOpacity, Linking} from 'react-native';
import {
    TRenderEngineProvider,
    RenderHTMLConfigProvider,
    defaultHTMLElementModels,
    TNodeChildrenRenderer,
    splitBoxModelStyle,
} from 'react-native-render-html';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Config from '../../CONFIG';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import fontFamily from '../../styles/fontFamily';
import AnchorForCommentsOnly from '../AnchorForCommentsOnly';
import InlineCodeBlock from '../InlineCodeBlock';
import AttachmentModal from '../AttachmentModal';
import ThumbnailImage from '../ThumbnailImage';
import variables from '../../styles/variables';
import themeColors from '../../styles/themes/default';
import Text from '../Text';
import withLocalize from '../withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';

const propTypes = {
    /** Whether text elements should be selectable */
    textSelectable: PropTypes.bool,
    children: PropTypes.node,
};

const defaultProps = {
    textSelectable: false,
    children: null,
};

const MAX_IMG_DIMENSIONS = 512;

const EXTRA_FONTS = [
    fontFamily.GTA,
    fontFamily.GTA_BOLD,
    fontFamily.GTA_ITALIC,
    fontFamily.MONOSPACE,
    fontFamily.MONOSPACE_ITALIC,
    fontFamily.MONOSPACE_BOLD,
    fontFamily.MONOSPACE_BOLD_ITALIC,
    fontFamily.SYSTEM,
];

/**
 * Compute embedded maximum width from the available screen width. This function
 * is used by the HTML component in the default renderer for img tags to scale
 * down images that would otherwise overflow horizontally.
 *
 * @param {string} tagName - The name of the tag for which max width should be constrained.
 * @param {number} contentWidth - The content width provided to the HTML
 * component.
 * @returns {number} The minimum between contentWidth and MAX_IMG_DIMENSIONS
 */
function computeEmbeddedMaxWidth(tagName, contentWidth) {
    if (tagName === 'img') {
        return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
    }
    return contentWidth;
}

/**
 * Check if there is an ancestor node with name 'comment'.
 * Finding node with name 'comment' flags that we are rendering a comment.
 * @param {TNode} tnode
 * @returns {Boolean}
 */
function isInsideComment(tnode) {
    let currentNode = tnode;
    while (currentNode.parent) {
        if (currentNode.domNode.name === 'comment') {
            return true;
        }
        currentNode = currentNode.parent;
    }
    return false;
}

function AnchorRenderer(props) {
    const htmlAttribs = props.tnode.attributes;

    // An auth token is needed to download Expensify chat attachments
    const isAttachment = Boolean(htmlAttribs['data-expensify-source']);
    const fileName = lodashGet(props.tnode, 'domNode.children[0].data', '');
    const parentStyle = lodashGet(props.tnode, 'parent.styles.nativeTextRet', {});
    const attrHref = htmlAttribs.href || '';
    const internalExpensifyPath = (attrHref.startsWith(CONST.NEW_EXPENSIFY_URL) && attrHref.replace(CONST.NEW_EXPENSIFY_URL, ''))
        || (attrHref.startsWith(CONST.STAGING_NEW_EXPENSIFY_URL) && attrHref.replace(CONST.STAGING_NEW_EXPENSIFY_URL, ''));

    // If we are handling a New Expensify link then we will assume this should be opened by the app internally. This ensures that the links are opened internally via react-navigation
    // instead of in a new tab or with a page refresh (which is the default behavior of an anchor tag)
    if (internalExpensifyPath) {
        return (
            <Text
                style={styles.link}
                onPress={() => Navigation.navigate(internalExpensifyPath)}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        );
    }

    if (!isInsideComment(props.tnode)) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.
        return (
            <Text
                style={styles.link}
                onPress={() => {
                    Linking.openURL(attrHref);
                }}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        );
    }

    return (
        <AnchorForCommentsOnly
            href={attrHref}
            isAuthTokenRequired={isAttachment}

            // Unless otherwise specified open all links in
            // a new window. On Desktop this means that we will
            // skip the default Save As... download prompt
            // and defer to whatever browser the user has.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            target={htmlAttribs.target || '_blank'}
            rel={htmlAttribs.rel || 'noopener noreferrer'}
            style={{...props.style, ...parentStyle}}
            key={props.key}
            fileName={fileName}
        >
            <TNodeChildrenRenderer tnode={props.tnode} />
        </AnchorForCommentsOnly>
    );
}

function CodeRenderer(props) {
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle(props.style);

    // Get the correct fontFamily variant based in the fontStyle and fontWeight
    const font = StyleUtils.getFontFamilyMonospace({
        fontStyle: textStyle.fontStyle,
        fontWeight: textStyle.fontWeight,
    });

    const textStyleOverride = {
        fontFamily: font,

        // We need to override this properties bellow that was defined in `textStyle`
        // Because by default the `react-native-render-html` add a style in the elements,
        // for example the <strong> tag has a fontWeight: "bold" and in the android it break the font
        fontWeight: undefined,
        fontStyle: undefined,
    };

    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);

    return (
        <InlineCodeBlock
            defaultRendererProps={defaultRendererProps}
            TDefaultRenderer={props.TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={{...textStyle, ...textStyleOverride}}
            key={props.key}
        />
    );
}

function EditedRenderer(props) {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);
    return (
        <Text
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
            fontSize={variables.fontSizeSmall}
            color={themeColors.textSupporting}
        >
            {/* Native devices do not support margin between nested text */}
            <Text style={styles.w1}>{' '}</Text>
            {props.translate('reportActionCompose.edited')}
        </Text>
    );
}

function ImgRenderer(props) {
    const htmlAttribs = props.tnode.attributes;

    // There are two kinds of images that need to be displayed:
    //
    //     - Chat Attachment images
    //
    //           Images uploaded by the user via the app or email.
    //           These have a full-sized image `htmlAttribs['data-expensify-source']`
    //           and a thumbnail `htmlAttribs.src`. Both of these URLs need to have
    //           an authToken added to them in order to control who
    //           can see the images.
    //
    //     - Non-Attachment Images
    //
    //           These could be hosted from anywhere (Expensify or another source)
    //           and are not protected by any kind of access control e.g. certain
    //           Concierge responder attachments are uploaded to S3 without any access
    //           control and thus require no authToken to verify access.
    //
    const isAttachment = Boolean(htmlAttribs['data-expensify-source']);
    const originalFileName = htmlAttribs['data-name'];
    let previewSource = htmlAttribs.src;
    let source = isAttachment
        ? htmlAttribs['data-expensify-source']
        : htmlAttribs.src;

    // Update the image URL so the images can be accessed depending on the config environment
    previewSource = previewSource.replace(
        Config.EXPENSIFY.URL_EXPENSIFY_COM,
        Config.EXPENSIFY.URL_API_ROOT,
    );
    source = source.replace(
        Config.EXPENSIFY.URL_EXPENSIFY_COM,
        Config.EXPENSIFY.URL_API_ROOT,
    );

    return (
        <AttachmentModal
            sourceURL={source}
            isAuthTokenRequired={isAttachment}
            originalFileName={originalFileName}
        >
            {({show}) => (
                <TouchableOpacity
                    style={styles.noOutline}
                    onPress={() => show()}
                >
                    <ThumbnailImage
                        previewSourceURL={previewSource}
                        style={styles.webViewStyles.tagStyles.img}
                        isAuthTokenRequired={isAttachment}
                    />
                </TouchableOpacity>
            )}
        </AttachmentModal>
    );
}

// Declare nonstandard tags and their content model here
const customHTMLElementModels = {
    edited: defaultHTMLElementModels.span.extend({
        tagName: 'edited',
    }),
    'muted-text': defaultHTMLElementModels.div.extend({
        tagName: 'muted-text',
        mixedUAStyles: styles.mutedTextLabel,
    }),
    comment: defaultHTMLElementModels.div.extend({
        tagName: 'comment',
    }),
};

// Define the custom renderer components
const renderers = {
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImgRenderer,
    edited: withLocalize(EditedRenderer),
};

const renderersProps = {
    img: {
        initialDimensions: {
            width: MAX_IMG_DIMENSIONS,
            height: MAX_IMG_DIMENSIONS,
        },
    },
};

const defaultViewProps = {style: {alignItems: 'flex-start'}};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentialy stable between renders to avoid
// costly invalidations and commits.
const BaseHTMLEngineProvider = (props) => {
    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps = useMemo(() => ({selectable: props.textSelectable}), [props.textSelectable]);

    return (
        <TRenderEngineProvider
            customHTMLElementModels={customHTMLElementModels}
            baseStyle={styles.webViewStyles.baseFontStyle}
            tagsStyles={styles.webViewStyles.tagStyles}
            enableCSSInlineProcessing={false}
            dangerouslyDisableWhitespaceCollapsing
            systemFonts={EXTRA_FONTS}
        >
            <RenderHTMLConfigProvider
                defaultTextProps={defaultTextProps}
                defaultViewProps={defaultViewProps}
                renderers={renderers}
                renderersProps={renderersProps}
                computeEmbeddedMaxWidth={computeEmbeddedMaxWidth}
            >
                {props.children}
            </RenderHTMLConfigProvider>
        </TRenderEngineProvider>
    );
};

BaseHTMLEngineProvider.displayName = 'BaseHTMLEngineProvider';
BaseHTMLEngineProvider.propTypes = propTypes;
BaseHTMLEngineProvider.defaultProps = defaultProps;

export default BaseHTMLEngineProvider;
