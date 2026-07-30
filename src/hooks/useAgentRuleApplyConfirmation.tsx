import CheckboxWithLabel from '@components/CheckboxWithLabel';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Text from '@components/Text';

import {getPolicyUnsubmittedExpenseCount} from '@userActions/Policy/Rules';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useThemeStyles from './useThemeStyles';

type UseAgentRuleApplyConfirmationResult = {
    /**
     * Runs the save confirmation flow for an agent rule. When the policy has unsubmitted expenses, a
     * confirmation modal offers to apply the rule to them; otherwise `onConfirm` is called right away.
     * `onConfirm` receives whether the rule should be applied to existing unsubmitted expenses, and is
     * not called when the modal is cancelled.
     */
    confirmAgentRuleSave: (onConfirm: (applyToExistingExpenses: boolean) => void) => void;
};

function ConfirmationPrompt({count, checkboxRef}: {count: number; checkboxRef: React.RefObject<boolean>}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isChecked, setIsChecked] = useState(false);

    return (
        <View style={styles.gap4}>
            <Text>{translate('workspace.rules.agentRules.saveConfirmation.prompt')}</Text>
            <CheckboxWithLabel
                accessibilityLabel={translate('workspace.rules.agentRules.saveConfirmation.applyToUnsubmittedExpenses', {count})}
                label={translate('workspace.rules.agentRules.saveConfirmation.applyToUnsubmittedExpenses', {count})}
                isChecked={isChecked}
                onInputChange={(value) => {
                    const checked = !!value;
                    setIsChecked(checked);
                    // eslint-disable-next-line no-param-reassign
                    checkboxRef.current = checked;
                }}
            />
        </View>
    );
}

/**
 * Confirmation flow shown before saving a new or edited agent rule, offering to apply the rule to the
 * policy's existing unsubmitted expenses. Fetches the unsubmitted expense count when the page mounts.
 */
export default function useAgentRuleApplyConfirmation(policyID: string): UseAgentRuleApplyConfirmationResult {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {isOffline} = useNetwork();
    const [unsubmittedExpenseCount] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_UNSUBMITTED_EXPENSE_COUNT}${policyID}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        getPolicyUnsubmittedExpenseCount(policyID);
    }, [policyID, isOffline]);

    const confirmAgentRuleSave = (onConfirm: (applyToExistingExpenses: boolean) => void) => {
        if (!unsubmittedExpenseCount) {
            onConfirm(false);
            return;
        }

        const checkboxRef = {current: false};

        showConfirmModal({
            title: translate('workspace.rules.agentRules.saveConfirmation.title'),
            confirmText: translate('common.save'),
            cancelText: translate('common.cancel'),
            prompt: (
                <ConfirmationPrompt
                    count={unsubmittedExpenseCount}
                    checkboxRef={checkboxRef}
                />
            ),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            onConfirm(checkboxRef.current);
        });
    };

    return {
        confirmAgentRuleSave,
    };
}
