import React from 'react';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function DomainListEmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithControls']);

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.EarthWithControls}
            headerContentStyles={styles.emptyDomainListStaticIllustrationStyle}
            title={translate('workspace.emptyDomain.title')}
            subtitle={translate('workspace.emptyDomain.subtitle')}
            titleStyles={styles.pt2}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            containerStyles={styles.mb10}
            buttons={[
                {
                    success: true,
                    buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN)),
                    buttonText: translate('domain.addDomain.newDomain'),
                },
            ]}
        />
    );
}

export default DomainListEmptyState;
