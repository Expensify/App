import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersDescriptionPage() {
    const {translate} = useLocalize();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const descriptionValue = values.description.trim();

        if (descriptionValue.length > CONST.DESCRIPTION_LIMIT) {
            errors.description = translate('common.error.characterLimitExceedCounter', {length: descriptionValue.length, limit: CONST.DESCRIPTION_LIMIT});
        }

        return errors;
    };

    return (
        <SearchFiltersTextBase
            filterKey="description"
            titleKey="common.description"
            testID={SearchFiltersDescriptionPage.displayName}
            validate={validate}
        />
    );
}

SearchFiltersDescriptionPage.displayName = 'SearchFiltersDescriptionPage';

export default SearchFiltersDescriptionPage;
