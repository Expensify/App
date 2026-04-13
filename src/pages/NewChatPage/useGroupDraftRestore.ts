import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useEffectEvent, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getUserToInviteOption} from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Login, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type NewGroupChatDraft from '@src/types/onyx/NewGroupChatDraft';
import type SelectedOption from './types';

function useGroupDraftRestore(
    allPersonalDetailOptions: Array<SearchOption<PersonalDetails>>,
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
        if (!isSubscriptionActive) {
            return undefined;
        }
        return draft?.participants;
    };

    const [draftParticipants] = useOnyx(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {
        selector: draftParticipantsSelector,
    });

    const restoreFromDraft = useEffectEvent(() => {
        const restored = (draftParticipants ?? []).reduce<SelectedOption[]>((result, participant) => {
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

        shouldRestoreSelectedOptionsRef.current = false;
        setSelectedOptions(restored);
    });

    const syncDraftRemovals = useEffectEvent(() => {
        const draftLogins = new Set((draftParticipants ?? []).map((participant) => participant.login));
        const synced = selectedOptions.filter((option) => draftLogins.has(option.login));

        setSelectedOptions(synced);
    });

    useFocusEffect(
        useCallback(() => {
            isScreenInBackgroundRef.current = false;

            return () => {
                isScreenInBackgroundRef.current = true;
            };
        }, []),
    );

    // handle removing participants on other pages (NewChatConfirmPage)
    useEffect(() => {
        if (!isScreenInBackgroundRef.current) {
            return;
        }
        syncDraftRemovals();
    }, [draftParticipants]);

    const arePersonalDetailsLoaded = allPersonalDetailOptions.length > 0;

    // Ensures restoreFromDraft is never called with empty draft participants.
    // When there's no draft in Onyx, this disables the restore effect before personal details load.
    // Relies on Onyx resolving the draft key faster than useFilteredOptions loads personal details.
    useEffect(() => {
        if (!arePersonalDetailsLoaded || draftParticipants !== undefined) {
            return;
        }
        shouldRestoreSelectedOptionsRef.current = false;
    }, [draftParticipants, arePersonalDetailsLoaded]);

    // handle reload with existing draft participants
    useEffect(() => {
        if (!shouldRestoreSelectedOptionsRef.current || !arePersonalDetailsLoaded) {
            return;
        }
        restoreFromDraft();
    }, [draftParticipants, arePersonalDetailsLoaded]);
}

export default useGroupDraftRestore;
