import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useThemeStyles from '@hooks/useThemeStyles';
import {ALL_NAICS, NAICS, NAICS_MAPPING_WITH_ID} from '@src/NAICS';

type IndustryCodeSelectorProps = {
    value?: string;
    defaultValue?: string;
    onInputChange?: (value: string | undefined) => void;
};

function IndustryCodeSelector({defaultValue, onInputChange}: IndustryCodeSelectorProps) {
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState<string | undefined>(defaultValue);
    const [shouldDisplayChildItems, setShouldDisplayChildItems] = useState(false);
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
                data: ALL_NAICS.filter((item) => item.id.toString().toLowerCase().includes(searchValue.toLowerCase())).map((item) => {
                    return {
                        value: `${item.id}`,
                        text: `${item.id} - ${item.value}`,
                        keyForList: `${item.id}`,
                    };
                }),
            },
        ];
    }, [searchValue, shouldDisplayChildItems]);

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
            />
        </View>
    );
}

IndustryCodeSelector.displayName = 'IndustryCodeSelector';

export default IndustryCodeSelector;
