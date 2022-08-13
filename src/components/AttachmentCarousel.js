import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import AttachmentView from './AttachmentView';
import SwipeableView from './SwipeableView';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import themeColors from '../styles/themes/default';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import canUseTouchScreen from '../libs/canUseTouchscreen';
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

        this.canUseTouchScreen = canUseTouchScreen();
        this.onPressShowArrow = this.onPressShowArrow.bind(this);
        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
        this.onShowArrow = this.onShowArrow.bind(this);

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
        const {sourceURL, file} = this.getAttachment(attachments[page]);
        this.state = {
            page,
            attachments,
            sourceURL,
            file,
            showArrows: this.canUseTouchScreen,
            isBackDisabled: page === 0,
            isForwardDisabled: page === attachments.length - 1,
        };
    }

    componentDidMount() {
        if (this.canUseTouchScreen) {
            return;
        }
        document.addEventListener('keydown', this.handleArrowPress);
    }

    componentWillUnmount() {
        if (this.canUseTouchScreen) {
            return;
        }
        document.removeEventListener('keydown', this.handleArrowPress);
    }

    /**
     * Toggles the visibility of the arrows on mouse hover
     * @param {Boolean} showArrows
     */
    onShowArrow(showArrows) {
        this.setState({showArrows});
    }

    /**
     * Helper to provide a check for touchscreens
     */
    onPressShowArrow() {
        if (!this.canUseTouchScreen) {
            return;
        }
        this.onShowArrow(!this.state.showArrows);
    }

    /**
     * Helps to navigate between next/previous attachments
     * @param {Object} attachmentItem
     * @returns {Object}
     */
    getAttachment(attachmentItem) {
        const sourceURL = _.get(attachmentItem, 'sourceURL', '');
        const file = _.get(attachmentItem, 'file', {name: ''});
        return {
            sourceURL: addEncryptedAuthTokenToURL(sourceURL),
            file,
        };
    }

    /**
     * increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
    */
    cycleThroughAttachments(deltaSlide) {
        if ((deltaSlide < 0 && this.state.isBackDisabled) || (deltaSlide > 0 && this.state.isForwardDisabled)) {
            return;
        }
        this.setState(({attachments, page}) => {
            const nextIndex = page + deltaSlide;
            const {sourceURL, file} = this.getAttachment(attachments[nextIndex]);
            this.props.onArrowPress({sourceURL, file});
            return {
                page: nextIndex,
                sourceURL,
                file,
                isBackDisabled: nextIndex === 0,
                isForwardDisabled: nextIndex === attachments.length - 1,
            };
        });
    }

    /**
     * Listens for keyboard shortcuts and applies the action
     *
     * @param {Object} e
     */
    handleArrowPress(e) {
        if (e.key === 'ArrowLeft') {
            this.cycleThroughAttachments(-1);
        }
        if (e.key === 'ArrowRight') {
            this.cycleThroughAttachments(1);
        }
    }

    render() {
        return (
            <View
                style={[styles.attachmentModalArrowsContainer]}
                onMouseEnter={() => this.onShowArrow(true)}
                onMouseLeave={() => this.onShowArrow(false)}
            >
                {this.state.showArrows && (
                    <>
                        <Button
                            medium
                            style={[styles.leftAttachmentArrow]}
                            icon={Expensicons.BackArrow}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0, {PointerEvent: 'auto'}]}
                            onPress={() => this.cycleThroughAttachments(-1)}
                            isDisabled={this.state.isBackDisabled}
                        />
                        <Button
                            medium
                            style={[styles.rightAttachmentArrow]}
                            icon={Expensicons.ArrowRight}
                            iconFill={themeColors.text}
                            iconStyles={[styles.mr0, {PointerEvent: 'auto'}]}
                            onPress={() => this.cycleThroughAttachments(1)}
                            isDisabled={this.state.isForwardDisabled}
                        />
                    </>
                )}
                <SwipeableView
                    isAnimated
                    canSwipeLeft={!this.state.isBackDisabled}
                    canSwipeRight={!this.state.isForwardDisabled}
                    onPress={() => this.canUseTouchScreen && this.onShowArrow(!this.state.showArrows)}
                    onSwipeHorizontal={this.cycleThroughAttachments}
                >
                    <AttachmentView onPDFPress={this.onPressShowArrow} sourceURL={this.state.sourceURL} file={this.state.file} />
                </SwipeableView>
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
