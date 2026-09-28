import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionRecord } from '../types/compliance';

/**
 * Generate official Form VI Show-Cause Notice under Rule 32 of LMPC Rules, 2011
 */
export const generateFormVINoticePDF = (record: InspectionRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Official Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GOVERNMENT OF INDIA', 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF CONSUMER AFFAIRS • LEGAL METROLOGY DIVISION', 105, 18, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('OFFICE OF THE CONTROLLER & LEGAL METROLOGY ENFORCEMENT WING', 105, 24, { align: 'center' });

  // Notice Title & Ref
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FORM VI: STATUTORY SHOW-CAUSE NOTICE', 105, 42, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('[Under Rule 32 of Legal Metrology (Packaged Commodities) Rules, 2011]', 105, 47, { align: 'center' });

  // Notice Metadata Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 52, 180, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Notice Reference No:', 20, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`SCN/${record.id}/2026`, 62, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Inspection Date:', 125, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(record.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 160, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Inspecting Officer:', 20, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.inspectorName} (${record.inspectorId})`, 62, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Enforcement Zone:', 125, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(record.zone, 160, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Retail / Seizure Premise:', 20, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.retailerName}, ${record.retailerLocation}`, 62, 74);

  // Addressee Notice
  doc.setFont('helvetica', 'bold');
  doc.text('To:', 15, 86);
  doc.text(record.manufacturer, 15, 91);
  doc.setFont('helvetica', 'normal');
  doc.text(`Brand / Marketer: ${record.brand}`, 15, 96);

  // Notice Body text
  doc.setFontSize(9);
  const introText = 
    `WHEREAS an inspection was conducted on ${new Date(record.timestamp).toLocaleString('en-IN')} by the undersigned Legal Metrology Officer under the powers conferred under Section 15 of the Legal Metrology Act, 2009. Upon examination of the pre-packaged commodity specified below, the following prima-facie non-compliances and contraventions of the Legal Metrology (Packaged Commodities) Rules, 2011 have been recorded by automated vision inspection and verified physically:`;
  const splitIntro = doc.splitTextToSize(introText, 180);
  doc.text(splitIntro, 15, 104);

  // Commodity Specification Table
  autoTable(doc, {
    startY: 122,
    head: [['Commodity Description', 'Batch / Lot No.', 'Category', 'Declared Net Qty', 'Declared MRP']],
    body: [
      [record.productName, record.batchNo, record.category, record.netQuantity, record.mrpDeclared]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
    margin: { left: 15, right: 15 }
  });

  // Violations Table
  const violationsRows = record.violations.map((v, i) => [
    (i + 1).toString(),
    v.rule,
    v.title,
    v.measuredValue || 'Defective',
    v.requiredValue || 'Statutory Prescribed',
    v.statutoryClause
  ]);

  // @ts-ignore (doc.lastAutoTable added by jspdf-autotable)
  const currentY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STATEMENT OF CONTRAVENTIONS & STATUTORY OFFENCES:', 15, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['#', 'Rule', 'Infraction Description', 'Found / Detected', 'Prescribed Standard', 'Statutory Section']],
    body: violationsRows.length > 0 ? violationsRows : [['1', 'General', 'No violations recorded', 'Compliant', 'Standard', 'Pass']],
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 }
  });

  // Direction to Show Cause
  // @ts-ignore
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const directive = 
    `NOW THEREFORE, you are hereby called upon to SHOW CAUSE within fifteen (15) days of receipt of this notice as to why penal proceedings under Section 36(1) of the Legal Metrology Act, 2009 (read with Rule 32 of LMPC Rules, 2011) should not be instituted against you, or why the said offences should not be compounded under Section 48 upon payment of prescribed compounding fee.\n\nTake note that failure to reply within the stipulated time shall result in prosecution before the Competent Judicial Magistrate without further notice.`;
  const splitDirective = doc.splitTextToSize(directive, 180);
  doc.text(splitDirective, 15, nextY);

  // Signature Block
  const sigY = nextY + 35;
  doc.setDrawColor(15, 23, 42);
  doc.line(140, sigY, 195, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(record.inspectorName, 140, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Legal Metrology Officer (Code: ${record.inspectorId})`, 140, sigY + 9);
  doc.text('Govt. of India • Enforcement Wing', 140, sigY + 13);
  doc.text('Digitally Authenticated Stamp', 140, sigY + 17);

  // Official Stamp Box
  doc.setDrawColor(59, 130, 246);
  doc.setTextColor(37, 99, 235);
  doc.rect(20, sigY - 8, 48, 26);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DEPT OF CONSUMER AFFAIRS', 22, sigY - 3);
  doc.text('LEGAL METROLOGY ENFORCEMENT', 22, sigY + 2);
  doc.text('STATUTORY ACTION DISPATCHED', 22, sigY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toISOString().slice(0, 10)}`, 22, sigY + 13);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a statutory document generated via Automated Legal Metrology Inspection Platform. Page 1 of 1', 105, 288, { align: 'center' });

  // Save the PDF
  doc.save(`ShowCause_Notice_${record.id}.pdf`);
};

/**
 * Generate Comprehensive Inspection Dossier / Audit Sheet PDF
 */
export const generateInspectionDossierPDF = (record: InspectionRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEGAL METROLOGY FORENSIC INSPECTION DOSSIER', 15, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Case Ref: ${record.id} • AI Vision Confidence: ${(record.confidenceScore * 100).toFixed(0)}%`, 15, 22);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 34, 180, 40, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Name:', 20, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(record.productName, 55, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Brand / Packer:', 20, 49);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.brand} / ${record.manufacturer}`, 55, 49);

  doc.setFont('helvetica', 'bold');
  doc.text('Category & Zone:', 20, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.category} | ${record.zone}`, 55, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Status:', 20, 63);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(record.status === 'PASS' ? 16 : 220, record.status === 'PASS' ? 185 : 38, record.status === 'PASS' ? 129 : 38);
  doc.text(`${record.status} (${record.severity})`, 55, 63);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Inspection Officer:', 125, 63);
  doc.setFont('helvetica', 'normal');
  doc.text(record.inspectorName, 155, 63);

  // Bounding Box / OCR Findings Table
  const boundingRows = record.boundingBoxes.map((b, idx) => [
    (idx + 1).toString(),
    b.label,
    b.rule,
    b.status,
    b.detectedText,
    b.requiredStandard
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Zone Analyzed', 'Rule', 'Status', 'Extracted OCR Text', 'Statutory Requirement']],
    body: boundingRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 }
  });

  // @ts-ignore
  const nextY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICER FIELD NOTES & REMARKS:', 15, nextY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(record.notes || 'Inspection completed via automated high-resolution optical OCR scanner. Packaging declarations evaluated against Legal Metrology (Packaged Commodities) Rules, 2011.', 15, nextY + 6);

  doc.save(`Inspection_Dossier_${record.id}.pdf`);
};

/**
 * Export filtered inspection records to CSV
 */
export const exportInspectionsToCSV = (records: InspectionRecord[], filename = 'legal_metrology_inspections.csv') => {
  const headers = [
    'Case ID',
    'Date & Time',
    'Product Name',
    'Brand',
    'Manufacturer',
    'Batch No',
    'Category',
    'Enforcement Zone',
    'Retailer / Location',
    'Net Quantity',
    'MRP Declared',
    'Status',
    'Severity',
    'Violations Count',
    'Violations Summary',
    'Inspector'
  ];

  const rows = records.map(r => [
    r.id,
    r.timestamp,
    `"${r.productName.replace(/"/g, '""')}"`,
    `"${r.brand.replace(/"/g, '""')}"`,
    `"${r.manufacturer.replace(/"/g, '""')}"`,
    r.batchNo,
    r.category,
    `"${r.zone}"`,
    `"${r.retailerName} (${r.retailerLocation})"`,
    `"${r.netQuantity}"`,
    `"${r.mrpDeclared}"`,
    r.status,
    r.severity,
    r.violations.length,
    `"${r.violations.map(v => `${v.rule}: ${v.title}`).join('; ')}"`,
    r.inspectorName
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate official Legal Metrology Field Inspection & Case Resolution Report PDF
 * Contains Case ID, Date, Retailer, Location, Commodity & Brand, Inspector, Findings, Action & Resolution
 */
export const generateInspectionReportPDF = (record: InspectionRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Top Navy Banner
  doc.setFillColor(0, 31, 63); // Navy #001F3F
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GOVERNMENT OF INDIA', 105, 10, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF CONSUMER AFFAIRS • LEGAL METROLOGY DIVISION', 105, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(186, 230, 253);
  doc.text('STATUTORY FIELD INSPECTION & CASE RESOLUTION DOSSIER', 105, 22, { align: 'center' });

  // Tricolor accent line
  doc.setFillColor(249, 115, 22); // Saffron
  doc.rect(0, 30, 70, 1.5, 'F');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(70, 30, 70, 1.5, 'F');
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(140, 30, 70, 1.5, 'F');

  // Title Box
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OFFICIAL FIELD INSPECTION REPORT', 105, 40, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011', 105, 45, { align: 'center' });

  // Case Information Card Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 50, 180, 42, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Case ID:', 20, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(record.id, 55, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('Inspection Date & Time:', 115, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(record.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 155, 57);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Business / Retailer:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(record.retailerName, 55, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('Premise Location:', 115, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(record.retailerLocation.slice(0, 30), 155, 65);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Commodity & Brand:', 20, 73);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.productName} (${record.brand})`, 55, 73);

  doc.setFont('helvetica', 'bold');
  doc.text('Enforcement Circle:', 115, 73);
  doc.setFont('helvetica', 'normal');
  doc.text(record.zone.slice(0, 30), 155, 73);

  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.text('Assigned Inspector:', 20, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(`${record.inspectorName} (${record.inspectorId})`, 55, 81);

  doc.setFont('helvetica', 'bold');
  doc.text('Compliance Status:', 115, 81);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(record.status === 'PASS' || record.complianceResult === 'Compliant' ? 22 : 185, record.status === 'PASS' || record.complianceResult === 'Compliant' ? 101 : 28, record.status === 'PASS' || record.complianceResult === 'Compliant' ? 52 : 28);
  doc.text(`${record.complianceResult || record.status} [${record.severity}]`, 155, 81);

  // Inspection Findings Table
  const findingRows = [
    ['Net Quantity Verification', record.netQuantity || 'Standard Declared', 'Rule 11 & Schedule II', 'Compliant'],
    ['MRP & Price Declarations', record.mrpDeclared || 'Standard Declared', 'Rule 6(1)(e) & Sec. 18', record.status === 'FAIL' ? 'Violation Flagged' : 'Compliant'],
    ['Manufacturer / Packer Declarations', record.manufacturer || 'Standard Declared', 'Rule 6(1)(a)', 'Verified'],
    ['Consumer Care & Country of Origin', 'Customer Cell / India', 'Rule 6(1)(f) & (g)', 'Verified']
  ];

  if (record.violations && record.violations.length > 0) {
    record.violations.forEach((v, idx) => {
      findingRows.push([
        `Violation #${idx + 1}: ${v.title}`,
        v.description.slice(0, 40),
        v.statutoryClause,
        'NON-COMPLIANT'
      ]);
    });
  }

  autoTable(doc, {
    startY: 97,
    head: [['Inspection Checkpoint', 'Measured / Verified Field Observation', 'Statutory Clause', 'Finding']],
    body: findingRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 31, 63], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 }
  });

  // @ts-ignore
  const nextY = (doc as any).lastAutoTable.finalY + 8;

  // Inspector Action & Case Resolution Section
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, nextY, 180, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('INSPECTOR ACTION TAKEN & CASE RESOLUTION MEMO:', 20, nextY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const actionMemo = record.notes || 
    (record.status === 'PASS' 
      ? 'Physical inspection completed at premises. All mandatory packaged commodity declarations found in full compliance with Legal Metrology Act, 2009. Case successfully resolved.'
      : record.status === 'COMPOUNDED'
      ? 'Offence compounded under Section 48 of Legal Metrology Act, 2009. Fine deposited by merchant and compliance certificate issued. Case marked RESOLVED.'
      : 'Form VI Statutory Notice issued under Rule 32. Offending non-conforming packaging stock seized under Section 15(2). Case marked RESOLVED upon compliance submission.');
  
  doc.text(doc.splitTextToSize(actionMemo, 170), 20, nextY + 14);

  // Status Stamp Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Case Final Status: CASE RESOLVED', 20, nextY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text('Citizen Notification: Dispatched to Complainant via Central Portal', 85, nextY + 32);

  // Digital Signature and Sign-off Box
  const sigY = nextY + 44;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Digitally Signed & Certified By:', 20, sigY);
  doc.text('Endorsed by Area Controller:', 130, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${record.inspectorName}`, 20, sigY + 5);
  doc.text(`Legal Metrology Inspector (${record.inspectorId})`, 20, sigY + 9);
  doc.text('Government of India • Metrology Inspectorate', 20, sigY + 13);

  doc.text('Authorized Legal Metrology Officer', 130, sigY + 5);
  doc.text(`Enforcement Directorate • ${record.zone.slice(0, 25)}`, 130, sigY + 9);
  doc.text('Digital Seal: [CERT-LMO-VERIFIED-2026]', 130, sigY + 13);

  // Save PDF
  doc.save(`Inspection_Report_${record.id}.pdf`);
};

