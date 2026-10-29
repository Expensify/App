import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import FormSection from '@components/Form/Layout/FormSection';

import useLocalize from '@hooks/useLocalize';

import type {DynamicFormHeading} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';

type DynamicFormSectionProps = {
    heading: DynamicFormHeading;

    /** The fields that follow the heading */
    children: ReactNode;
};

/** A heading of a schema-driven form, with an optional description under it, drawn over the fields that follow it */
function DynamicFormSection({heading, children}: DynamicFormSectionProps) {
    const {translate} = useLocalize();
    return (
        <FormSection
            title={getLocalizedText(translate, heading.titleKey, heading.title)}
            titleAriaLevel={3}
            description={getLocalizedText(translate, heading.descriptionKey, heading.description)}
        >
            {children}
        </FormSection>
    );
}

export default DynamicFormSection;
