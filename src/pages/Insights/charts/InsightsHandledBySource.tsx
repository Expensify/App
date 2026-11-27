/** Names a Handled by row's source with its icon, and for a setup row the line beneath it. */
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type InsightsHandledBySourceIcon = 'Users' | 'Bolt' | 'Bot';

type InsightsHandledBySourceProps = {
    label: string;
    iconName: InsightsHandledBySourceIcon;

    /** Shown under the label */
    description?: string;

    /** Draws the icon green and the label bold, for a setup row that invites the admin to add the source */
    isSetup?: boolean;
};

function InsightsHandledBySource({label, iconName, description, isSetup = false}: InsightsHandledBySourceProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'Bolt', 'Bot']);

    return (
        <View style={[styles.mnw0, styles.gap1]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <Icon
                    src={icons[iconName]}
                    fill={isSetup ? theme.iconSuccessFill : theme.icon}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
                <Text style={[styles.flex1, styles.breakWord, isSetup && styles.textStrong]}>{label}</Text>
            </View>
            {!!description && (
                <Text
                    variant="label"
                    style={[styles.textSupporting, styles.breakWord]}
                >
                    {description}
                </Text>
            )}
        </View>
    );
}

export default InsightsHandledBySource;
export type {InsightsHandledBySourceIcon};
