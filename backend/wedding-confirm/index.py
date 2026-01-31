import json
import os
import base64
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API endpoint для подтверждения присутствия на свадьбе"""
    
    method = event.get('httpMethod', 'GET')
    
    # 1x1 прозрачный PNG
    png_pixel = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    if method != 'GET':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'image/png'},
            'body': base64.b64encode(png_pixel).decode('utf-8'),
            'isBase64Encoded': True
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        
        name = params.get('name', '').strip()
        guests = params.get('guests', '1')
        comment = params.get('comment', '').strip()
        alcohol = params.get('alcohol', '').strip()
        
        print(f"RSVP: name={name}, guests={guests}")
        
        if not name:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'image/png'},
                'body': base64.b64encode(png_pixel).decode('utf-8'),
                'isBase64Encoded': True
            }
        
        try:
            guests_count = int(guests)
            if guests_count < 1:
                guests_count = 1
        except:
            guests_count = 1
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        name_escaped = name.replace("'", "''")
        comment_escaped = comment.replace("'", "''") if comment else None
        alcohol_escaped = alcohol.replace("'", "''") if alcohol else None
        
        values = [
            f"'{name_escaped}'",
            str(guests_count),
            f"'{alcohol_escaped}'" if alcohol_escaped else 'NULL',
            f"'{comment_escaped}'" if comment_escaped else 'NULL'
        ]
        
        insert_query = f"""
            INSERT INTO {schema}.wedding_guests (name, guests, alcohol, comment)
            VALUES ({', '.join(values)})
        """
        
        cur.execute(insert_query)
        conn.commit()
        
        cur.close()
        conn.close()
        
        print(f"Saved: {name}, {guests_count} guests")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-cache'
            },
            'body': base64.b64encode(png_pixel).decode('utf-8'),
            'isBase64Encoded': True
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'image/png'},
            'body': base64.b64encode(png_pixel).decode('utf-8'),
            'isBase64Encoded': True
        }
