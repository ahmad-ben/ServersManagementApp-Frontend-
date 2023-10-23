
import { ServerStatusEnum } from "../enums/serverStatus.enum";
export interface ServerDataType {
  id: number;
  ipAddress: string;
  name: string;
  memory: string;
  type: string;
  imageUrl: string;
  status: ServerStatusEnum
}
