TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "send_email",
            "description": "Send Email to User, Along with A Generated Report File and Excel Spreadsheet",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_doc",
            "description": "Generate Document with a Professionally Curated Analysis Report for the Company. Give advice on inventory decisions based on current trends as a market and sales analyst.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contents": {
                        "type": "string",
                        "description": "Generated Report for Business Decisions",
                    }
                },
                "required": ["contents"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_excel",
            "description": 'Generate Spreadsheet based on recommended business steps from the provided contents. Provide the response in a json format. For example,[{"id":1,"name":"Alice Johnson","department":"Engineering","salary":85000,"start_date":"2021-03-15"},{"id":2,"name":"Bob Smith","department":"Marketing","salary":72000,"start_date":"2020-07-01"},{"id":3,"name":"Carol White","department":"Engineering","salary":91000,"start_date":"2019-11-20"}] ',
            "parameters": {
                "type": "object",
                "properties": {
                    "contents": {
                        "type": "string",
                        "description": "Generated Spreadsheet for Business Decisions",
                    }
                },
                "required": ["contents"],
            },
        },
    },
]
