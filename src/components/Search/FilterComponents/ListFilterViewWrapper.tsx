import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {useListFilterHeightContext} from './ListFilterHeightContext';

type ListFilterWrapperProps = {
    children: React.ReactNode;
    itemCount: number;
    itemHeight?: number;
    hasTitle?: boolean;
    hasHeader?: boolean;
    isSearchable?: boolean;
    extraHeight?: number;
};

function ListFilterView({children, itemCount, itemHeight, hasTitle = true, hasHeader, isSearchable, extraHeight}: ListFilterWrapperProps) {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();

    return (
        <View
            style={[
                styles.getSelectionListPopoverHeight({
                    itemCount: itemCount || 1,
                    itemHeight,
                    windowHeight,
                    isInLandscapeMode,
                    hasTitle: hasTitle && !hasHeader && isSmallScreenWidth,
                    hasHeader,
                    isSearchable,
                    extraHeight,
                }),
            ]}
        >
            {children}
        </View>
    );
}

function ListFilterWrapper({children, ...props}: ListFilterWrapperProps) {
    const shouldApplyPopoverHeight = useListFilterHeightContext();

    if (!shouldApplyPopoverHeight) {
        return children;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading -- ListFilterWrapper is a wrapper that forwards all props to the underlying ListFilterView
    return <ListFilterView {...props}>{children}</ListFilterView>;
}

export default ListFilterWrapper;
