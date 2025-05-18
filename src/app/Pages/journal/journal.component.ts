import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalService } from '../../Services/journal.service';
import { JournalPost } from '../../Models/journalPost';
import { JournalEntry } from '../../Models/journal';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent {
  journalService = inject(JournalService);
  router = inject(Router);

  moods = [
    { label: 'Happy', emoji: '😁', colorClass: 'bg-success' },
    { label: 'Sad', emoji: '😢', colorClass: 'bg-secondary' },
    { label: 'Angry', emoji: '😠', colorClass: 'bg-danger' },
    { label: 'Anxious', emoji: '😰', colorClass: 'bg-warning text-dark' },
    { label: 'Excited', emoji: '🤩', colorClass: 'bg-primary' },
    { label: 'Calm', emoji: '😌', colorClass: 'bg-info text-dark' },
    { label: 'Unknown', emoji: '❓', colorClass: 'bg-dark' }, // Changed emoji to question mark
  ];

  formEntry: JournalPost = {
    title: '',
    content: '',
    moodEmoji: 'Happy',
  };

  isSubmitting = false;
  isEditing = false;
  editingEntryId: number | null = null;

  get submitButtonLabel(): string {
    return this.isEditing ? 'Update Entry' : 'Save Entry';
  }

  get formTitle(): string {
    return this.isEditing ? 'Edit your entry' : 'How are you feeling today?';
  }

  getMoodEmoji(mood: string): string {
    const match = this.moods.find(m => m.label === mood);
    return match ? match.emoji : '❓';
  }

  getMoodColorClass(mood: string): string {
    const match = this.moods.find(m => m.label === mood);
    return match ? match.colorClass : 'bg-light';
  }

  submitForm(): void {
    if (this.formEntry.title && this.formEntry.content) {
      this.isSubmitting = true;

      if (this.isEditing && this.editingEntryId !== null) {
        this.journalService.updateEntry(this.editingEntryId, this.formEntry);
        this.cancelEdit();
      } else {
        this.journalService.addEntry(this.formEntry);
        this.resetForm();
      }

      this.isSubmitting = false;
    } else {
      alert('Please fill in all fields.');
    }
  }

  resetForm(): void {
    this.formEntry = {
      title: '',
      content: '',
      moodEmoji: 'Happy'
    };
    this.isEditing = false;
    this.editingEntryId = null;
  }

  editEntry(entry: JournalEntry): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isEditing = true;
    this.editingEntryId = entry.id;
    this.formEntry = {
      title: entry.title,
      content: entry.content,
      moodEmoji: entry.moodEmoji
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  trackById(index: number, entry: JournalEntry): number {
    return entry.id;
  }

  onDeleteEntry(id: number): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.journalService.deleteEntry(id);
      if (this.editingEntryId === id) {
        this.resetForm();
      }
    }
  }
}
