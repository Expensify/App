import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // This is a performance feature used to tell this component that we want it
    // to call onLayout when it renders. We need this so that we can calculate the size of
    // this component and pass it to our InvertedFlatList implementation.
    needsLayoutCalculation: PropTypes.bool,

    // Called when the view layout completes
    onLayout: PropTypes.func,
};

const defaultProps = {
    needsLayoutCalculation: false,
    onLayout: () => {},
};

class ReportActionItem extends React.Component {
    shouldComponentUpdate(nextProps) {
        // Allow this component to update if the needsLayoutCalculation prop changes
        // so we can make the component visible.
        if (nextProps.needsLayoutCalculation !== this.props.needsLayoutCalculation) {
            return true;
        }

        // If the grouping changes then we want to update the UI
        if (nextProps.displayAsGroup !== this.props.displayAsGroup) {
            return true;
        }

        // If the action's sequenceNumber changes then we'll update it
        return nextProps.action.sequenceNumber !== this.props.action.sequenceNumber;
    }

    render() {
        const {action, displayAsGroup} = this.props;
        const viewStyle = this.props.needsLayoutCalculation ? [styles.opacity0] : [styles.opacity1];
        return (
            <View
                style={viewStyle}
                onLayout={this.props.onLayout}
            >
                {!displayAsGroup && <ReportActionItemSingle action={action} />}
                {displayAsGroup && <ReportActionItemGrouped action={action} />}
            </View>
        );
    }
}

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default ReportActionItem;
