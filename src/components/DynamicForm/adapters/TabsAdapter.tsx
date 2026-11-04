import FormHelpMessage from '@components/FormHelpMessage';
import type {Choice} from '@components/RadioButtons';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import type {ComponentRef, Ref} from 'react';

import React from 'react';
import {View} from 'react-native';

type TabsAdapterProps = ForwardedFSClassProps & {
    /** Options, one tab each */
    items: Choice[];

    /** Key of the picked option */
    value?: string;

    /** Called with the key of the picked option */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the tabs */
    errorText?: string;

    /** The question the tabs answer, read out by screen readers as the name of the group */
    accessibilityLabel?: string;

    /** Lets FormProvider scroll to the field when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;
};

/** A choice drawn as a segmented tab row, for the few-option switch that decides which fields follow */
function TabsAdapter({items, value, onInputChange = () => {}, errorText, forwardedFSClass, accessibilityLabel, ref}: TabsAdapterProps) {
    const styles = useThemeStyles();

    return (
        <View
            ref={ref}
            fsClass={forwardedFSClass}
        >
            {/* The tabs answer a question instead of switching views, so they are a radio group to screen readers */}
            <View
                role={CONST.ROLE.RADIOGROUP}
                accessibilityLabel={accessibilityLabel}
            >
                <TabSelectorBase
                    tabs={items.map((item) => ({key: item.value, title: item.label}))}
                    activeTabKey={value === '' ? undefined : value}
                    onTabPress={onInputChange}
                    equalWidth
                    shouldShowLabelWhenInactive
                    itemRole={CONST.ROLE.RADIO}
                    itemGroupAccessibilityLabel={accessibilityLabel}
                    // The selector pads itself for the top of a page, while here it sits inside a field row that spaces and aligns it like an input
                    contentContainerStyles={[styles.ph0, styles.pb0]}
                />
            </View>
            {!!errorText && <FormHelpMessage message={errorText} />}
        </View>
    );
}

export default TabsAdapter;
