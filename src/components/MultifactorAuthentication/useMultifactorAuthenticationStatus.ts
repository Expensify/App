import {useRef, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import type {MultifactorAuthenticationTranslationParams} from '@src/languages/params';
import type {TranslationPaths} from '@src/languages/types';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI} from './config';
import {getAuthTypeName, Status} from './helpers';
import type {SetMultifactorAuthenticationStatus, UseMultifactorAuthenticationStatus} from './types';

type MultifactorAuthenticationTranslate = <TPath extends TranslationPaths>(path: TPath, params: MultifactorAuthenticationTranslationParams) => string;

const {
    NOTIFICATIONS: {failure},
} = MULTIFACTOR_AUTHENTICATION_DEFAULT_UI;

/**
 * A hook that manages multifactorial authentication status state and messaging.
 *
 * Acts as middleware to format multifactorial authentication-related messages into a consistent, readable format.
 * This allows the main multifactorial authentication hook to focus solely on multifactorial authentication operations.
 *
 * Returns the current multifactorial authentication status and a setter function. The status includes
 * success/failure messages, titles, and authentication details for both challenge
 * and key-related scenarios.
 *
 * Must be implemented as a hook rather than a function to handle message translations.
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

    /**
     * State for the current multifactorial authentication status.
     */
    const [status, setStatusSource] = useState(() => Status.createEmptyStatus(initialValue, defaultText));

    /**
     * Reference to the previous status source.
     */
    const previousStatus = useRef(Status.createEmptyStatus(initialValue, defaultText));

    /**
     * Reference to the success selector function.
     * Stored in a ref to avoid re-creating it on every render.
     */
    const successSource = useRef(successSelector);

    /**
     * Updates the multifactorial authentication status state. Can accept either a new status object directly
     * or a function to transform the existing status. Returns the newly set status
     * for immediate use, though the status value from the hook can be used for reactive updates.
     */
    const setStatus: SetMultifactorAuthenticationStatus<T> = (partialStatus) => {
        const state = typeof partialStatus === 'function' ? partialStatus(previousStatus.current) : partialStatus;

        const success = successSource.current ? successSource.current(state) : !!state.step.wasRecentStepSuccessful;

        const typeName = getAuthTypeName(state);
        const statusType = success ? 'success' : 'failure';

        // TODO: MFA/Dev here the title and message should be retrieved from the UI config, but we do not know the scenario
        // const {headerTitle: headerTitleTPath, title: titleTPath, description: descriptionTPah} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[SCENARIO]

        const {headerTitle: headerTitleTPath, title: titleTPath, description: descriptionTPath} = MULTIFACTOR_AUTHENTICATION_DEFAULT_UI.NOTIFICATIONS[statusType];

        const translateMFA = translate as MultifactorAuthenticationTranslate;
        const translationParameters = {
            authType: typeName,
        };

        const headerTitle = translateMFA(headerTitleTPath, translationParameters);
        const title = translateMFA(titleTPath, translationParameters);
        const description = translateMFA(descriptionTPath, translationParameters);

        const createdStatus = {
            ...state,
            typeName,
            headerTitle,
            title,
            description,
        };

        setStatusSource(createdStatus);
        previousStatus.current = createdStatus;

        return createdStatus;
    };

    return [status, setStatus];
}
