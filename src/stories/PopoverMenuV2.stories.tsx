import type {Meta} from '@storybook/react-webpack5';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

function Default() {
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Bank', 'CreditCard']);
    return (
        <SafeAreaProvider>
            <PopoverMenu.Root>
                <PopoverMenu.Trigger
                    accessibilityLabel="Open menu"
                    role={CONST.ROLE.BUTTON}
                >
                    <PopoverMenu.Item
                        text="Add payment method"
                        icon={icons.Plus}
                        onSelect={() => {}}
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
                    <PopoverMenu.Item
                        text="Pick a payment method"
                        icon={icons.Plus}
                        onSelect={() => {}}
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
                    <PopoverMenu.Item
                        text="More"
                        icon={icons.Plus}
                        onSelect={() => {}}
                    />
                </PopoverMenu.Trigger>
                <PopoverMenu.Content>
                    <PopoverMenu.Item
                        text="Bank account"
                        icon={icons.Bank}
                        onSelect={() => {}}
                    />
                    <PopoverMenu.Sub>
                        <PopoverMenu.Sub.Trigger
                            text="Cards"
                            icon={icons.CreditCard}
                        />
                        <PopoverMenu.Sub.Content backButtonText="Cards">
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
                        </PopoverMenu.Sub.Content>
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
                    <PopoverMenu.Item
                        text={`Playback speed: ${selected}`}
                        icon={icons.Meter}
                        onSelect={() => {}}
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
                    <PopoverMenu.Item
                        text="Open 30-item menu"
                        icon={icons.Plus}
                        onSelect={() => {}}
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
                    <PopoverMenu.Item
                        text="Account actions"
                        icon={icons.Plus}
                        onSelect={() => {}}
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
                    <PopoverMenu.Item
                        text="Add payment method"
                        icon={icons.Plus}
                        onSelect={() => {}}
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
