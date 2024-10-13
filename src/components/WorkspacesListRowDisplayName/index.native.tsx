import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import type WorkspacesListRowDisplayNameProps from './types';

function WorkspacesListRowDisplayName({isDeleted, ownerName}: WorkspacesListRowDisplayNameProps) {
    const styles = useThemeStyles();
    const processedOwnerName = EmojiUtils.splitTextWithEmojis(ownerName);

    return (
        <Text
            numberOfLines={1}
            style={[styles.labelStrong, isDeleted ? styles.offlineFeedback.deleted : {}]}
        >
            {processedOwnerName.length !== 0
                ? processedOwnerName.map(({text, isEmoji}, index) =>
                      isEmoji ? (
                          <Text
                              // eslint-disable-next-line react/no-array-index-key
                              key={index}
                              style={[styles.labelStrong, isDeleted ? styles.offlineFeedback.deleted : {}, styles.emojisWithTextFontFamily]}
                          >
                              {text}
                          </Text>
                      ) : (
                          text
                      ),
                  )
                : ownerName}
        </Text>
    );
}

WorkspacesListRowDisplayName.displayName = 'WorkspacesListRowDisplayName';

export default WorkspacesListRowDisplayName;
