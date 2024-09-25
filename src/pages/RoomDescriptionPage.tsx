import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportDescriptionNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReportDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';

type RoomDescriptionPageProps = {
    /** Policy for the current report */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function RoomDescriptionPage({report, policies}: RoomDescriptionPageProps) {
    const route = useRoutePlatformStackRouteProp<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>>();
    const backTo = route.params.backTo;
    const styles = useThemeStyles();
    const [description, setDescription] = useState(() => Parser.htmlToMarkdown(report?.description ?? ''));
    const reportDescriptionInputRef = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {translate} = useLocalize();
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

    const handleReportDescriptionChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
    }, [report.reportID, backTo]);

    const submitForm = useCallback(() => {
        const previousValue = report?.description ?? '';
        const newValue = description.trim();

        Report.updateDescription(report.reportID, previousValue, newValue);
        goBack();
    }, [report.reportID, report.description, description, goBack]);

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

    const canEdit = ReportUtils.canEditReportDescription(report, policy);
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={false}
            testID={RoomDescriptionPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('reportDescriptionPage.roomDescription')}
                onBackButtonPress={goBack}
            />
            {canEdit && (
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
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            maxLength={CONST.REPORT_DESCRIPTION.MAX_LENGTH}
                            ref={(el: BaseTextInputRef | null): void => {
                                if (!el) {
                                    return;
                                }
                                if (!reportDescriptionInputRef.current) {
                                    updateMultilineInputRange(el);
                                }
                                reportDescriptionInputRef.current = el;
                            }}
                            value={description}
                            onChangeText={handleReportDescriptionChange}
                            autoCapitalize="none"
                            isMarkdownEnabled
                        />
                    </View>
                </FormProvider>
            )}
            {!canEdit && (
                <ScrollView style={[styles.flexGrow1, styles.ph5, styles.mb5]}>
                    <RenderHTML html={Parser.replace(description)} />
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

RoomDescriptionPage.displayName = 'RoomDescriptionPage';

export default RoomDescriptionPage;
