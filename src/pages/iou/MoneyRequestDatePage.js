import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import optionPropTypes from '../../components/optionPropTypes';
import NewDatePicker from '../../components/NewDatePicker';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        /** ID (iouType + reportID) of the request */
        id: PropTypes.string,

        /** Amount of the request */
        amount: PropTypes.number,

        /** Description of the request */
        comment: PropTypes.string,
        created: PropTypes.string,

        /** List of the participants */
        participants: PropTypes.arrayOf(optionPropTypes),
        receiptPath: PropTypes.string,
    }),

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
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        comment: '',
        created: '',
        participants: [],
        receiptPath: '',
    },
};

function MoneyRequestDatePage({iou, route}) {
    const {translate} = useLocalize();
    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');

    useEffect(() => {
        const moneyRequestId = `${iouType}${reportID}`;
        const shouldReset = iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (_.isEmpty(iou.participants) || (iou.amount === 0 && !iou.receiptPath) || shouldReset) {
            Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
        }
    }, [iou.id, iou.participants, iou.amount, iou.receiptPath, iouType, reportID]);

    function navigateBack() {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
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
        >
            <HeaderWithBackButton
                title={translate('common.date')}
                onBackButtonPress={() => navigateBack()}
            />
            <Form
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
            </Form>
        </ScreenWrapper>
    );
}

MoneyRequestDatePage.propTypes = propTypes;
MoneyRequestDatePage.defaultProps = defaultProps;

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
})(MoneyRequestDatePage);
