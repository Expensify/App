import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDescriptionNavigatorParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {canEditReportDescription, getReportDescription} from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import {updateDescription} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReportDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type RoomDescriptionPageProps = {
    /** Policy for the current report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function RoomDescriptionPage({report, policy}: RoomDescriptionPageProps) {
    const route = useRoute<PlatformStackRouteProp<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>>();
    const backTo = route.params.backTo;
    const styles = useThemeStyles();
    const [description, setDescription] = useState(() => Parser.htmlToMarkdown(getReportDescription(report)));
    const reportDescriptionInputRef = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {translate} = useLocalize();
    const reportIsArchived = useReportIsArchived(report?.reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const handleReportDescriptionChange = useCallback((value: string) => {
        setDescription(value);
    }, []);

    const goBack = useCallback(() => {
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(backTo ?? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID)));
    }, [report.reportID, backTo]);

    const submitForm = useCallback(() => {
        const newValue = description.trim();

        updateDescription(report, newValue, currentUserAccountID);
        goBack();
    }, [report, description, goBack, currentUserAccountID]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_DESCRIPTION_FORM>): Errors => {
            const errors: Errors = {};
            const descriptionLength = values[INPUT_IDS.REPORT_DESCRIPTION].trim().length;
            if (descriptionLength > CONST.REPORT_DESCRIPTION.MAX_LENGTH) {
                errors.reportDescription = translate('common.error.characterLimitExceedCounter', descriptionLength, CONST.REPORT_DESCRIPTION.MAX_LENGTH);
            }

            return errors;
        },
        [translate],
    );

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

    const canEdit = canEditReportDescription(report, policy, reportIsArchived);
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="RoomDescriptionPage"
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
                    validate={validate}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
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
                            ref={(el: BaseTextInputRef | null): void => {
                                if (!el) {
                                    return;
                                }
                                if (!reportDescriptionInputRef.current) {
                                    updateMultilineInputRange(el, false);
                                }
                                reportDescriptionInputRef.current = el;
                            }}
                            value={description}
                            onChangeText={handleReportDescriptionChange}
                            autoCapitalize="none"
                            type="markdown"
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

export default RoomDescriptionPage;
