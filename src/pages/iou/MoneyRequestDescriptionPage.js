import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as IOU from '@libs/actions/IOU';
import * as Browser from '@libs/Browser';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import updateMultilineInputRange from '@libs/UpdateMultilineInputRange';
import useThemeStyles from '@styles/useThemeStyles';
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
    selectedTab: PropTypes.oneOf(['', CONST.TAB.DISTANCE, CONST.TAB.MANUAL, CONST.TAB.SCAN]),
};

const defaultProps = {
    iou: iouDefaultProps,
    selectedTab: '',
};

function MoneyRequestDescriptionPage({iou, route, selectedTab}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');
    const isDistanceRequest = MoneyRequestUtils.isDistanceRequest(iouType, selectedTab);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

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
            testID={MoneyRequestDescriptionPage.displayName}
        >
            <>
                <HeaderWithBackButton
                    title={translate('common.description')}
                    onBackButtonPress={() => navigateBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                    onSubmit={(value) => updateComment(value)}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <InputWrapperWithRef
                            InputComponent={TextInput}
                            inputID="moneyRequestComment"
                            name="moneyRequestComment"
                            defaultValue={iou.comment}
                            label={translate('moneyRequestConfirmationList.whatsItFor')}
                            accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                inputRef.current = el;
                                updateMultilineInputRange(inputRef.current);
                            }}
                            autoGrowHeight
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                            inputStyle={[styles.verticalAlignTop]}
                            submitOnEnter={!Browser.isMobile()}
                        />
                    </View>
                </FormProvider>
            </>
        </ScreenWrapper>
    );
}

MoneyRequestDescriptionPage.propTypes = propTypes;
MoneyRequestDescriptionPage.defaultProps = defaultProps;
MoneyRequestDescriptionPage.displayName = 'MoneyRequestDescriptionPage';

export default withOnyx({
    iou: {
        key: ONYXKEYS.IOU,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(MoneyRequestDescriptionPage);
