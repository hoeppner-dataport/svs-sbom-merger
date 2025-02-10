import { LicensePropsDto } from "./LicenseProps.dto";

export class LicenseDto {
  license: LicensePropsDto;

  constructor(props: { license: LicensePropsDto }) {
    this.license = new LicensePropsDto(props.license);
  }
}
