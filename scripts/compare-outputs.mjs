import { getCompatibleVersions as getCompatibleVersionsMain } from "../dist/index.js";
import { getCompatibleVersions as getCompatibleVersionsLite } from "../lite/dist/index.js";
import assert from "assert";

const optionsToTest = [
  {},
  { widelyAvailableOnDate: "2023-01-01" },
  { widelyAvailableOnDate: "2018-01-30" },
  { widelyAvailableOnDate: "2024-01-01" },
  { widelyAvailableOnDate: "2024-01-01", includeDownstreamBrowsers: true },
  {
    widelyAvailableOnDate: "2024-01-01",
    includeDownstreamBrowsers: true,
    includeKaiOS: true,
  },
  { targetYear: 2022 },
];

function sortResults(arr) {
  return arr.sort((a, b) => {
    if (a.browser < b.browser) return -1;
    if (a.browser > b.browser) return 1;
    if (a.version < b.version) return -1;
    if (a.version > b.version) return 1;
    return 0;
  });
}

console.log(
  "Comparing outputs of getCompatibleVersions from main and lite modules...",
);

for (const options of optionsToTest) {
  console.log(`\nTesting with options: ${JSON.stringify(options)}`);

  const mainResult = getCompatibleVersionsMain(options);
  const liteResult = getCompatibleVersionsLite(options);

  const sortedMainResult = sortResults(mainResult);
  const sortedLiteResult = sortResults(liteResult);

  try {
    assert.deepStrictEqual(sortedMainResult, sortedLiteResult);
    console.log("✅ Outputs are identical.");
  } catch (error) {
    console.error("❌ Outputs are different.");
    console.error(
      "Main module output:",
      JSON.stringify(sortedMainResult, null, 2),
    );
    console.error(
      "Lite module output:",
      JSON.stringify(sortedLiteResult, null, 2),
    );
  }
}
