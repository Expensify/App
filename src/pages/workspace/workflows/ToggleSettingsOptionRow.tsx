import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type ToggleSettingOptionRowProps = {
    /** Icon to be shown for the option */
    icon: IconAsset;
    /** Title of the option */
    title: string;
    /** Subtitle of the option */
    subtitle: string;
    /** Whether the option is enabled or not */
    isActive: boolean;
    /** Callback to be called when the switch is toggled */
    onToggle: (isEnabled: boolean) => void;
    /** SubMenuItems will be shown when the option is enabled */
    subMenuItems?: React.ReactNode;
    /** If there is a pending action, we will grey out the option */
    pendingAction?: PendingAction;
    /** Any error message to show */
    errors?: Errors;
    /** Callback to close the error messages */
    onCloseError?: () => void;
};
const ICON_SIZE = 48;

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, isActive, pendingAction, errors, onCloseError}: ToggleSettingOptionRowProps) {
    const styles = useThemeStyles();

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={[styles.mt2]}
            onClose={onCloseError}
        >
            <View style={styles.pRelative}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                        <Icon
                            src={icon}
                            height={ICON_SIZE}
                            width={ICON_SIZE}
                            additionalStyles={{
                                ...styles.mr3,
                            }}
                        />
                        <View style={[styles.flexColumn, styles.flex1]}>
                            <Text
                                style={{
                                    ...styles.textMicroBold,
                                    ...styles.textNormal,
                                    ...styles.lh20,
                                }}
                            >
                                {title}
                            </Text>
                            <Text
                                style={{
                                    ...styles.textLabel,
                                    ...styles.mt1,
                                    ...styles.mr5,
                                    ...styles.textSupporting,
                                }}
                            >
                                {subtitle}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        accessibilityLabel={subtitle}
                        onToggle={onToggle}
                        isOn={isActive}
                    />
                </View>
                {isActive && subMenuItems}
            </View>
        </OfflineWithFeedback>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
