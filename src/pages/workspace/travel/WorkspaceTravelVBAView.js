import React from 'react';
import {View} from 'react-native';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import * as Link from '../../../libs/actions/Link';
import * as Report from '../../../libs/actions/Report';

const propTypes = {
    ...withLocalizePropTypes,
};

const WorkspaceTravelVBAView = props => (
    <WorkspaceSection
        title={props.translate('workspace.travel.packYourBags')}
        icon={Illustrations.RocketOrange}
        menuItems={[
            {
                title: props.translate('workspace.common.issueAndManageCards'),
                onPress: () => Link.openOldDotLink('domain_companycards'),
                icon: Expensicons.ExpensifyCard,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
            {
                title: props.translate('workspace.travel.bookTravelWithConcierge'),
                onPress: () => {
                    Report.navigateToConciergeChat();
                },
                icon: Expensicons.Concierge,
                shouldShowRightIcon: true,
            },
            {
                title: props.translate('requestorStep.learnMore'),
                onPress: () => Link.openExternalLink('https://community.expensify.com/discussion/7066/introducing-concierge-travel'),
                icon: Expensicons.Info,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <ExpensifyText>{props.translate('workspace.travel.VBACopy')}</ExpensifyText>
        </View>
    </WorkspaceSection>
);

WorkspaceTravelVBAView.propTypes = propTypes;
WorkspaceTravelVBAView.displayName = 'WorkspaceTravelVBAView';

export default withLocalize(WorkspaceTravelVBAView);
