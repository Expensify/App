import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import getReportActionItemContainerStyles from '../../../styles/getReportActionItemContainerStyles';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Whether or not this ReportActionItem is hovered
    isHovered: PropTypes.bool,
};

const defaultProps = {
    isHovered: false,
};

const ReportActionItem = React.forwardRef((props, ref) => (
    <View ref={ref} style={getReportActionItemContainerStyles(props.isHovered)}>
        {!props.displayAsGroup
            ? <ReportActionItemSingle action={props.action} />
            : <ReportActionItemGrouped action={props.action} />}
    </View>
));

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default memo(ReportActionItem);
