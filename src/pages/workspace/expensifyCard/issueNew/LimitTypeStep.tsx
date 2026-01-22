import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import ValuePicker from '@components/ValuePicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {getApprovalWorkflow} from '@libs/PolicyUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';

type LimitTypeStepProps = {
    // The policy that the card will be issued under
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Start from step index */
    startStepIndex: number;

    /** Array of step names */
    stepNames: readonly string[];
};

function LimitTypeStep({policy, stepNames, startStepIndex}: LimitTypeStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();

    const areApprovalsConfigured = getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;

    const [typeSelected, setTypeSelected] = useState(issueNewCard?.data?.limitType ?? defaultType);

    const isEditing = issueNewCard?.isEditing;

    const submit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
            const limit = convertToBackendAmount(Number(values?.limit));
            setIssueNewCardStepAndData({
                step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.EXPIRY_OPTIONS,
                data: {limitType: typeSelected, limit},
                isEditing: false,
                policyID,
            });
        },
        [isEditing, typeSelected, policyID],
    );

    const handleBackButtonPress = useCallback(() => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE, policyID});
    }, [isEditing, policyID]);

    const data = useMemo(() => {
        const options = [];

        if (areApprovalsConfigured) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                label: translate('workspace.card.issueNewCard.smartLimit'),
                description: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }

        options.push(
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                label: translate('workspace.card.issueNewCard.monthly'),
                description: translate('workspace.card.issueNewCard.monthlyDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                label: translate('workspace.card.issueNewCard.fixedAmount'),
                description: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
        );

        if (issueNewCard?.data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL && isBetaEnabled(CONST.BETAS.SINGLE_USE_AND_EXPIRE_BY_CARDS)) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                label: translate('workspace.card.issueNewCard.singleUse'),
                description: translate('workspace.card.issueNewCard.singleUseDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
            });
        }
        return options;
    }, [areApprovalsConfigured, isBetaEnabled, issueNewCard?.data?.cardType, translate, typeSelected]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT]);

            // We only want integers to be sent as the limit
            if (!Number(values.limit)) {
                errors.limit = translate('iou.error.invalidAmount');
            } else if (!Number.isInteger(Number(values.limit))) {
                errors.limit = translate('iou.error.invalidIntegerAmount');
            }

            if (Number(values.limit) > CONST.EXPENSIFY_CARD.LIMIT_VALUE) {
                errors.limit = translate('workspace.card.issueNewCard.cardLimitError');
            }
            return errors;
        },
        [translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID="LimitTypeStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                shouldHideFixErrorsAlert
                onSubmit={submit}
                style={[styles.flex1]}
                disablePressOnEnter={false}
                submitButtonStyles={[styles.mh5]}
                validate={validate}
                enabledWhenOffline
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseLimitType')}</Text>
                <InputWrapperWithRef
                    InputComponent={ValuePicker}
                    inputID={INPUT_IDS.LIMIT_TYPE}
                    label={translate('workspace.card.issueNewCard.chooseLimitType')}
                    value={typeSelected}
                    defaultValue={defaultType}
                    items={data}
                    onValueChange={(value) => {
                        setTypeSelected(value as CardLimitType);
                    }}
                    shouldShowModal={false}
                />

                <View style={[styles.threadDividerLine, styles.flexGrow0, styles.ml5, styles.mr5, styles.mv3]} />

                <View style={[styles.mt3, styles.mh5]}>
                    <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('workspace.card.issueNewCard.limitAmount')}</Text>
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        label={translate('workspace.card.issueNewCard.amount')}
                        defaultValue={convertToFrontendAmountAsString(issueNewCard?.data?.limit, issueNewCard?.data?.currency, false)}
                        isCurrencyPressable={false}
                        currency={issueNewCard?.data?.currency}
                        inputID={INPUT_IDS.LIMIT}
                        displayAsTextInput
                    />
                </View>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default LimitTypeStep;
