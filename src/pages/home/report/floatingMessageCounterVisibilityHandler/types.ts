import type {RefObject} from 'react';

type FloatingMessageCounterVisibilityHandlerParams = {
    wasManuallySetRef: RefObject<boolean>;
    kHeight: number;
    offsetY: number;
    unreadMarkerReportActionIndex: number;
    isFloatingMessageCounterVisible: boolean;
    setIsFloatingMessageCounterVisible: (value: boolean) => void;
};

export default FloatingMessageCounterVisibilityHandlerParams;
