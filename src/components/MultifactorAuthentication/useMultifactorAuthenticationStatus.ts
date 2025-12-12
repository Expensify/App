import {useCallback, useMemo, useRef, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import {getAuthTypeName, Status} from './helpers';
import type {MultifactorAuthenticationStatusKeyType, SetMultifactorAuthenticationStatus, UseMultifactorAuthenticationStatus} from './types';

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
    type: MultifactorAuthenticationStatusKeyType,
    successSelector?: (prevStatus: MultifactorAuthenticationPartialStatus<T>) => boolean,
): UseMultifactorAuthenticationStatus<T> {
    const {translate} = useLocalize();

    const defaultText = useMemo(() => translate('multifactorAuthentication.reason.generic.notRequested'), [translate]);

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
    const setStatus: SetMultifactorAuthenticationStatus<T> = useCallback(
        (partialStatus, overwriteType) => {
            const state = typeof partialStatus === 'function' ? partialStatus(previousStatus.current) : partialStatus;
            const scenarioType = overwriteType ?? type;

            const success = successSource.current ? successSource.current(state) : !!state.step.wasRecentStepSuccessful;

            const isAuthorization = scenarioType === CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION;

            const isAuthentication = scenarioType === CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION;
            const isAuthAction = isAuthentication || isAuthorization;

            const typeName = getAuthTypeName(state);
            const statusType = success ? 'success' : 'failed';
            const originalMessage = translate(state.reason);

            const title = isAuthAction
                ? translate(`multifactorAuthentication.statusMessage.${statusType}Title`, {authorization: isAuthorization})
                : translate(`multifactorAuthentication.statusMessage.${statusType}TitleGeneral`);

            const message = isAuthAction
                ? translate(`multifactorAuthentication.statusMessage.${statusType}Message`, {authorization: isAuthorization, because: success ? typeName : originalMessage})
                : originalMessage;

            const createdStatus = {
                ...state,
                typeName,
                message,
                title,
            };

            setStatusSource(createdStatus);
            previousStatus.current = createdStatus;

            return createdStatus;
        },
        [translate, type],
    );

    return [status, setStatus];
}
