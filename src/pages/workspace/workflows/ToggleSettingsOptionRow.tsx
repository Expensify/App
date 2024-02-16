import React, {useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';

type OptionType = {
    Illustration: React.ElementType<SvgProps>;
    title: string;
    subtitle: string;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
    isEndOptionRow?: boolean;
};

function ToggleSettingOptionRow({Illustration, title, subtitle, onToggle, subMenuItems, isEndOptionRow}: OptionType) {
    const [isEnabled, setIsEnabled] = useState(false);
    const styles = useThemeStyles();

    const toggleSwitch = () => {
        setIsEnabled((previousState) => !previousState);
        onToggle(!isEnabled);
    };
    const isSmallScreenWidth = getIsSmallScreenWidth();

    return (
        <View style={styles.pRelative}>
            <View style={styles.workspaceWorkflowContainer}>
                <View style={styles.workspaceWorkflowContent}>
                    <Illustration style={styles.workspaceWorkflowsIcon} />
                    <View style={styles.workspaceWorkflowsTimelineOverride} />
                    {!isEndOptionRow && (
                        <View
                            style={{
                                position: 'absolute',
                                width: 6,
                                backgroundImage: 'radial-gradient(circle at 2.5px, #1A3D32 1.25px, rgba(255, 255, 255, 0) 2.5px)',
                                backgroundSize: '5px 15px',
                                backgroundRepeat: 'repeat-y',
                                top: isSmallScreenWidth ? '32%' : '12%',
                                bottom: isEnabled ? '-180%' : '-100%',
                                left: isSmallScreenWidth ? '6%' : '2.45%',
                            }}
                        />
                    )}
                    <View style={styles.workspaceWorkflowsWrapperText}>
                        <Text style={styles.workspaceWorkflowsHeading}>{title}</Text>
                        <Text style={styles.workspaceWorkflowsSubtitle}>{subtitle}</Text>
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
            {isEnabled && <View>{subMenuItems}</View>}
        </View>
    );
}

export type {OptionType};
export default ToggleSettingOptionRow;
