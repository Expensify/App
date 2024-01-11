import React from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import type {TText} from 'react-native-render-html';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import withLocalize from '@components/withLocalize';
import type {WithLocalizeProps} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type HtmlRendererProps from './types';

type PreRendererProps = HtmlRendererProps &
    WithLocalizeProps & {
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

function PreRenderer({tnode, style, TDefaultRenderer, onPressIn = undefined, onPressOut = undefined, translate, renderIndex, renderLength}: PreRendererProps) {
    const styles = useThemeStyles();
    const isLast = renderIndex === renderLength - 1;

    const defaultRendererProps = {TNodeChildrenRenderer, style, textProps: {}, type: 'text' as const, viewProps: {}, tnode: tnode as TText, renderIndex, renderLength};

    return (
        <View style={[isLast ? styles.mt2 : styles.mv2]}>
            <ShowContextMenuContext.Consumer>
                {({anchor, report, action, checkIfContextMenuActive}) => (
                    <PressableWithoutFeedback
                        onPress={onPressIn ?? (() => {})}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        // @ts-expect-error TODO: Remove this once ShowContextMenuContext (https://github.com/Expensify/App/issues/24980) is migrated to TypeScript.
                        onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                        role={CONST.ROLE.PRESENTATION}
                        accessibilityLabel={translate('accessibilityHints.prestyledText')}
                    >
                        <View>
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            {TDefaultRenderer !== undefined && <TDefaultRenderer {...defaultRendererProps} />}
                        </View>
                    </PressableWithoutFeedback>
                )}
            </ShowContextMenuContext.Consumer>
        </View>
    );
}

PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
