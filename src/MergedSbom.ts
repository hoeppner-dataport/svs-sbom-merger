import { LicenseData, LicenseList, Sbom } from "./types";
import spdxLicenseList from "spdx-license-list/full";
import core from '@actions/core';

const SEPARATOR = /(\s+OR\s+|\s+AND\s+|\/)/gim;
const ONLY_A_SEPARATOR = /^(\s+OR\s+|\s+AND\s+|\/)$/gim;

export default class MergedSbom {
  private mergedSbom: Map<string, LicenseData> = new Map();

  constructor(bomList: Sbom[]) {
    bomList.forEach((bom) => {
      this.addBom(bom);
    });
  }

  public getLicenseNames(): string[] {
    return [...this.mergedSbom.keys()];
  }

  public getLicenseData(licenseName: string): LicenseData | undefined {
    return this.mergedSbom.get(licenseName);
  }

  public addBom(bom: Sbom): void {
    const noGithubActions = (e) =>
      !/^pkg:githubaction/.test(e.referenceLocator);
    const someValidRefs = (p) =>
      p.externalRefs.filter(noGithubActions).length > 0;

    const packages = bom.packages?.filter(someValidRefs) ?? [];
    packages.forEach((p) => {
      if (p.licenseConcluded === undefined) {
        core.warning(
          `No license concluded for ${p.name}@${p.versionInfo}`,
        );
        return;
      }
      this.addSbomEntry(p.licenseConcluded, p.name, p.versionInfo);
    });
  }

  public toString(): string {
    const licenseList = this.getLicenseList();
    return JSON.stringify(licenseList, null, 2);
  }

  private getLicenseList(): LicenseList {
    const licenseNames = this.getLicenseNames();
    licenseNames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    const result: LicenseList = {};
    for (const licenseName of licenseNames) {
      const licenseData = this.getLicenseData(licenseName);
      if (!licenseData) {
        continue;
      }
      const { licenseText, packages: components } = licenseData;
      const sortedComponents = [...components].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );
      result[licenseName] = { licenseText, components: sortedComponents };
    }
    return result;
  }

  private addSbomEntry(
    licenseKey: string,
    name: string,
    version: string,
  ): void {
    const cleansedLicenseKey = this.cleanLicenseKey(licenseKey);

    if (ONLY_A_SEPARATOR.test(cleansedLicenseKey)) {
      return;
    }

    if (this.isSingleLicenseKey(cleansedLicenseKey)) {
      this.addPackageToLicense(cleansedLicenseKey, name, version);
      return;
    }

    const licenseParts = this.splitLicenseString(cleansedLicenseKey);

    licenseParts.forEach((licensePart) => {
      if (licenseKey !== licensePart) {
        this.addSbomEntry(licensePart, name, version);
      }
    });
    return;
  }

  private isSingleLicenseKey(licenseKey: string): boolean {
    return !SEPARATOR.test(licenseKey);
  }

  private addPackageToLicense(
    licenseKey: string,
    name: string,
    version: string,
  ): void {
    const license = spdxLicenseList[licenseKey];
    if (license === undefined) {
      core.warning(`License not found: '${licenseKey}' for ${name}@${version}`);
      return;
    }
    const content = this.mergedSbom.get(license.name) ?? {
      licenseName: license.name,
      licenseText: license.licenseText,
      packages: new Set(),
    };
    content.packages.add(`${name}@${version}`);
    this.mergedSbom.set(license.name, content);
  }

  private cleanLicenseKey(licenseKey: string): string {
    const cleansedLicenseKey = licenseKey
      .replace(/[()]+/gim, "")
      .replace(/^Apache2$/, "Apache-2.0")
      .replace(/^X-11$/, "X11")
      .replace(/^Public-Domain$/, "Public Domain");
    return cleansedLicenseKey;
  }

  private splitLicenseString(licenseKey: string): string[] {
    const licenseParts = licenseKey.split(SEPARATOR);
    return licenseParts;
  }
}
