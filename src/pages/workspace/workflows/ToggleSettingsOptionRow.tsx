import React from 'react';
import {View, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type ToggleSettingOptionRowProps = {
    // Key used internally by React
    key?: string;
    /** Icon to be shown for the option */
    icon?: IconAsset;
    /** Title of the option */
    title: string;
    /** Subtitle of the option */
    subtitle: string;
    /** subtitle should show below switch and title */
    shouldPlaceSubtitleBelowSwitch?: boolean;
    /** Used to apply styles to the outermost container */
    wrapperStyle?: ViewStyle;
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

function ToggleSettingOptionRow({
    key,
    icon,
    title,
    subtitle,
    shouldPlaceSubtitleBelowSwitch,
    wrapperStyle,
    onToggle,
    subMenuItems,
    isActive,
    pendingAction,
    errors,
    onCloseError,
}: ToggleSettingOptionRowProps) {
    const styles = useThemeStyles();

    const subTitleView = () => {
        return (
            <Text
                style={{
                    ...styles.textLabel,
                    ...(shouldPlaceSubtitleBelowSwitch ? styles.mt4 : styles.mt1),
                    ...(!shouldPlaceSubtitleBelowSwitch && styles.mr5),
                    ...styles.textSupporting,
                }}
            >
                {subtitle}
            </Text>
        );
    };

    return (
        <OfflineWithFeedback
            key={key}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={[styles.mt2]}
            style={[wrapperStyle]}
            onClose={onCloseError}
        >
            <View style={styles.pRelative}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                        {icon && (
                            <Icon
                                src={icon}
                                height={ICON_SIZE}
                                width={ICON_SIZE}
                                additionalStyles={{
                                    ...styles.mr3,
                                }}
                            />
                        )}
                        <View style={[styles.flexColumn, styles.flex1]}>
                            <Text
                                style={{
                                    ...(!shouldPlaceSubtitleBelowSwitch && styles.textMicroBold),
                                    ...styles.textNormal,
                                    ...styles.lh20,
                                }}
                            >
                                {title}
                            </Text>
                            {!shouldPlaceSubtitleBelowSwitch && subTitleView()}
                        </View>
                    </View>
                    <Switch
                        accessibilityLabel={subtitle}
                        onToggle={onToggle}
                        isOn={isActive}
                    />
                </View>
                {shouldPlaceSubtitleBelowSwitch && subTitleView()}
                {isActive && subMenuItems}
            </View>
        </OfflineWithFeedback>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
