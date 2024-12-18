import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DataServiceComponent {

  records: any[] = [];
  currTestSuite: any[] = [];
  currTestCase: any[] = [];
  currTestSuiteID: any;
  currTestCaseID: any;
  bearer: any;
  projectOccurrences: { [projectName: string]: number } = {};
  isLoading = false;
  encryptSecretKey: any = 'hfdh455jj5kj345';
  appFailures: any;
  scFailures: any;
  defectsCount = 0;
  startDate: any;
  endDate: any;
  projectName: any;
  projectNames: string[] = [];

  formGroup = new FormGroup({
    projectName: new FormControl(''),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

  constructor(private http: HttpClient) {

  }

  // getTestSuitesRecords(): Observable<any> {
  //   const url = `https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites`;
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ` + this.bearer,
  //       'Content-Type': 'application/json'
  //     })
  //   };
  //   return this.http.get(url, httpOptions);
  // }

  private testSuitesUrl = `${environment.apiUrl}/get-test-suites-records`;
  // private testSuitesUrl = `${environment.apiUrl}/get-yearly-basic-test-suites-records`;
  getTestSuitesRecords(): Observable<any> {
    return this.http.get(this.testSuitesUrl);
  }

  // Encrypt data
  encryptData(data: any): string {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptSecretKey).toString();
    } catch (error) {
      console.error('Error encrypting data:', error);
      // Handle encryption error
      return '';
    }
  }

  // Decrypt data
  decryptData(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptSecretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting data:', error);
      // Handle decryption error
      return null;
    }
  }

}
