import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import type {OptionData} from '@libs/ReportUtils';

type DescriptiveTextProps = {
    optionItem: OptionData;
};

function DescriptiveText({optionItem}: DescriptiveTextProps) {
    const styles = useThemeStyles();

    const descriptiveText = optionItem?.descriptiveText;
    if (!descriptiveText) {
        return null;
    }

    return (
        <View
            style={[styles.flexWrap]}
            fsClass={FS.getChatFSClass(optionItem)}
        >
            <Text style={[styles.textLabel]}>{descriptiveText}</Text>
        </View>
    );
}

DescriptiveText.displayName = 'OptionRow.DescriptiveText';

export default DescriptiveText;
