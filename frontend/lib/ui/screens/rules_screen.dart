import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/legal_rule_model.dart';
import '../../data/rules/legal_metrology_rules_data.dart';

/// Screen: Legal Metrology Act & PCR 2011 Rules Documentation
/// Provides field officers with on-demand access to statutory regulations,
/// minimum font height tables, packaging standards, and penal provisions.
class RulesScreen extends StatefulWidget {
  const RulesScreen({super.key});

  @override
  State<RulesScreen> createState() => _RulesScreenState();
}

class _RulesScreenState extends State<RulesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All Rules';
  final Set<String> _expandedRules = {'Rule 9(1) & Table-I'}; // Default expand font size table

  List<LegalRuleModel> get _filteredRules {
    final query = _searchController.text.trim().toLowerCase();

    return LegalMetrologyRulesData.allRules.where((rule) {
      final matchesCategory = _selectedCategory == 'All Rules' || rule.category == _selectedCategory;
      if (!matchesCategory) return false;

      if (query.isEmpty) return true;

      final matchesText = rule.ruleNumber.toLowerCase().contains(query) ||
          rule.title.toLowerCase().contains(query) ||
          rule.summary.toLowerCase().contains(query) ||
          rule.statutoryClause.toLowerCase().contains(query) ||
          rule.fieldOfficerNotes.toLowerCase().contains(query) ||
          rule.tags.any((t) => t.toLowerCase().contains(query));

      return matchesText;
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleExpansion(String ruleNumber) {
    setState(() {
      if (_expandedRules.contains(ruleNumber)) {
        _expandedRules.remove(ruleNumber);
      } else {
        _expandedRules.add(ruleNumber);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final rules = _filteredRules;

    return Scaffold(
      backgroundColor: AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Legal Metrology Rules & Act',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            Text(
              'Statutory Provisions • PCR, 2011 & Act, 2009',
              style: TextStyle(
                fontSize: 11,
                color: Color(0xFFCBD5E1),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            children: [
              // Government Act Reference Banner
              _buildOfficialGazetteHeader(),
              const SizedBox(height: 16),

              // Search Bar
              _buildSearchBar(),
              const SizedBox(height: 14),

              // Category Filter Scrollbar
              _buildCategorySelector(),
              const SizedBox(height: 16),

              // Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Statutory Clauses (${rules.length})',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  Text(
                    _selectedCategory,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryBlue,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Rule Cards
              if (rules.isEmpty)
                _buildEmptyState()
              else
                ...rules.map((rule) => _buildRuleCard(rule)),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOfficialGazetteHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.accentGold.withAlpha(90), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppTheme.accentGold.withAlpha(20),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: AppTheme.primaryNavy,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.gavel_rounded, color: AppTheme.accentGold, size: 24),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Standard Weights & Measures Enforcement',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryNavy,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Authoritative reference for field inspections under The Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchController,
      onChanged: (_) => setState(() {}),
      decoration: InputDecoration(
        hintText: 'Search rule number, font size, MRP, penalty...',
        prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.primaryBlue),
        suffixIcon: _searchController.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear_rounded, color: AppTheme.textSecondary, size: 20),
                onPressed: () {
                  _searchController.clear();
                  setState(() {});
                },
              )
            : null,
      ),
    );
  }

  Widget _buildCategorySelector() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: LegalMetrologyRulesData.categories.map((category) {
          final isSelected = _selectedCategory == category;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(category),
              selected: isSelected,
              showCheckmark: false,
              selectedColor: AppTheme.primaryNavy,
              backgroundColor: Colors.white,
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppTheme.textPrimary,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: isSelected ? AppTheme.primaryNavy : AppTheme.borderLight,
                  width: 1.2,
                ),
              ),
              onSelected: (_) {
                setState(() => _selectedCategory = category);
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildRuleCard(LegalRuleModel rule) {
    final isExpanded = _expandedRules.contains(rule.ruleNumber);

    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isExpanded ? AppTheme.primaryNavy.withAlpha(120) : AppTheme.borderLight,
          width: 1.2,
        ),
      ),
      child: InkWell(
        onTap: () => _toggleExpansion(rule.ruleNumber),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row: Rule Number Badge + Category
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryNavy,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      rule.ruleNumber,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceLight,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: Text(
                        rule.category,
                        style: const TextStyle(
                          color: AppTheme.primaryBlue,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Icon(
                    isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                    color: AppTheme.textSecondary,
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Title
              Text(
                rule.title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 6),

              // Short Summary
              Text(
                rule.summary,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textSecondary,
                  height: 1.4,
                ),
              ),

              // Expanded Statutory & Enforcement Details
              if (isExpanded) ...[
                const SizedBox(height: 14),
                const Divider(height: 1, color: AppTheme.borderLight),
                const SizedBox(height: 14),

                // 1. Statutory Clause Section
                _buildSectionHeader(Icons.menu_book_rounded, 'Statutory Provision'),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: Text(
                    rule.statutoryClause,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textPrimary,
                      height: 1.45,
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // 2. Extra Data: Font Size Table (if present)
                if (rule.extraData != null && rule.extraData!['tableType'] == 'fontSizeTable') ...[
                  _buildSectionHeader(Icons.table_chart_rounded, 'Mandatory Font Height Schedule (Table-I)'),
                  const SizedBox(height: 8),
                  _buildFontSizeTable(rule.extraData!['rows'] as List),
                  const SizedBox(height: 14),
                ],

                // 3. Field Officer Enforcement Notes
                _buildSectionHeader(Icons.checklist_rounded, 'Field Officer Inspection Protocol'),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.passGreen.withAlpha(60)),
                  ),
                  child: Text(
                    rule.fieldOfficerNotes,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF166534),
                      height: 1.4,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // 4. Penalty Clause Banner
                if (rule.penaltyClause != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.violationBackground,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.violationRed.withAlpha(80)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: AppTheme.violationRed, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Penalty: ${rule.penaltyClause}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: AppTheme.violationText,
                              fontWeight: FontWeight.w600,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.primaryNavy),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppTheme.primaryNavy,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFontSizeTable(List rows) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.borderLight),
      ),
      clipBehavior: Clip.antiAlias,
      child: Table(
        border: TableBorder.all(color: AppTheme.borderLight, width: 1),
        columnWidths: const {
          0: FlexColumnWidth(4),
          1: FlexColumnWidth(3),
          2: FlexColumnWidth(3),
        },
        children: [
          // Table Header
          TableRow(
            decoration: const BoxDecoration(color: AppTheme.primaryNavy),
            children: const [
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(
                  'Area of PDP (A)',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(
                  'Normal Case',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(
                  'Blown / Moulded',
                  style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          // Table Rows
          ...rows.map((row) {
            final map = row as Map<String, dynamic>;
            return TableRow(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Text(map['area'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Text(map['normal'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Text(map['blown'] as String, style: const TextStyle(fontSize: 11)),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(36),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.rule_folder_outlined, size: 48, color: AppTheme.textSecondary),
          const SizedBox(height: 12),
          const Text(
            'No matching statutory rules found',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try searching for terms like "font", "MRP", "penalties", or "quantity".',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () {
              _searchController.clear();
              setState(() => _selectedCategory = 'All Rules');
            },
            child: const Text('Reset Search'),
          ),
        ],
      ),
    );
  }
}
