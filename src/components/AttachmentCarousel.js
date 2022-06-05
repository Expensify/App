import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import Button from './Button';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** sourceUrl is used to determine the starting index in the array of attachments */
    sourceURL: PropTypes.string,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Callback to update the parent modal's state with a sourceUrl and name from the attachments array */
    onArrowPress: PropTypes.func,
};

const defaultProps = {
    sourceURL: '',
    reportActions: {},
    onArrowPress: () => {},
};

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        let page;
        const actionsArr = _.values(props.reportActions);
        const attachments = _.reduce(actionsArr, (attachmentsAccumulator, reportAction) => {
            if (reportAction.originalMessage && reportAction.originalMessage.html) {
                const matchesIt = reportAction.originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA);
                const matches = [...matchesIt];
                if (matches.length === 2) {
                    const [src, name] = matches;
                    if (src[2].includes(props.sourceURL)) {
                        page = attachmentsAccumulator.length;
                    }
                    const url = src[2].replace(
                        CONFIG.EXPENSIFY.EXPENSIFY_URL,
                        CONFIG.EXPENSIFY.URL_API_ROOT,
                    );
                    attachmentsAccumulator.push({sourceURL: url, file: {name: name[2]}});
                }
            }
            return attachmentsAccumulator;
        }, []);

        this.state = {
            page,
            attachments,
            isBackDisabled: page === 0,
            isForwardDisabled: page === attachments.length - 1,
        };

        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
    }

    /**
     * increments or decrements the index to get another selected item
     * @param {Boolean} shouldDecrement
    */
    cycleThroughAttachments(shouldDecrement) {
        this.setState((prevState) => {
            const attachments = prevState.attachments;
            const page = prevState.page;
            const nextIndex = shouldDecrement ? page - 1 : page + 1;
            this.props.onArrowPress(attachments[nextIndex]);

            return {
                page: nextIndex,
                isBackDisabled: nextIndex === 0,
                isForwardDisabled: nextIndex === attachments.length - 1,
            };
        });
    }

    render() {
        return (
            <View style={[styles.attachmentModalArrowsContainer]}>
                <Button
                    icon={Expensicons.BackArrow}
                    iconFill={themeColors.text}
                    onPress={() => this.cycleThroughAttachments(true)}
                    isDisabled={this.state.isBackDisabled}
                />
                <Button
                    icon={Expensicons.ArrowRight}
                    iconFill={themeColors.text}
                    onPress={() => this.cycleThroughAttachments(false)}
                    isDisabled={this.state.isForwardDisabled}
                />
            </View>
        );
    }
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default withOnyx({
    reportActions: {
        key: ({reportId}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportId}`,
        canEvict: true,
    },
})(AttachmentCarousel);
