import type {Meta} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from '@components/Icon';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import variables from '@styles/variables';
import CONST from '@src/CONST';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof PopoverMenu.Root> = {
    title: 'Components/PopoverMenu V2',
    component: PopoverMenu.Root,
};

const triggerStyle = {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start'} as const;

function TriggerLabel({iconSrc, label}: {iconSrc: React.ComponentProps<typeof Icon>['src']; label: string}) {
    return (
        <View style={triggerStyle}>
            <Icon
                src={iconSrc}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Text>{label}</Text>
        </View>
    );
}

function Default() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="Add payment method"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Bank account"
                        icon={icons.Bank}
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Item
                        text="Debit card"
                        icon={icons.CreditCard}
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function WithHeader() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="Pick a payment method"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Header>Payment methods</PopoverMenu.Header>
                    <PopoverMenu.Item
                        text="Bank account"
                        icon={icons.Bank}
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Item
                        text="Debit card"
                        icon={icons.CreditCard}
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function WithSubmenu() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard', 'Wallet']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="More"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Bank account"
                        icon={icons.Bank}
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Sub>
                        <PopoverMenu.SubTrigger
                            text="Cards"
                            icon={icons.CreditCard}
                        />
                        <PopoverMenu.SubContent backButtonText="Cards">
                            <PopoverMenu.Item
                                text="Debit card"
                                icon={icons.CreditCard}
                                onSelect={() => {}}
                            />
                            <PopoverMenu.Item
                                text="Credit card"
                                icon={icons.CreditCard}
                                onSelect={() => {}}
                            />
                        </PopoverMenu.SubContent>
                    </PopoverMenu.Sub>
                    <PopoverMenu.Item
                        text="Wallet"
                        icon={icons.Wallet}
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function WithCheckmarkItems() {
    const [selected, setSelected] = React.useState('1x');
    const icons = useMemoizedLazyExpensifyIcons(['Meter']);
    const speeds = ['0.5x', '1x', '1.5x', '2x'];
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open speed menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Meter}
                        label={`Playback speed: ${selected}`}
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Header>Playback speed</PopoverMenu.Header>
                    {speeds.map((speed) => (
                        <PopoverMenu.CheckmarkItem
                            key={speed}
                            text={speed}
                            isSelected={selected === speed}
                            onSelect={() => setSelected(speed)}
                            shouldPutLeftPaddingWhenNoIcon
                        />
                    ))}
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function ScrollableVariant() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const items = Array.from({length: 30}, (_, i) => `Option ${i + 1}`);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open long menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="Open 30-item menu"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.ScrollableContent>
                    <PopoverMenu.Header>Pick an option</PopoverMenu.Header>
                    {items.map((item) => (
                        <PopoverMenu.Item
                            key={item}
                            text={item}
                            onSelect={() => {}}
                        />
                    ))}
                </PopoverMenu.ScrollableContent>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function GroupedWithSeparator() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard', 'Wallet', 'Trashcan']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="Account actions"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Group>
                        <PopoverMenu.Item
                            text="Bank account"
                            icon={icons.Bank}
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="Debit card"
                            icon={icons.CreditCard}
                            onSelect={() => {}}
                        />
                        <PopoverMenu.Item
                            text="Wallet"
                            icon={icons.Wallet}
                            onSelect={() => {}}
                        />
                    </PopoverMenu.Group>
                    <PopoverMenu.Separator />
                    <PopoverMenu.Item
                        text="Remove account"
                        icon={icons.Trashcan}
                        onSelect={() => {}}
                    />
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

function DisabledRow() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <TriggerLabel
                        iconSrc={icons.Plus}
                        label="Add payment method"
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Bank account"
                        icon={icons.Bank}
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Item
                        text="Debit card (coming soon)"
                        icon={icons.CreditCard}
                        onSelect={() => {}}
                        disabled
                    />
                </PopoverMenu.Content>
            </PopoverMenu.Root>
        </SafeAreaProvider>
    );
}

export default story;
export {Default, WithHeader, WithSubmenu, WithCheckmarkItems, ScrollableVariant, GroupedWithSeparator, DisabledRow};
