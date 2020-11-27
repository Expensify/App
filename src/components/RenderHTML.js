/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import {useWindowDimensions} from 'react-native';
import HTML, {
    defaultHTMLElementModels,
    TNodeChildrenRenderer,
    splitBoxModelStyle,
} from 'react-native-render-html';
import Config from '../CONFIG';
import {getAuthToken} from '../libs/API';
import {webViewStyles} from '../styles/StyleSheet';
import fontFamily from '../styles/fontFamily';
import AnchorForCommentsOnly from './AnchorForCommentsOnly';
import ImageThumbnailWithModal from './ImageThumbnailWithModal';
import InlineCodeBlock from './InlineCodeBlock';

const MAX_IMG_DIMENSIONS = 512;

const EXTRA_FONTS = [
    fontFamily.GTA,
    fontFamily.GTA_BOLD,
    fontFamily.GTA_ITALIC,
    fontFamily.MONOSPACE,
    fontFamily.SYSTEM,
];

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
    key,
    style,
    TDefaultRenderer, ...defaultRendererProps
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

function ImgRenderer({key, tnode}) {
    const htmlAttribs = tnode.attributes;

    // Attaches authTokens as a URL parameter to load image attachments
    let previewSource = htmlAttribs['data-expensify-source']
        ? `${htmlAttribs.src}?authToken=${getAuthToken()}`
        : htmlAttribs.src;

    let source = htmlAttribs['data-expensify-source']
        ? `${htmlAttribs['data-expensify-source']}?authToken=${getAuthToken()}`
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
        <ImageThumbnailWithModal
            previewSourceURL={previewSource}
            sourceURL={source}
            key={key}
        />
    );
}

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
    html: PropTypes.string.isRequired,
    debug: PropTypes.bool,
};

const RenderHTML = ({html, debug = false}) => {
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
            html={html}
            debug={debug}
        />
    );
};

RenderHTML.displayName = 'RenderHTML';
RenderHTML.propTypes = propTypes;
RenderHTML.defaultProps = {
    debug: false,
};

export default RenderHTML;
