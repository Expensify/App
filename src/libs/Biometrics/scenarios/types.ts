import {ValueOf} from 'type-fest';
import {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import {BiometricsScenarioParameters, biometricsScenarioRequiredFactors, biometricsScenarios} from '@libs/Biometrics/scenarios';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';

/**
 * Core type definitions for biometrics functionality
 */

/**
 * Represents a specific biometrics scenario from the constants
 */
type BiometricsScenario = ValueOf<typeof CONST.BIOMETRICS.SCENARIO>;

/**
 * Represents a specific biometric factor from the constants
 */
type BiometricsFactor = ValueOf<typeof CONST.BIOMETRICS.FACTORS>;

/**
 * Maps biometric scenarios to their required factors
 */
type BiometricsRequiredFactorsRecord = Record<BiometricsScenario, readonly BiometricsFactor[]>;

/**
 * Defines the possible origins of biometric factors
 */
type BiometricsFactorOrigins = typeof CONST.BIOMETRICS.FACTORS_ORIGIN;

/**
 * Defines the requirements for each biometric factor
 */
type BiometricsFactorsRequirements = typeof CONST.BIOMETRICS.FACTORS_REQUIREMENTS;

/**
 * Maps scenarios to their required factors from the configuration
 */
type BiometricsRequiredFactors = typeof biometricsScenarioRequiredFactors;

/**
 * Contains the full scenarios configuration
 */
type BiometricsScenarios = typeof biometricsScenarios;

/**
 * Base parameter type with a string key and unknown value
 */
type Parameter = {parameter: string; type: unknown};

/**
 * Array of parameters
 */
type ParameterArray = readonly Parameter[];

/**
 * Response type for biometric scenario operations
 */
type BiometricsScenarioResponse = {
    httpCode: number;
    reason: TranslationPaths;
};

/**
 * Response type that includes a success indicator
 */
type BiometricsScenarioResponseWithSuccess = {
    httpCode: number | undefined;
    successful: boolean;
};

/**
 * Type for tracking if a stored factor has been verified
 */
type IsStoredFactorVerified = {
    isStoredFactorVerified?: boolean;
};

/**
 * Maps an array of factors to their requirements
 */
type FactorRequirements<T extends readonly BiometricsFactor[]> = ValueOf<{
    [K in T[number]]: BiometricsFactorsRequirements[K];
}>[];

/**
 * Creates a type containing only the required parameters from a parameter array.
 * Excludes any parameters marked as optional.
 */
type RequiredParameterMap<F extends ParameterArray> = {
    [K in F[number] as K extends {
        origin: typeof CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK;
    }
        ? never
        : K['parameter']]: K['type'];
};

/**
 * Creates a type containing only the optional parameters from a parameter array.
 * All properties will be marked with a question mark.
 */
type OptionalParameterMap<F extends ParameterArray> = {
    [K in F[number] as K extends {
        origin: typeof CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK;
    }
        ? K['parameter']
        : never]?: K['type'];
};

/**
 * Combines required and optional parameters into a single type
 */
type CompleteParameterMap<T extends ParameterArray> = RequiredParameterMap<T> & OptionalParameterMap<T>;

/**
 * Maps a scenario to its required biometric factors
 */
type BiometricsFactors<T extends BiometricsScenario> = CompleteParameterMap<FactorRequirements<BiometricsRequiredFactors[T]>>;

/**
 * Extracts fallback factors for a given scenario
 */
type FallbackTuple<T extends BiometricsScenario> = FactorRequirements<BiometricsRequiredFactors[T]>[number]['origin'] extends BiometricsFactorOrigins['FALLBACK']
    ? FactorRequirements<BiometricsRequiredFactors[T]>
    : never;

/**
 * Maps scenarios to their fallback requirements
 */
type BiometricsFallbackScenarios = {
    [K in BiometricsScenario as FallbackTuple<K> extends never ? never : K]: FallbackTuple<K>;
};

/**
 * Represents a scenario that has fallback options
 */
type BiometricsFallbackScenario = keyof BiometricsFallbackScenarios;

/**
 * Represents a specific fallback factor
 */
type BiometricsFallbackFactor = BiometricsFallbackScenarios[BiometricsFallbackScenario][number]['id'];

/**
 * Maps fallback scenarios to their required factors
 */
type BiometricsFallbackFactors<T extends BiometricsFallbackScenario> = CompleteParameterMap<BiometricsFallbackScenarios[T]>;

/**
 * Parameters required for a biometric scenario, optionally including stored factor verification
 */
type BiometricsScenarioParams<T extends BiometricsScenario, WithStored extends boolean = false> = BiometricsFactors<T> &
    (T extends keyof BiometricsScenarioParameters ? BiometricsScenarioParameters[T] : {}) &
    (WithStored extends true ? IsStoredFactorVerified : {});

/**
 * Parameters required for a fallback scenario
 */
type BiometricsFallbackScenarioParams<T extends BiometricsFallbackScenario> = BiometricsFallbackFactors<T> &
    (T extends keyof BiometricsScenarioParameters ? BiometricsScenarioParameters[T] : {});

/**
 * Gets the parameter type for a specific factor
 */
type FactorParameter<T extends BiometricsFactor> = BiometricsFactorsRequirements[T]['parameter'];

/**
 * Gets the value type for a factor parameter in a specific scenario
 */
type ParameterValue<T extends BiometricsFactor, R extends BiometricsScenario> = FactorParameter<T> extends keyof BiometricsFactors<R> ? BiometricsFactors<R>[FactorParameter<T>] : never;

/**
 * Type of value that can be stored for a scenario
 */
type BiometricsScenarioStoredValueType<T extends BiometricsScenario> = BiometricsScenarios[T] extends {
    factorToStore: infer U extends BiometricsFactor;
}
    ? ParameterValue<U, T> | undefined
    : undefined;

/**
 * Function signature for handling a biometric scenario
 */
type BiometricsScenarioMethod<T extends BiometricsScenario> = (params: BiometricsScenarioParams<T>) => Promise<BiometricsScenarioResponse>;

type BiometricsScenarioMissingFactorMiddleware = (missingFactor: BiometricsFactor) => Promise<void>;

/**
 * Function signature for post-scenario processing
 */
type BiometricsScenarioPostMethod<T extends BiometricsScenario> = (
    params: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>,
    requestParams: BiometricsScenarioParams<T>,
) => BiometricsPartialStatus<BiometricsScenarioStoredValueType<T>>;

/**
 * Maps scenarios to their handlers and configuration
 */
type BiometricsScenarioMap = {
    [T in BiometricsScenario]: {
        scenarioMethod: BiometricsScenarioMethod<T>;
        postScenarioMethod?: BiometricsScenarioPostMethod<T>;
        missingFactorMiddleware?: BiometricsScenarioMissingFactorMiddleware;
        factorToStore?: BiometricsFactor;
    };
};

export type {
    BiometricsFactor,
    BiometricsFactors,
    BiometricsScenarioParams,
    BiometricsFallbackFactor,
    BiometricsFallbackFactors,
    BiometricsFallbackScenario,
    BiometricsFallbackScenarioParams,
    BiometricsFallbackScenarios,
    BiometricsScenario,
    BiometricsScenarioResponse,
    BiometricsScenarioStoredValueType,
    BiometricsScenarioMap,
    BiometricsScenarioPostMethod,
    BiometricsRequiredFactorsRecord,
    BiometricsScenarioResponseWithSuccess,
};
