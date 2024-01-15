import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ActiveModalContextProps = {
    /**
     * So far, modern browsers only support the file cancel event in some newer versions
     * (i.e., Chrome: 113 / Firefox: 91 / Safari 16.4), and there is no standard feature detection method available.
     * Therefore, we introduce this prop to isolate the impact of the file upload modal on the focus stack.
     */
    businessType: ValueOf<typeof CONST.MODAL.BUSINESS_TYPE>;

    /** Children to render */
    children: ReactNode;
};

type ActiveModalContextValue = {
    businessType: ValueOf<typeof CONST.MODAL.BUSINESS_TYPE>;
};

export type {ActiveModalContextProps, ActiveModalContextValue};
