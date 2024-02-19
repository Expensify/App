import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import categoryPropTypes from '@components/categoryPropTypes';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import tagPropTypes from '@components/tagPropTypes';
import TextInput from '@components/TextInput';
import transactionPropTypes from '@components/transactionPropTypes';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import {policyPropTypes} from '@pages/workspace/withPolicy';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: transactionPropTypes,

    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: transactionPropTypes,

    /** The policy of the report */
    policy: policyPropTypes.policy,

    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /** The report currently being looked at */
    report: reportPropTypes,
};

const defaultProps = {
    transaction: {},
    splitDraftTransaction: {},
    policy: null,
    policyTags: null,
    policyCategories: null,
    report: {},
};

function IOURequestStepMerchant({
    route: {
        params: {transactionID, reportID, backTo, action, iouType},
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
    report,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const {merchant} = ReportUtils.getTransactionDetails(isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction);
    const isEmptyMerchant = merchant === '' || merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isMerchantRequired = ReportUtils.isGroupPolicy(report) || _.some(transaction.participants, (participant) => Boolean(participant.isPolicyExpenseChat));
    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const validate = useCallback(
        (value) => {
            const errors = {};

            if (isMerchantRequired && _.isEmpty(value.moneyRequestMerchant)) {
                errors.moneyRequestMerchant = 'common.error.fieldRequired';
            }

            return errors;
        },
        [isMerchantRequired],
    );

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestMerchant
     */
    const updateMerchant = (value) => {
        const newMerchant = value.moneyRequestMerchant.trim();

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transactionID, {merchant: newMerchant});
            navigateBack();
            return;
        }

        // In case the merchant hasn't been changed, do not make the API request.
        // In case the merchant has been set to empty string while current merchant is partial, do nothing too.
        if (newMerchant === merchant || (newMerchant === '' && merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) {
            navigateBack();
            return;
        }
        IOU.setMoneyRequestMerchant(transactionID, newMerchant, !isEditing);
        if (isEditing) {
            // When creating new money requests newMerchant can be blank so we fall back on PARTIAL_TRANSACTION_MERCHANT
            IOU.updateMoneyRequestMerchant(transactionID, reportID, newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, policy, policyTags, policyCategories);
        }
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepMerchant.displayName}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={updateMerchant}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        name={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        defaultValue={isEmptyMerchant ? '' : merchant}
                        maxLength={CONST.MERCHANT_NAME_MAX_LENGTH}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepMerchant.propTypes = propTypes;
IOURequestStepMerchant.defaultProps = defaultProps;
IOURequestStepMerchant.displayName = 'IOURequestStepMerchant';

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        splitDraftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
            },
        },
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        policyCategories: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
        },
        policyTags: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepMerchant);
