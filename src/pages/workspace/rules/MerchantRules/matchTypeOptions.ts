import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

type MatchTypeField = 'matchType' | 'dateMatchType' | 'amountMatchType';

type MatchTypeOperator = ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

type MatchTypeOption = {
    value: MatchTypeOperator;
    translationKey: TranslationPaths;
};

/**
 * The comparisons each match type picker offers, in the order it lists them.
 *
 * The picker and the row that opens it both read from here, so a comparison is worded the same in both places.
 * The first option of each field is the one a rule falls back to when it carries no match type.
 */
const MATCH_TYPE_OPTIONS = {
    matchType: [
        {value: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, translationKey: 'workspace.rules.merchantRules.matchTypeContains'},
        {value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, translationKey: 'workspace.rules.merchantRules.matchTypeExact'},
    ],
    dateMatchType: [
        {value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, translationKey: 'workspace.rules.merchantRules.dateMatchTypeOn'},
        {value: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, translationKey: 'workspace.rules.merchantRules.dateMatchTypeAfter'},
        {value: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN, translationKey: 'workspace.rules.merchantRules.dateMatchTypeBefore'},
    ],
    amountMatchType: [
        {value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, translationKey: 'workspace.rules.merchantRules.amountMatchTypeEqualTo'},
        {value: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, translationKey: 'workspace.rules.merchantRules.amountMatchTypeGreaterThan'},
        {value: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN, translationKey: 'workspace.rules.merchantRules.amountMatchTypeLessThan'},
    ],
} satisfies Record<MatchTypeField, MatchTypeOption[]>;

/** The default comparison of a field, which is what a rule carrying no match type on it is read as. */
function getDefaultMatchType(field: MatchTypeField): MatchTypeOperator {
    return MATCH_TYPE_OPTIONS[field].at(0)?.value ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;
}

/** Words one comparison, which is what the row opening the picker reads as. */
function getMatchTypeLabel(field: MatchTypeField, value: MatchTypeOperator | undefined, translate: LocaleContextProps['translate']): string {
    const options: MatchTypeOption[] = MATCH_TYPE_OPTIONS[field];
    const selectedOption = options.find((option) => option.value === value) ?? options.at(0);

    return selectedOption ? translate(selectedOption.translationKey) : '';
}

export {MATCH_TYPE_OPTIONS, getDefaultMatchType, getMatchTypeLabel};
export type {MatchTypeField, MatchTypeOperator};
