import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'lodash';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import Text from './Text';
import styles from '../styles/styles';

const propTypes = {
    /** Text Comment */
    comment: PropTypes.string.isRequired,

    /** Update UI on parent when comment length is exceeded */
    onExceededMaxCommentLength: PropTypes.func.isRequired,
};

class ExceededCommentLength extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            commentLength: 0,
        };

        // By debouncing, we defer the calculation until there is a break in typing
        this.updateCommentLength = debounce(this.updateCommentLength.bind(this), CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME);
    }

    componentDidMount() {
        this.updateCommentLength();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.comment === this.props.comment) {
            return;
        }

        this.updateCommentLength();
    }

    updateCommentLength() {
        const commentLength = ReportUtils.getCommentLength(this.props.comment);
        this.setState({commentLength});
        this.props.onExceededMaxCommentLength(commentLength > CONST.MAX_COMMENT_LENGTH);
    }

    render() {
        if (this.state.commentLength <= CONST.MAX_COMMENT_LENGTH) {
            return null;
        }

        return (
            <Text style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}>
                {`${this.state.commentLength}/${CONST.MAX_COMMENT_LENGTH}`}
            </Text>
        );
    }
}

ExceededCommentLength.propTypes = propTypes;

export default ExceededCommentLength;
