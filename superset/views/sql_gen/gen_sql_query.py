import os
from google import genai
from superset import app
config = app.config

def generate_sql_query(schema: str, query_description: str) -> str:
    """
    Generates a SQL query using Gemini based on the schema and natural language description.

    Args:
        schema (str): The database schema description.
        query_description (str): The description of what the query should do.

    Returns:
        str: The generated SQL query.
    """
    # Retrieve the Gemini API key from environment variable
    api_key =config["GEMINI_API_KEY"]
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    # Initialize the Gemini client
    client = genai.Client(api_key=api_key)

    # Construct the prompt
    prompt = f"""
    Given this database schema:
    ```
    {schema}
    ```

    Generate a SQL query that:
    {query_description}

    Please return only the SQL query without any explanations.
    """

    # Generate the SQL using Gemini model
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    # Clean and return the raw SQL from the response
    return response.text.replace("```sql", "").replace("```", "").strip()
