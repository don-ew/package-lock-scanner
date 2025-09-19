
export interface V1Dependencies {
  [name: string]: {
    version: string;
    dependencies?: V1Dependencies;
    // other properties are not needed
  };
}

export interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: number;
  packages?: {
    [path: string]: {
      version: string;
      // other properties are not needed for this app
    };
  };
  dependencies?: V1Dependencies;
}

export interface AffectedPackage {
  name:string;
  version: string;
}

export interface AnalysisResult {
  found: AffectedPackage[];
  scannedCount: number;
}