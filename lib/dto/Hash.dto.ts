export class HashDto {
  alg: string;

  content: string;

  constructor(props: { alg: string; content: string }) {
    this.alg = props.alg;
    this.content = props.content;
  }
}
