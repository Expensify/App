import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import Hoverable from '@components/Hoverable';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type PreRendererProps = CustomRendererProps<TBlock> & {
    /** Press in handler for the code block */
    onPressIn?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Press out handler for the code block */
    onPressOut?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Long press handler for the code block */
    onLongPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** The position of this React element relative to the parent React element, starting at 0 */
    renderIndex: number;

    /** The total number of elements children of this React element parent */
    renderLength: number;
};

function PreRenderer({TDefaultRenderer, onPressIn, onPressOut, onLongPress, ...defaultRendererProps}: PreRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {anchor, report, action, isDisabled, shouldDisplayContextMenu, originalReportID} = useShowContextMenuState();
    const {onShowContextMenu, checkIfContextMenuActive} = useShowContextMenuActions();
    const isLast = defaultRendererProps.renderIndex === defaultRendererProps.renderLength - 1;

    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    const isInsideTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    const fontSize = StyleUtils.getCodeFontSize(false, isInsideTaskTitle);
    const codeText = HTMLEngineUtils.getCodeBlockText(defaultRendererProps.tnode);
    // Multi-line code blocks get extra breathing room around the copy button, while single-line blocks keep it tight to the corner.
    const isMultilineCodeBlock = codeText.trim().includes('\n');

    if (isChildOfTaskTitle) {
        return (
            <TDefaultRenderer
                {...defaultRendererProps}
                style={styles.taskTitleMenuItem}
            />
        );
    }

    return (
        <View style={isLast ? styles.mt2 : styles.mv2}>
            <Hoverable>
                {(isHovered) => (
                    <View>
                        <PressableWithoutFeedback
                            sentryLabel={CONST.SENTRY_LABEL.HTML_RENDERER.PRE}
                            onPress={onPressIn ?? (() => {})}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                            onLongPress={(event) => {
                                onShowContextMenu(() => {
                                    if (isDisabled || !shouldDisplayContextMenu) {
                                        return;
                                    }
                                    return showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, originalReportID);
                                });
                            }}
                            shouldUseHapticsOnLongPress
                            role={CONST.ROLE.PRESENTATION}
                            accessibilityLabel={translate('accessibilityHints.preStyledText')}
                        >
                            <View>
                                <Text style={{fontSize}}>
                                    <TDefaultRenderer {...defaultRendererProps} />
                                </Text>
                            </View>
                        </PressableWithoutFeedback>
                        {isHovered && !!codeText && (
                            <View style={isMultilineCodeBlock ? styles.codeBlockCopyButtonWrapperMultiline : styles.codeBlockCopyButtonWrapper}>
                                <CopyTextToClipboard
                                    urlToCopy={codeText}
                                    styles={styles.copyableTextFieldButton}
                                    iconStyles={styles.t0}
                                    shouldHaveActiveBackground
                                    shouldUseButtonBackground
                                />
                            </View>
                        )}
                    </View>
                )}
            </Hoverable>
        </View>
    );
}

export default PreRenderer;
