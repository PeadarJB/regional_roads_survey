// src/utils/reportGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { MaintenanceParameters, CostInputs, MaintenanceCategory } from '../types';

export interface ReportData {
  totalCost: number;
  totalLength: number;
  selectedCounty: string;
  parameters: MaintenanceParameters;
  costs: CostInputs;
  categoryLengths: Record<MaintenanceCategory, number>;
  categoryCosts: Record<MaintenanceCategory, number>;
}

/**
 * Generates a PDF report of the current dashboard state
 */
export const generatePdfReport = async (data: ReportData): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = 20;
  const timestamp = new Date().toLocaleString();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Road Survey Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const countyText = data.selectedCounty === 'all' ? 'All Counties' : data.selectedCounty;
  doc.text(`Local Authority: ${countyText}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Generated: ${timestamp}`, pageWidth / 2, yPosition, { align: 'center' });
  
  // Summary Section
  yPosition += 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
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
  
  doc.text(`Total Maintenance Cost: ${formatCost(data.totalCost)}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Total Road Network Length: ${data.totalLength.toFixed(0)} km`, margin, yPosition);
  
  // Capture and add charts
  yPosition += 20;
  
  // Try to capture the length chart
  const lengthChartElement = document.getElementById('length-chart-card');
  if (lengthChartElement) {
    try {
      const canvas = await html2canvas(lengthChartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (yPosition + imgHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing length chart:', error);
    }
  }
  
  // Try to capture the costs chart
  const costsChartElement = document.getElementById('costs-chart-card');
  if (costsChartElement) {
    try {
      const canvas = await html2canvas(costsChartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (yPosition + imgHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing costs chart:', error);
    }
  }
  
  // Add category breakdown table
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Category Breakdown', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Table headers
  doc.setFont('helvetica', 'bold');
  doc.text('Category', margin, yPosition);
  doc.text('Length (km)', pageWidth - 80, yPosition);
  doc.text('Cost', pageWidth - 40, yPosition);
  
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  
  // Table data
  const categories: MaintenanceCategory[] = [
    'Road Reconstruction',
    'Structural Overlay',
    'Surface Restoration',
    'Restoration of Skid Resistance',
    'Routine Maintenance'
  ];
  
  categories.forEach(category => {
    const categoryName = category.length > 30 ? category.substring(0, 27) + '...' : category;
    doc.text(categoryName, margin, yPosition);
    doc.text(data.categoryLengths[category].toFixed(1), pageWidth - 80, yPosition);
    doc.text(formatCost(data.categoryCosts[category]), pageWidth - 40, yPosition);
    yPosition += 8;
  });
  
  // Add parameters section
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Parameters', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Parameters grouped by category
  const parameterGroups = [
    {
      title: 'Road Reconstruction',
      params: [
        { label: 'IRI ≥', value: data.parameters.roadReconstruction_iri },
        { label: 'RUT ≥', value: data.parameters.roadReconstruction_rut, suffix: ' mm' },
        { label: 'PSCI ≤', value: data.parameters.roadReconstruction_psci }
      ]
    },
    {
      title: 'Structural Overlay',
      params: [
        { label: 'IRI ≥', value: data.parameters.structuralOverlay_iri },
        { label: 'RUT ≥', value: data.parameters.structuralOverlay_rut, suffix: ' mm' },
        { label: 'PSCI ≤', value: data.parameters.structuralOverlay_psci }
      ]
    },
    {
      title: 'Surface Restoration',
      params: [
        { label: 'PSCI ≤ (A)', value: data.parameters.surfaceRestoration_psci_a },
        { label: 'PSCI ≤ (B) & IRI ≥', value: data.parameters.surfaceRestoration_psci_b },
        { label: 'IRI ≥', value: data.parameters.surfaceRestoration_iri },
        { label: 'PSCI ≤ (C)', value: data.parameters.surfaceRestoration_psci_c }
      ]
    },
    {
      title: 'Restoration of Skid Resistance',
      params: [
        { label: 'PSCI ≤ (A)', value: data.parameters.skidResistance_psci_a },
        { label: 'PSCI ≤ (B) & CSC ≤', value: data.parameters.skidResistance_psci_b },
        { label: 'CSC ≤', value: data.parameters.skidResistance_csc },
        { label: 'PSCI ≤ (C) & MPD ≤', value: data.parameters.skidResistance_psci_c },
        { label: 'MPD ≤', value: data.parameters.skidResistance_mpd, suffix: ' mm' }
      ]
    }
  ];
  
  parameterGroups.forEach(group => {
    doc.setFont('helvetica', 'bold');
    doc.text(group.title, margin, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    group.params.forEach(param => {
      doc.text(`${param.label}: ${param.value}${param.suffix || ''}`, margin + 10, yPosition);
      yPosition += 6;
    });
    
    yPosition += 4;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Add costs section
  yPosition += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Parameters (€/sqm)', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const costLabels = {
    rr: 'Road Reconstruction',
    so: 'Structural Overlay',
    sr: 'Surface Restoration',
    rs: 'Restoration of Skid Resistance',
    rm: 'Routine Maintenance'
  };
  
  Object.entries(data.costs).forEach(([key, value]) => {
    doc.text(`${costLabels[key as keyof typeof costLabels]}: €${value}/sqm`, margin, yPosition);
    yPosition += 8;
  });
  
  // Save the PDF
  doc.save(`RMO_Report_${data.selectedCounty}_${new Date().toISOString().split('T')[0]}.pdf`);
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
  csvContent += `"Local Authority:",${data.selectedCounty === 'all' ? 'All Counties' : data.selectedCounty}\n`;
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `RMO_Report_Data_${data.selectedCounty}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
};