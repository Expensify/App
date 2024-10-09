import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
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
    const {translate} = useLocalize();
    const isLast = defaultRendererProps.renderIndex === defaultRendererProps.renderLength - 1;

    return (
        <View style={isLast ? styles.mt2 : styles.mv2}>
            <ShowContextMenuContext.Consumer>
                {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive, isDisabled}) => (
                    <PressableWithoutFeedback
                        onPress={onPressIn ?? (() => {})}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        onLongPress={(event) => {
                            if (isDisabled) {
                                return;
                            }
                            showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report, reportNameValuePairs));
                        }}
                        shouldUseHapticsOnLongPress
                        role={CONST.ROLE.PRESENTATION}
                        accessibilityLabel={translate('accessibilityHints.prestyledText')}
                    >
                        <View>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <TDefaultRenderer {...defaultRendererProps} />
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </View>
    );
}

PreRenderer.displayName = 'PreRenderer';

export default PreRenderer;
