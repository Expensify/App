import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext, useState} from 'react';
import {View} from 'react-native';

type SystemMessageLayout = 'oneLine' | 'twoLines';

const SystemMessageLayoutContext = createContext<SystemMessageLayout>('twoLines');

/**
 * NEVER MERGE: temporary, component-local comparison UI for issue #97328.
 * The selected layout is intentionally not persisted or connected to any production setting.
 */
function TemporarySystemMessageDesignComparison({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const [layout, setLayout] = useState<SystemMessageLayout>('twoLines');

    return (
        <SystemMessageLayoutContext.Provider value={layout}>
            <View style={styles.flex1}>
                <View style={[styles.ph5, styles.pv2, styles.gap2, styles.borderBottom]}>
                    <Text style={styles.textMicroBold}>Temporary design comparison</Text>
                    <Text style={[styles.textMicro, styles.colorMuted]}>One line: Micro actor, action, and timestamp inline. Two lines: Micro timestamp above Body actor and action.</Text>
                    <View
                        style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap3]}
                        role={CONST.ROLE.RADIOGROUP}
                        accessibilityLabel="System message layout"
                    >
                        <RadioButtonWithLabel
                            label="One line"
                            accessibilityLabel="One line"
                            isChecked={layout === 'oneLine'}
                            onPress={() => setLayout('oneLine')}
                        />
                        <RadioButtonWithLabel
                            label="Two lines"
                            accessibilityLabel="Two lines"
                            isChecked={layout === 'twoLines'}
                            onPress={() => setLayout('twoLines')}
                        />
                    </View>
                </View>
                <View style={[styles.flex1, styles.pRelative, styles.overflowHidden]}>{children}</View>
            </View>
        </SystemMessageLayoutContext.Provider>
    );
}

function useTemporarySystemMessageLayout(): SystemMessageLayout {
    return useContext(SystemMessageLayoutContext);
}

export default TemporarySystemMessageDesignComparison;
export {useTemporarySystemMessageLayout};
export type {SystemMessageLayout};
