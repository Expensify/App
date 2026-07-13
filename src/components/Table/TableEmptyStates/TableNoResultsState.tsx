import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

type TableNoResultsStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia' | 'title' | 'subtitle'> & {
    headerMedia?: IconAsset;
    title?: string;
    subtitle?: string;
};

export default function TableNoResultsState(emptyStateProps: TableNoResultsStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isEmptyResult} = useTableContext();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    if (!isEmptyResult) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                headerMedia={illustrations.EmptyShelves}
                headerContentStyles={styles.emptyShelvesIllustration}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                title={translate('common.noResultsFound')}
                subtitle={translate('common.noResultsFoundSubtitle')}
                {...emptyStateProps}
            />
        </ScrollView>
    );
}
