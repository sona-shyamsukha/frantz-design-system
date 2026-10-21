/* Vercel runs this before every page. It asks for a password, so only people with the password see the prototype.
   The password is the SITE_PASSWORD setting in the Vercel project. It is not in the code.
   Any user name works. Only the password is checked. */
export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded && process.env.SITE_PASSWORD) {
    const decoded = atob(encoded);
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password === process.env.SITE_PASSWORD) return; // correct: show the page
  }
  return new Response('Du trenger et passord for å se denne siden.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Frantz prototype", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}
