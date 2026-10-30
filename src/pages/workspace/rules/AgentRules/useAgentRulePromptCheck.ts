/**
 * Checks with Concierge whether RuleBot can carry out an agent rule that the admin wrote, before the rule saves. An
 * `impossible` answer stops the save and returns the refusal. A save after the refusal, or any other answer, saves the rule.
 */
import type {FormRef} from '@components/Form/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import Log from '@libs/Log';

import {checkAgentRulePrompt, stopAgentRuleCheckLoading} from '@userActions/Policy/Rules';
import type {AgentRuleFormID} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ADD_AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type EDIT_AGENT_RULE_INPUT_IDS from '@src/types/form/EditAgentRuleForm';

import type {RefObject} from 'react';

import {useEffect, useRef, useState} from 'react';

const PROMPT_INPUT_ID = ADD_AGENT_RULE_INPUT_IDS.PROMPT satisfies typeof EDIT_AGENT_RULE_INPUT_IDS.PROMPT;

type UseAgentRulePromptCheckParams = {
    policyID: string;

    /** The form that shows the loading state during the check */
    formID: AgentRuleFormID;

    /** The form that shows the suggested rule when the admin tries it */
    formRef: RefObject<FormRef | null>;

    /** A rule with this text saves without a check, because Concierge already wrote it or the admin saved it before */
    checkedPrompt?: string;

    /** Saves the rule with this text */
    savePrompt: (prompt: string) => void;
};

type PendingCheck = {
    generationID: string;
    prompt: string;
};

function useAgentRulePromptCheck({policyID, formID, formRef, checkedPrompt, savePrompt}: UseAgentRulePromptCheckParams) {
    const {isOffline} = useNetwork();
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [isChecking = false] = useOnyx(formID, {selector: (form) => !!form?.isLoading});
    const pendingCheckRef = useRef<PendingCheck>(undefined);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [checkGenerationID, setCheckGenerationID] = useState<string>();
    const generatedRuleID = generatedRule?.generationID;
    const generatedRuleState = generatedRule?.state;
    const generatedRuleReason = generatedRule?.reason;
    const refusal = generatedRuleState === CONST.GENERATED_RULE.STATE.IMPOSSIBLE && !!generatedRuleID && generatedRuleID === checkGenerationID ? generatedRule : undefined;

    const finishCheck = () => {
        pendingCheckRef.current = undefined;
        clearTimeout(timeoutRef.current);
        stopAgentRuleCheckLoading(formID);
    };

    useEffect(() => {
        const pendingCheck = pendingCheckRef.current;
        if (!pendingCheck || !generatedRuleState || generatedRuleID !== pendingCheck.generationID) {
            return;
        }
        finishCheck();
        if (generatedRuleState === CONST.GENERATED_RULE.STATE.IMPOSSIBLE) {
            Log.info('[GenerateRule] Warned about an agent rule before it saved', false, {policyID, generationID: generatedRuleID, reason: generatedRuleReason});
            return;
        }
        savePrompt(pendingCheck.prompt);
    }, [finishCheck, generatedRuleID, generatedRuleReason, generatedRuleState, policyID, savePrompt]);

    // The loading state stays in Onyx. Stop it when the admin leaves during a check, so that the form does not open loading.
    useEffect(
        () => () => {
            clearTimeout(timeoutRef.current);
            if (!pendingCheckRef.current) {
                return;
            }
            stopAgentRuleCheckLoading(formID);
        },
        [formID],
    );

    const startCheck = (prompt: string) => {
        const generationID = checkAgentRulePrompt(formID, policyID, prompt);
        pendingCheckRef.current = {generationID, prompt};
        setCheckGenerationID(generationID);

        // The rule must still save when the answer never arrives
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (pendingCheckRef.current?.generationID !== generationID) {
                return;
            }
            Log.info('[GenerateRule] Saved an agent rule without an answer to its check', false, {policyID, generationID});
            finishCheck();
            savePrompt(prompt);
        }, CONST.GENERATED_RULE.AGENT_RULE_CHECK_TIMEOUT_MS);
    };

    /** Saves the rule, after a check when the admin wrote or changed the text */
    const checkThenSavePrompt = (prompt: string) => {
        if (refusal) {
            Log.info('[GenerateRule] Saved an agent rule after a warning', false, {policyID, generationID: refusal.generationID, reason: refusal.reason});
            setCheckGenerationID(undefined);
            savePrompt(prompt);
            return;
        }
        const isUnchanged = !!checkedPrompt && prompt.trim() === checkedPrompt.trim();
        if (isUnchanged || isOffline) {
            savePrompt(prompt);
            return;
        }
        startCheck(prompt);
    };

    /** Shows the suggested rule of the refusal in place of the admin's text, and checks it */
    const trySuggestedPrompt = (suggestedPrompt: string) => {
        Log.info('[GenerateRule] Tried the suggested description', false, {policyID, generationID: refusal?.generationID, reason: refusal?.reason});
        formRef.current?.resetForm({[PROMPT_INPUT_ID]: suggestedPrompt});

        // Start the check after the reset, so that a text change from the reset cannot stop it
        startCheck(suggestedPrompt);
    };

    /**
     * Stops a running check and hides the refusal when the admin changes the text. A running check must not save the text
     * from before the change, so the admin saves again to check the new text.
     */
    const resetCheck = () => {
        setCheckGenerationID(undefined);
        if (!pendingCheckRef.current) {
            return;
        }
        Log.info('[GenerateRule] Stopped an agent rule check after the text changed', false, {policyID, generationID: pendingCheckRef.current.generationID});
        finishCheck();
    };

    return {refusal, isChecking, checkThenSavePrompt, trySuggestedPrompt, resetCheck};
}

export default useAgentRulePromptCheck;
