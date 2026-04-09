import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {ALL_NAICS, NAICS, NAICS_MAPPING_WITH_ID} from '@src/NAICS';

type IndustryCodeSelectorProps = {
    onInputChange?: (value: string | undefined) => void;
    value?: string;
    errorText?: string;
};

function IndustryCodeSelector({onInputChange, value, errorText}: IndustryCodeSelectorProps) {
    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle<ListItem>>(null);
    const [searchValue, setSearchValue] = useState<string | undefined>(value);
    const [isReady, setIsReady] = useState(false);

    const [shouldDisplayChildItems, setShouldDisplayChildItems] = useState(false);
    const {translate} = useLocalize();

    // Delay rendering the list and focusing the input until the screen transition animation completes.
    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                setIsReady(true);
                selectionListRef.current?.focusTextInput();
            }, CONST.ANIMATED_TRANSITION);

            return () => clearTimeout(timeout);
        }, []),
    );

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
            disableAutoFocus: true,
            errorText,
        }),
        [errorText, onInputChange, searchValue, translate],
    );

    return (
        <View style={styles.flexGrow1}>
            <SelectionList
                ref={selectionListRef}
                data={isReady ? codeOptions : []}
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
