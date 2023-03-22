import React from 'react';
import {View, VirtualizedList} from 'react-native';
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
import compose from '../../libs/compose';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...withLocalizePropTypes,
};

const defaultProps = {
    source: '',
    reportActions: {},
    onNavigate: () => {},
};

function CellRendererComponent(props) {
    return <View {...props} style={[props.style, styles.w100]} />;
}

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
            layout: {},
        };

        this.scrollRef = React.createRef();
    }

    componentDidMount() {
        this.makeStateWithReports();
    }

    componentDidUpdate(prevProps) {
        const previousReportActionsCount = _.size(prevProps.reportActions);
        const currentReportActionsCount = _.size(this.props.reportActions);
        if (previousReportActionsCount === currentReportActionsCount) {
            return;
        }
        this.makeStateWithReports();
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
        let page = this.state.page;
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

        this.setState({
            page,
            attachments,
            isForwardDisabled: page === 0,
            isBackDisabled: page === attachments.length - 1,
        });
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

    onMainLayout = ({nativeEvent}) => {
        this.setState({layout: nativeEvent.layout});
    }

    getItemLayout = (data, index) => {
        const width = this.state.layout.width;
        return ({
            length: width,
            offset: width * index,
            index,
        });
    }

    renderItem = ({item}) => {
        console.log('item: ', item);

        return (
            <CarouselItem
                onPress={() => this.toggleArrowsVisibility(!this.state.shouldShowArrow)}
                source={item.source}
                file={item.file}
            />
        );
    }

    render() {
        const isPageSet = Number.isInteger(this.state.page);

        return (
            <View
                onLayout={this.onMainLayout}
                style={[styles.attachmentModalArrowsContainer]}
                onMouseEnter={() => this.toggleArrowsVisibility(true)}
                onMouseLeave={() => this.toggleArrowsVisibility(false)}
            >
                {(isPageSet && this.state.shouldShowArrow) && (
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
                <CarouselActions
                    styles={[styles.attachmentModalArrowsContainer]}
                    canSwipeLeft={!this.state.isBackDisabled}
                    canSwipeRight={!this.state.isForwardDisabled}
                    onPress={() => this.canUseTouchScreen && this.toggleArrowsVisibility(!this.state.shouldShowArrow)}
                    onCycleThroughAttachments={this.cycleThroughAttachments}
                >
                    <VirtualizedList
                        horizontal
                        ref={this.scrollRef}
                        initialScrollIndex={this.state.page}
                        initialNumToRender={1}
                        windowSize={5}
                        data={this.state.attachments}
                        contentContainerStyle={[styles.flex1]}
                        style={[styles.flex1]}
                        CellRendererComponent={CellRendererComponent}
                        renderItem={this.renderItem}
                        getItemLayout={this.getItemLayout}
                        keyExtractor={item => item.source}
                        getItemCount={() => this.state.attachments.length}
                        getItem={(data, i) => this.getAttachment(data[i])}
                    />
                </CarouselActions>
            </View>
        );
    }
}

function CarouselItem(props) {
    const authSource = addEncryptedAuthTokenToURL(props.source);

    return (
        <AttachmentView
            onPress={props.onPress}
            source={authSource}
            file={props.file}
        />
    );
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
)(AttachmentCarousel);
