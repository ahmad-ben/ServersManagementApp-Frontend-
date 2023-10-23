import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AppDataStateEnum } from './enums/appStateData.enum';
import { AppStateInterface } from './interfaces/appState.interface';
import { CustomResponseInterface } from './interfaces/customResponse.interface';
import { ServerService } from './services/server.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  appState$!: Observable<AppStateInterface<CustomResponseInterface>>;

  serverService = inject(ServerService);

  ngOnInit(){
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
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

}
//========================================================================
