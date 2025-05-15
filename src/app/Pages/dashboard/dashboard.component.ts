import { Component, inject } from '@angular/core';
import { QuoteService } from '../../Services/quote.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

    quoteService = inject(QuoteService);
  
    getNewQuote(): void {
      this.quoteService.getRandomQuote();
    }
}
