import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import Str from 'expensify-common/lib/str';
import styles from '../../../../styles/styles';

const propTypes = {
    // The text to display in this fragment
    text: PropTypes.string.isRequired,
};

const ReportActionItemTextFragment = ({text}) => (
    <Text style={styles.chatItemMessageHeaderSender}>
        {Str.htmlDecode(text)}
    </Text>
);

ReportActionItemTextFragment.propTypes = propTypes;
ReportActionItemTextFragment.displayName = 'ReportActionItemTextFragment';

export default ReportActionItemTextFragment;
