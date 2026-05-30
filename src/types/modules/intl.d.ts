declare global {
    namespace Intl {
        // Firefox-only property; Chromium/V8 spec uses `getWeekInfo()` and DateUtils reads both via dual access.
        interface Locale {
            readonly weekInfo?: WeekInfo;
        }
    }
}

export {};
