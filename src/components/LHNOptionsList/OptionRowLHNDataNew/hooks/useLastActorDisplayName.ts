import type {OnyxEntry} from 'react-native-onyx';
import {getLastActorDisplayName} from '@libs/OptionsListUtils';
import type {Report, ReportAction} from '@src/types/onyx';
import useLastActorDetails from './useLastActorDetails';

function useLastActorDisplayName(reportAction: OnyxEntry<ReportAction>, report: OnyxEntry<Report>) {
    const lastActorDetails = useLastActorDetails(reportAction, report);

    return getLastActorDisplayName(lastActorDetails);
}

export default useLastActorDisplayName;
