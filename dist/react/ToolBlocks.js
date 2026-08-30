import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCopyFeedback } from "./clipboard.js";
import { deriveToolBlock, } from "./tool-block-model.js";
export function BuiltInToolBody({ tool, labels, renderContent, }) {
    const model = deriveToolBlock(tool);
    switch (model.kind) {
        case "terminal":
            return (_jsxs(_Fragment, { children: [_jsx(TerminalBlock, { model: model, status: tool.status, labels: labels }), _jsx(Supplementary, { values: model.supplementary, render: renderContent })] }));
        case "read":
            return (_jsxs(_Fragment, { children: [_jsx(ReadBlock, { model: model, labels: labels }), _jsx(Supplementary, { values: model.supplementary, render: renderContent })] }));
        case "diff":
            return (_jsxs(_Fragment, { children: [_jsx(DiffBlock, { model: model, labels: labels }), _jsx(Supplementary, { values: model.supplementary, render: renderContent })] }));
        case "io":
            if (!model.input && !model.output) {
                return _jsx("span", { className: "paui-muted", children: labels.tool });
            }
            return (_jsxs("div", { className: "paui-tool-block paui-tool-io", "data-tool-block": "io", children: [model.input ? (_jsx(IoSection, { label: labels.toolInput, section: model.input, labels: labels, render: renderContent })) : null, model.input && model.output ? (_jsx("span", { className: "paui-tool-io__divider", "aria-hidden": "true" })) : null, model.output ? (_jsx(IoSection, { label: labels.toolOutput, section: model.output, labels: labels, render: renderContent, failed: tool.status === "failed" || tool.status === "cancelled" })) : null] }));
    }
}
function TerminalBlock({ model, status, labels, }) {
    const visible = model.displayOutput.trim().length > 0;
    return (_jsxs("div", { className: "paui-tool-block paui-tool-terminal", "data-tool-block": "terminal", "data-state": model.failed ? "failed" : model.running ? "running" : "completed", children: [_jsxs("div", { className: "paui-tool-terminal__header", children: [_jsxs("div", { className: "paui-tool-terminal__prompt", children: [_jsx("span", { className: "paui-sr-only", children: status }), commandLines(model.command).map((command, index) => (_jsxs("div", { className: "paui-tool-terminal__prompt-line", children: [index === 0 ? (_jsx("span", { className: "paui-tool-terminal__state", "aria-hidden": "true" })) : null, _jsx("span", { className: "paui-tool-terminal__cwd", children: index === 0 && model.cwd ? model.cwd : "$" }), _jsx("span", { className: "paui-tool-terminal__command", children: command })] }, index)))] }), !model.running && visible ? (_jsx(ToolCopyButton, { text: model.output, labels: labels })) : null] }), !model.running ? (visible ? (_jsx("pre", { className: "paui-tool-terminal__output", children: model.displayOutput })) : (_jsx("div", { className: "paui-tool-block__empty", children: labels.toolNoOutput }))) : null] }));
}
function ReadBlock({ model, labels, }) {
    const [expanded, setExpanded] = useState(false);
    const slices = headTail(model.lines, expanded);
    return (_jsxs("div", { className: "paui-tool-block paui-tool-read", "data-tool-block": "read", children: [_jsxs("div", { className: "paui-tool-block__banner", children: [_jsx("span", { className: "paui-tool-block__label", children: model.label }), model.copyText ? (_jsx(ToolCopyButton, { text: model.copyText, labels: labels })) : null] }), _jsxs("div", { className: "paui-tool-read__body", children: [_jsx(ReadLines, { lines: slices.head }), slices.hidden > 0 ? (_jsx(FoldButton, { expanded: expanded, hidden: slices.hidden, labels: labels, onClick: () => setExpanded((value) => !value) })) : null, _jsx(ReadLines, { lines: slices.tail })] })] }));
}
function ReadLines({ lines }) {
    return lines.map((line) => (_jsxs("div", { className: "paui-tool-read__line", children: [_jsx("span", { className: "paui-tool-read__gutter", "aria-hidden": "true", children: line.number }), _jsx("span", { className: "paui-tool-read__content", children: line.text })] }, line.number)));
}
function DiffBlock({ model, labels, }) {
    const [expanded, setExpanded] = useState(false);
    const slices = headTail(model.rows, expanded);
    return (_jsxs("div", { className: "paui-tool-block paui-tool-diff", "data-tool-block": "diff", children: [_jsxs("div", { className: "paui-tool-block__banner paui-tool-diff__banner", children: [_jsx("span", { className: "paui-tool-block__label", children: labels.changedFiles }), _jsx(ToolCopyButton, { text: model.copyText, labels: labels })] }), _jsxs("div", { className: "paui-tool-diff__body", children: [_jsx(DiffRows, { rows: slices.head }), slices.hidden > 0 ? (_jsx(FoldButton, { expanded: expanded, hidden: slices.hidden, labels: labels, onClick: () => setExpanded((value) => !value) })) : null, _jsx(DiffRows, { rows: slices.tail })] }), _jsxs("div", { className: "paui-tool-diff__footer", children: ["+", model.added, " \u2212", model.removed, " \u00B7 ", model.files, " ", labels.changedFiles] })] }));
}
function DiffRows({ rows }) {
    return rows.map((row, index) => (_jsx("div", { className: "paui-tool-diff__line", "data-line-kind": row.kind, children: row.text }, index)));
}
function IoSection({ label, section, labels, render, failed = false, }) {
    return (_jsxs("section", { className: "paui-tool-io__section", "data-error": failed || undefined, children: [_jsxs("div", { className: "paui-tool-io__section-header", children: [_jsx("strong", { children: label }), section.copyText ? (_jsx(ToolCopyButton, { text: section.copyText, labels: labels })) : null] }), _jsxs("div", { className: "paui-tool-io__content", children: [section.text !== undefined ? _jsx("pre", { children: section.text }) : null, section.values?.map(render)] })] }));
}
function Supplementary({ values, render, }) {
    return values.length ? (_jsx("div", { className: "paui-tool-supplementary", children: values.map(render) })) : null;
}
function ToolCopyButton({ text, labels, }) {
    const { copied, copy } = useCopyFeedback(text);
    const label = copied ? labels.copied : labels.copy;
    return (_jsx("button", { className: "paui-tool-block__copy", type: "button", "aria-label": label, title: label, onClick: (event) => copy(event.currentTarget), children: label }));
}
function FoldButton({ expanded, hidden, labels, onClick, }) {
    return (_jsx("button", { className: "paui-tool-block__fold", type: "button", "aria-expanded": expanded, onClick: onClick, children: expanded ? labels.toolCollapseLines : labels.toolExpandLines(hidden) }));
}
function headTail(values, expanded) {
    const hidden = Math.max(0, values.length - 8);
    if (!hidden)
        return { head: values, tail: [], hidden: 0 };
    if (expanded)
        return { head: values, tail: [], hidden };
    return { head: values.slice(0, 4), tail: values.slice(-4), hidden };
}
function commandLines(command) {
    const value = command.endsWith("\n") ? command.slice(0, -1) : command;
    return value.split("\n");
}
//# sourceMappingURL=ToolBlocks.js.map