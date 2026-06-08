import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import {isSpendRuleCategory} from '@src/types/form/SpendRuleForm';
import type {CardID} from '@src/types/onyx/Card';
import type ReportAction from '@src/types/onyx/ReportAction';
import {convertAmountToDisplayString} from './CurrencyUtils';
import {formatList} from './Localize';
import Parser from './Parser';
import stripFollowupListFromHtml from './ReportActionFollowupUtils/stripFollowupListFromHtml';
import {getOriginalMessage, isActionOfType} from './ReportActionsUtils';

function getSpendRuleFallbackReportActionText(reportAction: OnyxEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? reportAction?.message.at(0) : reportAction?.message;

    // We intentionally use || here because empty strings from stripFollowupListFromHtml should also fall through to the text fallback
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const text = stripFollowupListFromHtml(message?.html) || (message?.text ?? '');
    return text ? Parser.htmlToText(text) : '';
}

function getSpendRuleActionVerb(translate: LocalizedTranslate, action: ValueOf<typeof CONST.SPEND_RULES.ACTION>): string {
    if (action === CONST.SPEND_RULES.ACTION.BLOCK) {
        return translate('workspaceActions.expensifyCardRule.actionVerb.block');
    }
    if (action === CONST.SPEND_RULES.ACTION.ALLOW) {
        return translate('workspaceActions.expensifyCardRule.actionVerb.allow');
    }
    return '';
}

function getSpendRuleAmountOperatorWord(translate: LocalizedTranslate, operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>): string {
    if (operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO) {
        return translate('workspaceActions.expensifyCardRule.amountOperator.under');
    }
    if (operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN) {
        return translate('workspaceActions.expensifyCardRule.amountOperator.over');
    }
    return '';
}

function getSpendRuleAmountString(translate: LocalizedTranslate, amount: {operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>; value: string[]}, currency: string): string {
    if (amount.value.length === 0) {
        return '';
    }
    const operatorWord = getSpendRuleAmountOperatorWord(translate, amount.operator);
    return translate('workspaceActions.expensifyCardRule.amountFilter', {operator: operatorWord, amount: formatSpendRuleAmount(amount.value, currency)});
}

function getSpendRuleCardsSummary(translate: LocalizedTranslate, cards: ReadonlyArray<{displayName?: string}> | undefined): string {
    if (!cards || cards.length === 0) {
        return translate('workspaceActions.expensifyCardRule.theCard');
    }
    if (cards.length === 1) {
        const displayName = cards.at(0)?.displayName ?? '';
        return displayName !== '' ? `'${displayName}'` : translate('workspaceActions.expensifyCardRule.theCard');
    }
    return translate('workspaceActions.expensifyCardRule.multipleCards', {count: cards.length});
}

function getSpendRuleJoinFilters(items: readonly string[]): string {
    return formatList(items.filter((value) => value !== ''));
}

function getSpendRuleCategoryDisplayName(translate: LocalizedTranslate, category: string): string {
    if (isSpendRuleCategory(category)) {
        return translate(`workspace.rules.spendRules.categoryOptions.${category}`);
    }
    return category;
}

function getSpendRuleRestrictionVerb(translate: LocalizedTranslate, action: ValueOf<typeof CONST.SPEND_RULES.ACTION>): string {
    if (action === CONST.SPEND_RULES.ACTION.BLOCK) {
        return translate('workspaceActions.expensifyCardRule.restrictionVerb.block');
    }
    if (action === CONST.SPEND_RULES.ACTION.ALLOW) {
        return translate('workspaceActions.expensifyCardRule.restrictionVerb.allow');
    }
    return action;
}

function formatSpendRuleAmount(amount: string[], currency: string): string {
    return convertAmountToDisplayString(getSpendRuleValueInCents(amount), currency);
}

type SpendRuleStringDiff = {added: string[]; removed: string[]};

function computeSpendRuleStringDiff(oldValues: string[], newValues: string[]): SpendRuleStringDiff {
    const oldSet = Array.from(new Set(oldValues));
    const newSet = Array.from(new Set(newValues));
    const added = newSet.filter((value) => !oldSet.includes(value)).sort();
    const removed = oldSet.filter((value) => !newSet.includes(value)).sort();
    return {added, removed};
}

type SpendRuleAmount = {operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>; value: string[]};
type SpendRuleAmountDiff = {added: SpendRuleAmount[]; removed: SpendRuleAmount[]};

function getSpendRuleValueInCents(value: string[]): number {
    const firstValue = value.at(0) ?? '';
    return firstValue !== '' && Number.isFinite(Number(firstValue)) ? Math.round(parseFloat(firstValue) * 100) : 0;
}

function computeSpendRuleAmountDiff(oldAmounts: SpendRuleAmount[], newAmounts: SpendRuleAmount[]): SpendRuleAmountDiff {
    const oldAmount = oldAmounts.at(0);
    const newAmount = newAmounts.at(0);
    if (!oldAmount && !newAmount) {
        return {added: [], removed: []};
    }
    if (!oldAmount) {
        return {added: newAmount ? [newAmount] : [], removed: []};
    }
    if (!newAmount) {
        return {added: [], removed: [oldAmount]};
    }
    const sameAmount = getSpendRuleValueInCents(oldAmount.value) === getSpendRuleValueInCents(newAmount.value);
    if (sameAmount) {
        return {added: [], removed: []};
    }
    return {
        added: [newAmount],
        removed: [oldAmount],
    };
}

type SpendRuleCard = {cardID?: CardID; displayName?: string};
type SpendRuleCardDiff = {added: SpendRuleCard[]; removed: SpendRuleCard[]};

function getSpendRuleCardID(card: SpendRuleCard): number | undefined {
    const cardID = card?.cardID;
    if (typeof cardID === 'number' && Number.isFinite(cardID)) {
        return cardID;
    }
    if (typeof cardID === 'string' && /^\d+$/.test(cardID)) {
        return Number.parseInt(cardID, 10);
    }
    return undefined;
}

function computeSpendRuleCardDiff(oldCards: SpendRuleCard[], newCards: SpendRuleCard[]): SpendRuleCardDiff {
    const oldByID = new Map<number, SpendRuleCard>();
    for (const card of oldCards) {
        const id = getSpendRuleCardID(card);
        if (id !== undefined) {
            oldByID.set(id, card);
        }
    }
    const newByID = new Map<number, SpendRuleCard>();
    for (const card of newCards) {
        const id = getSpendRuleCardID(card);
        if (id !== undefined) {
            newByID.set(id, card);
        }
    }
    const added: SpendRuleCard[] = [];
    for (const [id, card] of newByID) {
        if (!oldByID.has(id)) {
            added.push(card);
        }
    }
    const removed: SpendRuleCard[] = [];
    for (const [id, card] of oldByID) {
        if (!newByID.has(id)) {
            removed.push(card);
        }
    }
    return {added, removed};
}

type SpendRulePhraseVerb = 'added' | 'removed' | 'changed' | 'set' | 'applied';
type SpendRulePhraseAdjective = '' | typeof CONST.SPEND_RULES.ACTION.BLOCK | typeof CONST.SPEND_RULES.ACTION.ALLOW;
type SpendRulePhraseNoun = 'merchant' | 'spendCategory' | '';

type SpendRulePhrase = {
    verb: SpendRulePhraseVerb;
    adjective: SpendRulePhraseAdjective;
    noun: SpendRulePhraseNoun;
    bodyWithAdjective: string;
    bodyWithoutAdjective: string;
    bodyValueOnly: string;
};

function getSpendRulePhraseVerbWord(translate: LocalizedTranslate, verb: SpendRulePhraseVerb): string {
    return translate(`workspaceActions.expensifyCardRule.update.phraseVerb.${verb}`);
}

function joinSpendRulePhrases(translate: LocalizedTranslate, phrases: readonly SpendRulePhrase[]): string {
    if (phrases.length === 0) {
        return '';
    }
    if (phrases.length === 1) {
        const phrase = phrases.at(0);
        if (!phrase) {
            return '';
        }
        return `${getSpendRulePhraseVerbWord(translate, phrase.verb)} ${phrase.bodyWithAdjective}`;
    }

    const firstVerb = phrases.at(0)?.verb;
    const allSameVerb = firstVerb !== undefined && phrases.every((phrase) => phrase.verb === firstVerb);

    if (!allSameVerb) {
        const parts = phrases.map((phrase) => `${getSpendRulePhraseVerbWord(translate, phrase.verb)} ${phrase.bodyWithAdjective}`);
        return getSpendRuleJoinFilters(parts);
    }

    const firstPhrase = phrases.at(0);
    if (!firstPhrase) {
        return '';
    }
    const firstAdjective = firstPhrase.adjective;
    const parts: string[] = [`${getSpendRulePhraseVerbWord(translate, firstPhrase.verb)} ${firstPhrase.bodyWithAdjective}`];
    let previousNoun = firstPhrase.noun;
    for (let i = 1; i < phrases.length; i++) {
        const phrase = phrases.at(i);
        if (!phrase) {
            continue;
        }
        const useOwnAdjective = phrase.adjective !== '' && phrase.adjective !== firstAdjective;
        const sameNounAsPrevious = phrase.noun !== '' && phrase.noun === previousNoun;
        let body = phrase.bodyWithoutAdjective;
        if (useOwnAdjective) {
            body = phrase.bodyWithAdjective;
        } else if (sameNounAsPrevious) {
            body = phrase.bodyValueOnly;
        }
        parts.push(body);
        previousNoun = phrase.noun;
    }
    return getSpendRuleJoinFilters(parts);
}

function getAddExpensifyCardRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    const action = message.action ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const currency = message.currency ?? CONST.CURRENCY.USD;
    const merchants = message.merchants ?? [];
    const categories = message.categories ?? [];
    const amounts = message.amounts ?? [];
    const cards = message.cards ?? [];

    const items: string[] = [];
    for (const merchant of merchants) {
        items.push(`'${merchant}'`);
    }
    for (const category of categories) {
        items.push(`'${getSpendRuleCategoryDisplayName(translate, category)}'`);
    }
    for (const amount of amounts) {
        const formattedAmount = getSpendRuleAmountString(translate, amount, currency);
        if (formattedAmount !== '') {
            items.push(formattedAmount);
        }
    }

    const verb = getSpendRuleActionVerb(translate, action);
    const filters = getSpendRuleJoinFilters(items);
    const cardsSummary = getSpendRuleCardsSummary(translate, cards);

    if (verb === '') {
        return getSpendRuleFallbackReportActionText(reportAction);
    }

    return translate('workspaceActions.expensifyCardRule.addRule', {verb, filters, cards: cardsSummary});
}

function getDiffPhrases(
    diff: SpendRuleStringDiff,
    adjective: SpendRulePhraseAdjective,
    adjectiveWord: string,
    noun: SpendRulePhraseNoun,
    getDisplayName: (value: string) => string,
    formatBody: (params: {adjective: string; value: string}) => string,
    formatValueOnly: (params: {value: string}) => string,
    formatBodyChange: (params: {adjective: string; oldValue: string; newValue: string}) => string,
): SpendRulePhrase[] {
    const diffPhrases: SpendRulePhrase[] = [];
    if (diff.added.length === 1 && diff.removed.length === 1) {
        const oldValue = getDisplayName(diff.removed.at(0) ?? '');
        const newValue = getDisplayName(diff.added.at(0) ?? '');
        const bodyWithAdjective = formatBodyChange({adjective: adjectiveWord, oldValue, newValue});
        const bodyWithoutAdjective = formatBodyChange({adjective: '', oldValue, newValue});
        diffPhrases.push({
            verb: 'changed',
            adjective,
            noun,
            bodyWithAdjective,
            bodyWithoutAdjective,
            bodyValueOnly: bodyWithoutAdjective,
        });
    } else {
        for (const value of diff.added) {
            const display = getDisplayName(value);
            diffPhrases.push({
                verb: 'added',
                adjective,
                noun,
                bodyWithAdjective: formatBody({adjective: adjectiveWord, value: display}),
                bodyWithoutAdjective: formatBody({adjective: '', value: display}),
                bodyValueOnly: formatValueOnly({value: display}),
            });
        }
        for (const value of diff.removed) {
            const display = getDisplayName(value);
            diffPhrases.push({
                verb: 'removed',
                adjective,
                noun,
                bodyWithAdjective: formatBody({adjective: adjectiveWord, value: display}),
                bodyWithoutAdjective: formatBody({adjective: '', value: display}),
                bodyValueOnly: formatValueOnly({value: display}),
            });
        }
    }
    return diffPhrases;
}

function getUpdateExpensifyCardRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    const oldAction = message.oldAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const newAction = message.action ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const actionChanged = oldAction !== newAction;
    const currency = message.currency ?? CONST.CURRENCY.USD;

    const oldMerchants = message.oldMerchants ?? [];
    const newMerchants = message.merchants ?? [];
    const oldCategories = message.oldCategories ?? [];
    const newCategories = message.categories ?? [];
    const oldAmounts = message.oldAmounts ?? [];
    const newAmounts = message.amounts ?? [];
    const oldCards = message.oldCards ?? [];
    const newCards = message.cards ?? [];

    const merchantDiff = computeSpendRuleStringDiff(oldMerchants, newMerchants);
    const categoryDiff = computeSpendRuleStringDiff(oldCategories, newCategories);
    const amountDiff = computeSpendRuleAmountDiff(oldAmounts, newAmounts);
    const cardDiff = computeSpendRuleCardDiff(oldCards, newCards);

    const merchantsChanged = merchantDiff.added.length > 0 || merchantDiff.removed.length > 0;
    const categoriesChanged = categoryDiff.added.length > 0 || categoryDiff.removed.length > 0;
    const amountsChanged = amountDiff.added.length > 0 || amountDiff.removed.length > 0;
    const cardsChanged = cardDiff.added.length > 0 || cardDiff.removed.length > 0;
    const filtersAndCardsUnchanged = !merchantsChanged && !categoriesChanged && !amountsChanged && !cardsChanged;

    const newCardsSummary = getSpendRuleCardsSummary(translate, newCards);

    if (actionChanged && filtersAndCardsUnchanged) {
        return translate('workspaceActions.expensifyCardRule.update.modeChange', {
            fromAction: getSpendRuleRestrictionVerb(translate, oldAction),
            toAction: getSpendRuleRestrictionVerb(translate, newAction),
            cards: newCardsSummary,
        });
    }

    if (cardsChanged && !merchantsChanged && !categoriesChanged && !amountsChanged && !actionChanged) {
        if (cardDiff.added.length > 0 && cardDiff.removed.length === 0) {
            return translate('workspaceActions.expensifyCardRule.update.appliedToAdditionalCards', {count: cardDiff.added.length});
        }
        if (cardDiff.added.length === 0 && cardDiff.removed.length > 0) {
            return translate('workspaceActions.expensifyCardRule.removeRule', {cards: getSpendRuleCardsSummary(translate, cardDiff.removed)});
        }
    }

    const adjective: SpendRulePhraseAdjective = newAction === CONST.SPEND_RULES.ACTION.BLOCK || newAction === CONST.SPEND_RULES.ACTION.ALLOW ? newAction : '';
    const adjectiveWord = adjective === '' ? '' : getSpendRuleActionVerb(translate, adjective);
    const phrases: SpendRulePhrase[] = [
        ...getDiffPhrases(
            merchantDiff,
            adjective,
            adjectiveWord,
            'merchant',
            (value) => value,
            (params) => translate('workspaceActions.expensifyCardRule.update.bodyMerchant', params),
            (params) => translate('workspaceActions.expensifyCardRule.update.bodyMerchantValueOnly', params),
            (params) => translate('workspaceActions.expensifyCardRule.update.bodyMerchantChange', params),
        ),
        ...getDiffPhrases(
            categoryDiff,
            adjective,
            adjectiveWord,
            'spendCategory',
            (category) => getSpendRuleCategoryDisplayName(translate, category),
            (params) => translate('workspaceActions.expensifyCardRule.update.bodySpendCategory', params),
            (params) => translate('workspaceActions.expensifyCardRule.update.bodySpendCategoryValueOnly', params),
            (params) => translate('workspaceActions.expensifyCardRule.update.bodySpendCategoryChange', params),
        ),
    ];

    if (amountDiff.added.length === 1 && amountDiff.removed.length === 1) {
        const oldValue = formatSpendRuleAmount(amountDiff.removed.at(0)?.value ?? [], currency);
        const newValue = formatSpendRuleAmount(amountDiff.added.at(0)?.value ?? [], currency);
        const body = translate('workspaceActions.expensifyCardRule.update.bodyMaxAmountChange', {oldValue, newValue});
        phrases.push({verb: 'changed', adjective: '', noun: '', bodyWithAdjective: body, bodyWithoutAdjective: body, bodyValueOnly: body});
    } else {
        for (const amount of amountDiff.added) {
            const body = translate('workspaceActions.expensifyCardRule.update.bodyMaxAmountSet', {value: formatSpendRuleAmount(amount.value, currency)});
            phrases.push({verb: 'set', adjective: '', noun: '', bodyWithAdjective: body, bodyWithoutAdjective: body, bodyValueOnly: body});
        }
        if (amountDiff.removed.length > 0) {
            const body = translate('workspaceActions.expensifyCardRule.update.bodyMaxAmount');
            const removedPhrase: SpendRulePhrase = {verb: 'removed', adjective: '', noun: '', bodyWithAdjective: body, bodyWithoutAdjective: body, bodyValueOnly: body};
            phrases.push(...Array.from<SpendRulePhrase>({length: amountDiff.removed.length}).fill(removedPhrase));
        }
    }

    if (cardDiff.added.length > 0) {
        const body = translate('workspaceActions.expensifyCardRule.update.bodyAppliedToAdditionalCards', {count: cardDiff.added.length});
        phrases.push({verb: 'applied', adjective: '', noun: '', bodyWithAdjective: body, bodyWithoutAdjective: body, bodyValueOnly: body});
    }
    if (cardDiff.removed.length > 0) {
        const body = translate('workspaceActions.expensifyCardRule.update.bodyRemovedFromCards', {cards: getSpendRuleCardsSummary(translate, cardDiff.removed)});
        phrases.push({verb: 'removed', adjective: '', noun: '', bodyWithAdjective: body, bodyWithoutAdjective: body, bodyValueOnly: body});
    }

    if (phrases.length === 0) {
        return getSpendRuleFallbackReportActionText(reportAction);
    }

    const joined = joinSpendRulePhrases(translate, phrases);

    if (cardsChanged) {
        return joined;
    }

    const onlyRemovedPhrase = phrases.length === 1 && phrases.at(0)?.verb === 'removed';
    if (onlyRemovedPhrase) {
        return translate('workspaceActions.expensifyCardRule.update.composeFromCards', {content: joined, cards: newCardsSummary});
    }

    return translate('workspaceActions.expensifyCardRule.update.composeOnCards', {content: joined, cards: newCardsSummary});
}

function getRemoveExpensifyCardRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE)) {
        return '';
    }
    const message = getOriginalMessage(reportAction) ?? {};
    const cards = message.cards ?? [];
    const cardsSummary = getSpendRuleCardsSummary(translate, cards);
    return translate('workspaceActions.expensifyCardRule.removeRule', {cards: cardsSummary});
}

export {getAddExpensifyCardRuleMessage, getRemoveExpensifyCardRuleMessage, getUpdateExpensifyCardRuleMessage};
