import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';
import WorkspaceBillsFirstSection from './WorkspaceBillsFirstSection';

type WorkspaceBillsVBAViewProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceBillsVBAView({policyID}: WorkspaceBillsVBAViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const reportsUrl = `reports?policyID=${policyID}&from=all&type=bill&showStates=Processing,Approved&isAdvancedFilterMode=true`;

    return (
        <>
            <WorkspaceBillsFirstSection policyID={policyID} />

            <Section
                title={translate('workspace.bills.hassleFreeBills')}
                icon={Illustrations.MoneyBadge}
                isCentralPane
                menuItems={[
                    {
                        title: translate('workspace.common.bills'),
                        onPress: () => Link.openOldDotLink(reportsUrl),
                        icon: Expensicons.Bill,
                        shouldShowRightIcon: true,
                        iconRight: Expensicons.NewWindow,
                        wrapperStyle: [styles.cardMenuItem],
                        link: () => Link.buildOldDotURL(reportsUrl),
                    },
                ]}
            >
                <View style={styles.mv3}>
                    <Text>{translate('workspace.bills.VBACopy')}</Text>
                </View>
            </Section>
        </>
    );
}

WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default WorkspaceBillsVBAView;
