import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import Str from 'expensify-common/lib/str';
import Tooltip from '../../../../components/Tooltip';
import styles from '../../../../styles/styles';

const propTypes = {
    // The text to display in this fragment
    text: PropTypes.string.isRequired,

    // The tooltip text to display when this fragment is hovered
    tooltip: PropTypes.string,
};

const defaultProps = {
    tooltip: '',
};

const ReportActionItemTextFragment = ({text, tooltip}) => (
    <Tooltip text={tooltip}>
        <Text
            selectable
            style={styles.chatItemMessageHeaderSender}
        >
            {Str.htmlDecode(text)}
        </Text>
    </Tooltip>
);

ReportActionItemTextFragment.propTypes = propTypes;
ReportActionItemTextFragment.defaultProps = defaultProps;
ReportActionItemTextFragment.displayName = 'ReportActionItemTextFragment';

export default ReportActionItemTextFragment;
