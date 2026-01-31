import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Event {
  httpMethod: string;
  queryStringParameters?: Record<string, string>;
}

interface Context {
  requestId: string;
}

export async function handler(event: Event, context: Context) {
  const method = event.httpMethod || 'GET';
  
  // 1x1 прозрачный PNG
  const pngPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  
  if (method !== 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      body: pngPixel.toString('base64'),
      isBase64Encoded: true,
    };
  }
  
  try {
    const params = event.queryStringParameters || {};
    
    const name = (params.name || '').trim();
    const guests = params.guests || '1';
    const comment = (params.comment || '').trim();
    const alcohol = (params.alcohol || '').trim();
    
    console.log(`RSVP: name=${name}, guests=${guests}`);
    
    if (!name) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/png' },
        body: pngPixel.toString('base64'),
        isBase64Encoded: true,
      };
    }
    
    let guestsCount = parseInt(guests, 10);
    if (isNaN(guestsCount) || guestsCount < 1) {
      guestsCount = 1;
    }
    
    const schema = process.env.MAIN_DB_SCHEMA || 'public';
    
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO ${schema}.wedding_guests (name, guests, alcohol, comment) VALUES ($1, $2, $3, $4)`,
        [name, guestsCount, alcohol || null, comment || null]
      );
      
      console.log(`Saved: ${name}, ${guestsCount} guests`);
    } finally {
      client.release();
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
      body: pngPixel.toString('base64'),
      isBase64Encoded: true,
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      body: pngPixel.toString('base64'),
      isBase64Encoded: true,
    };
  }
}
