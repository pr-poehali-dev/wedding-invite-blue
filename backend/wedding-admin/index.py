import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для получения списка гостей из базы данных"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        query = f"""
            SELECT id, name, guests, alcohol, comment, created_at
            FROM {schema}.wedding_guests
            ORDER BY created_at DESC
        """
        cur.execute(query)
        
        rows = cur.fetchall()
        
        guests_list = []
        total_guests = 0
        
        for row in rows:
            guest_data = {
                'id': row[0],
                'name': row[1],
                'guests': row[2],
                'alcohol': row[3],
                'comment': row[4],
                'created_at': row[5].isoformat() if row[5] else None
            }
            guests_list.append(guest_data)
            total_guests += row[2]
        
        cur.close()
        conn.close()
        
        response_data = {
            'success': True,
            'total_responses': len(guests_list),
            'total_guests': total_guests,
            'guests': guests_list
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }
