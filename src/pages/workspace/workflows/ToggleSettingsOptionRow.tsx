import React, {useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type ToggleSettingOptionRowProps = {
    icon: React.FC<SvgProps>;
    title: string;
    subtitle: string;
    hasBeenToggled: boolean;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
};

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, hasBeenToggled}: ToggleSettingOptionRowProps) {
    const [isEnabled, setIsEnabled] = useState(hasBeenToggled);
    const styles = useThemeStyles();
    const ICON_SIZE = 48;
    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        onToggle(!isEnabled);
    };

    return (
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
                        <Text style={{
                            ...styles.textMicroBold,
                            ...styles.textNormal,
                        }}>{title}</Text>
                        <Text style={{
                            ...styles.textLabel,
                            ...styles.mt1,
                            ...styles.mr5,
                            ...styles.textSupporting,
                        }}>{subtitle}</Text>
                    </View>
                </View>
                <View>
                    <Switch
                        accessibilityLabel={subtitle}
                        onToggle={toggleSwitch}
                        isOn={isEnabled}
                    />
                </View>
            </View>
            {isEnabled && subMenuItems}
        </View>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
