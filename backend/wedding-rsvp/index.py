import json
import os
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API для приёма подтверждений присутствия на свадьбе"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
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
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
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
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Некорректное количество гостей'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        insert_query = f"""
            INSERT INTO {schema}.wedding_guests (name, guests, alcohol, comment)
            VALUES (%s, %s, %s, %s)
        """
        cur.execute(insert_query, (name, guests_count, alcohol_str if alcohol_str else None, comment if comment else None))
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Некорректный JSON'}),
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