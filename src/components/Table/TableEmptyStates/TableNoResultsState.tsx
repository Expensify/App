import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type TableNoResultsStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia' | 'title' | 'subtitle'> & {
    headerMedia?: IconAsset;
    title?: string;
    subtitle?: string;
};

export default function TableNoResultsState(emptyStateProps: TableNoResultsStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isEmptyResult, tableListMetadata} = useTableContext();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    if (!isEmptyResult) {
        return null;
    }

    const content = (
        <GenericEmptyStateComponent
            headerMedia={illustrations.EmptyShelves}
            headerContentStyles={styles.emptyShelvesIllustration}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            title={translate('common.noResultsFound')}
            subtitle={translate('common.noResultsFoundSubtitle')}
            {...emptyStateProps}
        />
    );

    // With a scrolling page header this renders as a row inside the table's FlashList, which
    // already provides scrolling, so the ScrollView wrapper is skipped to avoid nested scrolling.
    if (tableListMetadata.hasPageHeader) {
        return <View style={[styles.flexGrow1, styles.flexShrink0]}>{content}</View>;
    }

    return <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>{content}</ScrollView>;
}
