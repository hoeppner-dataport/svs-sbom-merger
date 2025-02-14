import { LicenseList } from "../types/types";
import isVersionString from "./helper/isVersionString.helper";
import MergedSbom from "./MergedSbom";
import { writeFileSync } from "fs";

export default function writeSbom(
  version: string,
  mergedSbom: MergedSbom,
): void {
  if (!isVersionString(version)) {
    throw new Error(`Invalid version: ${version}`);
  }

  const filename = `svs-sbom-${version}.json`;
  const content = getJsonString(mergedSbom);
  console.info(`Writing SBOM to '${filename}'`);
  try {
    writeFileSync(filename, content);
  } catch (error) {
    console.error(`Failed to write SBOM to '${filename}':`, error);
  }
}

function getJsonString(mergedSbom: MergedSbom): string {
  const licenseList = getLicenseList(mergedSbom);
  return JSON.stringify(licenseList, null, 2);
}

function getLicenseList(mergedSbom: MergedSbom): LicenseList {
  const licenseNames = mergedSbom.getLicenseNames();
  licenseNames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const result: LicenseList = {};
  for (const licenseName of licenseNames) {
    const licenseData = mergedSbom.getLicenseData(licenseName);
    if (!licenseData) {
      continue;
    }
    const { licenseText, components } = licenseData;
    const sortedComponents = [...components].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
    result[licenseName] = { licenseText, components: sortedComponents };
  }
  return result;
}
