import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';

const propTypes = {
    message: PropTypes.string.isRequired,
};

function ReportActionBasicMessage(props) {
    return <Text style={[styles.chatItemMessage, styles.colorMuted]}>{props.message}</Text>;
}

ReportActionBasicMessage.propTypes = propTypes;
ReportActionBasicMessage.displayName = 'ReportActionItemAddedBankAccount';

export default ReportActionBasicMessage;
