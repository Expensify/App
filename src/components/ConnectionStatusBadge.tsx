import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Badge from './Badge';
import Tooltip from './Tooltip';

type ConnectionStatusBadgeProps = {
    text: string;
    tone?: 'default' | 'success' | 'danger';
    tooltipText?: string;
};

function ConnectionStatusBadge({text, tone = 'default', tooltipText}: ConnectionStatusBadgeProps) {
    const styles = useThemeStyles();

    const badge = (
        <Badge
            text={text}
            success={tone === 'success'}
            error={tone === 'danger'}
            isCondensed
            badgeStyles={[styles.ml0]}
        />
    );

    if (!tooltipText) {
        return badge;
    }

    return (
        <Tooltip text={tooltipText}>
            <View>{badge}</View>
        </Tooltip>
    );
}

export default ConnectionStatusBadge;
