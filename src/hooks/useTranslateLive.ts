import ONYXKEYS from '@src/ONYXKEYS';
import {useEffect} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {OnyxEntry, ReportAction} from 'react-native-onyx';
import * as API from '@libs/API';
import useLocalize from './useLocalize';

export default function useTranslateLive(reportID: string, reportAction: OnyxEntry<ReportAction>) {
    const {preferredLocale} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        if (reportAction.message.length > 1) {
            return;
        }

        if (reportAction.actorAccountID === session?.accountID) {
            return;
        }

        if (!reportAction?.message?.[0]?.html) {
            return;
        }

        console.log('over here API call')
        API.makeRequestWithSideEffects('Translate', {
            type: 'live',
            textToTranslate: reportAction?.message?.[0]?.html,
            targetLanguage: 'pt'
        }).then((response) => {
            console.log('over here', response)
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: {
                    message: [{...reportAction?.message, translatedText: response.translation}]
                }
            });
        });
    }, [reportID, reportAction.reportActionID]);
}
