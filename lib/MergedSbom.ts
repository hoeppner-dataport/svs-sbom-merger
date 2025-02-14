import { BomDto } from "./dto/Bom.dto";
import spdxLicenseList from "spdx-license-list/full";

const SEPARATOR = /(\s+OR\s+|\s+AND\s+|\/)/gim;
const ONLY_A_SEPARATOR = /^(\s+OR\s+|\s+AND\s+|\/)$/gim;

export default class MergedSbom {
  private mergedSbom = new Map();

  constructor(bomList: BomDto[]) {
    bomList.forEach((bom) => {
      this.addBom(bom);
    });
  }

  public getLicenseNames() {
    return [...this.mergedSbom.keys()];
  }

  public getLicenseData(licenseName: string) {
    return this.mergedSbom.get(licenseName);
  }

  public addBom(bom: BomDto) {
    bom.components?.forEach((component) => {
      component?.licenseNames.forEach((licenseKey) => {
        this.addSbomEntry(licenseKey, component.name, component.version);
      });
    });
  }

  private addSbomEntry(licenseKey: string, name: string, version: string) {
    const cleansedLicenseKey = this.cleanLicenseKey(licenseKey);

    if (ONLY_A_SEPARATOR.test(cleansedLicenseKey)) {
      return;
    }

    if (this.isSingleLicenseKey(cleansedLicenseKey)) {
      this.addComponentToLicense(cleansedLicenseKey, name, version);
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

  private isSingleLicenseKey(licenseKey: string) {
    return !SEPARATOR.test(licenseKey);
  }

  private addComponentToLicense(
    licenseKey: string,
    name: string,
    version: string,
  ) {
    const license = spdxLicenseList[licenseKey];
    if (license === undefined) {
      console.warn(`License not found: '${licenseKey}' for ${name}@${version}`);
      return;
    }
    const content = this.mergedSbom.get(license.name) ?? {
      licenseName: license.name,
      licenseText: license.licenseText,
      components: new Set(),
    };
    content.components.add(`${name}@${version}`);
    this.mergedSbom.set(license.name, content);
  }

  private cleanLicenseKey(licenseKey: string) {
    const cleansedLicenseKey = licenseKey
      .replace(/[()]+/gim, "")
      .replace(/^Apache2$/, "Apache-2.0")
      .replace(/^X-11$/, "X11")
      .replace(/^Public-Domain$/, "Public Domain");
    return cleansedLicenseKey;
  }

  private splitLicenseString(licenseKey: string) {
    const licenseParts = licenseKey.split(SEPARATOR);
    return licenseParts;
  }
}
