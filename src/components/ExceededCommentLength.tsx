import React, {memo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';

type ExceededCommentLengthProps = {
    maxCommentLength?: number;
};

function ExceededCommentLength({maxCommentLength = CONST.MAX_COMMENT_LENGTH}: ExceededCommentLengthProps) {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();

    return (
        <Text
            style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}
            numberOfLines={1}
        >
            {translate('composer.commentExceededMaxLength', {formattedMaxLength: numberFormat(maxCommentLength)})}
        </Text>
    );
}

ExceededCommentLength.displayName = 'ExceededCommentLength';

export default memo(ExceededCommentLength);
