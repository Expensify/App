import FormHelpMessage from '@components/FormHelpMessage';
import type {Choice} from '@components/RadioButtons';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

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

    /** The question the tabs answer, read out by screen readers as the name of the tab list */
    accessibilityLabel?: string;
};

/** A choice drawn as a segmented tab row, for the few-option switch that decides which fields follow */
function TabsAdapter({items, value, onInputChange = () => {}, errorText, forwardedFSClass, accessibilityLabel}: TabsAdapterProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={styles.mb3}
            fsClass={forwardedFSClass}
        >
            <View
                role={CONST.ROLE.TABLIST}
                accessibilityLabel={accessibilityLabel}
            >
                <TabSelectorBase
                    tabs={items.map((item) => ({key: item.value, title: item.label}))}
                    activeTabKey={value === '' ? undefined : value}
                    onTabPress={onInputChange}
                    equalWidth
                    shouldShowLabelWhenInactive
                />
            </View>
            {!!errorText && <FormHelpMessage message={errorText} />}
        </View>
    );
}

export default TabsAdapter;
