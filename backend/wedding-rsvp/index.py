import json
import os
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API для приёма подтверждений присутствия на свадьбе через GET параметры (обход CORS)"""
    
    method = event.get('httpMethod', 'GET')
    print(f"RSVP Request: method={method}")
    
    # CORS headers для всех ответов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем данные из query параметров
        params = event.get('queryStringParameters', {}) or {}
        print(f"Query params: {params}")
        
        name = params.get('name', '').strip()
        guests = params.get('guests', '1')
        comment = params.get('comment', '').strip()
        alcohol = params.get('alcohol', '')  # Строка через запятую
        
        print(f"Extracted data: name={name}, guests={guests}, comment={comment}, alcohol={alcohol}")
        
        alcohol_str = alcohol.strip() if alcohol else ''
        
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
        
        print(f"Connecting to database...")
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        print(f"Connected successfully")
        
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
        print(f"Executing query: {insert_query}")
        cur.execute(insert_query)
        conn.commit()
        print(f"Query executed successfully")
        
        cur.close()
        conn.close()
        
        timestamp = datetime.now().isoformat()
        
        response_data = {
            'success': True,
            'message': 'Подтверждение принято',
            'data': {
                'name': name,
                'guests': guests_count,
                'alcohol': alcohol_str,
                'comment': comment,
                'timestamp': timestamp
            }
        }
        
        print(f"Successfully saved guest: {name}, {guests_count} guests")
        
        # Проверяем нужен ли JSONP ответ
        callback = params.get('callback', '')
        if callback:
            jsonp_response = f"{callback}({json.dumps(response_data)})"
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/javascript'},
                'body': jsonp_response,
                'isBase64Encoded': False
            }
        
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