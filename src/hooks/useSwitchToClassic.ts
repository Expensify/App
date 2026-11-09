/**
 * Records a switch to Expensify Classic from the exit survey and Troubleshoot, and opens Classic once the server has saved it.
 */
import Growl from '@libs/Growl';

import {switchToOldDot} from '@userActions/ExitSurvey';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ExitSurveyResponseForm} from '@src/types/form/ExitSurveyResponseForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useState} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useOpenClassic from './useOpenClassic';
import usePrevious from './usePrevious';

type UseSwitchToClassic = {
    /** Records the switch with the exit survey response and opens Classic once the server has saved it */
    switchToClassic: (exitSurveyResponse: string | undefined) => void;

    /** Whether a switch started here is waiting for the server */
    isSwitchingToClassic: boolean;
};

const isLoadingSelector = (form: OnyxEntry<ExitSurveyResponseForm>) => !!form?.isLoading;

const hasErrorsSelector = (form: OnyxEntry<ExitSurveyResponseForm>) => !isEmptyObject(form?.errors);

function useSwitchToClassic(): UseSwitchToClassic {
    const {translate} = useLocalize();
    const openClassic = useOpenClassic();
    const [isLoading = false] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {selector: isLoadingSelector});
    const [hasErrors = false] = useOnyx(ONYXKEYS.FORMS.EXIT_SURVEY_RESPONSE_FORM, {selector: hasErrorsSelector});

    // Local state rather than the persisted isLoading alone, so a request that never finished in an earlier session can't disable the buttons,
    // and a switch started in another tab doesn't navigate this one
    const [hasRequestedSwitch, setHasRequestedSwitch] = useState(false);
    const wasLoading = usePrevious(isLoading);

    // Classic opens only after SwitchToOldDot is saved. Otherwise Classic can read the old tryNewDot NVP, set the experience cookie back to
    // `new` and route the user back to New Expensify. wasLoading with !isLoading holds only in the render where the request finishes, so this runs once per request.
    useEffect(() => {
        if (!hasRequestedSwitch || !wasLoading || isLoading) {
            return;
        }
        if (hasErrors) {
            Growl.error({bodyText: translate('common.genericErrorMessage')});
            return;
        }
        openClassic();
    }, [hasRequestedSwitch, wasLoading, isLoading, hasErrors, translate, openClassic]);

    const switchToClassic = (exitSurveyResponse: string | undefined) => {
        setHasRequestedSwitch(true);
        switchToOldDot(exitSurveyResponse);
    };

    return {switchToClassic, isSwitchingToClassic: hasRequestedSwitch && isLoading};
}

export default useSwitchToClassic;
