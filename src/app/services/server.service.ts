import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SearchStatusEnum } from '../enums/searchStatus.enum';
import { CustomResponseInterface, MultipleServersDataType } from '../interfaces/customResponse.interface';
import { ServerDataType } from '../interfaces/serverData.interface';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl: string = "http://localhost:8080";

  http = inject(HttpClient);

  servers$ = <Observable<CustomResponseInterface>>
    this.http.get<CustomResponseInterface>(`${this.apiUrl}/server/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  save$ = (server: ServerDataType) => <Observable<CustomResponseInterface>>
    this.http.post<CustomResponseInterface>(`${this.apiUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  ping$ = (ipAddress: string) => <Observable<CustomResponseInterface>>
    this.http.get<CustomResponseInterface>(`${this.apiUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (searchStatus: SearchStatusEnum, response: CustomResponseInterface) =>
  <Observable<CustomResponseInterface>>
    new Observable<CustomResponseInterface>(
      ourSubscriber => {
        console.log(response);
        ourSubscriber.next(
          searchStatus === SearchStatusEnum.ALL ?
          { ...response, message: `Servers filtered by ${searchStatus} status.` } :
          {
            ...response,
            message: (response.data as MultipleServersDataType).servers.filter(
              (serverData) => serverData.status == searchStatus as string
            ).length > 0 ?
              `Servers filtered by ${searchStatus === SearchStatusEnum.SERVER_UP ?
                'SERVER UP' :
                'SERVER DOWN'
              }
              status.` :
              `No servers of ${searchStatus === SearchStatusEnum.SERVER_UP ?
                'SERVER UP' :
                'SERVER DOWN'
              } found.`,
              data : {
                servers: (response.data as MultipleServersDataType)
                .servers.filter(
                  (serverData) => serverData.status == searchStatus as string
                )
              }
          }
        )
        ourSubscriber.complete(); //Refactor this and record it.
      }
    ) ;

  delete$ = (serverId: string) => <Observable<CustomResponseInterface>>
    this.http.delete<CustomResponseInterface>
    (`${this.apiUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(error: HttpErrorResponse): Observable<never>{
    console.log(error);
    return throwError (() =>
      new Error (`An error occurred: ${error.status}`)
    );
  }
}


// =======================================================================
