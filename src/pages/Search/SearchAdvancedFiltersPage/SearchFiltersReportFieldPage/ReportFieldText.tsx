import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import TextFilterBase from '@components/Search/FilterComponents/TextFilterBase';
import {updateAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyReportField} from '@src/types/onyx';

type ReportFieldListProps = {
    field: PolicyReportField;
    close: () => void;
};

function ReportFieldText({field, close}: ReportFieldListProps) {
    const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${field.name.toLowerCase().replaceAll(' ', '-')}` as const;

    const updateFilter = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        updateAdvancedFilters(values);
        close();
    };

    return (
        <>
            <HeaderWithBackButton
                title={field.name}
                onBackButtonPress={close}
                shouldDisplayHelpButton={false}
            />
            <TextFilterBase
                filterKey={formKey}
                title={field.name}
                characterLimit={CONST.MAX_COMMENT_LENGTH}
                onSubmit={updateFilter}
            />
        </>
    );
}

export default ReportFieldText;
