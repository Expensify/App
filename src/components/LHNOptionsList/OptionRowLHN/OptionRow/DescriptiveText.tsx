import PlainText from '@components/PlainText';

import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import type {OptionData} from '@libs/ReportUtils';

import React from 'react';
import {View} from 'react-native';

type DescriptiveTextProps = {
    /** Option data for the row. Renders `optionItem.descriptiveText` when present; component returns null otherwise. */
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
            <PlainText style={[styles.textLabel]}>{descriptiveText}</PlainText>
        </View>
    );
}

DescriptiveText.displayName = 'OptionRow.DescriptiveText';

export default DescriptiveText;
