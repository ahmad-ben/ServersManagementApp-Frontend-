
import { ServerStatusEnum } from "../enums/serverStatus.enum";
export interface ServerDataType {
  id: string;
  ipAddress: string;
  name: string;
  memory: string;
  type: string;
  imageUrl: string;
  serverStatus: ServerStatusEnum
}
