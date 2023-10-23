import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppDataStateEnum } from './enums/appStateData.enum';
import { ServerStatusEnum } from './enums/serverStatus.enum';
import { AppStateInterface } from './interfaces/appState.interface';
import { CustomResponseInterface, MultipleServersDataType, OneServerDataType } from './interfaces/customResponse.interface';
import { ServerService } from './services/server.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly appDataStateEnumVar = AppDataStateEnum;
  readonly serverStatusEnumVar = ServerStatusEnum;

  appState$!: Observable<AppStateInterface<CustomResponseInterface>>;
  private currentPingedIpSub = new BehaviorSubject<string>("");
  currentPingedIpObs$ = this.currentPingedIpSub.asObservable();
  private lastDataSub = new BehaviorSubject<CustomResponseInterface | null>(null);

  serverService = inject(ServerService);

  ngOnInit(){
    console.log('The first enum to property', this.appDataStateEnumVar);
    console.log('The first enum to property', this.serverStatusEnumVar);
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.lastDataSub.next(response);
          return {
            dataState: AppDataStateEnum.LOADED_STATE, appData: response
          }
        }),

        startWith({ dataState: AppDataStateEnum.LOADING_STATE }),

        catchError((error: string) => {
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error })
        })

      )
  }

  pingServer(ipAddress: string): void{
    this.currentPingedIpSub.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
    .pipe(
      map(response => {
          (this.lastDataSub.value?.data as MultipleServersDataType).servers[
            (this.lastDataSub.value?.data as MultipleServersDataType).servers.findIndex(
              (server) => server.id ===
              (response.data as OneServerDataType).server.id
              )
            ] = (response.data as OneServerDataType).server; //TODO: Clean this later
          this.currentPingedIpSub.next('');
          return {
            dataState: AppDataStateEnum.LOADED_STATE,
            appData: this.lastDataSub.value as CustomResponseInterface
          }
        }),

        startWith({
          dataState: AppDataStateEnum.LOADED_STATE,
          appData: this.lastDataSub.value as CustomResponseInterface
        }),

        catchError((error: string) => {
          this.currentPingedIpSub.next('');
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error })
        })

      )
  }




/*

get the whole array with the previous values. search on the wanted server
and extract it to change its value from the new response use the index
in the previous array itself.
after override the previous value, put it a


*/

}
//========================================================================
