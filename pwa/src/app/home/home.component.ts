
import { Component, VERSION, OnInit, ViewChild } from '@angular/core';

import { ZXingScannerComponent } from '@zxing/ngx-scanner';

import { Result, BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
import { BusspassService } from '../services/busspass.service';
import Swal from 'sweetalert2'



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit{

  ngVersion = VERSION.full;

  @ViewChild('scanner')
  scanner: ZXingScannerComponent;

  hasDevices: boolean;
  hasPermission: boolean;
  qrResultString: string;

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  ngOnInit(): void {

  }
  constructor(private busPassService:BusspassService){}

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

  handleQrCodeResult(resultString: string) {
      console.log('Result: ', resultString);
      this.qrResultString = resultString;
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice = device || null;
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  clearResult(): void {
    this.qrResultString = null;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
  }

  issue(){
    this.busPassService.issueBusPass(this.qrResultString).subscribe((
      value) => {
        Swal.fire(value.empName+'!',
        'Your bus pass for the '+value.month+' is issued')
       console.log('Bus pass is issued successfully', value);
    }, error => {
      Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: error.error.message
      })
      console.log('FAIL to apply buss pass!', error);
    }
    );
    this.clearResult();
  }


}
