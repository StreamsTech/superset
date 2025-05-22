import os
import psycopg2


def get_postgres_schema(connection_string, schema_name="public"):
    """
    Extracts table and relationship info from PostgreSQL and writes to schema.txt.
    Returns the formatted schema as a string.
    """
    try:
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        tables = {}

        # Get all table names in the schema
        cursor.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = %s
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """,
            (schema_name,),
        )
        table_names = [row[0] for row in cursor.fetchall()]

        for table_name in table_names:
            cursor.execute(
                """
                SELECT column_name, data_type,
                    CASE WHEN character_maximum_length IS NOT NULL
                         THEN data_type || '(' || character_maximum_length || ')'
                         ELSE data_type
                    END as full_data_type
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
            """,
                (schema_name, table_name),
            )

            columns = cursor.fetchall()
            tables[table_name] = {"columns": []}
            for col_name, data_type, full_data_type in columns:
                display_type = full_data_type.upper()
                tables[table_name]["columns"].append([col_name, display_type])

        # Get primary keys
        cursor.execute(
            """
            SELECT tc.table_name, kc.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kc
                ON tc.constraint_name = kc.constraint_name
                AND tc.table_schema = kc.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = %s
        """,
            (schema_name,),
        )
        for table_name, column_name in cursor.fetchall():
            if table_name in tables:
                for i, col in enumerate(tables[table_name]["columns"]):
                    if col[0] == column_name:
                        col.append("Primary Key")
                        tables[table_name]["columns"][i] = col

        # Get foreign keys
        cursor.execute(
            """
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
        """,
            (schema_name,),
        )
        for fk_table, fk_column, ref_table, ref_column in cursor.fetchall():
            if fk_table in tables:
                for i, col in enumerate(tables[fk_table]["columns"]):
                    if col[0] == fk_column:
                        col.append(f"Foreign Key to {ref_table}.{ref_column}")
                        tables[fk_table]["columns"][i] = col

        # Format schema
        output = []
        for table_name in sorted(tables.keys()):
            output.append(f"Table: {table_name}")
            for col in tables[table_name]["columns"]:
                col_name, col_type = col[:2]
                attrs = ", ".join(col[2:]) if len(col) > 2 else ""
                if attrs:
                    output.append(f"    {col_name} ({col_type}, {attrs})")
                else:
                    output.append(f"    {col_name} ({col_type})")
            output.append("")  # Spacer

        formatted_schema = "\n".join(output)

        # Save to file
        schema_path = os.path.abspath("schema.txt")


        print(f"Schema will be saved at: {schema_path}")
        with open("schema.txt", "w") as f:
            f.write(formatted_schema)

        cursor.close()
        conn.close()

        return formatted_schema

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
