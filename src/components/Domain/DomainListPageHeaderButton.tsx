import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type DomainListPageHeaderButtonProps = {
    /** Whether the button to claim a new domain should be shown. */
    shouldShowNewDomainButton: boolean;
};

function DomainListPageHeaderButton({shouldShowNewDomainButton}: DomainListPageHeaderButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const buttonStyle = shouldDisplayButtonsInSeparateLine && [styles.flexGrow1, styles.mb3];

    if (shouldShowNewDomainButton) {
        return (
            <Button
                accessibilityLabel={translate('domain.addDomain.newDomain')}
                text={translate('domain.addDomain.newDomain')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_DOMAIN_BUTTON}
                onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN))}
                icon={icons.Plus}
                style={buttonStyle}
            />
        );
    }

    return null;
}

export default DomainListPageHeaderButton;
