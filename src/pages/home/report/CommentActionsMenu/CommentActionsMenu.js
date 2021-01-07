import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import getCommentActionsMenuStyles from '../../../../styles/getCommentActionsMenuStyles';
import CommentActions from './CommentActions';
import Expensicon from '../../../../components/Expensicons';

const propTypes = {
    reportID: PropTypes.string.isRequired,
    reportActionID: PropTypes.string.isRequired,
    isMini: PropTypes.bool,
    shouldShow: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    shouldShow: false,
};

const CommentActionsMenu = (props) => {
    const {wrapperStyle, buttonStyle} = getCommentActionsMenuStyles(props.isMini);
    return (
        <View style={[
            ...wrapperStyle,
            styles.flex1,
            props.shouldShow ? styles.dFlex : styles.dNone,
        ]}
        >
            {CommentActions.map((commentAction => (
                <TouchableOpacity style={buttonStyle}>
                    <Expensicon name={commentAction.icon} />
                </TouchableOpacity>
            )))}
            {props.reportID}
            {props.reportActionID}
        </View>
    );
};

CommentActionsMenu.propTypes = propTypes;
CommentActionsMenu.defaultProps = defaultProps;

export default CommentActionsMenu;
