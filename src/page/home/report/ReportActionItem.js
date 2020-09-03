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
};

class ReportActionItem extends React.Component {
    shouldComponentUpdate(nextProps) {
        // This component should only render if the action's sequenceNumber or displayAsGroup props change
        return nextProps.displayAsGroup !== this.props.displayAsGroup
            || !_.isEqual(nextProps.action, this.props.action);
    }

    render() {
        const {action, displayAsGroup} = this.props;
        if (action.actionName !== 'ADDCOMMENT') {
            return null;
        }

        return (
            <View>
                {!displayAsGroup && <ReportActionItemSingle action={action} />}
                {displayAsGroup && <ReportActionItemGrouped action={action} />}
            </View>
        );
    }
}

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
