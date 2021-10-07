import React from 'react';
import {View, Text, Linking} from 'react-native';
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
import compose from '../../../libs/compose';
import {openSignedInLink} from '../../../libs/actions/App';
import {navigateToConciergeChat} from '../../../libs/actions/Report';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = ({translate}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.travel.packYourBags')}
            icon={RocketOrange}
            menuItems={[
                {
                    title: translate('workspace.common.issueAndManageCards'),
                    onPress: () => openSignedInLink('domain_companycards'),
                    icon: ExpensifyCard,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
                {
                    title: translate('workspace.travel.bookTravelWithConcierge'),
                    onPress: () => navigateToConciergeChat(),
                    icon: Concierge,
                    shouldShowRightIcon: true,
                },
                {
                    title: translate('requestorStep.learnMore'),
                    onPress: () => Linking.openURL('https://community.expensify.com/discussion/7066/introducing-concierge-travel'),
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
    </>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default compose(
    withLocalize,
)(WorkspaceTravelVBAView);
