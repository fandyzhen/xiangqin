import path from "node:path";

export function getDataPaths({
  dataDir = process.env.DATA_DIR,
  cwd = process.cwd()
}: {
  dataDir?: string;
  cwd?: string;
} = {}) {
  const resolvedDataDir = dataDir?.trim() || path.join(cwd, "data");

  return {
    dataDir: resolvedDataDir,
    submissionsFile: path.join(resolvedDataDir, "submissions.jsonl"),
    readStatusFile: path.join(resolvedDataDir, "read-status.json")
  };
}
