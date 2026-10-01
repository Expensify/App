/**
 * Helpers for a policy's tags: tag-list lookup, parent-tag matching for dependent tags, tag names, and GL codes.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import {getTagArrayFromName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyTagLists, PolicyTags} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

function getSortedTagKeys(policyTagList: OnyxEntry<PolicyTagLists>): Array<keyof PolicyTagLists> {
    if (isEmptyObject(policyTagList)) {
        return [];
    }

    return Object.keys(policyTagList).sort((key1, key2) => policyTagList[key1].orderWeight - policyTagList[key2].orderWeight);
}

/**
 * Gets a tag name of policy tags based on a tag's orderWeight.
 */
function getTagListName(policyTagList: OnyxEntry<PolicyTagLists>, orderWeight: number): string {
    if (isEmptyObject(policyTagList)) {
        return '';
    }

    return Object.values(policyTagList).find((tag) => tag.orderWeight === orderWeight)?.name ?? '';
}

/**
 * Gets all tag lists of a policy
 */
function getTagLists(policyTagList: OnyxEntry<PolicyTagLists>): Array<ValueOf<PolicyTagLists>> {
    if (isEmptyObject(policyTagList)) {
        return [];
    }

    return Object.values(policyTagList)
        .filter((policyTagListValue) => policyTagListValue !== null)
        .sort((tagA, tagB) => tagA.orderWeight - tagB.orderWeight);
}

/**
 * Checks if a policy has any tags
 */
function hasTags(policyTagList: OnyxEntry<PolicyTagLists>): boolean {
    const tagLists = getTagLists(policyTagList);
    return tagLists.some((tagList) => Object.keys(tagList.tags ?? {}).length > 0);
}

// An anchored filter with no regex operators. Letter and digit escapes (\d, \w, ...) are classes, not literals.
const LITERAL_PARENT_TAGS_FILTER = /^\^((?:\\[^A-Za-z0-9]|[^\\.*+?()[\]{}|^$])*)\$$/;
const ESCAPED_CHARACTER = /\\([\s\S])/g;

/**
 * Whether a parentTagsFilter matches a parent tag path.
 * Filters are almost always an anchored, escaped parent path, which is compared as a string -
 * compiling a RegExp per tag dominates scans over large tag lists.
 */
function matchesParentTagsFilter(filter: string | undefined, parentTagPath: string): boolean {
    if (!filter) {
        return true;
    }

    const literal = LITERAL_PARENT_TAGS_FILTER.exec(filter)?.[1];

    if (literal !== undefined) {
        return literal.replaceAll(ESCAPED_CHARACTER, '$1') === parentTagPath;
    }

    return new RegExp(filter).test(parentTagPath);
}

/**
 * Checks whether a policy tag is selectable under a given parent tag path.
 * Tags of a dependent list only apply below the parents their parentTagsFilter matches,
 * while tags without a filter apply everywhere.
 */
function matchesParentTagPath(policyTag: ValueOf<PolicyTags>, parentTagPath: string): boolean {
    return matchesParentTagsFilter(policyTag.rules?.parentTagsFilter ?? policyTag.parentTagsFilter, parentTagPath);
}

/**
 * Finds the policy tag at a single tag list level that matches a tag name.
 * Dependent tag lists can hold same-named child tags under different parents (stored under unique
 * record keys), so a tag only matches by name when its parent filter also matches the parent tag path.
 */
function findPolicyTagAtLevel(levelTags: PolicyTags, tagName: string, parentTagPath: string): ValueOf<PolicyTags> | undefined {
    const matchesTagAtLevel = (levelTag: ValueOf<PolicyTags> | undefined): levelTag is ValueOf<PolicyTags> => {
        if (!levelTag || levelTag.name !== tagName) {
            return false;
        }
        return matchesParentTagPath(levelTag, parentTagPath);
    };

    const directMatch = levelTags[tagName];
    return matchesTagAtLevel(directMatch) ? directMatch : Object.values(levelTags).find(matchesTagAtLevel);
}

/**
 * Finds a policy tag record and its Onyx storage key within a tag list.
 * Dependent tag lists can hold same-named child tags under different parents (stored under unique
 * record keys), so a tag only matches by name when its parent filter also matches.
 */
function findPolicyTagEntryByParentFilter(tags: PolicyTags | undefined, tagName: string, parentTagsFilter?: string): {tag: ValueOf<PolicyTags>; tagKey: string} | undefined {
    if (!tags) {
        return undefined;
    }

    if (parentTagsFilter) {
        const match = Object.entries(tags).find(([, tag]) => tag.name === tagName && (tag.rules?.parentTagsFilter ?? tag.parentTagsFilter) === parentTagsFilter);
        if (match) {
            return {tag: match[1], tagKey: match[0]};
        }
        return undefined;
    }

    if (tags[tagName]) {
        return {tag: tags[tagName], tagKey: tagName};
    }

    const renamedTag = Object.entries(tags).find(([, tag]) => tag.previousTagName === tagName);
    if (renamedTag) {
        return {tag: renamedTag[1], tagKey: renamedTag[0]};
    }

    return undefined;
}

function isTagInPolicy(tagValue: string, policyTags: OnyxEntry<PolicyTagLists>): boolean {
    if (!policyTags) {
        return false;
    }
    const tagComponents = getTagArrayFromName(tagValue);
    const sortedTagLists = getTagLists(policyTags);

    return tagComponents.every((component, index) => {
        if (!component) {
            return true;
        }
        const levelTags = sortedTagLists.at(index)?.tags;
        if (!levelTags) {
            return false;
        }
        const tag = findPolicyTagAtLevel(levelTags, component, tagComponents.slice(0, index).join(':'));
        return !!tag && tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });
}

/**
 * Gets a tag list of a policy by a tag index
 */
function getTagList(policyTagList: OnyxEntry<PolicyTagLists>, tagIndex: number): ValueOf<PolicyTagLists> {
    const tagLists = getTagLists(policyTagList);
    return (
        tagLists.at(tagIndex) ?? {
            name: '',
            required: false,
            tags: {},
            orderWeight: 0,
        }
    );
}

/**
 * Gets a tag list of a policy by a tag's orderWeight.
 */
function getTagListByOrderWeight(policyTagList: OnyxEntry<PolicyTagLists>, orderWeight: number): ValueOf<PolicyTagLists> {
    const tagListEmpty = {
        name: '',
        required: false,
        tags: {},
        orderWeight: 0,
    };
    if (isEmptyObject(policyTagList)) {
        return tagListEmpty;
    }

    return Object.values(policyTagList).find((tag) => tag.orderWeight === orderWeight) ?? tagListEmpty;
}

function getTagNamesFromTagsLists(policyTagLists: PolicyTagLists): string[] {
    const uniqueTagNames = new Set<string>();

    for (const policyTagList of Object.values(policyTagLists ?? {})) {
        for (const tag of Object.values(policyTagList.tags ?? {})) {
            uniqueTagNames.add(tag.name);
        }
    }
    return Array.from(uniqueTagNames);
}

/**
 * Cleans up escaping of colons used to create multi-level tags (e.g. "Parent: Child"),
 * and HTML-decodes the result so tags stored with encoded entities display correctly (e.g. `R&amp;D`, renders as `R&D`)
 */
function getCleanedTagName(tag: string) {
    return Str.htmlDecode(tag?.replaceAll('\\:', CONST.COLON) ?? '');
}

/**
 * Converts a colon-delimited tag string into a comma-separated string, filtering out empty tags.
 */
function getCommaSeparatedTagNameWithSanitizedColons(tag: string): string {
    return getTagArrayFromName(tag)
        .filter((tagItem) => tagItem !== '')
        .map(getCleanedTagName)
        .join(', ');
}

function getLengthOfTag(tag: string): number {
    if (!tag) {
        return 0;
    }
    return getTagArrayFromName(tag).length;
}

/**
 * Resolves a transaction's tag to the GL codes configured on the matching policy tags.
 * Multi-level tags resolve each level against the tag list with the same order weight,
 * and the non-empty GL codes are joined into a single comma-separated string.
 */
function getTagGLCode(policyTagLists: OnyxEntry<PolicyTagLists>, transactionTag: string | undefined): string {
    if (isEmptyObject(policyTagLists) || !transactionTag) {
        return '';
    }

    const tagLists = getTagLists(policyTagLists);
    const tagParts = getTagArrayFromName(transactionTag);
    return tagParts
        .map((tagName, index) => {
            const levelTags = tagLists.at(index)?.tags;
            if (!levelTags) {
                return '';
            }

            return getGLCodeFromPolicyTag(findPolicyTagAtLevel(levelTags, tagName, tagParts.slice(0, index).join(':')));
        })
        .filter(Boolean)
        .join(', ');
}

/**
 * Resolves the GL code for a single policy tag object, stripping wrapping quotes from the backend.
 */
function getGLCodeFromPolicyTag(tag: {['GL Code']?: string | number} | undefined): string {
    const glCode = tag?.['GL Code'];
    return glCode != null ? String(glCode).replaceAll('"', '') : '';
}

/**
 * Escape colon from tag name
 */
function escapeTagName(tag: string) {
    return tag?.replaceAll(CONST.COLON, '\\:');
}

/**
 * Checks if a tag list name is the default 'Tag' name
 */
function isDefaultTagName(tagName: string | undefined): boolean {
    if (!tagName) {
        return false;
    }
    return tagName.trim().toLowerCase() === CONST.POLICY.DEFAULT_TAG_NAME.trim().toLowerCase();
}

/**
 * Gets a count of enabled tags of a policy
 */
function getCountOfEnabledTagsOfList(policyTags: PolicyTags | undefined): number {
    if (!policyTags) {
        return 0;
    }
    return Object.values(policyTags).filter((policyTag) => policyTag.enabled).length;
}
/**
 * Gets count of required tag lists of a policy
 */
function getCountOfRequiredTagLists(policyTagLists: OnyxEntry<PolicyTagLists>): number {
    if (!policyTagLists) {
        return 0;
    }
    return Object.values(policyTagLists).filter((tagList) => tagList.required).length;
}

/**
 * Whether the policy has multi-level tags
 */
function isMultiLevelTags(policyTagList: OnyxEntry<PolicyTagLists>): boolean {
    return Object.keys(policyTagList ?? {}).length > 1;
}

function hasDependentTags(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagLists>) {
    if (!policy?.hasMultipleTagLists) {
        return false;
    }

    // Walks the records instead of `Object.values(...).some(...)`: a tag list can hold thousands of tags, and copying
    // them into an array to ask whether any of them has a filter costs that copy on every caller render.
    // An empty tag list arrives without the `tags` key, despite the type.
    for (const tagListName in policyTagList) {
        if (!Object.hasOwn(policyTagList, tagListName)) {
            continue;
        }

        const tags = policyTagList[tagListName]?.tags;

        for (const tagName in tags) {
            if (!Object.hasOwn(tags, tagName)) {
                continue;
            }

            const tag = tags[tagName];

            if (tag?.rules?.parentTagsFilter || tag?.parentTagsFilter) {
                return true;
            }
        }
    }

    return false;
}

function hasIndependentTags(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagLists>) {
    if (!policy?.hasMultipleTagLists || hasDependentTags(policy, policyTagList)) {
        return false;
    }
    return Object.values(policyTagList ?? {}).some((tagList) => Object.values(tagList.tags ?? {}).length > 0);
}

/**
 * Whether Required lives on each tag list rather than on the policy-wide requiresTag flag.
 *
 * Deliberately not hasIndependentTags: this gates on the tag list count instead of the hasMultipleTagLists flag, and it
 * must stay true for a multi-level workspace whose lists are still empty, otherwise the per-level rows would disappear.
 */
function hasPerTagListRequired(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagLists>) {
    return isMultiLevelTags(policyTagList) && !hasDependentTags(policy, policyTagList);
}

/** Admins name their tag lists, so prefer that name and fall back to the caller's generic label. */
function getTagListLabel(tagListName: string | undefined, fallbackLabel: string) {
    return (tagListName ? getCleanedTagName(tagListName) : '') || fallbackLabel;
}

function getTagApproverRule(policy: OnyxEntry<Policy>, tagName: string) {
    if (!policy) {
        return;
    }

    const approvalRules = policy.rules?.approvalRules ?? [];
    const approverRule = approvalRules.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.TAG && value === tagName),
    );

    return approverRule;
}

export {
    getSortedTagKeys,
    getTagListName,
    getTagLists,
    hasTags,
    matchesParentTagsFilter,
    matchesParentTagPath,
    findPolicyTagAtLevel,
    findPolicyTagEntryByParentFilter,
    isTagInPolicy,
    getTagList,
    getTagListByOrderWeight,
    getTagNamesFromTagsLists,
    getCleanedTagName,
    getCommaSeparatedTagNameWithSanitizedColons,
    getLengthOfTag,
    getTagGLCode,
    getGLCodeFromPolicyTag,
    escapeTagName,
    isDefaultTagName,
    getCountOfEnabledTagsOfList,
    getCountOfRequiredTagLists,
    isMultiLevelTags,
    hasDependentTags,
    hasIndependentTags,
    hasPerTagListRequired,
    getTagListLabel,
    getTagApproverRule,
};
