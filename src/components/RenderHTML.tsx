import React, {useMemo} from 'react';
import {RenderHTMLConfigProvider, RenderHTMLSource} from 'react-native-render-html';
import type {RenderersProps} from 'react-native-render-html';
import useHasTextAncestor from '@hooks/useHasTextAncestor';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Parser from '@libs/Parser';
import BulletItemRenderer from './HTMLEngineProvider/HTMLRenderers/BulletItemRenderer';
import SparklesIconRenderer from './HTMLEngineProvider/HTMLRenderers/SparklesIconRenderer';
import ULRenderer from './HTMLEngineProvider/HTMLRenderers/ULRenderer';

type LinkPressHandler = NonNullable<RenderersProps['a']>['onPress'];

// Matches &amp;#91; (→ "[") and &amp;#93; (→ "]"). Index 7 is the distinguishing digit ('1' vs '3').
const RE_BRACKET_ESCAPE = /&amp;#9[13];/g;
// Matches consecutive duplicate <emoji> or </emoji> tags, keeping only the outermost one.
const RE_EMOJI_OPEN_OR_CLOSE = /(<emoji[^>]*>)(?:<emoji[^>]*>)+|(<\/emoji[^>]*>)(?:<\/emoji[^>]*>)+/g;
// Strips orphaned <br/> tags inside <ul> that would render as extra empty bullets.
const RE_BR_CLEANUP = /<br\s*\/?>\s*(<\/ul>)|(<\/li>)\s*<br\s*\/?>\s*(?=<(?:li|\/ul)>)/gi;

type RenderHTMLProps = {
    /** HTML string to render */
    html: string;

    /** Callback to handle link press */
    onLinkPress?: LinkPressHandler;

    /** Whether the rendered text should be selectable */
    isSelectable?: boolean;
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
function RenderHTML({html: htmlParam, onLinkPress, isSelectable}: RenderHTMLProps) {
    const hasTextAncestor = useHasTextAncestor();
    if (__DEV__ && hasTextAncestor) {
        throw new Error('RenderHTML must not be rendered inside a <Text> component, as it will break the layout on iOS. Render it as a sibling instead.');
    }

    const {windowWidth} = useWindowDimensions();
    const html = useMemo(() => {
        return (
            Parser.replace(htmlParam, {shouldEscapeText: false, filterRules: ['emoji']})
                // Escape brackets when pasting a link, since unescaped [] can break Markdown link syntax
                .replaceAll(RE_BRACKET_ESCAPE, (m) => (m.at(7) === '1' ? '[' : ']'))
                // Remove double <emoji> tag if exists and keep the outermost tag (always the original tag).
                .replaceAll(RE_EMOJI_OPEN_OR_CLOSE, '$1$2')
                // Strip orphaned <br/> tags inside <ul> that would render as extra empty bullets
                .replaceAll(RE_BR_CLEANUP, '$1$2')
        );
    }, [htmlParam]);

    const renderersProps = useMemo(() => {
        return {
            a: {
                onPress: onLinkPress,
            },
        };
    }, [onLinkPress]);

    const renderers = {
        /* eslint-disable @typescript-eslint/naming-convention */
        'bullet-item': BulletItemRenderer,
        'sparkles-icon': SparklesIconRenderer,
        ul: ULRenderer,
    };

    const htmlSource = (
        <RenderHTMLSource
            contentWidth={windowWidth * 0.8}
            source={{html}}
        />
    );

    return onLinkPress ? (
        <RenderHTMLConfigProvider
            defaultTextProps={{selectable: isSelectable ?? true, allowFontScaling: false}}
            renderersProps={renderersProps}
            renderers={renderers}
        >
            {htmlSource}
        </RenderHTMLConfigProvider>
    ) : (
        htmlSource
    );
}

export default RenderHTML;
