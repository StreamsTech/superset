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


def get_postgres_schema_with_description(connection_string, schema_name='public'):
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
                
        # Query to get all tables in the specified schema with descriptions
        cursor.execute(f"""
            SELECT t.table_name, obj_description(c.oid) as table_description
            FROM information_schema.tables t
            LEFT JOIN pg_class c ON c.relname = t.table_name
            LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE t.table_schema = %s 
            AND t.table_type = 'BASE TABLE'
            AND (n.nspname = %s OR n.nspname IS NULL)
            ORDER BY t.table_name
        """, (schema_name, schema_name))
        
        table_info = cursor.fetchall()
        
        # For each table, get its columns information with descriptions
        for table_name, table_description in table_info:
            # Get column information with descriptions
            cursor.execute(f"""
                SELECT 
                    c.column_name, 
                    c.data_type, 
                    CASE WHEN c.character_maximum_length IS NOT NULL 
                        THEN c.data_type || '(' || c.character_maximum_length || ')'
                        ELSE c.data_type
                    END as full_data_type,
                    col_description(pgc.oid, c.ordinal_position) as column_description
                FROM information_schema.columns c
                LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
                LEFT JOIN pg_namespace pgn ON pgn.oid = pgc.relnamespace
                WHERE c.table_schema = %s 
                AND c.table_name = %s
                AND (pgn.nspname = %s OR pgn.nspname IS NULL)
                ORDER BY c.ordinal_position
            """, (schema_name, table_name, schema_name))
            
            columns = cursor.fetchall()
            tables[table_name] = {
                'description': table_description,
                'columns': []
            }
            
            for column_data in columns:
                col_name, data_type, full_data_type, col_description = column_data
                # Convert data type to uppercase for consistency
                display_type = full_data_type.upper()
                tables[table_name]['columns'].append([
                    col_name, 
                    display_type, 
                    col_description
                ])
        
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
                        # Insert Primary Key before description
                        if len(column_info) == 3:  # col_name, type, description
                            column_info.insert(2, 'Primary Key')
                        else:
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
                        fk_constraint = f'Foreign Key to {ref_table}.{ref_column}'
                        # Insert FK constraint before description if it exists
                        if len(column_info) == 3:  # col_name, type, description
                            column_info.insert(2, fk_constraint)
                        elif len(column_info) == 4:  # col_name, type, PK, description
                            column_info.insert(3, fk_constraint)
                        else:
                            column_info.append(fk_constraint)
                        tables[table_name]['columns'][i] = column_info
        
        # Format the output
        output = []
        for table_name in sorted(tables.keys()):
            # Add table name and description
            if tables[table_name]['description']:
                output.append(f"Table: {table_name}")
                output.append(f"Description: {tables[table_name]['description']}")
            else:
                output.append(f"Table: {table_name}")
            
            # Add columns
            for column_info in tables[table_name]['columns']:
                col_name = column_info[0]
                col_type = column_info[1]
                
                # Handle different column_info structures
                attributes = []
                description = None
                
                # Extract attributes and description
                for item in column_info[2:]:
                    if item and (item.startswith('Primary Key') or item.startswith('Foreign Key')):
                        attributes.append(item)
                    elif item and not (item.startswith('Primary Key') or item.startswith('Foreign Key')):
                        description = item
                
                # Build the column line
                attr_str = ", ".join(attributes) if attributes else ""
                if attr_str and description:
                    output.append(f"        {col_name} ({col_type}, {attr_str}) - {description}")
                elif attr_str:
                    output.append(f"        {col_name} ({col_type}, {attr_str})")
                elif description:
                    output.append(f"        {col_name} ({col_type}) - {description}")
                else:
                    output.append(f"        {col_name} ({col_type})")
            
            output.append("")  # Empty line between tables
        
        # Write to file
        ##with open(fileName, "w") as f:
        ##    f.write("\n".join(output))
        ##with open("schema.txt", "w") as f:
        ##    f.write("\n".join(output))
        ##
        ## # Read file content and return
        ##with open("schema.txt", "r") as f:
        ##    return f.read()
        # Build schema content in memory and return as a string
        schema_table = "\n".join(output)
        return schema_table
        
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
    

def extract_table_names(schemas=""):
    """
    Extract table names from a schema string and return them as a comma-separated string.
    
    Args:
        schemas (str): A string containing schema definitions with table names following
                      the format "Table: table_name"
    
    Returns:
        str: Comma-separated list of table names
    """
    table_names = []
    if not schemas:
        return ""
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
    if not table_names_str:
       return ""
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
