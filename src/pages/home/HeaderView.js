import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../styles/StyleSheet';
import IONKEYS from '../../IONKEYS';
import withIon from '../../components/withIon';
import {withRouter} from '../../libs/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
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
                <View style={[
                    styles.dFlex,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.flexGrow1,
                    styles.flexJustifySpaceBetween
                ]}
                >
                    <Text numberOfLines={2} style={[styles.navText]}>
                        {props.report.reportName}
                    </Text>
                    <View style={[styles.reportOptions, styles.flexRow]}>
                        <TouchableOpacity
                            onPress={() => togglePinnedState(parseInt(props.report.reportID, 10))}
                            style={[styles.touchableButtonImage, styles.mr0]}
                        >
                            <Image
                                resizeMode="contain"
                                source={props.report.isPinned ? pinEnabled : pinDisabled}
                                style={[styles.reportPinIcon]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
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
