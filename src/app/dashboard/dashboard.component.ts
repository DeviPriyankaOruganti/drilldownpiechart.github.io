import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { BusspassService } from '../services/busspass.service';
import { OrderStatus } from '../model/orderstatus';
import { Status } from '../model/status';
import { Approver } from '../model/approver';
import * as  Highcharts from 'highcharts';
import More from 'highcharts/highcharts-more';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
import { Stat } from '../model/stat';
import { Days } from '../model/days';
// Initialize exporting module.
Exporting(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild("container", { read: ElementRef }) container: ElementRef;

  public pieChartLabels: Label[] = ['Metro', 'Long Route', 'Short Route'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public approvalStatusList: Status[] = [];
  
  public updateFlag: Boolean = true;
  less = 0;
  more = 0;
  public apprStatus: Stat[] = [];
  public dayCount: Days[] = [];
  public orderDetails = [];
  public options: any = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45
      }
    },
    title: {
      text: 'Order Status'
    },
    xAxis: {
      type: 'category'
    },
    plotOptions: {
      pie: {
        innerSize: 100,
        depth: 45
      },
      series: {
        dataLabels: {
          enabled: true
        }
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}  <br><span style="color:{point.color}">Created Date:</span>'
    },
    series: [{
      name: 'Approval Status',
      data: [
        {
          name: '',
          y: 0,
          drilldown: 'Awaiting Approval Status'
        },
        ['',],
        ['',],
        ['',]
      ]
    }],
    drilldown: {
      drillUpButton: {
        position: {
          verticalAlign: 'top',
          align: 'right',
          y: -50,
          x: -30
        }
      },
      series: [{
        name: 'Awaiting Approval Status',
        id: 'Awaiting Approval Status',
        data: [
          {
            name: 'Win 7',
            y: 55.03,
            drilldown: 'Awaiting orders'
          },
          ['Win XP', 15.83],
          ['Win Vista', 3.59],
          ['Win 8', 7.56],
          ['Win 8.1', 6.18]
        ]
      },
     {
       id:'Pranav Muttalik orders',
       data: ['1089-011']
     }]
    }
  }
  constructor(private bussPassService: BusspassService) {

    const csvData = '"Hello","World!"';

    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {

    this.getStatus();

    console.log('options initially ', this.options);
    Highcharts.chart(this.container.nativeElement, this.options);
    let approver: Approver = { name: '', y: 0 , orders : [], drilldown:'' };
    let status: Status = {
      ApprovalStatus: '', count: 0, days: 0,
      approverNames: [approver], name: '', id: '', data: [approver], type: ''
    };
    this.bussPassService.processJson().subscribe((res: OrderStatus[]) => {

      for (var i = 0; i < res.length; i++) {
        var obj = res[i];
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop) && obj[prop] !== null && !isNaN(obj[prop])) {
            obj[prop] = +obj[prop];
          }
        }
      }


      for (let i = 0; i < res.length; i++) {
        let orderNumber = res[i].OrderNo;
        let leadtime = res[i].Days;
        console.log('approval status ', res[i].ApprovalStatus);
        console.log('approval name', res[i].ApproverName);
        if (this.approvalStatusList.length != 0) {
          let index = this.approvalStatusList.findIndex(item => item.ApprovalStatus == res[i].ApprovalStatus);
          if (index != -1) {
            status.ApprovalStatus = this.approvalStatusList[index].ApprovalStatus;
            status.count = this.approvalStatusList[index].count + 1;
            status.approverNames = this.approvalStatusList[index].approverNames;
            status.approverNames = this.construchApproverNames(res[i].ApproverName, status.approverNames, res[i].OrderNo, res[i].Days, status.ApprovalStatus);
            //this.approvalStatus[index] = status;
            this.approvalStatusList.splice(index, 1);//remove element from array
            this.approvalStatusList.push({
              ApprovalStatus: status.ApprovalStatus,
              count: status.count,
              days: status.days,
              approverNames: status.approverNames,
              name: status.ApprovalStatus + ' Status',
              id: status.ApprovalStatus + ' Status',
              data: status.approverNames,
              type: 'column'
            });
            this.apprStatus.splice(index, 1)
            this.apprStatus.push({
              name: status.ApprovalStatus,
              y: status.count,
              drilldown: status.ApprovalStatus + ' Status'
            });

            console.log('index position at thia point', this.approvalStatusList[index]);
            console.log('index ', index, 'status', res[i].ApprovalStatus);
            console.log('status', status);
            console.log('approval status ', this.approvalStatusList);
          } else {
            this.orderDetails =[];
            this.orderDetails.push({name: orderNumber , y: leadtime}) ;
            this.approvalStatusList.push(
              {
                ApprovalStatus: res[i].ApprovalStatus,
                count: 1,
                days: status.days,
                approverNames: [{ name: res[i].ApproverName, y: 1, orders: this.orderDetails, drilldown:  res[i].ApproverName + ' orders' }],
                name: status.ApprovalStatus + ' Status',
                id: status.ApprovalStatus + ' Status',
                data: status.approverNames,
                type: 'column'
              });
            this.apprStatus.push({
              name: status.ApprovalStatus,
              y: status.count,
              drilldown: status.ApprovalStatus + ' Status'
            });
          }
        } else {
         this.orderDetails.push({name: orderNumber , y: leadtime});
          this.approvalStatusList.push(
            {
              ApprovalStatus: res[i].ApprovalStatus,
              count: 1,
              days: status.days,
              approverNames: [{ name: res[i].ApproverName, y: 1, orders : this.orderDetails, drilldown:  res[i].ApproverName + ' orders' }],
              name: status.ApprovalStatus + ' Status',
              id: status.ApprovalStatus + ' Status',
              data: status.approverNames,
              type: 'column'
            });
          this.apprStatus.push({
            name: status.ApprovalStatus,
            y: status.count,
            drilldown: status.ApprovalStatus + ' Status'
          });

          // this.construchApproverNames(res[i].ApprovalStatus);
        }
        // 

      }

      //  console.log('dasfdsa   -----------',this.approvalStatusList[0].approverNames);

      this.options.drilldown.series = this.approvalStatusList;
      //this.options.series[0]['data'][0].drilldown = this.approvalStatusList[0].ApprovalStatus+' Status';
      console.log('----------options details----------');
      console.log(this.options);
     // console.log('approval status list ',this.approvalStatusList);
      let statindex = this.approvalStatusList.findIndex(item => item.ApprovalStatus == 'Awaiting Approval');

      let leadTimeOrdersList = this.approvalStatusList[statindex].approverNames;
      for(let i=0;i<leadTimeOrdersList.length;i++){
           this.options.drilldown.series.push({
             name: leadTimeOrdersList[i].drilldown,
             id:leadTimeOrdersList[i].drilldown,
             type:'line',
             data: leadTimeOrdersList[i].orders
           })
      }
      console.log('lead time order list ', leadTimeOrdersList);
      console.log('drill down   -----------', this.options.series[0]['data'][0].drilldown);
      this.options.series[0]['data'] = this.apprStatus;
    //   this.options.drilldown.series.push({
    //     name: 'Pranav Muttalik orders',
    //     id:'Pranav Muttalik orders',
    //     data: [{name:'1240-01',y:20},{name:'1240-02',y:20},{name:'1240-03',y:30}],
    //     type:'line'
    // });

      //Highcharts.chart(this.container.nativeElement, this.options);
      // this.options.drilldown.series[0]['data'] = this.approvalStatusList[0].approverNames;

      Highcharts.chart(this.container.nativeElement, this.options);

      console.log('app status ',this.apprStatus);
      
      console.log('order details ',this.orderDetails);
      console.log('approval names ', this.approvalStatusList.length > 0 ? this.approvalStatusList[0].approverNames : []);
    });


  }

  getStatus() {


  }

  construchApproverNames(appName: string, approvalNamesList: Approver[], orderNumber: string, leadtime:string , status: string) {

    let name: Approver = { name: '', y: 0 , orders : [] , drilldown : ''};

    if (approvalNamesList.length != 0) {
      let nameindex = approvalNamesList.findIndex(item => item.name == appName);
      if (nameindex != -1) {
        name.name = approvalNamesList[nameindex].name;
        name.y = approvalNamesList[nameindex].y + 1;
        name.orders = approvalNamesList[nameindex].orders;
        approvalNamesList.splice(nameindex, 1);//remove element from array
        name.orders.push({name: orderNumber , y: leadtime});
        approvalNamesList.push({
          name: name.name,
          y: name.y,
          drilldown : appName +' ' +status+' orders',
          orders : name.orders
        });
      } else {
        name.orders.push({name: orderNumber , y: leadtime});
        approvalNamesList.push(
          {
            name: appName,
            y: 1,
            orders :  name.orders,
            drilldown : appName + ' orders'
          });
      }
    } else {
      name.orders.push({name: orderNumber , y: leadtime});
      approvalNamesList.push({
        name: appName,
        y: 1,
        orders : name.orders,
        drilldown : appName + ' orders'
      })
    }
    return approvalNamesList;
  }

}
