import React, {useMemo} from 'react';
import type {TextProps} from 'react-native';
import {HTMLContentModel, HTMLElementModel, RenderHTMLConfigProvider, TRenderEngineProvider} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import FontUtils from '@styles/utils/FontUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import * as HTMLEngineUtils from './htmlEngineUtils';
import htmlRenderers from './HTMLRenderers';

type BaseHTMLEngineProviderProps = ChildrenProps & {
    /** Whether text elements should be selectable */
    textSelectable?: boolean;

    /** Handle line breaks according to the HTML standard (default on web)  */
    enableExperimentalBRCollapsing?: boolean;
};

// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// Beware that each prop should be referentialy stable between renders to avoid
// costly invalidations and commits.
function BaseHTMLEngineProvider({textSelectable = false, children, enableExperimentalBRCollapsing = false}: BaseHTMLEngineProviderProps) {
    const styles = useThemeStyles();

    // Declare nonstandard tags and their content model here
    /* eslint-disable @typescript-eslint/naming-convention */
    const customHTMLElementModels = useMemo(
        () => ({
            edited: HTMLElementModel.fromCustomModel({
                tagName: 'edited',
                contentModel: HTMLContentModel.textual,
            }),
            'alert-text': HTMLElementModel.fromCustomModel({
                tagName: 'alert-text',
                mixedUAStyles: {...styles.formError, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            'muted-text': HTMLElementModel.fromCustomModel({
                tagName: 'muted-text',
                mixedUAStyles: {...styles.colorMuted, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            'muted-text-label': HTMLElementModel.fromCustomModel({
                tagName: 'muted-text-label',
                mixedUAStyles: {...styles.mutedNormalTextLabel, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            comment: HTMLElementModel.fromCustomModel({
                tagName: 'comment',
                mixedUAStyles: {whiteSpace: 'pre'},
                contentModel: HTMLContentModel.block,
            }),
            'email-comment': HTMLElementModel.fromCustomModel({
                tagName: 'email-comment',
                mixedUAStyles: {whiteSpace: 'normal'},
                contentModel: HTMLContentModel.block,
            }),
            strong: HTMLElementModel.fromCustomModel({
                tagName: 'strong',
                mixedUAStyles: {whiteSpace: 'pre'},
                contentModel: HTMLContentModel.textual,
            }),
            'mention-user': HTMLElementModel.fromCustomModel({tagName: 'mention-user', contentModel: HTMLContentModel.textual}),
            'mention-report': HTMLElementModel.fromCustomModel({tagName: 'mention-report', contentModel: HTMLContentModel.textual}),
            'mention-here': HTMLElementModel.fromCustomModel({tagName: 'mention-here', contentModel: HTMLContentModel.textual}),
            'next-step': HTMLElementModel.fromCustomModel({
                tagName: 'next-step',
                mixedUAStyles: {...styles.textLabelSupporting, ...styles.lh16},
                contentModel: HTMLContentModel.textual,
            }),
            'next-step-email': HTMLElementModel.fromCustomModel({tagName: 'next-step-email', contentModel: HTMLContentModel.textual}),
            video: HTMLElementModel.fromCustomModel({
                tagName: 'video',
                mixedUAStyles: {whiteSpace: 'pre'},
                contentModel: HTMLContentModel.block,
            }),
            emoji: HTMLElementModel.fromCustomModel({tagName: 'emoji', contentModel: HTMLContentModel.textual}),
            'completed-task': HTMLElementModel.fromCustomModel({
                tagName: 'completed-task',
                mixedUAStyles: {...styles.textSupporting, ...styles.textLineThrough},
                contentModel: HTMLContentModel.textual,
            }),
            blockquote: HTMLElementModel.fromCustomModel({
                tagName: 'blockquote',
                contentModel: HTMLContentModel.block,
                getMixedUAStyles: (tnode) => {
                    if (tnode.attributes.isemojisonly === undefined) {
                        return;
                    }
                    return styles.onlyEmojisTextLineHeight;
                },
            }),
        }),
        [
            styles.formError,
            styles.mb0,
            styles.colorMuted,
            styles.textLabelSupporting,
            styles.lh16,
            styles.textSupporting,
            styles.textLineThrough,
            styles.mutedNormalTextLabel,
            styles.onlyEmojisTextLineHeight,
        ],
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps: TextProps = useMemo(() => ({selectable: textSelectable, allowFontScaling: false, textBreakStrategy: 'simple'}), [textSelectable]);
    const defaultViewProps = {style: [styles.alignItemsStart, styles.userSelectText]};
    return (
        <TRenderEngineProvider
            customHTMLElementModels={customHTMLElementModels}
            baseStyle={styles.webViewStyles.baseFontStyle}
            tagsStyles={styles.webViewStyles.tagStyles}
            enableCSSInlineProcessing={false}
            systemFonts={Object.values(FontUtils.fontFamily.single).map((font) => font.fontFamily)}
            htmlParserOptions={{
                recognizeSelfClosing: true,
            }}
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
                enableExperimentalBRCollapsing={enableExperimentalBRCollapsing}
            >
                {children}
            </RenderHTMLConfigProvider>
        </TRenderEngineProvider>
    );
}

BaseHTMLEngineProvider.displayName = 'BaseHTMLEngineProvider';

export default BaseHTMLEngineProvider;
