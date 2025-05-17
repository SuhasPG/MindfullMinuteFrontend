import { Injectable, signal, computed, effect } from "@angular/core";
import { JournalEntry } from "../Models/journal";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { JournalPost } from "../Models/journalPost";

export interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
}

@Injectable({
    providedIn: "root",
})
export class JournalService {
    private journalEntriesSignal = signal<JournalEntry[]>([]);
    private currentStreakSignal = signal<number>(0);
    private longestStreakSignal = signal<number>(0);

    readonly journalEntries = this.journalEntriesSignal.asReadonly();
    readonly currentStreak = this.currentStreakSignal.asReadonly();
    readonly longestStreak = this.longestStreakSignal.asReadonly();
    
    private apiUrl = "https://localhost:7026/api/Journal";

    constructor(private http: HttpClient, private router: Router) {
        this.loadJournalEntries();
        effect(() => console.log('[JournalService] entries:', this.journalEntries()));
        this.loadStreakInfo();
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    }

    loadJournalEntries(): void {
       this.http
            .get<JournalEntry[]>(this.apiUrl, { headers: this.getHeaders() })
            .subscribe({
                next: (entries) => {
                    this.journalEntriesSignal.set([...entries].reverse());
                },
                error: (err) =>{
                    console.error('[JournalService] load failed', err);
                }
            }
        );
    }

    private loadStreakInfo(): void {
        this.getStreakInfo().subscribe({
            next: (info) => {
                this.currentStreakSignal.set(info.currentStreak);
                this.longestStreakSignal.set(info.longestStreak);
            },
            error: (error) => {
                console.error('Error fetching streak info:', error);
                if (error.status === 401) {
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    // Computed signals for the template
    // journalEntries = computed(() => this.journalEntriesSignal());
    // currentStreak = computed(() => this.currentStreakSignal());
    // longestStreak = computed(() => this.longestStreakSignal());

    // Method to generate streak message
    streakMessage(): string {
        const current = this.currentStreak();
        const longest = this.longestStreak();
        
        if (current === 0) {
            return "Start your first journal entry today!";
        } else if (current === 1) {
            return "Great start! Keep the momentum going!";
        } else if (current === longest && current > 1) {
            return "You're on your longest streak ever! Amazing job!";
        } else if (current >= 7) {
            return "Fantastic! You've been journaling for a week straight!";
        } else if (current >= 3) {
            return "You're building a great habit!";
        } else {
            return "Keep going! Consistency is key!";
        }
    }

    
    addEntry(entry: JournalPost): void {
        this.http
        .post<JournalEntry>(this.apiUrl, entry, { headers: this.getHeaders() })
        .subscribe({
            next: newEntry => {
            console.log('[JournalService] added', newEntry);
            this.loadJournalEntries();
            },
            error: err => console.error('[JournalService] add failed', err),
        });
    }

    deleteEntry(id: number): void {
        this.http
            .delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
            .subscribe({
            next: () => {
                console.log('[JournalService] deleted', id);
                this.loadJournalEntries();
            },
            error: err => console.error('[JournalService] delete failed', err),
            });
    }

    

    getJournalEntryById(id: number): Observable<JournalEntry | undefined> {
        return this.http
            .get<JournalEntry>(`${this.apiUrl}/${id}`, { 
                headers: this.getHeaders() 
            });
    }

    updateEntry(entryId: number, updatedEntry: JournalPost): void {
        this.http
            .put<JournalEntry>(`${this.apiUrl}/${entryId}`, updatedEntry, { headers: this.getHeaders() })
            .subscribe({
                next: (entry) => {
                    console.log('[JournalService] updated', entry);
                    this.loadJournalEntries();
                },
                error: err => {
                    console.error('[JournalService] update failed', err);
                    // Optionally provide user feedback on error
                }
            });
    }

    getStreakInfo(): Observable<StreakInfo> {
        return this.http.get<StreakInfo>(`${this.apiUrl}/streak`, { headers: this.getHeaders() })
            .pipe(
                catchError(error => {
                    console.error('Error fetching streak info:', error);
                    if (error.status === 401) {
                        this.router.navigate(['/login']);
                    }
                    // Return default values if API call fails
                    return of({ currentStreak: 0, longestStreak: 0 });
                })
            );
    }
}