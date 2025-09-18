import data from "./data.json" with { type: "json" };

type BrowserVersion = {
  browser: string;
  version: string;
  release_date?: string;
  engine?: string;
  engine_version?: string;
};

type Options = {
  /**
   * Pass a date in the format 'YYYY-MM-DD' to get versions compatible with Widely available on the specified date.
   * If left undefined and a `targetYear` is not passed, defaults to Widely available as of the current date.
   * > NOTE: cannot be used with `targetYear`.
   */
  widelyAvailableOnDate?: string;
  /**
   * Whether to include browsers that use the same engines as a core Baseline browser.
   * Defaults to `false`.
   */
  includeDownstreamBrowsers?: boolean;
  /**
   * Pass a boolean that determines whether KaiOS is included in browser mappings.  KaiOS implements
   * the Gecko engine used in Firefox.  However, KaiOS also has a different interaction paradigm to
   * other browsers and requires extra consideration beyond simple feature compatibility to provide
   * an optimal user experience.  Defaults to `false`.
   */
  includeKaiOS?: boolean;
  /**
   * Pass a year between 2015 and the current year to get browser versions compatible with all
   * Newly Available features as of the end of the year specified.
   * > NOTE: cannot be used with `widelyAvailableOnDate`.
   */
  targetYear?: number;
};

const kaiOSWarning = (options: Options) => {
  if (
    options.includeDownstreamBrowsers === false &&
    options.includeKaiOS === true
  ) {
    throw new Error(
      "KaiOS is a downstream browser and can only be included if you include other downstream browsers. Please ensure you use `includeDownstreamBrowsers: true`.",
    );
  }
};

/**
 * Returns browser versions compatible with specified Baseline targets.
 * Defaults to returning the minimum versions of the core browser set that support Baseline Widely available.
 * Takes an optional configuration `Object` with four optional properties:
 * - `includeDownstreamBrowsers`: `false` (default) or `true`
 * - `widelyAvailableOnDate`: date in format `YYYY-MM-DD`
 * - `targetYear`: year in format `YYYY`
 * - `includeKaiOS`: `false` (default) or `true`
 */
export function getCompatibleVersions(userOptions?: Options): BrowserVersion[] {
  const options = userOptions ?? {};
  const includeDownstream = options.includeDownstreamBrowsers ?? false;
  const includeKaiOS = options.includeKaiOS ?? false;

  kaiOSWarning({ includeDownstreamBrowsers: includeDownstream, includeKaiOS });

  let targetDate: Date;

  if (options.targetYear && options.widelyAvailableOnDate) {
    throw new Error(
      "You cannot use targetYear and widelyAvailableOnDate at the same time. Please remove one of these options and try again.",
    );
  }

  if (options.targetYear) {
    targetDate = new Date(`${options.targetYear}-12-31`);
    targetDate.setMonth(targetDate.getMonth() + 30);
  } else if (options.widelyAvailableOnDate) {
    targetDate = new Date(options.widelyAvailableOnDate);
    targetDate.setMonth(targetDate.getMonth() - 30);
  } else {
    targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - 30);
  }

  const availableDates = Object.keys(data)
    .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  if (availableDates.length === 0) {
    throw new Error("No valid dates found in data source.");
  }

  let closestDate: Date | undefined;
  for (let i = availableDates.length - 1; i >= 0; i--) {
    const d = availableDates[i];
    if (d && d <= targetDate) {
      closestDate = d;
      break;
    }
  }

  if (!closestDate) {
    closestDate = availableDates[0];
  }

  if (!closestDate) {
    throw new Error("No compatible date found for the specified target.");
  }

  const result = (data as any)[closestDate.toISOString().slice(0, 10)];
  const browserMappingRaw = (data as any)._browserMapping;
  const substitutions = (data as any)._substitutions;
  const engineMapping = (data as any)._engineMapping;

  const browserMapping = browserMappingRaw.map((name: string) => {
    const [base, sub] = name.split(":");
    if (sub && substitutions[sub]) {
      return base + substitutions[sub];
    }
    return name;
  });

  const unpackedResult = result.map((item: any) => {
    const obj: BrowserVersion = {
      browser: browserMapping[item[0]],
      version: item[1],
      release_date: item[2] === 0 ? "unknown" : item[2],
    };
    if (item.length > 3) {
      obj.engine = engineMapping[item[3]];
      obj.engine_version = item[4];
    }
    return obj;
  });

  if (includeDownstream) {
    if (includeKaiOS) {
      return unpackedResult;
    }
    return unpackedResult.filter(
      (browser: BrowserVersion) => browser.browser !== "kai_os",
    );
  }

  return unpackedResult.slice(0, 7);
}
