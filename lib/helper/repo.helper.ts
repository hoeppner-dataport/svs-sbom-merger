import { PROJECT } from "../../config/config";

export const getRepositoryUrl = (repository) => {
  const url = `https://github.com/${PROJECT}/${repository}`;
  return url;
};
