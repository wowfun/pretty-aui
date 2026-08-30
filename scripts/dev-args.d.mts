export function parseViteServerArgs(args: readonly string[]): {
  readonly server: {
    readonly host?: string | boolean;
    readonly port?: number;
    readonly strictPort?: boolean;
  };
  readonly force: boolean;
};
