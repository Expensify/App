import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {getApprovalWorkflow} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

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

    const areApprovalsConfigured = getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;

    const [typeSelected, setTypeSelected] = useState(issueNewCard?.data?.limitType ?? defaultType);

    const isEditing = issueNewCard?.isEditing;

    const submit = useCallback(() => {
        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.LIMIT,
            data: {limitType: typeSelected},
            isEditing: false,
            policyID,
        });
    }, [isEditing, typeSelected, policyID]);

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
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }

        options.push(
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                text: translate('workspace.card.issueNewCard.monthly'),
                alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
        );

        return options;
    }, [areApprovalsConfigured, translate, typeSelected]);

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
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseLimitType')}</Text>
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => setTypeSelected(value)}
                data={data}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={typeSelected}
                shouldUpdateFocusedIndex
                alternateNumberOfSupportedLines={2}
                addBottomSafeAreaPadding
                footerContent={
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate(isEditing ? 'common.confirm' : 'common.next')}
                        onPress={submit}
                    />
                }
            />
        </InteractiveStepWrapper>
    );
}

export default LimitTypeStep;
