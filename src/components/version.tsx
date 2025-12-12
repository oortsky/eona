import packageJson from "../../package.json";

interface VersionProps {
  className?: string;
}

export function Version({ className }: VersionProps) {
  return <span className={className}>v{packageJson.version}</span>;
}
