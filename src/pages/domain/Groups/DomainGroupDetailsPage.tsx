import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearDomainSecurityGroupSettingError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DefaultGroupToggle from './DefaultGroupToggle';
import DeleteGroupRow from './DeleteGroupRow';
import PreferredWorkspaceToggle from './PreferredWorkspaceToggle';
import RestrictDefaultLoginSelectionToggle from './RestrictDefaultLoginSelectionToggle';
import RestrictExpenseWorkspaceCreationToggle from './RestrictExpenseWorkspaceCreationToggle';
import StrictlyEnforceWorkspaceRulesToggle from './StrictlyEnforceWorkspaceRulesToggle';

type DomainGroupDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_DETAILS>;

function DomainGroupDetailsPage({route}: DomainGroupDetailsPageProps) {
    const styles = useThemeStyles();
    const {domainAccountID, groupID} = route.params;

    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [namePendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: domainSecurityGroupSettingPendingActionSelector('name', groupID)});
    const [nameErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: domainSecurityGroupSettingErrorsSelector('nameErrors', groupID)});

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="DomainGroupDetailsPage"
            >
                <HeaderWithBackButton
                    title={group?.name}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID))}
                />
                <ScrollView>
                    <OfflineWithFeedback
                        pendingAction={namePendingAction}
                        errors={nameErrors}
                        onClose={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'nameErrors')}
                        errorRowStyles={[styles.mh5]}
                    >
                        <MenuItemWithTopDescription
                            description={translate('common.name')}
                            title={group?.name}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_EDIT_NAME.getRoute(domainAccountID, groupID))}
                        />
                    </OfflineWithFeedback>
                    <DefaultGroupToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                        groupName={group?.name}
                    />
                    <View style={[styles.sectionDividerLine, styles.mh5, styles.mv6]} />
                    <Text style={[styles.textNormal, styles.textStrong, styles.ph5]}>{translate('domain.groups.permissions')}</Text>
                    <StrictlyEnforceWorkspaceRulesToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                    <RestrictDefaultLoginSelectionToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                    <RestrictExpenseWorkspaceCreationToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                    <PreferredWorkspaceToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                    <DeleteGroupRow
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                    />
                </ScrollView>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupDetailsPage;
