import("./dist/index.js").then(({ getCompatibleVersions }) => {
  console.log("## No options (should be current date)");
  console.log(getCompatibleVersions());

  console.log("\n## Widely available on 2023-01-01");
  console.log(getCompatibleVersions({ widelyAvailableOnDate: "2023-01-01" }));

  console.log("\n## Widely available on 2018-01-29");
  console.log(getCompatibleVersions({ widelyAvailableOnDate: "2018-01-30" }));

  console.log("\n## Widely available on 2024-01-01");
  console.log(getCompatibleVersions({ widelyAvailableOnDate: "2024-01-01" }));

  console.log("\n## Widely available on 2024-01-01 with downstream browsers");
  console.log(
    getCompatibleVersions({
      widelyAvailableOnDate: "2024-01-01",
      includeDownstreamBrowsers: true,
    }),
  );

  console.log(
    "\n## Widely available on 2024-01-01 with downstream browsers and KaiOS",
  );
  console.log(
    getCompatibleVersions({
      widelyAvailableOnDate: "2024-01-01",
      includeDownstreamBrowsers: true,
      includeKaiOS: true,
    }),
  );

  console.log(
    "\n## Widely available on 2024-01-01 with KaiOS but not downstream browsers (should throw error)",
  );
  try {
    getCompatibleVersions({
      widelyAvailableOnDate: "2024-01-01",
      includeKaiOS: true,
    });
  } catch (e) {
    console.error(e.message);
  }

  console.log("\n## Target year 2022");
  console.log(getCompatibleVersions({ targetYear: 2022 }));

  console.log(
    "\n## Target year 2022 and widely available on 2023-01-01 (should throw error)",
  );
  try {
    getCompatibleVersions({
      targetYear: 2022,
      widelyAvailableOnDate: "2023-01-01",
    });
  } catch (e) {
    console.error(e.message);
  }
});
