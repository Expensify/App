import React, {useMemo} from 'react';
import {
    TRenderEngineProvider,
    RenderHTMLConfigProvider,
    defaultHTMLElementModels,
} from 'react-native-render-html';
import PropTypes from 'prop-types';
import AnchorRenderer from './HTMLRenderers/AnchorRenderer';
import CodeRenderer from './HTMLRenderers/CodeRenderer';
import EditedRenderer from './HTMLRenderers/EditedRenderer';
import ImageRenderer from './HTMLRenderers/ImageRenderer';
import styles from '../../styles/styles';
import fontFamily from '../../styles/fontFamily';

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
    img: ImageRenderer,
    edited: EditedRenderer,
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
