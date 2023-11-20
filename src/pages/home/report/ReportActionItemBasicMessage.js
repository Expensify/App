import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    message: PropTypes.string.isRequired,
    children: PropTypes.element,
};

const defaultProps = {
    children: null,
};

function ReportActionItemBasicMessage(props) {
    const styles = useThemeStyles();
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
