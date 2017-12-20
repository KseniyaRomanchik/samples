import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { PopupService } from './popup.service';
import { WalletService } from './wallet.service';
import { AchievementsService } from './achievements.service';
import { FBService } from './facebook.service';

import { UserInfo } from './../interfaces/user';
import { LoginParams, RegistrationParams, FBParams } from './../interfaces/authorisation';

import config from './../../config';

@Injectable()
export class AuthorisationService implements CanActivate {

  private apiUrl: string;
  private _socket;
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(null);
  userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);

  constructor(
    private http: Http,
    private router: Router,
    private popupService: PopupService,
    private walletService: WalletService,
    private facebookService: FBService,
    private achService: AchievementsService
  ) {
    this.apiUrl = config.apiUrl;
  }

  set userImage(avatar: string) {
    this.userInfo.next(Object.assign({}, this.userInfo.getValue(), avatar));
  }

  set userDefaultImage(avatar: string) {
    this.userInfo.next(Object.assign({}, this.userInfo.getValue(), { defaultAvatar : avatar }));
  }

  updateUserInfo(data) {

    this.userInfo.next(Object.assign({}, this.userInfo.getValue(), data));
  }

  updateFullUserInfo(response: any) {

    this.userInfo.next({
      email: response.email,
      username: response.username,
      role: response.role,
      id: response._id,
      customAvatarFilename: response.customAvatarFilename,
      selectedAvatar: response.selectedAvatar,
      confirmed: response.confirmed,
      isPasswordSet: response.isPasswordSet,
      zendeskId: response.zendeskId
    });
    this.facebookService.credentials = response.facebook;
    this.walletService.userWallet = response.wallet;
    this.achService.userAchievements.next(response.achievements);
    this.isAuthenticated.next(true);
  }

  checkAuthentication(route: ActivatedRouteSnapshot): Observable<boolean> {

    return this.http.get(`${this.apiUrl}/me`, { withCredentials: true })
    .map((res: Response) => {

      this.updateFullUserInfo(res.json());

      return this.redirect(route.data.role);
    })
    .catch((err: any) => {

      this.isAuthenticated.next(false);

      return Observable.of(this.redirect(route.data.role));
    });
  }

  fbLogin(params: FBParams): Observable<any> {
      return this.http.post(`${this.apiUrl}/facebook`, params, { withCredentials: true })
      .map((res: Response) => this.updateFullUserInfo(res.json()))
      .catch(err => Observable.throw(err));
  }

  logIn(params: LoginParams): Observable<any> {

    return this.http.post(`${this.apiUrl}/signin`, params, { withCredentials: true })
    .map((res: Response) => this.updateFullUserInfo(res.json()))
    .catch(err => Observable.throw(err));
  }

  registrate(params: RegistrationParams): any {

    return this.http.post(`${this.apiUrl}/signup`, params, { withCredentials: true })
    .map((res: Response) => this.updateFullUserInfo(res.json()))
    .catch((err: any) => Observable.throw(err));
  }

  logOut(): any {

    return this.http.get(`${this.apiUrl}/signout`, { withCredentials: true })
    .map((res: Response) => {

      this.isAuthenticated.next(false);
      this._socket = null;
    })
    .catch(err => Observable.throw(err))
  }

  recoverEmail(email: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/send-recovery`, { email }, { withCredentials: true })
  }

  resetPassword(data: any) {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { withCredentials: true });
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {

    if (this.isAuthenticated.getValue() || this.isAuthenticated.getValue() === false) {

      return new Observable(observer => observer.next(this.redirect(route.data.role)))
    }

    return this.checkAuthentication(route);
  }

  redirect(routeRole: any): boolean {

    switch (routeRole) {
        case 'start': {

          if (this.isAuthenticated.getValue()) {
            this.router.navigate(['home']);
          }

          return !this.isAuthenticated.getValue();
        }
        case 'home': {

          if (!this.isAuthenticated.getValue()) {
            this.router.navigate(['start']);
          }

          return this.isAuthenticated.getValue();
        }
        default : {

          if (this.isAuthenticated.getValue()) {
            this.router.navigate(['home']);
          }

          this.router.navigate(['start']);

          return true;
        }
      }
  }
}