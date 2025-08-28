import React from 'react';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';


function SearchFiltersTitlePage() {
    const {translate} = useLocalize();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const titleValue = values.title.trim();

        if (titleValue.length > CONST.TASK_TITLE_CHARACTER_LIMIT) {
            errors.title = translate('common.error.characterLimitExceedCounter', {length: titleValue.length, limit: CONST.TASK_TITLE_CHARACTER_LIMIT});
        }

        return errors;
    };

    return (
        <SearchFiltersTextBase
            filterKey="title"
            titleKey="common.title"
            testID={SearchFiltersTitlePage.displayName}
            validate={validate}
            shouldHideFixErrorsAlert={false}
        />
    );
}

SearchFiltersTitlePage.displayName = 'SearchFiltersTitlePage';

export default SearchFiltersTitlePage;
