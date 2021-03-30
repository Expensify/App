import React, {Component} from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import {BackArrow, Pin, Phone} from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import {togglePinnedState} from '../../libs/actions/Report';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MultipleAvatars from '../../components/MultipleAvatars';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import {getReportParticipantsTitle} from '../../libs/reportUtils';
import OptionRowTitle from './sidebar/OptionRowTitle';
import {getPersonalDetailsForLogins} from '../../libs/OptionsListUtils';
import {participantPropTypes} from './sidebar/optionPropTypes';
import VideoChatMenu from '../../components/VideoChatMenu';
import IOUBadge from '../../components/IOUBadge';

const propTypes = {
    // Toggles the navigationMenu open and closed
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // List of primarylogins of participants of the report
        participants: PropTypes.arrayOf(PropTypes.string),

        // ID of the report
        reportID: PropTypes.number,

        // Value indicating if the report is pinned or not
        isPinned: PropTypes.bool,
    }),

    // Personal details of all the users
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: null,
};

class HeaderView extends Component {
    constructor(props) {
        super(props);

        this.participants = lodashGet(this.props.report, 'participants', []);
        this.reportOption = {
            text: lodashGet(this.props.report, 'reportName', ''),
            tooltipText: getReportParticipantsTitle(this.participants),
            participantsList: getPersonalDetailsForLogins(this.participants, this.props.personalDetails),
        };
        this.toggleVideoChatMenu = this.toggleVideoChatMenu.bind(this);
        this.measureVideoChatIconPosition = this.measureVideoChatIconPosition.bind(this);
        this.videoChatIconWrapper = null;

        this.state = {
            isVideoChatMenuActive: false,
            videoChatIconPosition: {x: 0, y: 0},
        };
    }

    toggleVideoChatMenu() {
        this.setState(prevState => ({
            isVideoChatMenuActive: !prevState.isVideoChatMenuActive,
        }));
    }

    measureVideoChatIconPosition() {
        if (this.videoChatIconWrapper) {
            this.videoChatIconWrapper.measureInWindow((x, y) => this.setState({
                videoChatIconPosition: {x, y},
            }));
        }
    }

    render() {
        return (
            <View style={[styles.appContentHeader]} nativeID="drag-area">
                <View style={[styles.appContentHeaderTitle, !this.props.isSmallScreenWidth && styles.pl5]}>
                    {this.props.isSmallScreenWidth && (
                        <Pressable
                            onPress={this.props.onNavigationMenuButtonClicked}
                            style={[styles.LHNToggle]}
                        >
                            <Icon src={BackArrow} />
                        </Pressable>
                    )}
                    {this.props.report && this.props.report.reportName && (
                        <View
                            style={[
                                styles.flex1,
                                styles.flexRow,
                                styles.alignItemsCenter,
                                styles.justifyContentBetween,
                            ]}
                        >
                            <Pressable
                                onPress={() => {
                                    if (this.participants.length === 1) {
                                        Navigation.navigate(ROUTES.getDetailsRoute(this.participants[0]));
                                    }
                                }}
                                style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                            >
                                <MultipleAvatars avatarImageURLs={this.props.report.icons} />
                                <View style={[styles.flex1, styles.flexRow]}>
                                    <OptionRowTitle
                                        option={this.reportOption}
                                        tooltipEnabled
                                        numberOfLines={1}
                                        style={[styles.headerText]}
                                    />
                                </View>
                            </Pressable>
                            <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                                {this.props.report.hasOutstandingIOU && (
                                    <IOUBadge iouReportID={this.props.report.iouReportID} />
                                )}
                                <View
                                    ref={el => this.videoChatIconWrapper = el}
                                    onLayout={this.measureVideoChatIconPosition}
                                >
                                    <Pressable
                                        onPress={() => {
                                            this.toggleVideoChatMenu();
                                        }}
                                        style={[styles.touchableButtonImage, styles.mr0]}
                                    >
                                        <Icon
                                            src={Phone}
                                            fill={this.state.isVideoChatMenuActive
                                                ? themeColors.heading
                                                : themeColors.icon}
                                        />
                                    </Pressable>
                                </View>
                                <Pressable
                                    onPress={() => togglePinnedState(this.props.report)}
                                    style={[styles.touchableButtonImage, styles.mr0]}
                                >
                                    <Icon
                                        src={Pin}
                                        fill={this.props.report.isPinned ? themeColors.heading : themeColors.icon}
                                    />
                                </Pressable>
                                <VideoChatMenu
                                    onClose={this.toggleVideoChatMenu}
                                    isVisible={this.state.isVideoChatMenuActive}
                                    anchorPosition={this.state.videoChatIconPosition}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(HeaderView);
