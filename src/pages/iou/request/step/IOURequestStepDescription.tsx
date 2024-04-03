import {useFocusEffect} from '@react-navigation/native';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDescriptionOnyxProps = {
    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;

    /** The actions from the parent report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type IOURequestStepDescriptionProps = IOURequestStepDescriptionOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DESCRIPTION> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
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
}: IOURequestStepDescriptionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputRef = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && action === CONST.IOU.ACTION.EDIT;
    const currentDescription = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction?.comment.comment ?? '' : transaction?.comment.comment ?? '';
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
     * @returns - An object containing the errors for each inputID
     */
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM> => {
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

    const updateComment = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>) => {
        const newComment = value.moneyRequestComment.trim();

        // Only update comment if it has changed
        if (newComment === currentDescription) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            IOU.setDraftSplitTransaction(transaction?.transactionID ?? '0', {comment: newComment});
            navigateBack();
            return;
        }

        IOU.setMoneyRequestDescription(transaction?.transactionID ?? '0', newComment, action === CONST.IOU.ACTION.CREATE);

        if (action === CONST.IOU.ACTION.EDIT) {
            IOU.updateMoneyRequestDescription(transaction?.transactionID ?? '0', reportID, newComment, policy, policyTags, policyCategories);
        }

        navigateBack();
    };

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const reportAction = reportActions?.[report?.parentReportActionID || reportActionID] ?? null;
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
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

IOURequestStepDescription.displayName = 'IOURequestStepDescription';

const IOURequestStepDescriptionWithOnyx = withOnyx<IOURequestStepDescriptionProps, IOURequestStepDescriptionOnyxProps>({
    splitDraftTransaction: {
        key: ({route}) => {
            const transactionID = route?.params.transactionID ?? 0;
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
                reportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID ?? '0' : report?.parentReportID ?? '0';
            }
            return `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        },
        canEvict: false,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IOURequestStepDescription);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDescriptionWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDescriptionWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDescriptionWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDescriptionWithWritableReportOrNotFound);

export default IOURequestStepDescriptionWithFullTransactionOrNotFound;
