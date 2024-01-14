import {useFocusEffect} from '@react-navigation/native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import PropTypes from 'prop-types';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import reportPropTypes from './reportPropTypes';
import {policyDefaultProps, policyPropTypes} from './workspace/withPolicy';

const propTypes = {
    ...withLocalizePropTypes,
    ...policyPropTypes,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/roomDescription */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    ...policyDefaultProps,
};

function ReportDescriptionPage(props) {
    const styles = useThemeStyles();
    const parser = new ExpensiMark();
    const [description, setdescription] = useState(() => parser.htmlToMarkdown(props.report.description));
    const reportDescriptionInputRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    const handleReportDescriptionChange = useCallback((value) => {
        setdescription(value);
    }, []);

    const submitForm = useCallback(() => {
        Report.updateDescription(props.report.reportID, props.report.description, description.trim());
    }, [props.report.reportID, props.report.description, description]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (reportDescriptionInputRef.current) {
                    reportDescriptionInputRef.current.focus();
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
            testID={ReportDescriptionPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!ReportUtils.canEditReportDescription(props.report, props.policy)}>
                <HeaderWithBackButton
                    title={props.translate('reportDescriptionPage.roomDescription')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID))}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.REPORT_DESCRIPTION_FORM}
                    onSubmit={submitForm}
                    submitButtonText={props.translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb5]}>{props.translate('reportDescriptionPage.explainerText')}</Text>
                    <View style={[styles.mb6]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="reportDescription"
                            label={props.translate('reportDescriptionPage.roomDescription')}
                            accessibilityLabel={props.translate('reportDescriptionPage.roomDescription')}
                            role={CONST.ROLE.PRESENTATION}
                            autoGrowHeight
                            maxLength={CONST.MAX_COMMENT_LENGTH}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                reportDescriptionInputRef.current = el;
                                updateMultilineInputRange(reportDescriptionInputRef.current);
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

ReportDescriptionPage.displayName = 'ReportDescriptionPage';
ReportDescriptionPage.propTypes = propTypes;
ReportDescriptionPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNotFound(),
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(ReportDescriptionPage);
