import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
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

    /** ID of the policy report field */
    fieldID: string;

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

function EditReportFieldDropdownPage({fieldName, onSubmit, fieldID, fieldValue, fieldOptions, recentlyUsedReportFields}: EditReportFieldDropdownPageProps) {
    const [searchValue, setSearchValue] = useState('');
    const styles = useThemeStyles();
    const {getSafeAreaMargins} = useStyleUtils();
    const {translate} = useLocalize();
    const recentlyUsedOptions = useMemo(() => recentlyUsedReportFields?.[fieldID] ?? [], [recentlyUsedReportFields, fieldID]);
    const [headerMessage, setHeaderMessage] = useState('');

    const sections = useMemo(() => {
        const filteredRecentOptions = recentlyUsedOptions.filter((option) => option.toLowerCase().includes(searchValue.toLowerCase()));
        const filteredRestOfOptions = fieldOptions.filter((option) => !filteredRecentOptions.includes(option) && option.toLowerCase().includes(searchValue.toLowerCase()));
        setHeaderMessage(!filteredRecentOptions.length && !filteredRestOfOptions.length ? translate('common.noResultsFound') : '');

        return [
            {
                title: translate('common.recents'),
                shouldShow: filteredRecentOptions.length > 0,
                data: filteredRecentOptions.map((option) => ({
                    text: option,
                    keyForList: option,
                    searchText: option,
                    tooltipText: option,
                })),
            },
            {
                title: translate('common.all'),
                shouldShow: filteredRestOfOptions.length > 0,
                data: filteredRestOfOptions.map((option) => ({
                    text: option,
                    keyForList: option,
                    searchText: option,
                    tooltipText: option,
                })),
            },
        ];
    }, [fieldOptions, recentlyUsedOptions, searchValue, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditReportFieldDropdownPage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton title={fieldName} />
                    <OptionsSelector
                        // @ts-expect-error TODO: TS migration
                        contentContainerStyles={[{paddingBottom: getSafeAreaMargins(insets).marginBottom}]}
                        optionHoveredStyle={styles.hoveredComponentBG}
                        sectionHeaderStyle={styles.mt5}
                        selectedOptions={[{name: fieldValue}]}
                        textInputLabel={translate('common.search')}
                        boldStyle
                        sections={sections}
                        value={searchValue}
                        onSelectRow={(option: Record<string, string>) => onSubmit({[fieldID]: option.text})}
                        onChangeText={setSearchValue}
                        highlightSelectedOptions
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
