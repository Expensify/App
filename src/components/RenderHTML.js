/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {useWindowDimensions, TouchableOpacity} from 'react-native';
import HTML, {
    defaultHTMLElementModels,
    TNodeChildrenRenderer,
    splitBoxModelStyle,
} from 'react-native-render-html';
import Config from '../CONFIG';
import styles, {webViewStyles} from '../styles/styles';
import fontFamily from '../styles/fontFamily';
import AnchorForCommentsOnly from './AnchorForCommentsOnly';
import InlineCodeBlock from './InlineCodeBlock';
import AttachmentModal from './AttachmentModal';
import ThumbnailImage from './ThumbnailImage';

const MAX_IMG_DIMENSIONS = 512;

const EXTRA_FONTS = [
    fontFamily.GTA,
    fontFamily.GTA_BOLD,
    fontFamily.GTA_ITALIC,
    fontFamily.MONOSPACE,
    fontFamily.SYSTEM,
];

/**
 * Compute images maximum width from the available screen width. This function
 * is used by the HTML component in the default renderer for img tags to scale
 * down images that would otherwise overflow horizontally.
 *
 * @param {number} contentWidth - The content width provided to the HTML
 * component.
 * @returns {number} The minimum between contentWidth and MAX_IMG_DIMENSIONS
 */
function computeImagesMaxWidth(contentWidth) {
    return Math.min(MAX_IMG_DIMENSIONS, contentWidth);
}

function AnchorRenderer({tnode, key, style}) {
    const htmlAttribs = tnode.attributes;
    return (
        <AnchorForCommentsOnly
            href={htmlAttribs.href}

            // Unless otherwise specified open all links in
            // a new window. On Desktop this means that we will
            // skip the default Save As... download prompt
            // and defer to whatever browser the user has.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            target={htmlAttribs.target || '_blank'}
            rel={htmlAttribs.rel || 'noopener noreferrer'}
            style={style}
            key={key}
        >
            <TNodeChildrenRenderer tnode={tnode} />
        </AnchorForCommentsOnly>
    );
}

function CodeRenderer({
    key, style, TDefaultRenderer, ...defaultRendererProps
}) {
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle(style);
    return (
        <InlineCodeBlock
            TDefaultRenderer={TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={textStyle}
            defaultRendererProps={defaultRendererProps}
            key={key}
        />
    );
}

function ImgRenderer({tnode}) {
    const htmlAttribs = tnode.attributes;

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
            title="Attachment"
            sourceURL={source}
            isAuthTokenRequired={isAttachment}
        >
            {({show}) => (
                <TouchableOpacity
                    style={styles.noOutline}
                    onPress={() => show()}
                >
                    <ThumbnailImage
                        previewSourceURL={previewSource}
                        style={webViewStyles.tagStyles.img}
                        isAuthTokenRequired={isAttachment}
                    />
                </TouchableOpacity>
            )}
        </AttachmentModal>
    );
}

// Define default element models for these renderers.
AnchorRenderer.model = defaultHTMLElementModels.a;
CodeRenderer.model = defaultHTMLElementModels.code;
ImgRenderer.model = defaultHTMLElementModels.img;

// Define the custom render methods
const renderers = {
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImgRenderer,
};

const propTypes = {
    // Raw HTML string
    html: PropTypes.string.isRequired,

    // If true, prints the parsing result from htmlparser2 and render-html after the initial render
    debug: PropTypes.bool,

    // Default props for Text elements
    // eslint-disable-next-line react/forbid-prop-types
    defaultTextProps: PropTypes.object,
};

const defaultProps = {
    debug: false,
    defaultTextProps: {},
};

const RenderHTML = ({html, debug, defaultTextProps}) => {
    const {width} = useWindowDimensions();
    const containerWidth = width * 0.8;
    return (
        <HTML
            textSelectable
            renderers={renderers}
            baseStyle={webViewStyles.baseFontStyle}
            tagsStyles={webViewStyles.tagStyles}
            enableCSSInlineProcessing={false}
            contentWidth={containerWidth}
            computeImagesMaxWidth={computeImagesMaxWidth}
            systemFonts={EXTRA_FONTS}
            imagesInitialDimensions={{
                width: MAX_IMG_DIMENSIONS,
                height: MAX_IMG_DIMENSIONS,
            }}
            defaultTextProps={defaultTextProps}
            html={html}
            debug={debug}
        />
    );
};

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = defaultProps;

export default RenderHTML;
