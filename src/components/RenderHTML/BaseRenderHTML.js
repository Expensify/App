/* eslint-disable react/prop-types */
import _ from 'underscore';
import React from 'react';
import {useWindowDimensions, TouchableOpacity} from 'react-native';
import HTML, {
    defaultHTMLElementModels,
    TNodeChildrenRenderer,
    splitBoxModelStyle,
} from 'react-native-render-html';
import PropTypes from 'prop-types';
import Config from '../../CONFIG';
import styles, {webViewStyles, getFontFamilyMonospace} from '../../styles/styles';
import fontFamily from '../../styles/fontFamily';
import AnchorForCommentsOnly from '../AnchorForCommentsOnly';
import InlineCodeBlock from '../InlineCodeBlock';
import AttachmentModal from '../AttachmentModal';
import ThumbnailImage from '../ThumbnailImage';
import variables from '../../styles/variables';
import themeColors from '../../styles/themes/default';
import Text from '../Text';
import {
    propTypes as renderHTMLPropTypes,
    defaultProps as renderHTMLDefaultProps,
} from './renderHTMLPropTypes';

const propTypes = {
    /** Whether text elements should be selectable */
    textSelectable: PropTypes.bool,
    ...renderHTMLPropTypes,
};

const defaultProps = {
    textSelectable: false,
    ...renderHTMLDefaultProps,
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

    // An auth token is needed to download Expensify chat attachments
    const isAttachment = Boolean(htmlAttribs['data-expensify-source']);
    return (
        <AnchorForCommentsOnly
            href={htmlAttribs.href}
            isAuthTokenRequired={isAttachment}

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

    // Get the correct fontFamily variant based in the fontStyle and fontWeight
    const font = getFontFamilyMonospace({
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

    return (
        <InlineCodeBlock
            TDefaultRenderer={TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={{...textStyle, ...textStyleOverride}}
            defaultRendererProps={defaultRendererProps}
            key={key}
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
            (edited)
        </Text>
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
EditedRenderer.model = defaultHTMLElementModels.span;

// Define the custom render methods
const renderers = {
    a: AnchorRenderer,
    code: CodeRenderer,
    img: ImgRenderer,
    edited: EditedRenderer,
};

const BaseRenderHTML = ({html, debug, textSelectable}) => {
    const {width} = useWindowDimensions();
    const containerWidth = width * 0.8;
    return (
        <HTML
            textSelectable={textSelectable}
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

BaseRenderHTML.displayName = 'BaseRenderHTML';
BaseRenderHTML.propTypes = propTypes;
BaseRenderHTML.defaultProps = defaultProps;

export default BaseRenderHTML;
