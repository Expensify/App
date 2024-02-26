import React, {useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type ToggleSettingOptionRowProps = {
    /** Icon to be shown for the option */
    icon: React.FC<SvgProps>;
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
};
const ICON_SIZE = 48;

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, isActive, pendingAction}: ToggleSettingOptionRowProps) {
    const [isEnabled, setIsEnabled] = useState(isActive);
    const styles = useThemeStyles();
    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        onToggle(!isEnabled);
    };

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <View style={styles.pRelative}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                        <Icon
                            src={icon}
                            height={ICON_SIZE}
                            width={ICON_SIZE}
                            additionalStyles={{
                                ...styles.mr3,
                                ...styles.pb4,
                            }}
                        />
                        <View style={[styles.flexColumn, styles.flex1]}>
                            <Text
                                style={{
                                    ...styles.textMicroBold,
                                    ...styles.textNormal,
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
                        onToggle={toggleSwitch}
                        isOn={isEnabled}
                    />
                </View>
                {isEnabled && subMenuItems}
            </View>
        </OfflineWithFeedback>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
