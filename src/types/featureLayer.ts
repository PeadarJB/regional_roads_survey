// src/types/featureLayer.ts
// Type definitions for the Road Network Feature Layer

/**
 * Represents the attributes of a road segment from the Road Network Feature Layer
 */
export interface RoadSurveyAttributes {
  // System fields
  OBJECTID: number;
  Shape_Length?: number;
  
  // Route identification
  Route: string;
  RouteSU?: number;
  LA: string; // Local Authority (County)
  
  // Location data
  ChFrom?: number; // Chainage From
  ChTo?: number; // Chainage To
  
  // 2018 Survey measurements
  AIRI_2018: number; // Average IRI (International Roughness Index)
  LRUT_2018: number; // Left Rut Depth
  PSCI_Class_2018: number; // Pavement Surface Condition Index Class
  CSC_Class_2018: number; // Characteristic SCRIM Coefficient Class
  MPD_2018: number; // Mean Profile Depth
  Road_Width_2018?: number; // Road width in meters
  IRI_Class_2018?: number; // IRI Classification
  Rut_Class_2018?: number; // Rut Classification
  
  // 2011 Survey measurements (for historical comparison)
  AIRI_2011?: number;
  LRUT_2011?: number;
  PSCI_Class_2011?: number;
  CSC_Class_2011?: number;
  MPD_2011?: number;
  Road_Width_2011?: number;
  IRI_Class_2011?: number;
  Rut_Class_2011?: number;
  
  // Road characteristics
  IsDublin?: number; // 1 if Dublin, 0 otherwise
  IsCityTown?: number; // 1 if City/Town road, 0 otherwise
  IsPeat?: number; // 1 if peat area, 0 otherwise
  IsFormerNa?: number; // 1 if former national road, 0 otherwise
  IsNew?: number; // 1 if new road, 0 otherwise
  
  // Other fields
  PID?: number;
  JoinKey?: string;
  JoinKey_1?: string;
  Route_1?: string;
  SU?: number;
}

/**
 * Represents a feature from the Feature Layer query results
 */
export interface RoadSurveyFeature {
  attributes: RoadSurveyAttributes;
  geometry?: __esri.Geometry;
}

/**
 * Maps the Feature Layer attributes to the application's RoadSegment interface
 */
export function mapFeatureToRoadSegment(feature: RoadSurveyFeature): {
  id: number;
  roadNumber: string;
  county: string;
  iri: number;
  rut: number;
  psci: number;
  csc: number;
  mpd: number;
} {
  const { attributes } = feature;
  
  return {
    id: attributes.OBJECTID,
    roadNumber: attributes.Route,
    county: attributes.LA,
    iri: attributes.AIRI_2018,
    rut: attributes.LRUT_2018,
    psci: attributes.PSCI_Class_2018,
    csc: attributes.CSC_Class_2018,
    mpd: attributes.MPD_2018
  };
}

/**
 * Maintenance category thresholds as SQL expressions for Feature Layer queries
 */
export const MAINTENANCE_SQL_EXPRESSIONS = {
  roadReconstruction: (params: {
    iri: number;
    rut: number;
    psci: number;
  }) => `(AIRI_2018 >= ${params.iri} OR LRUT_2018 >= ${params.rut} OR PSCI_Class_2018 <= ${params.psci})`,
  
  structuralOverlay: (params: {
    iri: number;
    rut: number;
    psci: number;
  }) => `(AIRI_2018 >= ${params.iri} OR LRUT_2018 >= ${params.rut} OR PSCI_Class_2018 <= ${params.psci})`,
  
  surfaceRestoration: (params: {
    psci_a: number;
    psci_b: number;
    iri: number;
    psci_c: number;
  }) => `(PSCI_Class_2018 <= ${params.psci_a} OR (PSCI_Class_2018 <= ${params.psci_b} AND AIRI_2018 >= ${params.iri}) OR PSCI_Class_2018 <= ${params.psci_c})`,
  
  skidResistance: (params: {
    psci_a: number;
    psci_b: number;
    csc: number;
    psci_c: number;
    mpd: number;
  }) => `(PSCI_Class_2018 <= ${params.psci_a} OR (PSCI_Class_2018 <= ${params.psci_b} AND CSC_Class_2018 <= ${params.csc}) OR (PSCI_Class_2018 <= ${params.psci_c} AND MPD_2018 <= ${params.mpd})`,
  
  // Routine Maintenance is the default - all segments not matching other categories
  routineMaintenance: () => '1=1'
};