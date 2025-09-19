import React, {useMemo} from 'react';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getReportFieldOptionsSection} from '@libs/ReportFieldOptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldDropdownPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Key of the policy report field */
    fieldKey: string;

    /** Options of the policy report field */
    fieldOptions: string[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: Record<string, string>) => void;
};

function EditReportFieldDropdownPage({onSubmit, fieldKey, fieldValue, fieldOptions}: EditReportFieldDropdownPageProps) {
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS, {canBeMissing: true});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? [], [recentlyUsedReportFields, fieldKey, localeCompare]);

    const [sections, headerMessage] = useMemo(() => {
        const validFieldOptions = fieldOptions?.filter((option) => !!option)?.sort(localeCompare);

        const policyReportFieldOptions = getReportFieldOptionsSection({
            searchValue: debouncedSearchValue,
            selectedOptions: [
                {
                    keyForList: fieldValue,
                    searchText: fieldValue,
                    text: fieldValue,
                },
            ],
            options: validFieldOptions,
            recentlyUsedOptions,
        });

        const policyReportFieldData = policyReportFieldOptions.at(0)?.data ?? [];
        const header = getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue);

        return [policyReportFieldOptions, header];
    }, [fieldOptions, localeCompare, debouncedSearchValue, fieldValue, recentlyUsedOptions]);

    const selectedOptionKey = useMemo(() => (sections.at(0)?.data ?? []).filter((option) => option.searchText === fieldValue)?.at(0)?.keyForList, [sections, fieldValue]);
    return (
        <SelectionList
            textInputValue={searchValue}
            textInputLabel={translate('common.search')}
            sections={sections ?? []}
            onSelectRow={(option) => onSubmit({[fieldKey]: !option?.text || fieldValue === option.text ? '' : option.text})}
            initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
            onChangeText={setSearchValue}
            headerMessage={headerMessage}
            ListItem={SingleSelectListItem}
            isRowMultilineSupported
        />
    );
}

EditReportFieldDropdownPage.displayName = 'EditReportFieldDropdownPage';

export default EditReportFieldDropdownPage;
