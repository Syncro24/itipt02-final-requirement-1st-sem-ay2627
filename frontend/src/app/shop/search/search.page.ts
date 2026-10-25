import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule,
    FormsModule,
    IonItem,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
  ],
})
export class SearchPage {
  //Variables
  items = signal<any[]>([]);
  selectedCategory = signal<string>('All');
  displayLimit = signal<number>(10);
  searchQuery = signal<string>('');

  constructor(private apiServices: ApiService) {
    effect(() => {
      this.selectedCategory();
      this.displayLimit.set(10);
      this.searchQuery();
    });
    addIcons({
      searchOutline
    })
  }

  //Item filtering and search query
  filteredItems = computed(() => {
    const category = this.selectedCategory();
    const allItems = this.items();
    const query = this.searchQuery().toLowerCase().trim();
    // if (category === 'All'){
    //   return allItems;
    // }

    return allItems.filter((item) => {
      // (item.ITEM_CATEGORY || '').toLowerCase() === category.toLowerCase()
      const matchesCategory =
        category === 'All' ||
        (item.ITEM_CATEGORY || '').toLowerCase() === category.toLowerCase();

      const name = (item.ITEM_NAME || '').toLowerCase();
      const description = (item.ITEM_DESCRIPTION || '').toLowerCase();
      const matchesSearch =
        query === '' || name.includes(query) || description.includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  handleSearch(event: any) {
    const query = event.target.value ?? '';
    this.searchQuery.set(query);
  }

  // Clear filters action
  clearFilters() {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
  }
  
  //Infinite Scrolling
  visibleItems = computed(() => {
    return this.filteredItems().slice(0, this.displayLimit());
  });
  noMoreItems = computed(() => {
    return this.displayLimit() >= this.filteredItems().length;
  });
  loadMore(event: any) {
    setTimeout(() => {
      this.displayLimit.update((current) => current + 10);
      event.target.complete();

      if (this.displayLimit() >= this.filteredItems().length) {
        event.target.disable = true;
      }
    }, 400);
  }

  //Item Fetching
  ionViewWillEnter() {
    this.loadItems();
  }

  loadItems() {
    this.apiServices.getItems().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.items.set(response);
        } else if (response && Array.isArray(response.items)) {
          this.items.set(response.items);
        } else {
          this.items.set([]);
        }
      },
      error: (err: any) => {
        console.error('Error fetching items', err);
      },
    });
  }
}
