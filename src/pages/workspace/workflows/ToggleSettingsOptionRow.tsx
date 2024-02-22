import React, {useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useNetwork from '@hooks/useNetwork';
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
    const [shouldShowOfflineStyle, setShouldShowOfflineStyle] = useState(false);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const ICON_SIZE = 48;
    const toggleSwitch = () => {
        if (isEnabled && isOffline) {
            setShouldShowOfflineStyle(true);
        } else {
            setShouldShowOfflineStyle(false);
        }
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
                <View>
                    <Switch
                        accessibilityLabel={subtitle}
                        onToggle={toggleSwitch}
                        isOn={isEnabled}
                        additionalStyle={shouldShowOfflineStyle ? styles.buttonOpacityDisabled : styles.opacity1}
                    />
                </View>
            </View>
            {isEnabled && subMenuItems}
        </View>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
