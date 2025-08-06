// src/utils/reportGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MaintenanceParameters, CostInputs, MaintenanceCategory } from '../types';

// Logo paths - these should be placed in the public/img directory
const LOGO_PATHS = {
  dtts: '/img/DoT_Logo.png',
  rmo: '/img/RMO-Logo-rebrand.jpg',
  pvs: '/img/PMS-Logo.png'
};

export interface ReportData {
  totalCost: number;
  totalLength: number;
  selectedCounty: string | 'all' | string[]; // UPDATED TYPE
  parameters: MaintenanceParameters;
  costs: CostInputs;
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
}

// Extended interface for jsPDF with autoTable properties
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Converts an image URL to base64 format
 */
const getImageBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Formats the county selection for display in the report
 */
const formatCountySelection = (selectedCounty: string | 'all' | string[]): string => {
  if (selectedCounty === 'all') {
    return 'All Local Authorities';
  }
  if (Array.isArray(selectedCounty)) {
    if (selectedCounty.length === 1) {
      return selectedCounty[0];
    }
    return `${selectedCounty.length} Local Authorities Selected`;
  }
  return selectedCounty;
};

/**
 * Generates a professional PDF report of the current dashboard state
 */
export const generatePdfReport = async (data: ReportData): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4') as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const timestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format cost with appropriate units
  const formatCost = (cost: number): string => {
    if (cost >= 1e9) {
      return `€${(cost / 1e9).toFixed(2)}B`;
    } else if (cost >= 1e6) {
      return `€${(cost / 1e6).toFixed(2)}M`;
    } else if (cost >= 1e3) {
      return `€${(cost / 1e3).toFixed(2)}K`;
    }
    return `€${cost.toFixed(2)}`;
  };

  // Load logos
  let logos: { dtts?: string; rmo?: string; pvs?: string } = {};
  try {
    const [dttsLogo, rmoLogo, pvsLogo] = await Promise.all([
      getImageBase64(LOGO_PATHS.dtts),
      getImageBase64(LOGO_PATHS.rmo),
      getImageBase64(LOGO_PATHS.pvs)
    ]);
    logos = { dtts: dttsLogo, rmo: rmoLogo, pvs: pvsLogo };
  } catch (error) {
    console.warn('Could not load logos:', error);
  }

  // Page 1: Header, Summary, and Charts
  // ====================================

  // Add logos header
  let yPosition = 15;
  const logoHeight = 20;
  const totalLogoWidth = 120; // Approximate total width for all logos
  const startX = (pageWidth - totalLogoWidth) / 2;

  if (logos.dtts) {
    doc.addImage(logos.dtts, 'PNG', startX, yPosition, 30, logoHeight);
  }
  if (logos.rmo) {
    doc.addImage(logos.rmo, 'PNG', startX + 40, yPosition, 40, logoHeight);
  }
  if (logos.pvs) {
    doc.addImage(logos.pvs, 'PNG', startX + 90, yPosition, 30, logoHeight);
  }

  yPosition += logoHeight + 10;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Road Survey Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const countyText = formatCountySelection(data.selectedCounty); // UPDATED
  doc.text(countyText, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.text(`Generated: ${timestamp}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const summaryText = [
    `Total Regional Road Length: ${data.totalLength.toFixed(1)} km`,
    `Total Estimated Cost: ${formatCost(data.totalCost)}`,
    `Assessment Date: ${new Date().getFullYear()}`,
    `Region: ${countyText}`
  ];
  
  summaryText.forEach(text => {
    doc.text(text, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Maintenance Category Summary Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Category Analysis', margin, yPosition);
  
  yPosition += 10;

  const categories: MaintenanceCategory[] = [
    'Road Reconstruction',
    'Structural Overlay',
    'Surface Restoration',
    'Restoration of Skid Resistance',
    'Routine Maintenance'
  ];

  const categoryData = categories.map(category => {
    const length = data.categoryLengths[category];
    const cost = data.categoryCosts[category];
    const lengthPercentage = data.totalLength > 0 ? 
      ((length / data.totalLength) * 100).toFixed(1) : '0.0';
    const costPercentage = data.totalCost > 0 ? 
      ((cost / data.totalCost) * 100).toFixed(1) : '0.0';
    
    return [
      category,
      `${length.toFixed(1)} km`,
      `${lengthPercentage}%`,
      formatCost(cost),
      `${costPercentage}%`
    ];
  });

  // Add totals row
  categoryData.push([
    'TOTAL',
    `${data.totalLength.toFixed(1)} km`,
    '100.0%',
    formatCost(data.totalCost),
    '100.0%'
  ]);

  autoTable(doc, {
    head: [['Category', 'Length', 'Length %', 'Cost', 'Cost %']],
    body: categoryData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    didParseCell: function(data) {
      if (data.row.index === categoryData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  // Maintenance Parameters Table
  yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : yPosition + 100;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Parameters', margin, yPosition);
  
  yPosition += 10;

  const parameterData = [
    ['Category', 'Parameter', 'Threshold', 'Unit'],
    ['Road Reconstruction', 'IRI', `≥ ${data.parameters.roadReconstruction_iri}`, ''],
    ['', 'RUT', `≥ ${data.parameters.roadReconstruction_rut}`, 'mm'],
    ['', 'PSCI', `≤ ${data.parameters.roadReconstruction_psci}`, ''],
    ['Structural Overlay', 'IRI', `≥ ${data.parameters.structuralOverlay_iri}`, ''],
    ['', 'RUT', `≥ ${data.parameters.structuralOverlay_rut}`, 'mm'],
    ['', 'PSCI', `≤ ${data.parameters.structuralOverlay_psci}`, ''],
    ['Surface Restoration', 'PSCI (A)', `≤ ${data.parameters.surfaceRestoration_psci_a}`, ''],
    ['', 'PSCI (B) & IRI', `≤ ${data.parameters.surfaceRestoration_psci_b} & IRI ≥ ${data.parameters.surfaceRestoration_iri}`, ''],
    ['', 'PSCI (C)', `≤ ${data.parameters.surfaceRestoration_psci_c}`, ''],
    ['Skid Resistance', 'PSCI (A)', `≤ ${data.parameters.restorationOfSkidResistance_psci_a}`, ''],
    ['', 'PSCI (B) & CSC', `≤ ${data.parameters.restorationOfSkidResistance_psci_b} & CSC ≤ ${data.parameters.restorationOfSkidResistance_csc}`, ''],
    ['', 'PSCI (C) & MPD', `≤ ${data.parameters.restorationOfSkidResistance_psci_c} & MPD ≤ ${data.parameters.restorationOfSkidResistance_mpd}`, 'mm']
  ];

  autoTable(doc, {
    body: parameterData.slice(1),
    head: [parameterData[0]],
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    tableWidth: 'auto'
  });

  // Cost Parameters Table
  yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 80;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Parameters', margin, yPosition);
  
  yPosition += 10;

  const costData = [
    ['Road Reconstruction (RR)', `€${data.costs.rr}/sqm`],
    ['Structural Overlay (SO)', `€${data.costs.so}/sqm`],
    ['Surface Restoration (SR)', `€${data.costs.sr}/sqm`],
    ['Restoration of Skid Resistance (RS)', `€${data.costs.rs}/sqm`],
    ['Routine Maintenance (RM)', `€${data.costs.rm}/sqm`]
  ];

  autoTable(doc, {
    head: [['Maintenance Category', 'Cost per Square Meter']],
    body: costData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10
    }
  });

  // Save the PDF
  const fileNameCounty = Array.isArray(data.selectedCounty) ? 'Multiple' : data.selectedCounty;
  doc.save(`RMO_Report_${fileNameCounty}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generates a CSV file with the maintenance category data
 */
export const generateCsvReport = (data: ReportData): void => {
  const timestamp = new Date().toLocaleString();
  
  // Create CSV header
  let csvContent = 'Category,Length (km),Cost (€),Percentage of Total Length (%),Percentage of Total Cost (%)\n';
  
  // Add data rows
  const categories: MaintenanceCategory[] = [
    'Road Reconstruction',
    'Structural Overlay',
    'Surface Restoration',
    'Restoration of Skid Resistance',
    'Routine Maintenance'
  ];
  
  categories.forEach(category => {
    const length = data.categoryLengths[category];
    const cost = data.categoryCosts[category];
    const lengthPercentage = data.totalLength > 0 ? ((length / data.totalLength) * 100).toFixed(2) : '0.00';
    const costPercentage = data.totalCost > 0 ? ((cost / data.totalCost) * 100).toFixed(2) : '0.00';
    
    csvContent += `"${category}",${length.toFixed(2)},${cost.toFixed(2)},${lengthPercentage},${costPercentage}\n`;
  });
  
  // Add summary row
  csvContent += `\n"TOTAL",${data.totalLength.toFixed(2)},${data.totalCost.toFixed(2)},100.00,100.00\n`;
  
  // Add metadata
  csvContent += `\n"Generated:",${timestamp}\n`;
  csvContent += `"Local Authority:",${formatCountySelection(data.selectedCounty)}\n`; // UPDATED
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileNameCounty = Array.isArray(data.selectedCounty) ? 'Multiple' : data.selectedCounty;
  link.setAttribute('href', url);
  link.setAttribute('download', `RMO_Report_Data_${fileNameCounty}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
};