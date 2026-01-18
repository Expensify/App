import React, {useCallback, useMemo} from 'react';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
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
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS, {canBeMissing: true});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? [], [recentlyUsedReportFields, fieldKey, localeCompare]);
    const itemRightSideComponent = useCallback(
        (item: ListItem) => {
            if (item.text === fieldValue) {
                return (
                    <Icon
                        src={icons.Checkmark}
                        fill={theme.iconSuccessFill}
                    />
                );
            }

            return null;
        },
        [icons.Checkmark, theme.iconSuccessFill, fieldValue],
    );

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
            translate,
        });

        const policyReportFieldData = policyReportFieldOptions.at(0)?.data ?? [];
        const header = getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue);

        return [policyReportFieldOptions, header];
    }, [fieldOptions, localeCompare, debouncedSearchValue, fieldValue, recentlyUsedOptions, translate]);

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
            ListItem={RadioListItem}
            rightHandSideComponent={itemRightSideComponent}
        />
    );
}

export default EditReportFieldDropdownPage;
