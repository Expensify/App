import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Used to tell this component that we want it to call onLayout when it renders
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
        // This component should only render if the action's sequenceNumber or displayAsGroup props change
        return nextProps.needsLayoutCalculation !== this.props.needsLayoutCalculation
            || nextProps.displayAsGroup !== this.props.displayAsGroup
            || !_.isEqual(nextProps.action, this.props.action);
    }

    render() {
        const {action, displayAsGroup} = this.props;
        if (action.actionName !== 'ADDCOMMENT') {
            return null;
        }

        return (
            <View
                style={{opacity: this.props.needsLayoutCalculation ? 0 : 1}}
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
