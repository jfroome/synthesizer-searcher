const { createHash } = await import('node:crypto');

export function createUID(seed: string)
{
    return createHash('sha1').update(seed.toString()).digest('base64');
}