import { BomDto } from "./dto/Bom.dto";
import spdxLicenseList from "spdx-license-list/full";

const SEPARATOR = /(\s+OR\s+|\s+AND\s+|\/)/gim;
export default class MergedSbom {
  private mergedSbom = new Map();

  constructor(bomList: BomDto[]) {
    bomList.forEach((bom) => {
      this.addBom(bom);
    });
  }

  addBom(bom: BomDto) {
    bom.components?.forEach((component) => {
      component?.licenseNames.forEach((license) => {
        this.addSbomEntry(license, component.name, component.version);
      });
    });
  }

  addSbomEntry(license: string, name: string, version: string, count = 1) {
    const licenseName = spdxLicenseList[license]?.name;
    const licenseText = spdxLicenseList[license]?.licenseText;
    if (SEPARATOR.test(license)) {
      return;
    }
    if (licenseText === undefined && license !== "" && license !== "/") {
      const cleanLicense = license
        .replace(/[()]+/gim, "")
        .replace(/^Apache2$/, "Apache-2.0");
      const licenseParts = cleanLicense.split(SEPARATOR);
      if (licenseParts.length > 1) {
        licenseParts.forEach((licensePart) => {
          this.addSbomEntry(licensePart, name, version, count + 1);
        });
      }
      return;
    } else {
      const content = this.mergedSbom.get(licenseName) ?? {
        licenseName,
        licenseText,
        components: new Set(),
      };
      content.components.add(`${name}@${version}`);
      this.mergedSbom.set(licenseName, content);
    }
  }

  getList() {
    const licenseNames = [...this.mergedSbom.keys()].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    const result = {};
    for (const licenseName of licenseNames) {
      const { licenseText, components } = this.mergedSbom.get(licenseName);
      const sortedComponents = [...components].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      result[licenseName] = { licenseText, components: sortedComponents };
    }
    return result;
  }
}
