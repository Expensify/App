import React from 'react';
import {View, Text} from 'react-native';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    NewWindow,
    ExpensifyCard,
    ReceiptSearch,
} from '../../../components/Icon/Expensicons';
import {CreditCardsBlue} from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import {openSignedInLink} from '../../../libs/actions/App';
import WorkspaceSection from '../WorkspaceSection';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBAWithECardView = ({translate}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.card.headerWithEcard')}
            icon={CreditCardsBlue}
            menuItems={[
                {
                    title: translate('workspace.common.issueAndManageCards'),
                    onPress: () => openSignedInLink('domain_companycards'),
                    icon: ExpensifyCard,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
                {
                    title: translate('workspace.common.reconcileCards'),
                    onPress: () => openSignedInLink('domain_companycards?param={"section":"cardReconciliation"}'),
                    icon: ReceiptSearch,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.card.VBAWithECardCopy')}</Text>
            </View>

            <UnorderedList
                items={[
                    translate('workspace.card.benefit1'),
                    translate('workspace.card.benefit2'),
                    translate('workspace.card.benefit3'),
                    translate('workspace.card.benefit4'),
                ]}
            />
        </WorkspaceSection>
    </>
);

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
