/**
 * Travel setup step that asks the admin whether to flag travel booked outside Expensify Travel, and which kinds of bookings to flag.
 * The answer is held in TRAVEL_PROVISIONING and sent with AcceptSpotnanaTerms on the last step.
 */
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setTravelProvisioningFlaggedTravelTypes} from '@libs/actions/Travel';
import {getTravelTypeDisplayName} from '@libs/SearchQueryUtils';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TravelTypeValue} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';
import {View} from 'react-native';

/** The bookings an admin can choose to flag, as in the approved design, which leaves out hotel blocks. */
const TRAVEL_TYPES_TO_OFFER: TravelTypeValue[] = [CONST.SEARCH.TRAVEL_TYPE.AIR, CONST.SEARCH.TRAVEL_TYPE.HOTEL, CONST.SEARCH.TRAVEL_TYPE.CAR_RENTAL, CONST.SEARCH.TRAVEL_TYPE.RAIL];

const FLAG_OPTION_KEY = 'flag';
const SKIP_FLAGGING_OPTION_KEY = 'skipFlagging';

function FlagOffPlatformTravelStep({onNext}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [savedFlaggedTravelTypes] = useOnyx(ONYXKEYS.TRAVEL_PROVISIONING, {selector: (travelProvisioning) => travelProvisioning?.flaggedTravelTypes});

    // Going back to this step shows the earlier answer. Until the admin answers, neither option is picked and every booking type is ticked.
    const [shouldFlag, setShouldFlag] = useState<boolean | undefined>(savedFlaggedTravelTypes ? savedFlaggedTravelTypes.length > 0 : undefined);
    const [selectedTravelTypes, setSelectedTravelTypes] = useState<TravelTypeValue[]>(savedFlaggedTravelTypes?.length ? savedFlaggedTravelTypes : TRAVEL_TYPES_TO_OFFER);

    const isNextDisabled = shouldFlag === undefined || (shouldFlag && selectedTravelTypes.length === 0);

    const toggleTravelType = (travelType: TravelTypeValue) => {
        setSelectedTravelTypes((currentTravelTypes) =>
            currentTravelTypes.includes(travelType) ? currentTravelTypes.filter((currentTravelType) => currentTravelType !== travelType) : [...currentTravelTypes, travelType],
        );
    };

    const saveAnswerAndContinue = () => {
        if (isNextDisabled) {
            return;
        }
        // Keep the list in the order it's shown, whatever order the boxes were ticked in
        setTravelProvisioningFlaggedTravelTypes(shouldFlag ? TRAVEL_TYPES_TO_OFFER.filter((travelType) => selectedTravelTypes.includes(travelType)) : []);
        onNext();
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('travel.flagOffPlatformTravel.headline')}</Text>
                <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{translate('travel.flagOffPlatformTravel.subtitle')}</Text>
                <SingleSelectListItem
                    item={{keyForList: FLAG_OPTION_KEY, text: translate('travel.flagOffPlatformTravel.flag'), isSelected: shouldFlag === true}}
                    showTooltip={false}
                    onSelectRow={() => setShouldFlag(true)}
                />
                {!!shouldFlag && (
                    <>
                        <Text style={[styles.ph5, styles.pv2, styles.textLabelSupporting]}>{translate('travel.flagOffPlatformTravel.selectBookings')}</Text>
                        {TRAVEL_TYPES_TO_OFFER.map((travelType) => (
                            <MultiSelectListItem
                                key={travelType}
                                item={{keyForList: travelType, text: getTravelTypeDisplayName(travelType, translate), isSelected: selectedTravelTypes.includes(travelType)}}
                                isFocused={false}
                                showTooltip={false}
                                onSelectRow={() => toggleTravelType(travelType)}
                            />
                        ))}
                        <View style={[styles.borderBottom, styles.mh5, styles.mv2]} />
                    </>
                )}
                <SingleSelectListItem
                    item={{keyForList: SKIP_FLAGGING_OPTION_KEY, text: translate('travel.flagOffPlatformTravel.dontFlag'), isSelected: shouldFlag === false}}
                    showTooltip={false}
                    onSelectRow={() => setShouldFlag(false)}
                />
            </ScrollView>
            <FixedFooter>
                <Button
                    sentryLabel={CONST.SENTRY_LABEL.TRAVEL.ENABLE_FLAG_OFF_PLATFORM_TRAVEL_NEXT}
                    isDisabled={isNextDisabled}
                    variant="success"
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={styles.w100}
                    onPress={saveAnswerAndContinue}
                >
                    <Button.Text>{translate('common.next')}</Button.Text>
                </Button>
            </FixedFooter>
        </>
    );
}

export default FlagOffPlatformTravelStep;
