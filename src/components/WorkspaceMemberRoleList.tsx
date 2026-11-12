import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getSelectableRoles} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';

import type {LocalizedTranslate} from './LocaleContextProvider';
import type {Section} from './SelectionList/SelectionListWithSections/types';
import type {ConfirmButtonOptions, ListItem} from './SelectionList/types';

import Badge from './Badge';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import HeaderWithBackButtonAndTitle from './Header/composed/HeaderWithBackButtonAndTitle';
import RenderHTML from './RenderHTML';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from './SelectionList/SelectionListWithSections';
import Text from './Text';
import TextLink from './TextLink';

type ListItemType = ListItem<ValueOf<typeof CONST.POLICY.ROLE>> & {
    value: ValueOf<typeof CONST.POLICY.ROLE>;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

type WorkspaceMemberRoleListProps = {
    role: string | undefined;
    policy: OnyxEntry<Policy>;
    navigateBackTo?: Route;
    onSelectRole?: (value: ListItemType) => void;

    /** When provided, restricts the selectable roles to this set (e.g. an Authorized Payer may only be an Admin or Payments Admin) */
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>;

    /** When provided, the list confirms the pick with a button instead of applying it as soon as a row is pressed */
    confirmButtonOptions?: ConfirmButtonOptions<ListItemType>;

    /** Shown above the confirm button, for a confirmation pressed without a role picked */
    errorMessage?: string;

    /** Bump to have the error read out again, since a repeated confirmation leaves the message itself unchanged */
    errorAnnouncementKey?: number;
};

const ADMIN_ROLES = new Set<ValueOf<typeof CONST.POLICY.ROLE>>([CONST.POLICY.ROLE.CARD_ADMIN, CONST.POLICY.ROLE.PAYMENTS_ADMIN, CONST.POLICY.ROLE.PEOPLE_ADMIN, CONST.POLICY.ROLE.ADMIN]);

/** Roles we announce to admins as new. They carry a "New" badge until the announcement ends. */
const NEW_ROLES = new Set<ValueOf<typeof CONST.POLICY.ROLE>>([CONST.POLICY.ROLE.APPROVE_ONLY, CONST.POLICY.ROLE.GUEST]);

/**
 * Roles a member can be assigned, in the same order as the role-selection page.
 * Filters by what the current user may assign and any extra restriction (for example an Authorized Payer).
 */
function getAssignableWorkspaceMemberRoleItems(
    translate: LocalizedTranslate,
    currentRole: string | undefined,
    policy: OnyxEntry<Policy>,
    currentUserLogin: string,
    allowedRoles?: Array<ValueOf<typeof CONST.POLICY.ROLE>>,
): ListItemType[] {
    const newRoleBadge = (
        <Badge
            success
            isCondensed
            text={translate('common.new')}
        />
    );
    const workspaceRoles: ListItemType[] = [
        {
            value: CONST.POLICY.ROLE.CARD_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.CARD_ADMIN),
            alternateText: translate('workspace.common.cardAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.CARD_ADMIN,
            keyForList: CONST.POLICY.ROLE.CARD_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PAYMENTS_ADMIN),
            alternateText: translate('workspace.common.paymentsAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            keyForList: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.PEOPLE_ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.PEOPLE_ADMIN),
            alternateText: translate('workspace.common.peopleAdminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.PEOPLE_ADMIN,
            keyForList: CONST.POLICY.ROLE.PEOPLE_ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.ADMIN,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.ADMIN),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.ADMIN,
            keyForList: CONST.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST.POLICY.ROLE.APPROVE_ONLY,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.APPROVE_ONLY),
            alternateText: translate('workspace.common.approveOnlyAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.APPROVE_ONLY,
            keyForList: CONST.POLICY.ROLE.APPROVE_ONLY,
        },
        {
            value: CONST.POLICY.ROLE.AUDITOR,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.AUDITOR),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.AUDITOR,
            keyForList: CONST.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST.POLICY.ROLE.GUEST,
            text: translate('workspace.common.roleName', CONST.POLICY.ROLE.GUEST),
            alternateText: translate('workspace.common.guestAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.GUEST,
            keyForList: CONST.POLICY.ROLE.GUEST,
        },
        {
            value: CONST.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: currentRole === CONST.POLICY.ROLE.USER,
            keyForList: CONST.POLICY.ROLE.USER,
        },
    ];
    const roleItems = workspaceRoles.map((item) => (NEW_ROLES.has(item.value) ? {...item, titleRightElement: newRoleBadge} : item));

    const selectableRoles = getSelectableRoles(policy, currentUserLogin, allowedRoles);

    return roleItems.filter((item) => selectableRoles.includes(item.value));
}

function WorkspaceMemberRoleList({
    role,
    policy,
    navigateBackTo = undefined,
    onSelectRole = () => {},
    allowedRoles = undefined,
    confirmButtonOptions = undefined,
    errorMessage = '',
    errorAnnouncementKey = 0,
}: WorkspaceMemberRoleListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin = '', accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const delegateAccountID = useDelegateAccountID();

    const availableRoleItems = getAssignableWorkspaceMemberRoleItems(translate, role, policy, currentUserLogin, allowedRoles);
    const roleGroups = [
        {
            title: translate('workspace.common.adminRoles'),
            data: availableRoleItems.filter((item) => ADMIN_ROLES.has(item.value)),
        },
        {
            title: translate('workspace.common.otherRoles'),
            data: availableRoleItems.filter((item) => !ADMIN_ROLES.has(item.value)),
        },
    ].filter((group) => group.data.length > 0);
    const sections: Array<Section<ListItemType>> = roleGroups.map((group, index) => ({
        data: group.data,
        sectionIndex: index,
        customHeader: (
            <>
                {index > 0 && <View style={[styles.dividerLine, styles.mv2]} />}
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{group.title}</Text>
                </View>
            </>
        ),
    }));

    const footerContent = (
        <>
            <Text style={[styles.mutedNormalTextLabel, styles.textAlignCenter, styles.pt3, styles.mb4]}>
                {translate('workspace.common.roleSelectorFeedback')}{' '}
                <TextLink
                    style={[styles.textLabel, styles.link]}
                    onPress={() => {
                        navigateToConciergeChat({
                            conciergeReportID,
                            introSelected,
                            currentUserAccountID,
                            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                            conciergePersonalDetails,
                            shouldDismissModal: false,
                            delegateAccountID,
                        });
                    }}
                >
                    {translate('workspace.common.roleSelectorFeedbackLink')}
                </TextLink>
                .
            </Text>
            {!!errorMessage && (
                // Remounting is what makes the alert speak again. The list is not inside a `Form`, so `FormHelpMessage`
                // has no submit count of its own to re-announce from.
                <FormHelpMessage
                    key={errorAnnouncementKey}
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={errorMessage}
                />
            )}
            {!!confirmButtonOptions?.showButton && (
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={styles.w100}
                    onPress={confirmButtonOptions.onConfirm}
                    isDisabled={confirmButtonOptions.isDisabled}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.MEMBERS.ROLE_SAVE_BUTTON}
                >
                    <Button.KeyboardShortcut enterKeyEventListenerPriority={1} />
                    {!!confirmButtonOptions.text && <Button.Text>{confirmButtonOptions.text}</Button.Text>}
                </Button>
            )}
        </>
    );

    return (
        <>
            <HeaderWithBackButtonAndTitle
                title={translate('common.role')}
                onBackButtonPress={() => Navigation.goBack(navigateBackTo)}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                <SelectionListWithSections
                    sections={sections}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectRole}
                    confirmButtonOptions={confirmButtonOptions}
                    footerContent={footerContent}
                    customListHeaderContent={
                        <View style={[styles.renderHTML, styles.ph5, styles.pv3]}>
                            <RenderHTML html={translate('workspace.common.roleSelectorDescription')} />
                        </View>
                    }
                    shouldSingleExecuteRowSelect={!confirmButtonOptions?.showButton}
                    initiallyFocusedItemKey={availableRoleItems.find((item) => item.isSelected)?.keyForList}
                    addBottomSafeAreaPadding
                />
            </View>
        </>
    );
}

export default WorkspaceMemberRoleList;
export {getAssignableWorkspaceMemberRoleItems};
export type {ListItemType};
