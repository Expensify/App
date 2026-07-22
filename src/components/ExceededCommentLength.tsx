import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import Text from './Text';

type ExceededCommentLengthProps = {
    maxCommentLength?: number;
    isTaskTitle?: boolean;
};

function ExceededCommentLength({maxCommentLength = CONST.MAX_COMMENT_LENGTH, isTaskTitle = false}: ExceededCommentLengthProps) {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();

    const translationKey = isTaskTitle ? 'composer.taskTitleExceededMaxLength' : 'composer.commentExceededMaxLength';

    return (
        <Text
            style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}
            numberOfLines={1}
        >
            {translate(translationKey, numberFormat(maxCommentLength))}
        </Text>
    );
}

export default ExceededCommentLength;
