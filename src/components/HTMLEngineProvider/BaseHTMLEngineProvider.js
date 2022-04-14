import _ from 'underscore';
import React, {
    useMemo, useRef, useState, useEffect,
} from 'react';
import {
    TRenderEngineProvider,
    RenderHTMLConfigProvider,
    defaultHTMLElementModels,
} from 'react-native-render-html';
import PropTypes from 'prop-types';
import {AppState, PixelRatio} from 'react-native';
import htmlRenderers from './HTMLRenderers';
import * as HTMLEngineUtils from './htmlEngineUtils';
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

const defaultViewProps = {style: {alignItems: 'flex-start'}};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentialy stable between renders to avoid
// costly invalidations and commits.
const BaseHTMLEngineProvider = (props) => {
    const appState = useRef(AppState.currentState);
    const [pixelRatio, setPixelRatio] = useState(PixelRatio.getFontScale());
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/inactive|background/)
            && nextAppState === 'active'
            ) {
                setPixelRatio(PixelRatio.getFontScale());
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps = useMemo(() => ({selectable: props.textSelectable}), [props.textSelectable]);

    return (
        <TRenderEngineProvider
            customHTMLElementModels={customHTMLElementModels}
            baseStyle={styles.webViewStyles(pixelRatio > 1 ? 21 / pixelRatio : 16, pixelRatio).baseFontStyle}
            tagsStyles={styles.webViewStyles(pixelRatio > 1 ? 21 / pixelRatio : 16, pixelRatio).tagStyles}
            enableCSSInlineProcessing={false}
            dangerouslyDisableWhitespaceCollapsing
            systemFonts={_.values(fontFamily)}
        >
            <RenderHTMLConfigProvider
                defaultTextProps={defaultTextProps}
                defaultViewProps={defaultViewProps}
                renderers={htmlRenderers}
                computeEmbeddedMaxWidth={HTMLEngineUtils.computeEmbeddedMaxWidth}
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
