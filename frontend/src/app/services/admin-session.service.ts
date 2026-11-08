import { Injectable, computed, signal } from '@angular/core';

const KEY = 'admin_session';

export interface AdminSession {
  userId: number;
  role: string;
  name: string;
  email: string;
}

function read(): AdminSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private readonly _session = signal<AdminSession | null>(read());

  readonly session = this._session.asReadonly();
  readonly isLoggedIn = computed(() => this._session() !== null);

  /** Stores the /admin/login response. */
  start(res: { user_id: number; role: string; name: string; email: string }): void {
    const session: AdminSession = {
      userId: res.user_id,
      role: res.role,
      name: res.name,
      email: res.email,
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    this._session.set(session);
  }

  end(): void {
    localStorage.removeItem(KEY);
    this._session.set(null);
  }
}