import PropTypes from 'prop-types';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Text from './Text';

const propTypes = {
    shouldShowError: PropTypes.bool.isRequired,
};

const defaultProps = {};

function ExceededCommentLength(props) {
    const styles = useThemeStyles();
    const {numberFormat, translate} = useLocalize();

    if (!props.shouldShowError) {
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

ExceededCommentLength.propTypes = propTypes;
ExceededCommentLength.defaultProps = defaultProps;
ExceededCommentLength.displayName = 'ExceededCommentLength';

export default ExceededCommentLength;
