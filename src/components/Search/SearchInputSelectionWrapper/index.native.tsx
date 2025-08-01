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

function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const [delayFirstRender, setDelayFirstRender] = useState(true);
    const theme = useTheme();
    const styles = useThemeStyles();

    useEffect(() => {
        setTimeout(() => {
            setDelayFirstRender(false);
        }, 100);
    }, []);

    if (delayFirstRender) {
        return (
            <View style={[{flex: 1}, styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
                <ContentLoader
                    height={15}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                >
                    <Rect
                        x="0"
                        y="0"
                        rx="4"
                        ry="4"
                        width="145"
                        height="15"
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
