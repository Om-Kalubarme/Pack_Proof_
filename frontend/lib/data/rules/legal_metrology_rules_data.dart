import '../models/legal_rule_model.dart';

/// Comprehensive statutory repository for the Legal Metrology Act, 2009
/// and Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011).
///
/// Kept in a dedicated, isolated file for easy regulatory updates and field reference.
class LegalMetrologyRulesData {
  LegalMetrologyRulesData._();

  static const List<String> categories = [
    'All Rules',
    'Mandatory Declarations',
    'Font Sizes & PDP',
    'Pricing & MRP',
    'Standard Pack Sizes',
    'Penalties & Offences',
  ];

  static const List<LegalRuleModel> allRules = [
    LegalRuleModel(
      ruleNumber: 'Rule 6(1)',
      title: 'Mandatory Declarations on Pre-packaged Commodities',
      category: 'Mandatory Declarations',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Every pre-packaged commodity must display eight statutory declarations legibly and conspicuously on the Principal Display Panel.',
      statutoryClause:
          'Rule 6(1) provides that every package shall bear thereon or on a label securely affixed thereto, the following declarations:\n\n'
          '(a) The name and complete address of the manufacturer, or where manufacturer is not packer, name and address of manufacturer and packer;\n'
          '(b) The common or generic names of the commodity contained in the package;\n'
          '(c) The net quantity in terms of standard unit of weight or measure, or where commodity is sold by number, the number of commodity;\n'
          '(d) The month and year in which commodity is manufactured, pre-packed or imported;\n'
          '(da) Name, address, telephone number, email address of person or office for consumer grievance redressal;\n'
          '(e) The retail sale price of the package in standard format: "Maximum Retail Price ₹... (inclusive of all taxes)" or "MRP ₹... (incl. of all taxes)";\n'
          '(f) The Unit Sale Price (USP) in terms of standard metric denominations;\n'
          '(g) The country of origin or manufacture in case of imported packages.',
      fieldOfficerNotes:
          '• Verify that all 8 mandatory declarations are present on the principal display area.\n'
          '• Check that the consumer care telephone number and email ID are active and legible.\n'
          '• Verify that the manufacturer/packer address includes plot/street, city, state, and pin code.\n'
          '• If any declaration is omitted, flag under Rule 6(1) read with Section 36(2) of the Act.',
      penaltyClause: 'Section 36(2) of Legal Metrology Act, 2009: Fine up to ₹25,000 for first offence; seizure of non-compliant inventory.',
      tags: ['mandatory declarations', 'rule 6', 'mrp', 'manufacturer', 'consumer care', 'net quantity', 'country of origin'],
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 6(11)',
      title: 'Unit Sale Price (USP) Calculation & Display',
      category: 'Pricing & MRP',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Mandates declaration of unit sale price per gram, millilitre, kilogram, litre, or piece to allow consumers to compare price fairness.',
      statutoryClause:
          'The Unit Sale Price shall be displayed on every package as follows:\n\n'
          '1. Where net quantity is less than one kilogram, unit sale price shall be declared per gram (e.g. "₹0.45 / g").\n'
          '2. Where net quantity is one kilogram or more, unit sale price shall be declared per kilogram (e.g. "₹45.00 / kg").\n'
          '3. Where net quantity is less than one litre, unit sale price shall be declared per millilitre (e.g. "₹0.15 / ml").\n'
          '4. Where net quantity is one litre or more, unit sale price shall be declared per litre (e.g. "₹150.00 / L").\n'
          '5. Where commodity is sold by number or length, unit sale price shall be declared per piece or per metre.\n\n'
          'The font size of the Unit Sale Price shall not be less than the font size of the declared MRP.',
      fieldOfficerNotes:
          '• Calculate: Declared MRP ÷ Total Net Quantity in standard unit.\n'
          '• Check rounding: USP can be rounded off to two decimal places.\n'
          '• Ensure font size of USP is not smaller than half the size of MRP numeral.',
      penaltyClause: 'Violation of Rule 6(11) attracts compoundable penalty under Section 36(2) up to ₹25,000.',
      tags: ['unit sale price', 'usp', 'pricing', 'rule 6(11)', 'mrp calculation'],
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 9(1) & Table-I',
      title: 'Principal Display Panel & Minimum Font Height for Net Quantity',
      category: 'Font Sizes & PDP',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Defines mandatory minimum height of numerals and letters for net quantity declarations based on the surface area of the Principal Display Panel (PDP).',
      statutoryClause:
          'Rule 9 specifies that the height of any numeral and letter in the declaration of net quantity shall not be less than the minimum height specified in Table-I:\n\n'
          'TABLE-I: MINIMUM HEIGHT OF NUMERALS FOR NET QUANTITY\n'
          '--------------------------------------------------------------------\n'
          'Area of PDP (A)               | Normal Cases | Blown/Moulded/Perforated\n'
          '--------------------------------------------------------------------\n'
          '1. A ≤ 50 cm²                 |    1.0 mm    |         2.0 mm\n'
          '2. 50 cm² < A ≤ 100 cm²       |    1.5 mm    |         3.0 mm\n'
          '3. 100 cm² < A ≤ 500 cm²      |    2.5 mm    |         4.0 mm\n'
          '4. 500 cm² < A ≤ 1000 cm²     |    4.0 mm    |         6.0 mm\n'
          '5. A > 1000 cm²               |    6.0 mm    |         6.0 mm\n'
          '--------------------------------------------------------------------\n'
          'Note: For packages having net quantity greater than 1kg / 1L, numeral height shall not be less than 4.0mm.',
      fieldOfficerNotes:
          '• Measure PDP area: Width × Height for rectangular panels.\n'
          '• Use digital vernier calipers or optical graticule magnifier to measure font height.\n'
          '• Common Field Violation: 1L oil bottles often print 1.8mm instead of mandatory 4.0mm or 3.0mm.',
      penaltyClause: 'Non-compliant font size violates Rule 9(1), penalized under Section 36(1) of Act (Fine up to ₹25,000).',
      tags: ['font size', 'rule 9', 'table-i', 'principal display panel', 'pdp', 'height of numerals', 'net quantity height'],
      extraData: {
        'tableType': 'fontSizeTable',
        'rows': [
          {'area': 'A ≤ 50 cm²', 'normal': '1.0 mm', 'blown': '2.0 mm'},
          {'area': '50 cm² < A ≤ 100 cm²', 'normal': '1.5 mm', 'blown': '3.0 mm'},
          {'area': '100 cm² < A ≤ 500 cm²', 'normal': '2.5 mm', 'blown': '4.0 mm'},
          {'area': '500 cm² < A ≤ 1000 cm²', 'normal': '4.0 mm', 'blown': '6.0 mm'},
          {'area': 'A > 1000 cm²', 'normal': '6.0 mm', 'blown': '6.0 mm'},
        ],
      },
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 9(2) & Table-II',
      title: 'Minimum Font Height for Non-Quantity Declarations',
      category: 'Font Sizes & PDP',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Regulates the minimum height of lettering for manufacturer address, MRP, batch number, date of packing, and consumer care details.',
      statutoryClause:
          'Table-II specifies that all other mandatory declarations on packages (excluding net quantity) must adhere to minimum heights:\n\n'
          '1. Where area of PDP ≤ 100 cm²: Minimum height 1.0 mm.\n'
          '2. Where area of PDP is between 100 cm² and 500 cm²: Minimum height 1.5 mm.\n'
          '3. Where area of PDP > 500 cm²: Minimum height 2.0 mm.\n\n'
          'All letters and numerals must provide adequate visual contrast against the background packaging color.',
      fieldOfficerNotes:
          '• Ensure manufacturer address and MRP are readable without optical magnification.\n'
          '• Check for low-contrast print (e.g., light yellow text on white pouch background).',
      penaltyClause: 'Rule 9(2) breach penalized under Section 36(1).',
      tags: ['font size', 'table-ii', 'mrp font', 'contrast', 'readability'],
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 18(2)',
      title: 'Prohibition Against Dual MRP & Price Alteration',
      category: 'Pricing & MRP',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Strictly forbids charging above MRP, displaying dual MRP stickers, or smudging the originally declared price.',
      statutoryClause:
          'Rule 18(2) mandates:\n\n'
          '(a) No retail dealer or other person including manufacturer, packer, or importer shall alter, obliterate or smudge the retail sale price indicated on the package.\n'
          '(b) No person shall declare different maximum retail prices (dual pricing) on identical pre-packaged commodities sold at different locations (such as multiplexes, airports, railway stations, or premium restaurants) unless permitted by statutory notifications.\n'
          '(c) No person shall sell any pre-packaged commodity at a price higher than the declared retail sale price (MRP).',
      fieldOfficerNotes:
          '• Inspect for secondary price stickers pasted over original printed MRP.\n'
          '• Compare MRP across stock on the retail floor versus cash register barcode billing prices.\n'
          '• Seize packages displaying scratched or overprinted prices immediately as Form II evidence.',
      penaltyClause: 'Section 36(1) of Act: Fine up to ₹25,000 for first offence. Serious dual-pricing cases subject to police complaint under consumer protection laws.',
      tags: ['dual mrp', 'overcharging', 'sticker alteration', 'rule 18(2)', 'smudging mrp', 'airports', 'multiplex'],
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 5',
      title: 'Standard Packaging Quantities (Second Schedule)',
      category: 'Standard Pack Sizes',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Prescribes that specified essential food commodities (tea, biscuits, baby food, edible oils, atta, salt, rice) must only be packed in standard sizes.',
      statutoryClause:
          'Rule 5 read with Second Schedule specifies standard pack sizes for commodities intended for retail sale:\n\n'
          '• Edible Oils: 50ml, 100ml, 200ml, 500ml, 1L, 2L, 3L, 5L and multiples of 5L.\n'
          '• Tea & Coffee: 25g, 50g, 100g, 250g, 500g, 1kg and multiples of 1kg.\n'
          '• Rice & Wheat Flour (Atta): 100g, 200g, 500g, 1kg, 2kg, 5kg and multiples of 5kg.\n'
          '• Baby Milk Food: 200g, 400g, 500g, 1kg.\n\n'
          'Non-standard packs (e.g. selling 850ml as "1L bottle lookalike" to deceive consumers) constitute non-standard packaging.',
      fieldOfficerNotes:
          '• Check if the package volume matches statutory standard denominations.\n'
          '• Look out for "shrinkflation" where manufacturers reduce pack size from 100g to 83g without prominent notice.',
      penaltyClause: 'Section 36(1): Fine up to ₹25,000 for manufacturing or distributing non-standard package sizes.',
      tags: ['standard pack size', 'rule 5', 'second schedule', 'edible oil', 'atta', 'shrinkflation'],
    ),

    LegalRuleModel(
      ruleNumber: 'Section 36',
      title: 'Penalties for Non-Standard Packages & Declarations',
      category: 'Penalties & Offences',
      actOrRule: 'Legal Metrology Act, 2009 (Act No. 1 of 2010)',
      summary: 'Statutory penal framework prescribing fines and imprisonment for manufacturing, packing, importing, or selling non-compliant packages.',
      statutoryClause:
          'Section 36 of the Legal Metrology Act, 2009:\n\n'
          '(1) Whoever manufactures, packs, imports, sells, distributes, delivers or stores any pre-packaged commodity which does not conform to the standards of weight, measure or number specified in this Act or rules, shall be punished with fine which may extend to twenty-five thousand rupees, for the second offence, with fine which may extend to fifty thousand rupees and for the subsequent offence, with fine which may extend to one lakh rupees or with imprisonment for a term which may extend to one year or with both.\n\n'
          '(2) Whoever manufactures, packs, imports, sells, distributes any non-standard package without mandatory declarations shall be liable to fine up to twenty-five thousand rupees.',
      fieldOfficerNotes:
          '• Maintain accurate Inspection Memo (Form II) with officer badge and case ID.\n'
          '• For repeat offenders, check department central database for prior notices to invoke second offence clause (₹50,000 fine).\n'
          '• Note dealer counter number and GSTIN on notice.',
      penaltyClause: '1st Offence: ₹25,000 | 2nd Offence: ₹50,000 | Subsequent: ₹1,00,000 and/or 1 year imprisonment.',
      tags: ['penalty', 'section 36', 'fine', 'imprisonment', 'first offence', 'second offence', 'seizure'],
    ),

    LegalRuleModel(
      ruleNumber: 'Rule 24 & Rule 2(h)',
      title: 'Principal Display Panel (PDP) Definition & Area Calculation',
      category: 'Font Sizes & PDP',
      actOrRule: 'Legal Metrology (Packaged Commodities) Rules, 2011',
      summary: 'Formula for computing the total surface area of the Principal Display Panel to determine font size eligibility.',
      statutoryClause:
          'Rule 24 defines the Principal Display Panel (PDP) as that part of the package which is intended or likely to be displayed, presented, or shown to the consumer under normal sales conditions:\n\n'
          '• In the case of a rectangular package: Total area of one entire side or face (Height × Width).\n'
          '• In the case of a cylindrical package: 40 percent of the product of the height and circumference of the container.\n'
          '• In the case of any package of any other shape: 20 percent of the total surface area of the package.\n\n'
          'No declaration shall be printed in a manner that requires opening the seal or unfolding the package to be read.',
      fieldOfficerNotes:
          '• Cylindrical bottles/cans formula: PDP Area = 0.40 × Height × (2 × π × Radius).\n'
          '• All mandatory declarations must be grouped on this designated PDP surface.',
      penaltyClause: 'Incorrect PDP placement violates Rule 24 and Rule 6.',
      tags: ['pdp area', 'rule 24', 'cylindrical package', 'rectangular package', 'formula'],
    ),
  ];
}
