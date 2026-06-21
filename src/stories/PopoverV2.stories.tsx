import type {Meta} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Popover from '@components/Popover/v2';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import variables from '@styles/variables';

const story: Meta<typeof Popover.Root> = {
    title: 'Components/Popover V2',
    component: Popover.Root,
};

const triggerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: variables.spacing2,
    padding: variables.spacing2 + 4,
    borderWidth: variables.borderTopWidth,
    borderRadius: variables.componentBorderRadiusNormal,
    alignSelf: 'flex-start',
} as const;

const contentStyle = {
    padding: variables.spacing2 + 4,
    gap: variables.spacing2,
    minWidth: 240,
} as const;

const titleStyle = {
    fontSize: variables.fontSizeNormal,
    fontWeight: '700',
} as const;

const descriptionStyle = {
    fontSize: variables.fontSizeSmall,
    lineHeight: variables.lineHeightSmall,
} as const;

const surfaceStyle = {
    padding: variables.spacing2,
    borderRadius: variables.componentBorderRadiusNormal,
} as const;

const rowGapStyle = {
    gap: variables.spacing2 + 4,
} as const;

function StoryTrigger({iconSrc, label}: {iconSrc: React.ComponentProps<typeof Icon>['src']; label: string}) {
    return (
        <Popover.Trigger
            accessibilityLabel={label}
            sentryLabel="PopoverV2.Story.Trigger"
        >
            <View style={triggerStyle}>
                <Icon
                    src={iconSrc}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
                <Text>{label}</Text>
            </View>
        </Popover.Trigger>
    );
}

function Default() {
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    return (
        <SafeAreaProvider>
            <Popover.Root>
                <StoryTrigger
                    iconSrc={icons.Info}
                    label="Show details"
                />
                <Popover.Content style={surfaceStyle}>
                    <View style={contentStyle}>
                        <Popover.Title style={titleStyle}>Details</Popover.Title>
                        <Popover.Description style={descriptionStyle}>This popover anchors below the trigger by default and dismisses on outside click or Escape.</Popover.Description>
                    </View>
                </Popover.Content>
            </Popover.Root>
        </SafeAreaProvider>
    );
}

function DecoupledAnchor() {
    const icons = useMemoizedLazyExpensifyIcons(['Info', 'Plus']);
    const anchorRef = React.useRef<View>(null);
    return (
        <SafeAreaProvider>
            <Popover.Root>
                <View style={rowGapStyle}>
                    <Popover.Anchor anchorRef={anchorRef}>
                        <View
                            ref={anchorRef}
                            style={triggerStyle}
                        >
                            <Icon
                                src={icons.Info}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                            />
                            <Text>Positioning anchor (not the trigger)</Text>
                        </View>
                    </Popover.Anchor>
                    <StoryTrigger
                        iconSrc={icons.Plus}
                        label="Open from a separate trigger"
                    />
                </View>
                <Popover.Content style={surfaceStyle}>
                    <View style={contentStyle}>
                        <Popover.Title style={titleStyle}>Decoupled positioning</Popover.Title>
                        <Popover.Description style={descriptionStyle}>
                            The Trigger opens the popover, but it positions against the &lt;Anchor&gt; node — useful when the visual anchor differs from the interactive opener.
                        </Popover.Description>
                    </View>
                </Popover.Content>
            </Popover.Root>
        </SafeAreaProvider>
    );
}

function Controlled() {
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const [isOpen, setOpen] = React.useState(false);
    return (
        <SafeAreaProvider>
            <View style={rowGapStyle}>
                <Button
                    text={isOpen ? 'Close (external)' : 'Open (external)'}
                    onPress={() => setOpen((previous) => !previous)}
                />
                <Popover.Root
                    isOpen={isOpen}
                    onOpenChange={setOpen}
                >
                    <StoryTrigger
                        iconSrc={icons.Info}
                        label="Open from internal Trigger"
                    />
                    <Popover.Content style={surfaceStyle}>
                        <View style={contentStyle}>
                            <Popover.Title style={titleStyle}>Controlled</Popover.Title>
                            <Popover.Description style={descriptionStyle}>
                                Open/close via the external Button or the internal Trigger — both flow through the same controlled state.
                            </Popover.Description>
                            <Popover.Close
                                accessibilityLabel="Close popover"
                                sentryLabel="PopoverV2.Story.Close"
                            >
                                <View style={triggerStyle}>
                                    <Text>Close from inside</Text>
                                </View>
                            </Popover.Close>
                        </View>
                    </Popover.Content>
                </Popover.Root>
            </View>
        </SafeAreaProvider>
    );
}

function AsTooltip() {
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    return (
        <SafeAreaProvider>
            <Popover.Root defaultOpen>
                <StoryTrigger
                    iconSrc={icons.Info}
                    label="Tooltip role"
                />
                <Popover.Content
                    role="tooltip"
                    style={surfaceStyle}
                >
                    <View style={contentStyle}>
                        <Popover.Description style={descriptionStyle}>
                            Renders with role=&quot;tooltip&quot;. Use for non-essential hover hints; never for required content.
                        </Popover.Description>
                    </View>
                </Popover.Content>
            </Popover.Root>
        </SafeAreaProvider>
    );
}

export default story;
export {Default, DecoupledAnchor, Controlled, AsTooltip};
