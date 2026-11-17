/**
 * Helpers for the `nonDefault*` violations, which flag a field changed away from its default value
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {ViolationName} from '@src/types/onyx/TransactionViolation';

type NonDefaultViolationName = Extract<ViolationName, `${typeof CONST.NONDEFAULT_VIOLATION_PREFIX}${string}`>;

const NONDEFAULT_VIOLATION_NAMES = new Set<string>(Object.values(CONST.VIOLATIONS).filter((name) => name.startsWith(CONST.NONDEFAULT_VIOLATION_PREFIX)));

/**
 * Checks whether a violation name is one of the `nonDefault*` violations.
 */
function isNonDefaultViolationName(name: string): name is NonDefaultViolationName {
    return NONDEFAULT_VIOLATION_NAMES.has(name);
}

/**
 * Returns the translated message for a `nonDefault*` violation.
 */
function getNonDefaultViolationTranslation(name: NonDefaultViolationName, translate: LocalizedTranslate): string {
    return translate(`violations.${name}` as const);
}

export {getNonDefaultViolationTranslation, isNonDefaultViolationName};
