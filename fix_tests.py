with open("/Users/om_k/Downloads/ML_Project/scripts/rule_engine/test_engine.py", "r") as f:
    content = f.read()

content = content.replace('result["status"]', 'result["overall_status"]')
content = content.replace('result["violations"]', 'result["findings"]')
content = content.replace('result["passed_checks"]', 'result["findings"]')

with open("/Users/om_k/Downloads/ML_Project/scripts/rule_engine/test_engine.py", "w") as f:
    f.write(content)
print("Fixed test script field names")
