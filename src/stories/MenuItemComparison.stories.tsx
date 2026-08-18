/* eslint-disable rulesdir/prefer-actions-set-data -- stories seed Onyx directly so the ID-driven avatar cases render real data */
import UserAvatar from '@components/Avatar/UserAvatar';
import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import CompactMenuContext from '@components/CompactMenuContext';
import DisplayNames from '@components/DisplayNames';
import type {DisplayNameWithTooltip} from '@components/DisplayNames/types';
import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemNavigation from '@components/MenuItem/presets/MenuItemNavigation';
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
 *
 * The "Phase 2" sections hold the avatar/leading-cell cases. The ones the compound API cannot
 * express yet show the legacy render only, and their note says what is missing — they are the
 * visual spec for the rest of Phase 2.
 */
const story: Meta<typeof MenuItem> = {
    title: 'Components/MenuItemComparison',
    component: MenuItem,
};

const CARD_WIDTH = 360;

/** Account and report the ID-driven (`iconAccountID`/`iconReportID`) avatar cases resolve against */
const STORY_ACCOUNT_ID = 90210;
const STORY_REPORT_ID = 'menuItemComparisonStoryReport';
const STORY_POLICY_ID = 'menuItemComparisonStoryPolicy';

Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
    [STORY_ACCOUNT_ID]: {
        accountID: STORY_ACCOUNT_ID,
        displayName: 'Alex Reed',
        login: 'alex@example.com',
    },
});

Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${STORY_POLICY_ID}`, {
    id: STORY_POLICY_ID,
    name: 'Expensify Inc',
});

Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${STORY_REPORT_ID}`, {
    reportID: STORY_REPORT_ID,
    reportName: '#announce',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: STORY_POLICY_ID,
});

const STORY_TOOLTIP_DETAILS: DisplayNameWithTooltip[] = [{displayName: 'Alex Reed', accountID: STORY_ACCOUNT_ID, login: 'alex@example.com'}];

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

function SectionHeading({title, children}: {title: string; children: string}) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.w100, styles.mt4]}>
            <Text style={styles.textHeadlineH1}>{title}</Text>
            <Text style={[styles.textLabelSupporting, styles.mt1]}>{children}</Text>
        </View>
    );
}

function Comparison() {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'FallbackAvatar', 'Checkmark']);

    if (!icons.Gear || !icons.FallbackAvatar || !icons.Checkmark) {
        return null;
    }

    return (
        <View style={[styles.p4, styles.flexRow, styles.flexWrap, styles.gap4]}>
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

            <SectionHeading title="Phase 2 — explicit-source avatars">
                {
                    '`iconType={ICON_TYPE_AVATAR}` + `icon` + `avatarID`. In composition the avatar goes straight into `MenuItem.Leading` — there is no `MenuItem.Avatar`, because the avatar reads no interaction state.'
                }
            </SectionHeading>

            <Card
                title="Avatar + label + tooltip title + description + chevron"
                note="The full target shape: every leading/text/trailing slot at once, with a hoverable tooltip on the title."
                legacy={
                    <MenuItem
                        label="Assignee"
                        avatarID={STORY_ACCOUNT_ID}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        icon={icons.FallbackAvatar}
                        title="Alex Reed"
                        description="alex@example.com"
                        titleWithTooltips={STORY_TOOLTIP_DETAILS}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
                composable={
                    <MenuItem.Root onPress={noop}>
                        <MenuItem.Label>Assignee</MenuItem.Label>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={icons.FallbackAvatar}
                                    accountID={STORY_ACCOUNT_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title accessibilityLabel="Alex Reed">
                                    <DisplayNames
                                        fullTitle="Alex Reed"
                                        displayNamesWithTooltips={STORY_TOOLTIP_DETAILS}
                                        tooltipEnabled
                                        numberOfLines={1}
                                    />
                                </MenuItem.Title>
                                <MenuItem.Description>alex@example.com</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Avatar + title + description — non-interactive"
                note="ConfirmDelegatePage:69. No onPress, so no hover/press/chevron."
                legacy={
                    <MenuItem
                        avatarID={STORY_ACCOUNT_ID}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        icon={icons.FallbackAvatar}
                        title="Alex Reed"
                        description="alex@example.com"
                        interactive={false}
                    />
                }
                composable={
                    <MenuItem.Root>
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <UserAvatar
                                    source={icons.FallbackAvatar}
                                    accountID={STORY_ACCOUNT_ID}
                                />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>Alex Reed</MenuItem.Title>
                                <MenuItem.Description>alex@example.com</MenuItem.Description>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Avatar + title + 1-line description"
                note="DelegatorList:36. Adds numberOfLinesDescription={1} and containerStyle — Description currently hardcodes numberOfLines={2}, and Root takes no style prop."
                legacy={
                    <MenuItem
                        title="Alexandra Reed-Fitzgerald"
                        description="alexandra.reed.fitzgerald.with.a.very.long.address@example.com"
                        avatarID={STORY_ACCOUNT_ID}
                        icon={icons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        numberOfLinesDescription={1}
                        containerStyle={[styles.pr2, styles.mt1]}
                        interactive={false}
                    />
                }
            />

            <Card
                title="Avatar + title + description + chevron"
                note="VacationDelegateMenuItem:58. The interactive counterpart of the two cards above — this is the MenuItemEntity preset target."
                legacy={
                    <MenuItem
                        title="Alex Reed"
                        description="alex@example.com"
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
                                <MenuItem.Title>Alex Reed</MenuItem.Title>
                                <MenuItem.Description>alex@example.com</MenuItem.Description>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />

            <Card
                title="Description only — no avatar, no title"
                note="VacationDelegateMenuItem:79 and the empty state of DynamicNewTaskPage's assignee/share rows. Legacy implicitly bumps a title-less description to fontSizeNormal + normal line height (MenuItem.tsx:696-697); composition makes that explicit via variant='prominent'. Note a title-less MenuItem and MenuItemWithTopDescription render identically — both of that component's flags are no-ops without a title."
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
                                title="Alex Reed"
                                description="Vacation delegate"
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
                composable={
                    <>
                        <Variant label="variant='prominent'">
                            <MenuItem.Root onPress={noop}>
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.Description variant={CONST.MENU_ITEM.DESCRIPTION_VARIANT.PROMINENT}>Vacation delegate</MenuItem.Description>
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
                                        <MenuItem.Title>Alex Reed</MenuItem.Title>
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
                note="Legacy sets the cell width to getAvatarWidthStyle(avatarSize). Leading sizes to its content, so the avatar's own size is the cell width at every size — compare the two columns row by row."
                legacy={
                    <>
                        <Variant label="DEFAULT (40)">
                            <MenuItem
                                title="Alex Reed"
                                description="alex@example.com"
                                avatarID={STORY_ACCOUNT_ID}
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="SMALL (28)">
                            <MenuItem
                                title="Alex Reed"
                                description="alex@example.com"
                                avatarID={STORY_ACCOUNT_ID}
                                icon={icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                avatarSize={CONST.AVATAR_SIZE.SMALL}
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="X_SMALL (24)">
                            <MenuItem
                                title="Alex Reed"
                                description="alex@example.com"
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
                                        <MenuItem.Title>Alex Reed</MenuItem.Title>
                                        <MenuItem.Description>alex@example.com</MenuItem.Description>
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
                                        <MenuItem.Title>Alex Reed</MenuItem.Title>
                                        <MenuItem.Description>alex@example.com</MenuItem.Description>
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
                                        <MenuItem.Title>Alex Reed</MenuItem.Title>
                                        <MenuItem.Description>alex@example.com</MenuItem.Description>
                                    </MenuItem.Content>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        </Variant>
                    </>
                }
            />

            <Card
                title="Workspace avatar + label + title + description"
                note="InvoiceSenderField:62. isLabelHoverable={false} moves the label outside the pressable — in composition that is placement, not a prop, so the Label sits before Root and the row's hover background stops at the Row. Hover both columns to compare."
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
                    <>
                        {/* Outside Root the label loses the row's paddingHorizontal: 20, so the call site restores it */}
                        <View style={styles.ph5}>
                            <MenuItem.Label>Send from</MenuItem.Label>
                        </View>
                        <MenuItem.Root onPress={noop}>
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
                        </MenuItem.Root>
                    </>
                }
            />

            <SectionHeading title="Phase 2 — ID-driven avatars">
                {'`iconAccountID` / `iconReportID` render `ReportActionAvatars`, which resolves from Onyx itself and needs hover/press state for the subscript border.'}
            </SectionHeading>

            <Card
                title="accountID avatar + label + title"
                note="TaskView:274. X_SMALL avatar plus isSmallAvatarSubscriptMenu, which only swaps the text-container style (MenuItem.tsx:1026)."
                legacy={
                    <MenuItem
                        label="Assignee"
                        title="Alex Reed"
                        iconAccountID={STORY_ACCOUNT_ID}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        avatarSize={CONST.AVATAR_SIZE.X_SMALL}
                        isSmallAvatarSubscriptMenu
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
            />

            <Card
                title="accountID avatar + label + title + description"
                note="ScheduleCallConfirmationPage:112. Non-interactive, so hover/press never fire — the subscript border colour is static here."
                legacy={
                    <MenuItem
                        label="Setup specialist"
                        title="Alex Reed"
                        description="alex@example.com"
                        iconAccountID={STORY_ACCOUNT_ID}
                        interactive={false}
                    />
                }
            />

            <Card
                title="accountID avatar + tooltip title + description"
                note="DynamicNewTaskPage:186. titleWithTooltips routes the title through DisplayNames (MenuItem.tsx:776-788) instead of Text — hover the title to see the tooltip."
                legacy={
                    <MenuItem
                        label="Assignee"
                        title="Alex Reed"
                        description="alex@example.com"
                        iconAccountID={STORY_ACCOUNT_ID}
                        titleWithTooltips={STORY_TOOLTIP_DETAILS}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
            />

            <Card
                title="reportID avatar + right label"
                note="DynamicNewTaskPage:195. iconReportID resolves the report's own icon (workspace + subscript here), and rightLabel sits in the trailing cell next to the chevron."
                legacy={
                    <MenuItem
                        label="Share"
                        title="#announce"
                        description="Expensify Inc"
                        iconReportID={STORY_REPORT_ID}
                        rightLabel="Required"
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
            />

            <Card
                title="Disabled — greyed out vs not"
                note="TaskView:274 passes shouldGreyOutWhenDisabled={false} + shouldUseDefaultCursorWhenDisabled. Root currently always applies buttonOpacityDisabled, so it can only render the left variant."
                legacy={
                    <>
                        <Variant label="disabled (default: greyed out)">
                            <MenuItem
                                label="Assignee"
                                title="Alex Reed"
                                iconAccountID={STORY_ACCOUNT_ID}
                                avatarSize={CONST.AVATAR_SIZE.X_SMALL}
                                disabled
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="disabled + shouldGreyOutWhenDisabled={false}">
                            <MenuItem
                                label="Assignee"
                                title="Alex Reed"
                                iconAccountID={STORY_ACCOUNT_ID}
                                avatarSize={CONST.AVATAR_SIZE.X_SMALL}
                                disabled
                                shouldGreyOutWhenDisabled={false}
                                shouldUseDefaultCursorWhenDisabled
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
            />

            <SectionHeading title="Phase 2 — leading cell, non-avatar contents">
                {'Still legacy-only. These are what `MenuItem.Leading` has to absorb as children, so that `MenuItem.Icon` never grows a prop for them.'}
            </SectionHeading>

            <Card
                title="Icon with custom width/height"
                note="~35 of the 103 icon call sites pass iconWidth/iconHeight, so these belong on MenuItem.Icon itself rather than in an escape hatch."
                legacy={
                    <>
                        <Variant label="default size">
                            <MenuItem
                                title="Settings"
                                icon={icons.Gear}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                        <Variant label="iconWidth/iconHeight = 20">
                            <MenuItem
                                title="Settings"
                                icon={icons.Gear}
                                iconWidth={20}
                                iconHeight={20}
                                shouldShowRightIcon
                                onPress={noop}
                            />
                        </Variant>
                    </>
                }
            />

            <Card
                title="Loading spinner instead of an icon"
                note="shouldShowLoadingSpinnerIcon (5 sites) — legacy branches to ActivityIndicator inside the icon slot (MenuItem.tsx:983). A Leading slot expresses this as a child instead of a prop."
                legacy={
                    <MenuItem
                        title="Connecting"
                        icon={icons.Gear}
                        shouldShowLoadingSpinnerIcon
                        onPress={noop}
                    />
                }
            />

            <Card
                title="Icon + secondary icon"
                note="secondaryIcon (3 sites) — a second leading cell rather than a prop on the first."
                legacy={
                    <MenuItem
                        title="Settings"
                        icon={icons.Gear}
                        secondaryIcon={icons.Checkmark}
                        shouldShowRightIcon
                        onPress={noop}
                    />
                }
            />
        </View>
    );
}

export default story;
export {Comparison};
