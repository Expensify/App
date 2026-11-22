import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {hasExpensifyCardFeedSelector} from '@hooks/useIsDomainUsingCard';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {clearDomainSecurityGroupSettingError} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';

import DefaultGroupToggle from './DefaultGroupToggle';
import DeleteGroupRow from './DeleteGroupRow';
import ExpensifyCardPreferredWorkspaceToggle from './ExpensifyCardPreferredWorkspaceToggle';
import PreferredWorkspaceToggle from './PreferredWorkspaceToggle';
import RestrictDefaultLoginSelectionToggle from './RestrictDefaultLoginSelectionToggle';
import RestrictExpenseWorkspaceCreationToggle from './RestrictExpenseWorkspaceCreationToggle';
import StrictlyEnforceWorkspaceRulesToggle from './StrictlyEnforceWorkspaceRulesToggle';

type DomainGroupDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_DETAILS>;

function DomainGroupDetailsPage({route}: DomainGroupDetailsPageProps) {
    const styles = useThemeStyles();
    const {domainAccountID, groupID} = route.params;

    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const cardCurrency = useCurrencyForExpensifyCard({fundID: domainAccountID});

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [namePendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: domainSecurityGroupSettingPendingActionSelector('name', groupID)});
    const [nameErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: domainSecurityGroupSettingErrorsSelector('nameErrors', groupID)});

    const [hasExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`, {selector: hasExpensifyCardFeedSelector});
    const [cardLimitPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('defaultCardUnapprovedExpenseLimit', groupID),
    });
    const [cardLimitErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingErrorsSelector('defaultCardUnapprovedExpenseLimitErrors', groupID),
    });

    const [deleteGroupPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: domainSecurityGroupSettingPendingActionSelector('deleteGroup', groupID),
    });

    return (
        <DomainNotFoundPageWrapper
            domainAccountID={domainAccountID}
            shouldBeBlocked={!group || !!deleteGroupPendingAction}
            fullPageNotFoundViewProps={{
                onBackButtonPress: () => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID)),
            }}
        >
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
                        <MenuItemField
                            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.GROUPS.NAME}
                            name={translate('common.name')}
                            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_EDIT_NAME.getRoute(domainAccountID, groupID))}
                            value={group?.name}
                        />
                    </OfflineWithFeedback>
                    {!!hasExpensifyCardFeed && (
                        <OfflineWithFeedback
                            pendingAction={cardLimitPendingAction}
                            errors={cardLimitErrors}
                            onClose={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'defaultCardUnapprovedExpenseLimitErrors')}
                            errorRowStyles={[styles.mh5]}
                        >
                            <MenuItemField
                                sentryLabel={CONST.SENTRY_LABEL.DOMAIN.GROUPS.CARD_LIMIT}
                                name={translate('workspace.expensifyCard.cardLimit')}
                                onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_EDIT_CARD_LIMIT.getRoute(domainAccountID, groupID))}
                                value={convertToDisplayString(group?.defaultCardUnapprovedExpenseLimit ?? 0, cardCurrency)}
                            />
                        </OfflineWithFeedback>
                    )}
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
                    <ExpensifyCardPreferredWorkspaceToggle
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
