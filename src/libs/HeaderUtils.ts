import {OnyxEntry} from 'react-native-onyx';
import {SvgProps} from 'react-native-svg';
import * as Expensicons from '@components/Icon/Expensicons';
import OnyxReport from '@src/types/onyx/Report';
import * as Report from './actions/Report';
import * as Session from './actions/Session';
import * as Localize from './Localize';

type MenuItem = {
    icon: string | React.FC<SvgProps>;
    text: string;
    onSelected: () => void;
};

function getPinMenuItem(report: OnyxEntry<OnyxReport>): MenuItem | undefined {
    if (!report) {
        return;
    }

    const isPinned = !!report.isPinned;

    return {
        icon: Expensicons.Pin,
        text: Localize.translateLocal(isPinned ? 'common.unPin' : 'common.pin'),
        onSelected: Session.checkIfActionIsAllowed(() => Report.togglePinnedState(report.reportID, isPinned)),
    };
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPinMenuItem,
};
