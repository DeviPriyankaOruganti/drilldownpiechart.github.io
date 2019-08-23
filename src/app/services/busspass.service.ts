import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderStatus } from '../model/orderstatus';


@Injectable({
  providedIn: 'root'
})
export class BusspassService {
  private  readonly issueBusPassUrl: string = `${environment.api}/scanQrCode`;
  //private _url: string = `${environment.api}` ;
  private _url: string = "assets/data/data.json";
filePath = "assets/data/Awaiting.csv";
  constructor(private _http: HttpClient) { }

  issueBusPass(qrCode:String) :  Observable<any> {
    return this._http.get(this.issueBusPassUrl+'/'+qrCode);
  } 

  processJson():Observable<OrderStatus[]>{
    return this._http.get<OrderStatus[]>(this._url);
  //   return this._http.get((req,res)=>{
  //     csv()
  //     .fromFile(this.filePath)
  //     .then((jObj)=>{
  //         res.send(jObj) 
  //     })
      
  // })

    
  }

  getCsv() : Observable<any> {
    return this._http.get(this._url);
  }

}
