export interface ParsedDevArgs {
  readonly surface: "inline" | "sidebar";
  readonly viteArgs: string[];
}

export function parseDevArgs(args: readonly string[]): ParsedDevArgs;

export function parseViteServerArgs(args: readonly string[]): {
  readonly server: {
    readonly host?: string | boolean;
    readonly port?: number;
    readonly strictPort?: boolean;
  };
  readonly force: boolean;
};
