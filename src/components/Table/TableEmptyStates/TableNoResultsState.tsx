import ActivityIndicator from '@components/ActivityIndicator';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type TableNoResultsStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia' | 'title' | 'subtitle'> & {
    headerMedia?: IconAsset;
    title?: string;
    subtitle?: string;

    /** Shows a spinner in place of the no-results content while an async search is in flight. */
    shouldShowLoadingIndicator?: boolean;
};

export default function TableNoResultsState({shouldShowLoadingIndicator, ...emptyStateProps}: TableNoResultsStateProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isEmptyResult, isDefaultViewEmpty, tableListMetadata} = useTableContext();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    // The default view hiding every row is not a search/filter result, so the empty state handles it instead.
    if (!isEmptyResult || isDefaultViewEmpty) {
        return null;
    }

    if (shouldShowLoadingIndicator) {
        return (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                />
            </View>
        );
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

    // TableBody keeps page-header no-results content in its scrolling list footer, so this state
    // does not need a nested ScrollView.
    if (tableListMetadata.hasPageHeader) {
        return <View style={styles.flexShrink0}>{content}</View>;
    }

    return <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>{content}</ScrollView>;
}
