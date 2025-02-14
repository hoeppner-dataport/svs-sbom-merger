export default function isVersionString(version) {
  return (
    typeof version === "string" || /^\d+\.\d+\.\d+$/.test(version) === true
  );
}
