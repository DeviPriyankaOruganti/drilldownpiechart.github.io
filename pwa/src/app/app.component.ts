import { 
  Component, 
  ChangeDetectorRef, 
  EventEmitter, 
  Output, 
  OnInit,
  ViewChild,
  ViewEncapsulation,VERSION} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { IosInstallComponent } from './ios-install/ios-install.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{

 
  title = 'VOLVO-Bus Pass Admin';
  mobileQuery: MediaQueryList;
  nav = [
    {
      'title': 'Home',
      'path': '/'
    },
    {
      'title': 'Dashboard',
      'path': '/dashboard'
    }
  ];
  private _mobileQueryListener: () => void;
  @Output() toggleSideNav = new EventEmitter();
  // @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent ;
  
  constructor( changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,private toast: MatSnackBar ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // Detects if device is on iOS 
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test( userAgent );
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in (window as any).navigator) && ((window as any).navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      this.toast.openFromComponent(IosInstallComponent, { 
        duration: 8000,
        horizontalPosition: 'start', 
        panelClass: ['mat-elevation-z3'] 
      });
    }
   
  }
  
  toggleMobileNav(nav: MatSidenav) {
    if (this.mobileQuery.matches) {
      nav.toggle();
    }
  }

 
}