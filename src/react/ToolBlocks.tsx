import { useState, type ReactNode } from "react";
import type { ChatToolCall } from "../core/types.js";
import type { ChatLabels } from "./types.js";
import { useCopyFeedback } from "./clipboard.js";
import {
  deriveToolBlock,
  type ToolDiffBlockModel,
  type ToolIoSectionModel,
  type ToolReadBlockModel,
  type ToolTerminalBlockModel,
} from "./tool-block-model.js";

interface BuiltInToolBodyProps {
  readonly tool: ChatToolCall;
  readonly labels: ChatLabels;
  readonly renderContent: (value: unknown, index: number) => ReactNode;
}

export function BuiltInToolBody({
  tool,
  labels,
  renderContent,
}: BuiltInToolBodyProps) {
  const model = deriveToolBlock(tool);
  switch (model.kind) {
    case "terminal":
      return (
        <>
          <TerminalBlock model={model} status={tool.status} labels={labels} />
          <Supplementary values={model.supplementary} render={renderContent} />
        </>
      );
    case "read":
      return (
        <>
          <ReadBlock model={model} labels={labels} />
          <Supplementary values={model.supplementary} render={renderContent} />
        </>
      );
    case "diff":
      return (
        <>
          <DiffBlock model={model} labels={labels} />
          <Supplementary values={model.supplementary} render={renderContent} />
        </>
      );
    case "io":
      if (!model.input && !model.output) {
        return <span className="paui-muted">{labels.tool}</span>;
      }
      return (
        <div className="paui-tool-block paui-tool-io" data-tool-block="io">
          {model.input ? (
            <IoSection
              label={labels.toolInput}
              section={model.input}
              labels={labels}
              render={renderContent}
            />
          ) : null}
          {model.input && model.output ? (
            <span className="paui-tool-io__divider" aria-hidden="true" />
          ) : null}
          {model.output ? (
            <IoSection
              label={labels.toolOutput}
              section={model.output}
              labels={labels}
              render={renderContent}
              failed={tool.status === "failed" || tool.status === "cancelled"}
            />
          ) : null}
        </div>
      );
  }
}

function TerminalBlock({
  model,
  status,
  labels,
}: {
  readonly model: ToolTerminalBlockModel;
  readonly status: string;
  readonly labels: ChatLabels;
}) {
  const visible = model.displayOutput.trim().length > 0;
  return (
    <div
      className="paui-tool-block paui-tool-terminal"
      data-tool-block="terminal"
      data-state={
        model.failed ? "failed" : model.running ? "running" : "completed"
      }
    >
      <div className="paui-tool-terminal__header">
        <div className="paui-tool-terminal__prompt">
          <span className="paui-sr-only">{status}</span>
          {commandLines(model.command).map((command, index) => (
            <div className="paui-tool-terminal__prompt-line" key={index}>
              {index === 0 ? (
                <span
                  className="paui-tool-terminal__state"
                  aria-hidden="true"
                />
              ) : null}
              <span className="paui-tool-terminal__cwd">
                {index === 0 && model.cwd ? model.cwd : "$"}
              </span>
              <span className="paui-tool-terminal__command">{command}</span>
            </div>
          ))}
        </div>
        {!model.running && visible ? (
          <ToolCopyButton text={model.output} labels={labels} />
        ) : null}
      </div>
      {!model.running ? (
        visible ? (
          <pre className="paui-tool-terminal__output">
            {model.displayOutput}
          </pre>
        ) : (
          <div className="paui-tool-block__empty">{labels.toolNoOutput}</div>
        )
      ) : null}
    </div>
  );
}

function ReadBlock({
  model,
  labels,
}: {
  readonly model: ToolReadBlockModel;
  readonly labels: ChatLabels;
}) {
  const [expanded, setExpanded] = useState(false);
  const slices = headTail(model.lines, expanded);
  return (
    <div className="paui-tool-block paui-tool-read" data-tool-block="read">
      <div className="paui-tool-block__banner">
        <span className="paui-tool-block__label">{model.label}</span>
        {model.copyText ? (
          <ToolCopyButton text={model.copyText} labels={labels} />
        ) : null}
      </div>
      <div className="paui-tool-read__body">
        <ReadLines lines={slices.head} />
        {slices.hidden > 0 ? (
          <FoldButton
            expanded={expanded}
            hidden={slices.hidden}
            labels={labels}
            onClick={() => setExpanded((value) => !value)}
          />
        ) : null}
        <ReadLines lines={slices.tail} />
      </div>
    </div>
  );
}

function ReadLines({ lines }: { readonly lines: ToolReadBlockModel["lines"] }) {
  return lines.map((line) => (
    <div className="paui-tool-read__line" key={line.number}>
      <span className="paui-tool-read__gutter" aria-hidden="true">
        {line.number}
      </span>
      <span className="paui-tool-read__content">{line.text}</span>
    </div>
  ));
}

function DiffBlock({
  model,
  labels,
}: {
  readonly model: ToolDiffBlockModel;
  readonly labels: ChatLabels;
}) {
  const [expanded, setExpanded] = useState(false);
  const slices = headTail(model.rows, expanded);
  return (
    <div className="paui-tool-block paui-tool-diff" data-tool-block="diff">
      <div className="paui-tool-block__banner paui-tool-diff__banner">
        <span className="paui-tool-block__label">{labels.changedFiles}</span>
        <ToolCopyButton text={model.copyText} labels={labels} />
      </div>
      <div className="paui-tool-diff__body">
        <DiffRows rows={slices.head} />
        {slices.hidden > 0 ? (
          <FoldButton
            expanded={expanded}
            hidden={slices.hidden}
            labels={labels}
            onClick={() => setExpanded((value) => !value)}
          />
        ) : null}
        <DiffRows rows={slices.tail} />
      </div>
      <div className="paui-tool-diff__footer">
        +{model.added} −{model.removed} · {model.files} {labels.changedFiles}
      </div>
    </div>
  );
}

function DiffRows({ rows }: { readonly rows: ToolDiffBlockModel["rows"] }) {
  return rows.map((row, index) => (
    <div className="paui-tool-diff__line" data-line-kind={row.kind} key={index}>
      {row.text}
    </div>
  ));
}

function IoSection({
  label,
  section,
  labels,
  render,
  failed = false,
}: {
  readonly label: string;
  readonly section: ToolIoSectionModel;
  readonly labels: ChatLabels;
  readonly render: (value: unknown, index: number) => ReactNode;
  readonly failed?: boolean | undefined;
}) {
  return (
    <section className="paui-tool-io__section" data-error={failed || undefined}>
      <div className="paui-tool-io__section-header">
        <strong>{label}</strong>
        {section.copyText ? (
          <ToolCopyButton text={section.copyText} labels={labels} />
        ) : null}
      </div>
      <div className="paui-tool-io__content">
        {section.text !== undefined ? <pre>{section.text}</pre> : null}
        {section.values?.map(render)}
      </div>
    </section>
  );
}

function Supplementary({
  values,
  render,
}: {
  readonly values: readonly unknown[];
  readonly render: (value: unknown, index: number) => ReactNode;
}) {
  return values.length ? (
    <div className="paui-tool-supplementary">{values.map(render)}</div>
  ) : null;
}

function ToolCopyButton({
  text,
  labels,
}: {
  readonly text: string;
  readonly labels: ChatLabels;
}) {
  const { copied, copy } = useCopyFeedback(text);
  const label = copied ? labels.copied : labels.copy;
  return (
    <button
      className="paui-tool-block__copy"
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => copy(event.currentTarget)}
    >
      {label}
    </button>
  );
}

function FoldButton({
  expanded,
  hidden,
  labels,
  onClick,
}: {
  readonly expanded: boolean;
  readonly hidden: number;
  readonly labels: ChatLabels;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="paui-tool-block__fold"
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
    >
      {expanded ? labels.toolCollapseLines : labels.toolExpandLines(hidden)}
    </button>
  );
}

function headTail<T>(
  values: readonly T[],
  expanded: boolean,
): {
  readonly head: readonly T[];
  readonly tail: readonly T[];
  readonly hidden: number;
} {
  const hidden = Math.max(0, values.length - 8);
  if (!hidden) return { head: values, tail: [], hidden: 0 };
  if (expanded) return { head: values, tail: [], hidden };
  return { head: values.slice(0, 4), tail: values.slice(-4), hidden };
}

function commandLines(command: string): readonly string[] {
  const value = command.endsWith("\n") ? command.slice(0, -1) : command;
  return value.split("\n");
}
