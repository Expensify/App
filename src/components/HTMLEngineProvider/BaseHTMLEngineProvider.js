import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {defaultHTMLElementModels, RenderHTMLConfigProvider, TRenderEngineProvider} from 'react-native-render-html';
import _ from 'underscore';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import singleFontFamily from '@styles/utils/fontFamily/singleFontFamily';
import * as HTMLEngineUtils from './htmlEngineUtils';
import htmlRenderers from './HTMLRenderers';

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

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentialy stable between renders to avoid
// costly invalidations and commits.
function BaseHTMLEngineProvider(props) {
    const styles = useThemeStyles();

    // Declare nonstandard tags and their content model here
    const customHTMLElementModels = useMemo(
        () => ({
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
            'next-steps': defaultHTMLElementModels.span.extend({
                tagName: 'next-steps',
                mixedUAStyles: {...styles.textLabelSupporting},
            }),
        }),
        [styles.colorMuted, styles.formError, styles.mb0, styles.textLabelSupporting],
    );

    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps = useMemo(() => ({selectable: props.textSelectable, allowFontScaling: false, textBreakStrategy: 'simple'}), [props.textSelectable]);
    const defaultViewProps = {style: [styles.alignItemsStart, styles.userSelectText]};

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
