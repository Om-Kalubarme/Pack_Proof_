def calculate_mpe(declared_quantity: float, unit: str) -> float:
    """
    Calculates Maximum Permissible Error (MPE) according to First Schedule.
    Weight/Volume (g/ml):
    up to 50 -> 9%
    50 to 100 -> 4.5 g/ml
    100 to 200 -> 4.5%
    200 to 300 -> 9 g/ml
    300 to 500 -> 3%
    500 to 1000 -> 15 g/ml
    1000 to 10000 -> 1.5%
    10000 to 15000 -> 150 g/ml
    > 15000 -> 1%
    """
    unit = unit.lower().strip()
    
    # Weight / Volume
    if unit in ['g', 'ml', 'gram', 'milliliter', 'grams', 'ml.', 'g.']:
        if declared_quantity <= 50:
            mpe = declared_quantity * 0.09
        elif declared_quantity <= 100:
            mpe = 4.5
        elif declared_quantity <= 200:
            mpe = declared_quantity * 0.045
        elif declared_quantity <= 300:
            mpe = 9.0
        elif declared_quantity <= 500:
            mpe = declared_quantity * 0.03
        elif declared_quantity <= 1000:
            mpe = 15.0
        elif declared_quantity <= 10000:
            mpe = declared_quantity * 0.015
        elif declared_quantity <= 15000:
            mpe = 150.0
        else:
            mpe = declared_quantity * 0.01
            
        # Rounding rule:
        # <= 1000 g/ml -> percentage MPE rounded to nearest 0.1
        # > 1000 g/ml -> percentage MPE rounded to next whole number (ceil)
        import math
        if declared_quantity <= 1000:
            if mpe != 4.5 and mpe != 9.0 and mpe != 15.0: # If it was a percentage calc
                mpe = round(mpe, 1)
        else:
            if mpe != 150.0:
                mpe = math.ceil(mpe)
        return mpe
        
    elif unit in ['kg', 'l', 'liter', 'litre', 'kilogram', 'kgs', 'kg.', 'l.']:
        # Convert to g/ml
        g_qty = declared_quantity * 1000
        mpe_g = calculate_mpe(g_qty, 'g')
        return mpe_g / 1000.0
        
    # Length
    elif unit in ['m', 'meter', 'metre', 'meters', 'm.']:
        if declared_quantity <= 10:
            return declared_quantity * 0.02
        return declared_quantity * 0.01
        
    # Area
    elif unit in ['sq m', 'm2', 'sq meter', 'square meter']:
        if declared_quantity <= 10:
            return declared_quantity * 0.04
        return declared_quantity * 0.01
        
    # Number
    elif unit in ['n', 'u', 'pcs', 'piece', 'pieces', 'unit', 'units', 'nos', 'number']:
        return declared_quantity * 0.02
        
    # Unknown
    return 0.0
