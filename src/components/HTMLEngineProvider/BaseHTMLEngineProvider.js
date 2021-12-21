import _ from 'underscore';
import React, {useMemo} from 'react';
import {TouchableOpacity} from 'react-native';
import {
    TRenderEngineProvider,
    RenderHTMLConfigProvider,
    defaultHTMLElementModels,
} from 'react-native-render-html';
import PropTypes from 'prop-types';
import AnchorRenderer from './HTMLRenderers/AnchorRenderer';
import CodeRenderer from './HTMLRenderers/CodeRenderer';
import Config from '../../CONFIG';
import styles from '../../styles/styles';
import fontFamily from '../../styles/fontFamily';
import AttachmentModal from '../AttachmentModal';
import ThumbnailImage from '../ThumbnailImage';
import variables from '../../styles/variables';
import themeColors from '../../styles/themes/default';
import ExpensifyText from '../ExpensifyText';
import withLocalize from '../withLocalize';

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

function EditedRenderer(props) {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);
    return (
        <ExpensifyText
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps}
            fontSize={variables.fontSizeSmall}
            color={themeColors.textSupporting}
        >
            {/* Native devices do not support margin between nested text */}
            <ExpensifyText style={styles.w1}>{' '}</ExpensifyText>
            {props.translate('reportActionCompose.edited')}
        </ExpensifyText>
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
            dangerouslyDisableWhitespaceCollapsing={false}
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
