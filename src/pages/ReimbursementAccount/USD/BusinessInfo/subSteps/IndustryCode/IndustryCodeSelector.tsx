import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {ALL_NAICS, NAICS, NAICS_MAPPING_WITH_ID} from '@src/NAICS';

type IndustryCodeSelectorProps = {
    onInputChange?: (value: string | undefined) => void;
    value?: string;
    errorText?: string;
};

function IndustryCodeSelector({onInputChange, value, errorText}: IndustryCodeSelectorProps) {
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState<string | undefined>(value);

    const [shouldDisplayChildItems, setShouldDisplayChildItems] = useState(false);
    const {translate} = useLocalize();

    const sections = useMemo(() => {
        if (!searchValue) {
            return [
                {
                    data: NAICS.map((item) => {
                        return {
                            value: `${item.id}`,
                            text: `${item.id} - ${item.value}`,
                            keyForList: `${item.id}`,
                        };
                    }),
                },
            ];
        }

        if (shouldDisplayChildItems) {
            return [
                {
                    data: (NAICS_MAPPING_WITH_ID[searchValue] ?? []).map((item) => {
                        return {
                            value: `${item.id}`,
                            text: `${item.id} - ${item.value}`,
                            keyForList: `${item.id}`,
                        };
                    }),
                },
            ];
        }

        return [
            {
                data: ALL_NAICS.filter((item) => item.id.toString().toLowerCase().startsWith(searchValue.toLowerCase())).map((item) => {
                    return {
                        value: `${item.id}`,
                        text: `${item.id} - ${item.value}`,
                        keyForList: `${item.id}`,
                    };
                }),
            },
        ];
    }, [searchValue, shouldDisplayChildItems]);

    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    return (
        <View style={styles.flexGrow1}>
            <SelectionList
                sections={sections}
                ListItem={RadioListItem}
                onSelectRow={(item) => {
                    setSearchValue(item.value);
                    setShouldDisplayChildItems(true);
                    onInputChange?.(item.value);
                }}
                shouldStopPropagation
                textInputLabel={translate('companyStep.industryClassificationCodePlaceholder')}
                onChangeText={(val) => {
                    setSearchValue(val);
                    setShouldDisplayChildItems(false);
                    onInputChange?.(val);
                }}
                textInputValue={searchValue}
                errorText={errorText}
            />
        </View>
    );
}

IndustryCodeSelector.displayName = 'IndustryCodeSelector';

export default IndustryCodeSelector;
