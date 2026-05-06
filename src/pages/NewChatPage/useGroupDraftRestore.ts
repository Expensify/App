import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useEffectEvent, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getUserToInviteOption} from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Login, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type NewGroupChatDraft from '@src/types/onyx/NewGroupChatDraft';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type SelectedOption from './types';

/**
 * Keeps the NewChatPage's `selectedOptions` state aligned with the `NEW_GROUP_CHAT_DRAFT` Onyx draft.
 *
 * - On mount / reload, restores the draft participants into `selectedOptions` once so an
 *   in-progress group chat survives refreshes.
 * - While the screen is in the background (e.g. the user navigated to NewChatConfirmPage), mirrors
 *   participant removals made against the draft back into `selectedOptions` so the two stay
 *   consistent when the user returns.
 */
function useGroupChatDraftParticipantSync(
    allPersonalDetailOptions: Array<SearchOption<PersonalDetails>>,
    areAllPersonalDetailOptionsLoaded: boolean,
    allPersonalDetails: OnyxEntry<PersonalDetailsList>,
    loginList: OnyxEntry<Login>,
    currentUserEmail: string,
    currentUserAccountID: number,
    selectedOptions: SelectedOption[],
    setSelectedOptions: (options: SelectedOption[]) => void,
) {
    const shouldRestoreSelectedOptionsRef = useRef(true);
    const isScreenInBackgroundRef = useRef(false);

    const draftParticipantsSelector = (draft: NewGroupChatDraft | undefined) => {
        const isSubscriptionActive = shouldRestoreSelectedOptionsRef.current || isScreenInBackgroundRef.current;
        return isSubscriptionActive ? draft?.participants : undefined;
    };

    const [draftParticipants, draftParticipantsMetadata] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {
        selector: draftParticipantsSelector,
    });

    const restoreParticipantsFromDraft = useEffectEvent(() => {
        // Flip the ref first so the useOnyx selector disables the subscription
        shouldRestoreSelectedOptionsRef.current = false;

        const restoredOptionsFromDraft = (draftParticipants ?? []).reduce<SelectedOption[]>((result, participant) => {
            if (participant.accountID === currentUserAccountID) {
                return result;
            }
            const option =
                allPersonalDetailOptions.find((personalDetail) => personalDetail.accountID === participant.accountID) ??
                getUserToInviteOption({
                    searchValue: participant?.login,
                    personalDetails: allPersonalDetails,
                    loginList,
                    currentUserEmail,
                });
            if (option) {
                result.push({...option, isSelected: true});
            }
            return result;
        }, []);

        // No draft or only original creator in draft
        if (!restoredOptionsFromDraft.length) {
            return;
        }

        setSelectedOptions(restoredOptionsFromDraft);
    });

    // NewChatConfirmPage can only deselect participants,
    // so we don't need the complex logic from the restoreParticipantsFromDraft.
    // Simple filtering out of deselected participants is enough here
    const syncSelectedOptionsWithDraft = useEffectEvent(() => {
        const draftLogins = new Set((draftParticipants ?? []).map((participant) => participant.login));
        const filteredSelectionOptions = selectedOptions.filter((option) => draftLogins.has(option.login));

        setSelectedOptions(filteredSelectionOptions);
    });

    useFocusEffect(
        useCallback(() => {
            isScreenInBackgroundRef.current = false;

            return () => {
                isScreenInBackgroundRef.current = true;
            };
        }, []),
    );

    // Handle removing participants on other pages (e.g. NewChatConfirmPage)
    useEffect(() => {
        if (!isScreenInBackgroundRef.current) {
            return;
        }
        syncSelectedOptionsWithDraft();
    }, [draftParticipants]);

    const areRestoreInputsReady = areAllPersonalDetailOptionsLoaded && !isLoadingOnyxValue(draftParticipantsMetadata);

    // Handle reload with existing draft participants
    useEffect(() => {
        if (!shouldRestoreSelectedOptionsRef.current || !areRestoreInputsReady) {
            return;
        }
        restoreParticipantsFromDraft();
    }, [draftParticipants, areRestoreInputsReady]);
}

export default useGroupChatDraftParticipantSync;
