import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getTaskReportActionMessage} from '@libs/TaskUtils';

import type {ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type TaskActionProps = {
    /** Name of the reportAction action */
    action: OnyxEntry<ReportAction>;
};

function TaskAction({action}: TaskActionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const message = getTaskReportActionMessage(translate, action);
    const isSelectable = !canUseTouchScreen() || !shouldUseNarrowLayout;
    const selectableStyle = isSelectable ? styles.userSelectText : styles.userSelectNone;

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.breakWord, styles.preWrap]}>
            {message.html ? (
                <RenderHTML
                    html={`<comment><muted-text>${message.html}</muted-text></comment>`}
                    isSelectable={isSelectable}
                />
            ) : (
                <Text style={[styles.chatItemMessage, styles.colorMuted, selectableStyle]}>{message.text}</Text>
            )}
        </View>
    );
}

export default TaskAction;
