/** Names a Handled by row's source: an icon or the AI agent's avatar, its name, and the line beneath it. */
import UserAvatar from '@components/Avatar/UserAvatar';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type InsightsHandledBySourceIcon = 'Users' | 'Bolt' | 'Bot';

type InsightsHandledBySourceProps = {
    label: string;

    /** Shown under the label, e.g. "AI agent" or the rule's setting */
    description?: string;

    /** Icon drawn before the label, left out when the source is an AI agent with an avatar */
    iconName?: InsightsHandledBySourceIcon;

    /** Set for an AI agent, whose avatar stands in for the icon */
    agentAccountID?: number;

    agentAvatar?: PersonalDetails['avatar'];
};

function InsightsHandledBySource({label, description, iconName, agentAccountID, agentAvatar}: InsightsHandledBySourceProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'Bolt', 'Bot']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.flex1, styles.mnw0]}>
            {agentAccountID !== undefined ? (
                <UserAvatar
                    size={CONST.AVATAR_SIZE.XX_SMALL}
                    source={agentAvatar}
                    accountID={agentAccountID}
                />
            ) : (
                !!iconName && (
                    <Icon
                        src={icons[iconName]}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                )
            )}
            <View style={[styles.flex1, styles.mnw0]}>
                <Text style={styles.breakWord}>{label}</Text>
                {!!description && (
                    <Text
                        variant="label"
                        style={[styles.textSupporting, styles.breakWord]}
                    >
                        {description}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default InsightsHandledBySource;
export type {InsightsHandledBySourceIcon};
