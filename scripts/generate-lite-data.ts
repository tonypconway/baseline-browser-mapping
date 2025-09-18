import { getCompatibleVersions } from "../src/index";
import * as fs from "fs";

const startDate = new Date("2018-01-30");
const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 30);

const data: { [date: string]: any } = {};
let lastResult: any = null;

const allBrowserNames = new Set<string>();
const allEngineNames = new Set<string>();

for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateString = d.toISOString().slice(0, 10);
  const result = getCompatibleVersions({
    widelyAvailableOnDate: dateString,
    includeDownstreamBrowsers: true,
    includeKaiOS: true,
  });
  result.forEach((item: any) => {
    allBrowserNames.add(item.browser);
    if (item.engine) {
      allEngineNames.add(item.engine);
    }
  });
}

const browserMapping = Array.from(allBrowserNames);
const engineMapping = Array.from(allEngineNames);

const substitutions = {
  a: "_android",
  i: "_ios",
};

const compressedBrowserMapping = browserMapping.map((name) => {
  if (name.endsWith("_android")) {
    return name.replace(/_android$/, ":a");
  }
  if (name.endsWith("_ios")) {
    return name.replace(/_ios$/, ":i");
  }
  return name;
});

data._substitutions = substitutions;
data._browserMapping = compressedBrowserMapping;
data._engineMapping = engineMapping;

for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateString = d.toISOString().slice(0, 10);
  const result = getCompatibleVersions({
    widelyAvailableOnDate: dateString,
    includeDownstreamBrowsers: true,
    includeKaiOS: true,
  });

  if (JSON.stringify(result) !== JSON.stringify(lastResult)) {
    const compressedResult = result.map((item: any) => {
      const browserIndex = browserMapping.indexOf(item.browser);
      const releaseDate =
        item.release_date === "unknown" ? 0 : item.release_date;
      const array: (string | number)[] = [
        browserIndex,
        item.version,
        releaseDate,
      ];
      if (item.engine) {
        const engineIndex = engineMapping.indexOf(item.engine);
        array.push(engineIndex);
        array.push(item.engine_version);
      }
      return array;
    });
    data[dateString] = compressedResult;
    lastResult = result;
  }
}

fs.writeFileSync("lite/src/data.json", JSON.stringify(data, null, 2));
