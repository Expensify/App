import FormHelpMessage from '@components/FormHelpMessage';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type TabsAdapterProps = {
    items: Array<{value: string; label: string}>;

    /** Chosen option key supplied by the FormProvider */
    value?: string;

    /** Callback to update the choice in the FormProvider */
    onInputChange?: (value: string) => void;

    errorText?: string;
};

/** A choice presented as a segmented tab row, for the few-option switch that decides which fields follow */
function TabsAdapter({items, value, onInputChange = () => {}, errorText}: TabsAdapterProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.mb3}>
            <TabSelectorBase
                tabs={items.map((item) => ({key: item.value, title: item.label}))}
                activeTabKey={value || undefined}
                onTabPress={onInputChange}
                equalWidth
                shouldShowLabelWhenInactive
            />
            {!!errorText && <FormHelpMessage message={errorText} />}
        </View>
    );
}

export default TabsAdapter;
