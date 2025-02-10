import { HashDto } from "./Hash.dto";
import { LicenseDto } from "./License.dto";
import { PropertyDto } from "./Property.dto";

export class ComponentDto {
  bomRef: string;

  type: string;

  name: string;

  version: string;

  hashes: HashDto[];

  licenses: LicenseDto[];

  purl: string;

  properties: PropertyDto[];

  constructor(props: {
    bomRef: string;
    type: string;
    name: string;
    version: string;
    hashes: HashDto[];
    licenses: LicenseDto[];
    purl: string;
    properties: PropertyDto[];
  }) {
    this.bomRef = props.bomRef;
    this.type = props.type;
    this.name = props.name;
    this.version = props.version;
    this.hashes = props.hashes?.map((hash) => new HashDto(hash));
    this.licenses = props.licenses?.map((license) => new LicenseDto(license));
    this.purl = props.purl;
    this.properties = props.properties?.map(
      (property) => new PropertyDto(property)
    );
  }

  get licenseNames() {
    if (this.licenses === undefined) {
      return [];
    }
    return this.licenses.map(({ license }) => license.name);
  }
}
