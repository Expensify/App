import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import CommentActions from './CommentActions';

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

const CommentActionsMenu = props => (
    <View style={[
        styles.flex1,
        props.isMini ? styles.flexRow : styles.flexColumn,
        props.shouldShow ? styles.dFlex : styles.dNone,
    ]}
    >
        {CommentActions.map((commentAction => (
            <Pressable>
                {commentAction.icon}
                {props.reportID}
                {props.reportActionID}
            </Pressable>
        )))}
    </View>
);

CommentActionsMenu.propTypes = propTypes;
CommentActionsMenu.defaultProps = defaultProps;

export default CommentActionsMenu;
