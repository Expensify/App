import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
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
    const isLast = defaultRendererProps.renderIndex === defaultRendererProps.renderLength - 1;

    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    const isInsideTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);
    const fontSize = StyleUtils.getCodeFontSize(false, isInsideTaskTitle);

    if (isChildOfTaskTitle) {
        return (
            <TDefaultRenderer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                style={styles.taskTitleMenuItem}
            />
        );
    }

    return (
        <View style={isLast ? styles.mt2 : styles.mv2}>
            <ShowContextMenuContext.Consumer>
                {({onShowContextMenu, anchor, report, isReportArchived, action, checkIfContextMenuActive, isDisabled, shouldDisplayContextMenu}) => (
                    <PressableWithoutFeedback
                        onPress={onPressIn ?? (() => {})}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        onLongPress={(event) => {
                            onShowContextMenu(() => {
                                if (isDisabled || !shouldDisplayContextMenu) {
                                    return;
                                }
                                return showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, isArchivedNonExpenseReport(report, isReportArchived));
                            });
                        }}
                        shouldUseHapticsOnLongPress
                        role={CONST.ROLE.PRESENTATION}
                        accessibilityLabel={translate('accessibilityHints.preStyledText')}
                    >
                        <View>
                            <Text style={{fontSize}}>
                                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                <TDefaultRenderer {...defaultRendererProps} />
                            </Text>
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </View>
    );
}

export default PreRenderer;
