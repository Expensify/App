declare global {
    namespace Intl {
        // Firefox-only property; Chromium/V8 spec uses `getWeekInfo()` and DateUtils reads both via dual access.
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
        interface Locale {
            readonly weekInfo?: WeekInfo;
        }
    }
}

export {};
