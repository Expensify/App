import ICON_NAMES from './ICON_NAMES';
import ClipboardIcon from '../../../assets/images/clipboard.svg';
import CopyLinkIcon from '../../../assets/images/link-copy.svg';
import ExpensifyCashLogoIcon from '../../../assets/images/expensify-cash.svg';
import MailIcon from '../../../assets/images/mail.svg';
import PencilIcon from '../../../assets/images/pencil.svg';
import PinIcon from '../../../assets/images/pin.svg';
import TrashIcon from '../../../assets/images/trashcan.svg';

export default {
    [ICON_NAMES.CLIPBOARD]: {
        icon: ClipboardIcon,
        isAssetColored: false,
    },
    [ICON_NAMES.COPY_LINK]: {
        icon: CopyLinkIcon,
        isAssetColored: false,
    },
    [ICON_NAMES.EXPENSIFY_CASH_LOGO]: {
        icon: ExpensifyCashLogoIcon,
        isAssetColored: true,
    },
    [ICON_NAMES.MAIL]: {
        icon: MailIcon,
        isAssetColored: false,
    },
    [ICON_NAMES.PENCIL]: {
        icon: PencilIcon,
        isAssetColored: false,
    },
    [ICON_NAMES.PIN]: {
        icon: PinIcon,
        isAssetColored: false,
    },
    [ICON_NAMES.TRASH]: {
        icon: TrashIcon,
        isAssetColored: false,
    },
};
