import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {normalizeCountryCode} from '@libs/CountryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {findPageIndex} from '@libs/SubPageUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import Address from './subPages/Address';
import Confirmation from './subPages/Confirmation';
import DateOfBirth from './subPages/DateOfBirth';
import LegalName from './subPages/LegalName';
import PhoneNumber from './subPages/PhoneNumber';
import type {CustomSubPageProps} from './types';
import {getInitialSubPage, getSubPageValues} from './utils';

type MissingPersonalDetailsContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    draftValues: OnyxEntry<PersonalDetailsForm>;

    /** Optional custom header title */
    headerTitle?: string;

    /** Completion handler */
    onComplete: () => void;
};

const formPages = [
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.ADDRESS, component: Address},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PHONE_NUMBER, component: PhoneNumber},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM, component: Confirmation},
];

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues, headerTitle, onComplete}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const values = useMemo(() => normalizeCountryCode(getSubPageValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => findPageIndex<CustomSubPageProps>(formPages, getInitialSubPage(values)), [values]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
        onComplete();
    }, [onComplete, values]);

    const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, moveTo, isRedirecting} = useSubPage<CustomSubPageProps>({
        pages: formPages,
        startFrom,
        onFinished: handleFinishStep,
        buildRoute: (pageName, action) => ROUTES.MISSING_PERSONAL_DETAILS.getRoute(pageName, action),
    });

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    const handleBackButtonPress = () => {
        if (isEditing) {
            Navigation.goBack(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM));
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (currentPageName === CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME) {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.closeRHPFlow();
            return;
        }
        prevPage();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="MissingPersonalDetailsContent"
        >
            <HeaderWithBackButton
                title={headerTitle ?? translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubPageHeader
                    stepNames={CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST}
                    currentStepIndex={pageIndex}
                    onStepSelected={moveTo}
                />
            </View>
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                personalDetailsValues={values}
            />
        </ScreenWrapper>
    );
}

export default MissingPersonalDetailsContent;
