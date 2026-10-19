import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {CompanyAddress, Unit} from '@src/types/onyx/Policy';

type WorkspaceAddressStreetLines = {
    streetLineOne: string;
    streetLineTwo: string;
};

/**
 * Resolve workspace street lines while supporting both legacy newline street format and explicit street line 2.
 */
function getWorkspaceAddressStreetLines(addressStreet: CompanyAddress['addressStreet'] = '', addressStreet2?: CompanyAddress['addressStreet2']): WorkspaceAddressStreetLines {
    const [legacyStreetLineOne, legacyStreetLineTwo] = (addressStreet ?? '').split('\n');
    const trimmedStreetLineTwo = addressStreet2?.trim();
    return {
        streetLineOne: legacyStreetLineOne?.trim() ?? '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if explicit line 2 can be an empty string
        streetLineTwo: trimmedStreetLineTwo || legacyStreetLineTwo?.trim() || '',
    };
}

/**
 * @param unit Unit
 * @returns translation key for the unit
 */
function getUnitTranslationKey(unit: Unit): TranslationPaths {
    const unitTranslationKeysStrategy: Record<Unit, TranslationPaths> = {
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: 'common.kilometers',
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: 'common.miles',
    };

    return unitTranslationKeysStrategy[unit];
}

export {getUnitTranslationKey, getWorkspaceAddressStreetLines};
