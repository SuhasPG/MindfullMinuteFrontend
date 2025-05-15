// services/quote.service.ts
import { Injectable, Signal, computed, signal } from '@angular/core';
import { Quote } from '../Models/quote';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private quotes: Quote[] = [
    { id: 1, text: "The present moment is the only moment available to us, and it is the door to all moments.", author: 'Thich Nhat Hanh' },
    { id: 2, text: 'You are the sky. Everything else is just the weather.', author: 'Pema Chödrön' },
    { id: 3, text: "Mindfulness isn't difficult. We just need to remember to do it.", author: 'Sharon Salzberg' },
    { id: 4, text: 'The best way to capture moments is to pay attention.', author: 'Jon Kabat-Zinn' },
    { id: 5, text: "Be happy in the moment, that's enough. Each moment is all we need, not more.", author: 'Mother Teresa' },
    { id: 6, text: 'The mind is everything. What you think you become.', author: 'Buddha' },
    { id: 7, text: 'Life is available only in the present moment.', author: 'Thich Nhat Hanh' },
    { id: 8, text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
    { id: 9, text: 'Mindfulness helps you go home to the present.', author: 'Thich Nhat Hanh' },
    { id: 10, text: "The little things? The little moments? They aren't little.", author: 'Jon Kabat-Zinn' }
  ];

  private currentQuoteSignal = signal<Quote | null>(null);
  currentQuote: Signal<Quote | null> = this.currentQuoteSignal.asReadonly();

    constructor(private http: HttpClient, private router: Router) {
        this.http.get<Quote[]>('https://localhost:7026/api/Quotes').subscribe((data) => {
                this.quotes = [...this.quotes, ...data];
                // Set the daily quote if it hasn't been set yet
                const lastQuoteDate = localStorage.getItem('lastQuoteDate');
                if (!lastQuoteDate) {
                        this.setDailyQuote();
                }
        });
        this.setDailyQuote();
    }

  private setDailyQuote(): void {
    const today = new Date().toDateString();
    const lastQuoteDate = localStorage.getItem('lastQuoteDate');
    
    // If it's a new day or no quote has been set yet
    if (lastQuoteDate !== today) {
      const dailyIndex = this.getDailyIndex();
      localStorage.setItem('lastQuoteDate', today);
      localStorage.setItem('dailyQuoteIndex', String(dailyIndex));
      this.currentQuoteSignal.set(this.quotes[dailyIndex]);
    } else {
      // Use the stored daily quote index
      const storedIndex = Number(localStorage.getItem('dailyQuoteIndex')) || 0;
      this.currentQuoteSignal.set(this.quotes[storedIndex]);
    }
  }

  getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    const quote = this.quotes[randomIndex];
    this.currentQuoteSignal.set(quote);
    return quote;
  }

  private getDailyIndex(): number {
    // Use the current date to generate a consistent index for the day
    const date = new Date();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % this.quotes.length;
  }
}