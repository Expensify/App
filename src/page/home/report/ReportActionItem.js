import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

class ReportActionItem extends Component {
    shouldComponentUpdate(nextProps) {
        // If the grouping changes then we want to update the UI
        return nextProps.displayAsGroup !== this.props.displayAsGroup;
    }

    render() {
        return (
            <>
                {!this.props.displayAsGroup
                    ? <ReportActionItemSingle action={this.props.action} />
                    : <ReportActionItemGrouped action={this.props.action} />}
            </>
        );
    }
}

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
