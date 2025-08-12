import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import ContentLoader from '@components/SkeletonViewContentLoader';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

// we need to delay the first render of the SearchAutocompleteInput on native because initialization takes especially long, web doesn't have this issue
let isAutocompleteInputInitialized = false;
function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const [delayFirstRender, setDelayFirstRender] = useState(!isAutocompleteInputInitialized);
    const theme = useTheme();
    const styles = useThemeStyles();

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            setDelayFirstRender(false);
            isAutocompleteInputInitialized = true;
        }, 100);

        return () => clearTimeout(timeoutID);
    }, []);

    if (delayFirstRender) {
        return (
            <View style={[styles.flex1, styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
                <ContentLoader
                    height={variables.searchAutocompleteInputSkeletonHeight}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                    style={[styles.ml1]}
                >
                    <Rect
                        x="0"
                        y="0"
                        width={variables.searchAutocompleteInputSkeletonWidth}
                        height={variables.searchAutocompleteInputSkeletonHeight}
                    />
                </ContentLoader>
            </View>
        );
    }

    return (
        <SearchAutocompleteInput
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            selection={undefined}
        />
    );
}

SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';

export default forwardRef(SearchInputSelectionWrapper);
