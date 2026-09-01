/* eslint-disable rulesdir/prefer-actions-set-data -- stories seed Onyx directly so the ID-driven avatar cases render real data */
import UserAvatar from '@components/Avatar/UserAvatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import Button from '@components/ButtonComposed';
import CompactMenuContext from '@components/CompactMenuContext';
import DisplayNames from '@components/DisplayNames';
import type {DisplayNameWithTooltip} from '@components/DisplayNames/types';
import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemAvatarNavigation from '@components/MenuItem/presets/MenuItemAvatarNavigation';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import ReportActionAvatars from '@components/ReportActionAvatars';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';
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
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [STORY_ACCOUNT_ID]: {
                accountID: STORY_ACCOUNT_ID,
                displayName: 'John Doe',
                login: 'john@example.com',
            },
        }),
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

function Comparison() {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'FallbackAvatar']);

    if (!icons.Gear || !icons.FallbackAvatar) {
        return null;
    }

    return (
        <View style={[styles.p4, styles.flexRow, styles.flexWrap, styles.gap4]}>
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
                    <MenuItem
                        title="John Doe"
                        description="john.doe.with.a.very.long.email.address.for.truncation@example.com"
                        avatarID={STORY_ACCOUNT_ID}
                        icon={icons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        numberOfLinesDescription={1}
                        containerStyle={[styles.pr2, styles.mt1]}
                        interactive={false}
                    />
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
                                        <MenuItem.DescriptionPlaceholder>Vacation delegate</MenuItem.DescriptionPlaceholder>
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
        </View>
    );
}

export default story;
export {Comparison};
