import React, {useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import type {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ImageSVG from '@components/ImageSVG';
import Dot from '@assets/images/dot.svg';

type ToggleSettingOptionRowProps = {
    icon: React.FC<SvgProps>;
    title: string;
    subtitle: string;
    hasBeenToggled: boolean;
    onToggle: (isEnabled: boolean) => void;
    subMenuItems?: React.ReactNode;
    isEndOptionRow?: boolean;
};

function ToggleSettingOptionRow({icon, title, subtitle, onToggle, subMenuItems, isEndOptionRow, hasBeenToggled}: ToggleSettingOptionRowProps) {
    const [isEnabled, setIsEnabled] = useState(hasBeenToggled);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        onToggle(!isEnabled);
    };
    const {isSmallScreenWidth} = useWindowDimensions();


    const VerticalDots = ({count}: {count: number}) => {
        return (
        <View style={StyleUtils.getWorkspaceWorkflowsDotStyle(isEnabled, isSmallScreenWidth) as ViewStyle}>
            {Array.from({length: count}, (_, index) => (
            <ImageSVG
            contentFit="contain"
            src={Dot}
            height={isSmallScreenWidth ? 4 : 6}
            width={isSmallScreenWidth ? 4 : 6}
            pointerEvents="none"
            />))}
        </View>
        );
    };

    return (
        <View style={styles.pRelative}>
            <View style={StyleUtils.getWorkflowsStyle('container')}>
                <View style={StyleUtils.getWorkflowsStyle('content')}>
                    <Icon
                        src={icon}
                        height={48}
                        width={48}
                        additionalStyles={StyleUtils.getWorkflowsStyle('icon')}
                    />
                    <View style={StyleUtils.getWorkflowsStyle('timelineOverride')} />
                    {!isEndOptionRow && (
                        <VerticalDots count={7}/>
                    )}
                    <View style={StyleUtils.getWorkflowsStyle('wrapperText')}>
                        <Text style={StyleUtils.getWorkflowsStyle('heading')}>{title}</Text>
                        <Text style={StyleUtils.getWorkflowsStyle('subtitle')}>{subtitle}</Text>
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

