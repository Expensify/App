import React from 'react';
import {View} from 'react-native';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type AgentsListRowProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Display name of the agent */
    displayName: string;

    /** Login email of the agent */
    login: string;
};

function AgentsListRow({accountID, displayName, login}: AgentsListRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
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
            {/* Action buttons are deferred to R1.3 per phased rollout plan */}
        </View>
    );
}

export default AgentsListRow;
