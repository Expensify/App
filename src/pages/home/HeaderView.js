import React from 'react';
import _ from 'underscore';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../styles/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../libs/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
import {getDisplayName} from '../../libs/actions/PersonalDetails';
import pinEnabled from '../../../assets/images/pin-enabled.png';
import pinDisabled from '../../../assets/images/pin-disabled.png';
import compose from '../../libs/compose';
import {togglePinnedState} from '../../libs/actions/Report';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onHamburgerButtonClicked: PropTypes.func.isRequired,

    // Decides whether we should show the hamburger menu button
    shouldShowHamburgerButton: PropTypes.bool.isRequired,

    /* Ion Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // ID of the report
        reportID: PropTypes.number,

        // Value indicating if the report is pinned or not
        isPinned: PropTypes.bool,
    }),

    // Key-value pairs of user logins and whether or not they are typing.
    userTypingStatuses: PropTypes.array,
};

const defaultProps = {
    report: null,
    userTypingStatuses: {},
};

class HeaderView extends React.Component {
    /**
     * Retrieves the text to display if users are typing.
     *
     * @returns {string}
     */
    getUsersTypingText() {
        // Filter only to users that are typing.
        const usersTyping = Object.keys(this.props.userTypingStatuses || {})
            .filter(login => this.props.userTypingStatuses[login] === true);

        if (_.size(usersTyping) === 1) {
            const displayName = getDisplayName(usersTyping[0]);
            return `${displayName} is typing...`;
        }

        if (_.size(usersTyping) > 1) {
            return 'Multiple users are typing...';
        }

        return '';
    }

    render() {
        return (
            <View style={[styles.appContentHeader]}>
                <View style={[styles.appContentHeaderTitle]}>
                    {this.props.shouldShowHamburgerButton && (
                        <TouchableOpacity
                            onPress={this.props.onHamburgerButtonClicked}
                            style={[styles.LHNToggle]}
                        >
                            <Image
                                resizeMode="contain"
                                style={[styles.LHNToggleIcon]}
                                source={LHNToggle}
                            />
                        </TouchableOpacity>
                    )}
                    {this.props.report && this.props.report.reportName ? (
                        <View style={[
                            styles.dFlex,
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.flexGrow1,
                            styles.flexJustifySpaceBetween
                        ]}
                        >
                            <View>
                                <Text numberOfLines={1} style={[styles.navText]}>
                                    {this.props.report.reportName}
                                </Text>
                                <Text numberOfLines={1} style={[styles.navSubText]}>
                                    {this.getUsersTypingText()}
                                </Text>
                            </View>

                            <View style={[styles.reportOptions, styles.flexRow]}>
                                <TouchableOpacity
                                    onPress={() => togglePinnedState(parseInt(this.props.report.reportID, 10))}
                                    style={[styles.touchableButtonImage, styles.mr0]}
                                >
                                    <Image
                                        resizeMode="contain"
                                        source={this.props.report.isPinned ? pinEnabled : pinDisabled}
                                        style={[styles.reportPinIcon]}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    }
}

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        report: {
            key: ({match}) => `${IONKEYS.COLLECTION.REPORT}${match.params.reportID}`,
        },
        userTypingStatuses: {
            key: ({match}) => `${IONKEYS.COLLECTION.REPORT_USER_IS_TYPING}${match.params.reportID}`,
        }
    }),
)(HeaderView);
