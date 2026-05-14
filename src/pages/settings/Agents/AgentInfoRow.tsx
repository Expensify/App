import React from 'react';
import {View} from 'react-native';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type AgentInfoRowProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Display name of the agent */
    displayName: string;

    /** Login (email) of the agent */
    login: string;

    /** Whether the agent is pending deletion */
    isDeleted?: boolean;
};

function AgentInfoRow({accountID, displayName, login, isDeleted = false}: AgentInfoRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <>
            <ReportActionAvatars
                accountIDs={[accountID]}
                size={CONST.AVATAR_SIZE.LARGE_NORMAL}
                shouldShowTooltip={false}
                singleAvatarContainerStyle={[StyleUtils.getWidthAndHeightStyle(variables.avatarSizeLargeNormal)]}
            />
            <View style={[styles.flex1, styles.gap1]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textStrong, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                >
                    {displayName}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.mutedNormalTextLabel, isDeleted ? styles.offlineFeedbackDeleted : {}]}
                >
                    {login}
                </Text>
            </View>
        </>
    );
}

export default AgentInfoRow;
