export class PropertyDto {
  name: string;

  value: string;

  constructor(props: { name: string; value: string }) {
    this.name = props.name;
    this.value = props.value;
  }
}
