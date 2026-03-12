import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const response = NextResponse.json(
        { success: true, message: 'Login effettuato con successo' },
        { status: 200 }
      );
      response.cookies.set('ristorante_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 ore
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Credenziali non valide' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Errore durante il login' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('ristorante_auth');

    if (authCookie?.value === 'authenticated') {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, message: 'Errore durante la verifica' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logout effettuato con successo' },
      { status: 200 }
    );
    response.cookies.set('ristorante_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Errore durante il logout' },
      { status: 500 }
    );
  }
}
