import React, {useCallback, useMemo, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {normalizeCountryCode} from '@libs/CountryUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CustomSubPageProps} from './types';
import {getInitialSubPage, getSubstepValues} from './utils';

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

function findPageIndex(pages: typeof formPages, pageName?: string): number {
    if (!pageName) {
        return 0;
    }
    const index = pages.findIndex((page) => page.pageName === pageName);
    return index !== -1 ? index : 0;
}

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues, headerTitle, onComplete}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const values = useMemo(() => normalizeCountryCode(getSubstepValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => findPageIndex(formPages, getInitialSubPage(values)), [values]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
        onComplete();
    }, [onComplete, values]);

    const {CurrentPage, isEditing, currentPageName, prevPage, nextPage, lastPageIndex, moveTo, goToLastPage} = useSubPage<CustomSubPageProps>({
        pages: formPages,
        initialPageName: getInitialSubPage(values),
        onFinished: handleFinishStep,
        buildRoute: (pageName, action) => ROUTES.MISSING_PERSONAL_DETAILS.getRoute(pageName, action),
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToLastPage();
            ref.current?.moveTo(lastPageIndex);

            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (currentPageName === CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME) {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevPage();
    };

    const handleMoveTo = useCallback(
        (pageName: string) => {
            ref.current?.moveTo(findPageIndex(formPages, pageName));
            moveTo(pageName);
        },
        [moveTo],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={MissingPersonalDetailsContent.displayName}
        >
            <HeaderWithBackButton
                title={headerTitle ?? translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={startFrom}
                    stepNames={CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST}
                />
            </View>
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={handleMoveTo}
                prevPage={prevPage}
                currentPageName={currentPageName}
                personalDetailsValues={values}
            />
        </ScreenWrapper>
    );
}

MissingPersonalDetailsContent.displayName = 'MissingPersonalDetailsContent';

export default MissingPersonalDetailsContent;
