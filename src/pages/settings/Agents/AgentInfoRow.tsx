import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type AgentInfoRowProps = {
    /** Account ID of the agent */
    accountID: number;

    /** Display name of the agent */
    displayName: string;

    /** Login (email) of the agent */
    login: string;

    /** Whether the agent is pending deletion */
    isPendingDeletion?: boolean;
};

function AgentInfoRow({accountID, displayName, login, isPendingDeletion = false}: AgentInfoRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <>
            <ReportActionAvatars
                accountIDs={[accountID]}
                size={CONST.AVATAR_SIZE.LARGE}
                shouldShowTooltip={false}
                singleAvatarContainerStyle={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.LARGE))]}
            />
            <View style={[styles.flex1, styles.gap1]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textStrong, isPendingDeletion ? styles.offlineFeedbackDeleted : {}]}
                >
                    {displayName}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.mutedNormalTextLabel, isPendingDeletion ? styles.offlineFeedbackDeleted : {}]}
                >
                    {login}
                </Text>
            </View>
        </>
    );
}

export default AgentInfoRow;
