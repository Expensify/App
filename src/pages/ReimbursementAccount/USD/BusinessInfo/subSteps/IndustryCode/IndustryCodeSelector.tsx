import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
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

    const codeOptions = useMemo(() => {
        if (!searchValue) {
            return NAICS.map((item) => {
                return {
                    value: `${item.id}`,
                    text: `${item.id} - ${item.value}`,
                    keyForList: `${item.id}`,
                };
            });
        }

        if (shouldDisplayChildItems) {
            return (NAICS_MAPPING_WITH_ID[searchValue] ?? []).map((item) => {
                return {
                    value: `${item.id}`,
                    text: `${item.id} - ${item.value}`,
                    keyForList: `${item.id}`,
                };
            });
        }

        return ALL_NAICS.filter((item) => item.id.toString().toLowerCase().startsWith(searchValue.toLowerCase())).map((item) => {
            return {
                value: `${item.id}`,
                text: `${item.id} - ${item.value}`,
                keyForList: `${item.id}`,
            };
        });
    }, [searchValue, shouldDisplayChildItems]);

    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('companyStep.industryClassificationCodePlaceholder'),
            onChangeText: (val: string | undefined) => {
                setSearchValue(val);
                setShouldDisplayChildItems(false);
                onInputChange?.(val);
            },
            value: searchValue,
            errorText,
        }),
        [errorText, onInputChange, searchValue, translate],
    );

    return (
        <View style={styles.flexGrow1}>
            <SelectionList
                data={codeOptions}
                ListItem={RadioListItem}
                onSelectRow={(item) => {
                    setSearchValue(item.value);
                    setShouldDisplayChildItems(true);
                    onInputChange?.(item.value);
                }}
                shouldStopPropagation
                textInputOptions={textInputOptions}
            />
        </View>
    );
}

export default IndustryCodeSelector;
