/**
 * Records a switch to Expensify Classic from the exit survey and Troubleshoot, and opens Classic once the server has saved it.
 */
import Growl from '@libs/Growl';

import {switchToOldDot} from '@userActions/ExitSurvey';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ExitSurveyResponseForm} from '@src/types/form/ExitSurveyResponseForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useEffect, useState} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useOpenClassic from './useOpenClassic';

type UseSwitchToClassic = {
    /** Records the switch with the exit survey response and opens Classic once the server has saved it */
    switchToClassic: (exitSurveyResponse: string | undefined) => void;

    /** Whether a switch started here is waiting for the server */
    isSwitchingToClassic: boolean;
};

const REQUEST_STATUS = {
    PENDING: 'pending',
    SAVED: 'saved',
    FAILED: 'failed',
} as const;

const SWITCH_STEP = {
    IDLE: 'idle',

    // switchToClassic was called, but its optimistic data hasn't reached this hook yet, so the form may still hold an earlier request's result
    SENDING: 'sending',

    // The form tracks the request started here
    SAVING: 'saving',
} as const;

/**
 * Reads the state of the latest SwitchToOldDot request from the form. Only the request's own data sets isLoading, so a form without it,
 * like one reset when the exit survey opens in another tab, says nothing about the request.
 */
function requestStatusSelector(form: OnyxEntry<ExitSurveyResponseForm>): ValueOf<typeof REQUEST_STATUS> | undefined {
    if (form?.isLoading === undefined) {
        return undefined;
    }
    if (form.isLoading) {
        return REQUEST_STATUS.PENDING;
    }
    return isEmptyObject(form.errors) ? REQUEST_STATUS.SAVED : REQUEST_STATUS.FAILED;
}

function useSwitchToClassic(): UseSwitchToClassic {
    const {translate} = useLocalize();
    const openClassic = useOpenClassic();
    const [requestStatus] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {selector: requestStatusSelector});

    // Local state rather than the persisted isLoading alone, so a request that never finished in an earlier session can't disable the buttons,
    // and a switch started in another tab doesn't navigate this one
    const [step, setStep] = useState<ValueOf<typeof SWITCH_STEP>>(SWITCH_STEP.IDLE);

    // Classic opens only after the switch is saved, because Classic sends users who still prefer New Expensify back to it.
    // The step returns to idle once the request finishes, so a later request from another tab can't act on this screen.
    useEffect(() => {
        if (step === SWITCH_STEP.SENDING && requestStatus === REQUEST_STATUS.PENDING) {
            // The step disables the buttons, and it has to wait for the Onyx update that the request's optimistic data triggers
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStep(SWITCH_STEP.SAVING);
            return;
        }
        if (step !== SWITCH_STEP.SAVING) {
            return;
        }
        if (requestStatus === REQUEST_STATUS.FAILED) {
            setStep(SWITCH_STEP.IDLE);
            Growl.error({bodyText: translate('common.genericErrorMessage')});
            return;
        }
        if (requestStatus === REQUEST_STATUS.SAVED) {
            setStep(SWITCH_STEP.IDLE);
            openClassic();
        }
    }, [step, requestStatus, translate, openClassic]);

    const switchToClassic = (exitSurveyResponse: string | undefined) => {
        setStep(SWITCH_STEP.SENDING);
        switchToOldDot(exitSurveyResponse);
    };

    return {switchToClassic, isSwitchingToClassic: step !== SWITCH_STEP.IDLE};
}

export default useSwitchToClassic;
