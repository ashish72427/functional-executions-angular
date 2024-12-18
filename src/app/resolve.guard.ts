// import { Injectable } from '@angular/core';
// import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { DataServiceComponent } from './data-service/data-service.component';
// import { AuthServiceComponent } from './auth-service/auth-service.component';
// import { Observable, of, EMPTY } from 'rxjs';
// import { switchMap, catchError } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })

// export class resolveGuard implements Resolve<any> {

//   constructor(private dataService: DataServiceComponent, private authService: AuthServiceComponent){

//   }

//   resolve(): Observable<any> {
//     if (!this.dataService.bearer?.length) {
//         this.dataService.isLoading = true;
//         return this.authService.getToken().pipe(
//             switchMap((response) => {
//                 const bearerToken = response.access_token;
//                 // console.log('Bearer Token:', bearerToken);
//                 this.dataService.bearer = bearerToken;
//                 return this.dataService.getTestSuitesRecords();
//             }),
//             catchError((error) => {
//                 console.error('Error fetching token:', error);
//                 return EMPTY;
//             })
//         );
//     } else {
//         return of(null);
//     }
// }
// }




import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { DataServiceComponent } from './data-service/data-service.component';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class resolveGuard implements Resolve<any> {
    private cachedData: any = null;

    constructor(private dataService: DataServiceComponent) { }

    resolve(): Observable<any> {
        if (this.cachedData) {
            return (this.cachedData);
        }
        this.dataService.isLoading = true;
        return this.dataService.getTestSuitesRecords().pipe(
            tap(response => {
                this.dataService.isLoading = false;
                this.cachedData = response;
            })
        );
    }

}
