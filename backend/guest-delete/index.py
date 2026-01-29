import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """API для удаления гостя через GET с JSONP (обход CORS)"""
    
    method = event.get('httpMethod', 'GET')
    print(f"Delete request: method={method}")
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*'
    }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        guest_id = params.get('id')
        callback = params.get('callback', '')
        
        print(f"Guest ID to delete: {guest_id}, callback: {callback}")
        
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
        
        # Simple Query Protocol (без параметризации)
        delete_query = f"DELETE FROM {schema}.wedding_guests WHERE id = {int(guest_id)}"
        cur.execute(delete_query)
        
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
        
        response_data = {'success': True, 'message': 'Гость удалён'}
        
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
    
    except Exception as e:
        print(f"Error deleting guest: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }