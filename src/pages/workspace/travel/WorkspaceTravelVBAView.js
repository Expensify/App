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

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = props => (
    <WorkspaceSection
        title={props.translate('workspace.travel.packYourBags')}
        icon={RocketOrange}
        menuItems={[
            {
                title: props.translate('workspace.common.issueAndManageCards'),
                onPress: () => openOldDotLink('domain_companycards'),
                icon: ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
            {
                title: props.translate('workspace.travel.bookTravelWithConcierge'),
                onPress: () => {
                    navigateToConciergeChat();
                },
                icon: Concierge,
                shouldShowRightIcon: true,
            },
            {
                title: props.translate('requestorStep.learnMore'),
                onPress: () => openExternalLink('https://community.expensify.com/discussion/7066/introducing-concierge-travel'),
                icon: Info,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>{props.translate('workspace.travel.VBACopy')}</Text>
        </View>
    </WorkspaceSection>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default withLocalize(WorkspaceTravelVBAView);
