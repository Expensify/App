import React from 'react';
import {splitBoxModelStyle, TNodeChildrenRenderer} from 'react-native-render-html';
import type {NativeTextStyles, TText} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import InlineCodeBlock from '@components/InlineCodeBlock';
import useStyleUtils from '@hooks/useStyleUtils';
import type HtmlRendererProps from './types';

type CodeRendererProps = HtmlRendererProps & {
    /** The position of this React element relative to the parent React element, starting at 0 */
    renderIndex: number;

    /** The total number of elements children of this React element parent */
    renderLength: number;
};

function CodeRenderer({style, TDefaultRenderer, key, tnode, renderIndex, renderLength}: CodeRendererProps) {
    const StyleUtils = useStyleUtils();
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle((style as NativeTextStyles) ?? {});

    /**
     * Get the defalult fontFamily variant
     * */
    const font = StyleUtils.getFontFamilyMonospace({
        fontStyle: undefined,
        fontWeight: undefined,
    });

    // Determine the font size for the code based on whether it's inside an H1 element.
    const isInsideH1 = HTMLEngineUtils.isChildOfH1(tnode);

    const fontSize = StyleUtils.getCodeFontSize(isInsideH1);

    const textStyleOverride = {
        fontSize,
        fontFamily: font,

        // We need to override this properties bellow that was defined in `textStyle`
        // Because by default the `react-native-render- html` add a style in the elements,
        // for example the <strong> tag has a fontWeig ht: "bold" and in the android it break the font
        fontWeight: undefined,
        fontStyle: undefined,
    };

    const defaultRendererProps = {TNodeChildrenRenderer, style, textProps: {}, type: 'text' as const, viewProps: {}, tnode: tnode as TText, renderIndex, renderLength};

    if (TDefaultRenderer === undefined) {
        return null;
    }

    return (
        <InlineCodeBlock
            defaultRendererProps={defaultRendererProps}
            TDefaultRenderer={TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={{...textStyle, ...textStyleOverride}}
            key={key}
        />
    );
}

CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;
