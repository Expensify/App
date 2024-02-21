import React, {useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import { Styles } from '@styles/index';
import {defaultTheme } from '@styles/theme';
import { ThemeColors } from '@styles/theme/types';

type ToggleSettingOptionRowProps = {
    icon: React.FC<SvgProps>;
    title: string;
    subtitle: string;
    hasBeenToggled: boolean;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
    isEndOptionRow?: boolean;
    theme?: ThemeColors;
};

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, hasBeenToggled, theme}: ToggleSettingOptionRowProps) {
    const [isEnabled, setIsEnabled] = useState(hasBeenToggled);
    const styles = useThemeStyles();
    const ICON_SIZE = 48;
    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        onToggle(!isEnabled);
    };

    // Since these styles are only used in this component we define them here
    const workflowsStyles = {
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        icon: {
            marginRight: 12,
            zIndex: 2,
            paddingBottom: 15,
        },
        wrapperText: {
            flexDirection: 'column',
            flex: 1,
        },
        heading: {
            fontSize: 15,
            fontWeight: '700',
        }, 
        subtitle: {
            fontSize: 13,
            color: theme?.textSupporting || defaultTheme.textSupporting,
            marginTop: 3,
        },
    } satisfies Styles;

    return (
        <View style={styles.pRelative}>
            <View style={workflowsStyles.container}>
                <View style={workflowsStyles.content}>
                    <Icon
                        src={icon}
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                        additionalStyles={workflowsStyles.icon}
                    />
                    <View style={workflowsStyles.wrapperText}>
                        <Text style={workflowsStyles.heading}>{title}</Text>
                        <Text style={workflowsStyles.subtitle}>{subtitle}</Text>
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

