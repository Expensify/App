import React, {useMemo} from 'react';
import type {TextProps} from 'react-native';
import {HTMLContentModel, HTMLElementModel, RenderHTMLConfigProvider, TRenderEngineProvider} from 'react-native-render-html';
import type {TNode} from 'react-native-render-html';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import FontUtils from '@styles/utils/FontUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {computeEmbeddedMaxWidth, isChildOfTaskTitle} from './htmlEngineUtils';
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
// Beware that each prop should be referentially stable between renders to avoid
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
            'task-title': HTMLElementModel.fromCustomModel({
                tagName: 'task-title',
                contentModel: HTMLContentModel.block,
                mixedUAStyles: {...styles.taskTitleMenuItem},
            }),
            'alert-text': HTMLElementModel.fromCustomModel({
                tagName: 'alert-text',
                mixedUAStyles: {...styles.formError, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            'deleted-action': HTMLElementModel.fromCustomModel({
                tagName: 'deleted-action',
                mixedUAStyles: {...styles.formError, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            rbr: HTMLElementModel.fromCustomModel({
                tagName: 'rbr',
                getMixedUAStyles: (tnode) => {
                    if (tnode.attributes.issmall === undefined) {
                        return {...styles.formError, ...styles.mb0};
                    }
                    return {...styles.formError, ...styles.mb0, ...styles.textMicro};
                },
                contentModel: HTMLContentModel.block,
            }),
            'muted-link': HTMLElementModel.fromCustomModel({
                tagName: 'muted-link',
                mixedUAStyles: {...styles.subTextFileUpload, ...styles.textSupporting},
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
            'label-text': HTMLElementModel.fromCustomModel({
                tagName: 'label-text',
                mixedUAStyles: {...styles.textLabel, ...styles.mb0, ...styles.textLineHeightNormal},
                contentModel: HTMLContentModel.block,
            }),
            'muted-text-xs': HTMLElementModel.fromCustomModel({
                tagName: 'muted-text-xs',
                mixedUAStyles: {...styles.textExtraSmallSupporting, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            'muted-text-micro': HTMLElementModel.fromCustomModel({
                tagName: 'muted-text-micro',
                mixedUAStyles: {...styles.textMicroSupporting, ...styles.mb0},
                contentModel: HTMLContentModel.block,
            }),
            'centered-text': HTMLElementModel.fromCustomModel({
                tagName: 'centered-text',
                mixedUAStyles: {...styles.textAlignCenter},
                contentModel: HTMLContentModel.block,
            }),
            comment: HTMLElementModel.fromCustomModel({
                tagName: 'comment',
                getMixedUAStyles: (tnode) => {
                    if (tnode.attributes.islarge === undefined) {
                        if (tnode.attributes.center === undefined) {
                            return {whiteSpace: 'pre'};
                        }
                        return {whiteSpace: 'pre', flex: 1, justifyContent: 'center'};
                    }
                    return {whiteSpace: 'pre', ...styles.onlyEmojisText};
                },
                contentModel: HTMLContentModel.block,
            }),
            'email-comment': HTMLElementModel.fromCustomModel({
                tagName: 'email-comment',
                getMixedUAStyles: (tnode) => {
                    if (tnode.attributes.islarge === undefined) {
                        return {whiteSpace: 'normal'};
                    }
                    return {whiteSpace: 'normal', ...styles.onlyEmojisText};
                },
                contentModel: HTMLContentModel.block,
            }),
            tooltip: HTMLElementModel.fromCustomModel({
                tagName: 'tooltip',
                mixedUAStyles: {whiteSpace: 'pre', ...styles.productTrainingTooltipText},
                contentModel: HTMLContentModel.block,
            }),
            success: HTMLElementModel.fromCustomModel({
                tagName: 'success',
                mixedUAStyles: {...styles.textSuccess},
                contentModel: HTMLContentModel.textual,
            }),
            strong: HTMLElementModel.fromCustomModel({
                tagName: 'strong',
                getMixedUAStyles: (tnode) => (isChildOfTaskTitle(tnode as TNode) ? {} : styles.strong),
                contentModel: HTMLContentModel.textual,
            }),
            em: HTMLElementModel.fromCustomModel({
                tagName: 'em',
                getMixedUAStyles: (tnode) => (isChildOfTaskTitle(tnode as TNode) ? styles.taskTitleMenuItemItalic : styles.em),
                contentModel: HTMLContentModel.textual,
            }),
            h1: HTMLElementModel.fromCustomModel({
                tagName: 'h1',
                getMixedUAStyles: (tnode) => (isChildOfTaskTitle(tnode as TNode) ? {} : styles.h1),
                contentModel: HTMLContentModel.block,
            }),
            'mention-user': HTMLElementModel.fromCustomModel({tagName: 'mention-user', contentModel: HTMLContentModel.textual}),
            'mention-report': HTMLElementModel.fromCustomModel({tagName: 'mention-report', contentModel: HTMLContentModel.textual}),
            'mention-here': HTMLElementModel.fromCustomModel({tagName: 'mention-here', contentModel: HTMLContentModel.textual}),
            'mention-short': HTMLElementModel.fromCustomModel({tagName: 'mention-short', contentModel: HTMLContentModel.textual}),
            'copy-text': HTMLElementModel.fromCustomModel({tagName: 'copy-text', contentModel: HTMLContentModel.textual}),
            'concierge-link': HTMLElementModel.fromCustomModel({tagName: 'concierge-link', contentModel: HTMLContentModel.textual}),
            'account-manager-link': HTMLElementModel.fromCustomModel({tagName: 'account-manager-link', contentModel: HTMLContentModel.textual}),
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
                        return isChildOfTaskTitle(tnode as TNode) ? {} : styles.blockquote;
                    }
                    return isChildOfTaskTitle(tnode as TNode) ? {} : {...styles.blockquote, ...styles.onlyEmojisTextLineHeight};
                },
            }),
        }),
        [
            styles.taskTitleMenuItem,
            styles.formError,
            styles.mb0,
            styles.colorMuted,
            styles.mutedNormalTextLabel,
            styles.productTrainingTooltipText,
            styles.textLabelSupporting,
            styles.lh16,
            styles.textSupporting,
            styles.textLineThrough,
            styles.textMicro,
            styles.onlyEmojisText,
            styles.strong,
            styles.taskTitleMenuItemItalic,
            styles.em,
            styles.h1,
            styles.blockquote,
            styles.onlyEmojisTextLineHeight,
            styles.subTextFileUpload,
            styles.textAlignCenter,
            styles.textSuccess,
            styles.textExtraSmallSupporting,
            styles.textMicroSupporting,
            styles.textLabel,
            styles.textLineHeightNormal,
        ],
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    // We need to memoize this prop to make it referentially stable.
    const defaultTextProps: TextProps = useMemo(() => ({selectable: textSelectable, allowFontScaling: false, textBreakStrategy: 'simple'}), [textSelectable]);
    const defaultViewProps = {style: [styles.alignItemsStart, styles.userSelectText, styles.mw100]};
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
                computeEmbeddedMaxWidth={computeEmbeddedMaxWidth}
                enableExperimentalBRCollapsing={enableExperimentalBRCollapsing}
            >
                {children}
            </RenderHTMLConfigProvider>
        </TRenderEngineProvider>
    );
}

BaseHTMLEngineProvider.displayName = 'BaseHTMLEngineProvider';

export default BaseHTMLEngineProvider;
