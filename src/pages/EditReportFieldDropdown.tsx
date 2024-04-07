import React, {useCallback, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RecentlyUsedReportFields} from '@src/types/onyx';

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

type EditReportFieldDropdownPageOnyxProps = {
    recentlyUsedReportFields: OnyxEntry<RecentlyUsedReportFields>;
};

type EditReportFieldDropdownPageProps = EditReportFieldDropdownPageComponentProps & EditReportFieldDropdownPageOnyxProps;

function EditReportFieldDropdownPage({onSubmit, fieldKey, fieldValue, fieldOptions, recentlyUsedReportFields}: EditReportFieldDropdownPageProps) {
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const theme = useTheme();
    const {translate} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldKey] ?? [], [recentlyUsedReportFields, fieldKey]);

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
        const validFieldOptions = fieldOptions?.filter((option) => !!option);

        const {policyReportFieldOptions} = OptionsListUtils.getFilteredOptions(
            [],
            [],
            [],
            debouncedSearchValue,
            [
                {
                    keyForList: fieldValue,
                    searchText: fieldValue,
                    text: fieldValue,
                },
            ],
            [],
            false,
            false,
            false,
            {},
            [],
            false,
            {},
            [],
            false,
            false,
            undefined,
            undefined,
            undefined,
            true,
            validFieldOptions,
            recentlyUsedOptions,
        );

        const policyReportFieldData = policyReportFieldOptions?.[0]?.data ?? [];
        const header = OptionsListUtils.getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue);

        return [policyReportFieldOptions, header];
    }, [recentlyUsedOptions, debouncedSearchValue, fieldValue, fieldOptions]);

    const selectedOptionKey = useMemo(() => (sections?.[0]?.data ?? []).filter((option) => option.searchText === fieldValue)?.[0]?.keyForList, [sections, fieldValue]);
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

export default withOnyx<EditReportFieldDropdownPageProps, EditReportFieldDropdownPageOnyxProps>({
    recentlyUsedReportFields: {
        key: () => ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
    },
})(EditReportFieldDropdownPage);
