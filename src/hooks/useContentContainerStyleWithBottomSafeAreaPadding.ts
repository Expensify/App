import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useStyledSafeAreaInsets from './useStyledSafeAreaInsets';

function useContentContainerStyleWithBottomSafeAreaPadding(addBottomSafeAreaPaddingToContent: boolean, contentContainerStyleProp: StyleProp<ViewStyle> | undefined) {
    const {paddingBottom: safeAreaPaddingBottom} = useStyledSafeAreaInsets();

    return useMemo<StyleProp<ViewStyle>>(() => {
        if (addBottomSafeAreaPaddingToContent) {
            const contentContainerStyleFlattened = contentContainerStyleProp === undefined ? undefined : StyleSheet.flatten(contentContainerStyleProp);
            const paddingBottom = contentContainerStyleFlattened?.paddingBottom ?? 0;
            return [contentContainerStyleProp, {paddingBottom: typeof paddingBottom === 'number' ? safeAreaPaddingBottom + paddingBottom : safeAreaPaddingBottom}];
        }
        return contentContainerStyleProp;
    }, [addBottomSafeAreaPaddingToContent, contentContainerStyleProp, safeAreaPaddingBottom]);
}

export default useContentContainerStyleWithBottomSafeAreaPadding;
