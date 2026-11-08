import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from './admin-session.service';

/** Only signed-in admins may open the admin page. */
export const adminGuard: CanActivateFn = () =>
  inject(AdminSessionService).isLoggedIn() ? true : inject(Router).createUrlTree(['/admin-auth']);

/** Signed-in admins skip the login screen. */
export const adminGuestGuard: CanActivateFn = () =>
  inject(AdminSessionService).isLoggedIn() ? inject(Router).createUrlTree(['/admin']) : true;