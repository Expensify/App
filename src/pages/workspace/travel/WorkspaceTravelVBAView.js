import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Concierge,
    ExpensifyCard,
    NewWindow,
    Info,
} from '../../../components/Icon/Expensicons';
import {RocketOrange} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import {openExternalLink, openOldDotLink} from '../../../libs/actions/Link';
import {navigateToConciergeChat} from '../../../libs/actions/Report';
import Navigation from '../../../libs/Navigation/Navigation';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = ({translate}) => (
    <WorkspaceSection
        title={translate('workspace.travel.packYourBags')}
        icon={RocketOrange}
        menuItems={[
            {
                title: translate('workspace.common.issueAndManageCards'),
                onPress: () => openOldDotLink('domain_companycards'),
                icon: ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
            {
                title: translate('workspace.travel.bookTravelWithConcierge'),
                onPress: () => {
                    Navigation.dismissModal();
                    navigateToConciergeChat();
                },
                icon: Concierge,
                shouldShowRightIcon: true,
            },
            {
                title: translate('requestorStep.learnMore'),
                onPress: () => openExternalLink('https://community.expensify.com/discussion/7066/introducing-concierge-travel'),
                icon: Info,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>{translate('workspace.travel.VBACopy')}</Text>
        </View>
    </WorkspaceSection>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default withLocalize(WorkspaceTravelVBAView);
