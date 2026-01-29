import json
import os
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API для приёма подтверждений присутствия на свадьбе"""
    
    method = event.get('httpMethod', 'GET')
    print(f"RSVP Request: method={method}")
    
    # CORS headers для всех ответов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        print("Returning OPTIONS response")
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        name = body.get('name', '').strip()
        guests = body.get('guests', '1')
        comment = body.get('comment', '').strip()
        alcohol = body.get('alcohol', [])
        
        # Преобразуем массив в строку через запятую
        if isinstance(alcohol, list):
            alcohol_str = ', '.join(alcohol) if alcohol else ''
        else:
            alcohol_str = str(alcohol).strip()
        
        if not name:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Имя обязательно'}),
                'isBase64Encoded': False
            }
        
        try:
            guests_count = int(guests)
            if guests_count < 1:
                raise ValueError()
        except (ValueError, TypeError):
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Некорректное количество гостей'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Экранируем значения для Simple Query Protocol (без параметризации)
        name_escaped = name.replace("'", "''")
        comment_escaped = comment.replace("'", "''") if comment else None
        alcohol_escaped = alcohol_str.replace("'", "''") if alcohol_str else None
        
        # Формируем значения для вставки
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
        
        timestamp = datetime.now().isoformat()
        
        response_data = {
            'success': True,
            'message': 'Подтверждение принято',
            'data': {
                'name': name,
                'guests': guests_count,
                'alcohol': alcohol,
                'comment': comment,
                'timestamp': timestamp
            }
        }
        
        print(f"Successfully saved guest: {name}, {guests_count} guests")
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps(response_data),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        print("JSON decode error")
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Некорректный JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }