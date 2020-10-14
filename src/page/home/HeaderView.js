import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../style/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../lib/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
import starActive from '../../../assets/images/star-active.png';
import starInactive from '../../../assets/images/star-inactive.png';
import compose from '../../lib/compose';
import {togglePinnedState} from '../../lib/actions/Report';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    // Toggles the hamburger menu open and closed
    onHamburgerButtonClicked: PropTypes.func.isRequired,

    // Decides whether we should show the hamburger menu button
    shouldShowHamburgerButton: PropTypes.bool.isRequired,

    /* Ion Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // Value indicating if the report is pinned or not
        isPinned: PropTypes.bool,
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
                <>
                    <TouchableOpacity
                        onPress={() => togglePinnedState(parseInt(props.match.params.reportID, 10))}
                    >
                        <Image
                            resizeMode="contain"
                            source={props.report.isPinned ? starActive : starInactive}
                            style={[styles.reportPinIcon]}
                        />
                    </TouchableOpacity>
                    <Text numberOfLines={2} style={[styles.navText]}>
                        {props.report.reportName}
                    </Text>
                </>
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
