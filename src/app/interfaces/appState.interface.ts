import { AppDataStateEnum } from "../enums/appStateData.enum";

export interface AppStateInterface<T> {
  dataState: AppDataStateEnum;
  appData?: T;
  error?: string;
}
