import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import Icon from '@components/Icon';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import ValuePicker from '@components/ValuePicker';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {getDefaultExpensifyCardLimitType} from '@libs/CardUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {canMemberRead, getApprovalWorkflow, isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';
import KeyboardUtils from '@src/utils/keyboard';

import type {OnyxEntry} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type LimitTypeStepProps = {
    /** The policy that the card will be issued under */
    policy: OnyxEntry<OnyxTypes.Policy>;

    startStepIndex: number;
    stepNames: readonly string[];
};

function LimitTypeStep({policy, stepNames, startStepIndex}: LimitTypeStepProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

    const policyID = policy?.id;
    const formRef = useRef<FormRef | null>(null);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    // Only link to the Workflows page when the current user can actually read it. Card admins without Workflows
    // access would otherwise be dropped onto the Not Found page. When they lack access, render plain (non-linked) text.
    const canReadWorkflows = canMemberRead(policy, currentUserLogin ?? '', CONST.POLICY.POLICY_FEATURE.WORKFLOWS);

    const areApprovalsConfigured = getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultType = getDefaultExpensifyCardLimitType(policy);

    const [typeSelected, setTypeSelected] = useState(issueNewCard?.data?.limitType ?? defaultType);

    const isEditing = issueNewCard?.isEditing;
    const areSpendRulesAvailable = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED, policyCategories);

    let nextStep;
    if (isEditing) {
        nextStep = CONST.EXPENSIFY_CARD.STEP.CONFIRMATION;
    } else if (areSpendRulesAvailable || issueNewCard?.data.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL) {
        nextStep = CONST.EXPENSIFY_CARD.STEP.SPEND_RULES;
    } else {
        nextStep = CONST.EXPENSIFY_CARD.STEP.CARD_NAME;
    }

    const onInputFocus = () => {
        formRef.current?.scrollToEnd();
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        KeyboardUtils.dismiss().then(() => {
            const limit = convertToBackendAmount(Number(values?.limit));
            setIssueNewCardStepAndData({
                step: nextStep,
                data: {limitType: typeSelected, limit},
                isEditing: false,
                policyID,
            });
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE, policyID});
    };

    const workspaceWorkflowsPageURL = canReadWorkflows ? `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID, CONST.TAB.WORKFLOWS.APPROVALS)}` : undefined;

    const options = [];
    options.push({
        value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
        label: translate('workspace.card.issueNewCard.smartLimit'),
        description: areApprovalsConfigured ? translate('workspace.card.issueNewCard.smartLimitDescription') : undefined,
        alternateTextComponent: areApprovalsConfigured ? undefined : <RenderHTML html={translate('workspace.card.issueNewCard.smartLimitDisabledDescription', workspaceWorkflowsPageURL)} />,
        rightElement: areApprovalsConfigured ? undefined : (
            <Icon
                src={expensifyIcons.Lock}
                fill={theme.icon}
            />
        ),
        shouldHideSelectionButton: !areApprovalsConfigured,
        keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
        isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
        isDisabled: !areApprovalsConfigured,
        titleStyles: areApprovalsConfigured
            ? undefined
            : {
                  color: theme.heading,
              },
    });
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
    if (issueNewCard?.data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL) {
        options.push({
            value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
            label: translate('workspace.card.issueNewCard.singleUse'),
            description: translate('workspace.card.issueNewCard.singleUseDescription'),
            keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
            isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
        });
    }
    const data = options;

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.LIMIT], translate);

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
    };

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
                submitButtonStyles={[styles.mh5]}
                validate={validate}
                enabledWhenOffline
                addBottomSafeAreaPadding
                ref={formRef}
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
                    addBottomSafeAreaPadding={false}
                    disableKeyboardShortcuts
                    alternateNumberOfSupportedLines={2}
                />

                <View style={[styles.threadDividerLine, styles.flexGrow0, styles.ml5, styles.mr5, styles.mv3]} />

                <View style={[styles.mt3, styles.mh5]}>
                    <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('workspace.card.issueNewCard.limitAmount')}</Text>
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        label={translate('workspace.card.issueNewCard.amount')}
                        defaultValue={convertToFrontendAmountAsString(issueNewCard?.data?.limit, 0)}
                        isCurrencyPressable={false}
                        currency={issueNewCard?.data?.currency}
                        inputID={INPUT_IDS.LIMIT}
                        displayAsTextInput
                        onFocus={onInputFocus}
                    />
                </View>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default LimitTypeStep;
