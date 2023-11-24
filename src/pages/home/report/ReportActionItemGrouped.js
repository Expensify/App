import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    /** Styles for the outermost View */
    wrapperStyle: stylePropTypes,
};

const defaultProps = {
    wrapperStyle: undefined,
};

function ReportActionItemGrouped({wrapperStyle, children}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.chatItem, wrapperStyle]}>
            <View style={styles.chatItemRightGrouped}>{children}</View>
        </View>
    );
}

ReportActionItemGrouped.propTypes = propTypes;
ReportActionItemGrouped.defaultProps = defaultProps;
ReportActionItemGrouped.displayName = 'ReportActionItemGrouped';
export default ReportActionItemGrouped;
