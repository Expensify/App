import React from 'react';
import Icon from '@components/Icon';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import type {ListItem} from '@components/SelectionList/types';
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

function EditReportFieldDropdown({onSubmit, fieldKey, fieldValue, fieldOptions}: EditReportFieldDropdownPageProps) {
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS, {canBeMissing: true});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const recentlyUsedOptions = recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? [];
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);
    const itemRightSideComponent = (item: ListItem) => {
        if (item.text === fieldValue) {
            return (
                <Icon
                    src={icons.Checkmark}
                    fill={theme.iconSuccessFill}
                />
            );
        }

        return null;
    };

    const validFieldOptions = fieldOptions?.filter((option) => !!option)?.sort(localeCompare);

    const sections = getReportFieldOptionsSection({
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

    const policyReportFieldData = sections.at(0)?.data ?? [];
    const selectedOptionKey = policyReportFieldData.filter((option) => option.searchText === fieldValue)?.at(0)?.keyForList;

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue),
    };

    return (
        <SelectionList
            sections={sections ?? []}
            ListItem={RadioListItem}
            shouldShowTextInput
            textInputOptions={textInputOptions}
            onSelectRow={(option) => onSubmit({[fieldKey]: !option?.text || fieldValue === option.text ? '' : option.text})}
            initiallyFocusedItemKey={selectedOptionKey}
            rightHandSideComponent={itemRightSideComponent}
            disableMaintainingScrollPosition
        />
    );
}

export default EditReportFieldDropdown;
