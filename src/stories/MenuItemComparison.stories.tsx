/* eslint-disable rulesdir/prefer-actions-set-data -- stories seed Onyx directly so the ID-driven avatar cases render real data */
import UserAvatar from '@components/Avatar/UserAvatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import Button from '@components/Button';
import CompactMenuContext from '@components/CompactMenuContext';
import DisplayNames from '@components/DisplayNames';
import type {DisplayNameWithTooltip} from '@components/DisplayNames/types';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemAvatarNavigation from '@components/MenuItem/presets/MenuItemAvatarNavigation';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemFieldHTML from '@components/MenuItem/presets/MenuItemFieldHTML';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Section from '@components/Section';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import {buildPersonalDetailsUpdate} from '@libs/PersonalDetailsUtils';

import PopoverReportActionContextMenu from '@pages/inbox/report/ContextMenu/PopoverReportActionContextMenu';
import {contextMenuRef, showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';
import type {Meta} from 'storybook-react-rsbuild';

import React, {useRef} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

/**
 * Grid comparison of the legacy `MenuItem` monolith, the new composable
 * `MenuItem.Root`/`Row`/... API, and the `MenuItemAction`/`MenuItemNavigation` presets.
 * Each card shows the same visual case built with every API that can currently express it.
 */
const story: Meta<typeof MenuItem> = {
    title: 'Components/MenuItemComparison',
    component: MenuItem,
    // Storybook awaits loaders before the first render, so the ID-driven avatar cases always see the seeded data,
    // and the writes only happen while this story is open.
    loaders: [seedStoryOnyxData],
};

const CARD_WIDTH = 360;

/** Account and report the ID-driven (`iconAccountID`/`iconReportID`) avatar cases resolve against */
const STORY_ACCOUNT_ID = 90210;
const STORY_REPORT_ID = 'menuItemComparisonStoryReport';
const STORY_POLICY_ID = 'menuItemComparisonStoryPolicy';

/** Seeds the personal details, policy and report the ID-driven avatar cases read from */
async function seedStoryOnyxData() {
    await Promise.all([
        Onyx.update([
            buildPersonalDetailsUpdate({
                [STORY_ACCOUNT_ID]: {
                    accountID: STORY_ACCOUNT_ID,
                    displayName: 'John Doe',
                    login: 'john@example.com',
                },
            }),
        ]),
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${STORY_POLICY_ID}`, {
            id: STORY_POLICY_ID,
            name: 'Expensify Inc',
        }),
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${STORY_REPORT_ID}`, {
            reportID: STORY_REPORT_ID,
            reportName: '#announce',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: STORY_POLICY_ID,
        }),
    ]);
}

const STORY_TOOLTIP_DETAILS: DisplayNameWithTooltip[] = [{displayName: 'John Doe', accountID: STORY_ACCOUNT_ID, login: 'john@example.com'}];

function noop() {}

function Label({children}: {children: string}) {
    const styles = useThemeStyles();
    return <Text style={[styles.textMicroBold, styles.textSupporting, styles.mb1]}>{children}</Text>;
}

function Card({title, note, legacy, composable, preset}: {title: string; note?: string; legacy: React.ReactNode; composable?: React.ReactNode; preset?: React.ReactNode}) {
    const styles = useThemeStyles();

    return (
        <View style={[{width: CARD_WIDTH}, styles.border, styles.br3, styles.p3, styles.gap3]}>
            <View>
                <Text style={[styles.textLabelSupportingNormal, styles.textStrong]}>{title}</Text>
                {!!note && <Text style={[styles.textMicroSupporting, styles.mt1]}>{note}</Text>}
            </View>
            <View>
                <Label>Legacy</Label>
                {legacy}
            </View>
            {!!composable && (
                <View>
                    <Label>Composable</Label>
                    {composable}
                </View>
            )}
            {!!preset && (
                <View>
                    <Label>Preset</Label>
                    {preset}
                </View>
            )}
        </View>
    );
}

/** A labelled row inside a card, for cases that need several variants side by side */
function Variant({label, children}: {label: string; children: React.ReactNode}) {
    const styles = useThemeStyles();

    return (
        <View style={styles.mb2}>
            <Text style={[styles.textMicroSupporting, styles.mb1]}>{label}</Text>
            {children}
        </View>
    );
}

function SectionHeading({title, children}: {title: string; children?: string}) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.w100, styles.mt4]}>
            <Text style={styles.textHeadlineH1}>{title}</Text>
            {!!children && <Text style={[styles.textLabelSupporting, styles.mt1]}>{children}</Text>}
        </View>
    );
}

/**
 * One card per prop shape migrated in the "already-migratable" batch, built the way the call sites now build it.
 * The note on each card names the call sites that share the shape.
 */
function MigratableBatchCards() {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Users']);

    if (!icons.Gear || !icons.Users) {
        return null;
    }

    return (
        <>
            <SectionHeading title="Already-migratable batch">One card per legacy prop shape migrated in the batch. The note lists the call sites.</SectionHeading>

            <Card
                title="brickRoadIndicator, description, onPress, shouldShowRightIcon, title"
                note="StatusPage:231, CampfireAdvancedPage:126/156/190/203, CampfireExportPage:74/92/111/120"
                legacy={
                    <MenuItemWithTopDescription
                        description="Export as"
                        title="Vendor bill"
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                preset={
                    <MenuItemField
                        name="Export as"
                        value="Vendor bill"
                        onPress={noop}
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                }
            />

            <Card
                title="icon, isAnonymousAction, onPress, shouldShowRightIcon, title"
                note="ReportDetailsMenu Settings/GoToWorkspace/GoToRoom/TrackExpense x4/Invite items (preset), DebugItem (raw, no action guard)"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        isAnonymousAction={false}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemNavigation
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="icon, isAnonymousAction, onPress, shouldShowRightIcon, subtitle, subtitleStyle, title"
                note="ReportDetailsMenuMembersOrInviteItem:107. No subtitle leaf, so the count is a Text in Trailing."
                legacy={
                    <MenuItem
                        title="Members"
                        subtitle={12}
                        icon={icons.Users}
                        isAnonymousAction={false}
                        shouldShowRightIcon
                        subtitleStyle={[styles.ph2]}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Users} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Members</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <Text style={[styles.textLabelSupporting, styles.mr1]}>12</Text>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="icon, isAnonymousAction, onPress, title"
                note="ReportDetailsMenuLeaveItem:97 (raw, no action guard), ReportDetailsMenuMarkAsIncompleteItem:50 (MenuItemAction)"
                legacy={
                    <MenuItem
                        title="Leave"
                        icon={icons.Gear}
                        isAnonymousAction
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Leave</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemAction
                        title="Leave"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="brickRoadIndicator, icon, isAnonymousAction, onPress, shouldShowRightIcon, title"
                note="ReportDetailsMenuPrivateNotesItem:47"
                legacy={
                    <MenuItem
                        title="Private notes"
                        icon={icons.Gear}
                        isAnonymousAction={false}
                        shouldShowRightIcon
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Private notes</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="icon, onPress, shouldShowRightIcon, title"
                note="ProfilePage:353, ConnectionsReceiptPartnersPage:163"
                legacy={
                    <MenuItem
                        title="See chat history"
                        icon={icons.Gear}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                preset={
                    <MenuItemNavigation
                        title="See chat history"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="icon, onPress, style, title"
                note="PersonalCardDetailsHeaderMenu:140/147, DynamicWorkspaceCompanyCardDetailsPage:289, DynamicWorkspaceExpensifyCardDetailsPage:458 (mb1); DynamicSplitExpensePage:555/563 (ph4)"
                legacy={
                    <>
                        <Variant label="style={styles.mb1}">
                            <MenuItem
                                title="Unassign card"
                                icon={icons.Gear}
                                style={styles.mb1}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="style={[styles.ph4]}">
                            <MenuItem
                                title="Add split"
                                icon={icons.Gear}
                                style={[styles.ph4]}
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="<View style={styles.mb1}> + MenuItemAction">
                            <View style={styles.mb1}>
                                <MenuItemAction
                                    title="Unassign card"
                                    icon={icons.Gear}
                                    onPress={noop}
                                />
                            </View>
                        </Variant>
                        <Variant label="style={[styles.ph4]}">
                            <MenuItem.Root
                                style={[styles.ph4]}
                                onPress={noop}
                            >
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <MenuItem.Icon src={icons.Gear} />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>Add split</MenuItem.Title>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                    </>
                }
            />

            <Card
                title="description, icon, onPress, title"
                note="IOURequestEditReportCommon:390"
                legacy={
                    <MenuItem
                        title="Auto report"
                        description="Expensify Inc"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Auto report</MenuItem.Title>
                                <MenuItem.Description>Expensify Inc</MenuItem.Description>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, interactive, onPress, shouldShowRightIcon, style, title"
                note="ProfilePage:298 (ph0, in detailsPageSectionContainer); ExpenseReportRulesSection:120/135/180 (sectionMenuItemTopDescription + mt6 + mbn3, in a Section); WorkspaceInvoicingDetailsSection:42/52 (cardPaddingHorizontal, in a Section)"
                legacy={
                    <>
                        <Variant label="style={styles.ph0}">
                            <View style={[styles.detailsPageSectionContainer, styles.w100]}>
                                <MenuItemWithTopDescription
                                    description="Display name"
                                    title="John Doe"
                                    style={styles.ph0}
                                    interactive
                                    shouldShowRightIcon
                                    onPress={noop}
                                />
                            </View>
                        </Variant>
                        <Variant label="style={[sectionMenuItemTopDescription, mt6, mbn3]}">
                            <Section title="Rules">
                                <MenuItemWithTopDescription
                                    description="Auto-approve reports under"
                                    title="$100.00"
                                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                                    interactive
                                    shouldShowRightIcon
                                    onPress={noop}
                                />
                            </Section>
                        </Variant>
                        <Variant label="style={cardPaddingHorizontal}">
                            <Section title="Invoices">
                                <MenuItemWithTopDescription
                                    description="Company name"
                                    title="Expensify Inc"
                                    style={cardPaddingHorizontal}
                                    interactive
                                    shouldShowRightIcon
                                    onPress={noop}
                                />
                            </Section>
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="style={styles.ph0}">
                            <View style={[styles.detailsPageSectionContainer, styles.w100]}>
                                <MenuItem.Root
                                    style={styles.ph0}
                                    onPress={noop}
                                >
                                    <MenuItemField.Row
                                        name="Display name"
                                        value="John Doe"
                                    >
                                        <MenuItem.Chevron />
                                    </MenuItemField.Row>
                                </MenuItem.Root>
                            </View>
                        </Variant>
                        <Variant label="style={[sectionMenuItemTopDescription, mt6, mbn3]}">
                            <Section title="Rules">
                                <MenuItem.Root
                                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                                    onPress={noop}
                                >
                                    <MenuItemField.Row
                                        name="Auto-approve reports under"
                                        value="$100.00"
                                    >
                                        <MenuItem.Chevron />
                                    </MenuItemField.Row>
                                </MenuItem.Root>
                            </Section>
                        </Variant>
                        <Variant label="style={cardPaddingHorizontal}">
                            <Section title="Invoices">
                                <MenuItem.Root
                                    style={cardPaddingHorizontal}
                                    onPress={noop}
                                >
                                    <MenuItemField.Row
                                        name="Company name"
                                        value="Expensify Inc"
                                    >
                                        <MenuItem.Chevron />
                                    </MenuItemField.Row>
                                </MenuItem.Root>
                            </Section>
                        </Variant>
                    </>
                }
            />

            <Card
                title="description, interactive={false}, style, title"
                note="AutoUpdateTime:44, ProfilePage:273/311 (ph0); ScheduleCallPage:195 (mt3 + mb3)"
                legacy={
                    <>
                        <Variant label="style={styles.ph0}">
                            <MenuItemWithTopDescription
                                description="Pronouns"
                                title="they/them"
                                style={styles.ph0}
                                interactive={false}
                            />
                        </Variant>
                        <Variant label="style={[styles.mt3, styles.mb3]}">
                            <MenuItemWithTopDescription
                                description="Date"
                                title="Monday, October 13"
                                style={[styles.mt3, styles.mb3]}
                                interactive={false}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="style={styles.ph0}">
                            <MenuItem.Root style={styles.ph0}>
                                <MenuItemField.Row
                                    name="Pronouns"
                                    value="they/them"
                                />
                            </MenuItem.Root>
                        </Variant>
                        <Variant label="<View style={[styles.mt3, styles.mb3]}> + MenuItemField">
                            <View style={[styles.mt3, styles.mb3]}>
                                <MenuItemField
                                    name="Date"
                                    value="Monday, October 13"
                                />
                            </View>
                        </Variant>
                    </>
                }
            />

            <Card
                title="description, onPress, shouldShowRightIcon, title"
                note="SearchFooterPopup:97, MergeATSApprovalModePage:183"
                legacy={
                    <MenuItemWithTopDescription
                        description="Count"
                        title="Expenses"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                preset={
                    <MenuItemField
                        name="Count"
                        value="Expenses"
                        onPress={noop}
                    />
                }
            />

            <Card
                title="description, interactive={false}, onPress, shouldShowRightIcon, title"
                note="SearchFooterPopup:106/117 while loading. Legacy keeps the chevron on an inert row, so composition keeps it too."
                legacy={
                    <MenuItemWithTopDescription
                        description="Total"
                        title="Amount"
                        interactive={false}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItemField.Row
                            name="Total"
                            value="Amount"
                        >
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, onPress, shouldShowRightIcon, style, title"
                note="CardReconciliationPage:200 (mt5), MergeATSFiltersPage:121 (ph5 + mv3)"
                legacy={
                    <>
                        <Variant label="style={styles.mt5}">
                            <MenuItemWithTopDescription
                                description="Reconciliation account"
                                title="Checking 1234"
                                style={styles.mt5}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="style={[styles.ph5, styles.mv3]}">
                            <MenuItemWithTopDescription
                                description="Department"
                                title="Engineering"
                                style={[styles.ph5, styles.mv3]}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="<View style={styles.mt5}> + MenuItemField">
                            <View style={styles.mt5}>
                                <MenuItemField
                                    name="Reconciliation account"
                                    value="Checking 1234"
                                    onPress={noop}
                                />
                            </View>
                        </Variant>
                        <Variant label="<View style={styles.mv3}> + MenuItemField (ph5 is Root's own padding)">
                            <View style={styles.mv3}>
                                <MenuItemField
                                    name="Department"
                                    value="Engineering"
                                    onPress={noop}
                                />
                            </View>
                        </Variant>
                    </>
                }
            />

            <Card
                title="brickRoadIndicator, description, helperText, onPress, shouldShowRightIcon, title"
                note="DynamicQuickbooksCompanyCardExpenseAccountPage:111, SageIntacctNonReimbursableExpensesPage:54"
                legacy={
                    <MenuItemWithTopDescription
                        description="Default vendor"
                        title="Acme Inc"
                        helperText="Expenses with no matching vendor are assigned to this vendor"
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                preset={
                    <>
                        <MenuItemField
                            name="Default vendor"
                            value="Acme Inc"
                            onPress={noop}
                        >
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        </MenuItemField>
                        <FormHelpMessage
                            isError={false}
                            shouldShowRedDotIndicator={false}
                            message="Expenses with no matching vendor are assigned to this vendor"
                            style={[styles.mt0, styles.mb0, styles.ph5, styles.pb5]}
                        />
                    </>
                }
            />

            <Card
                title="brickRoadIndicator, description, helperText, interactive, onPress, shouldShowRightIcon, title"
                note="DynamicXeroExportConfigurationPage:147, CertiniaExportPage:141. Rows with interactive={false} have no onPress, so the preset drops the chevron."
                legacy={
                    <>
                        <Variant label="interactive">
                            <MenuItemWithTopDescription
                                description="Export date"
                                title="Date of last expense"
                                helperText="The date the report is exported"
                                interactive
                                shouldShowRightIcon
                                onPress={noop}
                                brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                            />
                        </Variant>
                        <Variant label="interactive={false}">
                            <MenuItemWithTopDescription
                                description="Preferred exporter"
                                title="john@example.com"
                                helperText="Any workspace admin can export"
                                interactive={false}
                                shouldShowRightIcon={false}
                            />
                        </Variant>
                    </>
                }
                preset={
                    <>
                        <Variant label="interactive">
                            <MenuItemField
                                name="Export date"
                                value="Date of last expense"
                                onPress={noop}
                            >
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            </MenuItemField>
                            <FormHelpMessage
                                isError={false}
                                shouldShowRedDotIndicator={false}
                                message="The date the report is exported"
                                style={[styles.mt0, styles.mb0, styles.ph5, styles.pb5]}
                            />
                        </Variant>
                        <Variant label="interactive={false}">
                            <MenuItemField
                                name="Preferred exporter"
                                value="john@example.com"
                            />
                            <FormHelpMessage
                                isError={false}
                                shouldShowRedDotIndicator={false}
                                message="Any workspace admin can export"
                                style={[styles.mt0, styles.mb0, styles.ph5, styles.pb5]}
                            />
                        </Variant>
                    </>
                }
            />

            <Card
                title="brickRoadIndicator, description, hintText, onPress, shouldShowRightIcon, title"
                note="CampfireAdvancedPage:96"
                legacy={
                    <MenuItemWithTopDescription
                        description="Auto-sync"
                        title="Every day"
                        hintText="Syncs once a day at midnight"
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItemField.Row
                            name="Auto-sync"
                            value="Every day"
                        >
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText message="Syncs once a day at midnight" />
                    </MenuItem.Root>
                }
            />

            <Card
                title="brickRoadIndicator, description, interactive={false}, onPress?, title"
                note="CampfireExportPage:84 (no onPress), CampfireExportPage:102 (dead onPress dropped)"
                legacy={
                    <MenuItemWithTopDescription
                        description="Exporter"
                        title="john@example.com"
                        interactive={false}
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                preset={
                    <MenuItemField
                        name="Exporter"
                        value="john@example.com"
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                }
            />

            <Card
                title="brickRoadIndicator, description, numberOfLinesTitle, onPress, shouldShowRightIcon, title"
                note="NetSuiteImportPage:90"
                legacy={
                    <MenuItemWithTopDescription
                        description="Customers and projects"
                        title="Imported, displayed as tags, enabled for Engineering, Design and Product"
                        numberOfLinesTitle={2}
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                preset={
                    <MenuItemField
                        name="Customers and projects"
                        value="Imported, displayed as tags, enabled for Engineering, Design and Product"
                        numberOfLinesValue={2}
                        onPress={noop}
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                }
            />

            <Card
                title="copyValue, copyable, description, interactive={false}, shouldBlockSelection, title"
                note="ReportDetailsContent:87/95"
                legacy={
                    <MenuItemWithTopDescription
                        description="Report ID"
                        title="R00ABC123"
                        copyValue="R00ABC123"
                        interactive={false}
                        shouldBlockSelection
                        copyable
                    />
                }
                preset={
                    <MenuItemField
                        name="Report ID"
                        value="R00ABC123"
                    >
                        <MenuItem.Copy value="R00ABC123" />
                    </MenuItemField>
                }
            />

            <Card
                title="copyValue, copyable, description, interactive={false}, style, title"
                note="ProfilePage:285"
                legacy={
                    <MenuItemWithTopDescription
                        description="Email"
                        title="john@example.com"
                        copyValue="john@example.com"
                        style={styles.ph0}
                        interactive={false}
                        copyable
                    />
                }
                composable={
                    <MenuItem.Root style={styles.ph0}>
                        <MenuItemField.Row
                            name="Email"
                            value="john@example.com"
                        >
                            <MenuItem.Copy value="john@example.com" />
                        </MenuItemField.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="copyValue, copyable, description, interactive={false}, numberOfLinesTitle, pressableTestID, title"
                note="HotelTripDetails:50"
                legacy={
                    <MenuItemWithTopDescription
                        description="Address"
                        title="1600 Amphitheatre Parkway, Mountain View, CA 94043, United States of America"
                        numberOfLinesTitle={2}
                        pressableTestID="menuItemComparisonStoryAddress"
                        copyValue="1600 Amphitheatre Parkway, Mountain View, CA 94043, United States of America"
                        copyable
                        interactive={false}
                    />
                }
                preset={
                    <MenuItemField
                        name="Address"
                        value="1600 Amphitheatre Parkway, Mountain View, CA 94043, United States of America"
                        numberOfLinesValue={2}
                        testID="menuItemComparisonStoryAddress"
                    >
                        <MenuItem.Copy value="1600 Amphitheatre Parkway, Mountain View, CA 94043, United States of America" />
                    </MenuItemField>
                }
            />

            <Card
                title="description, interactive={false}, titleComponent"
                note="HotelTripDetails:59/64. Field name drops from 15px to 13px, same as the shipped FlightTripDetails rows."
                legacy={
                    <MenuItemWithTopDescription
                        description="Check-in"
                        titleComponent={<Text style={[styles.textLarge, styles.textHeadlineH2]}>Oct 13</Text>}
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItemField.Content name="Check-in">
                                <Text style={[styles.textLarge, styles.textHeadlineH2]}>Oct 13</Text>
                            </MenuItemField.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, interactive={false}, title"
                note="DynamicFormFieldRow:39 (inside a mhn5 + pv1 View)"
                legacy={
                    <View style={[styles.mhn5, styles.pv1]}>
                        <MenuItemWithTopDescription
                            description="Merchant"
                            title="Starbucks"
                            interactive={false}
                        />
                    </View>
                }
                preset={
                    <View style={[styles.mhn5, styles.pv1]}>
                        <MenuItemField
                            name="Merchant"
                            value="Starbucks"
                        />
                    </View>
                }
            />

            <Card
                title="description, onPress, outerWrapperStyle, shouldShowRightIcon, title"
                note="ChronosScheduleOOOPage:319. Fixed mhn5, so a wrapping View rather than MenuItemSectionRoot."
                legacy={
                    <MenuItemWithTopDescription
                        description="Date"
                        title="Monday, October 13"
                        outerWrapperStyle={styles.mhn5}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                preset={
                    <View style={styles.mhn5}>
                        <MenuItemField
                            name="Date"
                            value="Monday, October 13"
                            onPress={noop}
                        />
                    </View>
                }
            />

            <Card
                title="description, interactive={false}, numberOfLinesTitle, style, title"
                note="SubscriptionPlanCardActionButton:146 (style comes from the caller)"
                legacy={
                    <MenuItemWithTopDescription
                        description="Your plan"
                        title="Collect. Billed monthly, renews on the first of every month, cancel any time from settings."
                        numberOfLinesTitle={3}
                        style={styles.ph0}
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root style={styles.ph0}>
                        <MenuItemField.Row
                            name="Your plan"
                            value="Collect. Billed monthly, renews on the first of every month, cancel any time from settings."
                            numberOfLinesValue={3}
                        />
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, numberOfLinesTitle, onPress, rightLabel, shouldRenderAsHTML, shouldShowRightIcon, style, title?"
                note="DynamicSplitExpenseEditPage:441. style={moneyRequestMenuItem} equals the base style, numberOfLinesTitle is ignored on the HTML path."
                legacy={
                    <>
                        <Variant label="with value">
                            <MenuItemWithTopDescription
                                description="Description"
                                title="<strong>Team</strong> lunch"
                                shouldRenderAsHTML
                                numberOfLinesTitle={2}
                                rightLabel="Required"
                                style={[styles.moneyRequestMenuItem]}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="empty, required">
                            <MenuItemWithTopDescription
                                description="Description"
                                title=""
                                shouldRenderAsHTML
                                numberOfLinesTitle={2}
                                rightLabel="Required"
                                style={[styles.moneyRequestMenuItem]}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                preset={
                    <>
                        <Variant label="with value">
                            <MenuItemFieldHTML
                                name="Description"
                                value="<strong>Team</strong> lunch"
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="empty, required">
                            <MenuItemFieldHTML
                                name="Description"
                                onPress={noop}
                            >
                                <MenuItem.RightLabel>Required</MenuItem.RightLabel>
                            </MenuItemFieldHTML>
                        </Variant>
                    </>
                }
            />
        </>
    );
}

function Comparison() {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'FallbackAvatar', 'NewWindow', 'Download']);

    // The legacy external-link row anchors its context menu to the row itself, which the composable API does for the call site
    const popoverAnchor = useRef<ComponentRef<typeof View>>(null);

    if (!icons.Gear || !icons.FallbackAvatar || !icons.NewWindow || !icons.Download) {
        return null;
    }

    return (
        <View style={[styles.p4, styles.flexRow, styles.flexWrap, styles.gap4]}>
            <MigratableBatchCards />

            <SectionHeading title="Phase 4 - styles" />

            <Card
                title="description, numberOfLinesTitle, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Cancellation"
                        title="Free until 24 hours before pickup, then the daily rate is charged"
                        numberOfLinesTitle={2}
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Cancellation</MenuItem.FieldName>
                                <MenuItem.FieldValue numberOfLines={2}>Free until 24 hours before pickup, then the daily rate is charged</MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Cancellation"
                        value="Free until 24 hours before pickup, then the daily rate is charged"
                        numberOfLinesValue={2}
                    />
                }
            />

            <Card
                title="description, numberOfLinesTitle, onPress, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="List values"
                        title="Engineering, Design, Product, Marketing, Sales, Support, Finance"
                        numberOfLinesTitle={5}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>List values</MenuItem.FieldName>
                                <MenuItem.FieldValue numberOfLines={5}>Engineering, Design, Product, Marketing, Sales, Support, Finance</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="List values"
                        onPress={noop}
                        value="Engineering, Design, Product, Marketing, Sales, Support, Finance"
                        numberOfLinesValue={5}
                    />
                }
            />

            <Card
                title="description, numberOfLinesTitle={0}, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Invite message"
                        title="Hello! You have been invited to join the workspace. Take a look around and add your first expense."
                        numberOfLinesTitle={0}
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Invite message</MenuItem.FieldName>
                                <MenuItem.FieldValue numberOfLines={0}>
                                    Hello! You have been invited to join the workspace. Take a look around and add your first expense.
                                </MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Invite message"
                        value="Hello! You have been invited to join the workspace. Take a look around and add your first expense."
                        numberOfLinesValue={0}
                    />
                }
            />

            <Card
                title="description, style, titleStyle, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Tax amount"
                        title="$4.20"
                        style={[styles.moneyRequestMenuItem]}
                        titleStyle={styles.flex1}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Tax amount</MenuItem.FieldName>
                                <MenuItem.FieldValue>$4.20</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Tax amount"
                        onPress={noop}
                        value="$4.20"
                    />
                }
            />

            <Card
                title="icon, onPress, title, wrapperStyle={styles.sectionMenuItemTopDescription}"
                legacy={
                    <Section title="Share">
                        <MenuItem
                            title="Download"
                            icon={icons.Download}
                            onPress={noop}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                        />
                    </Section>
                }
                composable={
                    <Section title="Share">
                        <MenuItemSectionRoot onPress={noop}>
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <MenuItem.Icon src={icons.Download} />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>Download</MenuItem.Title>
                                </MenuItem.Content>
                            </MenuItem.Row>
                        </MenuItemSectionRoot>
                    </Section>
                }
            />

            <SectionHeading title="Trailing interactions — copy and external link">
                Leaves that own a row-wide behaviour instead of a prop: MenuItem.Copy takes over the row&apos;s long press (and shows a copy button on a hovered read-only row),
                MenuItem.ExternalLink marks the row as leaving the app and offers the URL through the context menu. Both make the row block text selection on their own.
            </SectionHeading>

            <Card
                title="copyable, copyValue, description, interactive, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Email"
                        title="john@example.com"
                        copyValue="john@example.com"
                        interactive={false}
                        copyable
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Email</MenuItem.FieldName>
                                <MenuItem.FieldValue>john@example.com</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Copy value="john@example.com" />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Email"
                        value="john@example.com"
                    >
                        <MenuItem.Copy value="john@example.com" />
                    </MenuItemField>
                }
            />

            <Card
                title="copyable, description, icon, interactive, title"
                legacy={
                    <MenuItem
                        title="CONF-12345"
                        description="Confirmation"
                        icon={icons.Gear}
                        interactive={false}
                        copyable
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>CONF-12345</MenuItem.Title>
                                <MenuItem.Description>Confirmation</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Copy value="CONF-12345" />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="icon, iconRight, onPress, onSecondaryInteraction, role, shouldBlockSelection, shouldShowContextMenuHint, shouldShowRightIcon, title"
                legacy={
                    <MenuItem
                        ref={popoverAnchor}
                        title="Android"
                        icon={icons.Gear}
                        iconRight={icons.NewWindow}
                        onPress={noop}
                        onSecondaryInteraction={(event) =>
                            showContextMenu({
                                type: CONST.CONTEXT_MENU_TYPES.LINK,
                                event,
                                selection: CONST.APP_DOWNLOAD_LINKS.ANDROID,
                                contextMenuAnchor: popoverAnchor.current,
                            })
                        }
                        role={CONST.ROLE.LINK}
                        shouldBlockSelection
                        shouldShowContextMenuHint
                        shouldShowRightIcon
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Android</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.ExternalLink link={CONST.APP_DOWNLOAD_LINKS.ANDROID} />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <SectionHeading title="Phase 3 — MenuItemWithTopDescription">One card per prop shape, in frequency order. Every shape is the MenuItemField preset.</SectionHeading>

            <Card
                title="description, onPress, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Sort by"
                        title="Date"
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Sort by</MenuItem.FieldName>
                                <MenuItem.FieldValue>Date</MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, interactive, onPress, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Name"
                        title="Standard rate"
                        interactive
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Name</MenuItem.FieldName>
                                <MenuItem.FieldValue>Standard rate</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Name"
                        onPress={noop}
                        value="Standard rate"
                    />
                }
            />

            <Card
                title="brickRoadIndicator, description, onPress, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Export as"
                        title="Vendor bill"
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Export as</MenuItem.FieldName>
                                <MenuItem.FieldValue>Vendor bill</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Export as"
                        onPress={noop}
                        value="Vendor bill"
                    >
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    </MenuItemField>
                }
            />

            <Card
                title="brickRoadIndicator, description, errorText, onPress, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Country"
                        title="United States"
                        shouldShowRightIcon
                        onPress={noop}
                        brickRoadIndicator={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                        errorText="Please select a country"
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItemField.Row
                            name="Country"
                            value="United States"
                        >
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText
                            isError
                            message="Please select a country"
                        />
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, hintText, non-interactive, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Limit type"
                        title="Smart limit"
                        interactive={false}
                        hintText="Resets every month"
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItemField.Row
                            name="Limit type"
                            value="Smart limit"
                        />
                        <MenuItem.HelpText message="Resets every month" />
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, errorText, hintText, onPress, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Limit type"
                        title="Smart limit"
                        shouldShowRightIcon
                        onPress={noop}
                        errorText="Please select a limit type"
                        hintText="Resets every month"
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItemField.Row
                            name="Limit type"
                            value="Smart limit"
                        >
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText
                            isError
                            message="Please select a limit type"
                        />
                        <MenuItem.HelpText message="Resets every month" />
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, non-interactive, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Country"
                        title="United States"
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Country</MenuItem.FieldName>
                                <MenuItem.FieldValue>United States</MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Country"
                        value="United States"
                    />
                }
            />

            <Card
                title="description, onPress, sentryLabel, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Display"
                        title="Comfortable"
                        sentryLabel="menuItemComparisonStorySentryLabel"
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        sentryLabel="menuItemComparisonStorySentryLabel"
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Display</MenuItem.FieldName>
                                <MenuItem.FieldValue>Comfortable</MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, disabled, onPress, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Role"
                        title="Admin"
                        disabled
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        isDisabled
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Role</MenuItem.FieldName>
                                <MenuItem.FieldValue>Admin</MenuItem.FieldValue>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, interactive, onPress, pressableTestID, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Member"
                        title="John Doe"
                        interactive
                        pressableTestID="menuItemComparisonStoryPressable"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        testID="menuItemComparisonStoryPressable"
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Member</MenuItem.FieldName>
                                <MenuItem.FieldValue>John Doe</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Member"
                        onPress={noop}
                        testID="menuItemComparisonStoryPressable"
                        value="John Doe"
                    />
                }
            />

            <Card
                title="description, disabled, interactive, key, onPress, pressableTestID, shouldShowRightIcon, title"
                legacy={
                    <MenuItemWithTopDescription
                        description="Bank account"
                        title="Chase ••••1234"
                        interactive
                        disabled
                        pressableTestID="menuItemComparisonStoryPressableWide"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        isDisabled
                        testID="menuItemComparisonStoryPressableWide"
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>Bank account</MenuItem.FieldName>
                                <MenuItem.FieldValue>Chase ••••1234</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="Bank account"
                        onPress={noop}
                        isDisabled
                        testID="menuItemComparisonStoryPressableWide"
                        value="Chase ••••1234"
                    />
                }
            />

            <Card
                title="description, rightLabel, onPress, title?"
                legacy={
                    <>
                        <Variant label="no title">
                            <MenuItemWithTopDescription
                                description="Share somewhere"
                                rightLabel="Required"
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="title present">
                            <MenuItemWithTopDescription
                                description="Share somewhere"
                                title="#announce"
                                rightLabel="Required"
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="no value">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldNamePlaceholder>Share somewhere</MenuItem.FieldNamePlaceholder>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.RightLabel>Required</MenuItem.RightLabel>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                        <Variant label="value present">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldName>Share somewhere</MenuItem.FieldName>
                                        <MenuItem.FieldValue>#announce</MenuItem.FieldValue>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                    </>
                }
                preset={
                    <>
                        <Variant label="no value">
                            <MenuItemField
                                name="Share somewhere"
                                onPress={noop}
                            >
                                <MenuItem.RightLabel>Required</MenuItem.RightLabel>
                            </MenuItemField>
                        </Variant>
                        <Variant label="value present">
                            <MenuItemField
                                name="Share somewhere"
                                onPress={noop}
                                value="#announce"
                            />
                        </Variant>
                    </>
                }
            />

            <Card
                title="title, onPress — value with no field name"
                legacy={
                    <MenuItemWithTopDescription
                        title="Account ending in 1234"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldValue>Account ending in 1234</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="description, title — long text truncation"
                legacy={
                    <MenuItemWithTopDescription
                        description="A field name long enough to need a second line before it truncates"
                        title="A value long enough that it has to truncate on a single line"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.FieldName>A field name long enough to need a second line before it truncates</MenuItem.FieldName>
                                <MenuItem.FieldValue>A value long enough that it has to truncate on a single line</MenuItem.FieldValue>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemField
                        name="A field name long enough to need a second line before it truncates"
                        onPress={noop}
                        value="A value long enough that it has to truncate on a single line"
                    />
                }
            />

            <CompactMenuContext.Provider value>
                <Card
                    title="Compact popover — field row"
                    legacy={
                        <>
                            <Variant label="title present">
                                <MenuItemWithTopDescription
                                    description="Sort by"
                                    title="Date"
                                    shouldShowRightIcon
                                    onPress={noop}
                                />
                            </Variant>
                            <Variant label="title={undefined}">
                                <MenuItemWithTopDescription
                                    description="Group by"
                                    shouldShowRightIcon
                                    onPress={noop}
                                />
                            </Variant>
                        </>
                    }
                    composable={
                        <>
                            <Variant label="value present">
                                <MenuItem.Root onPress={noop}>
                                    <MenuItem.Row>
                                        <MenuItem.Content>
                                            <MenuItem.FieldName>Sort by</MenuItem.FieldName>
                                            <MenuItem.FieldValue>Date</MenuItem.FieldValue>
                                        </MenuItem.Content>
                                        <MenuItem.Trailing>
                                            <MenuItem.Chevron />
                                        </MenuItem.Trailing>
                                    </MenuItem.Row>
                                </MenuItem.Root>
                            </Variant>
                            <Variant label="no value">
                                <MenuItem.Root onPress={noop}>
                                    <MenuItem.Row>
                                        <MenuItem.Content>
                                            <MenuItem.FieldNamePlaceholder>Group by</MenuItem.FieldNamePlaceholder>
                                        </MenuItem.Content>
                                        <MenuItem.Trailing>
                                            <MenuItem.Chevron />
                                        </MenuItem.Trailing>
                                    </MenuItem.Row>
                                </MenuItem.Root>
                            </Variant>
                        </>
                    }
                    preset={
                        <>
                            <Variant label="value present">
                                <MenuItemField
                                    name="Sort by"
                                    onPress={noop}
                                    value="Date"
                                />
                            </Variant>
                            <Variant label="no value">
                                <MenuItemField
                                    name="Group by"
                                    onPress={noop}
                                />
                            </Variant>
                        </>
                    }
                />
            </CompactMenuContext.Provider>

            <SectionHeading title="Phase 2 — avatars" />

            <Card
                title="Avatar + label + tooltip title + description + chevron"
                legacy={
                    <MenuItem
                        label="Assignee"
                        avatarID={STORY_ACCOUNT_ID}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        icon={icons.FallbackAvatar}
                        title="John Doe"
                        description="john@example.com"
                        titleWithTooltips={STORY_TOOLTIP_DETAILS}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItemWithLabel
                        label="Assignee"
                        onPress={noop}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={icons.FallbackAvatar}
                                    accountID={STORY_ACCOUNT_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title accessibilityLabel="John Doe">
                                    <DisplayNames
                                        fullTitle="John Doe"
                                        displayNamesWithTooltips={STORY_TOOLTIP_DETAILS}
                                        tooltipEnabled
                                        numberOfLines={1}
                                    />
                                </MenuItem.Title>
                                <MenuItem.Description>john@example.com</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                }
            />

            <Card
                title="Avatar + title + 1-line description"
                legacy={
                    <View style={styles.mt1}>
                        <MenuItem
                            title="John Doe"
                            description="john.doe.with.a.very.long.email.address.for.truncation@example.com"
                            avatarID={STORY_ACCOUNT_ID}
                            icon={icons.FallbackAvatar}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            numberOfLinesDescription={1}
                            interactive={false}
                        />
                    </View>
                }
                composable={
                    <View style={styles.mt1}>
                        <MenuItem.Root>
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <UserAvatar
                                        source={icons.FallbackAvatar}
                                        accountID={STORY_ACCOUNT_ID}
                                    />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>John Doe</MenuItem.Title>
                                    <MenuItem.Description numberOfLines={1}>john.doe.with.a.very.long.email.address.for.truncation@example.com</MenuItem.Description>
                                </MenuItem.Content>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    </View>
                }
            />

            <Card
                title="Avatar + title + description + chevron"
                legacy={
                    <MenuItem
                        title="John Doe"
                        description="john@example.com"
                        avatarID={STORY_ACCOUNT_ID}
                        icon={icons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        numberOfLinesDescription={1}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={icons.FallbackAvatar}
                                    accountID={STORY_ACCOUNT_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>John Doe</MenuItem.Title>
                                <MenuItem.Description>john@example.com</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemAvatarNavigation
                        title="John Doe"
                        description="john@example.com"
                        avatarSource={icons.FallbackAvatar}
                        accountID={STORY_ACCOUNT_ID}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="MenuItemAvatarNavigation — avatar source variants and disabled"
                legacy={
                    <>
                        <Variant label="icon={FallbackAvatar} + displayInDefaultIconColor">
                            <MenuItem
                                title="John Doe"
                                description="123 Main St, Springfield, IL 62704"
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                iconWidth={40}
                                iconHeight={40}
                                displayInDefaultIconColor
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="disabled">
                            <MenuItem
                                title="John Doe"
                                description="123 Main St, Springfield, IL 62704"
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                shouldShowRightIcon
                                disabled
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                preset={
                    <>
                        <Variant label="no avatarSource (default avatar for accountID)">
                            <MenuItemAvatarNavigation
                                title="John Doe"
                                description="123 Main St, Springfield, IL 62704"
                                accountID={CONST.DEFAULT_NUMBER_ID}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="isDisabled">
                            <MenuItemAvatarNavigation
                                title="John Doe"
                                description="123 Main St, Springfield, IL 62704"
                                accountID={CONST.DEFAULT_NUMBER_ID}
                                isDisabled
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
            />

            <Card
                title="Description only — no avatar, no title"
                legacy={
                    <>
                        <Variant label="No title (legacy bumps the font size)">
                            <MenuItem
                                description="Vacation delegate"
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="With title (supporting-size description)">
                            <MenuItem
                                title="John Doe"
                                description="Vacation delegate"
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="variant='placeholder'">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldNamePlaceholder>Vacation delegate</MenuItem.FieldNamePlaceholder>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                        <Variant label="default variant, with a title">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.Title>John Doe</MenuItem.Title>
                                        <MenuItem.Description>Vacation delegate</MenuItem.Description>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                    </>
                }
            />

            <Card
                title="Avatar sizes — leading cell width"
                legacy={
                    <>
                        <Variant label="DEFAULT (40)">
                            <MenuItem
                                title="John Doe"
                                description="john@example.com"
                                avatarID={STORY_ACCOUNT_ID}
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="SMALL (28)">
                            <MenuItem
                                title="John Doe"
                                description="john@example.com"
                                avatarID={STORY_ACCOUNT_ID}
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                avatarSize={CONST.AVATAR_SIZE.SMALL}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="X_SMALL (24)">
                            <MenuItem
                                title="John Doe"
                                description="john@example.com"
                                avatarID={STORY_ACCOUNT_ID}
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                avatarSize={CONST.AVATAR_SIZE.X_SMALL}
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="DEFAULT (40)">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={icons.FallbackAvatar}
                                            accountID={STORY_ACCOUNT_ID}
                                        />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>John Doe</MenuItem.Title>
                                        <MenuItem.Description>john@example.com</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                        <Variant label="SMALL (28)">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={icons.FallbackAvatar}
                                            accountID={STORY_ACCOUNT_ID}
                                            size={CONST.AVATAR_SIZE.SMALL}
                                        />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>John Doe</MenuItem.Title>
                                        <MenuItem.Description>john@example.com</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                        <Variant label="X_SMALL (24)">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={icons.FallbackAvatar}
                                            accountID={STORY_ACCOUNT_ID}
                                            size={CONST.AVATAR_SIZE.X_SMALL}
                                        />
                                    </MenuItem.Leading>
                                    <MenuItem.Content>
                                        <MenuItem.Title>John Doe</MenuItem.Title>
                                        <MenuItem.Description>john@example.com</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                    </>
                }
            />

            <Card
                title="Workspace avatar + label + title + description"
                legacy={
                    <MenuItem
                        avatarID={STORY_POLICY_ID}
                        iconType={CONST.ICON_TYPE_WORKSPACE}
                        title="Expensify Inc"
                        description="Workspace"
                        label="Send from"
                        isLabelHoverable={false}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItemWithLabel
                        label="Send from"
                        onPress={noop}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <WorkspaceAvatar
                                    name="Expensify Inc"
                                    avatarID={STORY_POLICY_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Expensify Inc</MenuItem.Title>
                                <MenuItem.Description>Workspace</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                }
            />

            <Card
                title="accountID avatar + tooltip title + description"
                legacy={
                    <MenuItem
                        label="Assignee"
                        title="John Doe"
                        description="john@example.com"
                        iconAccountID={STORY_ACCOUNT_ID}
                        titleWithTooltips={STORY_TOOLTIP_DETAILS}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItemWithLabel
                        label="Assignee"
                        onPress={noop}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <ReportActionAvatars
                                    singleAvatarContainerStyle={[styles.actionAvatar]}
                                    accountIDs={[STORY_ACCOUNT_ID]}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title accessibilityLabel="John Doe">
                                    <DisplayNames
                                        fullTitle="John Doe"
                                        displayNamesWithTooltips={STORY_TOOLTIP_DETAILS}
                                        tooltipEnabled
                                        numberOfLines={1}
                                    />
                                </MenuItem.Title>
                                <MenuItem.Description>john@example.com</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                }
            />

            <Card
                title="reportID avatar + right label"
                legacy={
                    <MenuItem
                        label="Share"
                        description="Expensify Inc"
                        iconReportID={STORY_REPORT_ID}
                        rightLabel="Required"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItemWithLabel
                        label="Share"
                        onPress={noop}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <ReportActionAvatars
                                    singleAvatarContainerStyle={[styles.actionAvatar]}
                                    reportID={STORY_REPORT_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Description>Expensify Inc</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.RightLabel>Required</MenuItem.RightLabel>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                }
            />

            <Card
                title="Disabled — greyed out"
                legacy={
                    <MenuItem
                        label="Assignee"
                        title="John Doe"
                        description="john@example.com"
                        iconAccountID={STORY_ACCOUNT_ID}
                        avatarSize={CONST.AVATAR_SIZE.X_SMALL}
                        disabled
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItemWithLabel
                        label="Assignee"
                        isDisabled
                        onPress={noop}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    accountID={STORY_ACCOUNT_ID}
                                    size={CONST.AVATAR_SIZE.X_SMALL}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>John Doe</MenuItem.Title>
                                <MenuItem.Description>john@example.com</MenuItem.Description>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItemWithLabel>
                }
            />

            <SectionHeading title="Phase 1 — icon rows">Cases the compound API and the Action/Navigation presets already cover.</SectionHeading>

            <Card
                title="Title only"
                legacy={
                    <MenuItem
                        title="Settings"
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Icon + title"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemAction
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="Icon + title + chevron"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemNavigation
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Card
                title="Icon + title + description + chevron"
                legacy={
                    <MenuItem
                        title="Settings"
                        description="Manage your preferences"
                        icon={icons.Gear}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                                <MenuItem.Description>Manage your preferences</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Icon + title + description — no chevron"
                note="IOURequestEditReportCommon:312 and WorkspaceCompanyCardsSettingsPage:183. Interactive but with no trailing cell — pressing it acts in place, so composition simply omits Trailing."
                legacy={
                    <MenuItem
                        title="Create report"
                        description="Expensify Inc"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Create report</MenuItem.Title>
                                <MenuItem.Description>Expensify Inc</MenuItem.Description>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Trailing — arbitrary right component"
                note="RevokePage:191. Legacy needs shouldShowRightComponent + rightComponent + a wrapping View; in composition the button is just a child of MenuItem.Trailing, which already centers it."
                legacy={
                    <MenuItem
                        title="This device"
                        interactive={false}
                        shouldShowRightComponent
                        rightComponent={
                            <View style={styles.justifyContentCenter}>
                                <Button
                                    variant={CONST.BUTTON_VARIANT.DANGER}
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={noop}
                                >
                                    <Button.Text>Revoke</Button.Text>
                                </Button>
                            </View>
                        }
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.Title>This device</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <Button
                                    variant={CONST.BUTTON_VARIANT.DANGER}
                                    size={CONST.BUTTON_SIZE.SMALL}
                                    onPress={noop}
                                >
                                    <Button.Text>Revoke</Button.Text>
                                </Button>
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Title + description (no icon)"
                legacy={
                    <MenuItem
                        title="Settings"
                        description="Manage your preferences"
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                                <MenuItem.Description>Manage your preferences</MenuItem.Description>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Non-interactive (no onPress)"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Disabled"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        shouldShowRightIcon
                        disabled
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        isDisabled
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemNavigation
                        title="Settings"
                        icon={icons.Gear}
                        isDisabled
                        onPress={noop}
                    />
                }
            />

            <Card
                title="Custom accessibility label"
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root
                        onPress={noop}
                        accessibilityLabel="Settings"
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={icons.Gear} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                preset={
                    <MenuItemAction
                        title={'Settings'}
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <CompactMenuContext.Provider value>
                <Card
                    title="Compact popover — no description"
                    legacy={
                        <MenuItem
                            title="Edit columns"
                            icon={icons.Gear}
                            shouldShowRightIcon
                            onPress={noop}
                        />
                    }
                    composable={
                        <MenuItem.Root onPress={noop}>
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <MenuItem.Icon src={icons.Gear} />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>Edit columns</MenuItem.Title>
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    }
                    preset={
                        <MenuItemNavigation
                            title="Edit columns"
                            icon={icons.Gear}
                            onPress={noop}
                        />
                    }
                />
            </CompactMenuContext.Provider>

            <CompactMenuContext.Provider value>
                <Card
                    title="Compact popover — with description"
                    legacy={
                        <MenuItem
                            title="Edit columns"
                            description="Choose what to display"
                            icon={icons.Gear}
                            shouldShowRightIcon
                            onPress={noop}
                        />
                    }
                    composable={
                        <MenuItem.Root onPress={noop}>
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <MenuItem.Icon src={icons.Gear} />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>Edit columns</MenuItem.Title>
                                    <MenuItem.Description>Choose what to display</MenuItem.Description>
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    }
                />
            </CompactMenuContext.Provider>

            {/* The app mounts the context menu the Copy and ExternalLink leaves open in GlobalModals, so the story mounts its own */}
            <PopoverReportActionContextMenu ref={contextMenuRef} />
        </View>
    );
}

export default story;
export {Comparison};
