import type {ReactElement} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import {getIOUConfirmationOptionsFromPayeePersonalDetail} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

type UseConfirmationSectionsParams = {
    /** Whether the current IOU type is split */
    isTypeSplit: boolean;

    /** Whether the "to" section should be hidden (used when adding directly to a report) */
    shouldHideToSection: boolean;

    /** Whether participant rows should be interactive (allow editing the recipient) */
    canEditParticipant: boolean;

    /** Payee participant (current user) */
    payeePersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails> | CurrentUserPersonalDetails;

    /** Pre-built split participant rows (from {@link useSplitParticipants}) */
    splitParticipants: MoneyRequestConfirmationListItem[];

    /** Other participants the IOU is split between or sent to */
    selectedParticipants: Participant[];

    /** Render-prop returning the split section header */
    getSplitSectionHeader: () => ReactElement;
};

/**
 * Builds the section data for the confirmation SelectionList.
 *
 * Split requests get a "paid by" section plus the participant amount-entry section
 * (with a header that can reset split shares). All other types get a single "to"
 * section with the selected participants — unless `shouldHideToSection` is set for
 * expenses added directly to a report.
 */
function useConfirmationSections({
    isTypeSplit,
    shouldHideToSection,
    canEditParticipant,
    payeePersonalDetails,
    splitParticipants,
    selectedParticipants,
    getSplitSectionHeader,
}: UseConfirmationSectionsParams) {
    const {translate} = useLocalize();

    const options: Array<Section<MoneyRequestConfirmationListItem>> = [];
    if (isTypeSplit) {
        options.push(
            {
                title: translate('moneyRequestConfirmationList.paidBy'),
                data: [getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)],
                sectionIndex: 0,
            },
            {
                customHeader: getSplitSectionHeader(),
                data: splitParticipants,
                sectionIndex: 1,
            },
        );
        // When adding an expense from within a report, hide the "To:" section since the destination is already the current report
    } else if (!shouldHideToSection) {
        const formattedSelectedParticipants = selectedParticipants.map((participant) => ({
            ...participant,
            isSelected: false,
            keyForList: `${participant.keyForList ?? participant.accountID ?? participant.reportID}`,
            isInteractive: canEditParticipant,
            shouldShowRightCaret: canEditParticipant,
        }));

        options.push({
            title: translate('common.to'),
            data: formattedSelectedParticipants,
            sectionIndex: 0,
        });
    }

    return options;
}

export default useConfirmationSections;
