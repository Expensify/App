import _ from 'underscore';
import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import getReportActionItemContainerStyles from '../../../styles/getReportActionItemContainerStyles';
import styles from '../../../styles/styles';
import ReportActionContextMenu from './ReportActionContextMenu';
import Hoverable from '../../../components/Hoverable';

const propTypes = {
    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

const ReportActionItem = props => (
    <Hoverable>
        {hovered => (
            <View>
                <View style={getReportActionItemContainerStyles(hovered)}>
                    {!props.displayAsGroup
                        ? <ReportActionItemSingle action={props.action} />
                        : <ReportActionItemGrouped action={props.action} />}
                </View>
                <View style={styles.miniReportActionContextMenuWrapperStyle}>
                    <ReportActionContextMenu
                        reportID={props.reportID}
                        reportActionID={props.action.sequenceNumber}
                        isVisible={hovered}
                        isMini
                    />
                </View>
            </View>
        )}
    </Hoverable>
);

ReportActionItem.propTypes = propTypes;

export default memo(ReportActionItem, ((prevProps, nextProps) => _.isEqual(prevProps, nextProps)));
