import _ from 'underscore';
import React, {useMemo} from 'react';
import {TRenderEngineProvider, RenderHTMLConfigProvider, defaultHTMLElementModels} from 'react-native-render-html';
import PropTypes from 'prop-types';
import htmlRenderers from './HTMLRenderers';
import * as HTMLEngineUtils from './htmlEngineUtils';
import styles from '../../styles/styles';
import convertToLTR from '../../libs/convertToLTR';
import singleFontFamily from '../../styles/fontFamily/singleFontFamily';

const propTypes = {
    /** Whether text elements should be selectable */
    textSelectable: PropTypes.bool,

    /** Handle line breaks according to the HTML standard (default on web)  */
    enableExperimentalBRCollapsing: PropTypes.bool,

    children: PropTypes.node,
};

const defaultProps = {
    textSelectable: false,
    children: null,
    enableExperimentalBRCollapsing: false,
};

// Declare nonstandard tags and their content model here
const customHTMLElementModels = {
    edited: defaultHTMLElementModels.span.extend({
        tagName: 'edited',
    }),
    'alert-text': defaultHTMLElementModels.div.extend({
        tagName: 'alert-text',
        mixedUAStyles: {...styles.formError, ...styles.mb0},
    }),
    'muted-text': defaultHTMLElementModels.div.extend({
        tagName: 'muted-text',
        mixedUAStyles: {...styles.colorMuted, ...styles.mb0},
    }),
    comment: defaultHTMLElementModels.div.extend({
        tagName: 'comment',
        mixedUAStyles: {whiteSpace: 'pre'},
    }),
    'email-comment': defaultHTMLElementModels.div.extend({
        tagName: 'email-comment',
        mixedUAStyles: {whiteSpace: 'normal'},
    }),
    strong: defaultHTMLElementModels.span.extend({
        tagName: 'strong',
        mixedUAStyles: {whiteSpace: 'pre'},
    }),
    'mention-user': defaultHTMLElementModels.span.extend({tagName: 'mention-user'}),
    'mention-here': defaultHTMLElementModels.span.extend({tagName: 'mention-here'}),
};

const defaultViewProps = {style: [styles.alignItemsStart, styles.userSelectText]};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentialy stable between renders to avoid
// costly invalidations and commits.
function BaseHTMLEngineProvider(props) {
    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps = useMemo(() => ({selectable: props.textSelectable, allowFontScaling: false, textBreakStrategy: 'simple'}), [props.textSelectable]);

    return (
        <TRenderEngineProvider
            customHTMLElementModels={customHTMLElementModels}
            baseStyle={styles.webViewStyles.baseFontStyle}
            tagsStyles={styles.webViewStyles.tagStyles}
            enableCSSInlineProcessing={false}
            systemFonts={_.values(singleFontFamily)}
            domVisitors={{
                // eslint-disable-next-line no-param-reassign
                onText: (text) => (text.data = convertToLTR(text.data)),
            }}
        >
            <RenderHTMLConfigProvider
                defaultTextProps={defaultTextProps}
                defaultViewProps={defaultViewProps}
                renderers={htmlRenderers}
                computeEmbeddedMaxWidth={HTMLEngineUtils.computeEmbeddedMaxWidth}
                enableExperimentalBRCollapsing={props.enableExperimentalBRCollapsing}
            >
                {props.children}
            </RenderHTMLConfigProvider>
        </TRenderEngineProvider>
    );
}

BaseHTMLEngineProvider.displayName = 'BaseHTMLEngineProvider';
BaseHTMLEngineProvider.propTypes = propTypes;
BaseHTMLEngineProvider.defaultProps = defaultProps;

export default BaseHTMLEngineProvider;
