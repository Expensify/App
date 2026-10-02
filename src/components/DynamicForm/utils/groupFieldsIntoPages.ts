import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {TranslationPaths} from '@src/languages/types';
import type {DynamicFormField} from '@src/types/onyx';

import getLocalizedText from './getLocalizedText';

/** One page of a dynamic form flow: the fields sharing a `group` */
type DynamicFormGroup = {
    /** The fields' shared `group`, empty for fields without one */
    group: string;

    labelKey?: TranslationPaths;

    /** URL-safe form of the group, used as the sub page route segment */
    slug: string;

    fields: DynamicFormField[];
};

/** The confirmation page's route segment, which no group may take */
const CONFIRMATION_PAGE_SLUG = 'confirm';

function toSlug(group: string): string {
    return group
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');
}

/** Pages in the order their groups first appear. Slugs are made unique and never collide with the confirmation page. */
function groupFieldsIntoPages(fields: DynamicFormField[]): DynamicFormGroup[] {
    const groups: DynamicFormGroup[] = [];
    for (const field of fields) {
        const group = field.group ?? '';
        const existingGroup = groups.find((candidate) => candidate.group === group);
        if (existingGroup) {
            existingGroup.fields.push(field);
            existingGroup.labelKey ??= field.groupLabelKey;
            continue;
        }
        groups.push({group, labelKey: field.groupLabelKey, slug: '', fields: [field]});
    }
    const takenSlugs = new Set([CONFIRMATION_PAGE_SLUG]);
    for (const [index, group] of groups.entries()) {
        const baseSlug = toSlug(group.group) || `page-${index + 1}`;
        let slug = baseSlug;
        for (let suffix = 2; takenSlugs.has(slug); suffix++) {
            slug = `${baseSlug}-${suffix}`;
        }
        takenSlugs.add(slug);
        group.slug = slug;
    }
    return groups;
}

function getGroupTitle(group: DynamicFormGroup, translate: LocalizedTranslate): string {
    return getLocalizedText(translate, group.labelKey, group.group) ?? '';
}

export default groupFieldsIntoPages;
export {CONFIRMATION_PAGE_SLUG, getGroupTitle};
export type {DynamicFormGroup};
