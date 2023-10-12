import React, {ReactNode, forwardRef, useRef} from 'react';
import {OnyxEntry} from 'react-native-onyx/lib/types';
import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';
import ComposeProviders from './ComposeProviders';
import Network from '../types/onyx/Network';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider, NetworkContext] = createOnyxContext(ONYXKEYS.NETWORK, {});
const [withPersonalDetails, PersonalDetailsProvider] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS_LIST);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [withReportActionsDrafts, ReportActionsDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
const [withBlockedFromConcierge, BlockedFromConciergeProvider] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [withBetas, BetasProvider, BetasContext] = createOnyxContext(ONYXKEYS.BETAS);
const [withReportCommentDrafts, ReportCommentDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
const [withPreferredTheme, PreferredThemeProvider, PreferredThemeContext] = createOnyxContext(ONYXKEYS.PREFERRED_THEME);

type Props = {
    network: OnyxEntry<Network>;
    otherProp: string;
};

const X = forwardRef((props: Props, ref: React.Ref<HTMLInputElement>) => {
    const isOffline = props.network?.isOffline;
    const otherProp = props.otherProp;
    return <input ref={ref} />;
});

function Comp1(props: Props): ReactNode {
    const isOffline = props.network?.isOffline;
    const otherProp = props.otherProp;
    return null;
}

function Test() {
    const HOC = withNetwork();
    const Wrapped = HOC(Comp1);
    const x = <Wrapped otherProp="" />;

    const testRef = useRef<HTMLInputElement>(null);

    const Wrapped2 = HOC(X);
    const x2 = (
        <Wrapped2
            ref={testRef}
            otherProp=""
        />
    );
}

type OnyxProviderProps = {
    /** Rendered child component */
    children: React.ReactNode;
};

function OnyxProvider(props: OnyxProviderProps) {
    return (
        <ComposeProviders
            components={[
                NetworkProvider,
                PersonalDetailsProvider,
                ReportActionsDraftsProvider,
                CurrentDateProvider,
                BlockedFromConciergeProvider,
                BetasProvider,
                ReportCommentDraftsProvider,
                PreferredThemeProvider,
            ]}
        >
            {props.children}
        </ComposeProviders>
    );
}

OnyxProvider.displayName = 'OnyxProvider';

export default OnyxProvider;

export {
    withNetwork,
    withPersonalDetails,
    withReportActionsDrafts,
    withCurrentDate,
    withBlockedFromConcierge,
    withBetas,
    NetworkContext,
    BetasContext,
    withReportCommentDrafts,
    withPreferredTheme,
    PreferredThemeContext,
};
