import os
import psycopg2


def get_postgres_schema(connection_string, schema_name='public'):
    """
    Extract table information and relationships from PostgreSQL database.
    
    Args:
        connection_string (str): PostgreSQL connection string in format:
            "postgresql://username:password@host:port/database"
        schema_name (str): Schema name to extract information from (default: 'public')
        
    Returns:
        str: Formatted string containing all tables with their columns and relationships
    """
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        
        # Dictionary to store table information
        tables = {}
        
        # Query to get all tables in the specified schema
        cursor.execute(f"""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = %s 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """, (schema_name,))
        
        table_names = [row[0] for row in cursor.fetchall()]
        
        # For each table, get its columns information
        for table_name in table_names:
            # Get column information
            cursor.execute(f"""
                SELECT column_name, data_type, 
                    CASE WHEN character_maximum_length IS NOT NULL 
                         THEN data_type || '(' || character_maximum_length || ')'
                         ELSE data_type
                    END as full_data_type
                FROM information_schema.columns 
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
            """, (schema_name, table_name))
            
            columns = cursor.fetchall()
            tables[table_name] = {'columns': []}
            
            for column_data in columns:
                col_name, data_type, full_data_type = column_data
                # Convert data type to uppercase for consistency
                display_type = full_data_type.upper()
                tables[table_name]['columns'].append([col_name, display_type])
        
        # Get primary key constraints
        cursor.execute(f"""
            SELECT tc.table_name, kc.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kc
                ON tc.constraint_name = kc.constraint_name
                AND tc.table_schema = kc.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = %s
        """, (schema_name,))
        
        for table_name, column_name in cursor.fetchall():
            if table_name in tables:
                for i, column_info in enumerate(tables[table_name]['columns']):
                    if column_info[0] == column_name:
                        column_info.append('Primary Key')
                        tables[table_name]['columns'][i] = column_info
        
        # Get foreign key constraints
        cursor.execute(f"""
            SELECT 
                kcu1.table_name AS fk_table_name,
                kcu1.column_name AS fk_column_name,
                kcu2.table_name AS referenced_table_name,
                kcu2.column_name AS referenced_column_name
            FROM information_schema.referential_constraints AS rc
            JOIN information_schema.key_column_usage AS kcu1
                ON kcu1.constraint_catalog = rc.constraint_catalog
                AND kcu1.constraint_schema = rc.constraint_schema
                AND kcu1.constraint_name = rc.constraint_name
            JOIN information_schema.key_column_usage AS kcu2
                ON kcu2.constraint_catalog = rc.unique_constraint_catalog
                AND kcu2.constraint_schema = rc.unique_constraint_schema
                AND kcu2.constraint_name = rc.unique_constraint_name
                AND kcu2.ordinal_position = kcu1.ordinal_position
            WHERE rc.constraint_schema = %s
        """, (schema_name,))
        
        for fk_table, fk_column, ref_table, ref_column in cursor.fetchall():
            if fk_table in tables:
                for i, column_info in enumerate(tables[fk_table]['columns']):
                    if column_info[0] == fk_column:
                        column_info.append(f'Foreign Key to {ref_table}.{ref_column}')
                        tables[fk_table]['columns'][i] = column_info
        
        # Format the output
        output = []
        for table_name in sorted(tables.keys()):
            output.append(f"Table: {table_name}")
            for column_info in tables[table_name]['columns']:
                col_name = column_info[0]
                col_type = column_info[1]
                attributes = column_info[2:] if len(column_info) > 2 else []
                
                attr_str = ", ".join(attributes) if attributes else ""
                if attr_str:
                    output.append(f"        {col_name} ({col_type}, {attr_str})")
                else:
                    output.append(f"        {col_name} ({col_type})")
            output.append("")  # Empty line between tables
        
        cursor.close()
        conn.close()

        with open("schema.txt", "w") as f:
            f.write("\n".join(output))
        
         # Read file content and return
        with open("schema.txt", "r") as f:
            return f.read()
        
    except Exception as e:
        return f"Error: {str(e)}"


def get_schema(connection_string=None, schema_name="public"):
    """
    Returns the schema string, generating it from the database if not already cached.
    Looks for schema.txt in the same directory as this file.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    schema_file_path = os.path.join(base_dir, "schema.txt")

    if not os.path.exists(schema_file_path):
        if not connection_string:
            raise ValueError(
                "Connection string is required if schema.txt is not available."
            )
        return get_postgres_schema(connection_string, schema_name)

    with open(schema_file_path, "r") as file:
        return file.read()
    

def extract_table_names(schemas):
    """
    Extract table names from a schema string and return them as a comma-separated string.
    
    Args:
        schemas (str): A string containing schema definitions with table names following
                      the format "Table: table_name"
    
    Returns:
        str: Comma-separated list of table names
    """
    table_names = []
    
    # Split the schemas into lines
    lines = schemas.split('\n')
    
    # Look for lines starting with "Table: "
    for line in lines:
        line = line.strip()
        if line.lower().startswith('table:'):
            # Extract the table name (everything after "Table: ")
            table_name = line[6:].strip()
            table_names.append(table_name)
    
    # Join the table names with commas
    return ', '.join(table_names)



def filter_schemas_by_table_names(table_names_str, schemas):
    """
    Filter schemas to include only those that match the specified table names.
    
    Args:
        table_names_str (str): Comma-separated list of table names
        schemas (str): A string containing schema definitions
    
    Returns:
        str: Filtered schemas containing only the specified tables
    """
    # Convert comma-separated string to list and strip whitespace
    table_names = [name.strip() for name in table_names_str.split(',')]
    
    # Split the schemas into individual table definitions
    schema_lines = schemas.split('\n')
    
    filtered_schema = []
    include_current_table = False
    current_table_name = None
    
    for line in schema_lines:
        # Check if line defines a new table
        if line.strip().lower().startswith('table:'):
            # Extract the table name
            current_table_name = line.strip()[6:].strip()
            # Determine if this table should be included
            include_current_table = current_table_name in table_names
            
            # Add a newline before a new table definition (except for the first one)
            if include_current_table and filtered_schema and filtered_schema[-1].strip():
                filtered_schema.append("")
        
        # Include line if it belongs to a table we want to keep
        if include_current_table and line.strip():
            filtered_schema.append(line)
    
    # Join the lines back together
    return '\n'.join(filtered_schema)
