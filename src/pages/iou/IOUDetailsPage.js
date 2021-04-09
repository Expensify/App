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
import ButtonWithLoader from '../../components/ButtonWithLoader';
import ScreenWrapper from '../../components/ScreenWrapper';

const matchType = PropTypes.shape({
    params: PropTypes.shape({
        // iouReportID passed via route /iou/details/:iouReportID
        iouReportID: PropTypes.string,
    }),
});

const defaultProps = {
    iouReport: {},
    loading: false,
};

const propTypes = {
    /* Onyx Props */
    // Route params
    route: matchType.isRequired,

    // IOU Report data object
    iouReport: PropTypes.shape({
        // The total amount in cents
        total: PropTypes.number,
    }),

    loading: PropTypes.bool
};

class IOUDetailsPage extends Component {
    constructor(props) {
        super(props);

        this.performIOUSettlement = this.performIOUSettlement.bind(this);
    }

    performIOUSettlement() {
        this.setState({
            loading: true,
        });
    }

    render() {
        console.debug('jules: props: ', this.props);
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
                        {`\n\n${JSON.stringify(this.props.iouReport)}`}
                    </Text>
                    
                    {/* Reuse Preview Component here! */}
                    <ButtonWithLoader
                        text="I'll settle up elsewhere"
                        isLoading={this.props.loading}
                        onClick={this.performIOUSettlement}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

IOUDetailsPage.propTypes = propTypes;
IOUDetailsPage.displayName = 'IOUDetailsPage';
IOUDetailsPage.defaultProps = defaultProps;

export default withOnyx({
    iouReport: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${route.params.iouReportID}`,
    },
})(IOUDetailsPage);
