import MenuItem from '@components/MenuItem';
import MenuItemStandard from '@components/MenuItem/presets/MenuItemStandard';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

/**
 * Side-by-side comparison of the legacy `MenuItem` monolith, the new composable
 * `MenuItem.Root`/`Row`/... API, and the `MenuItemStandard` preset. Each section shows
 * the same visual case built with every API that can currently express it.
 */
const story: Meta<typeof MenuItem> = {
    title: 'Components/MenuItemComparison',
    component: MenuItem,
};

const COLUMN_WIDTH = 375;

function noop() {}

function Column({label, children}: {label: string; children?: React.ReactNode}) {
    const styles = useThemeStyles();

    return (
        <View style={{width: COLUMN_WIDTH}}>
            <Text style={[styles.textLabelSupporting, styles.mb2]}>{label}</Text>
            {children ?? <Text style={[styles.textSupporting, styles.p3]}>—</Text>}
        </View>
    );
}

function Section({title, legacy, composable, standard}: {title: string; legacy: React.ReactNode; composable: React.ReactNode; standard?: React.ReactNode}) {
    const styles = useThemeStyles();

    return (
        <View style={styles.mb8}>
            <Text style={[styles.textHeadlineH2, styles.mb3]}>{title}</Text>
            <View style={[styles.flexRow, styles.gap4, styles.flexWrap]}>
                <Column label="Legacy MenuItem">{legacy}</Column>
                <Column label="Composable API">{composable}</Column>
                {!!standard && <Column label="MenuItemStandard preset">{standard}</Column>}
            </View>
        </View>
    );
}

function Comparison() {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);

    if (!icons.Gear) {
        return null;
    }

    return (
        <View style={styles.p4}>
            <Section
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

            <Section
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
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                standard={
                    <MenuItemStandard
                        title="Settings"
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />

            <Section
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
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                standard={
                    <MenuItemStandard
                        title="Settings"
                        icon={icons.Gear}
                        shouldShowChevron
                        onPress={noop}
                    />
                }
            />

            <Section
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
                            <MenuItem.Icon src={icons.Gear} />
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
                standard={
                    <MenuItemStandard
                        title="Settings"
                        description="Manage your preferences"
                        icon={icons.Gear}
                        shouldShowChevron
                        onPress={noop}
                    />
                }
            />

            <Section
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

            <Section
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
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                standard={
                    <MenuItemStandard
                        title="Settings"
                        icon={icons.Gear}
                    />
                }
            />

            <Section
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
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                standard={
                    <MenuItemStandard
                        title="Settings"
                        icon={icons.Gear}
                        shouldShowChevron
                        isDisabled
                        onPress={noop}
                    />
                }
            />

            <Section
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
                        accessibilityLabel="Open settings"
                    >
                        <MenuItem.Row>
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
            />
        </View>
    );
}

export default story;
export {Comparison};
