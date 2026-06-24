import type {Meta} from '@storybook/react-webpack5';
import React, {useState} from 'react';
import {View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {TupleToUnion} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {AlertDialog, BottomDockedModal, CenteredModal, CenteredSmallModal, FullscreenModal, RightDockedModal} from '@components/Modal/v2';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import variables from '@styles/variables';

const story: Meta = {
    title: 'Components/Modal V2',
};

export default story;

const triggerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: variables.spacing2,
    padding: variables.spacing2 + 4,
    borderWidth: variables.borderTopWidth,
    borderRadius: variables.componentBorderRadiusNormal,
    alignSelf: 'flex-start',
} as const;

const bodyStyle = {
    padding: variables.spacing2 + 12,
    gap: variables.spacing2 * 2,
} as const;

const titleStyle = {
    fontSize: variables.fontSizeLarge,
    fontWeight: '700',
} as const;

const descriptionStyle = {
    fontSize: variables.fontSizeNormal,
    lineHeight: variables.lineHeightNormal,
} as const;

const externalToggleStyle = {gap: variables.spacing2 + 4} as const;

const KIND_KEYS = ['Centered', 'CenteredSmall', 'BottomDocked', 'RightDocked', 'Fullscreen', 'AlertDialog'] as const;
type KindKey = TupleToUnion<typeof KIND_KEYS>;

const KIND_VARIANTS = {
    Centered: CenteredModal,
    CenteredSmall: CenteredSmallModal,
    BottomDocked: BottomDockedModal,
    RightDocked: RightDockedModal,
    Fullscreen: FullscreenModal,
    AlertDialog,
} satisfies Record<KindKey, unknown>;
type EscapeBehavior = 'dismiss' | 'ignore';

type ModalArgs = {
    kind: KindKey;
    escapeBehavior: EscapeBehavior;
    controlled: boolean;
};

function Modal({kind, escapeBehavior, controlled}: ModalArgs) {
    const Variant = KIND_VARIANTS[kind];
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const [isOpen, setOpen] = useState(false);
    const isControlled = controlled;

    return (
        <SafeAreaProvider>
            <View style={externalToggleStyle}>
                {isControlled && (
                    <Button
                        text={isOpen ? 'Close (external)' : 'Open (external)'}
                        onPress={() => setOpen((previous) => !previous)}
                    />
                )}
                <Variant.Root
                    isOpen={isControlled ? isOpen : undefined}
                    onOpenChange={setOpen}
                >
                    <Variant.Trigger
                        accessibilityLabel={`Open ${kind}`}
                        sentryLabel="ModalV2.Story.Trigger"
                    >
                        <View style={triggerStyle}>
                            <Icon
                                src={icons.Plus}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                            />
                            <Text>Open {kind}</Text>
                        </View>
                    </Variant.Trigger>
                    <Variant.Content escapeBehavior={escapeBehavior}>
                        <View style={bodyStyle}>
                            <Variant.Title style={titleStyle}>{kind}</Variant.Title>
                            <Variant.Description style={descriptionStyle}>
                                Switch <Text style={{fontWeight: '700'}}>kind</Text>, <Text style={{fontWeight: '700'}}>escapeBehavior</Text>, or{' '}
                                <Text style={{fontWeight: '700'}}>controlled</Text> in the Storybook controls panel. AlertDialog renders with role=&quot;alertdialog&quot;;
                                escapeBehavior=&quot;ignore&quot; disables backdrop tap, Escape, and Android back.
                            </Variant.Description>
                            <Variant.Close
                                accessibilityLabel="Close"
                                sentryLabel="ModalV2.Story.Close"
                            >
                                <View style={triggerStyle}>
                                    <Text>Close</Text>
                                </View>
                            </Variant.Close>
                        </View>
                    </Variant.Content>
                </Variant.Root>
            </View>
        </SafeAreaProvider>
    );
}

Modal.args = {
    kind: 'Centered',
    escapeBehavior: 'dismiss',
    controlled: false,
} satisfies ModalArgs;

Modal.argTypes = {
    kind: {control: 'select', options: KIND_KEYS},
    escapeBehavior: {control: 'radio', options: ['dismiss', 'ignore'] satisfies EscapeBehavior[]},
    controlled: {control: 'boolean'},
};

export {Modal};
