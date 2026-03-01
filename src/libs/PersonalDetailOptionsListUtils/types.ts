import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type CONST from '@src/CONST';
import type {LoginList} from '@src/types/onyx';
import type {Errors, Icon} from '@src/types/onyx/OnyxCommon';

type OptionData = {
    text: string;
    alternateText?: string;
    allReportErrors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | '' | null;
    tooltipText?: string | null;
    login?: string;
    accountID: number;
    phoneNumber?: string;
    keyForList: string;
    searchText?: string;
    isOptimisticPersonalDetail?: boolean;
    selected?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean | null;
    reportID?: string;
    icons?: Icon[];
    private_isArchived?: string;
    lastVisibleActionCreated?: string;
};

type PreviewConfig = {
    selected?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    shouldStoreReportErrors?: boolean;
    shouldShowBrickRoadIndicator?: boolean;
};

type GetOptionsConfig = {
    excludeLogins?: Record<string, boolean>;
    includeCurrentUser?: boolean;
    includeRecentReports?: boolean;
    includeSelectedOptions?: boolean;
    recentAttendees?: string[];
    searchString?: string;
    maxElements?: number;
    recentMaxElements?: number;
    includeUserToInvite?: boolean;
    includeDomainEmail?: boolean;
    extraOptions?: OptionData[];
    shouldAcceptName?: boolean;
};

type GetUserToInviteConfig = {
    searchValue: string;
    countryCode: number;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    loginList: OnyxEntry<LoginList>;
    loginsToExclude?: Record<string, boolean>;
    shouldAcceptName?: boolean;
    canInviteUser?: boolean;
};

type Options = {
    selectedOptions: OptionData[];
    recentOptions: OptionData[];
    personalDetails: OptionData[];
    userToInvite: OptionData | null;
};

type PrivateIsArchivedMap = Record<string, string | undefined>;

export type {OptionData, GetOptionsConfig, GetUserToInviteConfig, Options, PreviewConfig, PrivateIsArchivedMap};
