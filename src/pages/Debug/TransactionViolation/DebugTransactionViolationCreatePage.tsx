import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import DebugUtils from '@libs/DebugUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import Debug from '@userActions/Debug';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationCreatePageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.TRANSACTION_VIOLATION_CREATE>;

const getInitialTransactionViolation = () =>
    DebugUtils.stringifyJSON({
        type: CONST.VIOLATION_TYPES.VIOLATION,
        name: CONST.VIOLATIONS.MISSING_CATEGORY,
        data: {
            rejectedBy: undefined,
            rejectReason: undefined,
            formattedLimit: undefined,
            surcharge: undefined,
            invoiceMarkup: undefined,
            maxAge: undefined,
            tagName: undefined,
            category: undefined,
            brokenBankConnection: undefined,
            isAdmin: undefined,
            email: undefined,
            isTransactionOlderThan7Days: false,
            member: undefined,
            taxName: undefined,
            tagListIndex: undefined,
            tagListName: undefined,
            errorIndexes: [],
            pendingPattern: undefined,
            type: undefined,
            displayPercentVariance: undefined,
            duplicates: [],
            rterType: undefined,
            comment: undefined,
        },
    } satisfies TransactionViolation);

function DebugTransactionViolationCreatePage({
    route: {
        params: {transactionID},
    },
}: DebugTransactionViolationCreatePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const transactionViolations = useTransactionViolations(transactionID);
    const [draftTransactionViolation, setDraftTransactionViolation] = useState<string>(() => getInitialTransactionViolation());
    const [error, setError] = useState<string>();

    const editJSON = useCallback(
        (updatedJSON: string) => {
            try {
                DebugUtils.validateTransactionViolationJSON(updatedJSON);
                setError('');
            } catch (e) {
                const {cause, message} = e as SyntaxError;
                setError(cause ? translate(message as TranslationPaths, cause as never) : message);
            } finally {
                setDraftTransactionViolation(updatedJSON);
            }
        },
        [translate],
    );

    const createTransactionViolation = useCallback(() => {
        const parsedTransactionViolation = DebugUtils.stringToOnyxData(draftTransactionViolation, 'object') as TransactionViolation;
        Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [...(transactionViolations ?? []), parsedTransactionViolation]);
        Navigation.navigate(ROUTES.DEBUG_TRANSACTION_TAB_VIOLATIONS.getRoute(transactionID));
    }, [draftTransactionViolation, transactionID, transactionViolations]);

    if (!transactionID) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="DebugTransactionViolationCreatePage"
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.createTransactionViolation')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ScrollView contentContainerStyle={[styles.ph5, styles.pb5, styles.gap5]}>
                        <View>
                            <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.editJson')}</Text>
                            <TextInput
                                errorText={error}
                                accessibilityLabel={translate('debug.editJson')}
                                forceActiveLabel
                                numberOfLines={18}
                                multiline
                                value={draftTransactionViolation}
                                onChangeText={editJSON}
                                // We need to explicitly add styles.pt5 and styles.pb5 to override the default top and bottom padding of the text input
                                textInputContainerStyles={[styles.border, styles.borderBottom, styles.ph5, styles.pt5, styles.pb5]}
                            />
                        </View>
                        <Text style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text>
                        <Button
                            success
                            text={translate('common.save')}
                            isDisabled={!draftTransactionViolation || !!error}
                            onPress={createTransactionViolation}
                        />
                    </ScrollView>
                </View>
            )}
        </ScreenWrapper>
    );
}

export default DebugTransactionViolationCreatePage;
