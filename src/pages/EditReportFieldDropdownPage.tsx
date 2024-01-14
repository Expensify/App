import React, {useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsSelector from '@components/OptionsSelector';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

type EditReportFieldDropdownPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

    /** ID of the policy report field */
    fieldID: string;

    /** Options of the policy report field */
    fieldOptions: string[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: Record<string, string>) => void;
};

function EditReportFieldDropdownPage({fieldName, onSubmit, fieldID, fieldValue, fieldOptions}: EditReportFieldDropdownPageProps) {
    const [searchValue, setSearchValue] = useState('');
    const styles = useThemeStyles();
    const {getSafeAreaMargins} = useStyleUtils();
    const {translate} = useLocalize();

    const sections = useMemo(() => {
        const filteredOptions = fieldOptions.filter((option) => option.includes(searchValue));
        return [
            {
                title: translate('common.recents'),
                shouldShow: true,
                data: [],
            },
            {
                title: translate('common.all'),
                shouldShow: true,
                data: filteredOptions.map((option) => ({
                    text: option,
                    keyForList: option,
                    searchText: option,
                    tooltipText: option,
                })),
            },
        ];
    }, [fieldOptions, searchValue, translate]);

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
                        selectedOptions={[{text: fieldValue}]}
                        textInputLabel={translate('common.search')}
                        boldStyle
                        sections={sections}
                        value={searchValue}
                        onSelectRow={(option: Record<string, string>) => onSubmit({[fieldID]: option.text})}
                        onChangeText={setSearchValue}
                        highlightSelectedOptions
                        isRowMultilineSupported
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

EditReportFieldDropdownPage.displayName = 'EditReportFieldDropdownPage';

export default EditReportFieldDropdownPage;
