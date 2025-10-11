import {useCallback, useMemo, useRef, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import {getAuthTypeName} from './helpers';
import {BiometricsPartialStatus, BiometricsStatus, BiometricsStatusKeyType, SetBiometricsStatus, UseBiometricsStatus} from './types';

/**
 * A hook that manages biometrics status state and messaging.
 *
 * Acts as middleware to format biometrics-related messages into a consistent, readable format.
 * This allows the main biometrics hook to focus solely on biometric operations.
 *
 * Returns the current biometrics status and a setter function. The status includes
 * success/failure messages, titles, and authentication details for both challenge
 * and key-related scenarios.
 *
 * Must be implemented as a hook rather than a function to handle message translations.
 */
export default function useBiometricsStatus<T>(
    initialValue: T,
    type: BiometricsStatusKeyType,
    successSelector?: (prevStatus: BiometricsPartialStatus<T>) => boolean,
): UseBiometricsStatus<T> {
    const {translate} = useLocalize();

    const notRequestedText = useMemo(() => translate('biometrics.reason.generic.notRequested'), [translate]);

    /** Initial empty status used when no biometric scenario has been attempted */
    const emptyAuth = useMemo<BiometricsStatus<T>>(
        () => ({
            reason: 'biometrics.reason.generic.notRequested',
            message: notRequestedText,
            title: notRequestedText,
            value: initialValue,
            step: {
                wasRecentStepSuccessful: undefined,
                requiredFactorForNextStep: undefined,
                isRequestFulfilled: true,
            },
        }),
        [initialValue, notRequestedText],
    );

    /**
     * State for the current biometrics status.
     */
    const [statusSource, setStatusSource] = useState(emptyAuth);

    /**
     * Reference to the previous status source.
     */
    const previousStatus = useRef(emptyAuth);

    /**
     * Reference to the success selector function.
     * Stored in a ref to avoid re-creating it on every render.
     */
    const successSource = useRef(successSelector);

    /** Creates a formatted status object based on authentication data and result */
    const createStatus = useCallback(
        (partialStatus: BiometricsPartialStatus<T>, success: boolean, authorize?: boolean): BiometricsStatus<T> => {
            const {reason} = partialStatus;
            const typeName = getAuthTypeName(partialStatus);
            const message = translate(reason);
            const statusType = success ? 'success' : 'failed';

            return {
                ...partialStatus,
                typeName,
                message: translate(`biometrics.statusMessage.${statusType}Message`, authorize, success ? typeName : message),
                title: translate(`biometrics.statusMessage.${statusType}Title`, authorize),
            };
        },
        [translate],
    );

    /** Current biometrics status with fallback to not-requested state if undefined */
    const status = useMemo(
        () => ({
            ...statusSource,
            message: statusSource.message ?? notRequestedText,
            title: statusSource.title ?? notRequestedText,
        }),
        [statusSource, notRequestedText],
    );

    /**
     * Updates the biometrics status state. Can accept either a new status object directly
     * or a function to transform the existing status. Returns the newly set status
     * for immediate use, though the status value from the hook can be used for reactive updates.
     */
    const setStatus: SetBiometricsStatus<T> = useCallback(
        (partialStatus) => {
            const isChallengeType = type === CONST.BIOMETRICS.SCENARIO_TYPE.AUTHORIZATION;
            const state = typeof partialStatus === 'function' ? partialStatus(previousStatus.current) : partialStatus;

            const success = successSource.current ? successSource.current(state) : !!state.step.wasRecentStepSuccessful;

            const createdStatus = createStatus(state, success, isChallengeType);

            setStatusSource(createdStatus);
            previousStatus.current = createdStatus;

            return createdStatus;
        },
        [type, createStatus],
    );

    return [status, setStatus];
}
