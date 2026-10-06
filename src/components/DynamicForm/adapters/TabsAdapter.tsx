import FormHelpMessage from '@components/FormHelpMessage';
import type {Choice} from '@components/RadioButtons';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type TabsAdapterProps = {
    /** Options, one tab each */
    items: Choice[];

    /** Key of the picked option */
    value?: string;

    /** Called with the key of the picked option */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the tabs */
    errorText?: string;
};

/** A choice drawn as a segmented tab row, for the few-option switch that decides which fields follow */
function TabsAdapter({items, value, onInputChange = () => {}, errorText}: TabsAdapterProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.mb3}>
            <TabSelectorBase
                tabs={items.map((item) => ({key: item.value, title: item.label}))}
                activeTabKey={value === '' ? undefined : value}
                onTabPress={onInputChange}
                equalWidth
                shouldShowLabelWhenInactive
            />
            {!!errorText && <FormHelpMessage message={errorText} />}
        </View>
    );
}

export default TabsAdapter;
