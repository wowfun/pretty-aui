import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSyncExternalStore } from "react";
import { useCopyFeedback } from "./clipboard.js";
const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
});
const YEAR_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
});
export function MessageActions({ content, timestamp, clock, labels, }) {
    const calendarDay = useCalendarDay();
    const text = messageText(content);
    const { copied, copy } = useCopyFeedback(text);
    const validTimestamp = timestamp !== undefined &&
        Number.isFinite(timestamp) &&
        timestamp >= 0 &&
        !Number.isNaN(new Date(timestamp).valueOf())
        ? timestamp
        : undefined;
    const time = validTimestamp === undefined ? null : (_jsx("time", { className: `paui-message__time paui-message__time--${clock}`, dateTime: new Date(validTimestamp).toISOString(), children: formatMessageTimestamp(validTimestamp, calendarDay) }));
    const actionLabel = copied ? labels.copied : labels.copy;
    return (_jsxs("div", { className: "paui-message__actions", "data-pretty-aui-slot": "message-actions", "data-clock": clock, children: [clock === "start" ? time : null, _jsx("button", { className: "paui-message__action", type: "button", "aria-label": actionLabel, title: actionLabel, onClick: (event) => copy(event.currentTarget), children: copied ? _jsx(CheckIcon, {}) : _jsx(CopyIcon, {}) }), clock === "end" ? time : null] }));
}
export function formatMessageTimestamp(timestamp, now = Date.now()) {
    const date = new Date(timestamp);
    const current = new Date(now);
    const clock = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    const sameYear = date.getFullYear() === current.getFullYear();
    const sameDay = sameYear &&
        date.getMonth() === current.getMonth() &&
        date.getDate() === current.getDate();
    if (sameDay)
        return clock;
    const day = sameYear
        ? MONTH_DAY_FORMATTER.format(date)
        : YEAR_MONTH_DAY_FORMATTER.format(date);
    return `${day} ${clock}`;
}
function messageText(content) {
    return content
        .flatMap((block) => block.type === "text" && typeof block.text === "string"
        ? [block.text]
        : [])
        .join("");
}
let calendarDay = startOfLocalDay(Date.now());
let calendarTimer;
const calendarListeners = new Set();
function useCalendarDay() {
    return useSyncExternalStore(subscribeCalendarDay, () => calendarDay, () => calendarDay);
}
function subscribeCalendarDay(listener) {
    calendarListeners.add(listener);
    const current = startOfLocalDay(Date.now());
    if (current !== calendarDay) {
        calendarDay = current;
        for (const notify of calendarListeners)
            notify();
    }
    if (calendarListeners.size === 1)
        scheduleCalendarDay();
    return () => {
        calendarListeners.delete(listener);
        if (!calendarListeners.size && calendarTimer !== undefined) {
            window.clearTimeout(calendarTimer);
            calendarTimer = undefined;
        }
    };
}
function scheduleCalendarDay() {
    if (calendarTimer !== undefined)
        window.clearTimeout(calendarTimer);
    const now = Date.now();
    calendarTimer = window.setTimeout(() => {
        calendarTimer = undefined;
        calendarDay = startOfLocalDay(Date.now());
        for (const listener of calendarListeners)
            listener();
        if (calendarListeners.size)
            scheduleCalendarDay();
    }, millisecondsUntilNextLocalMidnight(now));
}
function startOfLocalDay(timestamp) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}
function millisecondsUntilNextLocalMidnight(timestamp) {
    const next = new Date(timestamp);
    next.setHours(24, 0, 0, 0);
    return Math.max(1, next.getTime() - timestamp);
}
function pad2(value) {
    return String(value).padStart(2, "0");
}
function MessageIcon({ children }) {
    return (_jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false", children: children }));
}
function CopyIcon() {
    return (_jsxs(MessageIcon, { children: [_jsx("rect", { x: "2.5", y: "4.5", width: "9", height: "9", rx: "2" }), _jsx("path", { d: "M5 4V3.5a2 2 0 0 1 2-2h5.5a2 2 0 0 1 2 2V9a2 2 0 0 1-2 2H12" })] }));
}
function CheckIcon() {
    return (_jsx(MessageIcon, { children: _jsx("path", { d: "m3 8.25 3.15 3.15L13 4.55" }) }));
}
//# sourceMappingURL=MessageActions.js.map