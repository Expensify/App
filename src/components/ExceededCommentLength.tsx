import React, {memo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';

function ExceededCommentLength() {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();

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

export default memo(ExceededCommentLength);
