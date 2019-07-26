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
import { Stat } from '../model/stat';
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
  public approvalStatusList: Status[]=[]; 
  public updateFlag : Boolean = true;
  public apprStatus : Stat[] = [];
  public options: any = {
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
      name: 'Approval Status',
      data: [
        {
          name: 'Windows',
          y: 88.19,
          drilldown: 'Awaiting Approval Status'
        },
        ['MacOSX', 9.22],
        ['Linux', 1.58],
        ['Others', 1.01]
      ]
    }],
    drilldown: {
      series: [{
        name: 'Awaiting Approval Status',
        id: 'Awaiting Approval Status',
        data: [
          {
            name: 'Win 7',
            y :  55.03
          },
          ['Win XP', 15.83],
          ['Win Vista', 3.59],
          ['Win 8', 7.56],
          ['Win 8.1', 6.18]
        ]
      }]
    }
  }
  constructor(private bussPassService:BusspassService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {

    console.log('options initially ',this.options);
    Highcharts.chart(this.container.nativeElement, this.options);
    let approver: Approver ={name:'',y:0 };
    let status:Status ={ ApprovalStatus: '', count: 0, approverNames:[approver], name:'',id:'',data:[approver],type:''};
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
              approverNames : status.approverNames,
              name: status.ApprovalStatus +' Status',
              id: status.ApprovalStatus+' Status',
              data: status.approverNames,
              type:'column'
            });
            this.apprStatus.splice(index,1)
            this.apprStatus.push({
              name : status.ApprovalStatus,
              y : status.count,
              drilldown : status.ApprovalStatus+' Status'
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
                approverNames :[{name: res[i].ApproverName,y : 1}],
                name: status.ApprovalStatus +' Status',
              id: status.ApprovalStatus+' Status',
              data: status.approverNames,
              type:'column'
              });
              this.apprStatus.push({
                name : status.ApprovalStatus,
                y : status.count,
                drilldown : status.ApprovalStatus+' Status'
              });
          }
        }else{
   
          this.approvalStatusList.push(
            {
              ApprovalStatus: res[i].ApprovalStatus,
              count:1,
              approverNames : [{name: res[i].ApproverName,y : 1}],
              name: status.ApprovalStatus +' Status',
              id: status.ApprovalStatus+' Status',
              data: status.approverNames,
              type:'column'
            });
            this.apprStatus.push({
              name : status.ApprovalStatus,
              y : status.count,
              drilldown : status.ApprovalStatus+' Status'
            });
         
            // this.construchApproverNames(res[i].ApprovalStatus);
        }
      // 
     
     } 

   //  console.log('dasfdsa   -----------',this.approvalStatusList[0].approverNames);

     this.options.drilldown.series = this.approvalStatusList;
     //this.options.series[0]['data'][0].drilldown = this.approvalStatusList[0].ApprovalStatus+' Status';
     console.log('----------options details----------');
     console.log(this.options.drilldown);
    
     console.log('drill down   -----------',this.options.series[0]['data'][0].drilldown);
     this.options.series[0]['data'] = this.apprStatus;
     Highcharts.chart(this.container.nativeElement, this.options);
    // this.options.drilldown.series[0]['data'] = this.approvalStatusList[0].approverNames;

     Highcharts.chart(this.container.nativeElement, this.options);
    //  console.log('-------------------name ---',  this.options.drilldown.series[0].name);
    //  console.log('-------------------id ----',  this.options.drilldown.series[0].id); 
    //  console.log('---------------drilldown data----',  this.options.drilldown.series[0]['data']);
    //  console.log('-------------------data .name ----',  this.options.drilldown.series[0]['data'][0].name);
    //  console.log('-------------------', this.options.series[0]['data'][1].name);
    //  console.log('after ----',this.options);
     
     console.log('approval names ', this.approvalStatusList.length > 0 ? this.approvalStatusList[0].approverNames : []);
  });

  
 
  }
 
 construchApproverNames(appName: string,approvalNamesList: Approver[]){
   
    let name:Approver = {name :'',y:0};
  
    if(approvalNamesList.length!=0){
        let nameindex = approvalNamesList.findIndex(item => item.name == appName);
        if(nameindex !=-1){ 
          name.name = approvalNamesList[nameindex].name;
          name.y = approvalNamesList[nameindex].y+1;
          approvalNamesList.splice(nameindex, 1);//remove element from array
         approvalNamesList.push({
            name: name.name,
            y : name.y
          });
        }else{
          approvalNamesList.push(
            {
              name: appName,
              y:1
            });
        }
      }else{
        approvalNamesList.push({
          name: appName,
          y:1
        })
      }
      return approvalNamesList;
  }
// 
}
