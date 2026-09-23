import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/inspection_report.dart';

class PdfFormService {
  PdfFormService._();

  static Future<String> savePdfToFile(
    InspectionReport report, {
    required String formType,
    required String officerName,
    required String businessName,
  }) async {
    final pdfBytes = await generateFormPdf(report, formType: formType);
    final outputDir = await getApplicationDocumentsDirectory();
    final sanitizedBusiness = businessName.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_').toLowerCase();
    final typeName = formType == 'Form A' ? 'form_a' : 'form_b';
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final file = File('${outputDir.path}/statutory_${typeName}_${sanitizedBusiness}_$timestamp.pdf');
    await file.writeAsBytes(pdfBytes);
    return file.path;
  }

  static Future<Uint8List> generateFormPdf(
    InspectionReport report, {
    required String formType,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            _buildHeader(formType),
            pw.SizedBox(height: 10),
            _buildTable(report, formType),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildHeader(String formType) {
    final isFormA = formType == 'Form A';
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Text('THE SEVENTH SCHEDULE', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
        pw.Text(isFormA ? 'Form A' : 'Form B', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
        pw.Text(
          isFormA ? 'Weight Checking – Data Sheet' : 'Volume/Length Checking – Data Sheet',
          style: const pw.TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  static pw.Widget _buildTable(InspectionReport report, String formType) {
    final isFormA = formType == 'Form A';
    final p = report.productDetails;
    
    return pw.Table(
      border: pw.TableBorder.all(width: 1),
      children: [
        // Section A
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('A', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                  pw.Text('Particulars of Package', style: const pw.TextStyle(fontSize: 10)),
                ]
              )
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('Name of Manufacturer/ Packer', style: const pw.TextStyle(fontSize: 10)),
                  pw.Text(p.manufacturerAddress, style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Address: ${p.manufacturerAddress}', style: const pw.TextStyle(fontSize: 8)),
                      pw.Text('Price: ${p.declaredMrp}', style: const pw.TextStyle(fontSize: 8)),
                      pw.Text('Month/Year: ${p.batchMfgDate}', style: const pw.TextStyle(fontSize: 8)),
                    ]
                  )
                ]
              )
            ),
          ]
        ),
        
        // Section B
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('B', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                  pw.Text('Commodity Classification', style: const pw.TextStyle(fontSize: 10)),
                ]
              )
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Lot Size: 100', style: const pw.TextStyle(fontSize: 10)),
                      pw.Text('Sample Size: 10', style: const pw.TextStyle(fontSize: 10)),
                    ]
                  ),
                  pw.Text('Schedule First/ Second', style: const pw.TextStyle(fontSize: 10)),
                  pw.Text('Class A / B', style: const pw.TextStyle(fontSize: 10)),
                  pw.Text('Maximum permissible error in percentage: 2%', style: const pw.TextStyle(fontSize: 10)),
                ]
              )
            ),
          ]
        ),

        // Section C header
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Text('C', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
            ),
            pw.Table(
              children: [
                pw.TableRow(
                  children: [
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('Sample No.', style: const pw.TextStyle(fontSize: 8))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('Gross Wt', style: const pw.TextStyle(fontSize: 8))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('Tare Wt', style: const pw.TextStyle(fontSize: 8))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text(isFormA ? 'Net Wt' : 'Net Vol', style: const pw.TextStyle(fontSize: 8))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), child: pw.Text('Remarks', style: const pw.TextStyle(fontSize: 8))),
                  ]
                )
              ]
            )
          ]
        ),

        // Section C Data
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Text(isFormA ? 'Weight Checking Data' : 'Volume/ Length Checking Data', style: const pw.TextStyle(fontSize: 10)),
            ),
            pw.Table(
              children: [
                pw.TableRow(
                  children: [
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('1', style: const pw.TextStyle(fontSize: 10))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('205g', style: const pw.TextStyle(fontSize: 10))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('5g', style: const pw.TextStyle(fontSize: 10))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), decoration: const pw.BoxDecoration(border: pw.Border(right: pw.BorderSide(width: 1))), child: pw.Text('200g', style: const pw.TextStyle(fontSize: 10))),
                    pw.Container(padding: const pw.EdgeInsets.all(4), child: pw.Text('OK', style: const pw.TextStyle(fontSize: 10))),
                  ]
                )
              ]
            )
          ]
        ),
        
        // Section D
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('D', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                  pw.Text('Results', style: const pw.TextStyle(fontSize: 10)),
                ]
              )
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                children: [
                  pw.Text('Declared: ${p.declaredNetQuantity}', style: const pw.TextStyle(fontSize: 10)),
                  pw.Text('Avg: 200g', style: const pw.TextStyle(fontSize: 10)),
                ]
              )
            ),
          ]
        ),

        // Section E
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('E', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                  pw.Text('GENERAL COMMENTS WITH REGARD TO THE COMPLIANCE...', style: const pw.TextStyle(fontSize: 8)),
                ]
              )
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Text(report.isViolation ? 'Violation detected in package declarations.' : 'Sample is compliant with Legal Metrology rules.', style: const pw.TextStyle(fontSize: 10)),
            ),
          ]
        ),

        // Section F
        pw.TableRow(
          children: [
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Text('F', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
            ),
            pw.Padding(
              padding: const pw.EdgeInsets.all(4),
              child: pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Signature and name of authorized person', style: const pw.TextStyle(fontSize: 8)),
                        pw.SizedBox(height: 30),
                        pw.Text('Designation:', style: const pw.TextStyle(fontSize: 10)),
                        pw.Text('Name: ${report.officerName}', style: const pw.TextStyle(fontSize: 10)),
                      ]
                    )
                  ),
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Signature and name of manufacturer/packer', style: const pw.TextStyle(fontSize: 8)),
                        pw.SizedBox(height: 30),
                        pw.Text('Place: ${report.businessName}', style: const pw.TextStyle(fontSize: 10)),
                      ]
                    )
                  )
                ]
              )
            ),
          ]
        ),
      ]
    );
  }
}
