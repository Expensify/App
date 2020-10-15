import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../style/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../lib/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
import compose from '../../lib/compose';
import {subscribeToReportTypingEvents} from '../../lib/actions/Report';

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
};

const defaultProps = {
    report: null,
};

class HeaderView extends React.PureComponent {
    componentDidMount() {
        if (this.props.report && this.props.report.reportID) {
            subscribeToReportTypingEvents(this.props.report.reportID);
        }
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
                                {this.props.usersTyping ? 'Users Are Typing...' : ''}
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
        usersTyping: {
            key: ({match}) => `${IONKEYS.COLLECTION.REPORT_USER_IS_TYPING}${match.params.reportID}`,
        }
    }),
)(HeaderView);
