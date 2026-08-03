import MenuItem from '@components/MenuItem';
import MenuItemStandard from '@components/MenuItem/presets/MenuItemStandard';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

/**
 * Grid comparison of the legacy `MenuItem` monolith, the new composable
 * `MenuItem.Root`/`Row`/... API, and the `MenuItemStandard` preset. Each card shows
 * the same visual case built with every API that can currently express it.
 */
const story: Meta<typeof MenuItem> = {
    title: 'Components/MenuItemComparison',
    component: MenuItem,
};

const CARD_WIDTH = 360;

function noop() {}

function Label({children}: {children: string}) {
    const styles = useThemeStyles();
    return <Text style={[styles.textMicroBold, styles.textSupporting, styles.mb1]}>{children}</Text>;
}

function Card({title, legacy, composable, standard}: {title: string; legacy: React.ReactNode; composable: React.ReactNode; standard?: React.ReactNode}) {
    const styles = useThemeStyles();

    return (
        <View style={[{width: CARD_WIDTH}, styles.border, styles.br3, styles.p3, styles.gap3]}>
            <Text style={[styles.textLabelSupportingNormal, styles.textStrong]}>{title}</Text>
            <View>
                <Label>Legacy</Label>
                {legacy}
            </View>
            <View>
                <Label>Composable</Label>
                {composable}
            </View>
            {!!standard && (
                <View>
                    <Label>Standard preset</Label>
                    {standard}
                </View>
            )}
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
        <View style={[styles.p4, styles.flexRow, styles.flexWrap, styles.gap4]}>
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
                            <MenuItem.Icon src={icons.Gear} />
                            <MenuItem.Content>
                                <MenuItem.Title>Settings</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItem.Root>
                }
                standard={
                    <MenuItemStandard
                        title={'Settings'}
                        icon={icons.Gear}
                        onPress={noop}
                    />
                }
            />
        </View>
    );
}

export default story;
export {Comparison};
