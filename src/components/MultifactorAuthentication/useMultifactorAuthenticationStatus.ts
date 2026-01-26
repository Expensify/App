import {useRef, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import type {MultifactorAuthenticationTranslationParams} from '@src/languages/params';
import type {TranslationPaths} from '@src/languages/types';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_OUTCOME_MAP} from './config';
import {getAuthTypeName, getOutcomePaths, isValidScenario, shouldClearScenario, Status} from './helpers';
import type {SetMultifactorAuthenticationStatus, UseMultifactorAuthenticationStatus} from './types';

type MultifactorAuthenticationTranslate = <TPath extends TranslationPaths>(path: TPath, params: MultifactorAuthenticationTranslationParams) => string;

const {
    OUTCOMES: {failure},
} = MULTIFACTOR_AUTHENTICATION_DEFAULT_UI;

/**
 * Custom hook for managing multifactor authentication status state.
 * Handles status updates with scenario validation, outcome path generation, and success detection.
 * Uses refs to track previous status and success selector for optimization.
 * @param initialValue - The initial value for the status state.
 * @param successSelector - Optional function to determine success; defaults to checking wasRecentStepSuccessful.
 * @returns A tuple containing the current status and a function to update it.
 */
export default function useMultifactorAuthenticationStatus<T>(
    initialValue: T,
    successSelector?: (prevStatus: MultifactorAuthenticationPartialStatus<T>) => boolean,
): UseMultifactorAuthenticationStatus<T> {
    const {translate} = useLocalize();

    const defaultText = {
        headerTitle: translate(failure.headerTitle),
        title: translate(failure.title),
        description: translate(failure.description),
    };

    const [status, setStatusSource] = useState(() => Status.createEmptyStatus(initialValue, defaultText));

    const previousStatus = useRef(Status.createEmptyStatus(initialValue, defaultText));

    const successSource = useRef(successSelector);

    const setStatus: SetMultifactorAuthenticationStatus<T> = (partialStatus, potentialScenario, customOutcomePaths) => {
        const state = typeof partialStatus === 'function' ? partialStatus(previousStatus.current) : partialStatus;

        const success = successSource.current ? successSource.current(state) : !!state.step.wasRecentStepSuccessful;

        const typeName = getAuthTypeName(state);
        const previousScenario = previousStatus.current.scenario;

        const newScenario = isValidScenario(potentialScenario) ? potentialScenario : undefined;
        const scenario = newScenario ?? (shouldClearScenario(potentialScenario) ? undefined : previousScenario);
        const defaultOutcomePaths = getOutcomePaths(scenario);

        const {successOutcome: customSuccessOutcome, failureOutcome: customFailureOutcome} = customOutcomePaths ?? {};

        const outcomePaths = {
            successOutcome: customSuccessOutcome ?? defaultOutcomePaths.successOutcome,
            failureOutcome: customFailureOutcome ?? defaultOutcomePaths.failureOutcome,
        };

        const outcomeType = success ? 'successOutcome' : 'failureOutcome';

        const {headerTitle: headerTitleTPath, title: titleTPath, description: descriptionTPath} = MULTIFACTOR_AUTHENTICATION_OUTCOME_MAP[outcomePaths[outcomeType]];

        const translateMFA = translate as MultifactorAuthenticationTranslate;
        const translationParameters = {
            authType: typeName,
        };

        const headerTitle = translateMFA(headerTitleTPath, translationParameters);
        const title = translateMFA(titleTPath, translationParameters);
        const description = translateMFA(descriptionTPath, translationParameters);

        const createdStatus = {
            ...state,
            scenario,
            typeName,
            headerTitle,
            title,
            description,
            outcomePaths,
        };

        setStatusSource(createdStatus);
        previousStatus.current = createdStatus;

        return createdStatus;
    };

    return [status, setStatus];
}
