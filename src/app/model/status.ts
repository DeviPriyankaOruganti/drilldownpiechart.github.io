import { Approver } from './approver';

export class Status {
    ApprovalStatus : string;
    count : number; 
    approverNames : Approver[];
    id:string;
    name:string;
    data: Approver[];
    type:string;
    days : number;
} 