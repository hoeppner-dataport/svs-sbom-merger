export class LicensePropsDto {
  name: string;

  constructor(props: { name: string }) {
    this.name = props.name;
  }
}
