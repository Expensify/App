import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import {withRouter} from '../../libs/Router';
import LHNToggle from '../../../assets/images/icon-menu-toggle.png';
import {PinIcon} from '../../components/Expensicons';
import compose from '../../libs/compose';
import {togglePinnedState} from '../../libs/actions/Report';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onHamburgerButtonClicked: PropTypes.func.isRequired,

    // Decides whether we should show the hamburger menu button
    shouldShowHamburgerButton: PropTypes.bool.isRequired,

    /* Onyx Props */
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
                <View
                    style={[
                        styles.flex1,
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                    ]}
                >
                    <View
                        style={[styles.flex1]}
                    >
                        <Text
                            numberOfLines={2}
                            style={[styles.navText]}
                        >
                            {props.report.reportName}
                        </Text>
                    </View>

                    <View
                        style={[styles.reportOptions, styles.flexRow]}
                    >
                        <TouchableOpacity
                            onPress={() => togglePinnedState(props.report)}
                            style={[styles.touchableButtonImage, styles.mr0]}
                        >
                            <PinIcon height={20} width={20} isEnabled={props.report.isPinned} />
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
    withOnyx({
        report: {
            key: ({match}) => `${ONYXKEYS.COLLECTION.REPORT}${match.params.reportID}`,
        },
    }),
)(HeaderView);
