// src/types/index.ts
// This file contains all the core TypeScript interfaces and type definitions for the application.

/**
 * Represents a single 100-meter road segment from the survey data.
 */
export interface RoadSegment {
  id: number;
  roadNumber: string;
  county: string;
  iri: number; // International Roughness Index (Ride Quality)
  rut: number; // Rut Depth (Structural Damage)
  psci: number; // Pavement Surface Condition Index (Visual Cracks)
  csc: number; // Characteristic SCRIM Coefficient (Skid Resistance)
  mpd: number; // Mean Profile Depth (Skid Resistance)
}

/**
 * Defines the structure for the user-adjustable maintenance parameters.
 * Each key corresponds to a road condition parameter.
 */
export interface MaintenanceParameters {
  iri: number;
  rut: number;
  psci: number;
  csc: number;
  mpd: number;
}

/**
 * Defines the structure for the user-adjustable cost inputs.
 * Each key is a shorthand for a maintenance category.
 */
export interface CostInputs {
  rr: number; // Road Reconstruction
  so: number; // Structural Overlay
  sr: number; // Surface Restoration
  rs: number; // Restoration of Skid Resistance
  rm: number; // Routine Maintenance
}

/**
 * A string literal type representing the five possible maintenance categories.
 */
export type MaintenanceCategory =
  | 'Road Reconstruction'
  | 'Structural Overlay'
  | 'Surface Restoration'
  | 'Restoration of Skid Resistance'
  | 'Routine Maintenance';

/**
 * A string literal type for the application's theme mode.
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Represents a logged-in user.
 * This will be expanded later with more details.
 */
export interface User {
  username: string;
}
