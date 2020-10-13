import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../style/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../libs/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
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
};

const defaultProps = {
    report: null,
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
            {props.report && props.report.reportName ? (
                <Text numberOfLines={2} style={[styles.navText]}>
                    {props.report.reportName}
                </Text>
            ) : null}
        </View>
    </View>
);

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        report: {
            key: ({match}) => `${IONKEYS.COLLECTION.REPORT}${match.params.reportID}`,
        },
    }),
)(HeaderView);
