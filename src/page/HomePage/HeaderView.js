import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../style/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../lib/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
import compose from '../../lib/ComposeUtil';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onHamburgerButtonClicked: PropTypes.func.isRequired,

    // Decides whether we should show the hamburger menu button
    shouldShowHamburgerButton: PropTypes.bool.isRequired,

    /* Ion Props */

    // Name of the report (if we have one)
    reportName: PropTypes.string,
};

const defaultProps = {
    reportName: null,
};

const HeaderView = props => (
    <View style={[styles.appContentHeader]}>
        <View style={[styles.appContentHeaderTitle]}>
            {props.shouldShowHamburgerButton && (
            <TouchableOpacity
                onPress={props.onHamburgerButtonClicked}
                style={[styles.LHNToggle]}
            >
                <Image
                    resizeMode="contain"
                    style={[styles.LHNToggleIcon]}
                    source={LHNToggle}
                />
            </TouchableOpacity>
            )}
            {props.reportName && (
                <Text numberOfLines={2} style={[styles.navText]}>
                    {props.reportName}
                </Text>
            )}
        </View>
    </View>
);

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        // Map this.props.reportName to the data for a specific report in the store, and bind it to the reportName property
        // It uses the data returned from the props path (ie. the reportID) to replace %DATAFROMPROPS% in the key it
        // binds to
        reportName: {
            key: `${IONKEYS.REPORT}_%DATAFROMPROPS%`,
            path: 'reportName',
            pathForProps: 'match.params.reportID',
        },
    }),
)(HeaderView);
