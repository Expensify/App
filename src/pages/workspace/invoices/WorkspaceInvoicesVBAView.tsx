import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';

type WorkspaceInvoicesVBAViewProps = {
    /** The polgicy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoicesVBAView({policyID}: WorkspaceInvoicesVBAViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const viewUnpaidInvoicesUrl = `reports?policyID=${policyID}&from=all&type=invoice&showStates=Processing&isAdvancedFilterMode=true`;

    return (
        <>
            <WorkspaceInvoicesFirstSection policyID={policyID} />

            <Section
                title={translate('workspace.invoices.moneyBackInAFlash')}
                icon={Illustrations.MoneyBadge}
                isCentralPane
                menuItems={[
                    {
                        title: translate('workspace.invoices.viewUnpaidInvoices'),
                        onPress: () => Link.openOldDotLink(viewUnpaidInvoicesUrl),
                        icon: Expensicons.Hourglass,
                        shouldShowRightIcon: true,
                        iconRight: Expensicons.NewWindow,
                        wrapperStyle: [styles.cardMenuItem],
                        link: () => Link.buildOldDotURL(viewUnpaidInvoicesUrl),
                    },
                ]}
            >
                <View style={[styles.mv3]}>
                    <Text>{translate('workspace.invoices.unlockVBACopy')}</Text>
                </View>
            </Section>
        </>
    );
}

WorkspaceInvoicesVBAView.displayName = 'WorkspaceInvoicesVBAView';

export default WorkspaceInvoicesVBAView;
