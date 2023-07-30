import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';

const propTypes = {
    message: PropTypes.string.isRequired,
    children: PropTypes.element,
};

const defaultProps = {
    children: null,
};

function ReportActionItemBasicMessage(props) {
    return (
        <View>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{props.message}</Text>
            {props.children}
        </View>
    );
}

ReportActionItemBasicMessage.propTypes = propTypes;
ReportActionItemBasicMessage.defaultProps = defaultProps;
ReportActionItemBasicMessage.displayName = 'ReportActionBasicMessage';

export default ReportActionItemBasicMessage;
