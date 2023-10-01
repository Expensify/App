import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import * as IOU from '../../../../libs/actions/IOU';
import NewDatePicker from '../../../../components/NewDatePicker';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';
import transactionPropTypes from '../../../../components/transactionPropTypes';

const propTypes = {
    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of iou (eg. scan/manual/distance) */
            iouType: PropTypes.string,

            /** The report ID of the IOU's report */
            reportID: PropTypes.string,

            /** The transaction ID of the IOU */
            transactionID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepDate({
    transaction,
    route: {
        params: {iouType, reportID, transactionID},
    },
}) {
    const {translate} = useLocalize();

    const goBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestCreated
     */
    const updateDate = (value) => {
        IOU.setMoneeRequestCreated(transactionID, value.moneyRequestCreated);
        goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={IOURequestStepDate.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.date')}
                onBackButtonPress={goBack}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={updateDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <NewDatePicker
                    inputID="moneyRequestCreated"
                    label={translate('common.date')}
                    defaultValue={transaction.created}
                    maxDate={new Date()}
                />
            </Form>
        </ScreenWrapper>
    );
}

IOURequestStepDate.propTypes = propTypes;
IOURequestStepDate.defaultProps = defaultProps;
IOURequestStepDate.displayName = 'IOURequestStepDate';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepDate);
