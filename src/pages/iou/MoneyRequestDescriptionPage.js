import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {iouPropTypes, iouDefaultProps} from './propTypes';
import TextInput from '../../components/TextInput';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import * as MoneyRequestUtils from '../../libs/MoneyRequestUtils';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import focusAndUpdateMultilineInputRange from '../../libs/focusAndUpdateMultilineInputRange';
import * as Browser from '../../libs/Browser';

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

function MoneyRequestDescriptionPage({iou, route, selectedTab}) {
    const {translate} = useLocalize();
    const inputRef = useRef(null);
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
            Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType, reportID), true);
        }
    }, [iou.id, iou.participants, iou.amount, iou.receiptPath, iouType, reportID, isDistanceRequest]);

    function navigateBack() {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    function updateComment(value) {
        IOU.setMoneyRequestDescription(value.moneyRequestComment);
        navigateBack();
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() => focusAndUpdateMultilineInputRange(inputRef.current)}
        >
            <HeaderWithBackButton
                title={translate('common.description')}
                onBackButtonPress={() => navigateBack()}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={(value) => updateComment(value)}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <TextInput
                        inputID="moneyRequestComment"
                        name="moneyRequestComment"
                        defaultValue={iou.comment}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        ref={(el) => (inputRef.current = el)}
                        autoGrowHeight
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        textAlignVertical="top"
                        submitOnEnter={!Browser.isMobile()}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

MoneyRequestDescriptionPage.propTypes = propTypes;
MoneyRequestDescriptionPage.defaultProps = defaultProps;

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestDescriptionPage);
