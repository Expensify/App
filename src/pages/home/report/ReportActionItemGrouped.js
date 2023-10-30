import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    /** Styles for the outermost View */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    wrapperStyles: [styles.chatItem],
};

function ReportActionItemGrouped(props) {
    const styles = useThemeStyles();
    return (
        <View style={props.wrapperStyles}>
            <View style={[styles.chatItemRightGrouped]}>{props.children}</View>
        </View>
    );
}

ReportActionItemGrouped.propTypes = propTypes;
ReportActionItemGrouped.defaultProps = defaultProps;
ReportActionItemGrouped.displayName = 'ReportActionItemGrouped';
export default ReportActionItemGrouped;
