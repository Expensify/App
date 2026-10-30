/** Shares the labeled switch layout and offline feedback used by expense flags. */
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import type {SwitchProps} from '@components/Switch';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_TEXT_DATA_SET} from '@libs/SelectionScraper';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

type ToggleFieldProps = PropsWithChildren<Pick<OfflineWithFeedbackProps, 'pendingAction'> & Pick<SwitchProps, 'isOn' | 'onToggle' | 'disabled' | 'accessibilityLabel'>>;

function ToggleField({pendingAction, accessibilityLabel, isOn, onToggle, disabled, children}: ToggleFieldProps) {
    const styles = useThemeStyles();

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mh5]}
        >
            <View>
                <Text
                    accessible={false}
                    aria-hidden
                    dataSet={COPYABLE_TEXT_DATA_SET}
                >
                    {accessibilityLabel}
                </Text>
                {children}
            </View>
            <Switch
                accessibilityLabel={accessibilityLabel}
                isOn={isOn}
                onToggle={onToggle}
                disabled={disabled}
            />
        </OfflineWithFeedback>
    );
}

export default ToggleField;
export type {ToggleFieldProps};
