import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import RNTextInput from '@components/RNTextInput';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import variables from '@styles/variables';

import React, {useState} from 'react';
import {View} from 'react-native';

function ConciergePromptBox() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {firstName} = useCurrentUserPersonalDetails();
    const {askConcierge, shouldShowAskConcierge} = useAskConcierge();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Send']);
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Current moment in the user's timezone (resolved by the localization provider).
    const localNow = getLocalDateFromDatetime();
    const dateLabel = DateUtils.formatToLongDateWithWeekdayWithoutYear(localNow, dateFnsLocale);
    const greeting = translate(`homePage.conciergePrompt.${DateUtils.getTimeOfDayGreetingKey(localNow)}`, {name: firstName});
    const placeholder = translate(shouldUseNarrowLayout ? 'homePage.conciergePrompt.inputPlaceholderMobile' : 'homePage.conciergePrompt.inputPlaceholder');
    const canSubmit = shouldShowAskConcierge && value.trim().length > 0;

    const submit = () => {
        if (!canSubmit) {
            return;
        }
        askConcierge(value);
        setValue('');
    };

    return (
        <View style={styles.gap6}>
            <View style={styles.gap1}>
                <Text style={styles.textLabelSupporting}>{dateLabel}</Text>
                <Text style={styles.textHeadlineH1}>{greeting}</Text>
            </View>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph1, styles.getConciergePromptBoxContainerStyle(isFocused)]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStretch]}>
                    <View style={styles.conciergePromptBoxAddButton}>
                        <Icon
                            src={icons.Plus}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                            fill={theme.icon}
                        />
                    </View>
                    <View style={styles.conciergePromptBoxDivider} />
                </View>
                <RNTextInput
                    style={[styles.textNormal, styles.flex1, styles.noOutline, styles.conciergePromptBoxInput]}
                    value={value}
                    onChangeText={setValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    placeholderTextColor={theme.placeholderText}
                    onSubmitEditing={submit}
                    submitBehavior="submit"
                    returnKeyType="send"
                    accessibilityLabel={placeholder}
                />
                <PressableWithFeedback
                    accessibilityLabel={translate('common.send')}
                    sentryLabel="ConciergePromptBox-Send"
                    disabled={!canSubmit}
                    onPress={submit}
                    style={[styles.conciergePromptBoxSendButton, canSubmit && styles.buttonSuccess]}
                >
                    <Icon
                        src={icons.Send}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={canSubmit ? theme.textLight : theme.icon}
                    />
                </PressableWithFeedback>
            </View>
        </View>
    );
}

ConciergePromptBox.displayName = 'ConciergePromptBox';

export default ConciergePromptBox;
