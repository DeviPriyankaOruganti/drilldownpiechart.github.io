import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { BusspassService } from '../services/busspass.service';
import { OrderStatus } from '../model/orderstatus';
import { Status } from '../model/status';
import { Approver } from '../model/approver';
import * as  Highcharts from 'highcharts';
import  More from 'highcharts/highcharts-more';
More(Highcharts);
import Drilldown from 'highcharts/modules/drilldown';
Drilldown(Highcharts);
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
// Initialize exporting module.
Exporting(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild("container", { read: ElementRef }) container: ElementRef;
   // Pie
   public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = ['Metro', 'Long Route', 'Short Route'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public approvalStatusList: Status[]=[];

  constructor(private bussPassService:BusspassService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
   
    let approver: Approver ={ApproverName:'',count:0 };
    let status:Status ={ ApprovalStatus: '', count: 0, approverNames:[approver]};
    this.bussPassService.processJson().subscribe( (res: OrderStatus[]) => { 
     for(let i =0;i<res.length;i++){
        console.log('approval status ',res[i].ApprovalStatus);
        console.log('approval name',res[i].ApproverName); 
        if(this.approvalStatusList.length!=0){
          let index = this.approvalStatusList.findIndex(item => item.ApprovalStatus == res[i].ApprovalStatus);
          if(index !=-1){ 
            status.ApprovalStatus =this.approvalStatusList[index].ApprovalStatus;
            status.count = this.approvalStatusList[index].count+1;
            status.approverNames = this.approvalStatusList[index].approverNames;
            status.approverNames = this.construchApproverNames(res[i].ApproverName,status.approverNames);
            //this.approvalStatus[index] = status;
            this.approvalStatusList.splice(index, 1);//remove element from array
            this.approvalStatusList.push({
              ApprovalStatus : status.ApprovalStatus,
              count : status.count,
              approverNames : status.approverNames
            });
            console.log('index position at thia point' ,this.approvalStatusList[index]);
            console.log('index ',index, 'status',res[i].ApprovalStatus);
            console.log('status', status);
            console.log('approval status ',this.approvalStatusList);
          }else{
            this.approvalStatusList.push(
              {
                ApprovalStatus: res[i].ApprovalStatus,
                count:1,
                approverNames :[{ApproverName: res[i].ApproverName,count : 1}]
              });
          }
        }else{
   
          this.approvalStatusList.push(
            {
              ApprovalStatus: res[i].ApprovalStatus,
              count:1,
              approverNames : [{ApproverName: res[i].ApproverName,count : 1}]
            });
            // this.construchApproverNames(res[i].ApprovalStatus);
        }
      // 
      
     } 
     console.log('approval status ',this.approvalStatusList);
     console.log('approval names ', this.approvalStatusList.length > 0 ? this.approvalStatusList[0].approverNames : []);
  });

  Highcharts.chart(this.container.nativeElement, {
    // Created pie chart using Highchart
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45
      }
    },
    title: {
      text: 'Contents using Pie chart'
    },
    subtitle: {
      text: '3D donut in Highcharts'
    },
    plotOptions: {
      pie: {
        innerSize: 100,
        depth: 45
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
    },
    series: [{
      name: 'Operating Systems',
      data:  this.approvalStatusList[0].approverNames
    //   (function () {
    //     // generate an array of random data
    //     var data = [],i;
    //     for (i = 0; i <= this.approvalStatusList.length; i += 1) {
    //        data.push({
    //           name: this.approvalStatusList[i].ApprovalStatus,
    //           y: this.approvalStatusList[i].count
    //        });
    //     }
    //     return data;
    //  }())   
    }],
    drilldown: {
      series: [{
        name: 'Windows versions',
        id: 'windows-versions',
        data: [
          ['Win 7', 55.03],
          ['Win XP', 15.83],
          ['Win Vista', 3.59],
          ['Win 8', 7.56],
          ['Win 8.1', 6.18]
        ]
      }]
    }
  })
  }
 
 construchApproverNames(appName: string,approvalNamesList: Approver[]){
   
    let name:Approver = {ApproverName :'',count:0};
  
    if(approvalNamesList.length!=0){
        let nameindex = approvalNamesList.findIndex(item => item.ApproverName == appName);
        if(nameindex !=-1){ 
          name.ApproverName = approvalNamesList[nameindex].ApproverName;
          name.count = approvalNamesList[nameindex].count+1;
          approvalNamesList.splice(nameindex, 1);//remove element from array
         approvalNamesList.push({
            ApproverName: name.ApproverName,
            count : name.count
          });
        }else{
          approvalNamesList.push(
            {
              ApproverName: appName,
              count:1
            });
        }
      }else{
        approvalNamesList.push({
          ApproverName: appName,
          count:1
        })
      }
      return approvalNamesList;
  }
// 
}
