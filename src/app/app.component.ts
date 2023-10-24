import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppDataStateEnum } from './enums/appStateData.enum';
import { SearchStatusEnum } from './enums/searchStatus.enum';
import { ServerStatusEnum } from './enums/serverStatus.enum';
import { AppStateInterface } from './interfaces/appState.interface';
import { CustomResponseInterface, MultipleServersDataType, OneServerDataType } from './interfaces/customResponse.interface';
import { ServerService } from './services/server.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
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
  private serverIsSavingSub = new BehaviorSubject<boolean>(false);
  //Two cases is enough to use boolean not like a lot of servers you should then pass the exact value
  serverIsSavingObs$ = this.serverIsSavingSub.asObservable();

  serverService = inject(ServerService);

  ngOnInit(){
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.lastDataSub.next(response);
          return {
            dataState: AppDataStateEnum.LOADED_STATE,
            appData: {
              ...response, data: {
                servers: (response.data as MultipleServersDataType).servers.reverse()
              }
            }
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

  filterServers(searchStatusEnum: SearchStatusEnum): void{
    this.appState$ = this.serverService.filter$
    (searchStatusEnum, this.lastDataSub.value as CustomResponseInterface)
    .pipe(
        map(response => {
          return {
            dataState: AppDataStateEnum.LOADED_STATE,
            appData: response
          }
        }),

        startWith({
          dataState: AppDataStateEnum.LOADED_STATE,
          appData: this.lastDataSub.value as CustomResponseInterface
        }),

        catchError((error: string) => {
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error });
        })

      )
    }

    saveServer(serverForm: NgForm): void{
    this.serverIsSavingSub.next(true);
    this.appState$ = this.serverService.save$
    (serverForm.value)
    .pipe(
      map(response => {
        this.lastDataSub.next(
          {
              ...response, data: {
                servers: [
                  (response.data as OneServerDataType).server,
                  ...((this.lastDataSub.value?.data as MultipleServersDataType).servers)
                ]
              }
            }
            );
            this.serverIsSavingSub.next(false);
            document.getElementById('closeModal')?.click();
            serverForm.resetForm({ serverStatus: this.serverStatusEnumVar.SERVER_DOWN })
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
          this.serverIsSavingSub.next(false);
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error });
        })

      )
  }


}


//========================================================================
