# ========== YOUR COMPANY DATA ==========
USER_DATA = {
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
}

# ========== COMPETITOR DATA (Lazada Format) ==========
MOCK_COMPETITOR_DATA = [{
    "platform": "Lazada",
    "search_keyword": "electric drill",
    "products": [
        {
            "title": "Bosch GSB 13 RE Professional Impact Drill 600W",
            "brand": "Bosch",
            "price": "219.00",
            "ori_price": "269.00",
            "discount": "19%",
            "sold": "3.1k",
            "in_stock": True
        },
        {
            "title": "Makita HP1631 Impact Drill 710W Variable Speed",
            "brand": "Makita",
            "price": "175.00",
            "ori_price": "210.00",
            "discount": "17%",
            "sold": "1.8k",
            "in_stock": True
        },
        {
            "title": "DeWalt DWD024 Electric Drill 550W Keyless Chuck",
            "brand": "DeWalt",
            "price": "249.00",
            "ori_price": "",
            "discount": "",
            "sold": "420",
            "in_stock": True
        },
        {
            "title": "Ingco ID5508 Impact Drill 550W 13mm Variable Speed",
            "brand": "Ingco",
            "price": "89.00",
            "ori_price": "120.00",
            "discount": "26%",
            "sold": "6.2k",
            "in_stock": True
        },
        {
            "title": "Stanley SBH600 Hammer Drill 600W with Carry Case",
            "brand": "Stanley",
            "price": "159.00",
            "ori_price": "199.00",
            "discount": "20%",
            "sold": "980",
            "in_stock": False
        }
    ]
}]

# ========== PROMPT ==========
def prompt_with_data(user_data, competitor_data) -> str:
    return f"""
You are an AI pricing strategist for a Malaysian e-commerce business selling on Lazada.

=== YOUR PRODUCT (Current Position) ===
{user_data}

=== COMPETITOR DATA FROM LAZADA ===
{competitor_data}

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
