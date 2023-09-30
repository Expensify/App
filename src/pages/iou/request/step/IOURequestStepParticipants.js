import React, {useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSelector from '../../steps/MoneyRequstParticipantsPage/MoneeRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as IOU from '../../../../libs/actions/IOU';
import useLocalize from '../../../../hooks/useLocalize';
import transactionPropTypes from '../../../../components/transactionPropTypes';
import * as TransactionUtils from '../../../../libs/TransactionUtils';

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

        /** The current route path */
        path: PropTypes.string,
    }).isRequired,

    /* Onyx Props */
    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepParticipants({route: {path}, transaction, transaction: {transactionID, reportID, participants}}) {
    const {translate} = useLocalize();
    const optionsSelectorRef = useRef();
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const headerTitle = TransactionUtils.getHeaderTitle(translate, transaction);

    const goToNextStep = () => {
        Navigation.navigate(ROUTES.MONEE_REQUEST_CONFIRMATION_STEP.getRoute(CONST.IOU.TYPE.REQUEST, transactionID, reportID, path));
    };

    const navigateBack = (forceFallback = false) => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.TYPE.REQUEST, transactionID, reportID), forceFallback);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
            testID={IOURequestStepParticipants.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                    />
                    <MoneyRequestParticipantsSelector
                        ref={(el) => (optionsSelectorRef.current = el)}
                        participants={participants}
                        onParticipantsAdded={(val) => IOU.setMoneeRequestParticipants(transactionID, val)}
                        onFinish={goToNextStep}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        iouType={CONST.IOU.TYPE.REQUEST}
                        iouRequestType={iouRequestType}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepParticipants.displayName = 'IOURequestStepParticipants';
IOURequestStepParticipants.propTypes = propTypes;
IOURequestStepParticipants.defaultProps = defaultProps;

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepParticipants);
