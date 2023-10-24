import { ServerDataType } from "./serverData.interface";

export interface CustomResponseInterface {
  timeStamp: Date;
  statusCode: number;
  status: string;
  reason: string;
  message: string;
  developerMessage: string;
  data: OneServerDataType | MultipleServersDataType
  //change this to server oe servers later it caused a lot of work
}

export interface OneServerDataType {
  server: ServerDataType
}

export interface MultipleServersDataType {
  servers: ServerDataType[]
}


// IMPO: Share later one

// const test = {
//   timeStamp: new Date(),
//   statusCode: 0,
//   status: "",
//   reason: "",
//   message: "",
//   developerMessage: "",
//   data:
//   {
//     server: {

//       id: 2,
//       ipAddress: "",
//       name: "",
//       memory: "",
//       type: "",
//       imageUrl: "",
//       status: ServerStatusEnum.SERVER_DOWN

//     },
//     servers: [
//       {
//         id: 2,
//         ipAddress: "",
//         name: "",
//         memory: "",
//         type: "",
//         imageUrl: "",
//         status: ServerStatusEnum.SERVER_DOWN
//       },
//     ],
//   }
// } satisfies CustomResponseInterface ;


