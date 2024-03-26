import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RecentlyUsedReportFields} from '@src/types/onyx';

type EditReportFieldDropdownPageComponentProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

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

type ReportFieldDropdownData = {
    text: string;
    keyForList: string;
    searchText: string;
    tooltipText: string;
};

type ReportFieldDropdownSectionItem = {
    data: ReportFieldDropdownData[];
    shouldShow: boolean;
    title?: string;
};

function EditReportFieldDropdownPage({fieldName, onSubmit, fieldKey, fieldValue, fieldOptions, recentlyUsedReportFields}: EditReportFieldDropdownPageProps) {
    const [searchValue, setSearchValue] = useState('');
    const styles = useThemeStyles();
    const {getSafeAreaMargins} = useStyleUtils();
    const {translate} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldKey] ?? [], [recentlyUsedReportFields, fieldKey]);

    const {sections, headerMessage} = useMemo(() => {
        let newHeaderMessage = '';
        const newSections: ReportFieldDropdownSectionItem[] = [];

        if (searchValue) {
            const filteredOptions = fieldOptions.filter((option) => option.toLowerCase().includes(searchValue.toLowerCase()));
            newHeaderMessage = !filteredOptions.length ? translate('common.noResultsFound') : '';
            newSections.push({
                shouldShow: false,
                data: filteredOptions.map((option) => ({
                    text: option,
                    keyForList: option,
                    searchText: option,
                    tooltipText: option,
                    isSelected: option === fieldValue,
                })),
            });
        } else {
            const selectedValue = fieldValue;
            if (selectedValue) {
                newSections.push({
                    shouldShow: false,
                    data: [
                        {
                            text: selectedValue,
                            keyForList: selectedValue,
                            searchText: selectedValue,
                            tooltipText: selectedValue,
                        },
                    ],
                });
            }

            const filteredRecentlyUsedOptions = recentlyUsedOptions.filter((option) => option !== selectedValue);
            if (filteredRecentlyUsedOptions.length > 0) {
                newSections.push({
                    title: translate('common.recents'),
                    shouldShow: true,
                    data: filteredRecentlyUsedOptions.map((option) => ({
                        text: option,
                        keyForList: option,
                        searchText: option,
                        tooltipText: option,
                        isSelected: option === fieldValue,
                    })),
                });
            }

            const filteredFieldOptions = fieldOptions.filter((option) => option !== selectedValue);
            if (filteredFieldOptions.length > 0) {
                newSections.push({
                    title: translate('common.all'),
                    shouldShow: true,
                    data: filteredFieldOptions.map((option) => ({
                        text: option,
                        keyForList: option,
                        searchText: option,
                        tooltipText: option,
                        isSelected: option === fieldValue,
                    })),
                });
            }
        }

        return {sections: newSections, headerMessage: newHeaderMessage};
    }, [fieldValue, fieldOptions, recentlyUsedOptions, searchValue, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditReportFieldDropdownPage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton title={fieldName} />
                    <SelectionList
                        ListItem={RadioListItem}
                        containerStyle={{paddingBottom: getSafeAreaMargins(insets).marginBottom}}
                        textInputLabel={translate('common.search')}
                        sections={sections}
                        sectionTitleStyles={styles.mt5}
                        textInputValue={searchValue}
                        onSelectRow={(option) => onSubmit({[fieldKey]: fieldValue === option.text ? '' : option.text})}
                        onChangeText={setSearchValue}
                        isRowMultilineSupported
                        headerMessage={headerMessage}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

EditReportFieldDropdownPage.displayName = 'EditReportFieldDropdownPage';

export default withOnyx<EditReportFieldDropdownPageProps, EditReportFieldDropdownPageOnyxProps>({
    recentlyUsedReportFields: {
        key: () => ONYXKEYS.RECENTLY_USED_REPORT_FIELDS,
    },
})(EditReportFieldDropdownPage);
