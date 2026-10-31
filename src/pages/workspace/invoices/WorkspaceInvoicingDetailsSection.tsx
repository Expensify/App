import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import Section from '@components/Section';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type WorkspaceInvoicingDetailsSectionProps = {
    policyID: string;

    /** Whether the current user can edit miscellaneous settings. */
    canWriteMoreFeatures: boolean;
};

function WorkspaceInvoicingDetailsSection({policyID, canWriteMoreFeatures}: WorkspaceInvoicingDetailsSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <Section
            title={translate('workspace.invoices.invoicingDetails')}
            subtitle={translate('workspace.invoices.invoicingDetailsDescription')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemSectionRoot
                key={translate('workspace.invoices.companyName')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_NAME}
                onPress={
                    canWriteMoreFeatures ? callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_NAME.getRoute(policyID)), false, session) : undefined
                }
            >
                <MenuItemField.Row
                    name={translate('workspace.invoices.companyName')}
                    value={policy?.invoice?.companyName}
                >
                    {canWriteMoreFeatures && <MenuItem.Chevron />}
                </MenuItemField.Row>
            </MenuItemSectionRoot>
            <MenuItemSectionRoot
                key={translate('workspace.invoices.companyWebsite')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_WEBSITE}
                onPress={
                    canWriteMoreFeatures ? callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_WEBSITE.getRoute(policyID)), false, session) : undefined
                }
            >
                <MenuItemField.Row
                    name={translate('workspace.invoices.companyWebsite')}
                    value={policy?.invoice?.companyWebsite}
                >
                    {canWriteMoreFeatures && <MenuItem.Chevron />}
                </MenuItemField.Row>
            </MenuItemSectionRoot>
        </Section>
    );
}

export default WorkspaceInvoicingDetailsSection;
