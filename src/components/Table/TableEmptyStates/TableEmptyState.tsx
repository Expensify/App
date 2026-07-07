import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';

import useGenericEmptyStateIllustration from '@hooks/useGenericEmptyStateIllustration';
import useThemeStyles from '@hooks/useThemeStyles';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

type TableEmptyStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia'> & {
    headerMedia?: IconAsset | undefined;
};

export default function TableEmptyState(emptyStateProps: TableEmptyStateProps) {
    const styles = useThemeStyles();
    const {originalDataLength} = useTableContext();
    // We default the empty state to the default folders illustration, but passed props override it
    const genericIllustration = useGenericEmptyStateIllustration();

    if (originalDataLength) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                {...genericIllustration}
                {...emptyStateProps}
            />
        </ScrollView>
    );
}

export type {TableEmptyStateProps};
