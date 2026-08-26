import type { CSSProperties, ReactNode } from "react";
import type {
  ChatController,
  ChatOptions,
  ChatToolCall,
} from "../core/types.js";
import type {
  ChatColorScheme,
  ChatLabels,
  ChatSurface,
} from "../presentation.js";
export { defaultLabels } from "../presentation.js";
export type {
  ChatColorScheme,
  ChatLabels,
  ChatSurface,
} from "../presentation.js";

/** Renders the body of one normalized tool activity. Return `undefined` to use the built-in body. */
export type ToolActivityRenderer = (
  tool: ChatToolCall,
) => ReactNode | undefined;

interface ChatPresentationProps {
  readonly className?: string | undefined;
  readonly style?: CSSProperties | undefined;
  /** Layout semantics owned by the host, independent of container width. */
  readonly surface?: ChatSurface | undefined;
  /** Defaults to `"system"`. */
  readonly colorScheme?: ChatColorScheme | undefined;
  /** Partial overrides for the built-in English labels. */
  readonly labels?: Partial<ChatLabels> | undefined;
  /** The only public activity rendering seam. */
  readonly toolActivityRenderer?: ToolActivityRenderer | undefined;
}

type ChatOwnershipProps =
  | {
      /** Immutable construction options owned by this root. Remount to replace them. */
      readonly options: ChatOptions;
      readonly controller?: never;
    }
  | {
      /** Caller-owned controller; the root never destroys it. */
      readonly controller: ChatController;
      readonly options?: never;
    };

/** Props for the default chat composition. */
export type ChatProps = ChatPresentationProps & ChatOwnershipProps;

/** Props for the state-owning root used by manual compositions. */
export type ChatRootProps = ChatPresentationProps &
  ChatOwnershipProps & {
    readonly children?: ReactNode;
  };
