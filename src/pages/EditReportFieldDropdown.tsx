import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import localeCompare from '@libs/LocaleCompare';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldDropdownPageComponentProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Key of the policy report field */
    fieldKey: string;

    /** ID of the policy this report field belongs to */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;

    /** Options of the policy report field */
    fieldOptions: string[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: Record<string, string>) => void;
};

type EditReportFieldDropdownPageProps = EditReportFieldDropdownPageComponentProps;

function EditReportFieldDropdownPage({onSubmit, fieldKey, fieldValue, fieldOptions}: EditReportFieldDropdownPageProps) {
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const theme = useTheme();
    const {translate} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? [], [recentlyUsedReportFields, fieldKey]);

    const itemRightSideComponent = useCallback(
        (item: ListItem) => {
            if (item.text === fieldValue) {
                return (
                    <Icon
                        src={Expensicons.Checkmark}
                        fill={theme.iconSuccessFill}
                    />
                );
            }

            return null;
        },
        [theme.iconSuccessFill, fieldValue],
    );

    const [sections, headerMessage] = useMemo(() => {
        const validFieldOptions = fieldOptions?.filter((option) => !!option)?.sort(localeCompare);

        const {policyReportFieldOptions} = OptionsListUtils.getFilteredOptions({
            searchValue: debouncedSearchValue,
            selectedOptions: [
                {
                    keyForList: fieldValue,
                    searchText: fieldValue,
                    text: fieldValue,
                },
            ],

            includeP2P: false,
            canInviteUser: false,
            includePolicyReportFieldOptions: true,
            policyReportFieldOptions: validFieldOptions,
            recentlyUsedPolicyReportFieldOptions: recentlyUsedOptions,
        });

        const policyReportFieldData = policyReportFieldOptions?.[0]?.data ?? [];
        const header = OptionsListUtils.getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue);

        return [policyReportFieldOptions, header];
    }, [recentlyUsedOptions, debouncedSearchValue, fieldValue, fieldOptions]);

    const selectedOptionKey = useMemo(() => (sections?.[0]?.data ?? []).filter((option) => option.searchText === fieldValue)?.at(0)?.keyForList, [sections, fieldValue]);
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
            isRowMultilineSupported
            rightHandSideComponent={itemRightSideComponent}
        />
    );
}

EditReportFieldDropdownPage.displayName = 'EditReportFieldDropdownPage';

export default EditReportFieldDropdownPage;
