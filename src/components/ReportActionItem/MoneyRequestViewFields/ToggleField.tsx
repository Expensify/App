import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ComponentProps} from 'react';

import React from 'react';
import {View} from 'react-native';

type ToggleFieldProps = Pick<OfflineWithFeedbackProps, 'pendingAction'> &
    Pick<ComponentProps<typeof Switch>, 'isOn' | 'onToggle' | 'disabled' | 'accessibilityLabel'> & {
        /** Policy violations to display alongside the toggle. */
        violationProps?: Omit<ComponentProps<typeof ViolationMessages>, 'containerStyle' | 'textStyle' | 'isLast'>;
    };

function ToggleField({pendingAction, accessibilityLabel, isOn, onToggle, disabled, violationProps}: ToggleFieldProps) {
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
                >
                    {accessibilityLabel}
                </Text>
                {!!violationProps && (
                    <ViolationMessages
                        {...violationProps}
                        containerStyle={[styles.mt1]}
                        textStyle={[styles.ph0]}
                        isLast
                    />
                )}
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
