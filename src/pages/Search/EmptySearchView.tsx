import React from 'react';
import {View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function EmptySearchView() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.m4]}>
            <WorkspaceEmptyStateSection
                icon={Illustrations.EmptyStateExpenses}
                title={translate('search.searchResults.emptyResults.title')}
                subtitle={translate('search.searchResults.emptyResults.subtitle')}
            />
        </View>
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
