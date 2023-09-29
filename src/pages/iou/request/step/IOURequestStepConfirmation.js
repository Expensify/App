import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import reportPropTypes from '../../../reportPropTypes';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import styles from '../../../../styles/styles';
import * as TransactionUtils from '../../../../libs/TransactionUtils';
import Navigation from '../../../../libs/Navigation/Navigation';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The ID of the transaction being configured */
            transactionID: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    /** The full IOU report */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};
const defaultProps = {
    report: {},
    transaction: {},
};
function IOURequestStepConfirmation({transaction}) {
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const headerTitle = TransactionUtils.getHeaderTitle(translate, transaction);

    const navigateBack = (forceFallback = false) => {
        // Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.TYPE.REQUEST, transactionID, reportID), forceFallback);
    };

    const navigateToAddReceipt = () => {
        // Navigation.navigate(ROUTES.MONEY_REQUEST_RECEIPT.getRoute(iouType.current, reportID.current);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={IOURequestStepConfirmation.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                    />
                    <HeaderWithBackButton
                        title={headerTitle()}
                        onBackButtonPress={navigateBack}
                        shouldShowThreeDotsButton={TransactionUtils.isManualRequest(transaction)}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: translate('receipt.addReceipt'),
                                onSelected: navigateToAddReceipt,
                            },
                        ]}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepConfirmation.propTypes = propTypes;
IOURequestStepConfirmation.defaultProps = defaultProps;
IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

export default withOnyx({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID')}`,
    },
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepConfirmation);
