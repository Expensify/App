import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    NewWindow,
    ExpensifyCard,
    ReceiptSearch,
} from '../../../components/Icon/Expensicons';
import {CreditCardsBlue} from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import {openOldDotLink} from '../../../libs/actions/Link';
import WorkspaceSection from '../WorkspaceSection';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBAWithECardView = props => (
    <WorkspaceSection
        title={props.translate('workspace.card.headerWithEcard')}
        icon={CreditCardsBlue}
        menuItems={[
            {
                title: props.translate('workspace.common.issueAndManageCards'),
                onPress: () => openOldDotLink('domain_companycards'),
                icon: ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
            {
                title: props.translate('workspace.common.reconcileCards'),
                onPress: () => openOldDotLink('domain_companycards?param={"section":"cardReconciliation"}'),
                icon: ReceiptSearch,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>{props.translate('workspace.card.VBAWithECardCopy')}</Text>
        </View>

        <UnorderedList
            items={[
                props.translate('workspace.card.benefit1'),
                props.translate('workspace.card.benefit2'),
                props.translate('workspace.card.benefit3'),
                props.translate('workspace.card.benefit4'),
            ]}
        />
    </WorkspaceSection>
);

WorkspaceCardVBAWithECardView.propTypes = propTypes;
WorkspaceCardVBAWithECardView.displayName = 'WorkspaceCardVBAWithECardView';

export default withLocalize(WorkspaceCardVBAWithECardView);
