import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Children view component for this action item */
    children: PropTypes.node.isRequired,
};

function ReportActionItemDraft(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.chatItemDraft]}>
            <View style={styles.flex1}>{props.children}</View>
        </View>
    );
}

ReportActionItemDraft.propTypes = propTypes;
ReportActionItemDraft.displayName = 'ReportActionItemDraft';
export default ReportActionItemDraft;
