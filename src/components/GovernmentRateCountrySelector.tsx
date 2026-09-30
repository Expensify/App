// Shared country picker for the government distance rate auto-update flow, used by the distance rates settings page and the currency change page.

import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getGovernmentRateCountryOptions} from '@libs/PolicyDistanceRatesUtils';
import type {Option} from '@libs/searchOptions';

import React, {useState} from 'react';
import {View} from 'react-native';

type GovernmentRateCountrySelectorProps = {
    /** Header title shown in HeaderWithBackButton */
    headerTitle: string;

    /** Country that is already stored, shown as selected before the user picks anything */
    initialSelectedCountry?: string;

    /** Renders the offline blocking view instead of the list when the page data is missing */
    isBlocked: boolean;

    onBackButtonPress: () => void;

    /** Called with the picked country when the user saves */
    onSave: (selectedCountry: string) => void;

    /** Optional intro paragraph shown above the list */
    introText?: string;

    testID: string;
};

function GovernmentRateCountrySelector({headerTitle, initialSelectedCountry, isBlocked, onBackButtonPress, onSave, introText, testID}: GovernmentRateCountrySelectorProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    // The stored country can load after first render, so only an explicit pick overrides it
    const [pickedCountry, setPickedCountry] = useState<string>();
    const selectedCountry = pickedCountry ?? initialSelectedCountry;

    const countries = getGovernmentRateCountryOptions(translate, localeCompare, selectedCountry);

    const saveCountry = () => {
        if (!selectedCountry) {
            return;
        }
        onSave(selectedCountry);
    };

    const FullPageBlockingView = isBlocked ? FullPageOfflineBlockingView : View;

    return (
        <ScreenWrapper
            style={styles.pb0}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={testID}
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageBlockingView style={isBlocked ? [] : styles.flexGrow1}>
                {!isBlocked && (
                    <>
                        {!!introText && <Text style={[styles.textNormal, styles.mh5, styles.mb3]}>{introText}</Text>}
                        <SelectionList
                            data={countries}
                            ListItem={SingleSelectListItem}
                            onSelectRow={(option: Option) => setPickedCountry(option.value)}
                            shouldSingleExecuteRowSelect
                            addBottomSafeAreaPadding
                            footerContent={
                                <FormAlertWithSubmitButton
                                    buttonText={translate('common.save')}
                                    onSubmit={saveCountry}
                                    isDisabled={!selectedCountry}
                                    enabledWhenOffline
                                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                                />
                            }
                        />
                    </>
                )}
            </FullPageBlockingView>
        </ScreenWrapper>
    );
}

export default GovernmentRateCountrySelector;
