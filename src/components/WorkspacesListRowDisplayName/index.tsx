import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type WorkspacesListRowDisplayNameProps from './types';

function WorkspacesListRowDisplayName({isDeleted, ownerName}: WorkspacesListRowDisplayNameProps) {
    const styles = useThemeStyles();

    return (
        <Text
            numberOfLines={1}
            style={[styles.labelStrong, isDeleted ? styles.offlineFeedbackDeleted : {}]}
        >
            {ownerName}
        </Text>
    );
}

export default WorkspacesListRowDisplayName;
