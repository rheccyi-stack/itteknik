import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  email = '';
  password = '';
  message = '';
  isError = false;
  isLoggedIn = false;
  role: 'admin' | 'user' | null = null;
  codeTitle = '';
  codeValue = '';
  snippets: Array<{ title: string; code: string; updatedAt: string }> = [];
  private readonly adminEmail = 'admin';
  private readonly adminPassword = 'syntaxerror';
  private readonly userEmail = 'user@example.com';
  private readonly userPassword = 'user123';
  private readonly storageKey = 'admin_code_snippets';
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.loadSnippets();
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.message = 'Please enter your admin name and password.';
      this.isError = true;
      return;
    }

    if (this.email === this.adminEmail && this.password === this.adminPassword) {
      this.isLoggedIn = true;
      this.role = 'admin';
      this.message = 'Admin login successful.';
      this.isError = false;
      return;
    }

    if (this.email === this.userEmail && this.password === this.userPassword) {
      this.isLoggedIn = true;
      this.role = 'user';
      this.message = 'User login successful. Admin workspace is locked.';
      this.isError = false;
      return;
    }

    this.message = 'Invalid credentials.';
    this.isError = true;
  }

  logout() {
    this.isLoggedIn = false;
    this.role = null;
    this.email = '';
    this.password = '';
    this.codeTitle = '';
    this.codeValue = '';
    this.message = 'Logged out.';
    this.isError = false;
  }

  saveSnippet() {
    if (this.role !== 'admin') {
      this.message = 'Only admin can save code snippets.';
      this.isError = true;
      return;
    }

    if (!this.codeTitle.trim() || !this.codeValue.trim()) {
      this.message = 'Please enter both a title and code before saving.';
      this.isError = true;
      return;
    }

    const snippet = {
      title: this.codeTitle.trim(),
      code: this.codeValue,
      updatedAt: new Date().toLocaleString()
    };

    this.snippets = [snippet, ...this.snippets];
    this.setStorage(this.snippets);
    this.codeTitle = '';
    this.codeValue = '';
    this.message = 'Code saved.';
    this.isError = false;
  }

  deleteSnippet(index: number) {
    if (this.role !== 'admin') {
      return;
    }
    this.snippets = this.snippets.filter((_, i) => i !== index);
    this.setStorage(this.snippets);
  }

  private loadSnippets() {
    const raw = this.getStorage();
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Array<{ title: string; code: string; updatedAt: string }>;
      if (Array.isArray(parsed)) {
        this.snippets = parsed;
      }
    } catch {
      this.snippets = [];
    }
  }

  private getStorage(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.storageKey);
  }

  private setStorage(value: Array<{ title: string; code: string; updatedAt: string }>) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }
}

