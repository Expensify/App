import type {DynamicFormField, DynamicFormHeading} from '@src/types/onyx';

import isHeading from './isHeading';

type DynamicFormSection = {
    /** The heading the section opens with. The fields before the first heading form a section without one. */
    heading?: DynamicFormHeading;

    fields: DynamicFormField[];
};

/** Splits visible content at its headings, so each heading is drawn together with the fields that follow it */
function groupContentBySection(content: Array<DynamicFormHeading | DynamicFormField>): DynamicFormSection[] {
    const sections: DynamicFormSection[] = [];
    for (const item of content) {
        if (isHeading(item)) {
            sections.push({heading: item, fields: []});
            continue;
        }
        const lastSection = sections.at(-1);
        if (lastSection) {
            lastSection.fields.push(item);
        } else {
            sections.push({fields: [item]});
        }
    }
    return sections;
}

export default groupContentBySection;
export type {DynamicFormSection};
