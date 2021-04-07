import React, {Component} from 'react';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import ONYXKEYS from '../../ONYXKEYS';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // iouReportID passed via route /iou/details/:iouReportID
        iouReportID: PropTypes.string,
    }),
});

const propTypes = {
    /* Onyx Props */
    // ID for the iouReport that is displayed
    iouReportID: PropTypes.number,

    // Route params
    route: matchType.isRequired,
};

class IOUDetailsPage extends Component {
    constructor(props) {
        super(props);

        console.debug('jules: init ', this.props);
    }

    render() {
        console.debug('jules: route: ', this.props.route);
        console.debug('jules: iouReportID: ', this.props.route.params.iouReportID);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Details"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View
                    pointerEvents="box-none"
                    style={[
                        styles.detailsPageContainer,
                    ]}
                >
                    <Text style={[styles.formLabel, styles.mb2]}>
                        {`IOU Details: ${this.props.route.params.iouReportID}`}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }
}

IOUDetailsPage.propTypes = propTypes;
IOUDetailsPage.displayName = 'IOUDetailsPage';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(IOUDetailsPage);
