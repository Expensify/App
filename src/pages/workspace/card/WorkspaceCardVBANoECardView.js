import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {Concierge} from '../../../components/Icon/Expensicons';
import {JewelBoxBlue} from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import WorkspaceSection from '../WorkspaceSection';
import {navigateToConciergeChat} from '../../../libs/actions/Report';
import Navigation from "../../../libs/Navigation/Navigation";

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceCardVBANoECardView = ({translate}) => (
    <WorkspaceSection
        title={translate('workspace.card.header')}
        icon={JewelBoxBlue}
        menuItems={[
            {
                title: translate('workspace.card.chatWithConcierge'),
                onPress: () => {
                    Navigation.dismissModal();
                    navigateToConciergeChat();
                },
                icon: Concierge,
                shouldShowRightIcon: true,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>{translate('workspace.card.VBANoECardCopy')}</Text>
        </View>

        <UnorderedList
            items={[
                translate('workspace.card.benefit1'),
                translate('workspace.card.benefit2'),
                translate('workspace.card.benefit3'),
                translate('workspace.card.benefit4'),
            ]}
        />

        <View style={[styles.mv4]}>
            <Text>{translate('workspace.card.conciergeCanHelp')}</Text>
        </View>
    </WorkspaceSection>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default withLocalize(WorkspaceCardVBANoECardView);
