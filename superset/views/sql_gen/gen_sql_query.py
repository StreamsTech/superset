import os
from google import genai
from superset import app

import logging
config = app.config

from superset.views.sql_gen.schema import extract_table_names,filter_schemas_by_table_names


def get_query_prompt(tableNames, allSchema, query_description, is_double_quoted_table_name=False, table_alias='', column_alias=''):

    filteredSchema=filter_schemas_by_table_names(tableNames, allSchema)
    doubleQuotedTableName =''
    if is_double_quoted_table_name:
        doubleQuotedTableName = 'keep the table names like "tableName"' 
    
    prompt = f"""
    Given this database schema:
    ```
    {filteredSchema}
    ```

    {table_alias}

    {column_alias}

    Generate a SQL query for postgresql that:
    {query_description}
    
    please do not add such a table name or column name in your query that not match with the given database schema.
    That will raise fatal error once I run this query.

    If you can't match any table name from the given schema, return - You query description is not sufficient to make a valid query.

    {doubleQuotedTableName}
    Please provide only the SQL query without any explanations.
    """
    return prompt

def get_table_name_prompt(schemaStr, query_description, table_alias=''):
    tableNames = extract_table_names(schemaStr or "")
    prompt = f"""
    Given this database table names with description([tableName] - [description]):
    ```
    {tableNames}
    ```
    
    {table_alias}
    
    Find expected table names that:
    {query_description}

    please only consider the given table names. Do not add any additional table names in your response.
    
    Please provide only the comma separated table names without any explanations.
    """
    return prompt
def generate_sql_query(schema, query_description, is_double_quoted_table_name=False, table_alias='', column_alias=''):
    """
    Uses Gemini to generate a SQL query based on a schema and description.
    
    Args:
        schema (str): The database schema description
        query_description (str): What the query should do
        table_alias (str): Sample example below there:
          please consider the table alias:
          orders as o1,o2,o3
          products as p1,p2,p3
        column_alias (str): Sample example below there:
          please consider the table.column alias:
          orders.status as s1,s2,s3
          orders.total_amount as t1,t2,t3
    
        
    Returns:
        str: The generated SQL query
    """
    # Initialize the Anthropic client
    client = genai.Client(api_key=config["GEMINI_API_KEY"])
    #client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    
    prompt =get_table_name_prompt(schema, query_description, table_alias=table_alias)

    logging.info('Expected table prompt')
    logging.info(prompt)
    # Generate the expected table names
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents=prompt
    )
        
    logging.info(f'table names: {response.text}')

    prompt = get_query_prompt(response.text, schema, query_description, is_double_quoted_table_name,table_alias=table_alias, column_alias=column_alias)
    
    logging.info('Query prompt')
    logging.info(prompt)
    # Generate the SQL query
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents=prompt
    )
    logging.info(response.text)
    # Extract and return the SQL query
    return response.text.replace('```sql','').replace('```','')

