export interface Rule {
  hostname: RegExp;
  pathrule: RegExp[];
}

import micromatch from "micromatch";

export interface Rules {
  [hostname: string]: string[];
}

export default function adblock(rules: Rules, url: URL): boolean {
  for (const [k, v] of Object.entries(rules)) {
    if (
      micromatch.isMatch(url.hostname, k) && v.length == 0 ||
      micromatch.isMatch(url.pathname, v as string[])
    ) {
      return true;
    }
  }
  return false;
}
