import os
from google import genai
from superset import app

import logging
config = app.config

from superset.views.sql_gen.schema import extract_table_names,filter_schemas_by_table_names

def get_query_prompt(tableNames, allSchema, query_description, is_double_quoted_table_name=False):

    filteredSchema=filter_schemas_by_table_names(tableNames, allSchema)
    doubleQuotedTableName =''
    if is_double_quoted_table_name:
        doubleQuotedTableName = 'keep the table names like "tableName"' 
    
    prompt = f"""
    Given this database schema:
    ```
    {filteredSchema}
    ```
    
    Generate a SQL query for postgresql that:
    {query_description}
    
    {doubleQuotedTableName}
    Please provide only the SQL query without any explanations.
    """
    return prompt

def get_table_name_prompt(schemaStr, query_description):
    tableNames = extract_table_names(schemaStr)
    prompt = f"""
    Given this database table names:
    {tableNames}
    
    
    Find expected table names that:
    {query_description}
    
    Please provide only the comma separated table names without any explanations.
    """
    return prompt

def generate_sql_query(schema, query_description, is_double_quoted_table_name=False):
    """
    Uses Gemini to generate a SQL query based on a schema and description.
    
    Args:
        schema (str): The database schema description
        query_description (str): What the query should do
    
    Returns:
        str: The generated SQL query
    """
    # Initialize the Anthropic client
    client = genai.Client(api_key=config["GEMINI_API_KEY"])
    #client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    
    prompt =get_table_name_prompt(schema, query_description)

    logging.info('Expected table prompt')
    logging.info(prompt)
    # Generate the expected table names
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents=prompt
    )

    prompt = get_query_prompt(response.text, schema, query_description, is_double_quoted_table_name)
    
    logging.info('Query prompt')
    logging.info(prompt)
    # Generate the SQL query
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents=prompt
    )
    logging.info(response.text)
    # Extract and return the SQL query
    return response.text.replace('```sql','').replace('```','')

