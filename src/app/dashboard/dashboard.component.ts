import { HttpRequestService } from './../service/http-request.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  public charts0Data: Array<Number>;
  public charts1Data: Array<Number>;
  public labels: Array<String>;
  constructor(private httpRequestService: HttpRequestService) {
    httpRequestService.getRequest('api/videos/1/emotions/stats')
    // console.log(data);

    this.labels = ['0', '10', '20', '30', '40', '50', '60'];
    this.charts0Data = [65, 59, 80, 51, 56, 55, 40];
    this.charts1Data = [25, 51, 30, 81, 56, 25, 40];
  }

}
