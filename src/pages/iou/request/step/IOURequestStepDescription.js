import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import categoryPropTypes from '@components/categoryPropTypes';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import tagPropTypes from '@components/tagPropTypes';
import TextInput from '@components/TextInput';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policyPropTypes} from '@src/pages/workspace/withPolicy';
import INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
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

    /** The actions from the parent report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,

        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,

    /** The report attached to the transaction */
    report: reportPropTypes,
};

const defaultProps = {
    transaction: {},
    splitDraftTransaction: {},
    policy: null,
    policyTags: null,
    policyCategories: null,
    reportActions: {},
    report: {},
};

function IOURequestStepDescription({
    route: {
        params: {action, iouType, reportID, backTo, reportActionID},
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
    reportActions,
    session,
    report,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef(null);
    const focusTimeoutRef = useRef(null);
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && action === CONST.IOU.ACTION.EDIT;
    const currentDescription =
        isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? lodashGet(splitDraftTransaction, 'comment.comment', '') : lodashGet(transaction, 'comment.comment', '');
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

    /**
     * @param {Object} values
     * @param {String} values.title
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const errors = {};

        if (values.moneyRequestComment.length > CONST.DESCRIPTION_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'moneyRequestComment', [
                'common.error.characterLimitExceedCounter',
                {length: values.moneyRequestComment.length, limit: CONST.DESCRIPTION_LIMIT},
            ]);
        }

        return errors;
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    const updateComment = (value) => {
        const newComment = value.moneyRequestComment.trim();

        // Only update comment if it has changed
        if (newComment === currentDescription) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transaction.transactionID, {comment: newComment});
            navigateBack();
            return;
        }

        IOU.setMoneyRequestDescription(transaction.transactionID, newComment, action === CONST.IOU.ACTION.CREATE);

        if (action === CONST.IOU.ACTION.EDIT) {
            IOU.updateMoneyRequestDescription(transaction.transactionID, reportID, newComment, policy, policyTags, policyCategories);
        }

        navigateBack();
    };

    const reportAction = reportActions[report.parentReportActionID || reportActionID];
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isEditing && (isSplitBill ? !canEditSplitBill : !ReportUtils.canEditMoneyRequest(reportAction));
    return (
        <StepScreenWrapper
            headerTitle={translate('common.description')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepDescription.displayName}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={updateComment}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapperWithRef
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MONEY_REQUEST_COMMENT}
                        name={INPUT_IDS.MONEY_REQUEST_COMMENT}
                        defaultValue={currentDescription}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={(el) => {
                            if (!el) {
                                return;
                            }
                            inputRef.current = el;
                            updateMultilineInputRange(inputRef.current);
                        }}
                        autoGrowHeight
                        containerStyles={[styles.autoGrowHeightMultilineInput]}
                        shouldSubmitForm
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepDescription.propTypes = propTypes;
IOURequestStepDescription.defaultProps = defaultProps;
IOURequestStepDescription.displayName = 'IOURequestStepDescription';

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
        reportActions: {
            key: ({
                report,
                route: {
                    params: {action, iouType},
                },
            }) => {
                let reportID = '0';
                if (action === CONST.IOU.ACTION.EDIT) {
                    reportID = iouType === CONST.IOU.TYPE.SPLIT ? report.reportID : report.parentReportID;
                }
                return `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
            },
            canEvict: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(IOURequestStepDescription);
