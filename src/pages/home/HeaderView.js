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
import compose from '../../libs/compose';

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
    }),

    // Key-value pairs of user logins and whether or not they are typing.
    userTypingStatuses: PropTypes.array,
};

const defaultProps = {
    report: null,
    userTypingStatuses: {},
};

class HeaderView extends React.PureComponent {
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
                        <View>
                            <Text numberOfLines={2} style={[styles.navText]}>
                                {this.props.report.reportName}
                            </Text>
                            <Text numberOfLines={1} style={[styles.navSubText]}>
                                {this.getUsersTypingText()}
                            </Text>
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
