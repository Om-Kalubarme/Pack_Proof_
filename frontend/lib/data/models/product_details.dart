/// Extracted commodity and packaging attributes parsed by OCR and inspection logic.
class ProductDetails {
  final String brandName;
  final String declaredNetQuantity;
  final String declaredMrp;
  final String unitSalePrice;
  final String batchMfgDate;
  final String manufacturerAddress;
  final String consumerCareDetails;
  final String countryOfOrigin;
  final String barcode;
  final String dietaryLogo;
  final String ingredients;
  final String nutritionFacts;
  final String warnings;
  final List<String> detectedViews;
  final List<String> unableToVerify;
  final List<String> ambiguousDetails;
  final List<Map<String, dynamic>> declarations;
  final List<String> allergens;

  const ProductDetails({
    required this.brandName,
    required this.declaredNetQuantity,
    required this.declaredMrp,
    required this.unitSalePrice,
    required this.batchMfgDate,
    required this.manufacturerAddress,
    required this.consumerCareDetails,
    this.countryOfOrigin = 'India',
    this.barcode = 'N/A',
    this.dietaryLogo = 'N/A',
    this.ingredients = 'N/A',
    this.nutritionFacts = 'N/A',
    this.warnings = 'N/A',
    this.detectedViews = const [],
    this.unableToVerify = const [],
    this.ambiguousDetails = const [],
    this.declarations = const [],
    this.allergens = const [],
  });

  Map<String, dynamic> toJson() => {
    'brandName': brandName,
    'declaredNetQuantity': declaredNetQuantity,
    'declaredMrp': declaredMrp,
    'unitSalePrice': unitSalePrice,
    'batchMfgDate': batchMfgDate,
    'manufacturerAddress': manufacturerAddress,
    'consumerCareDetails': consumerCareDetails,
    'countryOfOrigin': countryOfOrigin,
    'barcode': barcode,
    'dietaryLogo': dietaryLogo,
    'ingredients': ingredients,
    'nutritionFacts': nutritionFacts,
    'warnings': warnings,
    'detectedViews': detectedViews,
    'unableToVerify': unableToVerify,
    'ambiguousDetails': ambiguousDetails,
    'declarations': declarations,
    'allergens': allergens,
  };

  factory ProductDetails.fromJson(Map<String, dynamic> json) {
    return ProductDetails(
      brandName: json['brandName'] as String,
      declaredNetQuantity: json['declaredNetQuantity'] as String,
      declaredMrp: json['declaredMrp'] as String,
      unitSalePrice: json['unitSalePrice'] as String,
      batchMfgDate: json['batchMfgDate'] as String,
      manufacturerAddress: json['manufacturerAddress'] as String? ?? 'N/A',
      consumerCareDetails: json['consumerCareDetails'] as String? ?? 'N/A',
      countryOfOrigin: json['countryOfOrigin'] as String? ?? 'India',
      barcode: json['barcode'] as String? ?? 'N/A',
      dietaryLogo: json['dietaryLogo'] as String? ?? 'N/A',
      ingredients: json['ingredients'] as String? ?? 'N/A',
      nutritionFacts: json['nutritionFacts'] as String? ?? 'N/A',
      warnings: json['warnings'] as String? ?? 'N/A',
      detectedViews: (json['detectedViews'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      unableToVerify: (json['unableToVerify'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      ambiguousDetails: (json['ambiguousDetails'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      declarations: (json['declarations'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? const [],
      allergens: (json['allergens'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
    );
  }
}
