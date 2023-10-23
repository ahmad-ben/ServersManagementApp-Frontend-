export enum AppDataStateEnum{
  LOADING_STATE = "LOADING_STATE",
  LOADED_STATE = "LOADED_STATE",
  ERROR_STATE = "ERROR_STATE"
}



/*



in angular I have this:
  <tbody *ngFor="let server of appState.appData!.data.servers; let i = index" >
and then I had this error:
  Property 'servers' does not exist on type 'OneServerDataType |
  MultipleServersDataType'. Property 'servers' does not exist on type
  'OneServerDataType'.
since:
  export interface CustomResponseInterface {
    timeStamp: Date;
    statusCode: number;
    status: string;
    reason: string;
    message: string;
    developerMessage: string;
    data: OneServerDataType | MultipleServersDataType
  }

  export interface OneServerDataType {
    server: ServerDataType
  }

  export interface MultipleServersDataType {
    servers: ServerDataType[]
  }
but i'm sure in this case that the type of the  is   so the property servers exist



*/
