import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import type {ReportWelcomeMessageNavigatorParamList} from '@navigation/types';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportWelcomeMessagePageOnyxProps = {
    /** The policy object for the current route */
    policy: OnyxEntry<Policy>;
};

type ReportWelcomeMessagePageProps = ReportWelcomeMessagePageOnyxProps &
    WithReportOrNotFoundProps &
    StackScreenProps<ReportWelcomeMessageNavigatorParamList, typeof SCREENS.REPORT_WELCOME_MESSAGE_ROOT>;

function ReportWelcomeMessagePage({report, policy}: ReportWelcomeMessagePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const parser = new ExpensiMark();
    const [welcomeMessage, setWelcomeMessage] = useState(() => parser.htmlToMarkdown(report?.welcomeMessage ?? ''));
    const welcomeMessageInputRef = useRef<AnimatedTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleWelcomeMessageChange = useCallback((value: string) => {
        setWelcomeMessage(value);
    }, []);

    const submitForm = useCallback(() => {
        Report.updateWelcomeMessage(report?.reportID ?? '', report?.welcomeMessage ?? '', welcomeMessage.trim());
    }, [report?.reportID, report?.welcomeMessage, welcomeMessage]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (welcomeMessageInputRef.current) {
                    welcomeMessageInputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={false}
            testID={ReportWelcomeMessagePage.displayName}
        >
            <FullPageNotFoundView shouldShow={ReportUtils.shouldDisableWelcomeMessage(report, policy)}>
                <HeaderWithBackButton
                    title={translate('welcomeMessagePage.welcomeMessage')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID ?? ''))}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WELCOME_MESSAGE_FORM}
                    onSubmit={submitForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb5]}>{translate('welcomeMessagePage.explainerText')}</Text>
                    <View style={[styles.mb6]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="welcomeMessage"
                            label={translate('welcomeMessagePage.welcomeMessage')}
                            accessibilityLabel={translate('welcomeMessagePage.welcomeMessage')}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(element: AnimatedTextInputRef) => {
                                if (!element) {
                                    return;
                                }
                                welcomeMessageInputRef.current = element;
                                updateMultilineInputRange(welcomeMessageInputRef.current);
                            }}
                            value={welcomeMessage}
                            onChangeText={handleWelcomeMessageChange}
                            autoCapitalize="none"
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportWelcomeMessagePage.displayName = 'ReportWelcomeMessagePage';

export default withReportOrNotFound()(
    withOnyx<ReportWelcomeMessagePageProps, ReportWelcomeMessagePageOnyxProps>({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
        },
    })(ReportWelcomeMessagePage),
);
