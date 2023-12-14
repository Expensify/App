import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';

type ExceededCommentLengthProps = {
    /** Show error when comment length is exceeded */
    shouldShowError: boolean;
};

function ExceededCommentLength({shouldShowError}: ExceededCommentLengthProps) {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();

    if (!shouldShowError) {
        return null;
    }

    return (
        <Text
            style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}
            numberOfLines={1}
        >
            {translate('composer.commentExceededMaxLength', {formattedMaxLength: numberFormat(CONST.MAX_COMMENT_LENGTH)})}
        </Text>
    );
}

ExceededCommentLength.displayName = 'ExceededCommentLength';

export default ExceededCommentLength;
