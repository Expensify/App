import {useFocusEffect} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReportDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';

type RoomDescriptionPageProps = {
    /** Policy for the current report */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function RoomDescriptionPage({report, policies}: RoomDescriptionPageProps) {
    const styles = useThemeStyles();
    const parser = new ExpensiMark();
    const [description, setDescription] = useState(() => parser.htmlToMarkdown(report?.description ?? ''));
    const reportDescriptionInputRef = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {translate} = useLocalize();
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

    const handleReportDescriptionChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    const submitForm = useCallback(() => {
        Report.updateDescription(report.reportID, report?.description ?? '', description.trim());
    }, [report.reportID, report.description, description]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                reportDescriptionInputRef.current?.focus();
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
            testID={RoomDescriptionPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!ReportUtils.canEditReportDescription(report, policy)}>
                <HeaderWithBackButton title={translate('reportDescriptionPage.roomDescription')} />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.REPORT_DESCRIPTION_FORM}
                    onSubmit={submitForm}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb5]}>{translate('reportDescriptionPage.explainerText')}</Text>
                    <View style={[styles.mb6]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.REPORT_DESCRIPTION}
                            label={translate('reportDescriptionPage.roomDescription')}
                            accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                            ref={(el: BaseTextInputRef | null): void => {
                                if (!el) {
                                    return;
                                }
                                reportDescriptionInputRef.current = el;
                                updateMultilineInputRange(el);
                            }}
                            value={description}
                            onChangeText={handleReportDescriptionChange}
                            autoCapitalize="none"
                            containerStyles={[styles.autoGrowHeightMultilineInput]}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomDescriptionPage.displayName = 'RoomDescriptionPage';

export default RoomDescriptionPage;
