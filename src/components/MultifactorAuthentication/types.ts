/**
 * Type definitions for multifactor authentication components.
 */
import type {ValueOf} from 'type-fest';
import type {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import type CONST from '@src/CONST';
import type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationScenario} from './config/types';

/**
 * Authentication type name derived from secure store values.
 */
type AuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['NAME'];

type UseMultifactorAuthenticationStatus<T> = [MultifactorAuthenticationStatus<T>, SetMultifactorAuthenticationStatus<T>];

type NoScenarioForStatusReason = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON>;

type SetMultifactorAuthenticationStatus<T> = (
    partialStatus: MultifactorAuthenticationPartialStatus<T> | ((prevStatus: MultifactorAuthenticationStatus<T>) => MultifactorAuthenticationStatus<T>),
    scenario: MultifactorAuthenticationScenario | NoScenarioForStatusReason,
    customNotificationPaths?: Partial<NotificationPaths>,
) => MultifactorAuthenticationStatus<T>;

type NotificationPaths = {
    successNotification: AllMultifactorAuthenticationNotificationType;
    failureNotification: AllMultifactorAuthenticationNotificationType;
};

export type {SetMultifactorAuthenticationStatus, AuthTypeName, UseMultifactorAuthenticationStatus, NotificationPaths, NoScenarioForStatusReason};
