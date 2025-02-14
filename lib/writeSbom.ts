import MergedSbom from "./MergedSbom";
import { writeFileSync } from "fs";

export default function writeSbom(version: string, mergedSbom: MergedSbom) {
  const filename = `svs-sbom-${version}.json`;
  const content = getJsonString(mergedSbom);
  console.info(`Writing SBOM to '${filename}'`);
  writeFileSync(filename, content);
}

function getJsonString(mergedSbom: MergedSbom) {
  const licenseList = getLicenseList(mergedSbom);
  const json = JSON.stringify(licenseList, null, 2);
  return json;
}

function getLicenseList(mergedSbom: MergedSbom) {
  const licenseNames = mergedSbom.getLicenseNames();
  const sortFn = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
  licenseNames.sort(sortFn);

  const result = {};
  for (const licenseName of licenseNames) {
    const { licenseText, components } = mergedSbom.getLicenseData(licenseName);
    const sortedComponents = [...components].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
    result[licenseName] = { licenseText, components: sortedComponents };
  }
  return result;
}
