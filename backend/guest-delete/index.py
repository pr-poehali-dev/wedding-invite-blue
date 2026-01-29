import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для удаления гостя из списка"""
    
    method = event.get('httpMethod', 'GET')
    print(f"Delete request: method={method}")
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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
    
    if method != 'DELETE':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Сначала попробуем получить ID из query параметров
        params = event.get('queryStringParameters', {}) or {}
        guest_id = params.get('id')
        
        # Если нет в query, попробуем body
        if not guest_id:
            body_str = event.get('body', '')
            print(f"Request body: {body_str}")
            
            if body_str and body_str != '{}':
                body = json.loads(body_str)
                guest_id = body.get('guest_id')
        
        print(f"Guest ID to delete: {guest_id}")
        
        if not guest_id:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указан ID гостя'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        delete_query = f"DELETE FROM {schema}.wedding_guests WHERE id = %s"
        cur.execute(delete_query, (guest_id,))
        
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            print("Guest not found")
            return {
                'statusCode': 404,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Гость не найден'}),
                'isBase64Encoded': False
            }
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Guest {guest_id} deleted successfully")
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'message': 'Гость удалён'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Error deleting guest: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }