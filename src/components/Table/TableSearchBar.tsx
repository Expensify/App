import React, {useEffect} from 'react';
import TextInput from '@components/TextInput';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useTableContext} from './TableContext';

/**
 * Renders a search input that filters table data.
 */
type TableSearchBarProps = {
    /** Label and accessibility label for the search input. */
    label: string;
};

function TableSearchBar({label}: TableSearchBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const {
        activeSearchString,
        shouldUseNarrowTableLayout,
        tableMethods: {updateSearchString},
    } = useTableContext();

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const textInputContainerStyles = [styles.border, styles.borderRadiusComponentNormal, styles.appBG, styles.p2];
    const touchableInputWrapperStyle = [styles.mnw200, shouldUseNarrowTableLayout && styles.w100, !shouldUseNarrowTableLayout ? styles.h8 : styles.h11];

    return (
        <TextInput
            hideFocusedState
            multiline={false}
            spellCheck={false}
            autoCorrect={false}
            placeholder={label}
            role={CONST.ROLE.SEARCHBOX}
            inputMode={CONST.INPUT_MODE.TEXT}
            placeholderTextColor={theme.textSupporting}
            shouldShowClearButton={activeSearchString.length > 0}
            inputStyle={styles.textLabel}
            textInputContainerStyles={textInputContainerStyles}
            touchableInputWrapperStyle={touchableInputWrapperStyle}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default TableSearchBar;
