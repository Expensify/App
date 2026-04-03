import React, {memo, useEffect, useState} from 'react';
import {Platform, Pressable, Text, TouchableOpacity, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Item = {id: string; reportID: string; value: string};
type Props = {firstName: string; lastName: string};
type Transaction = {waypoints: Array<{id: string; name: string}>; transactionID: string};
type ExpenseData = Record<string, unknown>;

declare function computeExpensiveLayout(data: unknown): React.ReactNode;
declare function deepEqual<T>(a: T, b: T): boolean;
declare function fetchResults(query: string): Promise<never[]>;
declare function loadDataFromLocalStorage(): void;
declare function checkAuthToken(): void;
declare function trackPageView(): void;
declare function registerDeepLinkHandler(): void;
declare function initAudioSession(): void;
declare function checkSession(): void;
declare function prefetchNavigation(): void;
declare function doSomething(): void;
declare function getTheme(): {color: string};
declare function showSuccessMessage(): void;
declare function apiCall(opts: {timeout: number}): React.ReactNode;

declare const data: unknown;
declare const attempts: number;
declare const API: {submit: (d: ExpenseData) => Promise<void>};

function ItemRow(_props: Record<string, unknown>) {
    return null;
}
function Row(_props: Record<string, unknown>) {
    return null;
}
function SearchBar() {
    return null;
}
function Header() {
    return null;
}
function SortControls() {
    return null;
}
function Pagination() {
    return null;
}
function ReportChild(_props: Record<string, unknown>) {
    return null;
}
function MyCard(_props: {transaction: Transaction; onPress: () => void}) {
    return null;
}

const renderItem = ({item}: {item: Item}) => <ItemRow {...item} highlight />;

function ExpensiveComponent({reportID}: {reportID?: string}) {
    const result = computeExpensiveLayout(data);
    if (!reportID) {
        return null;
    }
    return <View>{result}</View>;
}

function ListItem({reportID}: {reportID: string}) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    return <Text>{report?.reportName}</Text>;
}

const MemoizedCard = memo(MyCard, (prev, next) => deepEqual(prev.transaction, next.transaction) && prev.onPress === next.onPress);

function Greeting({firstName, lastName}: Props) {
    const [fullName, setFullName] = useState('');
    useEffect(() => {
        setFullName(`${firstName} ${lastName}`);
    }, [firstName, lastName]);
    return <Text>{fullName}</Text>;
}

function CommentForm({userId}: {userId: string}) {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    useEffect(() => {
        setComment('');
        setRating(0);
    }, [userId]);
    return (
        <View>
            <Text>{comment}</Text>
            <Text>{rating}</Text>
        </View>
    );
}

function BuyButton({onBuy}: {onBuy: () => void}) {
    const [isBuying, setIsBuying] = useState(false);
    useEffect(() => {
        if (isBuying) {
            onBuy();
            setIsBuying(false);
        }
    }, [isBuying, onBuy]);
    return <Pressable onPress={() => setIsBuying(true)} />;
}

function ChainedEffects({firstName, lastName}: Props) {
    const [fullName, setFullName] = useState('');
    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        setFullName(`${firstName} ${lastName}`);
    }, [firstName, lastName]);
    useEffect(() => {
        setIsValid(fullName.length > 0);
    }, [fullName]);
    return (
        <View>
            <Text>{fullName}</Text>
            <Text>{String(isValid)}</Text>
        </View>
    );
}

function Slider({value, onValueChange}: {value: number; onValueChange: (v: number) => void}) {
    const [internal, setInternal] = useState(value);
    useEffect(() => {
        onValueChange(internal);
    }, [internal, onValueChange]);
    return <Text>{internal}</Text>;
}

function UserDisplayName() {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    return <Text>{personalDetails?.currentUser?.displayName}</Text>;
}

function Timer() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        setInterval(() => setCount((c) => c + 1), 1000);
    }, []);
    return <Text>{count}</Text>;
}

function ItemList({items}: {items: Item[]}) {
    return (
        <View>
            {items.map((item) => {
                const theme = getTheme();
                return <Row key={item.id} color={theme.color} value={item.value} />;
            })}
        </View>
    );
}

function WindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return <Text>{width}</Text>;
}

function SearchResults({query}: {query: string}) {
    const [results, setResults] = useState<never[]>([]);
    useEffect(() => {
        fetchResults(query).then((json) => setResults(json));
    }, [query]);
    return <Text>{results.length}</Text>;
}

function AppInit() {
    useEffect(() => {
        loadDataFromLocalStorage();
        checkAuthToken();
    }, []);
    return <View />;
}

function PlatformButton() {
    const isAndroid = Platform.OS === 'android';
    return isAndroid ? (
        <TouchableOpacity>
            <Text>Android</Text>
        </TouchableOpacity>
    ) : (
        <Pressable>
            <Text>iOS</Text>
        </Pressable>
    );
}

function RetryLogic() {
    if (attempts < 3) {
        return apiCall({timeout: 5000});
    }
    return null;
}

function formatCurrencyA(amount: number) {
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(amount);
}
function formatCurrencyB(amount: number) {
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(amount);
}

type BadProps = {title: string; onPress: () => void; unusedProp: string};
function BadButton({title, onPress}: BadProps) {
    return (
        <Pressable onPress={onPress}>
            <Text>{title}</Text>
        </Pressable>
    );
}

function UnjustifiedDisable() {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        doSomething();
    }, []);
    return <View />;
}

async function submitExpense(expenseData: ExpenseData) {
    await API.submit(expenseData);
    showSuccessMessage();
}

type ConfigTableProps = {
    shouldShowSearchBar: boolean;
    shouldShowHeader: boolean;
    shouldEnableSorting: boolean;
    shouldShowPagination: boolean;
};
function ConfigTable({shouldShowSearchBar, shouldShowHeader, shouldEnableSorting, shouldShowPagination}: ConfigTableProps) {
    return (
        <View>
            {shouldShowSearchBar && <SearchBar />}
            {shouldShowHeader && <Header />}
            {shouldEnableSorting && <SortControls />}
            {shouldShowPagination && <Pagination />}
        </View>
    );
}

function ReportParent({reportID}: {reportID: string}) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${report?.transactionID}`);
    return <ReportChild report={report} policy={policy} transaction={transaction} />;
}

type WaypointListProps = {
    transaction: Transaction;
    navigateToWaypointEditPage: (index: number) => void;
};
function WaypointList({transaction, navigateToWaypointEditPage}: WaypointListProps) {
    return (
        <View>
            {transaction.waypoints.map((wp, i) => (
                <Pressable key={wp.id} onPress={() => navigateToWaypointEditPage(i)}>
                    <Text>{wp.name}</Text>
                </Pressable>
            ))}
        </View>
    );
}

function KitchenSink() {
    useEffect(() => {
        trackPageView();
    }, []);
    useEffect(() => {
        registerDeepLinkHandler();
    }, []);
    useEffect(() => {
        initAudioSession();
    }, []);
    useEffect(() => {
        checkSession();
    }, []);
    useEffect(() => {
        prefetchNavigation();
    }, []);
    return <View />;
}

const AppContext = React.createContext({});
function AppProvider({children}: {children: React.ReactNode}) {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [chatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    return <AppContext.Provider value={{priorityMode, chatReports, policies, transactions}}>{children}</AppContext.Provider>;
}

export {
    renderItem,
    ExpensiveComponent,
    ListItem,
    MemoizedCard,
    Greeting,
    CommentForm,
    BuyButton,
    ChainedEffects,
    Slider,
    UserDisplayName,
    Timer,
    ItemList,
    WindowWidth,
    SearchResults,
    AppInit,
    PlatformButton,
    RetryLogic,
    formatCurrencyA,
    formatCurrencyB,
    BadButton,
    UnjustifiedDisable,
    submitExpense,
    ConfigTable,
    ReportParent,
    WaypointList,
    KitchenSink,
    AppProvider,
};
