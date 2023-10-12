import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import moment from 'moment';
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
import StepScreenWrapper from './StepScreenWrapper';
import * as IOUUtils from '../../../../libs/IOUUtils';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import FormProvider from '../../../../components/Form/FormProvider';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestStepDate({
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEE_REQUEST_STEP.getRoute(iouType, CONST.IOU.REQUEST_STEPS.CONFIRMATION, transactionID, reportID), true);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestCreated
     */
    const updateDate = (value) => {
        IOU.setMoneeRequestCreated(transactionID, value.moneyRequestCreated);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.date')}
            onBackButtonPress={navigateBack}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper
            testID={IOURequestStepDate.displayName}
        >
            <FormProvider
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
                    maxDate={moment().add(1, 'year').toDate()}
                    minDate={moment().subtract(20, 'years').toDate()}
                />
            </FormProvider>
        </StepScreenWrapper>
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
