import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для получения списка подтвердивших гостей на свадьбу"""
    
    method = event.get('httpMethod', 'GET')
    
    # CORS headers для всех ответов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        select_query = f"""
            SELECT id, name, guests, alcohol, comment, created_at
            FROM {schema}.wedding_guests
            ORDER BY created_at DESC
        """
        cur.execute(select_query)
        
        rows = cur.fetchall()
        
        guests = []
        total_guests = 0
        
        for row in rows:
            guest = {
                'id': row[0],
                'name': row[1],
                'guests': row[2],
                'alcohol': row[3],
                'comment': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            }
            guests.append(guest)
            total_guests += row[2]
        
        cur.close()
        conn.close()
        
        response_data = {
            'success': True,
            'guests': guests,
            'total_responses': len(guests),
            'total_guests': total_guests
        }
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps(response_data),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
