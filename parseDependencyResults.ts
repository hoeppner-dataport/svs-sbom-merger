import { IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
// import { readFileSync } from 'fs';
// import { Type, plainToInstance } from 'class-transformer';
// import { parse } from 'path';

export enum ComponentType {
  library = "library",
  os = "operating-system",
}

function showError(errors: Record<string, any>[]) {
  for (const error of errors) {
    if (error.children.length === 0) {
      console.log(JSON.stringify(errors, null, 2));
    } else {
      showError(error.children);
    }
  }
}

// const data = JSON.parse(readFileSync('./dependency-results.sbom.json', 'utf8'));
// const bom = new BomDto(data);
// validate(bom, {
// 	skipMissingProperties: true,
// }).then((errors) => {
// 	if (errors.length > 0) {
// 		console.log('validation failed. errors: ', errors.length, errors);
// 		showError(errors);
// 	} else {
// 		console.log('validation succeed');
// 	}
// });
