// src/types/jspdf-autotable.d.ts
declare module 'jspdf-autotable' {
import { jsPDF } from 'jspdf';

// A specific type for cell content, allowing strings or numbers.
type CellValue = string | number;

// A detailed type for style properties, replacing 'any'.
export interface AutoTableStyles {
 font?: 'helvetica' | 'times' | 'courier';
 fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
 fillColor?: string | [number, number, number];
 textColor?: string | [number, number, number];
 fontSize?: number;
 cellPadding?: number;
 halign?: 'left' | 'center' | 'right';
 valign?: 'top' | 'middle' | 'bottom';
 lineWidth?: number;
 lineColor?: [number, number, number];
}

// A generic but structured type for hook data.
export interface HookData {
 cell: {
  raw: CellValue;
  styles: AutoTableStyles;
  [key: string]: unknown;
 };
 row: {
  index: number;
  [key: string]: unknown;
 };
 column: {
  index: number;
  [key: string]: unknown;
 };
 doc: jsPDF;
 [key: string]: unknown;
}

export interface UserOptions {
 head?: CellValue[][];
 body?: CellValue[][];
 foot?: CellValue[][];
 startY?: number;
 margin?: { top?: number; right?: number; bottom?: number; left?: number };
 pageBreak?: 'auto' | 'avoid' | 'always';
 rowPageBreak?: 'auto' | 'avoid';
 tableWidth?: 'auto' | 'wrap' | number;
 showHead?: 'everyPage' | 'firstPage' | 'never';
 showFoot?: 'everyPage' | 'lastPage' | 'never';
 startX?: number;
 theme?: 'striped' | 'grid' | 'plain';
 useCss?: boolean;
 styles?: AutoTableStyles;
 bodyStyles?: AutoTableStyles;
 headStyles?: AutoTableStyles;
 footStyles?: AutoTableStyles;
 alternateRowStyles?: AutoTableStyles;
 columnStyles?: { [key: string | number]: AutoTableStyles };
 didParseCell?: (data: HookData) => void;
 willDrawCell?: (data: HookData) => void;
 didDrawCell?: (data: HookData) => void;
 didDrawPage?: (data: HookData) => void;
}

export default function autoTable(
 doc: jsPDF,
 options: UserOptions
): jsPDF;
}