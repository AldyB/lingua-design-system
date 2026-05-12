/* @lingua/tokens — TypeScript declarations */
/* Auto-generated. Run: pnpm tokens:build */

export interface TokenEntry {
  value:   unknown;
  type:    string;
  cssVar:  string;
}

export declare const tokens: {
  global: Record<string, TokenEntry>;
  light:  Record<string, TokenEntry>;
  dark:   Record<string, TokenEntry>;
};

export declare const cssVars: {
  light: Record<string, string>;
  dark:  Record<string, string>;
};
