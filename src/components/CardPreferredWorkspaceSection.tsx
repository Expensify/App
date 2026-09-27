import useCardPreferredWorkspace from '@hooks/useCardPreferredWorkspace';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import {clearCompanyCardErrorField} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Card, CardFeedWithDomainID} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import React from 'react';
import {View} from 'react-native';

import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import OfflineWithFeedback from './OfflineWithFeedback';
import Text from './Text';

type CardPreferredWorkspaceSectionProps = {
    /** The card whose preferred workspace is being configured */
    card: Card | undefined;

    /** Fund (workspace or domain) account ID that owns the feed */
    domainOrWorkspaceAccountID: number;

    /** Feed segment of the WORKSPACE_CARDS_LIST key */
    bank: CardFeedWithNumber;

    /** Feed with the domain ID suffix */
    feedWithDomainID: CardFeedWithDomainID;

    /** Whether the viewer has write access to the card feature on this workspace */
    canWrite: boolean;
};

/**
 * "Preferred workspace" section shown on every Expensify Card and BYOC card details page.
 */
function CardPreferredWorkspaceSection({card, domainOrWorkspaceAccountID, bank, feedWithDomainID, canWrite}: CardPreferredWorkspaceSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {title, helperText, isInteractive} = useCardPreferredWorkspace(card);

    return (
        <>
            <View style={[styles.mh5, styles.pt3, styles.borderTop]}>
                <Text style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.card.preferredWorkspace.title')}</Text>
            </View>
            <OfflineWithFeedback
                pendingAction={card?.nameValuePairs?.pendingFields?.preferredPolicy}
                errorRowStyles={[styles.ph5, styles.mb3]}
                errors={getLatestErrorField(card?.nameValuePairs ?? {}, 'preferredPolicy')}
                onClose={() => clearCompanyCardErrorField(domainOrWorkspaceAccountID, String(card?.cardID), bank, 'preferredPolicy')}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.card.preferredWorkspace.title')}
                    title={title}
                    helperText={helperText}
                    shouldParseHelperText={!!helperText}
                    shouldShowRightIcon={canWrite && isInteractive}
                    interactive={canWrite && isInteractive}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CARD_PREFERRED_WORKSPACE.getRoute(feedWithDomainID, String(card?.cardID))))}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.CARD_PREFERRED_WORKSPACE}
                />
            </OfflineWithFeedback>
        </>
    );
}

export default CardPreferredWorkspaceSection;
