import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NewDatePicker from '@components/NewDatePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {iouDefaultProps, iouPropTypes} from './propTypes';

const propTypes = {
    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,

            /** Which field we are editing */
            field: PropTypes.string,

            /** reportID for the "transaction thread" */
            threadReportID: PropTypes.string,
        }),
    }).isRequired,

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab: PropTypes.oneOf([CONST.TAB.DISTANCE, CONST.TAB.MANUAL, CONST.TAB.SCAN]).isRequired,
};

const defaultProps = {
    iou: iouDefaultProps,
};

function MoneyRequestDatePage({iou, route, selectedTab}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType, selectedTab);

    useEffect(() => {
        const moneyRequestId = `${iouType}${reportID}`;
        const shouldReset = iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (!isDistanceRequest && (_.isEmpty(iou.participants) || (iou.amount === 0 && !iou.receiptPath) || shouldReset)) {
            Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID), true);
        }
    }, [iou.id, iou.participants, iou.amount, iou.receiptPath, iouType, reportID, isDistanceRequest]);

    function navigateBack() {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestCreated
     */
    function updateDate(value) {
        IOU.setMoneyRequestCreated(value.moneyRequestCreated);
        navigateBack();
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MoneyRequestDatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.date')}
                onBackButtonPress={() => navigateBack()}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={(value) => updateDate(value)}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <NewDatePicker
                    inputID="moneyRequestCreated"
                    label={translate('common.date')}
                    defaultValue={iou.created}
                    maxDate={new Date()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

MoneyRequestDatePage.propTypes = propTypes;
MoneyRequestDatePage.defaultProps = defaultProps;
MoneyRequestDatePage.displayName = 'MoneyRequestDatePage';

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestDatePage);
