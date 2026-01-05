import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {getProcessedText, splitTextWithEmojis} from '@libs/EmojiUtils';
import type WorkspacesListRowDisplayNameProps from './types';

function WorkspacesListRowDisplayName({isDeleted, ownerName}: WorkspacesListRowDisplayNameProps) {
    const styles = useThemeStyles();
    const processedOwnerName = splitTextWithEmojis(ownerName);

    return (
        <Text
            numberOfLines={1}
            style={[styles.labelStrong, isDeleted ? styles.offlineFeedbackDeleted : {}]}
        >
            {processedOwnerName.length !== 0
                ? getProcessedText(processedOwnerName, [styles.labelStrong, isDeleted ? styles.offlineFeedbackDeleted : {}, styles.emojisWithTextFontFamily])
                : ownerName}
        </Text>
    );
}

export default WorkspacesListRowDisplayName;
