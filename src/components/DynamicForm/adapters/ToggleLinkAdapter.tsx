import TextLink from '@components/TextLink';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ComponentRef, Ref} from 'react';

import React from 'react';
import {View} from 'react-native';

type ToggleLinkAdapterProps = ForwardedFSClassProps & {
    /** The empty string means unanswered, which reads as off */
    value?: boolean | '';

    /** Called with the flipped answer on each tap */
    onInputChange?: (value: boolean) => void;

    /** Wording of the link while the answer is off */
    label: string;

    /** Wording of the link while the answer is on, so a second tap reads as undoing the first. Falls back to `label`. */
    toggledLabel?: string;

    /** Lets FormProvider scroll to the field when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;
};

/** A boolean asked as a link the user taps to turn on and taps again to turn off, such as "I don't have a social security number" */
function ToggleLinkAdapter({value, onInputChange = () => {}, label, toggledLabel, forwardedFSClass, ref}: ToggleLinkAdapterProps) {
    const isOn = value === true;

    return (
        <View
            ref={ref}
            fsClass={forwardedFSClass}
        >
            <TextLink onPress={() => onInputChange(!isOn)}>{isOn ? (toggledLabel ?? label) : label}</TextLink>
        </View>
    );
}

export default ToggleLinkAdapter;
