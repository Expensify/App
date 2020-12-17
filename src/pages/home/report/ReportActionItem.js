import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import CommentActionsMenu from './CommentActionsMenu/CommentActionsMenu';

const propTypes = {
    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,
};

const reportActionContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
};

const miniCommentActionsMenuWrapperStyle = {
    alignSelf: 'flex-start',
    marginTop: -20,
};

const ReportActionItem = props => (
    <>
        <Pressable>
            {({hovered}) => (
                <View style={reportActionContainerStyle}>
                    {!props.displayAsGroup
                        ? <ReportActionItemSingle action={props.action} />
                        : <ReportActionItemGrouped action={props.action} />}
                    <View style={miniCommentActionsMenuWrapperStyle}>
                        <CommentActionsMenu reportID="" reportActionID="" isMini shouldShow={hovered} />
                    </View>
                </View>
            )}
        </Pressable>
    </>
);

ReportActionItem.propTypes = propTypes;

export default ReportActionItem;
