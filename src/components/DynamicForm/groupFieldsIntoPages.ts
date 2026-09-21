import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {TranslationPaths} from '@src/languages/types';
import type {DynamicFormField} from '@src/types/onyx';

type DynamicFormPage = {
    /** The fields' shared `group`, shown as the page title and step name unless `labelKey` is set */
    name: string;

    /** Our translation of the title, from the first field in the group that declares `groupLabelKey` */
    labelKey?: TranslationPaths;

    /** URL-safe form of the name, used as the sub page route segment */
    slug: string;

    fields: DynamicFormField[];
};

/** The flow's confirmation page uses this route segment, so no group may take it */
const CONFIRM_PAGE_SLUG = 'confirm';

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/^-+|-+$/g, '');
}

function groupFieldsIntoPages(fields: DynamicFormField[]): DynamicFormPage[] {
    const pages: DynamicFormPage[] = [];
    for (const field of fields) {
        const page = pages.find(({name}) => name === field.group);
        if (page) {
            page.fields.push(field);
        } else {
            pages.push({name: field.group, slug: toSlug(field.group), labelKey: field.groupLabelKey, fields: [field]});
        }
    }
    const taken = new Set<string>([CONFIRM_PAGE_SLUG]);
    for (const [index, page] of pages.entries()) {
        let slug = page.slug || `page-${index + 1}`;
        for (let suffix = 2; taken.has(slug); suffix++) {
            slug = `${page.slug || `page-${index + 1}`}-${suffix}`;
        }
        taken.add(slug);
        page.slug = slug;
    }
    return pages;
}

function getPageTitle(page: DynamicFormPage, translate: LocalizedTranslate): string {
    return page.labelKey ? translate(page.labelKey) : page.name;
}

export default groupFieldsIntoPages;
export {CONFIRM_PAGE_SLUG, getPageTitle};
export type {DynamicFormPage};
