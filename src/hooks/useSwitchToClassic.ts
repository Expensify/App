/**
 * Records a switch to Expensify Classic from the exit survey and Troubleshoot, and opens Classic once the server has saved it.
 */
import Growl from '@libs/Growl';

import Navigation from '@navigation/Navigation';

import {clearSwitchToOldDotResult, switchToOldDot} from '@userActions/ExitSurvey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useState} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useOpenClassic from './useOpenClassic';

type UseSwitchToClassicOptions = {
    /** Whether the screen is a modal to close before Classic opens, because on desktop and native Classic opens in the browser and the app stays behind it */
    shouldDismissModal?: boolean;
};

type UseSwitchToClassic = {
    /** Records the switch with the exit survey response and opens Classic once the server has saved it */
    switchToClassic: (exitSurveyResponse: string | undefined) => void;

    /** Whether a switch started here is waiting for the server */
    isSwitchingToClassic: boolean;
};

function useSwitchToClassic({shouldDismissModal = false}: UseSwitchToClassicOptions = {}): UseSwitchToClassic {
    const {translate} = useLocalize();
    const openClassic = useOpenClassic();

    // Only the request started on this screen can open Classic or show an error here, so a switch from another tab doesn't act on it
    const [pendingRequestID, setPendingRequestID] = useState<string>();
    const [requestResult] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {
        selector: (form) => (pendingRequestID ? form?.switchToOldDotResults?.[pendingRequestID] : undefined),
    });

    // Classic opens only after the switch is saved, because Classic sends users who still prefer New Expensify back to it
    useEffect(() => {
        if (!pendingRequestID || !requestResult) {
            return;
        }

        clearSwitchToOldDotResult(pendingRequestID);
        // The request only finishes when its outcome arrives through Onyx, so the pending request can only be cleared in reaction to it
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPendingRequestID(undefined);
        if (requestResult === CONST.EXIT_SURVEY.SWITCH_RESULT.FAILED) {
            Growl.error({bodyText: translate('common.genericErrorMessage')});
            return;
        }
        if (shouldDismissModal) {
            Navigation.dismissModal();
        }
        openClassic();
    }, [pendingRequestID, requestResult, translate, openClassic, shouldDismissModal]);

    const switchToClassic = (exitSurveyResponse: string | undefined) => {
        setPendingRequestID(switchToOldDot(exitSurveyResponse));
    };

    return {switchToClassic, isSwitchingToClassic: !!pendingRequestID};
}

export default useSwitchToClassic;
