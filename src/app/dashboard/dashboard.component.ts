import { ChartDataParsingService } from './../service/chart-data-parsing.service';
import { element } from 'protractor';
import { ChartData, GraphData } from './../models/chart-data';
import { Emotions } from './../models/emotions.enum';
import { HttpRequestService } from './../service/http-request.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import color from 'color';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/takeWhile';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public lineChartDatasets: Array<ChartData>;
  public lineChartColors: Array<Array<string>>;
  public lineChartOptions: any;
  public graphData: GraphData;
  private alive: boolean;
  private users: number;
  private emotionsStats: Array<any>;

  keys(): Array<string> {
    const keys = Object.keys(Emotions);
    return keys.slice(keys.length / 2);
  }

  stats(): Array<string> {
    return [
      'engagement',
      'attention',
      'joy',
      'surprise',
      'anger'
    ];
  }

  constructor(private httpRequestService: HttpRequestService, private chartDataParsingService: ChartDataParsingService) {
    this.alive = true;
    this.users = 0;
  }

  ngOnInit() {
    this.lineChartDatasets = this.keys().map((chartName: string) => {
      const chartData = this.chartDataParsingService.getDefault()[chartName];
      chartData.data = [];
      return chartData;
    });

    this.emotionsStats = this.stats().map((chartName: string) => {
      const chartData = this.chartDataParsingService.getDefault()[chartName];
      return chartData;
    });

    this.httpRequestService.getEmotions('api/videos/1/emotions/stats')
    .first() // only gets fired once
    .subscribe(data => {
      this.emotionsStats = this.emotionsStats.map((emotionStat: ChartData) => {
        emotionStat.percentage = data[emotionStat.label].toFixed(1);
        return emotionStat;
      });
    });

    this.httpRequestService.getEmotions('api/videos/1/emotions')
    .first() // only gets fired once
    .subscribe(data => {
      const chartDataAllEmotions = this.chartDataParsingService.parseEmotionsData(data, this.keys());
      this.lineChartDatasets = this.keys().map((chartName: string) => {
        const chartData = this.chartDataParsingService.getDefault()[chartName];
        chartData.data = chartDataAllEmotions[chartName];
        return chartData;
      });
      console.log('this.lineChartDatasets', this.lineChartDatasets);
    });

    // get our data every subsequent 10 seconds
    IntervalObservable.create(1000)
    .takeWhile(() => this.alive) // only fires when component is alive
    .subscribe(() => {
      // asking for emotions for chart
      this.httpRequestService.getEmotions('api/videos/1/emotions').subscribe(data => {
        const chartDataAllEmotions = this.chartDataParsingService.parseEmotionsData(data, this.keys());
        this.lineChartDatasets = this.keys().map((chartName: string) => {
          const chartData = this.chartDataParsingService.getDefault()[chartName];
          chartData.data = chartDataAllEmotions[chartName];
          return chartData;
        });
        console.log('this.lineChartDatasets', this.lineChartDatasets);
      });

      // asking for stats and percentages
      this.httpRequestService.getEmotions('api/videos/1/emotions/stats')
      .first() // only gets fired once
      .subscribe(data => {
        this.emotionsStats = this.emotionsStats.map((emotionStat: ChartData) => {
          emotionStat.percentage = data[emotionStat.label].toFixed(1);
          return emotionStat;
        });
      });
    });

    this.lineChartColors = [this.lineChartDatasets.map(chartsData => chartsData.borderColor)];
    this.lineChartOptions = {
      animation: {
        duration: 10
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };

    this.graphData = {
      labels: Array.from(new Array(30), (val, index) => String(index))
    };
    /********** users card and table */
    this.httpRequestService.getEmotions('api/videos/1/users')
      .first() // only gets fired once
      .subscribe(data => {
        this.users = Number(data.users_watching);
      })
    IntervalObservable.create(5000)
      .takeWhile(() => this.alive) // only fires when component is alive
      .subscribe(() => {
        this.httpRequestService.getEmotions('api/videos/1/users')
          .subscribe(data => {
            this.users = Number(data.users_watching);
          })
      });
    /********** */
  }

  ngOnDestroy() {
    this.alive = false; // switches your IntervalObservable off
  }

}
