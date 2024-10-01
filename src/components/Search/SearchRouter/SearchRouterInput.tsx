import React from 'react';
import type {RefObject} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {SelectionListHandle} from '@components/SelectionList/types';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type SearchRouterInputProps = {
    /** Value of TextInput */
    value: string;

    /** Setter to TextInput value */
    setValue: (searchTerm: string) => void;

    /** Callback to update search in SearchRouter */
    updateSearch: (searchTerm: string) => void;

    /** SearchRouterList ref for managing TextInput and SearchRouterList focus */
    routerListRef: RefObject<SelectionListHandle>;
};

function SearchRouterInput({value, setValue, updateSearch, routerListRef}: SearchRouterInputProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const onChangeText = (text: string) => {
        setValue(text);
        updateSearch(text);
    };

    return (
        <BaseTextInput
            value={value}
            onChangeText={onChangeText}
            autoFocus
            containerStyles={[isSmallScreenWidth ? styles.pv3 : styles.pv2, isSmallScreenWidth ? styles.ph5 : styles.ph2]}
            textInputContainerStyles={[styles.w100, styles.searchRouterTextInputContainerStyle]}
            inputStyle={[styles.searchInputStyle, styles.ph2]}
            loadingSpinnerStyle={styles.mt0}
            role={CONST.ROLE.PRESENTATION}
            placeholder={translate('search.searchPlaceholder')}
            autoCapitalize="none"
            onFocus={() => {
                routerListRef?.current?.updateExternalTextInputFocus(true);
            }}
            onBlur={() => {
                routerListRef?.current?.updateExternalTextInputFocus(false);
            }}
            isLoading={!!isSearchingForReports}
        />
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
