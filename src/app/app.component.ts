import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NotifierModule, NotifierService } from 'angular-notifier';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppDataStateEnum } from './enums/appStateData.enum';
import { NotifierTypeEnum } from './enums/notifierType.enum';
import { SearchStatusEnum } from './enums/searchStatus.enum';
import { ServerStatusEnum } from './enums/serverStatus.enum';
import { AppStateInterface } from './interfaces/appState.interface';
import { CustomResponseInterface, MultipleServersDataType, OneServerDataType } from './interfaces/customResponse.interface';
import { ServerService } from './services/server/server.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotifierModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  notifierService = inject(NotifierService);

  ngOnInit(){
    this.appState$ = this.serverService.servers$
    .pipe(
      map(response => {
          this.notifierService.notify(NotifierTypeEnum.DEFAULT, response.message);
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
          this.notifierService.notify(NotifierTypeEnum.ERROR, error);
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
            this.notifierService.notify(NotifierTypeEnum.DEFAULT, response.message);
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
          this.notifierService.notify(NotifierTypeEnum.ERROR, error);
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error })
        })

      )
  }

  filterServers(searchStatusEnum: SearchStatusEnum): void{
    this.appState$ = this.serverService.filter$
    (searchStatusEnum, this.lastDataSub.value as CustomResponseInterface)
    .pipe(
        map(response => {
          this.notifierService.notify(NotifierTypeEnum.DEFAULT, response.message);
          return {
            dataState: AppDataStateEnum.LOADED_STATE,
            appData: response
          }
        }),
// The this.lastDataSub is who holds all the data, for give it to app State when he need it.
        startWith({
          dataState: AppDataStateEnum.LOADED_STATE,
          appData: this.lastDataSub.value as CustomResponseInterface
        }),

        catchError((error: string) => {
          this.notifierService.notify(NotifierTypeEnum.ERROR, error);
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
            this.notifierService.notify(NotifierTypeEnum.DEFAULT, response.message);
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
          this.notifierService.notify(NotifierTypeEnum.ERROR, error);
          this.serverIsSavingSub.next(false);
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error });
        })

      )
  }

  deleteServer(serverId: string): void{
    this.appState$ = this.serverService.delete$(serverId)
    .pipe(
      map(response => {
          this.lastDataSub.next(
            {
              ...this.lastDataSub.value as CustomResponseInterface,
              data: {
                servers: ((this.lastDataSub.value as CustomResponseInterface)
                  .data as MultipleServersDataType)
                    .servers.filter(server => server.id !== serverId)
              }
            }

          )
          this.notifierService.notify(NotifierTypeEnum.DEFAULT, response.message);
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
          this.notifierService.notify(NotifierTypeEnum.ERROR, error);
          this.currentPingedIpSub.next('');
          return of({ dataState: AppDataStateEnum.ERROR_STATE, error })
        })

      )
  }

  printReport(): void{
    // print feature:
    // window.print();

    // extends the table to the excel:
    this.notifierService.notify(NotifierTypeEnum.DEFAULT ,'Report downloaded.');
    const dataType: string  = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    const serversTableElem = document.getElementById("serversTable");
    const tableHtml = serversTableElem?.outerHTML.replace(/ /g, '%20');
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = `data: ${dataType}, ${tableHtml}`;
    downloadLink.download = 'servers-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

}


//========================================================================









/*
TODO: 'check later'

Library problem with the standalone apps in angular:

export const customNotifierConfig: NotifierOptions = {
  position: {
    horizontal: {
      position: 'left',
      distance: 150
    },
    vertical: {
      position: 'bottom',
      distance: 12,
      gap: 10
    }
  },
  theme: 'material',
  behaviour: {
    autoHide: 3000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};
*/
