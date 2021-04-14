import React, {Component} from 'react';
import _ from 'underscore';
import {
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import TransactionItem from '../../components/TransactionItem';
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

class IOUDetailsModal extends Component {
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
                    {_.map(this.props.iouReport.transactions, (transaction) => (
                        <TransactionItem transaction={transaction} />
                    ))}
                    
                    {/* Reuse Preview Component here? */}

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

IOUDetailsModal.propTypes = propTypes;
IOUDetailsModal.displayName = 'IOUDetailsModal';
IOUDetailsModal.defaultProps = defaultProps;

export default withOnyx({
    iouReport: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IOUS}${route.params.iouReportID}`,
    },
})(IOUDetailsModal);
