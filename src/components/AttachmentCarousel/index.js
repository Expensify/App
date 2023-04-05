import React from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import CarouselActions from './CarouselActions';
import Button from '../Button';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import AttachmentView from '../AttachmentView';
import addEncryptedAuthTokenToURL from '../../libs/addEncryptedAuthTokenToURL';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import tryResolveUrlFromApiRoot from '../../libs/tryResolveUrlFromApiRoot';
import Tooltip from '../Tooltip';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import compose from '../../libs/compose';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    source: '',
    reportActions: {},
    onNavigate: () => {},
};

class AttachmentCarousel extends React.Component {
    constructor(props) {
        super(props);

        this.canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
        this.cycleThroughAttachments = this.cycleThroughAttachments.bind(this);

        this.state = {
            page: 0,
            attachments: [],
            source: this.props.source,
            shouldShowArrow: this.canUseTouchScreen,
            isForwardDisabled: true,
            isBackDisabled: true,
        };

        this.state = {
            ...this.state,
            ...this.makeStateWithReports(),
        };

        this.scrollRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        const previousReportActionsCount = _.size(prevProps.reportActions);
        const currentReportActionsCount = _.size(this.props.reportActions);
        if (previousReportActionsCount === currentReportActionsCount) {
            return;
        }

        const nextState = this.makeStateWithReports();
        this.setState(nextState);
    }

    /**
     * Helps to navigate between next/previous attachments
     * @param {Object} attachmentItem
     * @returns {Object}
     */
    getAttachment(attachmentItem) {
        const source = _.get(attachmentItem, 'source', '');
        const file = _.get(attachmentItem, 'file', {name: ''});

        return {
            source,
            file,
        };
    }

    /**
     * Toggles the visibility of the arrows
     * @param {Boolean} shouldShowArrow
     */
    toggleArrowsVisibility(shouldShowArrow) {
        this.setState({shouldShowArrow});
    }

    /**
     * This is called when there are new reports to set the state
     */
    makeStateWithReports() {
        let page = 0;
        const actions = ReportActionsUtils.getSortedReportActions(_.values(this.props.reportActions), true);

        /**
         * Looping to filter out attachments and retrieve the src URL and name of attachments.
         */
        const attachments = [];
        _.forEach(actions, ({originalMessage, message}) => {
            // Check for attachment which hasn't been deleted
            if (!originalMessage || !originalMessage.html || _.some(message, m => m.isEdited)) {
                return;
            }
            const matches = [...originalMessage.html.matchAll(CONST.REGEX.ATTACHMENT_DATA)];

            // matchAll captured both source url and name of the attachment
            if (matches.length === 2) {
                const [originalSource, name] = _.map(matches, m => m[2]);

                // Update the image URL so the images can be accessed depending on the config environment.
                // Eg: while using Ngrok the image path is from an Ngrok URL and not an Expensify URL.
                const source = tryResolveUrlFromApiRoot(originalSource);
                if (source === this.state.source) {
                    page = attachments.length;
                }

                attachments.push({source, file: {name}});
            }
        });

        return {
            page,
            attachments,
            isForwardDisabled: page === 0,
            isBackDisabled: page === attachments.length - 1,
        };
    }

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
    */
    cycleThroughAttachments(deltaSlide) {
        if ((deltaSlide > 0 && this.state.isForwardDisabled) || (deltaSlide < 0 && this.state.isBackDisabled)) {
            return;
        }

        this.setState(({attachments, page}) => {
            const nextIndex = page - deltaSlide;
            const {source, file} = this.getAttachment(attachments[nextIndex]);
            this.props.onNavigate({source: addEncryptedAuthTokenToURL(source), file});
            this.scrollRef.current.scrollToIndex({index: nextIndex, animated: false});
            return {
                page: nextIndex,
                source,
                file,
                isBackDisabled: nextIndex === attachments.length - 1,
                isForwardDisabled: nextIndex === 0,
            };
        });
    }

    getItemLayout = (data, index) => {
        const width = this.width || this.props.windowWidth;
        return ({
            length: width,
            offset: width * index,
            index,
        });
    }

    renderItem = ({item}) => {
        const authSource = addEncryptedAuthTokenToURL(item.source);

        return (
            <AttachmentView
                onPress={() => this.toggleArrowsVisibility(!this.state.shouldShowArrow)}
                source={authSource}
                file={item.file}
            />
        );
    }

    renderCell = props => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...props} style={[props.style, styles.flex1]} />
    )

    keyExtractor = item => item.source

    render() {
        return (
            <View
                style={[styles.attachmentModalArrowsContainer, styles.flex1]}
                onMouseEnter={() => this.toggleArrowsVisibility(true)}
                onMouseLeave={() => this.toggleArrowsVisibility(false)}
            >
                {this.state.shouldShowArrow && (
                    <>
                        {!this.state.isBackDisabled && (
                            <View style={styles.leftAttachmentArrow}>
                                <Tooltip text={this.props.translate('common.previous')}>
                                    <Button
                                        medium
                                        innerStyles={[styles.arrowIcon]}
                                        icon={Expensicons.BackArrow}
                                        iconFill={themeColors.text}
                                        iconStyles={[styles.mr0]}
                                        onPress={() => this.cycleThroughAttachments(-1)}
                                    />
                                </Tooltip>
                            </View>
                        )}
                        {!this.state.isForwardDisabled && (
                            <View style={styles.rightAttachmentArrow}>
                                <Tooltip text={this.props.translate('common.next')}>
                                    <Button
                                        medium
                                        innerStyles={[styles.arrowIcon]}
                                        icon={Expensicons.ArrowRight}
                                        iconFill={themeColors.text}
                                        iconStyles={[styles.mr0]}
                                        onPress={() => this.cycleThroughAttachments(1)}
                                    />
                                </Tooltip>
                            </View>
                        )}
                    </>
                )}
                <FlatList
                    horizontal
                    disableIntervalMomentum
                    inverted={this.canUseTouchScreen}
                    pagingEnabled
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    snapToAlignment="start"
                    snapToInterval={this.width || this.props.windowWidth}

                    // Enable scrolling by swiping on mobile (touch) devices only
                    // disable scroll for desktop/browsers because they add their own scrollbars
                    scrollEnabled={this.canUseTouchScreen}
                    ref={this.scrollRef}
                    initialScrollIndex={this.state.page}
                    initialNumToRender={3}
                    windowSize={15}
                    maxToRenderPerBatch={3}
                    updateCellsBatchingPeriod={250}
                    data={this.state.attachments}
                    contentContainerStyle={[styles.flexGrow1]}
                    CellRendererComponent={this.renderCell}
                    renderItem={this.renderItem}
                    getItemLayout={this.getItemLayout}
                    keyExtractor={this.keyExtractor}
                    listKey="AttachmentCarousel"
                />
            </View>
        );
    }
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default compose(
    withOnyx({
        reportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
    }),
    withLocalize,
    withWindowDimensions,
)(AttachmentCarousel);
