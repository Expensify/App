import React from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type AgentsListRowProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Display name of the agent */
    displayName: string;

    /** Login email of the agent */
    login: string;

    /** Pending action for offline feedback */
    pendingAction?: PendingAction | null;

    /** Errors to display on the row */
    errors?: Errors | null;

    /** Called when the user dismisses the error */
    onErrorClose?: () => void;
};

function AgentsListRow({accountID, displayName, login, pendingAction, errors, onErrorClose}: AgentsListRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            onClose={onErrorClose}
            errorRowStyles={[styles.ph5, styles.pb5]}
        >
            <View style={[styles.selectionListPressableItemWrapper, styles.mb2, styles.gap3]}>
                <ReportActionAvatars
                    accountIDs={[accountID]}
                    size={CONST.AVATAR_SIZE.LARGE_NORMAL}
                    shouldShowTooltip={false}
                    singleAvatarContainerStyle={[StyleUtils.getWidthAndHeightStyle(variables.avatarSizeLargeNormal)]}
                />
                <View style={[styles.flex1, styles.gap1]}>
                    <Text
                        numberOfLines={1}
                        style={styles.textStrong}
                    >
                        {displayName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={styles.mutedNormalTextLabel}
                    >
                        {login}
                    </Text>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

export default AgentsListRow;
