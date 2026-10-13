import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import Section from '@components/Section';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

type WorkspaceInvoicingDetailsSectionProps = {
    policyID: string;

    /** Whether the current user can edit miscellaneous settings. */
    canWriteMoreFeatures: boolean;
};

function WorkspaceInvoicingDetailsSection({policyID, canWriteMoreFeatures}: WorkspaceInvoicingDetailsSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {cardPaddingHorizontal, cardPaddingTop} = useLayoutSpacing();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const horizontalPadding = cardPaddingHorizontal;

    return (
        <Section
            title={translate('workspace.invoices.invoicingDetails')}
            subtitle={translate('workspace.invoices.invoicingDetailsDescription')}
            containerStyles={[styles.ph0, cardPaddingTop]}
            subtitleStyles={horizontalPadding}
            titleStyles={[styles.accountSettingsSectionTitle, horizontalPadding]}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItem.Root
                key={translate('workspace.invoices.companyName')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_NAME}
                onPress={canWriteMoreFeatures ? callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_NAME.getRoute(policyID))) : undefined}
                style={horizontalPadding}
            >
                <MenuItemField.Row
                    name={translate('workspace.invoices.companyName')}
                    value={policy?.invoice?.companyName}
                >
                    {canWriteMoreFeatures && <MenuItem.Chevron />}
                </MenuItemField.Row>
            </MenuItem.Root>
            <MenuItem.Root
                key={translate('workspace.invoices.companyWebsite')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_WEBSITE}
                onPress={canWriteMoreFeatures ? callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_WEBSITE.getRoute(policyID))) : undefined}
                style={horizontalPadding}
            >
                <MenuItemField.Row
                    name={translate('workspace.invoices.companyWebsite')}
                    value={policy?.invoice?.companyWebsite}
                >
                    {canWriteMoreFeatures && <MenuItem.Chevron />}
                </MenuItemField.Row>
            </MenuItem.Root>
        </Section>
    );
}

export default WorkspaceInvoicingDetailsSection;
