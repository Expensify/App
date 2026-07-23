import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';

import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type TableEmptyStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia'> & {
    headerMedia?: IconAsset | undefined;
    children?: React.ReactNode;
};

export default function TableEmptyState({children, ...emptyStateProps}: TableEmptyStateProps) {
    const styles = useThemeStyles();
    const {originalDataLength, tableListMetadata} = useTableContext();
    // We default the empty state to the default folders illustration, but passed props override it
    const genericIllustration = useGenericEmptyStateIllustration();

    if (originalDataLength) {
        return null;
    }

    const content = (
        <>
            <GenericEmptyStateComponent
                {...genericIllustration}
                {...emptyStateProps}
            />
            {children}
        </>
    );

    // TableBody owns the page-header flex layout and centers this content in the remaining space,
    // so the empty state does not need a nested ScrollView.
    if (tableListMetadata.hasPageHeader) {
        return <View style={styles.flexShrink0}>{content}</View>;
    }

    return <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>{content}</ScrollView>;
}

export type {TableEmptyStateProps};
