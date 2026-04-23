import json

# ========== YOUR COMPANY DATA ==========
USER_DATA = {
    "platform": "Lazada",
    "products": [{
        "product_name": "PowerCore 20K Pro",
        "brand": "VoltEdge",
        "description": "20000mAh power bank, dual USB-A, USB-C PD 20W, built-in Lightning and USB-C cables, LED display",
        "cost_per_unit": 28.50,
        "current_selling_price": 59.90,
        "current_profit_margin_percent": 52.4,
        "profit_per_unit": 31.40,
        "monthly_sales_volume": 85,
        "inventory_level": 210,
        "inventory_holding_cost_per_unit": 0.85
    }]
}

# ========== COMPETITOR DATA (Lazada Format) ==========
COMPETITOR_DATA = {
    "platform": "Lazada",
    "search_keyword": "20000mah power bank built in cable",
    "products": [
        {
            "title": "20000mAh Power Bank With Built in Cable USB C Fast Charging LED Display Portable Charger",
            "brand": "Remax",
            "price": "49.90",
            "ori_price": "89.90",
            "discount": "44%",
            "sold": "2.3k",
            "in_stock": True
        },
        {
            "title": "Baseus Adaman 20000mAh Power Bank 22.5W Fast Charge Built-in Cable Digital Display",
            "brand": "Baseus",
            "price": "89.00",
            "ori_price": "129.00",
            "discount": "31%",
            "sold": "892",
            "in_stock": True
        },
        {
            "title": "Proda 20000mAh PD 20W Power Bank Built In Type C Cable Powerbank Fast Charging",
            "brand": "Proda",
            "price": "39.90",
            "ori_price": "59.90",
            "discount": "33%",
            "sold": "5.1k",
            "in_stock": True
        },
        {
            "title": "VEGER 20000mAh Power Bank 22.5W Fast Charging Built-in Cable Digital Display External Battery",
            "brand": "VEGER",
            "price": "69.00",
            "ori_price": "",
            "discount": "",
            "sold": "156",
            "in_stock": True
        },
        {
            "title": "AUKEY 20000mAh Power Bank PD 20W + QC 3.0 with Built-in Lightning Cable for iPhone",
            "brand": "AUKEY",
            "price": "79.90",
            "ori_price": "99.90",
            "discount": "20%",
            "sold": "1.2k",
            "in_stock": False
        }
    ]
}

# ========== PROMPT ==========
def prompt_with_data(user_data, competitor_data) -> str:
    return f"""
You are an AI pricing strategist for a Malaysian e-commerce business selling on Lazada.

=== YOUR PRODUCT (Current Position) ===
{json.dumps(user_data, indent=2)}

=== COMPETITOR DATA FROM LAZADA ===
{json.dumps(competitor_data, indent=2)}

=== YOUR TASK ===
Analyze the competitive landscape and provide ONE specific pricing recommendation.

Answer these questions in order:

1. **Current Position Analysis**
   - Where does our product sit in the market right now (budget, mid-tier, premium)?
   - What is our key competitive advantage/disadvantage based on this data?

2. **The Critical Gap/Opportunity**
   - What is the most important insight from this competitor data?
   - Is there a supply gap, a pricing vacuum, or a psychological price point we're missing?

3. **Recommended Action**
   - Should we increase price, decrease price, or hold?
   - If change: What is the EXACT new price? Provide it in RM.
   - If hold: Why is holding optimal right now?

4. **"Can We Afford This?" Analysis**
   - At the recommended new price, what is our NEW profit margin percentage?
   - What is our NEW profit per unit?
   - How many ADDITIONAL units must we sell to maintain current monthly profit levels?
   - What is the maximum price drop we could sustain before hitting break-even on current volume?

5. Supply Gap Analysis: Is any competitor OUT OF STOCK at a key price point? If yes, how can we capture their orphaned demand?

6. **Execution Strategy**
   - What should we change in our Lazada listing (title, image, description) to support this price?
   - What promotion or campaign would maximize this opportunity?

Be specific. Reference actual numbers from the data. Avoid generic advice.
"""
