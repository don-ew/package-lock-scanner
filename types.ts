
export interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: number;
  packages: {
    [path: string]: {
      version: string;
      // other properties are not needed for this app
    };
  };
}

export interface AffectedPackage {
  name:string;
  version: string;
}

export interface AnalysisResult {
  found: AffectedPackage[];
  scannedCount: number;
}
